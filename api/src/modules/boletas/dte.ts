import { createHash } from 'node:crypto';
import { C14nCanonicalization } from 'xml-crypto';
import { DOMParser, XMLSerializer, type Node as XNode } from '@xmldom/xmldom';
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

  // El DTE declara xmlns:xsi aunque no lo use: dentro del sobre EnvioBOLETA
  // ese prefijo está en alcance (la raíz lleva xsi:schemaLocation, que el
  // uploader del SII exige para identificar el esquema), y la C14N 1.0 emite
  // en el nodo firmado TODOS los namespaces en alcance. Declararlo también
  // aquí deja al DTE suelto con el mismo conjunto en alcance que embebido, así
  // el digest firmado suelto coincide con el que el SII calcula ya embebido.
  const xml =
    `<DTE version="1.0" xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="${NS_XSI}">` +
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

const NS_DSIG = 'http://www.w3.org/2000/09/xmldsig#';
export const NS_XSI = 'http://www.w3.org/2001/XMLSchema-instance';

/**
 * Canonicalización inclusiva (C14N 1.0) de un nodo, como la hará el SII.
 *
 * Se re-serializa el nodo en un documento propio y se canonicaliza como raíz.
 * Para que equivalga a la c14n EN CONTEXTO hay que reproducir en el ápice
 * todos los namespaces que el nodo tiene en alcance dentro del documento
 * final: el serializador re-emite el namespace por defecto (lo necesitan los
 * nombres de los elementos), pero omite un prefijo que no se usa, como xsi.
 * C14N 1.0 sí lo emite en el ápice, así que se inyecta a mano. En estos
 * documentos el conjunto en alcance es siempre {defecto, xsi}, declarado en
 * la raíz del sobre, del DTE y del RCOF.
 *
 * `conXsi: false` es para documentos donde xsi NO está en alcance (el getToken
 * de la API, sin namespace alguno): inyectarlo ahí cambiaría los bytes.
 */
export function canonicalizar(nodo: XNode, { conXsi = true } = {}): string {
  let serializado = new XMLSerializer().serializeToString(nodo);
  const finTag = serializado.indexOf('>');
  const primerTag = serializado.slice(0, finTag);
  if (conXsi && !/\sxmlns:xsi=/.test(primerTag)) {
    serializado = `${primerTag} xmlns:xsi="${NS_XSI}"${serializado.slice(finTag)}`;
  }
  const solo = new DOMParser().parseFromString(serializado, 'text/xml');
  return new C14nCanonicalization().process(solo.documentElement as XNode, {}) as string;
}

/**
 * Largo máximo de línea que tolera el parser del SII. Un envío con una línea
 * más larga vuelve como "CHR-00002: Line too long (4090)" —o, en el uploader
 * web, como un SCH-00001 que despista—, así que los documentos se generan con
 * un elemento por línea y el base64 de las firmas partido a 76 columnas.
 */
const LARGO_MAX_LINEA = 4000;

/** Parte un base64 en líneas de 76 columnas (XMLDSig admite blancos dentro). */
function partirBase64(b64: string): string {
  return b64.replace(/(.{76})/g, '$1\n');
}

/**
 * Un elemento por línea. El TED se deja intacto: su <DD> se firmó como string
 * literal y el CAF viene tal cual del SII, cualquier blanco extra los invalida.
 */
export function conSaltosDeLinea(xml: string): string {
  return xml
    .split(/(<TED[\s\S]*?<\/TED>)/)
    .map((parte, i) => (i % 2 ? parte : parte.replace(/></g, '>\n<')))
    .join('');
}

/** Lanza si alguna línea supera lo que el SII acepta. */
export function verificarLargoDeLineas(xml: string): void {
  const larga = xml.split('\n').find((l) => l.length > LARGO_MAX_LINEA);
  if (larga) {
    throw new Error(`Línea de ${larga.length} caracteres; el SII rechaza sobre ${LARGO_MAX_LINEA}: ${larga.slice(0, 60)}…`);
  }
}

/**
 * Firma un fragmento XML con XMLDSig según el perfil del SII: SHA-1, RSA-SHA1,
 * C14N 1.0 y un ÚNICO transform enveloped-signature por referencia. La firma
 * queda como último hijo de `nodoPadre`, hermana del nodo referenciado.
 *
 * Se arma a mano en vez de delegar en SignedXml.computeSignature por un
 * comportamiento de xml-crypto que el SII no perdona: cuando la referencia
 * lleva sólo enveloped-signature, hashea la serialización CRUDA del nodo en
 * vez de aplicar la C14N 1.0 implícita que exige XMLDSig (atributos sin
 * ordenar tras el xmlns, declaraciones redundantes conservadas). Con un
 * transform c14n explícito lo hace bien, pero xmldsignature_v10.xsd admite un
 * solo <Transform>. La clase C14nCanonicalization sí es correcta —produce los
 * mismos bytes que libxml2—, así que se usa directamente.
 *
 * Con `referenciaId` vacío la referencia es `URI=""` (el documento completo):
 * es lo que pide el getToken de la API. Ahí la firma sí queda DENTRO del nodo
 * referenciado, pero como se calcula el digest antes de insertarla, el
 * resultado es el mismo que aplicar enveloped-signature.
 */
