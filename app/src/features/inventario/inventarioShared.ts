import type { InventarioItem, MovimientoTipo } from '../../lib/types';

export function stockColor(item: InventarioItem): { bg: string; color: string; label: string } {
  if (item.stock === 0)                                              return { bg: '#fce8e8', color: '#c0392b', label: 'Sin stock' };
  if (item.stockMinimo > 0 && item.stock <= item.stockMinimo)       return { bg: '#fef3e2', color: '#e67e22', label: 'Bajo mínimo' };
  if (item.stockMinimo > 0 && item.stock <= item.stockMinimo * 1.5) return { bg: '#fefde8', color: '#b7950b', label: 'Bajo' };
  return { bg: '#e8f5e9', color: '#2e7d32', label: 'OK' };
}

export const TIPO_CONFIG = {
  ENTRADA:  { label: 'Entrada',   color: '#2e7d32', bg: '#e8f5e9', sign: '+' },
  SALIDA:   { label: 'Salida',    color: '#c0392b', bg: '#fce8e8', sign: '−' },
  AJUSTE:   { label: 'Ajuste',    color: '#1565c0', bg: '#e3f2fd', sign: '=' },
  TRASLADO: { label: 'Traslado',  color: '#6a1b9a', bg: '#f3e5f5', sign: '→' },
} as const;

export const TIPO_LABEL: Record<MovimientoTipo, string> = {
  ENTRADA: 'Entrada', SALIDA: 'Salida', AJUSTE: 'Ajuste', TRASLADO: 'Traslado',
};

export const TIPO_COLOR: Record<MovimientoTipo, string> = {
  ENTRADA: '#2e7d32', SALIDA: '#c0392b', AJUSTE: '#1565c0', TRASLADO: '#6a1b9a',
};

export const MOTIVOS: Record<MovimientoTipo, { value: string; label: string }[]> = {
  ENTRADA: [
    { value: 'compra',     label: 'Compra' },
    { value: 'devolucion', label: 'Devolución' },
    { value: 'otro',       label: 'Otro' },
  ],
  SALIDA: [
    { value: 'consumo',    label: 'Consumo en procedimiento' },
    { value: 'vencimiento',label: 'Vencimiento' },
    { value: 'perdida',    label: 'Pérdida / merma' },
    { value: 'otro',       label: 'Otro' },
  ],
  AJUSTE: [
    { value: 'ajuste',     label: 'Conteo físico' },
    { value: 'otro',       label: 'Otro' },
  ],
  TRASLADO: [
    { value: 'traslado',   label: 'Traslado entre ubicaciones' },
    { value: 'otro',       label: 'Otro' },
  ],
};

export const UNIDADES = ['unidad', 'caja', 'paquete', 'ml', 'cc', 'gr', 'kg', 'L', 'ampolla', 'vial', 'par'];

export function fmtCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export function fmtFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export function fmtFechaCorta(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  } catch { return iso; }
}

export function calcStockDespues(item: InventarioItem, tipo: MovimientoTipo, cantidad: number): number {
  if (tipo === 'AJUSTE') return cantidad;
  if (tipo === 'ENTRADA') return item.stock + cantidad;
  return Math.max(0, item.stock - cantidad);
}
