/*
 * Cialo Hub · fondo de la extensión.
 *
 * Cuando Reservo confirma una venta, abre la caja de Cialo Hub con esa venta
 * cargada —servicios, precios, profesional, cliente, medio de pago— para que
 * recepción la revise y la registre ahí. La registra la propia app, con la
 * sesión que ya tiene abierta: la extensión no guarda contraseñas ni tokens.
 *
 * Una venta pasa por tres pasos, y sólo si se cumplen los tres se abre:
 *   1. el contenido avisa que se apretó "Realizar venta" (con la foto de la venta);
 *   2. la pestaña hace el POST a formpagar_ventamultiplelast y termina sin error;
 *   3. la pestaña sale del formulario: Reservo aceptó y redirigió.
 * Si Reservo rechaza (falta un dato, el pago no cuadra), la pestaña se queda en
 * el formulario y la venta capturada se descarta.
 *
 * Las ventas quedan como "pendientes" hasta que Cialo Hub avisa que las
 * registró o se descartaron (ver puente.js): si la pestaña se cierra antes, se
 * pueden volver a abrir desde el popup.
 */

const CIALO = 'https://administracion.cialo.cl';
const URL_IMPORTAR = `${CIALO}/?importar=reservo`;
const URL_POST = 'https://reservo.cl/ventamultiple/formpagar_ventamultiplelast/*';
const RUTA_FORMULARIO = '/ventamultiple/crearatencionlast/';
const RUTA_POST = '/ventamultiple/formpagar_ventamultiplelast/';
/** Tiempo máximo entre el clic en "Realizar venta" y la confirmación de Reservo. */
const VENTANA_MS = 2 * 60_000;

// ───────────────────────── estado ─────────────────────────
// En storage y no en variables: el service worker de Chrome se duerme a los
// pocos segundos sin actividad y pierde todo lo que tenga en memoria.

const clavePendiente = (tabId) => `captura:${tabId}`;

async function leerCaptura(tabId) {
  const r = await chrome.storage.session.get(clavePendiente(tabId));
  return r[clavePendiente(tabId)] ?? null;
}

async function guardarCaptura(tabId, datos) {
  await chrome.storage.session.set({ [clavePendiente(tabId)]: datos });
}

async function borrarCaptura(tabId) {
  await chrome.storage.session.remove(clavePendiente(tabId));
}

/** Bitácora de pasos, para saber qué pasó cuando algo "no hace nada". */
async function registrar(evento, detalle = '') {
  const { registro = [] } = await chrome.storage.local.get('registro');
  registro.unshift({ en: Date.now(), evento, detalle: String(detalle).slice(0, 300) });
  await chrome.storage.local.set({ registro: registro.slice(0, 60) });
}

/** El número del ícono: ventas confirmadas en Reservo que faltan en Cialo Hub. */
async function actualizarIcono() {
  const { pendientes = [] } = await chrome.storage.local.get('pendientes');
  await chrome.action.setBadgeBackgroundColor({ color: '#C97B4B' });
  await chrome.action.setBadgeText({ text: pendientes.length ? String(pendientes.length) : '' });
}

chrome.storage.onChanged.addListener((cambios, area) => {
  if (area === 'local' && cambios.pendientes) void actualizarIcono();
});

/** Aviso dentro de la página de Reservo, que es donde está mirando recepción. */
function avisarPestana(tabId, ok, texto) {
  if (tabId == null) return;
  chrome.tabs.sendMessage(tabId, { tipo: 'resultado', ok, texto }).catch(() => {});
}

// ───────────────────────── captura ─────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  if (msg?.tipo === 'abrir') {
    // Desde el popup: volver a abrir una venta pendiente.
    abrirEnCialo(msg.idExterno, null).then(() => responder({ ok: true }));
    return true;
  }

  const tabId = sender.tab?.id;
  if (tabId == null) return undefined;

  if (msg.tipo === 'venta-capturada') {
    // Un segundo clic (Reservo pidió corregir algo) reemplaza la foto anterior.
    void (async () => {
      await guardarCaptura(tabId, { venta: msg.venta, clicEn: Date.now() });
      const v = msg.venta;
      await registrar('clic', `${v.items.length} ítem(s), total $${v.total}, cliente ${v.cliente ?? '—'}`);
      if (!v.items.length) avisarPestana(tabId, false, 'Cialo Hub: no pude leer los ítems de la venta.');
    })();
  } else if (msg.tipo === 'pagina') {
    void revisarPagina(tabId, msg);
  }
  return undefined;
});

