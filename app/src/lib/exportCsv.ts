/**
 * Exporta filas como CSV descargable. El BOM (\ufeff) hace que Excel abra
 * correctamente los acentos/UTF-8. Mismo patrón que usaban Honorarios e
 * Inventario de forma duplicada.
 */
export function exportCsv(filename: string, filas: (string | number | null | undefined)[][]) {
  const csv = filas
    .map((fila) => fila.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
