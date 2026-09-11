import type { DatosBoleta, ItemBoleta } from './dte.ts';

/**
 * Diez operaciones representativas de la clínica, para las muestras impresas
 * que pide la certificación de boleta electrónica.
 *
 * El SII exige que las muestras "simulen operaciones reales" y que tengan
 * relación con el giro del contribuyente (centro médico), así que son
 * prestaciones y precios del catálogo real, no montos inventados. Todas son
 * exentas: la clínica factura prestaciones de salud.
 */

interface Muestra {
  /** Qué operación simula, para el pie de la representación impresa. */
  glosa: string;
  items: ItemBoleta[];
}

export const MUESTRAS: Muestra[] = [
  {
    glosa: 'Consulta de evaluación con procedimiento facial',
    items: [
      { nombre: 'Consulta de Evaluacion Medicina Estetica', cantidad: 1, precio: 30_000 },
      { nombre: 'Toxina Botulinica Tercio Superior Facial', cantidad: 1, precio: 179_000 },
    ],
  },
  {
    glosa: 'Tratamiento de bruxismo',
    items: [{ nombre: 'Toxina Botulinica Bruxismo (Maseteros)', cantidad: 1, precio: 200_000 }],
  },
  {
    glosa: 'Relleno con ácido hialurónico, dos zonas',
    items: [
      { nombre: 'Relleno de Labios con Acido Hialuronico', cantidad: 1, precio: 180_000 },
      { nombre: 'Relleno de Menton con Acido Hialuronico', cantidad: 1, precio: 220_000 },
    ],
  },
  {
    glosa: 'Plan de sesiones',
    items: [{ nombre: 'Sesion de Depilacion Laser Axilas', cantidad: 6, precio: 18_000, unidad: 'SES' }],
  },
  {
    glosa: 'Consulta médica general',
    items: [{ nombre: 'Consulta Medica General', cantidad: 1, precio: 35_000 }],
  },
  {
    glosa: 'Procedimiento facial combinado',
    items: [
      { nombre: 'Limpieza Facial Profunda', cantidad: 1, precio: 45_000 },
      { nombre: 'Peeling Quimico Superficial', cantidad: 1, precio: 60_000 },
    ],
  },
  {
    glosa: 'Control post operatorio',
    items: [{ nombre: 'Control Post Operatorio', cantidad: 1, precio: 25_000 }],
  },
  {
    glosa: 'Rinomodelación',
    items: [{ nombre: 'Rinomodelacion con Acido Hialuronico', cantidad: 1, precio: 350_000 }],
  },
  {
    glosa: 'Curación avanzada, tres sesiones',
    items: [{ nombre: 'Curacion Avanzada de Herida', cantidad: 3, precio: 22_000, unidad: 'SES' }],
  },
  {
    glosa: 'Evaluación con procedimiento corporal',
    items: [
      { nombre: 'Consulta de Evaluacion Medicina Estetica', cantidad: 1, precio: 30_000 },
      { nombre: 'Mesoterapia Corporal Reductiva', cantidad: 4, precio: 40_000, unidad: 'SES' },
    ],
  },
];

/** Convierte las muestras en boletas exentas con folios correlativos. */
export function boletasDeMuestra(folioInicial: number, fechaEmision: string, cuantas = MUESTRAS.length): Array<DatosBoleta & { glosa: string }> {
  return MUESTRAS.slice(0, cuantas).map((m, i) => {
    const total = m.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
    return {
      tipoDte: 41 as const,
      folio: folioInicial + i,
      fechaEmision,
      items: m.items,
      neto: 0,
      iva: 0,
      exento: total,
      total,
      glosa: m.glosa,
    };
  });
}