/** Del POST sólo se guarda lo útil para auditar; nada de datos personales. */
function resumenFormulario(body) {
  const f = body?.formData;
  if (!f) return null;
  const util = {};
  for (const [k, v] of Object.entries(f)) {
    if (/^(total|fecha|descuento|monto_descuento|codigosreact|ticket|demandante|tipoPago_\d+|tipo_boleta_\d+)$/.test(k)) {
      util[k] = String(v?.[0] ?? '').slice(0, 4000);
    }
  }
  return util;
}

chrome.webRequest.onBeforeRequest.addListener(
  (d) => {
    if (d.method !== 'POST' || d.tabId < 0) return;
    void (async () => {
      const p = await leerCaptura(d.tabId);
      if (!p) {
        await registrar('post-sin-clic', 'Reservo envió una venta pero no se capturó el clic en "Realizar venta"');
        return;
      }
      await guardarCaptura(d.tabId, { ...p, postEn: Date.now(), formulario: resumenFormulario(d.requestBody) });
      await registrar('post', `${d.type} a Reservo`);
    })();
  },
  { urls: [URL_POST] },
  ['requestBody'],
);

chrome.webRequest.onBeforeRedirect.addListener(
  (d) => {
    if (d.tabId < 0) return;
    void (async () => {
      const p = await leerCaptura(d.tabId);
      if (p) await guardarCaptura(d.tabId, { ...p, redirect: d.redirectUrl });
    })();
  },
  { urls: [URL_POST] },
);

chrome.webRequest.onCompleted.addListener(
  (d) => {
    if (d.tabId < 0) return;
    void (async () => {
      const p = await leerCaptura(d.tabId);
      if (p) {
        await guardarCaptura(d.tabId, { ...p, estadoPost: d.statusCode });
        await registrar('post-respuesta', `HTTP ${d.statusCode}`);
      }
    })();
  },
  { urls: [URL_POST] },
);

chrome.webRequest.onErrorOccurred.addListener(
  (d) => {
    if (d.tabId < 0) return;
    void borrarCaptura(d.tabId);
    void registrar('post-error', d.error);
  },
  { urls: [URL_POST] },
);

/**
 * Cada página que carga en la pestaña dice dónde quedó. Con una venta en curso
 * que ya hizo su POST, salir del formulario significa que Reservo la aceptó.
 */
async function revisarPagina(tabId, { url, esFormularioVenta }) {
  const p = await leerCaptura(tabId);
  if (!p) return;

  if (Date.now() - p.clicEn > VENTANA_MS) {
    await borrarCaptura(tabId);
    await registrar('vencida', 'Pasaron más de 2 minutos sin confirmación de Reservo');
    return;
  }
  // Todavía no hubo POST: es la misma carga del formulario, o una navegación ajena.
  if (!p.postEn) return;

  const ruta = new URL(url).pathname;
  const falloPost = p.estadoPost != null && p.estadoPost >= 400;
  // Si Reservo rechaza, vuelve a mostrar el formulario (en su ruta o en la del
  // POST). Cualquier otra página es la confirmación de la venta.
  const rechazada = esFormularioVenta || ruta.startsWith(RUTA_POST) || ruta.startsWith(RUTA_FORMULARIO);

  await borrarCaptura(tabId);
  if (falloPost || rechazada) {
    await registrar('rechazada', `Reservo no confirmó la venta (quedó en ${ruta}${falloPost ? `, HTTP ${p.estadoPost}` : ''})`);
    return;
  }

  const venta = aVentaExterna(p, p.redirect || url);
  const { pendientes = [] } = await chrome.storage.local.get('pendientes');
  pendientes.unshift({ venta, en: Date.now() });
  await chrome.storage.local.set({ pendientes: pendientes.slice(0, 30) });
  await registrar('aceptada', `Reservo confirmó; abriendo Cialo Hub (${venta.items.length} ítem(s))`);

  await abrirEnCialo(venta.idExterno, tabId);
}

