import type { Prisma, TipoDte } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { calcularMontos, type LineaMonto } from './montos.ts';
import { reservarFolio, foliosDisponibles } from './folios.ts';

/**
 * Emisión de boletas electrónicas asociadas a las ventas de caja.
 *
 * Estado actual: el documento se emite y guarda con folio y montos, en estado
 * PENDIENTE. Falta la parte que exige la documentación del SII —armar el XML,
 * timbrarlo con la llave del CAF, firmarlo con el certificado y enviarlo—, que
 * se conecta en `enviarAlSii` sin tocar nada de lo demás.
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

  await tx.documentoTributario.create({
    data: {
      ventaId: venta.id,
      tipo,
      folio: asignado.folio,
      cafId: asignado.cafId,
      neto: montos.neto,
      exento: montos.exento,
      iva: montos.iva,
      total: montos.total,
      estado: 'PENDIENTE',
    },
  });

  return { emitida: true };
}

/** Resumen para el panel de caja: cuántos folios quedan y qué está pendiente. */
export async function estadoBoletas() {
  const [afectas, exentas, pendientes, rechazadas] = await Promise.all([
    foliosDisponibles(prisma, 'BOLETA_AFECTA'),
    foliosDisponibles(prisma, 'BOLETA_EXENTA'),
    prisma.documentoTributario.count({ where: { estado: { in: ['PENDIENTE', 'ENVIADA'] } } }),
    prisma.documentoTributario.count({ where: { estado: 'RECHAZADA' } }),
  ]);

  return {
    habilitado: env.BOLETAS_HABILITADAS,
    preciosIncluyenIva: env.PRECIOS_INCLUYEN_IVA,
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
 * Envío del DTE al SII.
 *
 * PENDIENTE DE IMPLEMENTAR — requiere la documentación oficial del SII:
 *   1. Armar el XML del DTE según el esquema del tipo 39/41.
 *   2. Generar el TED y timbrarlo con la llave privada que viene en el CAF.
 *   3. Firmar el documento (XMLDSig) con el certificado digital del emisor.
 *   4. Enviarlo al ambiente correspondiente (certificación o producción) y
 *      guardar el track id.
 *   5. Consultar el estado y registrar aceptación o rechazo.
 *
 * Se deja explícito en vez de simulado: una boleta que el sistema da por
 * enviada sin estarlo es peor que una pendiente visible.
 */
export async function enviarAlSii(_documentoId: string): Promise<never> {
  throw new Error(
    'El envío al SII aún no está implementado: falta el certificado digital, el CAF y el esquema oficial del DTE.',
  );
}
