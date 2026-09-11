import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { env, corsOrigins } from './env.ts';
import authPlugin from './lib/auth.ts';
import { authRoutes } from './modules/auth/auth.routes.ts';
import { usersRoutes } from './modules/users/users.routes.ts';
import { dataRoutes } from './modules/data/data.routes.ts';
import { tasksRoutes } from './modules/tasks/tasks.routes.ts';
import { notificationsRoutes } from './modules/notifications/notifications.routes.ts';
import { chatRoutes } from './modules/chat/chat.routes.ts';
import { cirugiasRoutes } from './modules/cirugias/cirugias.routes.ts';
import { consentsRoutes } from './modules/consents/consents.routes.ts';
import { firmaRoutes } from './modules/firma/firma.routes.ts';
import { citasRoutes } from './modules/citas/citas.routes.ts';
import { boletasRoutes } from './modules/boletas/boletas.routes.ts';
import { sincronizarAgenda } from './modules/citas/citas.service.ts';
import { actualizarEnviadas, enviarPendientes } from './modules/boletas/cola.ts';
import { ponerseAlDia } from './modules/boletas/rvd.ts';
import { iso } from './lib/reservo.ts';
import { quotesRoutes } from './modules/quotes/quotes.routes.ts';
import { giftcardsRoutes } from './modules/giftcards/giftcards.routes.ts';
import { reembolsosRoutes } from './modules/reembolsos/reembolsos.routes.ts';
import { inventarioRoutes } from './modules/inventario/inventario.routes.ts';
import { pacientesRoutes } from './modules/pacientes/pacientes.routes.ts';
import { honorariosRoutes } from './modules/honorarios/honorarios.routes.ts';
import { documentosRoutes } from './modules/documentos/documentos.routes.ts';
import { copilotoRoutes } from './modules/copiloto/copiloto.routes.ts';
import { cajaRoutes } from './modules/caja/caja.routes.ts';
import { eventosRoutes } from './modules/eventos/eventos.routes.ts';

const app = Fastify({
  logger: { transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined },
  // Detrás de nginx en producción: confía en X-Forwarded-* para obtener la IP real
  // del paciente al registrar la evidencia de firma.
  trustProxy: true,
});

await app.register(cors, { origin: corsOrigins, credentials: true });
// Subida de archivos (documentos personales): máx. 25 MB por archivo, hasta 20 por request.
await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024, files: 20 } });
await app.register(authPlugin);

app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

await app.register(authRoutes, { prefix: '/auth' });
await app.register(usersRoutes, { prefix: '/users' });
await app.register(dataRoutes, { prefix: '/data' });
await app.register(tasksRoutes, { prefix: '/tasks' });
await app.register(notificationsRoutes, { prefix: '/notifications' });
await app.register(chatRoutes, { prefix: '/chat' });
await app.register(cirugiasRoutes, { prefix: '/cirugias' });
await app.register(consentsRoutes, { prefix: '/consentimientos' });
await app.register(firmaRoutes, { prefix: '/firma' });
await app.register(citasRoutes, { prefix: '/citas' });
await app.register(boletasRoutes, { prefix: '/boletas' });
await app.register(quotesRoutes, { prefix: '/quotes' });
await app.register(giftcardsRoutes, { prefix: '/gift-cards' });
await app.register(reembolsosRoutes, { prefix: '/reembolsos' });
await app.register(inventarioRoutes, { prefix: '/inventario' });
await app.register(pacientesRoutes, { prefix: '/pacientes' });
await app.register(honorariosRoutes, { prefix: '/honorarios' });
await app.register(documentosRoutes, { prefix: '/documentos' });
await app.register(copilotoRoutes, { prefix: '/copiloto' });
await app.register(cajaRoutes, { prefix: '/caja' });
await app.register(eventosRoutes, { prefix: '/eventos' });

// Sincronización periódica de la agenda de Reservo. Apagada salvo que se
// defina RESERVO_SYNC_INTERVAL_MIN. Sólo copia la agenda: nunca envía correos
// ni crea consentimientos por su cuenta.
if (env.RESERVO_SYNC_INTERVAL_MIN > 0 && env.RESERVO_API_URL) {
  const cadaMs = env.RESERVO_SYNC_INTERVAL_MIN * 60_000;
  const correr = async () => {
    try {
      const hoy = new Date();
      const fin = new Date(hoy);
      fin.setDate(fin.getDate() + 14);
      const r = await sincronizarAgenda(iso(hoy), iso(fin));
      app.log.info({ sync: r }, 'agenda de Reservo sincronizada');
    } catch (e) {
      app.log.error({ err: (e as Error)?.message }, 'falló la sincronización con Reservo');
    }
  };
  setTimeout(correr, 30_000).unref(); // primera pasada tras arrancar
  setInterval(correr, cadaMs).unref();
}

// Boletas: la cola empuja al SII lo que la caja dejó timbrado y consulta el
// veredicto de lo ya enviado. Cobrar y declarar van por separado a propósito,
// así una caída del SII no frena la caja.
if (env.BOLETAS_HABILITADAS && env.BOLETAS_COLA_INTERVAL_MIN > 0) {
  const correr = async () => {
    try {
      const enviadas = await enviarPendientes();
      if (enviadas.enviados) app.log.info({ enviadas }, 'boletas enviadas al SII');
      if (enviadas.error) app.log.warn({ err: enviadas.error }, 'fallo el envio de boletas');
      const consulta = await actualizarEnviadas();
      if (consulta.envios) app.log.info({ consulta }, 'estados de boletas actualizados');
    } catch (e) {
      app.log.error({ err: (e as Error)?.message }, 'falló la cola de boletas');
    }
  };
  setTimeout(correr, 60_000).unref();
  setInterval(correr, env.BOLETAS_COLA_INTERVAL_MIN * 60_000).unref();
}

// Resumen de Ventas Diarias: obligación diaria, incluso sin ventas. Se revisa
// cada hora en vez de agendar una sola alarma para que un reinicio a la hora
// equivocada no se salte el reporte del día.
if (env.BOLETAS_HABILITADAS && env.RVD_HORA >= 0) {
  const revisar = async () => {
    if (new Date().getHours() < env.RVD_HORA) return;
    try {
      const r = await ponerseAlDia();
      for (const envio of r) {
        if (envio.enviado) app.log.info({ envio }, 'RVD enviado al SII');
        else app.log.warn({ envio }, 'RVD no se pudo enviar');
      }
    } catch (e) {
      app.log.error({ err: (e as Error)?.message }, 'falló el envío del RVD');
    }
  };
  setTimeout(revisar, 120_000).unref();
  setInterval(revisar, 60 * 60_000).unref();
}

try {
  // En producción la API vive detrás de nginx: solo localhost. En dev, accesible en la red.
  const host = env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';
  await app.listen({ port: env.PORT, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
