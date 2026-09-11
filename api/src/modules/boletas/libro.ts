import { datosEmisor } from './emisor.ts';
import { conSaltosDeLinea, firmarXml, marcaDeTiempo, NS_SIIDTE, NS_XSI, type Caratula, type DatosBoleta } from './dte.ts';
import type { Certificado } from './firma.ts';

/**
 * Libro de Boletas Electrónicas según `LibroBOLETA_v10.xsd`.
 *
 * La Resolución 74 de 2020 eliminó la obligación de llevarlo —el Resumen de
 * Ventas Diarias lo reemplazó—, pero la guía de certificación de boletas
 * todavía lo pide entre los adjuntos del correo, así que se genera igual (ver
 * docs/sii/certificacion-boletas.md).
 *
 * El esquema arrastra esa historia: `TipoLibro` sólo admite `ESPECIAL`, el
 * libro que el SII pedía por notificación, y por eso `FolioNotificacion` es
 * obligatorio. Para la certificación se informa el folio de la notificación
 * con que el SII solicitó el set.
 */

export interface DatosLibro {
  /** Periodo tributario que cubre, AAAA-MM. */
  periodo: string;
  boletas: DatosBoleta[];
  /** Folio de la notificación del SII que pide el libro. */
  folioNotificacion: number;
}

/** Venta y servicio: el tipo de servicio de una boleta de caja. */
const TPO_SERV_VENTA = 3;

function detalle(b: DatosBoleta): string {
  return (
    `<Detalle>` +
    `<TpoDoc>${b.tipoDte}</TpoDoc>` +
    `<FolioDoc>${b.folio}</FolioDoc>` +
    `<TpoServ>${TPO_SERV_VENTA}</TpoServ>` +
    `<FchEmiDoc>${b.fechaEmision}</FchEmiDoc>` +
    (b.exento > 0 ? `<MntExe>${b.exento}</MntExe>` : '') +
    `<MntTotal>${b.total}</MntTotal>` +
    `</Detalle>`
  );
}

/** Un bloque de totales por tipo de documento presente en el periodo. */
function totalesPeriodo(boletas: DatosBoleta[]): string {
  const tipos = [...new Set(boletas.map((b) => b.tipoDte))].sort();

  return tipos
    .map((tipo) => {
      const del = boletas.filter((b) => b.tipoDte === tipo);
      const exento = del.reduce((s, b) => s + b.exento, 0);
      const neto = del.reduce((s, b) => s + b.neto, 0);
      const iva = del.reduce((s, b) => s + b.iva, 0);
      const total = del.reduce((s, b) => s + b.total, 0);

      return (
        `<TotalesPeriodo>` +
        `<TpoDoc>${tipo}</TpoDoc>` +
        `<TotalesServicio>` +
        `<TpoServ>${TPO_SERV_VENTA}</TpoServ>` +
        `<TotDoc>${del.length}</TotDoc>` +
        (exento > 0 ? `<TotMntExe>${exento}</TotMntExe>` : '') +
        // El esquema exige neto e IVA aunque el libro sea de boletas exentas:
        // en ese caso van en cero, no se omiten.
        `<TotMntNeto>${neto}</TotMntNeto>` +
        (iva > 0 ? `<TasaIVA>19</TasaIVA>` : '') +
        `<TotMntIVA>${iva}</TotMntIVA>` +
        `<TotMntTotal>${total}</TotMntTotal>` +
        `</TotalesServicio>` +
        `</TotalesPeriodo>`
      );
    })
    .join('');
}

/** Genera el libro de boletas firmado. */
export function construirLibro(datos: DatosLibro, caratula: Caratula, cert: Certificado): string {
  const e = datosEmisor();
  const id = `LIBRO-${datos.periodo.replace('-', '')}`;

  const xml =
    `<?xml version="1.0" encoding="ISO-8859-1"?>` +
    `<LibroBoleta xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="${NS_XSI}" ` +
    `xsi:schemaLocation="http://www.sii.cl/SiiDte LibroBOLETA_v10.xsd" version="1.0">` +
    `<EnvioLibro ID="${id}">` +
    `<Caratula>` +
    `<RutEmisorLibro>${e.rut}</RutEmisorLibro>` +
    `<RutEnvia>${caratula.rutEnvia}</RutEnvia>` +
    `<PeriodoTributario>${datos.periodo}</PeriodoTributario>` +
    `<FchResol>${caratula.fchResol}</FchResol>` +
    `<NroResol>${caratula.nroResol}</NroResol>` +
    `<TipoLibro>ESPECIAL</TipoLibro>` +
    `<TipoEnvio>TOTAL</TipoEnvio>` +
    `<FolioNotificacion>${datos.folioNotificacion}</FolioNotificacion>` +
    `</Caratula>` +
    `<ResumenPeriodo>` +
    totalesPeriodo(datos.boletas) +
    `</ResumenPeriodo>` +
    datos.boletas.map(detalle).join('') +
    `<TmstFirma>${marcaDeTiempo()}</TmstFirma>` +
    `</EnvioLibro>` +
    `</LibroBoleta>`;

  // Este esquema define su propio <Signature> en el namespace del SII: la
  // firma NO declara el de XMLDSig (ver firmarXml).
  return firmarXml(conSaltosDeLinea(xml), id, cert, 'LibroBoleta', { nsFirma: NS_SIIDTE });
}
