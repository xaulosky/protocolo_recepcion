# Esquemas del SII para boleta electrónica

Descargados desde la documentación pública del SII (diciembre 2024):

- `EnvioBOLETA_v11.xsd` — esquema del envío de boletas. Define los tipos 39
  (Boleta Electrónica) y 41 (Boleta Exenta Electrónica), el encabezado, el
  detalle, el TED y las referencias.
- `xmldsignature_v10.xsd` — firma electrónica (XMLDSig).

Fuente: https://www.sii.cl/servicios_online/3532-formato_xml-3811.html
- Esquemas: `factura_electronica/factura_mercado/schema_envio_bol.zip`
- Formato (PDF): `factura_electronica/factura_mercado/formato_boleta_electronica.pdf`

Ojo: las boletas usan un esquema PROPIO (`EnvioBOLETA`), distinto del
`EnvioDTE` de facturas. No son intercambiables.

Se versionan aquí para poder validar contra ellos el XML que genera el sistema,
sin depender de que el sitio del SII esté disponible.
