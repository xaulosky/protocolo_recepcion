import { readFile } from 'node:fs/promises';
import { createSign, createHash, createPrivateKey, type KeyObject } from 'node:crypto';
import forge from 'node-forge';
import { env } from '../../env.ts';

/**
 * Material criptográfico para emitir DTE: el certificado de la empresa (firma
 * el documento y el sobre) y la llave del CAF (timbra cada folio).
 *
 * Son dos llaves distintas y es un error común confundirlas:
 *   - El certificado (.pfx de E-CertChile) firma el XML completo — acredita
 *     QUIÉN emite.
 *   - La llave del CAF, que entrega el propio SII dentro del archivo de
 *     folios, firma el TED — acredita que ESE folio fue autorizado.
 */

export class FirmaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirmaError';
  }
}

export interface Certificado {
  /** Llave privada lista para firmar. */
  key: KeyObject;
  /** Certificado X.509 en base64, sin cabeceras, para el <X509Certificate>. */
  certBase64: string;
  /** Módulo y exponente en base64, para el <KeyValue> de la firma. */
  modulusBase64: string;
  exponentBase64: string;
  /** RUT que va dentro del certificado (OID chileno 1.3.6.1.4.1.8321.1). */
  rut: string | null;
  notAfter: Date;
}

let cache: Certificado | null = null;

/**
 * Carga el certificado .pfx. Se cachea: parsear PKCS#12 es caro y la llave no
 * cambia durante la vida del proceso.
 */
export async function cargarCertificado(): Promise<Certificado> {
  if (cache) return cache;

  if (!env.SII_CERT_PATH) {
    throw new FirmaError('Falta la ruta del certificado (SII_CERT_PATH)');
  }

  const buf = await readFile(env.SII_CERT_PATH).catch(() => {
    throw new FirmaError(`No se pudo leer el certificado en ${env.SII_CERT_PATH}`);
  });

  let p12: forge.pkcs12.Pkcs12Pfx;
  try {
    const asn1 = forge.asn1.fromDer(forge.util.createBuffer(buf.toString('binary')));
    p12 = forge.pkcs12.pkcs12FromAsn1(asn1, env.SII_CERT_PASS);
  } catch {
    throw new FirmaError('No se pudo abrir el certificado: clave incorrecta o archivo dañado');
  }

  // El .pfx trae la cadena completa; interesa el certificado del titular, que
  // es el único que viene con su llave privada.
  const bolsaKey = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
    forge.pki.oids.pkcs8ShroudedKeyBag
  ]?.[0] ?? p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];

  const bolsaCert = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag]?.[0];

  if (!bolsaKey?.key || !bolsaCert?.cert) {
    throw new FirmaError('El certificado no contiene una llave privada utilizable');
  }

  const privateKey = bolsaKey.key as forge.pki.rsa.PrivateKey;
  const cert = bolsaCert.cert;

  const pem = forge.pki.privateKeyToPem(privateKey);
  const key = createPrivateKey(pem);

  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const certBase64 = forge.util.encode64(certDer);

  const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;

  cache = {
    key,
    certBase64,
    modulusBase64: bigIntABase64(publicKey.n),
    exponentBase64: bigIntABase64(publicKey.e),
    rut: rutDelCertificado(cert),
    notAfter: cert.validity.notAfter,
  };

  return cache;
}

/**
 * Convierte un BigInteger de forge a base64 como ds:CryptoBinary: entero sin
 * signo, big-endian, SIN octetos cero iniciales (XMLDSig §4.0.1). Anteponer el
 * 0x00 "de signo" que usan ASN.1/Java hace que el SII rechace el envío con
 * "Clave Publica no Corresponde a Certificado": compara el Modulus byte a
 * byte con el que saca del certificado.
 */
function bigIntABase64(n: forge.jsbn.BigInteger): string {
  let hex = n.toString(16).replace(/^0+/, '');
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex').toString('base64');
}

