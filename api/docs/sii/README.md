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
- `SiiTypes_v10.xsd` — tipos comunes (RUT, folio, montos) que usa el RCOF.

## Herramientas

- `verificar-envio.py <xml> [xsd]` — verificador independiente antes de subir:
  valida contra el XSD y comprueba digest y firma RSA-SHA1 de cada firma con
  libxml2 (C14N 1.0) y openssl. Sin XSD valida como EnvioBOLETA; para el RCOF
  pasar `ConsumoFolio_v10.xsd`.
- `npm run sii:set -- <CAF.xml> [salida]` (en `api/`) — genera el set de
  certificación: tres boletas exentas, sobre `EnvioBOLETA.xml` y `RCOF.xml`.
  Con `--sintetico` usa un CAF de prueba, sin gastar folios reales.
- `npm run sii:enviar -- token | enviar <EnvioBOLETA.xml> | estado <trackid>` —
  API REST de boletas (semilla → token → envío → estado). Las boletas NO van
  por el uploader web clásico de facturas: ese responde SCH-00001 a un
  `EnvioBOLETA`. Hosts según `SII_AMBIENTE`: certificación `apicert.sii.cl` +
  `pangal.sii.cl`; producción `api.sii.cl` + `rahue.sii.cl`. El RCOF sí se
  sube por el canal clásico.

Fuente: https://www.sii.cl/servicios_online/3532-formato_xml-3811.html
- Esquemas: `factura_electronica/factura_mercado/schema_envio_bol.zip`
- Formato (PDF): `factura_electronica/factura_mercado/formato_boleta_electronica.pdf`

Ojo: las boletas usan un esquema PROPIO (`EnvioBOLETA`), distinto del
`EnvioDTE` de facturas. No son intercambiables.

Se versionan aquí para poder validar contra ellos el XML que genera el sistema,
sin depender de que el sitio del SII esté disponible.
