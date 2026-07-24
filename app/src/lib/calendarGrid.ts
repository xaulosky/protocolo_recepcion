/**
 * Grilla de calendario mensual (lunes a domingo, 6 semanas fijas), compartida
 * por las vistas de calendario de Tareas, Cirugías y el Calendario general.
 */
export interface DiaGrid {
  date: Date;
  /** Si pertenece al mes visible (false = relleno del mes anterior/siguiente). */
  current: boolean;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function buildMonthGrid(year: number, month: number): DiaGrid[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: DiaGrid[] = [];

  const firstDow = (first.getDay() + 6) % 7; // lunes = 0
  for (let i = firstDow - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), current: false });
  for (let i = 1; i <= last.getDate(); i++) days.push({ date: new Date(year, month, i), current: true });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), current: false });
  return days;
}

export const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const DIAS_SEMANA = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

/**
 * Columnas de la grilla. `minmax(0, 1fr)` en vez de `1fr`: el mínimo de `1fr`
 * es `auto`, así que un chip largo (una tarea con título extenso) ensancha su
 * columna y descuadra la semana entera. Con mínimo 0 el chip se trunca.
 */
export const GRID_COLS_7 = 'repeat(7, minmax(0, 1fr))';
