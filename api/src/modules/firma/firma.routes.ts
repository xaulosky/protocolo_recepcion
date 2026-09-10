import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';

/**
 * Rutas PÚBLICAS (sin autenticación) para que el paciente vea y firme su
 * consentimiento desde el enlace secreto. La seguridad es el token largo del
 * enlace; se registra IP, fecha/hora y user-agent como evidencia de la firma
 * electrónica simple (Ley 19.799 + 20.584).
 */

const RELACIONES = ['TITULAR', 'MADRE', 'PADRE', 'TUTOR', 'APODERADO', 'OTRO'] as const;

const firmarSchema = z.object({
  // dataURL PNG de la firma dibujada (límite defensivo ~700 KB en base64).
  firmaImagen:    z.string().startsWith('data:image/').max(950_000),
  firmanteNombre: z.string().min(2).max(120),
  fotoAuth:       z.boolean(),
  // Quién firma. Si no es el titular, la Ley 20.584 exige identificar al
  // representante legal, así que su RUT pasa a ser obligatorio.
  firmanteRelacion: z.enum(RELACIONES).default('TITULAR'),
  firmanteRut:      z.string().min(7).max(20).optional(),
}).refine(
  (d) => d.firmanteRelacion === 'TITULAR' || Boolean(d.firmanteRut),
  { message: 'Falta el RUT del representante legal', path: ['firmanteRut'] },
);

/**
 * ¿Venció el enlace? Los registros antiguos sin `expiresAt` no vencen, para no
 * dejar inaccesibles los consentimientos previos a que existiera el campo.
 */
function venceElEnlace(f: { expiresAt: Date | null }): boolean {
  return Boolean(f.expiresAt && f.expiresAt < new Date());
}

// Lo que ve el paciente: nunca exponemos datos internos ni de auditoría.
function vistaPublica(f: {
  titulo: string; tratamiento: string; snapshot: unknown;
  paciente: string; rut: string; profesional: string; procedimiento: string;
  fecha: string; estado: string; firmadoAt: Date | null; firmanteNombre: string | null;
  firmanteRelacion: string; firmanteRut: string | null;
}) {
  return {
    titulo: f.titulo, tratamiento: f.tratamiento, snapshot: f.snapshot,
    paciente: f.paciente, rut: f.rut, profesional: f.profesional,
    procedimiento: f.procedimiento, fecha: f.fecha,
    estado: f.estado, firmadoAt: f.firmadoAt, firmanteNombre: f.firmanteNombre,
    firmanteRelacion: f.firmanteRelacion, firmanteRut: f.firmanteRut,
  };
}

export async function firmaRoutes(app: FastifyInstance) {
  // GET /firma/:token/imprimir — datos completos para la página de impresión.
  //
  // Devuelve la imagen de la firma, así que aplica los mismos controles que el
  // resto del flujo público: sólo un consentimiento efectivamente firmado y no
  // anulado, y sólo mientras el enlace siga vigente. Antes este endpoint no
  // validaba nada y dejaba la firma manuscrita accesible de forma indefinida.
  app.get('/:token/imprimir', async (req, reply) => {
    const { token } = req.params as { token: string };
    const firma = await prisma.signedConsent.findUnique({ where: { token } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    if (firma.estado === 'ANULADO') {
      return reply.code(410).send({ error: 'Este consentimiento fue anulado' });
    }
    if (firma.estado !== 'FIRMADO') {
      return reply.code(409).send({ error: 'Este consentimiento aún no ha sido firmado' });
    }
    if (venceElEnlace(firma)) {
      return reply.code(410).send({ error: 'Este enlace venció. Solicita una copia en la clínica.' });
    }
    return {
      firma: {
        ...vistaPublica(firma),
        firmaImagen:    firma.firmaImagen,
        fotoAuth:       firma.fotoAuth,
        firmaManual:    firma.firmaManual,
      },
    };
  });

  // GET /firma/:token — cargar el consentimiento para revisar/firmar
  app.get('/:token', async (req, reply) => {
    const { token } = req.params as { token: string };
    const firma = await prisma.signedConsent.findUnique({ where: { token } });
    if (!firma) return reply.code(404).send({ error: 'Enlace no válido o expirado' });
    if (firma.expiresAt && firma.expiresAt < new Date() && firma.estado === 'PENDIENTE') {
      return reply.code(410).send({ error: 'Este enlace de firma venció. Comunícate con la clínica para recibir uno nuevo.' });
    }
    return { firma: vistaPublica(firma) };
  });

  // POST /firma/:token — registrar la firma del paciente
  app.post('/:token', async (req, reply) => {
    const { token } = req.params as { token: string };
    const parsed = firmarSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Firma inválida' });

    const firma = await prisma.signedConsent.findUnique({ where: { token } });
    if (!firma) return reply.code(404).send({ error: 'Enlace no válido' });
    if (firma.estado === 'ANULADO') return reply.code(410).send({ error: 'Este consentimiento fue anulado' });
    if (firma.estado === 'FIRMADO') return reply.code(409).send({ error: 'Este consentimiento ya fue firmado' });
    if (firma.expiresAt && firma.expiresAt < new Date()) {
      return reply.code(410).send({ error: 'Este enlace de firma venció. Comunícate con la clínica para recibir uno nuevo.' });
    }

    // updateMany condicionado al estado: si llegan dos envíos a la vez, sólo el
    // primero encuentra la fila en PENDIENTE y el segundo cuenta 0.
    const escrito = await prisma.signedConsent.updateMany({
      where: { token, estado: 'PENDIENTE' },
      data: {
        estado:           'FIRMADO',
        firmaImagen:      parsed.data.firmaImagen,
        firmanteNombre:   parsed.data.firmanteNombre,
        firmanteRelacion: parsed.data.firmanteRelacion,
        firmanteRut:      parsed.data.firmanteRut ?? null,
        fotoAuth:         parsed.data.fotoAuth,
        firmadoAt:        new Date(),
        firmaIp:          req.ip,
        firmaUserAgent:   (req.headers['user-agent'] ?? '').slice(0, 400),
      },
    });

    if (escrito.count === 0) {
      return reply.code(409).send({ error: 'Este consentimiento ya fue firmado' });
    }

    // Avisar a quien lo envió que ya quedó firmado.
    if (firma.creadoPorId) {
      notify({
        userId: firma.creadoPorId,
        title:  'Consentimiento firmado',
        body:   `${firma.paciente} firmó el consentimiento de ${firma.tratamiento}.`,
        push:   true,
        email:  false,
      }).catch(() => { /* no bloquear la firma del paciente */ });
    }

    return { ok: true };
  });
}
