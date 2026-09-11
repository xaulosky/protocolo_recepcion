import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { env } from '../../env.ts';
import { firmarXml } from './dte.ts';
import type { Certificado } from './firma.ts';

/**
 * Cliente de la API REST de boleta electrónica del SII.
 *
 * Las boletas NO se suben por el canal clásico de facturas (el uploader web
 * "Enviar DTE" responde SCH-00001 a un EnvioBOLETA): tienen su propia API,
 * documentada en https://www4c.sii.cl/bolcoreinternetui/api/ (OpenAPI 1.0.5).
 * El flujo es el de siempre pero con hosts propios:
 *
 *   1. GET  semilla                     → número de un solo uso
 *   2. POST token  (semilla firmada)    → TOKEN, va como cookie en lo demás
 *   3. POST envío  (multipart)          → trackid, estado REC
 *   4. GET  envío/{rut}-{dv}-{trackid}  → EPR/RCH… con detalle por folio
 *
 * El token de facturas no sirve acá y viceversa. El RVD (ex RCOF) sigue por
 * el canal clásico.
 */

const HOSTS = {
  certificacion: { api: 'https://apicert.sii.cl', envio: 'https://pangal.sii.cl' },
  produccion: { api: 'https://api.sii.cl', envio: 'https://rahue.sii.cl' },
} as const;

/** El SII exige literalmente este User-Agent en el envío; otro devuelve 400. */
const USER_AGENT = 'Mozilla/4.0 ( compatible; PROG 1.0; Windows NT)';

export class SiiError extends Error {
  constructor(
    message: string,
    readonly detalle?: unknown,
  ) {
    super(message);
    this.name = 'SiiError';
  }
}

function hosts() {
  return HOSTS[env.SII_AMBIENTE];
}

/** Texto de un elemento en la respuesta XML, ignorando el prefijo de namespace. */
function texto(xml: string, etiqueta: string): string | null {
  const m = new RegExp(`<(?:\\w+:)?${etiqueta}>([^<]*)</(?:\\w+:)?${etiqueta}>`).exec(xml);
  return m ? m[1].trim() : null;
}

/** Separa "78155814-1" en { rut: 78155814, dv: '1' }, como lo pide el multipart. */
export function partirRut(rut: string): { rut: number; dv: string } {
  const m = /^(\d{1,8})-([\dkK])$/.exec(rut.trim());
  if (!m) throw new SiiError(`RUT mal formado: "${rut}"`);
  return { rut: Number(m[1]), dv: m[2].toUpperCase() };
}

export async function obtenerSemilla(): Promise<string> {
  const res = await fetch(`${hosts().api}/recursos/v1/boleta.electronica.semilla`, {
    headers: { Accept: 'application/xml' },
  });
  const cuerpo = await res.text();
  if (!res.ok) throw new SiiError(`Semilla: HTTP ${res.status}`, cuerpo);
  const semilla = texto(cuerpo, 'SEMILLA');
  if (!semilla) throw new SiiError(`Semilla: respuesta sin SEMILLA (ESTADO ${texto(cuerpo, 'ESTADO')})`, cuerpo);
  return semilla;
}

/**
 * Arma y firma el getToken. Es un XML sin namespace, con la firma XMLDSig
 * sobre el documento completo (URI=""), así que se firma sin inyectar xsi.
 *
 * El formato es el que dicta la OpenAPI del SII y su parser lo toma al pie de
 * la letra: primera línea la declaración con encoding, salto de línea, y el
 * documento entero en una segunda línea sin salto final. Sin la declaración
 * responde ESTADO 11 "elemento Certificate no existe" aunque el XML sea
 * correcto (comprobado el 2026-09-11).
 */
export function construirGetToken(semilla: string, cert: Certificado): string {
  const xml = `<getToken><item><Semilla>${semilla}</Semilla></item></getToken>`;
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + firmarXml(xml, '', cert, 'getToken', { conXsi: false });
}

export async function obtenerToken(cert: Certificado): Promise<string> {
  const semilla = await obtenerSemilla();
  const res = await fetch(`${hosts().api}/recursos/v1/boleta.electronica.token`, {
    method: 'POST',
    headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' },
    body: construirGetToken(semilla, cert),
  });
  const cuerpo = await res.text();
  if (!res.ok) throw new SiiError(`Token: HTTP ${res.status}`, cuerpo);
  const token = texto(cuerpo, 'TOKEN');
  if (!token) {
    throw new SiiError(`Token: ESTADO ${texto(cuerpo, 'ESTADO')} — ${texto(cuerpo, 'GLOSA') ?? 'sin glosa'}`, cuerpo);
  }
  return token;
}