export function firmarXml(
  xml: string,
  referenciaId: string,
  cert: Certificado,
  nodoPadre: string,
  { conXsi = true, enLineas = true } = {},
): string {
  // Separador entre elementos de la firma. El getToken de la API va compacto:
  // su parser exige la firma en la misma línea que el documento.
  const nl = enLineas ? '\n' : '';
  const b64 = enLineas ? partirBase64 : (s: string) => s;
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const referenciado = referenciaId
    ? Array.from(doc.getElementsByTagName('*')).find((e) => e.getAttribute('ID') === referenciaId)
    : doc.documentElement;
  if (!referenciado) throw new Error(`No existe un nodo con ID="${referenciaId}" para firmar`);

  // La firma será hermana del nodo referenciado, así que enveloped-signature
  // no tiene nada que quitar de su subárbol: el digest va sobre el nodo tal cual.
  const digest = createHash('sha1')
    .update(canonicalizar(referenciado as XNode, { conXsi }), 'utf8')
    .digest('base64');

  // Los blancos entre elementos forman parte de lo que se canonicaliza y firma:
  // el string que se inserta en el documento es el mismo que se firma.
  const signedInfo =
    `<SignedInfo>${nl}` +
    `<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>${nl}` +
    `<SignatureMethod Algorithm="${NS_DSIG}rsa-sha1"/>${nl}` +
    `<Reference URI="${referenciaId ? '#' + referenciaId : ''}">${nl}` +
    `<Transforms>${nl}<Transform Algorithm="${NS_DSIG}enveloped-signature"/>${nl}</Transforms>${nl}` +
    `<DigestMethod Algorithm="${NS_DSIG}sha1"/>${nl}` +
    `<DigestValue>${digest}</DigestValue>${nl}` +
    `</Reference>${nl}` +
    `</SignedInfo>`;

  // Se canonicaliza con el namespace que heredará de <Signature> en el documento
  // final: es exactamente lo que canonicalizará el verificador.
  const signedInfoCanon = canonicalizar(
    new DOMParser().parseFromString(signedInfo.replace('<SignedInfo>', `<SignedInfo xmlns="${NS_DSIG}">`), 'text/xml')
      .documentElement as XNode,
    { conXsi },
  );
  const firma = firmarSha1(signedInfoCanon, cert.key);

  const signature =
    `<Signature xmlns="${NS_DSIG}">${nl}` +
    signedInfo +
    `${nl}<SignatureValue>${nl}${b64(firma)}${nl}</SignatureValue>${nl}` +
    `<KeyInfo>${nl}` +
    `<KeyValue>${nl}<RSAKeyValue>${nl}<Modulus>${nl}${b64(cert.modulusBase64)}${nl}</Modulus>${nl}` +
    `<Exponent>${cert.exponentBase64}</Exponent>${nl}</RSAKeyValue>${nl}</KeyValue>${nl}` +
    `<X509Data>${nl}<X509Certificate>${nl}${b64(cert.certBase64)}${nl}</X509Certificate>${nl}</X509Data>${nl}` +
    `</KeyInfo>${nl}` +
    `</Signature>`;

  const cierre = `</${nodoPadre}>`;
  const pos = xml.lastIndexOf(cierre);
  if (pos < 0) throw new Error(`No se encontró el cierre de <${nodoPadre}> para insertar la firma`);
  const firmado = xml.slice(0, pos) + signature + nl + xml.slice(pos);
  if (enLineas) verificarLargoDeLineas(firmado);
  return firmado;
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
    // xsi:schemaLocation NO es opcional para el SII: su uploader identifica el
    // esquema por este atributo y sin él rechaza con SCH-00001 "Invalid Schema
    // Name", antes siquiera de mirar firmas o folios. Un validador XSD genérico
    // lo trata como pista y por eso el XSD validaba sin él; el SII no.
    `<EnvioBOLETA xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="${NS_XSI}" ` +
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
    // Cada DTE va embebido TAL CUAL se firmó, con sus declaraciones xmlns y
    // xmlns:xsi aunque dentro del sobre sean redundantes. El SII verifica la
    // firma de cada DTE extrayéndolo literalmente del sobre (<DTE>…</DTE>) y
    // canonicalizando ese fragmento suelto: sólo cuentan los namespaces que el
    // fragmento declara por sí mismo. Quitarlos deja al Documento sin
    // namespaces al extraerlo y el digest ya no coincide: "505 Firma DTE
    // Incorrecta" (trackid 32153177). Para el digest del sobre no cambia nada:
    // C14N 1.0 omite en <DTE> las declaraciones iguales a las del ancestro.
    dtesFirmados.map((d) => d.replace(/^<\?xml[^>]*\?>\s*/, '')).join('') +
    `</SetDTE>` +
    `</EnvioBOLETA>`;

  return firmarXml(conSaltosDeLinea(sobre), 'SetDoc', cert, 'EnvioBOLETA');
}

/** Genera un DTE completo y firmado. */
export function generarBoleta(datos: DatosBoleta, caf: Caf, cert: Certificado): string {
  const { xml, id } = construirDocumento(datos, caf);
  return firmarXml(conSaltosDeLinea(xml), id, cert, 'DTE');
}
