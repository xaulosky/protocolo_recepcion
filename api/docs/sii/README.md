# Esquemas del SII para boleta electrónica

Descargados desde la documentación pública del SII (diciembre 2024):

- `EnvioBOLETA_v11.xsd` — esquema del envío de boletas. Define los tipos 39
  (Boleta Electrónica) y 41 (Boleta Exenta Electrónica), el encabezado, el
  detalle, el TED y las referencias.
- `xmldsignature_v10.xsd` — firma electrónica (XMLDSig). Ojo: el perfil del SII
  admite UN solo `<Transform>` por referencia (enveloped-signature); la
  canonicalización C14N 1.0 queda implícita.
- `ConsumoFolio_v10.xsd` — Reporte de Consumo de Folios (RCOF). Documento
  aparte del envío de boletas; incluye a `SiiTypes_v10.xsd`.
- `LibroBOLETA_v10.xsd` — Libro de Boletas. Es autocontenido y, a diferencia
  de los otros, declara su propio `<Signature>` DENTRO del namespace del SII
  en vez de importar el de XMLDSig: la firma no lleva `xmlns` propio.
- `SiiTypes_v10.xsd` — tipos comunes (RUT, folio, montos) que usa el RCOF.

`certificacion-boletas.md` describe el trámite ante el SII (es distinto al de
factura: el avance se informa por correo, no por el menú de postulación).

## Herramientas

- `verificar-envio.py <xml> [xsd]` — verificador independiente antes de subir:
  valida contra el XSD y comprueba digest y firma RSA-SHA1 de cada firma con
  libxml2 (C14N 1.0) y openssl. Sin XSD valida como EnvioBOLETA; para el RCOF
  pasar `ConsumoFolio_v10.xsd`.
- `npm run sii:set -- <CAF.xml> [salida]` (en `api/`) — genera el set de
  certificación: tres boletas exentas, sobre `EnvioBOLETA.xml` y `RCOF.xml`.
  Con `--sintetico` usa un CAF de prueba, sin gastar folios reales. Deja
  también `LibroBoletas.xml`, el adjunto 4 del correo de certificación.
- `npm run sii:enviar -- token | enviar <EnvioBOLETA.xml> | estado <trackid>` —
  API REST de boletas (semilla → token → envío → estado). Las boletas NO van
  por el uploader web clásico de facturas: ese responde SCH-00001 a un
  `EnvioBOLETA`. Hosts según `SII_AMBIENTE`: certificación `apicert.sii.cl` +
  `pangal.sii.cl`; producción `api.sii.cl` + `rahue.sii.cl`.
- `npm run sii:muestras -- set <EnvioBOLETA.xml> [salida]` y
  `npm run sii:muestras -- reales <CAF.xml> <folio-inicial> [cuantas] [salida]` —
  representación impresa (HTML + PDF por Edge/Chrome headless) con el timbre
  PDF417 del TED y la leyenda del sitio de consulta. Son los adjuntos 3 y 5 del
  correo de certificación. Verificar que el timbre se lea antes de mandarlo:
  rasterizar el PDF y decodificarlo debe devolver el TED tal cual.
- `npm run sii:diagnostico -- [AAAA-MM-DD]` — sólo lectura: configuración,
  folios, documentos por estado, qué mandaría la cola y el RVD del día armado
  sin enviarlo. Es lo primero que hay que mirar cuando algo no sale.
- `npm run sii:enviar -- rvd <RCOF.xml>` — Resumen de Ventas Diarias (ex RCOF)
  por el canal clásico: token SOAP (`CrSeed`/`GetTokenFromSeed`) y multipart a
  `cgi_dte/UPL/DTEUpload` en maullin (certificación) o palena (producción).
  Ojo: el formulario web "Enviar DTE y libros" rechaza el mismo archivo con
  SCH-00001; por DTEUpload entra. El archivo se manda como `ConsumoFolios.xml`
  y en latin1, que es la codificación que declara el XML.

Fuente: https://www.sii.cl/servicios_online/3532-formato_xml-3811.html
- Esquemas: `factura_electronica/factura_mercado/schema_envio_bol.zip`
- Formato (PDF): `factura_electronica/factura_mercado/formato_boleta_electronica.pdf`

Ojo: las boletas usan un esquema PROPIO (`EnvioBOLETA`), distinto del
`EnvioDTE` de facturas. No son intercambiables.

Se versionan aquí para poder validar contra ellos el XML que genera el sistema,
sin depender de que el sitio del SII esté disponible.
