import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { codigoSii } from './boletas.service.ts';
import { construirRcof } from './rcof.ts';
import { cargarCertificado } from './firma.ts';
import { enviarClasico, obtenerTokenClasico, SiiError } from './envio-sii.ts';
import type { Caratula, DatosBoleta } from './dte.ts';

/**
 * Envío diario del Resumen de Ventas Diarias (ex Reporte de Consumo de Folios).
 *
 * Es obligación diaria del emisor de boletas, incluso los días sin ventas: en
 * ese caso el reporte va en cero. No tiene API REST propia, viaja por el canal
 * clásico igual que los libros (ver envio-sii.ts).
 *
 * Cada envío queda registrado para dos cosas: no mandar dos veces el mismo día
 * y llevar el `SecEnvio`, que el SII exige incrementar en cada corrección.
 */

/** Día anterior en formato AAAA-MM-DD, que es el que se reporta de madrugada. */
export function ayer(hoy = new Date()): string {
  const d = new Date(hoy);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Documentos emitidos ese día, en la forma que espera el reporte. */
async function boletasDelDia(fecha: string): Promise<{ emitidas: DatosBoleta[]; anulados: { tipoDte: 39 | 41; folio: number }[] }> {
  const desde = new Date(`${fecha}T00:00:00`);
  const hasta = new Date(`${fecha}T23:59:59.999`);

  const documentos = await prisma.documentoTributario.findMany({
    where: { fechaEmision: { gte: desde, lte: hasta } },
    select: { tipo: true, folio: true, neto: true, iva: true, exento: true, total: true, estado: true },
    orderBy: { folio: 'asc' },
  });

  const emitidas: DatosBoleta[] = [];
  const anulados: { tipoDte: 39 | 41; folio: number }[] = [];

  for (const d of documentos) {
    const tipoDte = codigoSii(d.tipo);
    // Una boleta anulada consumió folio pero no es venta: el reporte la informa
    // aparte, en el rango de anulados.
    if (d.estado === 'ANULADA') anulados.push({ tipoDte, folio: d.folio });
    else {
      emitidas.push({
        tipoDte,
        folio: d.folio,
        fechaEmision: fecha,
        items: [],
        neto: d.neto,
        iva: d.iva,
        exento: d.exento,
        total: d.total,
      });
    }
  }

  return { emitidas, anulados };
}

export interface ResultadoRvd {
  fecha: string;
  enviado: boolean;
  trackId?: string;
  secuencia?: number;
  motivo?: string;
}

/**
 * Genera y envía el reporte de un día. Si ya se envió, no hace nada salvo que
 * se pida `forzar`, en cuyo caso va como corrección con la secuencia siguiente.
 */
export async function enviarRvdDelDia(fecha: string, { forzar = false } = {}): Promise<ResultadoRvd> {
  if (!env.BOLETAS_HABILITADAS) return { fecha, enviado: false, motivo: 'Emisión deshabilitada' };

  const previos = await prisma.envioRvd.findMany({
    where: { fecha, estado: 'ENVIADO' },
    orderBy: { secuencia: 'desc' },
    take: 1,
  });
  if (previos.length && !forzar) {
    return { fecha, enviado: false, motivo: `Ya enviado (track ${previos[0].trackId})` };
  }

  // El SII numera desde 1; una corrección incrementa.
  const secuencia = (previos[0]?.secuencia ?? 0) + 1;
  const { emitidas, anulados } = await boletasDelDia(fecha);

  const cert = await cargarCertificado();
  if (!cert.rut) return { fecha, enviado: false, motivo: 'El certificado no trae RUT' };

  const caratula: Caratula = {
    fchResol: env.SII_FCH_RESOL,
    nroResol: env.SII_NRO_RESOL,
    rutEnvia: cert.rut,
  };

  try {
    const xml = construirRcof({ fecha, secuenciaEnvio: secuencia, boletas: emitidas, anulados }, caratula, cert);
    const token = await obtenerTokenClasico(cert);
    const r = await enviarClasico({
      archivo: Buffer.from(xml, 'latin1'),
      nombreArchivo: 'ConsumoFolios.xml',
      rutEmisor: env.SII_RUT_EMISOR,
      rutEnvia: cert.rut,
      token,
    });

    await prisma.envioRvd.create({
      data: {
        fecha,
        secuencia,
        trackId: String(r.trackId),
        estado: 'ENVIADO',
        detalle: `${emitidas.length} emitidas, ${anulados.length} anuladas`,
      },
    });

    return { fecha, enviado: true, trackId: String(r.trackId), secuencia };
  } catch (e) {
    const motivo = e instanceof SiiError ? e.message : ((e as Error)?.message ?? 'Error desconocido');
    await prisma.envioRvd.create({
      data: { fecha, secuencia, estado: 'ERROR', detalle: motivo.slice(0, 500) },
    });
    return { fecha, enviado: false, motivo };
  }
}

/**
 * Envía lo que falte: el día anterior y, por si el servidor estuvo caído,
 * cualquier día de la última semana que haya quedado sin reporte.
 */
export async function ponerseAlDia(hoy = new Date()): Promise<ResultadoRvd[]> {
  const pendientes: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    pendientes.push(d.toISOString().slice(0, 10));
  }

  const enviados = await prisma.envioRvd.findMany({
    where: { fecha: { in: pendientes }, estado: 'ENVIADO' },
    select: { fecha: true },
  });
  const ya = new Set(enviados.map((e) => e.fecha));

  const resultados: ResultadoRvd[] = [];
  // De más antiguo a más reciente, para que las secuencias queden en orden.
  for (const fecha of pendientes.reverse()) {
    if (ya.has(fecha)) continue;
    resultados.push(await enviarRvdDelDia(fecha));
  }
  return resultados;
}
