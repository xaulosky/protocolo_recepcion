import type { Prisma, TipoDte } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { calcularMontos, type LineaMonto } from './montos.ts';
import { reservarFolio, foliosDisponibles } from './folios.ts';
import { validarEmisor, datosEmisor } from './emisor.ts';
import { generarBoleta, type DatosBoleta } from './dte.ts';
import { cargarCertificado, parsearCaf } from './firma.ts';

/**
 * Emisión de boletas electrónicas asociadas a las ventas de caja.
 *
 * Al vender se reserva el folio, se arma el DTE, se timbra con la llave del
 * CAF y se firma con el certificado; el documento queda PENDIENTE y la cola
 * (cola.ts) lo envía al SII.
 *
 * Principio de diseño: la boleta NUNCA puede impedir cobrar. Si no hay CAF, si
 * la emisión falla o si el SII está caído, la venta se registra igual y el
 * documento queda pendiente para reintentar.
 */

const TIPO_CODIGO: Record<TipoDte, 39 | 41> = {
  BOLETA_AFECTA: 39,
  BOLETA_EXENTA: 41,
};

const CODIGO_TIPO: Record<39 | 41, TipoDte> = {
  39: 'BOLETA_AFECTA',
  41: 'BOLETA_EXENTA',
};

export interface ItemFacturable {
  /** Un tratamiento es exento; un producto es afecto. */
  treatmentId?: string | null;
  /** Nombre tal como se imprime en el detalle del documento. */
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface ResultadoEmision {
  emitida: boolean;
  motivo?: string;
}

/**
 * Emite la boleta de una venta recién creada. Se llama dentro de la misma
 * transacción para que folio y venta vivan o mueran juntos.
 */
export async function emitirBoletaDeVenta(
  tx: Prisma.TransactionClient,
  venta: { id: string; descuento: number; items: ItemFacturable[] },
): Promise<ResultadoEmision> {
  if (!env.BOLETAS_HABILITADAS) {
    return { emitida: false, motivo: 'Emisión de boletas deshabilitada' };
  }

  const lineas: LineaMonto[] = venta.items.map((i) => ({
    // La regla tributaria de la clínica: tratamientos exentos, productos afectos.
    exento: Boolean(i.treatmentId),
    precioUnitario: i.precioUnitario,
    cantidad: i.cantidad,
  }));

  const montos = calcularMontos(lineas, {
    descuento: venta.descuento,
    preciosIncluyenIva: env.PRECIOS_INCLUYEN_IVA,
  });

  const tipo = CODIGO_TIPO[montos.tipo];
  const asignado = await reservarFolio(tx, tipo);

  if (!asignado) {
    // Sin folios no se puede emitir, pero la venta ya se cobró: se avisa y se
    // deja constancia para que administración cargue un CAF nuevo.
    return { emitida: false, motivo: `Sin folios disponibles para boleta tipo ${montos.tipo}` };
  }

  const fecha = new Date();
  const datos: DatosBoleta = {
    tipoDte: montos.tipo,
    folio: asignado.folio,
    fechaEmision: fecha.toISOString().slice(0, 10),
    items: venta.items.map((i) => ({
      nombre: i.nombre,
      cantidad: i.cantidad,
      precio: i.precioUnitario,
    })),
    neto: montos.neto,
    iva: montos.iva,
    exento: montos.exento,
    total: montos.total,
  };

  // El documento se guarda SIEMPRE, timbre o no. El folio ya quedó consumido
  // en el CAF: si la firma falla y no dejáramos registro, ese número se
  // perdería y el SII vería un hueco que nadie sabría explicar. Sin XML queda
  // PENDIENTE con el error a la vista, y la cola lo reintenta.
  let xml: string | null = null;
  let ted: string | null = null;
  let ultimoError: string | null = null;
  try {
    ({ xml, ted } = await timbrarDte(tx, datos, asignado.cafId));
  } catch (e) {
    ultimoError = (e as Error)?.message ?? 'No se pudo timbrar el documento';
  }

  await tx.documentoTributario.create({
    data: {
      ventaId: venta.id,
      tipo,
      folio: asignado.folio,
      cafId: asignado.cafId,
      fechaEmision: fecha,
      neto: montos.neto,
      exento: montos.exento,
      iva: montos.iva,
      total: montos.total,
      estado: 'PENDIENTE',
      xml,
      ted,
      ultimoError,
    },
  });

  return ultimoError ? { emitida: false, motivo: ultimoError } : { emitida: true };
}

/**
 * Genera el DTE firmado y timbrado de una boleta.
 *
 * El timbre se hace con la llave privada que viene DENTRO del CAF con que se
 * reservó el folio —no con otra—, porque el SII valida que el folio timbrado
 * pertenezca a ese rango autorizado.
 */
export async function timbrarDte(
  tx: Prisma.TransactionClient,
  datos: DatosBoleta,
  cafId: string,
): Promise<{ xml: string; ted: string }> {
  const registro = await tx.caf.findUnique({ where: { id: cafId }, select: { xml: true } });
  if (!registro) throw new Error('El CAF del folio ya no existe');

  const caf = parsearCaf(registro.xml);
  const cert = await cargarCertificado();
  const xml = generarBoleta(datos, caf, cert);

  const ted = /<TED[\s>][\s\S]*?<\/TED>/.exec(xml)?.[0];
  if (!ted) throw new Error('El DTE quedó sin timbre');

  return { xml, ted };
}

/** Resumen para el panel de caja: cuántos folios quedan y qué está pendiente. */
export async function estadoBoletas() {
  const [afectas, exentas, pendientes, rechazadas] = await Promise.all([
    foliosDisponibles(prisma, 'BOLETA_AFECTA'),
    foliosDisponibles(prisma, 'BOLETA_EXENTA'),
    prisma.documentoTributario.count({ where: { estado: { in: ['PENDIENTE', 'ENVIADA'] } } }),
    prisma.documentoTributario.count({ where: { estado: 'RECHAZADA' } }),
  ]);

  const problemasEmisor = validarEmisor();

  return {
    habilitado: env.BOLETAS_HABILITADAS,
    preciosIncluyenIva: env.PRECIOS_INCLUYEN_IVA,
    ambiente: env.SII_AMBIENTE,
    setPruebas: env.SII_SET_PRUEBAS,
    emisor: datosEmisor(),
    // Vacío = la configuración del emisor está lista para emitir.
    problemasEmisor,
    foliosDisponibles: { boletaAfecta: afectas, boletaExenta: exentas },
    pendientesDeEnvio: pendientes,
    rechazadas,
  };
}

/** Código oficial del SII (39/41) a partir del enum interno. */
export function codigoSii(tipo: TipoDte): 39 | 41 {
  return TIPO_CODIGO[tipo];
}

/**
 * Envío de un documento suelto al SII, para reintentar desde la interfaz.
 * El envío normal es por lotes y lo hace la cola (cola.ts).
 */
export async function enviarAlSii(documentoId: string) {
  const { reintentar, enviarPendientes } = await import('./cola.ts');
  await reintentar(documentoId);
  return enviarPendientes();
}
