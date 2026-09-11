/*
 * Cialo Hub · captura de ventas en Reservo.
 *
 * Corre en todas las páginas de reservo.cl pero sólo actúa en tres momentos:
 *
 *  1. En el formulario de venta, al apretar "Realizar venta" (button#confirmar),
 *     toma una foto de lo que hay en pantalla: ítems, profesional, pagos, total.
 *     Todavía NO manda nada: Reservo puede rechazar la venta (falta el paciente,
 *     un pago no cuadra) y no queremos registrar en Cialo Hub algo que no pasó.
 *
 *  2. En cada página que carga, le avisa al fondo en qué URL está. Así el fondo
 *     sabe si Reservo aceptó la venta (la pestaña salió del formulario) o la
 *     rechazó (se quedó en él), y recién ahí la envía.
 *
 *  3. Cuando el fondo termina, muestra el resultado aquí mismo, en un aviso en
 *     la esquina: recepción está mirando Reservo, no las notificaciones.
 *
 * Se lee lo que se ve en pantalla y no el código interno de Reservo: los nombres
 * de los servicios y profesionales en texto son justo lo que Cialo Hub necesita,
 * y resiste mejor que depender de funciones que Reservo puede cambiar.
 */
(() => {
  const RUTA_FORMULARIO = '/ventamultiple/crearatencionlast/';
  const esFormularioVenta = location.pathname.startsWith(RUTA_FORMULARIO);

  /** Aviso flotante. Los de éxito se van solos; los de error esperan un clic. */
  function mostrarAviso(ok, texto, duracionMs = ok ? 8000 : 0) {
    const aviso = document.createElement('div');
    aviso.textContent = texto;
    aviso.title = 'Cialo Hub · clic para cerrar';
    Object.assign(aviso.style, {
      position: 'fixed', top: '16px', right: '16px', zIndex: '2147483647', maxWidth: '380px',
      padding: '12px 16px', borderRadius: '8px', font: '14px/1.4 "Segoe UI", system-ui, sans-serif',
      color: '#fff', background: ok ? '#4A7A5A' : '#C97B4B', boxShadow: '0 4px 16px rgba(0,0,0,.25)', cursor: 'pointer',
    });
    aviso.addEventListener('click', () => aviso.remove());
    document.body.appendChild(aviso);
    if (duracionMs) setTimeout(() => aviso.remove(), duracionMs);
  }

  // El resultado llega en la página a la que Reservo lleva tras confirmar, así
  // que el oyente se registra en todas las páginas, no sólo en el formulario.
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.tipo === 'resultado') mostrarAviso(msg.ok, msg.texto);
  });

  try {
    chrome.runtime.sendMessage({ tipo: 'pagina', url: location.href, esFormularioVenta });
  } catch {
    // La extensión se recargó y este script quedó huérfano: no hay nada que hacer.
  }

  if (!esFormularioVenta) return;

  const limpiar = (s) => (s || '').replace(/\s+/g, ' ').trim();

  /** "$14.400" → 14400. Reservo usa punto de miles y el peso no tiene decimales. */
  const pesos = (s) => {
    const digitos = String(s ?? '').replace(/[^\d-]/g, '');
    return digitos ? parseInt(digitos, 10) : 0;
  };

  /** Lo que muestra una celda: el valor si es editable, el texto si no. */
  function valorCelda(celda) {
    if (!celda) return '';
    const select = celda.querySelector('select');
    if (select) return limpiar(select.options[select.selectedIndex]?.text);
    const campo = celda.querySelector('input:not([type=hidden]), textarea');
    if (campo) return limpiar(campo.value);
    return limpiar(celda.textContent);
  }

  /** Datos ocultos de la fila, sin nada que parezca un token de sesión. */
  function ocultosDe(fila) {
    const datos = {};
    for (const input of fila.querySelectorAll('input[type=hidden]')) {
      const nombre = input.name || input.id;
      if (!nombre || /csrf|token|password/i.test(nombre)) continue;
      datos[nombre] = String(input.value).slice(0, 200);
    }
    return datos;
  }

  /**
   * Producto o servicio. Reservo agrega unos con "Productos" y otros con
   * "Servicios"; la fila deja rastro en sus clases, id o datos ocultos. Para la
   * boleta importa: la clínica declara los servicios exentos y los productos
   * afectos. Si no se puede saber, queda como desconocido y se trata como
   * servicio, que es lo que vende casi siempre.
   */
  function tipoDe(fila, ocultos) {
    const pistas = [fila.id, fila.className, ...Object.keys(ocultos), ...Object.values(ocultos)].join(' ').toLowerCase();
    if (/producto/.test(pistas)) return 'PRODUCTO';
    if (/tratamiento|servicio|ticket|atencion|plan/.test(pistas)) return 'SERVICIO';
    return 'DESCONOCIDO';
  }

  function capturarItems() {
    const tabla = document.getElementById('tablaproductos');
    if (!tabla) return [];

    // Las columnas se ubican por su título, no por posición, por si Reservo
    // agrega o reordena alguna. Sin tildes: el encabezado real dice "Ítem".
    const sinTildes = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const encabezados = [...tabla.querySelectorAll('thead th, tr:first-child th')].map((th) =>
      sinTildes(limpiar(th.textContent).toLowerCase()),
    );
    const col = (patron) => encabezados.findIndex((t) => patron.test(t));
    const idx = {
      item: col(/^item|servicio|producto/),
      cantidad: col(/cant/),
      total: col(/total/),
      descuento: col(/descuento/),
      profesional: col(/profesional/),
    };

    const filas = [...(tabla.tBodies.length ? tabla.tBodies : [tabla])].flatMap((tb) => [...tb.rows]);
    return filas
      .filter((fila) => fila.cells.length > 1 && !fila.querySelector('th'))
      .map((fila) => {
        const celdas = fila.cells;
        const ocultos = ocultosDe(fila);
        const nombre = valorCelda(celdas[idx.item >= 0 ? idx.item : 0]);
        return {
          nombre,
          cantidad: Math.max(1, parseInt(valorCelda(celdas[idx.cantidad]), 10) || 1),
          total: pesos(valorCelda(celdas[idx.total])),
          descuentoLinea: parseFloat(valorCelda(celdas[idx.descuento]).replace(',', '.')) || 0,
          profesional: idx.profesional >= 0 ? valorCelda(celdas[idx.profesional]) || null : null,
          tipo: tipoDe(fila, ocultos),
          ocultos,
        };
      })
      .filter((it) => it.nombre);
  }

  /** Cada forma de pago elegida con su monto. */
  function capturarPagos(total) {
    const selects = [...document.querySelectorAll('select[name^="tipoPago_"]')];
    const pagos = selects
      .map((select) => {
        const medio = limpiar(select.options[select.selectedIndex]?.text);
        if (!select.value || /^-+$/.test(medio)) return null;
        // El monto vive en la misma fila que el selector.
        const fila = select.closest('tr, .row, .form-row, li') || select.parentElement;
        const montos = [...(fila?.querySelectorAll('input[type=text], input[type=number]') ?? [])]
          .map((i) => pesos(i.value))
          .filter((n) => n > 0);
        return { medio, monto: montos[0] ?? 0 };
      })
      .filter(Boolean);

    // Con un solo medio de pago y sin monto legible, se asume el total.
    if (pagos.length === 1 && !pagos[0].monto) pagos[0].monto = total;
    return pagos;
  }

  function valor(selector) {
    const el = document.querySelector(selector);
    if (!el) return '';
    if (el.tagName === 'SELECT') return limpiar(el.options[el.selectedIndex]?.text);
    if (el.type === 'checkbox') return el.checked;
    return limpiar(el.value);
  }

  function capturar() {
    const total = pesos(valor('#id_total'));
    const buscador = [...document.querySelectorAll('input')].find((i) => /buscar cliente/i.test(i.placeholder || ''));
    return {
      idLocal: crypto.randomUUID(),
      capturadaEn: new Date().toISOString(),
      cliente: limpiar(buscador?.value) || null,
      idPacienteReservo: valor('#id_demandante') || null,
      items: capturarItems(),
      pagos: capturarPagos(total),
      total,
      descuentoGlobal: parseFloat(String(valor('#id_descuento')).replace(',', '.')) || 0,
      fecha: valor('#id_fecha') || null,
      comentario: valor('#id_comentario') || null,
      boletaReservo: {
        tipo: valor('#id_tipo_boleta_1') || null,
        numero: valor('#id_numero_boleta_1') || null,
        electronica: Boolean(valor('#boleta_electronica_1')),
      },
    };
  }

  // Fase de captura: corre antes que el onclick de Reservo, así la foto se toma
  // con el formulario tal como el usuario lo dejó.
  document.addEventListener(
    'click',
    (e) => {
      if (!e.target.closest?.('#confirmar')) return;
      try {
        chrome.runtime.sendMessage({ tipo: 'venta-capturada', venta: capturar() });
      } catch (err) {
        console.warn('[Cialo Hub] no se pudo capturar la venta', err);
        mostrarAviso(false, 'Cialo Hub: la extensión se actualizó. Recarga esta página (F5) antes de vender.');
      }
    },
    true,
  );
})();
