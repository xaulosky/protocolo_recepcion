# Cialo Hub · Ventas de Reservo

Extensión de Chrome para el computador de recepción. Cuando se aprieta
**Realizar venta** en Reservo, registra la misma venta en la caja de Cialo Hub.

## Instalar

1. Copiar esta carpeta (`extension-reservo`) al computador de recepción.
2. En Chrome abrir `chrome://extensions`, activar **Modo de desarrollador**
   (arriba a la derecha).
3. **Cargar extensión sin empaquetar** → elegir la carpeta.
4. Clic en el ícono de la extensión (la "C" café) → ingresar con un usuario de
   Cialo Hub de **recepción** o **administración**.

Para actualizarla después de un cambio: reemplazar los archivos y apretar el
botón de recargar de la extensión en `chrome://extensions`.

## Cómo funciona

1. Al apretar **Realizar venta** (`button#confirmar`) se toma una foto del
   formulario: ítems, cantidades, totales, profesional, medios de pago,
   descuento y comentario.
2. Reservo hace el POST a `/ventamultiple/formpagar_ventamultiplelast/`.
3. Si la pestaña **sale del formulario**, Reservo aceptó la venta y recién ahí
   se envía a Cialo Hub (`POST /caja/ventas/externa`). Si Reservo la rechaza
   (falta el paciente, el pago no cuadra), la pestaña se queda en el formulario
   y no se envía nada.

Lo que no se puede enviar —Cialo Hub caído, caja cerrada, sesión vencida—
queda en cola, se ve en el ícono con un número, y se reintenta cada minuto.
Una venta nunca entra dos veces: cada una lleva un identificador único y el
servidor ignora los reintentos.

## Qué entra en Cialo Hub

- **Ítems con el nombre y precio de Reservo.** Reservo tiene cientos de
  servicios desagregados ("1 sesión de depilación láser bozo") que no
  corresponden uno a uno con el catálogo de Cialo Hub, así que no se fuerzan.
  El precio unitario sale del total de la línea, para que la suma sea lo que
  pagó el paciente.
- **Profesional:** se busca su ficha por nombre, sin título ni especialidad.
  Si no hay ficha (o hay más de una posible), queda el nombre de Reservo.
- **Medio de pago:** el de mayor monto. Cheque cuenta como transferencia y
  pago online como tarjeta; el desglose completo queda en las notas.
- **Exento o afecto:** los servicios exentos y los productos afectos, según lo
  que Reservo deje ver en la fila. Si no se puede saber, se trata como
  servicio.
- Si el total calculado no coincide con el que cobró Reservo, la venta entra
  igual con una nota **REVISAR**.

No mueve stock (Reservo no dice qué ítem del inventario se vendió) y **no
emite boleta** salvo que en el servidor esté `BOLETAS_VENTAS_EXTERNAS=true`:
si en Reservo también se marca boleta, se emitirían dos documentos por la
misma venta.

## Requisitos

- Una **caja abierta** en Cialo Hub. Sin caja, las ventas esperan en cola.
- Chrome con la sesión de Reservo iniciada, como siempre.