export interface ResultadoEnvio {
  rut_emisor: string;
  rut_envia: string;
  trackid: number;
  fecha_recepcion: string;
  /** "REC" = recibido; el resultado real se consulta después con el trackid. */
  estado: string;
  file: string;
}

export interface EnvioParams {
  /** Contenido del EnvioBOLETA ya firmado, en los bytes exactos del archivo. */
  archivo: Buffer;
  nombreArchivo: string;
  /** RUT de la empresa emisora (rutCompany). */
  rutEmisor: string;
  /** RUT de la persona del certificado (rutSender); debe coincidir con RutEnvia. */
  rutEnvia: string;
  token: string;
}

/** Sube un sobre de boletas. Devuelve el trackid con el que se consulta el estado. */
export async function enviarBoletas(p: EnvioParams): Promise<ResultadoEnvio> {
  const emisor = partirRut(p.rutEmisor);
  const envia = partirRut(p.rutEnvia);

  const form = new FormData();
  form.append('rutSender', String(envia.rut));
  form.append('dvSender', envia.dv);
  form.append('rutCompany', String(emisor.rut));
  form.append('dvCompany', emisor.dv);
  form.append('archivo', new Blob([new Uint8Array(p.archivo)], { type: 'text/xml' }), p.nombreArchivo);

  const res = await fetch(`${hosts().envio}/recursos/v1/boleta.electronica.envio`, {
    method: 'POST',
    headers: { 'User-Agent': USER_AGENT, Cookie: `TOKEN=${p.token}`, Accept: 'application/json' },
    body: form,
  });
  const cuerpo = await res.text();
  if (!res.ok) throw new SiiError(`Envío: HTTP ${res.status} — ${cuerpo.slice(0, 300)}`, cuerpo);
  try {
    return JSON.parse(cuerpo) as ResultadoEnvio;
  } catch {
    throw new SiiError('Envío: la respuesta no es JSON', cuerpo);
  }
}

export interface ErrorDte {
  seccion: string;
  linea: number;
  nivel: number;
  codigo: number;
  descripcion: string;
  detalle: string;
}

export interface EstadoEnvio {
  rut_emisor: string;
  rut_envia: string;
  trackid: number;
  fecha_recepcion: string;
  /** REC recibido · EPR procesado · RCO/RCH rechazado… (lista en /globales). */
  estado: string;
  estadistica?: { tipo: number; informados: number; aceptados: number; rechazados: number; reparos: number }[];
  detalle_rep_rech?: { tipo?: number; folio: number; estado: string; descripcion: string; error?: ErrorDte[] }[];
}

/** Estado de un envío: procesado trae aceptados/rechazados por tipo y el detalle de cada reparo. */
export async function consultarEnvio(rutEmisor: string, trackid: number, token: string): Promise<EstadoEnvio> {
  const emisor = partirRut(rutEmisor);
  const res = await fetch(
    `${hosts().api}/recursos/v1/boleta.electronica.envio/${emisor.rut}-${emisor.dv}-${trackid}`,
    { headers: { 'User-Agent': USER_AGENT, Cookie: `TOKEN=${token}`, Accept: 'application/json' } },
  );
  const cuerpo = await res.text();
  if (!res.ok) throw new SiiError(`Estado: HTTP ${res.status} — ${cuerpo.slice(0, 300)}`, cuerpo);
  try {
    return JSON.parse(cuerpo) as EstadoEnvio;
  } catch {
    throw new SiiError('Estado: la respuesta no es JSON', cuerpo);
  }
}

/** Atajo para subir un EnvioBOLETA que ya está en disco. */
export async function enviarArchivo(ruta: string, cert: Certificado, token: string): Promise<ResultadoEnvio> {
  if (!cert.rut) throw new SiiError('El certificado no trae RUT; rutSender quedaría vacío');
  return enviarBoletas({
    archivo: readFileSync(ruta),
    nombreArchivo: basename(ruta),
    rutEmisor: env.SII_RUT_EMISOR,
    rutEnvia: cert.rut,
    token,
  });
}
