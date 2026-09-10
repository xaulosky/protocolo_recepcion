/**
 * Cálculo de montos tributarios de una boleta electrónica.
 *
 * Reglas del negocio (confirmadas por la clínica):
 *   - Los TRATAMIENTOS son exentos de IVA.
 *   - Los PRODUCTOS son afectos.
 *   - Los precios de cara al público van con IVA incluido, que es la convención
 *     al consumidor final. Se puede invertir con PRECIOS_INCLUYEN_IVA=false.
 *
 * Tipo de documento resultante:
 *   - 41 (boleta exenta)  si TODAS las líneas son exentas.
 *   - 39 (boleta afecta)  si hay al menos una línea afecta; las exentas viajan
 *     dentro del mismo documento como "monto exento".
 *
 * Todo se maneja en pesos enteros: el CLP no tiene decimales y el SII rechaza
 * documentos cuyos totales no cuadran, así que el IVA se obtiene por diferencia
 * en vez de redondearse por separado.
 */

export const TASA_IVA = 19;

export type TipoDte = 39 | 41;

export interface LineaMonto {
  /** true = exenta de IVA (tratamientos). */
  exento: boolean;
  /** Precio unitario en pesos, tal como se cobró. */
  precioUnitario: number;
  cantidad: number;
}

export interface MontosBoleta {
  tipo: TipoDte;
  /** Suma de las líneas antes del descuento. */
  subtotal: number;
  /** Base imponible (sin IVA) de las líneas afectas. */
  neto: number;
  /** IVA de las líneas afectas. */
  iva: number;
  /** Total de las líneas exentas. */
  exento: number;
  /** neto + iva + exento. Debe coincidir con el total cobrado en caja. */
  total: number;
}

export interface OpcionesMontos {
  /** Descuento global aplicado en caja, 0-100. */
  descuento?: number;
  /** false = los precios son netos y el IVA se suma encima. */
  preciosIncluyenIva?: boolean;
}

/**
 * Convierte las líneas de una venta en los montos de la boleta.
 *
 * El descuento en caja es un porcentaje global sobre el total, así que se
 * reparte proporcionalmente entre la porción exenta y la afecta. La porción
 * afecta se calcula por diferencia para que el redondeo nunca descuadre el
 * total contra lo que efectivamente se cobró.
 */
export function calcularMontos(lineas: LineaMonto[], opciones: OpcionesMontos = {}): MontosBoleta {
  const descuento = clamp(opciones.descuento ?? 0, 0, 100);
  const preciosIncluyenIva = opciones.preciosIncluyenIva ?? true;

  let subtotal = 0;
  let brutoExento = 0;
  let hayAfecta = false;

  for (const l of lineas) {
    const monto = Math.round(l.precioUnitario * l.cantidad);
    subtotal += monto;
    if (l.exento) brutoExento += monto;
    else hayAfecta = true;
  }

  const tipo: TipoDte = hayAfecta ? 39 : 41;

  if (subtotal <= 0) {
    return { tipo, subtotal: 0, neto: 0, iva: 0, exento: 0, total: 0 };
  }

  // Mismo redondeo que usa la caja para Venta.total: los totales deben calzar.
  const totalCobrado = Math.round(subtotal * (1 - descuento / 100));

  // Reparto proporcional del descuento. El exento se redondea y la parte afecta
  // absorbe la diferencia, de modo que exento + afecto === totalCobrado exacto.
  const exento = brutoExento === 0
    ? 0
    : brutoExento === subtotal
      ? totalCobrado
      : Math.round(totalCobrado * (brutoExento / subtotal));

  const totalAfecto = totalCobrado - exento;

  let neto: number;
  let iva: number;

  if (totalAfecto <= 0) {
    neto = 0;
    iva = 0;
  } else if (preciosIncluyenIva) {
    // El precio ya trae el IVA dentro: se extrae hacia atrás.
    neto = Math.round(totalAfecto / (1 + TASA_IVA / 100));
    iva = totalAfecto - neto; // por diferencia: garantiza neto + iva === totalAfecto
  } else {
    neto = totalAfecto;
    iva = Math.round((totalAfecto * TASA_IVA) / 100);
  }

  return {
    tipo,
    subtotal,
    neto,
    iva,
    exento,
    total: neto + iva + exento,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
