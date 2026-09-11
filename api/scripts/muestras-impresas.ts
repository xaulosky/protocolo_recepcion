/**
 * Representaciones impresas de boletas electrónicas, para la certificación.
 *
 *   npm run sii:muestras -- set <EnvioBOLETA.xml> [salida]
 *       Imprime los documentos del set de pruebas que ya se envió al SII.
 *
 *   npm run sii:muestras -- reales <CAF.xml> <folio-inicial> [cuantas] [salida]
 *       Genera boletas que simulan operaciones reales del giro, las timbra con
 *       el CAF y las imprime. Son las "10 muestras" que pide la certificación.
 *
 * Deja un `.html` y, si hay Edge o Chrome instalado, el `.pdf` equivalente.
 * El PDF es lo que se adjunta al correo de certificación.
 */
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { env } from '../src/env.ts';
import { validarEmisor } from '../src/modules/boletas/emisor.ts';
import { cargarCertificado, parsearCaf } from '../src/modules/boletas/firma.ts';
import { generarBoleta } from '../src/modules/boletas/dte.ts';
import { desdeDte, paginaImpresa, type DatosImpresion } from '../src/modules/boletas/impresion.ts';
import { boletasDeMuestra } from '../src/modules/boletas/muestras.ts';

const ejecutar = promisify(execFile);

const NAVEGADORES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
];

/** Imprime el HTML a PDF con el navegador instalado; si no hay, avisa y sigue. */
async function aPdf(html: string, pdf: string): Promise<boolean> {
  const navegador = NAVEGADORES.find((p) => existsSync(p));
  if (!navegador) {
    console.warn('No se encontró Edge ni Chrome: queda sólo el HTML (imprimir a PDF a mano).');
    return false;
  }
  await ejecutar(navegador, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdf}`,
    `file:///${html.replace(/\\/g, '/')}`,
  ]);
  return existsSync(pdf);
}

/** Los DTE individuales que vienen dentro de un sobre EnvioBOLETA. */
function dtesDelSobre(xml: string): string[] {
  return xml.match(/<DTE[\s>][\s\S]*?<\/DTE>/g) ?? [];
}

async function main() {
  const [modo, ...resto] = process.argv.slice(2);
  if (modo !== 'set' && modo !== 'reales') {
    console.error('Uso: npm run sii:muestras -- set <EnvioBOLETA.xml> [salida]');
    console.error('     npm run sii:muestras -- reales <CAF.xml> <folio-inicial> [cuantas] [salida]');
    process.exit(2);
  }

  const problemas = validarEmisor();
  if (problemas.length) {
    console.error('La configuración del emisor no está lista:');
    for (const p of problemas) console.error('  -', p);
    process.exit(1);
  }

  let boletas: DatosImpresion[];
  let nombre: string;
  let salidaArg: string | undefined;

  if (modo === 'set') {
    const [sobreArg, salida] = resto;
    if (!sobreArg) process.exit(2);
    salidaArg = salida;
    nombre = 'set-de-pruebas';
    const sobre = readFileSync(resolve(sobreArg), 'latin1');
    const dtes = dtesDelSobre(sobre);
    if (!dtes.length) {
      console.error('El archivo no trae documentos <DTE>.');
      process.exit(1);
    }
    boletas = dtes.map(desdeDte);
  } else {
    const [cafArg, folioArg, cuantasArg, salida] = resto;
    if (!cafArg || !folioArg) process.exit(2);
    salidaArg = salida;
    nombre = 'muestras-impresas';

    const folioInicial = Number(folioArg);
    const cuantas = cuantasArg ? Number(cuantasArg) : 10;
    if (!Number.isInteger(folioInicial) || !Number.isInteger(cuantas)) {
      console.error('El folio inicial y la cantidad deben ser números enteros.');
      process.exit(1);
    }

    const caf = parsearCaf(readFileSync(resolve(cafArg), 'latin1'));
    if (caf.tipoDte !== 41) {
      console.error(`El CAF es de tipo ${caf.tipoDte}; las muestras son de boleta exenta (41).`);
      process.exit(1);
    }
    if (folioInicial < caf.desde || folioInicial + cuantas - 1 > caf.hasta) {
      console.error(`Los folios ${folioInicial}-${folioInicial + cuantas - 1} no caben en el CAF (${caf.desde}-${caf.hasta}).`);
      process.exit(1);
    }
    if (env.SII_SET_PRUEBAS) {
      // La referencia <CodRef>SET es del set de certificación; en una muestra
      // de operación real no corresponde.
      console.error('Apagá SII_SET_PRUEBAS para generar muestras: si no, cada boleta sale referenciando un caso del set.');
      process.exit(1);
    }

    const cert = await cargarCertificado();
    const fecha = new Date().toISOString().slice(0, 10);
    boletas = boletasDeMuestra(folioInicial, fecha, cuantas).map((b) => ({
      ...desdeDte(generarBoleta(b, caf, cert)),
      glosa: b.glosa,
    }));
  }

  const salida = resolve(salidaArg ?? join('salida-sii', `impresas-${new Date().toISOString().slice(0, 10)}`));
  mkdirSync(salida, { recursive: true });

  const html = await paginaImpresa(boletas, nombre);
  const rutaHtml = join(salida, `${nombre}.html`);
  const rutaPdf = join(salida, `${nombre}.pdf`);
  writeFileSync(rutaHtml, html, 'utf8');

  const hayPdf = await aPdf(rutaHtml, rutaPdf);

  console.log(`${boletas.length} boleta(s) impresas — folios ${boletas.map((b) => b.folio).join(', ')}`);
  console.log(`  ${rutaHtml}`);
  if (hayPdf) console.log(`  ${rutaPdf}`);
  console.log(`\nLeyenda de consulta impresa: ${env.SII_URL_CONSULTA}`);
  process.exit(0);
}

void main();
