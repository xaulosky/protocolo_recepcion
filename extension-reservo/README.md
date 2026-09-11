# Cialo Hub · Ventas de Reservo

Extensión de Chrome para el computador de recepción. Al apretar **Realizar
venta** en Reservo, abre la caja de Cialo Hub con esa misma venta ya cargada
—servicios, precios, profesional, cliente, medio de pago— para revisarla y
registrarla con un clic.

## Instalar

1. Descomprimir la carpeta `extension-reservo` en el computador de recepción.
2. En Chrome abrir `chrome://extensions`, activar **Modo de desarrollador**
   (arriba a la derecha).
3. **Cargar extensión sin empaquetar** → elegir la carpeta.
4. Recargar las pestañas de Reservo que estuvieran abiertas (F5).

No pide login: la venta la registra Cialo Hub con la sesión que ya está
abierta en el navegador. Si la sesión venció, Cialo Hub pide ingresar y
después muestra la venta igual.

Para actualizarla: reemplazar los archivos de la carpeta y apretar el botón de
recargar de la extensión en `chrome://extensions`.

## Cómo funciona

1. Al apretar **Realizar venta** (`button#confirmar`) se toma una foto del
   formulario: ítems, cantidades, totales, profesional, medios de pago,
   descuento y comentario.
2. Reservo hace el POST a `/ventamultiple/formpagar_ventamultiplelast/`.
3. Si la pestaña **sale del formulario**, Reservo aceptó la venta: se abre una
   pestaña nueva de Cialo Hub en la caja (`?importar=reservo`) con la venta
   cargada. Si Reservo la rechaza, la pestaña se queda en el formulario y no
   se abre nada.
4. En Cialo Hub se revisa y se aprieta **Registrar en caja** (o
   **Descartar**). Sale el comprobante como en cualquier venta.

La venta viaja de la extensión a la página con `postMessage` (`puente.js`), no
por la URL: el nombre del paciente no queda en el historial ni en los logs.

Si la pestaña de Cialo Hub se cierra sin registrar, la venta queda en el
ícono de la extensión (con un número) y se puede **Abrir en Cialo Hub** desde
ahí. Una venta no entra dos veces aunque se abra varias veces: lleva un
identificador único y el servidor devuelve la ya registrada.

## Qué entra en Cialo Hub

- **Ítems con el nombre y precio de Reservo.** Reservo tiene cientos de
  servicios desagregados que no corresponden uno a uno con el catálogo de
  Cialo Hub, así que no se fuerzan. El precio unitario sale del total de la
  línea, para que la suma sea lo que pagó el paciente.
- **Profesional:** se busca su ficha por nombre, sin título ni especialidad.
  Si no hay ficha (o hay más de una posible), queda el nombre de Reservo.
- **Medio de pago:** el de mayor monto, editable antes de registrar. Cheque
  cuenta como transferencia y pago online como tarjeta; el desglose de
  Reservo se muestra y queda en las notas.
- **Exento o afecto:** servicios exentos y productos afectos según lo que
  Reservo deja ver; se puede corregir línea por línea antes de registrar.
- Si el total no coincide con el que cobró Reservo, se avisa en pantalla y la
  venta queda con una nota **REVISAR**.

No mueve stock (Reservo no dice qué ítem del inventario se vendió) y **no
emite boleta** salvo que en el servidor esté `BOLETAS_VENTAS_EXTERNAS=true`:
si en Reservo también se marca boleta, saldrían dos documentos por la misma
venta.

## Si algo no funciona

El ícono de la extensión tiene un **Registro** con cada paso: clic capturado,
envío a Reservo, confirmación, apertura de Cialo Hub.
