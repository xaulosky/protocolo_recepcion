/**
 * Envío y consulta de boletas por la API REST del SII.
 *
 *   npm run sii:enviar -- token                     prueba semilla + token (no sube nada)
 *   npm run sii:enviar -- enviar <EnvioBOLETA.xml>  sube el sobre y guarda el trackid
 *   npm run sii:enviar -- estado <trackid>          consulta el resultado del envío
 *
 * Usa SII_AMBIENTE del .env para elegir certificación o producción, y el
 * certificado de SII_CERT_PATH tanto para firmar el token como para el
 * rutSender del envío (debe ser el mismo RUT que va en RutEnvia del sobre).
 *
 * `enviar` deja un `<archivo>.envio.json` al lado del XML con la respuesta del
 * SII: el trackid es lo que después se declara en la postulación.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from '../src/env.ts';
import { cargarCertificado } from '../src/modules/boletas/firma.ts';
import { consultarEnvio, enviarArchivo, obtenerToken, SiiError } from '../src/modules/boletas/envio-sii.ts';

function uso(): never {
  console.error('Uso: npm run sii:enviar -- token | enviar <EnvioBOLETA.xml> | estado <trackid>');
  process.exit(2);
}

async function main() {
  const [comando, arg] = process.argv.slice(2);
  if (!comando) uso();

  const cert = await cargarCertificado();
  console.log(
    `Ambiente ${env.SII_AMBIENTE} · emisor ${env.SII_RUT_EMISOR} · certificado de ${cert.rut} (vence ${cert.notAfter.toISOString().slice(0, 10)})`,
  );

  const token = await obtenerToken(cert);
  console.log(`Token obtenido: ${token.slice(0, 4)}…${token.slice(-2)}`);

  if (comando === 'token') return;

  if (comando === 'enviar') {
    if (!arg) uso();
    const ruta = resolve(arg);
    const r = await enviarArchivo(ruta, cert, token);
    writeFileSync(`${ruta}.envio.json`, JSON.stringify(r, null, 2));
    console.log('\nSII respondió:');
    console.log(`  trackid          ${r.trackid}`);
    console.log(`  estado           ${r.estado}`);
    console.log(`  fecha recepción  ${r.fecha_recepcion}`);
    console.log(`  archivo          ${r.file}`);
    console.log(`\nGuardado en ${ruta}.envio.json. Consultar con: npm run sii:enviar -- estado ${r.trackid}`);
    return;
  }

  if (comando === 'estado') {
    const trackid = Number(arg);
    if (!Number.isInteger(trackid)) uso();
    const e = await consultarEnvio(env.SII_RUT_EMISOR, trackid, token);
    console.log(`\nEnvío ${e.trackid}: estado ${e.estado} (recibido ${e.fecha_recepcion})`);
    for (const s of e.estadistica ?? []) {
      console.log(
        `  tipo ${s.tipo}: ${s.informados} informados · ${s.aceptados} aceptados · ${s.reparos} con reparos · ${s.rechazados} rechazados`,
      );
    }
    for (const d of e.detalle_rep_rech ?? []) {
      console.log(`  folio ${d.folio} ${d.estado} — ${d.descripcion}`);
      for (const err of d.error ?? []) {
        console.log(`     [${err.seccion}:${err.linea}] nivel ${err.nivel} cod ${err.codigo}: ${err.descripcion} ${err.detalle ?? ''}`);
      }
    }
    console.log('\nRespuesta completa:\n' + JSON.stringify(e, null, 2));
    return;
  }

  uso();
}

main().catch((e) => {
  if (e instanceof SiiError) {
    console.error(`\nError del SII: ${e.message}`);
    if (e.detalle) console.error(String(e.detalle).slice(0, 1500));
  } else {
    console.error(e);
  }
  process.exit(1);
});
