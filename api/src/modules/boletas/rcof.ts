import { datosEmisor } from './emisor.ts';
import { conSaltosDeLinea, firmarXml, marcaDeTiempo, NS_XSI, type Caratula, type DatosBoleta } from './dte.ts';
import type { Certificado } from './firma.ts';

/**
 * Reporte de Consumo de Folios (RCOF) según `ConsumoFolio_v10.xsd`.
 *
 * Es un documento aparte del sobre de boletas: resume, por día y por tipo de
 * documento, cuántos folios se emitieron, cuáles se anularon y los montos
 * totales. El SII lo exige diariamente, y en la certificación lo pide junto
 * con el set para comprobar que el sistema es capaz de generarlo a tiempo.
 *
 * Se firma igual que el sobre: XMLDSig sobre `DocumentoConsumoFolios`, con la
 * firma como hermana del nodo referenciado.
 */

export interface DatosRcof {
  /** Día que cubre el reporte (YYYY-MM-DD). Para el set, el de emisión. */
  fecha: string;
  /**
   * Correlativo del envío dentro del día, desde 0. Si un mismo día se manda
   * más de un reporte (p. ej. una corrección), se incrementa.
   */
  secuenciaEnvio: number;
  boletas: DatosBoleta[];
  /** Folios anulados ese día, si los hay. */
  anulados?: { tipoDte: 39 | 41; folio: number }[];
  /**
   * Tipos que deben aparecer aunque no hayan tenido movimiento.
   *
   * El reporte es diario y obligatorio también los días sin ventas, en cuyo
   * caso va con valores en cero — y el esquema exige al menos un `<Resumen>`,
   * así que sin esto un día sin boletas produce un XML inválido.
   */
  tiposInformados?: (39 | 41)[];
}

/** Rangos contiguos [inicial, final] a partir de una lista de folios. */
function rangos(folios: number[]): Array<[number, number]> {
  const orden = [...new Set(folios)].sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  for (const f of orden) {
    const ultimo = out[out.length - 1];
    if (ultimo && f === ultimo[1] + 1) ultimo[1] = f;
    else out.push([f, f]);
  }
  return out;
}

/** Un bloque <Resumen> por tipo de documento presente. */
function resumenes(datos: DatosRcof): string {
  const tipos = [...new Set([
    ...datos.boletas.map((b) => b.tipoDte),
    ...(datos.anulados ?? []).map((a) => a.tipoDte),
    ...(datos.tiposInformados ?? []),
  ])].sort();

  return tipos
    .map((tipo) => {
      const emitidas = datos.boletas.filter((b) => b.tipoDte === tipo);
      const anulados = (datos.anulados ?? []).filter((a) => a.tipoDte === tipo).map((a) => a.folio);

      const neto = emitidas.reduce((s, b) => s + b.neto, 0);
      const iva = emitidas.reduce((s, b) => s + b.iva, 0);
      const exento = emitidas.reduce((s, b) => s + b.exento, 0);
      const total = emitidas.reduce((s, b) => s + b.total, 0);

      // En boletas afectas se informan neto, IVA y tasa; en exentas sólo el
      // exento. Un campo en cero fuera de lugar es motivo de rechazo.
      const montos =
        tipo === 39
          ? `<MntNeto>${neto}</MntNeto><MntIva>${iva}</MntIva><TasaIVA>19</TasaIVA>` +
            (exento > 0 ? `<MntExento>${exento}</MntExento>` : '')
          : `<MntExento>${exento}</MntExento>`;

      // Un día sin movimiento va igual, con todo en cero y sin rangos.
      if (!emitidas.length && !anulados.length) {
        return (
          `<Resumen>` +
          `<TipoDocumento>${tipo}</TipoDocumento>` +
          montos +
          `<MntTotal>0</MntTotal>` +
          `<FoliosEmitidos>0</FoliosEmitidos>` +
          `<FoliosAnulados>0</FoliosAnulados>` +
          `<FoliosUtilizados>0</FoliosUtilizados>` +
          `</Resumen>`
        );
      }

      const utilizados = rangos(emitidas.map((b) => b.folio))
        .map(([i, f]) => `<RangoUtilizados><Inicial>${i}</Inicial><Final>${f}</Final></RangoUtilizados>`)
        .join('');
      const anuladosXml = rangos(anulados)
        .map(([i, f]) => `<RangoAnulados><Inicial>${i}</Inicial><Final>${f}</Final></RangoAnulados>`)
        .join('');

      return (
        `<Resumen>` +
        `<TipoDocumento>${tipo}</TipoDocumento>` +
        montos +
        `<MntTotal>${total}</MntTotal>` +
        `<FoliosEmitidos>${emitidas.length}</FoliosEmitidos>` +
        `<FoliosAnulados>${anulados.length}</FoliosAnulados>` +
        `<FoliosUtilizados>${emitidas.length + anulados.length}</FoliosUtilizados>` +
        utilizados +
        anuladosXml +
        `</Resumen>`
      );
    })
    .join('');
}

/** Genera el RCOF firmado. */
export function construirRcof(datos: DatosRcof, caratula: Caratula, cert: Certificado): string {
  const e = datosEmisor();
  const id = `RCOF-${datos.fecha.replace(/-/g, '')}-${datos.secuenciaEnvio}`;

  const xml =
    `<?xml version="1.0" encoding="ISO-8859-1"?>` +
    // xsi:schemaLocation es obligatorio para el uploader del SII (ver dte.ts).
    `<ConsumoFolios xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="${NS_XSI}" ` +
    `xsi:schemaLocation="http://www.sii.cl/SiiDte ConsumoFolio_v10.xsd" version="1.0">` +
    `<DocumentoConsumoFolios ID="${id}">` +
    `<Caratula version="1.0">` +
    `<RutEmisor>${e.rut}</RutEmisor>` +
    `<RutEnvia>${caratula.rutEnvia}</RutEnvia>` +
    `<FchResol>${caratula.fchResol}</FchResol>` +
    `<NroResol>${caratula.nroResol}</NroResol>` +
    `<FchInicio>${datos.fecha}</FchInicio>` +
    `<FchFinal>${datos.fecha}</FchFinal>` +
    `<SecEnvio>${datos.secuenciaEnvio}</SecEnvio>` +
    `<TmstFirmaEnv>${marcaDeTiempo()}</TmstFirmaEnv>` +
    `</Caratula>` +
    resumenes(datos) +
    `</DocumentoConsumoFolios>` +
    `</ConsumoFolios>`;

  return firmarXml(conSaltosDeLinea(xml), id, cert, 'ConsumoFolios');
}
