# Certificación de boleta electrónica ante el SII

Fuente: https://www.sii.cl/factura_electronica/guia_emitir_boleta_servicio.htm

**La certificación de boletas NO se declara en el menú de postulación de factura
electrónica de maullin.** Ese menú (`pe_avance1`, `pe_generar`, …) pertenece a la
certificación de FACTURA: su set trae factura exenta, notas de crédito/débito y
libros de compra/venta. El set de boletas es otro (CASO-1…CASO-3) y su avance se
informa **por correo**.

Requisito previo: estar autorizado como emisor de DTE, o estar certificándose de
factura en paralelo.

## Flujo

1. **Set de pruebas** — lo pide el representante legal en
   https://www4.sii.cl/certBolElectDteInternet/?SET=1 (revisión: 10-15 días hábiles).
2. **En el ambiente de certificación:**
   1. Bajar un CAF con al menos 10 folios de boleta.
   2. Construir las boletas del set y enviarlas (API REST de boletas: `npm run sii:enviar -- enviar`).
   3. Anular o corregir notas de crédito si el set las pide (el set exento no las trae).
3. **Cinco envíos por correo** a `SII_BE_Certificacion@sii.cl`, asunto
   `SET DE PRUEBA DE BOLETA ELECTRÓNICA <NOMBRE EMPRESA> Rut XXXXXXXX-X`:
   1. Archivo de consumo de folios subido en certificación, asociado al set
      (`npm run sii:enviar -- rvd`).
   2. El número de envío (track ID) del set de boletas.
   3. La representación gráfica en PDF de los documentos del set.
   4. Libro de boletas electrónicas (XML) asociado a las boletas del set.
      Ojo: la Resolución 74 de 2020 eliminó la obligación de llevar el libro de
      boletas, pero la guía de certificación sigue pidiéndolo; conviene
      preguntarlo en el mismo correo.
   5. Diez muestras de boletas en PDF que simulen operaciones reales del giro.
4. **Declaración de cumplimiento** en https://www4.sii.cl/certBolElectDteInternet/
   una vez que el SII da el visto bueno. La autorización rige desde el primer día
   del mes en curso.

## Condición que el SII verifica al autorizar

La representación impresa debe señalar el **sitio web donde se consulta la boleta
electrónica**, y ese sitio debe estar disponible en la Web. Se verifica al momento
de autorizar por resolución, así que la página pública de consulta y la URL
impresa en el voucher son parte del entregable, no un extra.

## Formatos de referencia

- Boletas: https://www.sii.cl/factura_electronica/boletas_elec.pdf
- Libro de boletas: https://www.sii.cl/factura_electronica/libros_boletas.pdf
- Consumo de folios: https://www.sii.cl/factura_electronica/consumo_folios.pdf
