import { SignedXml } from 'xml-crypto';
import { env } from '../../env.ts';
import { datosEmisor } from './emisor.ts';
import { firmarSha1, type Caf, type Certificado } from './firma.ts';

/**
 * Generación del XML de boleta electrónica según `EnvioBOLETA_v11.xsd`
 * (ver api/docs/sii/).
 *
 * Ojo con un detalle que cuesta caro: las boletas usan nombres de campo
 * PROPIOS, distintos a los de factura. Son `RznSocEmisor` y `GiroEmisor`, no
 * `RznSoc`/`GiroEmis`, y el emisor de una boleta NO lleva `Acteco`. Usar el
 * formato de factura hace que el documento no valide contra el esquema.
 */

/** RUT genérico que el SII define para el consumidor final. */
const RUT_CONSUMIDOR_FINAL = '66666666-6';
/** RUT del propio SII, receptor de todos los envíos. */
export const RUT_SII = '60803000-K';

export interface ItemBoleta {
  nombre: string;
  cantidad: number;
  /** Precio unitario en pesos. */
  precio: number;
  /** Unidad de medida — el esquema admite máximo 4 caracteres. */
  unidad?: string;
  /** Referencia al caso del set durante la certificación (CASO-1, CASO-2…). */
}

export interface DatosBoleta {
  tipoDte: 39 | 41;
  folio: number;
  fechaEmision: string; // YYYY-MM-DD
  items: ItemBoleta[];
  /** Montos ya calculados (ver montos.ts). */
  neto: number;
  iva: number;
  exento: number;
  total: number;
  /** Sólo en certificación: caso del set que representa este documento. */
  casoSet?: string;
}

/** Escapa lo que va como texto dentro del XML. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Recorta al máximo que admite el esquema, sin cortar a mitad de palabra. */
function recortar(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max).trim();
}

/**
 * Construye el TED (timbre electrónico).
 *
 * El `<DD>` se arma como una sola línea sin espacios entre etiquetas: se firma
 * el string literal, así que cualquier salto de línea o indentación cambia la
 * firma y el SII la rechaza. El `<CAF>` va incrustado EXACTAMENTE como vino
 * del SII, por la misma razón: lleva su propia firma encima.
 */
export function construirTed(datos: DatosBoleta, caf: Caf): string {
  const e = datosEmisor();
  const primerItem = recortar(datos.items[0]?.nombre ?? 'Servicio', 40);

  const dd =
    `<DD>` +
    `<RE>${e.rut}</RE>` +
    `<TD>${datos.tipoDte}</TD>` +
    `<F>${datos.folio}</F>` +
    `<FE>${datos.fechaEmision}</FE>` +
    `<RR>${RUT_CONSUMIDOR_FINAL}</RR>` +
    `<RSR>${esc(recortar('Consumidor Final', 40))}</RSR>` +
    `<MNT>${datos.total}</MNT>` +
    `<IT1>${esc(primerItem)}</IT1>` +
    caf.xml +
    `<TSTED>${marcaDeTiempo()}</TSTED>` +
    `</DD>`;

  const firma = firmarSha1(dd, caf.key);
  return `<TED version="1.0">${dd}<FRMT algoritmo="SHA1withRSA">${firma}</FRMT></TED>`;
}

