/** Formatea un número como CLP sin símbolo: 50000 -> "50.000" */
export function clp(n: number): string {
  return Math.round(n || 0).toLocaleString('es-CL');
}

/** Formatea un número como precio con símbolo: 50000 -> "$50.000" */
export function money(n: number): string {
  return `$${clp(n)}`;
}

/** Rango de precio para tratamientos: "$179.000 – $210.000" o "$179.000". */
export function priceRange(desde?: number | null, hasta?: number | null): string {
  if (!desde && !hasta) return 'Evaluación';
  if (!hasta || desde === hasta) return money(desde || 0);
  return `${money(desde || 0)} – ${money(hasta)}`;
}

/** Iniciales a partir de un nombre completo: "Andrés Martínez" -> "AM" */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Paleta determinística de avatares según un índice. */
const AVATAR_COLORS = ['#7C6247', '#5A7A6A', '#6A5A8C', '#7A6A5A', '#4A6A8C', '#8C5A5A', '#5A8C5A'];
export function avatarColor(i: number): string {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

/** Color determinístico a partir de un string (nombre de usuario). */
export function colorFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
