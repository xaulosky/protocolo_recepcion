import type { DatosBoleta, ItemBoleta } from './dte.ts';

/**
 * Set de pruebas de certificación entregado por el SII para boleta no afecta o
 * exenta electrónica.
 *
 * Los montos vienen "sin IVA" en el set, lo que en una boleta exenta significa
 * simplemente el monto exento: no hay IVA que agregar.
 *
 * El CASO-2 exige informar unidad de medida mensual. El esquema limita
 * `UnmdItem` a 4 caracteres, así que va abreviado.
 */

interface CasoSet {
  nombre: string;
  items: ItemBoleta[];
}

export const CASOS_SET: CasoSet[] = [
  {
    nombre: 'CASO-1',
    items: [
      { nombre: 'Consultoria 1', cantidad: 1, precio: 50_000 },
      { nombre: 'Consultoria 2', cantidad: 2, precio: 35_000 },
    ],
  },
  {
    nombre: 'CASO-2',
    items: [{ nombre: 'Capacitacion', cantidad: 1, precio: 95_000, unidad: 'MES' }],
  },
  {
    nombre: 'CASO-3',
    items: [
      { nombre: 'Consulta Medica', cantidad: 1, precio: 25_000 },
      { nombre: 'Atencion Hospitalaria', cantidad: 3, precio: 17_500 },
    ],
  },
];

/** Convierte un caso del set en los datos de una boleta exenta. */
export function casoABoleta(caso: CasoSet, folio: number, fechaEmision: string): DatosBoleta {
  const total = caso.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  return {
    tipoDte: 41,
    folio,
    fechaEmision,
    items: caso.items,
    neto: 0,
    iva: 0,
    exento: total,
    total,
    casoSet: caso.nombre,
  };
}

/** Los tres casos, asignando folios correlativos desde `folioInicial`. */
export function boletasDelSet(folioInicial: number, fechaEmision: string): DatosBoleta[] {
  return CASOS_SET.map((caso, i) => casoABoleta(caso, folioInicial + i, fechaEmision));
}
