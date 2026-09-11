import type { EstadoDte } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { construirEnvio, type Caratula } from './dte.ts';
import { cargarCertificado } from './firma.ts';
import { codigoSii } from './boletas.service.ts';
import { consultarEnvio, enviarBoletas, obtenerToken, SiiError } from './envio-sii.ts';

/**
 * Cola de envío de boletas al SII.
 *
 * Vender y enviar están separados a propósito: el SII se cae, responde lento o
 * rechaza por algo que hay que revisar a mano, y nada de eso puede frenar la
 * caja. La venta deja el documento timbrado en PENDIENTE y esta cola lo empuja
 * después, con reintentos.
 *
 * El envío es por lotes —el sobre EnvioBOLETA admite varios DTE— así que todos
 * los documentos de una pasada comparten track id. La consulta posterior
 * resuelve el estado de cada folio por separado.
 */

/** Cuántos documentos entran en un sobre. El SII admite hasta 1.000. */
const TAMANO_LOTE = 100;

/** A partir de este número de intentos fallidos el documento se deja quieto. */
const MAX_INTENTOS = 5;

export interface ResultadoCola {
  enviados: number;
  trackId?: number;
  error?: string;
}

function caratula(rutEnvia: string): Caratula {
  return { fchResol: env.SII_FCH_RESOL, nroResol: env.SII_NRO_RESOL, rutEnvia };
}

/**
 * Envía en un sobre las boletas timbradas que siguen pendientes.
 *
 * Sólo agrupa documentos del mismo tipo: la carátula declara un `SubTotDTE` por
 * tipo y mezclar 39 con 41 exigiría dos bloques; con el volumen de la clínica
 * no vale la pena la complicación, así que se manda el tipo más antiguo y el
 * resto queda para la pasada siguiente.
 */
export async function enviarPendientes(): Promise<ResultadoCola> {
  if (!env.BOLETAS_HABILITADAS) return { enviados: 0, error: 'Emisión deshabilitada' };

  const primero = await prisma.documentoTributario.findFirst({
    where: { estado: 'PENDIENTE', xml: { not: null }, intentos: { lt: MAX_INTENTOS } },
    orderBy: { fechaEmision: 'asc' },
    select: { tipo: true },
  });
  if (!primero) return { enviados: 0 };

  const documentos = await prisma.documentoTributario.findMany({
    where: { estado: 'PENDIENTE', tipo: primero.tipo, xml: { not: null }, intentos: { lt: MAX_INTENTOS } },
    orderBy: { folio: 'asc' },
    take: TAMANO_LOTE,
    select: { id: true, xml: true, tipo: true },
  });
  if (!documentos.length) return { enviados: 0 };

  const cert = await cargarCertificado();
  if (!cert.rut) return { enviados: 0, error: 'El certificado no trae RUT' };

  const ids = documentos.map((d) => d.id);
  try {
    const sobre = construirEnvio(
      documentos.map((d) => d.xml as string),
      codigoSii(primero.tipo),
      caratula(cert.rut),
      cert,
    );

    const token = await obtenerToken(cert);
    const r = await enviarBoletas({
      archivo: Buffer.from(sobre, 'latin1'),
      nombreArchivo: `EnvioBOLETA-${Date.now()}.xml`,
      rutEmisor: env.SII_RUT_EMISOR,
      rutEnvia: cert.rut,
      token,
    });

    await prisma.documentoTributario.updateMany({
      where: { id: { in: ids } },
      data: {
        estado: 'ENVIADA',
        trackId: String(r.trackid),
        enviadoAt: new Date(),
        intentos: { increment: 1 },
        ultimoError: null,
      },
    });

    return { enviados: documentos.length, trackId: r.trackid };
  } catch (e) {
    const error = e instanceof SiiError ? e.message : ((e as Error)?.message ?? 'Error desconocido');
    // El intento se cuenta aunque falle: si el documento tiene algo malo, deja
    // de reintentarse sola y queda a la vista en vez de golpear al SII sin fin.
    await prisma.documentoTributario.updateMany({
      where: { id: { in: ids } },
      data: { intentos: { increment: 1 }, ultimoError: error.slice(0, 500) },
    });
    return { enviados: 0, error };
  }
}

/** Traduce el estado que devuelve el SII por documento al estado interno. */
function estadoDeDte(estadoSii: string): EstadoDte {
  // RCH rechazado; RPR aceptado con reparos (el documento vale, pero hay algo
  // que corregir en próximos envíos, así que se acepta y se deja el detalle).
  return estadoSii === 'RCH' ? 'RECHAZADA' : 'ACEPTADA';
}

export interface ResultadoConsulta {
  envios: number;
  aceptadas: number;
  rechazadas: number;
}

/**
 * Consulta los envíos ya recibidos y resuelve cada documento.
 *
 * Mientras el SII responde REC el envío sigue en cola interna suya; sólo con
 * EPR (o un estado de rechazo) hay veredicto.
 */
export async function actualizarEnviadas(): Promise<ResultadoConsulta> {
  if (!env.BOLETAS_HABILITADAS) return { envios: 0, aceptadas: 0, rechazadas: 0 };

  const pendientes = await prisma.documentoTributario.findMany({
    where: { estado: 'ENVIADA', trackId: { not: null } },
    distinct: ['trackId'],
    select: { trackId: true },
  });
  if (!pendientes.length) return { envios: 0, aceptadas: 0, rechazadas: 0 };

  const cert = await cargarCertificado();
  const token = await obtenerToken(cert);

  let aceptadas = 0;
  let rechazadas = 0;

  for (const { trackId } of pendientes) {
    const estado = await consultarEnvio(env.SII_RUT_EMISOR, Number(trackId), token);
    if (estado.estado === 'REC') continue; // todavía en proceso

    const problemas = new Map(
      (estado.detalle_rep_rech ?? []).map((d) => [
        d.folio,
        { estado: estadoDeDte(d.estado), detalle: `${d.descripcion}: ${(d.error ?? []).map((x) => x.descripcion).join('; ')}` },
      ]),
    );

    const documentos = await prisma.documentoTributario.findMany({
      where: { trackId },
      select: { id: true, folio: true },
    });

    for (const doc of documentos) {
      const problema = problemas.get(doc.folio);
      const nuevo: EstadoDte = problema ? problema.estado : 'ACEPTADA';
      if (nuevo === 'RECHAZADA') rechazadas++;
      else aceptadas++;

      await prisma.documentoTributario.update({
        where: { id: doc.id },
        data: {
          estado: nuevo,
          resueltoAt: new Date(),
          respuestaSii: JSON.stringify(estado).slice(0, 4000),
          ultimoError: problema?.detalle.slice(0, 500) ?? null,
        },
      });
    }
  }

  return { envios: pendientes.length, aceptadas, rechazadas };
}

/** Reencola un documento rechazado o trabado, para volver a intentarlo. */
export async function reintentar(documentoId: string) {
  return prisma.documentoTributario.update({
    where: { id: documentoId },
    data: { estado: 'PENDIENTE', intentos: 0, trackId: null, ultimoError: null, resueltoAt: null },
  });
}
