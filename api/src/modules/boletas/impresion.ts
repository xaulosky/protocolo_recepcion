import bwipjs from 'bwip-js/node';
import { DOMParser, type Document as XDocument, type Element as XElement } from '@xmldom/xmldom';
import { env } from '../../env.ts';

/**
 * Representación impresa de la boleta electrónica.
 *
 * El SII no valida sólo el XML: exige que el papel que recibe el cliente lleve
 * los datos del emisor, el documento en palabras, el detalle, y el timbre
 * electrónico como código de barras PDF417 con el contenido del TED. Debajo del
 * timbre va la leyenda con el sitio donde el cliente puede consultar su boleta
 * — el SII comprueba que esa URL exista antes de autorizar (ver
 * docs/sii/certificacion-boletas.md).
 *
 * Se genera del lado del servidor porque el timbre sale del TED firmado, que
 * vive en el DTE y no tiene por qué viajar al navegador.
 */

export interface ItemImpreso {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface DatosImpresion {
  tipoDte: 39 | 41;
  folio: number;
  fechaEmision: string;
  items: ItemImpreso[];
  neto: number;
  iva: number;
  exento: number;
  total: number;
  /** TED completo (`<TED …>…</TED>`), tal cual quedó firmado en el DTE. */
  ted: string;
  /** Sólo para las muestras: qué operación simula. */
  glosa?: string;
}

const TIPO_EN_PALABRAS: Record<39 | 41, string> = {
  39: 'BOLETA ELECTRÓNICA',
  41: 'BOLETA NO AFECTA O EXENTA ELECTRÓNICA',
};

/** Ancho con que se imprime el timbre; de él sale el tamaño del módulo. */
const TIMBRE_ANCHO_MM = 68;

/**
 * El PDF417 del timbre: el TED tal cual, sin reformatear.
 *
 * Parámetros del instructivo del SII (columnas entre 6 y 18, nivel de
 * corrección 5). Con 12 columnas el módulo queda en ~0,25 mm impreso a 68 mm,
 * que una térmica de 203 dpi resuelve en dos puntos; con menos columnas el
 * código se vuelve más alto de lo que conviene en un rollo.
 *
 * `backgroundcolor` no es cosmético: sin él bwip-js deja el fondo
 * transparente, y sobre fondo oscuro —o convertido a escala de grises— el
 * código deja de leerse por completo.
 */
export async function timbrePdf417(ted: string): Promise<string> {
  // `columns` y `eclevel` son opciones propias del PDF417 que bwip-js pasa al
  // renderizador; sus tipos sólo declaran las comunes a todos los códigos.
  const opciones = {
    bcid: 'pdf417',
    text: ted,
    columns: 12,
    eclevel: 5,
    scaleX: 2,
    scaleY: 2,
    padding: 2,
    backgroundcolor: 'FFFFFF',
    // Sin texto legible: el TED no se lee a ojo.
    includetext: false,
  } as Parameters<typeof bwipjs.toBuffer>[0];

  const png = (await bwipjs.toBuffer(opciones)) as unknown as Buffer;
  return `data:image/png;base64,${png.toString('base64')}`;
}

function texto(nodo: XElement | XDocument, etiqueta: string): string {
  return nodo.getElementsByTagName(etiqueta)[0]?.textContent?.trim() ?? '';
}

/** Extrae de un DTE ya firmado lo que necesita la representación impresa. */
export function desdeDte(xml: string): DatosImpresion {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const enc = doc.getElementsByTagName('Encabezado')[0];
  if (!enc) throw new Error('El XML no parece un DTE: no tiene <Encabezado>');

  const num = (n: XElement | XDocument, etiqueta: string) => Number(texto(n, etiqueta) || 0);

  const items: ItemImpreso[] = Array.from(doc.getElementsByTagName('Detalle')).map((d) => ({
    nombre: texto(d, 'NmbItem'),
    cantidad: num(d, 'QtyItem') || 1,
    precio: num(d, 'PrcItem'),
  }));

  // El TED se toma del texto literal: reserializarlo cambiaría los bytes que
  // el SII firmó y el lector del timbre vería un documento distinto.
  const ted = /<TED[\s>][\s\S]*?<\/TED>/.exec(xml)?.[0];
  if (!ted) throw new Error('El DTE no trae <TED>: sin timbre no hay representación impresa válida');

  return {
    tipoDte: num(enc, 'TipoDTE') as 39 | 41,
    folio: num(enc, 'Folio'),
    fechaEmision: texto(enc, 'FchEmis'),
    items,
    neto: num(enc, 'MntNeto'),
    iva: num(enc, 'IVA'),
    exento: num(enc, 'MntExe'),
    total: num(enc, 'MntTotal'),
    ted,
  };
}

const pesos = (n: number) => `$${n.toLocaleString('es-CL')}`;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Un recibo, con el recuadro rojo reglamentario y el timbre al pie. */
function recibo(b: DatosImpresion, timbre: string): string {
  const e = {
    rut: env.SII_RUT_EMISOR,
    razonSocial: env.SII_RAZON_SOCIAL,
    giro: env.SII_GIRO,
    direccion: `${env.SII_DIR_ORIGEN}, ${env.SII_CMNA_ORIGEN}`,
  };

  const lineas = b.items
    .map(
      (i) => `<tr>
        <td class="desc">${esc(i.nombre)}${i.cantidad > 1 ? `<br><span class="sub">${i.cantidad} × ${pesos(i.precio)}</span>` : ''}</td>
        <td class="monto">${pesos(i.precio * i.cantidad)}</td>
      </tr>`,
    )
    .join('');

  const totales = [
    b.exento > 0 ? ['Monto exento', b.exento] : null,
    b.neto > 0 ? ['Monto neto', b.neto] : null,
    b.iva > 0 ? ['IVA 19%', b.iva] : null,
  ].filter((x): x is [string, number] => x !== null);

  return `<section class="boleta">
  <div class="emisor">
    <div class="razon">${esc(e.razonSocial)}</div>
    <div class="sub">${esc(e.giro)}</div>
    <div class="sub">${esc(e.direccion)}</div>
  </div>

  <div class="recuadro">
    <div class="rut">R.U.T.: ${esc(e.rut)}</div>
    <div class="tipo">${TIPO_EN_PALABRAS[b.tipoDte]}</div>
    <div class="folio">N° ${b.folio}</div>
    <div class="unidad">S.I.I. - ${esc(env.SII_CIUDAD_ORIGEN)}</div>
  </div>

  <div class="fecha">Fecha de emisión: ${esc(b.fechaEmision)}</div>
  ${b.glosa ? `<div class="fecha">${esc(b.glosa)}</div>` : ''}

  <table class="detalle">
    <thead><tr><th class="desc">Detalle</th><th class="monto">Valor</th></tr></thead>
    <tbody>${lineas}</tbody>
  </table>

  <table class="totales">
    ${totales.map(([n, v]) => `<tr><td>${n}</td><td class="monto">${pesos(v)}</td></tr>`).join('')}
    <tr class="total"><td>TOTAL</td><td class="monto">${pesos(b.total)}</td></tr>
  </table>

  <div class="timbre">
    <img src="${timbre}" alt="Timbre electrónico SII">
    <div class="leyenda">Timbre Electrónico SII</div>
    <div class="leyenda">Verifique documento: ${esc(env.SII_URL_CONSULTA)}</div>
  </div>
</section>`;
}

/**
 * Documento HTML con una boleta por página, listo para imprimir a PDF.
 *
 * Ancho de rollo térmico (80 mm) y alto automático: es el formato en que salen
 * de verdad por la impresora de caja, que es lo que el SII quiere ver.
 */
export async function paginaImpresa(boletas: DatosImpresion[], titulo: string): Promise<string> {
  const timbres = await Promise.all(boletas.map((b) => timbrePdf417(b.ted)));

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(titulo)}</title>
<style>
  /* Chrome sólo respeta un tamaño de página concreto: 'auto' cae en carta. */
  @page { size: 80mm 200mm; margin: 4mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #000; background: #fff; font-size: 9pt; }
  .boleta { width: 72mm; margin: 0 auto; padding-bottom: 6mm; break-after: page; }
  .boleta:last-child { break-after: auto; }
  .emisor { text-align: center; margin-bottom: 3mm; }
  .razon { font-size: 11pt; font-weight: 700; }
  .sub { font-size: 8pt; color: #333; }
  .recuadro { border: 2px solid #c00; color: #c00; text-align: center; padding: 2mm; margin-bottom: 3mm; }
  .recuadro .rut, .recuadro .folio { font-weight: 700; font-size: 10pt; }
  .recuadro .tipo { font-size: 8.5pt; font-weight: 700; margin: 1mm 0; }
  .recuadro .unidad { font-size: 7.5pt; }
  .fecha { font-size: 8pt; margin-bottom: 1mm; }
  table { width: 100%; border-collapse: collapse; }
  .detalle { margin-top: 2mm; border-top: 1px solid #000; border-bottom: 1px solid #000; }
  .detalle th { text-align: left; font-size: 8pt; padding: 1mm 0; border-bottom: 1px solid #999; }
  .detalle td { padding: 1mm 0; vertical-align: top; font-size: 8.5pt; }
  .detalle .sub { font-size: 7.5pt; }
  .monto { text-align: right; white-space: nowrap; }
  .totales { margin-top: 2mm; font-size: 8.5pt; }
  .totales .total td { font-weight: 700; font-size: 10pt; border-top: 1px solid #000; padding-top: 1mm; }
  .timbre { margin-top: 4mm; text-align: center; }
  .timbre img { width: ${TIMBRE_ANCHO_MM}mm; }
  .leyenda { font-size: 7pt; margin-top: 1mm; }
</style>
</head>
<body>
${boletas.map((b, i) => recibo(b, timbres[i])).join('\n')}
</body>
</html>`;
}
