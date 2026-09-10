import { env } from '../env.ts';

/**
 * Cliente de la API de Reservo (scraper de reservo.cl expuesto como REST).
 *
 * En producción ambas aplicaciones viven en el mismo VPS, así que apuntamos a
 * `http://127.0.0.1:4000` y el tráfico nunca sale del servidor: no expone datos
 * de pacientes a internet ni necesita TLS propio.
 *
 * La API pide `x-api-key`. Las credenciales de reservo.cl son opcionales: si no
 * se envían, la API usa las de su propio `.env` (la cuenta de la clínica).
 */

/** Una cita tal como la devuelve `GET /agenda`. */
export interface CitaReservo {
  fecha: string;        // YYYY-MM-DD
  hora: string;         // "09:00 - 10:00"
  ficha: string | null;
  rut: string | null;
  paciente: string;
  servicio: string;
  comentario: string | null;
  estado: string;       // Atendido | Confirmado | No llegó | Suspendió | ...
  estadoPago: string;   // Pagado | No pagado | Plan
  atendido: boolean;
  pagado: boolean;
  contacto: string | null;
  box: string | null;
  profesional: string;
  idPaciente: string | null;
}

interface RespuestaAgenda {
  total?: number;
  data?: CitaReservo[];
}

export class ReservoError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ReservoError';
  }
}

/** ¿Está configurada la integración? Si no, el módulo de citas queda inerte. */
export function reservoHabilitado(): boolean {
  return Boolean(env.RESERVO_API_URL);
}

function cabeceras(): Record<string, string> {
  const h: Record<string, string> = { accept: 'application/json' };
  if (env.RESERVO_API_KEY) h['x-api-key'] = env.RESERVO_API_KEY;
  // Multi-tenant opcional: sólo si esta instancia usa una cuenta distinta a la
  // configurada en el .env de reservo-api.
  if (env.RESERVO_USER && env.RESERVO_PASS) {
    h['x-reservo-user'] = env.RESERVO_USER;
    h['x-reservo-pass'] = env.RESERVO_PASS;
  }
  return h;
}

async function pedir<T>(ruta: string, timeoutMs = 60_000): Promise<T> {
  if (!reservoHabilitado()) {
    throw new ReservoError('La integración con Reservo no está configurada (falta RESERVO_API_URL)');
  }

  const base = env.RESERVO_API_URL.replace(/\/$/, '');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}${ruta}`, { headers: cabeceras(), signal: ctrl.signal });

    if (!res.ok) {
      // La API responde 401 (llave o credenciales) y 502 (falló el scraping).
      const cuerpo = await res.text().catch(() => '');
      throw new ReservoError(
        `Reservo respondió ${res.status}${cuerpo ? `: ${cuerpo.slice(0, 200)}` : ''}`,
        res.status,
      );
    }

    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ReservoError) throw e;
    if ((e as Error)?.name === 'AbortError') {
      throw new ReservoError(`Reservo no respondió en ${Math.round(timeoutMs / 1000)}s`);
    }
    throw new ReservoError(`No se pudo contactar a Reservo: ${(e as Error)?.message ?? 'error desconocido'}`);
  } finally {
    clearTimeout(timer);
  }
}

/** Verifica que la API esté viva. No requiere llave. */
export async function health(): Promise<boolean> {
  try {
    const r = await pedir<{ ok?: boolean }>('/health', 8_000);
    return r?.ok === true;
  } catch {
    return false;
  }
}

/**
 * Agenda de un rango de días. La API recorre día a día y topa en 62 días, así
 * que el rango se parte en tramos para no pasarse.
 */
export async function agenda(desde: string, hasta: string): Promise<CitaReservo[]> {
  const salida: CitaReservo[] = [];

  for (const [ini, fin] of partirRango(desde, hasta, 30)) {
    // Un mes de agenda puede tardar: el scraper visita un día por request.
    const r = await pedir<RespuestaAgenda>(
      `/agenda?desde=${encodeURIComponent(ini)}&hasta=${encodeURIComponent(fin)}`,
      120_000,
    );
    if (Array.isArray(r?.data)) salida.push(...r.data);
  }

  return salida;
}

/** Parte [desde, hasta] en tramos de a lo más `maxDias` días. */
function partirRango(desde: string, hasta: string, maxDias: number): Array<[string, string]> {
  const ini = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  if (Number.isNaN(ini.getTime()) || Number.isNaN(fin.getTime())) {
    throw new ReservoError('Rango de fechas inválido (se espera YYYY-MM-DD)');
  }
  if (fin < ini) throw new ReservoError('La fecha "hasta" es anterior a "desde"');

  const tramos: Array<[string, string]> = [];
  const cursor = new Date(ini);

  while (cursor <= fin) {
    const tramoIni = new Date(cursor);
    const tramoFin = new Date(cursor);
    tramoFin.setDate(tramoFin.getDate() + maxDias - 1);
    if (tramoFin > fin) tramoFin.setTime(fin.getTime());

    tramos.push([iso(tramoIni), iso(tramoFin)]);
    cursor.setDate(cursor.getDate() + maxDias);
  }

  return tramos;
}

/** Date → YYYY-MM-DD en horario local (evita el corrimiento de toISOString). */
export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