/**
 * Busca el RUT en el subjectAltName. Las CA chilenas lo guardan como un
 * `othername` bajo el OID 1.3.6.1.4.1.8321.1, anidado varios niveles dentro
 * del ASN.1. En vez de recorrer esa estructura (que varía entre CA), se busca
 * el patron de RUT sobre el DER crudo de la extension: el valor es texto
 * plano ahi dentro, y el formato es inconfundible.
 */
function rutDelCertificado(cert: forge.pki.Certificate): string | null {
  const ext = cert.getExtension('subjectAltName') as { value?: string } | undefined;
  if (!ext?.value) return null;
  const m = /\d{7,8}-[\dkK]/.exec(Buffer.from(ext.value, 'binary').toString('latin1'));
  return m ? m[0] : null;
}

// ─────────────────────────── CAF ───────────────────────────

export interface Caf {
  /** El bloque <CAF>…</CAF> tal cual viene, para incrustarlo dentro del TED. */
  xml: string;
  tipoDte: number;
  desde: number;
  hasta: number;
  rutEmisor: string;
  razonSocial: string;
  /** Llave privada del CAF, la que timbra cada folio. */
  key: KeyObject;
}

/**
 * Lee el archivo de folios que entrega el SII.
 *
 * Estructura: <AUTORIZACION> contiene <CAF> (que va íntegro dentro del TED) y
 * <RSASK>, la llave privada con la que se timbra. El <CAF> debe copiarse
 * EXACTAMENTE como viene: si se reformatea, la firma del SII sobre él deja de
 * validar y el documento se rechaza.
 */
export function parsearCaf(contenido: string): Caf {
  const bloque = /<CAF[\s>][\s\S]*?<\/CAF>/.exec(contenido);
  if (!bloque) throw new FirmaError('El archivo no parece un CAF: falta el bloque <CAF>');

  const dato = (tag: string): string => {
    const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(contenido);
    if (!m) throw new FirmaError(`El CAF no trae <${tag}>`);
    return m[1].trim();
  };

  const rng = /<RNG>([\s\S]*?)<\/RNG>/.exec(contenido);
  if (!rng) throw new FirmaError('El CAF no trae el rango de folios <RNG>');
  const desde = Number(/<D>(\d+)<\/D>/.exec(rng[1])?.[1]);
  const hasta = Number(/<H>(\d+)<\/H>/.exec(rng[1])?.[1]);
  if (!Number.isInteger(desde) || !Number.isInteger(hasta)) {
    throw new FirmaError('El rango de folios del CAF es ilegible');
  }

  const sk = /<RSASK>([\s\S]*?)<\/RSASK>/.exec(contenido);
  if (!sk) throw new FirmaError('El CAF no trae la llave privada <RSASK>');

  let key: KeyObject;
  try {
    key = createPrivateKey(sk[1].trim());
  } catch {
    throw new FirmaError('La llave privada del CAF no se pudo interpretar');
  }

  return {
    // El SII verifica la firma del timbre (FRMT) sobre el <DD> "aplanado": sin
    // blancos ni saltos de línea entre etiquetas. El archivo de folios viene
    // con un elemento por línea, así que se aplana acá y el CAF se embebe y se
    // firma ya plano; si no, el timbre vuelve con reparo 510 "Firma Timbre
    // Electrónico Incorrecta" (trackid 32153184). Los textos (llaves, firma
    // del SII) no cambian: sólo se toca lo que hay entre '>' y '<'.
    xml: bloque[0].replace(/>\s+</g, '><'),
    tipoDte: Number(dato('TD')),
    desde,
    hasta,
    rutEmisor: dato('RE'),
    razonSocial: dato('RS'),
    key,
  };
}

/**
 * Firma con SHA1withRSA y devuelve base64.
 *
 * SHA-1 está obsoleto para casi todo, pero el SII lo exige tanto para el TED
 * como para la firma del DTE: no es una elección nuestra.
 */
export function firmarSha1(datos: string, key: KeyObject): string {
  const s = createSign('RSA-SHA1');
  s.update(datos, 'utf8');
  s.end();
  return s.sign(key).toString('base64');
}

/** SHA1 en base64, para los <DigestValue> de la firma XML. */
export function digestSha1(datos: string): string {
  return createHash('sha1').update(datos, 'utf8').digest('base64');
}