/** Fecha-hora local sin zona, como la espera el SII (AAAA-MM-DDTHH:MM:SS). */
export function marcaDeTiempo(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Bloque <Totales>. En una boleta exenta no van ni neto ni IVA. */
function totales(d: DatosBoleta): string {
  const partes: string[] = [];
  if (d.tipoDte === 39) {
    if (d.neto > 0) partes.push(`<MntNeto>${d.neto}</MntNeto>`);
    if (d.exento > 0) partes.push(`<MntExe>${d.exento}</MntExe>`);
    if (d.iva > 0) partes.push(`<IVA>${d.iva}</IVA>`);
  } else {
    // Tipo 41: todo el documento es exento.
    partes.push(`<MntExe>${d.exento || d.total}</MntExe>`);
  }
  partes.push(`<MntTotal>${d.total}</MntTotal>`);
  return `<Totales>${partes.join('')}</Totales>`;
}

function detalle(items: ItemBoleta[]): string {
  return items
    .map((it, i) => {
      const monto = Math.round(it.precio * it.cantidad);
      const unidad = it.unidad ? `<UnmdItem>${esc(recortar(it.unidad, 4))}</UnmdItem>` : '';
      return (
        `<Detalle>` +
        `<NroLinDet>${i + 1}</NroLinDet>` +
        `<NmbItem>${esc(recortar(it.nombre, 80))}</NmbItem>` +
        `<QtyItem>${it.cantidad}</QtyItem>` +
        unidad +
        `<PrcItem>${it.precio}</PrcItem>` +
        `<MontoItem>${monto}</MontoItem>` +
        `</Detalle>`
      );
    })
    .join('');
}

/**
 * Documento sin firmar. La firma se agrega después porque XMLDSig calcula el
 * digest sobre este contenido exacto.
 */
export function construirDocumento(datos: DatosBoleta, caf: Caf): { xml: string; id: string } {
  const e = datosEmisor();
  const id = `F${datos.folio}T${datos.tipoDte}`;

  const emisor =
    `<Emisor>` +
    `<RUTEmisor>${e.rut}</RUTEmisor>` +
    `<RznSocEmisor>${esc(recortar(e.razonSocial, 100))}</RznSocEmisor>` +
    `<GiroEmisor>${esc(recortar(e.giro, 80))}</GiroEmisor>` +
    `<DirOrigen>${esc(recortar(e.dirOrigen, 70))}</DirOrigen>` +
    `<CmnaOrigen>${esc(recortar(e.cmnaOrigen, 20))}</CmnaOrigen>` +
    `<CiudadOrigen>${esc(recortar(e.ciudadOrigen, 20))}</CiudadOrigen>` +
    `</Emisor>`;

  // Durante la certificación cada documento declara qué caso del set representa.
  const referencia =
    env.SII_SET_PRUEBAS && datos.casoSet
      ? `<Referencia><NroLinRef>1</NroLinRef><CodRef>SET</CodRef><RazonRef>${esc(recortar(datos.casoSet, 90))}</RazonRef></Referencia>`
      : '';

  const xml =
    `<DTE version="1.0" xmlns="http://www.sii.cl/SiiDte">` +
    `<Documento ID="${id}">` +
    `<Encabezado>` +
    `<IdDoc>` +
    `<TipoDTE>${datos.tipoDte}</TipoDTE>` +
    `<Folio>${datos.folio}</Folio>` +
    `<FchEmis>${datos.fechaEmision}</FchEmis>` +
    `<IndServicio>3</IndServicio>` +
    `</IdDoc>` +
    emisor +
    `<Receptor><RUTRecep>${RUT_CONSUMIDOR_FINAL}</RUTRecep><RznSocRecep>Consumidor Final</RznSocRecep></Receptor>` +
    totales(datos) +
    `</Encabezado>` +
    detalle(datos.items) +
    referencia +
    construirTed(datos, caf) +
    `<TmstFirma>${marcaDeTiempo()}</TmstFirma>` +
    `</Documento>` +
    `</DTE>`;

  return { xml, id };
}

/**
 * Firma un fragmento XML con XMLDSig, como lo exige el SII: SHA-1, RSA-SHA1 y
 * transformación enveloped. La firma queda como hermana del nodo firmado.
 */
export function firmarXml(xml: string, referenciaId: string, cert: Certificado, nodoPadre: string): string {
  const sig = new SignedXml({
    privateKey: cert.key,
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  });

  sig.addReference({
    xpath: `//*[@ID='${referenciaId}']`,
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    uri: `#${referenciaId}`,
  });

  // El SII espera el certificado y la llave pública dentro de <KeyInfo>.
  sig.getKeyInfoContent = () =>
    `<KeyValue><RSAKeyValue><Modulus>${cert.modulusBase64}</Modulus><Exponent>${cert.exponentBase64}</Exponent></RSAKeyValue></KeyValue>` +
    `<X509Data><X509Certificate>${cert.certBase64}</X509Certificate></X509Data>`;

  sig.computeSignature(xml, {
    location: { reference: `//*[local-name(.)='${nodoPadre}']`, action: 'append' },
  });

  return sig.getSignedXml();
}

export interface Caratula {
  fchResol: string;
  nroResol: number;
  rutEnvia: string;
}

/**
 * Arma el sobre EnvioBOLETA con uno o más DTE ya firmados.
 *
 * El SII exige DOS firmas: cada DTE va firmado por separado y el sobre completo
 * lleva la suya. Una sola no basta.
 */
export function construirEnvio(
  dtesFirmados: string[],
  tipoDte: 39 | 41,
  caratula: Caratula,
  cert: Certificado,
): string {
  const e = datosEmisor();

  const sobre =
    `<?xml version="1.0" encoding="ISO-8859-1"?>` +
    `<EnvioBOLETA xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xsi:schemaLocation="http://www.sii.cl/SiiDte EnvioBOLETA_v11.xsd" version="1.0">` +
    `<SetDTE ID="SetDoc">` +
    `<Caratula version="1.0">` +
    `<RutEmisor>${e.rut}</RutEmisor>` +
    `<RutEnvia>${caratula.rutEnvia}</RutEnvia>` +
    `<RutReceptor>${RUT_SII}</RutReceptor>` +
    `<FchResol>${caratula.fchResol}</FchResol>` +
    `<NroResol>${caratula.nroResol}</NroResol>` +
    `<TmstFirmaEnv>${marcaDeTiempo()}</TmstFirmaEnv>` +
    `<SubTotDTE><TpoDTE>${tipoDte}</TpoDTE><NroDTE>${dtesFirmados.length}</NroDTE></SubTotDTE>` +
    `</Caratula>` +
    dtesFirmados.map((d) => d.replace(/^<\?xml[^>]*\?>/, '')).join('') +
    `</SetDTE>` +
    `</EnvioBOLETA>`;

  return firmarXml(sobre, 'SetDoc', cert, 'EnvioBOLETA');
}

/** Genera un DTE completo y firmado. */
export function generarBoleta(datos: DatosBoleta, caf: Caf, cert: Certificado): string {
  const { xml, id } = construirDocumento(datos, caf);
  return firmarXml(xml, id, cert, 'DTE');
}
