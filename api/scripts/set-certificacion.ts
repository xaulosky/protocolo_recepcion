/**
 * Genera el set de certificación de boleta exenta del SII.
 *
 *   npm run sii:set -- <ruta-al-CAF.xml> [carpeta-salida]
 *   npm run sii:set -- --sintetico  [carpeta-salida]     (prueba, sin folios reales)
 *
 * Deja en la carpeta de salida:
 *   EnvioBOLETA.xml  — el sobre con las tres boletas del set, firmado
 *   RCOF.xml         — el Reporte de Consumo de Folios del día, firmado
 *   resumen.txt      — folios, montos y casos, para cotejar al subir
 *
 * Después de generar, verificar ANTES de subir:
 *   python docs/sii/verificar-envio.py <salida>/EnvioBOLETA.xml
 *   python docs/sii/verificar-envio.py <salida>/RCOF.xml ConsumoFolio_v10.xsd
 *
 * Variables de entorno necesarias: las SII_* del .env (emisor, certificado,
 * resolución) y SII_SET_PRUEBAS=true para que cada boleta lleve la referencia
 * a su caso del set.
 */
import { generateKeyPairSync } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from '../src/env.ts';
import { validarEmisor } from '../src/modules/boletas/emisor.ts';
import { cargarCertificado, parsearCaf } from '../src/modules/boletas/firma.ts';
import { generarBoleta, construirEnvio, type Caratula } from '../src/modules/boletas/dte.ts';
import { construirRcof } from '../src/modules/boletas/rcof.ts';
import { boletasDelSet } from '../src/modules/boletas/set-pruebas.ts';

/** CAF de mentira con una llave RSA propia: misma estructura, folios 1-3. */
function cafSintetico(): string {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pk = publicKey.export({ format: 'jwk' }) as { n: string; e: string };
  const b64 = (s: string) => Buffer.from(s, 'base64url').toString('base64');
  const sk = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
  return (
    `<AUTORIZACION><CAF version="1.0"><DA><RE>${env.SII_RUT_EMISOR}</RE><RS>${env.SII_RAZON_SOCIAL}</RS>` +
    `<TD>41</TD><RNG><D>1</D><H>3</H></RNG><FA>${env.SII_FCH_RESOL}</FA>` +
    `<RSAPK><M>${b64(pk.n)}</M><E>${b64(pk.e)}</E></RSAPK><IDK>100</IDK></DA>` +
    `<FRMA algoritmo="SHA1withRSA">${Buffer.from('caf-sintetico').toString('base64')}</FRMA></CAF>` +
    `<RSASK>${sk}</RSASK></AUTORIZACION>`
  );
}

async function main() {
  const [arg, salidaArg] = process.argv.slice(2);
  if (!arg) {
    console.error('Uso: npm run sii:set -- <CAF.xml | --sintetico> [carpeta-salida]');
    process.exit(2);
  }

  const problemas = validarEmisor();
  if (problemas.length) {
    console.error('La configuración del emisor no está lista:');
    for (const p of problemas) console.error('  -', p);
    process.exit(1);
  }
  if (!env.SII_SET_PRUEBAS) {
    console.error('Falta SII_SET_PRUEBAS=true: sin eso las boletas no llevan la referencia al caso del set.');
    process.exit(1);
  }

  const sintetico = arg === '--sintetico';
  const caf = parsearCaf(sintetico ? cafSintetico() : readFileSync(resolve(arg), 'latin1'));
  if (caf.tipoDte !== 41) {
    console.error(`El CAF es de tipo ${caf.tipoDte}; el set exige boleta exenta (41).`);
    process.exit(1);
  }
  if (caf.hasta - caf.desde + 1 < 3) {
    console.error(`El CAF trae ${caf.hasta - caf.desde + 1} folio(s); el set necesita 3.`);
    process.exit(1);
  }
  if (!sintetico && caf.rutEmisor !== env.SII_RUT_EMISOR) {
    console.error(`El CAF es del RUT ${caf.rutEmisor} y el emisor configurado es ${env.SII_RUT_EMISOR}.`);
    process.exit(1);
  }

  const cert = await cargarCertificado();
  if (!cert.rut) {
    console.error('No se pudo leer el RUT del certificado; RutEnvia quedaría vacío.');
    process.exit(1);
  }

  const fecha = new Date().toISOString().slice(0, 10);
  const caratula: Caratula = { fchResol: env.SII_FCH_RESOL, nroResol: env.SII_NRO_RESOL, rutEnvia: cert.rut };

  const boletas = boletasDelSet(caf.desde, fecha);
  const firmadas = boletas.map((b) => generarBoleta(b, caf, cert));
  const envio = construirEnvio(firmadas, 41, caratula, cert);
  const rcof = construirRcof({ fecha, secuenciaEnvio: 0, boletas }, caratula, cert);

  const salida = resolve(salidaArg ?? join('salida-sii', fecha + (sintetico ? '-sintetico' : '')));
  mkdirSync(salida, { recursive: true });
  // ISO-8859-1: es la codificación declarada en el XML y la que espera el SII.
  writeFileSync(join(salida, 'EnvioBOLETA.xml'), envio, 'latin1');
  writeFileSync(join(salida, 'RCOF.xml'), rcof, 'latin1');

  const resumen = [
    `Set de certificación boleta exenta — ${fecha}${sintetico ? ' (CAF SINTÉTICO, no subir)' : ''}`,
    `Emisor ${env.SII_RUT_EMISOR} · envía ${cert.rut} · resolución ${env.SII_NRO_RESOL} del ${env.SII_FCH_RESOL}`,
    `CAF tipo ${caf.tipoDte}, folios ${caf.desde}-${caf.hasta}`,
    '',
    ...boletas.map((b) => `  folio ${b.folio}  ${b.casoSet}  $${b.total.toLocaleString('es-CL')}  ${b.items.map((i) => `${i.cantidad}×${i.nombre}`).join(', ')}`),
    '',
    `Total del set: $${boletas.reduce((s, b) => s + b.total, 0).toLocaleString('es-CL')}`,
  ].join('\n');
  writeFileSync(join(salida, 'resumen.txt'), resumen, 'utf8');

  console.log(resumen);
  console.log(`\nArchivos en ${salida}:\n  EnvioBOLETA.xml (${envio.length} bytes)\n  RCOF.xml (${rcof.length} bytes)`);
  process.exit(0);
}

void main();