/**
 * Abre Cialo Hub en una pestaña nueva junto a la de Reservo. Nueva y no una
 * existente: reutilizar una pestaña de Cialo Hub podría botar un formulario a
 * medio llenar.
 */
async function abrirEnCialo(idExterno, tabReservo) {
  await chrome.storage.local.set({ importacionActual: idExterno });
  const opciones = { url: URL_IMPORTAR, active: true };
  if (tabReservo != null) {
    try {
      const t = await chrome.tabs.get(tabReservo);
      opciones.index = t.index + 1;
      opciones.windowId = t.windowId;
    } catch {
      // La pestaña de Reservo ya no existe: se abre al final.
    }
  }
  await chrome.tabs.create(opciones);
}

// ───────────────────────── armado de la venta ─────────────────────────

/** Medios de pago de Reservo → los que maneja la caja de Cialo Hub. */
function metodoDe(medio) {
  const m = (medio || '').toLowerCase();
  if (/efectivo/.test(m)) return 'EFECTIVO';
  if (/transfer|cheque/.test(m)) return 'TRANSFERENCIA';
  return 'TARJETA'; // crédito, débito, pago online
}

function pesos(n) {
  return `$${Math.round(n).toLocaleString('es-CL')}`;
}

function aVentaExterna(p, referencia) {
  const v = p.venta;
  const items = v.items.map((it) => ({
    nombre: it.nombre.slice(0, 200),
    cantidad: it.cantidad,
    // El "Total" de la línea en Reservo ya es lo cobrado: el precio unitario
    // sale de ahí para que la suma cuadre con lo que pagó el paciente.
    precioUnitario: Math.round(it.total / it.cantidad),
    profesional: it.profesional,
    exento: it.tipo !== 'PRODUCTO',
  }));

  // Cialo Hub guarda un solo medio de pago por venta: va el de mayor monto, y
  // el desglose completo queda en las notas.
  const pagos = [...v.pagos].sort((a, b) => b.monto - a.monto);
  const metodoPago = metodoDe(pagos[0]?.medio);

  const notas = [
    'Importada desde Reservo.',
    pagos.length ? `Pagos: ${pagos.map((x) => `${x.medio} ${pesos(x.monto)}`).join(', ')}.` : null,
    v.total ? `Total en Reservo: ${pesos(v.total)}.` : null,
    v.comentario ? `Comentario: ${v.comentario}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    origen: 'RESERVO',
    idExterno: v.idLocal,
    referencia: referencia?.slice(0, 300) ?? null,
    cliente: v.cliente,
    metodoPago,
    descuento: Math.min(100, Math.max(0, Math.round(v.descuentoGlobal))),
    totalReservo: v.total,
    notas: notas.slice(0, 1000),
    items,
    datosReservo: {
      idPaciente: v.idPacienteReservo,
      fecha: v.fecha,
      pagos: v.pagos,
      boleta: v.boletaReservo,
      tipos: v.items.map((it) => it.tipo),
      formulario: p.formulario,
    },
  };
}

// ───────────────────────── instalación ─────────────────────────

/**
 * Al instalar o actualizar: las ventas que la versión anterior dejó en su cola
 * pasan a pendientes (se abren desde el popup), y se borra la sesión que esa
 * versión guardaba: ya no hace falta, la venta la registra la app.
 */
chrome.runtime.onInstalled.addListener(async () => {
  const { cola = [], pendientes = [] } = await chrome.storage.local.get(['cola', 'pendientes']);
  if (cola.length) {
    const ids = new Set(pendientes.map((p) => p.venta.idExterno));
    const migradas = cola.filter((c) => !ids.has(c.venta.idExterno)).map((c) => ({ venta: c.venta, en: c.encoladaEn ?? Date.now() }));
    await chrome.storage.local.set({ pendientes: [...migradas, ...pendientes] });
    await registrar('actualizacion', `${migradas.length} venta(s) de la cola anterior pasaron a pendientes`);
  }
  await chrome.storage.local.remove(['cola', 'sesion', 'enviadas']);
  await actualizarIcono();
});

chrome.runtime.onStartup.addListener(() => {
  void actualizarIcono();
});
