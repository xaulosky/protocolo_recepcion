/*
 * Cialo Hub · fondo de la extensión.
 *
 * Decide cuándo una venta de Reservo es real y la manda a Cialo Hub.
 *
 * Una venta pasa por tres pasos, y sólo si se cumplen los tres se envía:
 *   1. el contenido avisa que se apretó "Realizar venta" (con la foto de la venta);
 *   2. la pestaña hace el POST a formpagar_ventamultiplelast y termina sin error;
 *   3. la pestaña sale del formulario: Reservo aceptó y redirigió.
 * Si Reservo rechaza (falta un dato, el pago no cuadra), la pestaña se queda en
 * el formulario y la venta capturada se descarta.
 *
 * Lo que no se pudo enviar (Cialo Hub caído, caja cerrada, sesión vencida) queda
 * en cola y se reintenta cada minuto: nunca se pierde una venta en silencio.
 */

const API = 'https://administracion.cialo.cl/api';
const URL_POST = 'https://reservo.cl/ventamultiple/formpagar_ventamultiplelast/*';
const RUTA_FORMULARIO = '/ventamultiple/crearatencionlast/';
const RUTA_POST = '/ventamultiple/formpagar_ventamultiplelast/';
/** Tiempo máximo entre el clic en "Realizar venta" y la confirmación de Reservo. */
const VENTANA_MS = 2 * 60_000;

// ───────────────────────── estado ─────────────────────────
// En storage y no en variables: el service worker de Chrome se duerme a los
// pocos segundos sin actividad y pierde todo lo que tenga en memoria.

const clavePendiente = (tabId) => `pendiente:${tabId}`;

async function leerPendiente(tabId) {
  const r = await chrome.storage.session.get(clavePendiente(tabId));
  return r[clavePendiente(tabId)] ?? null;
}

async function guardarPendiente(tabId, datos) {
  await chrome.storage.session.set({ [clavePendiente(tabId)]: datos });
}

async function borrarPendiente(tabId) {
  await chrome.storage.session.remove(clavePendiente(tabId));
}

async function leerCola() {
  const { cola = [] } = await chrome.storage.local.get('cola');
  return cola;
}

async function guardarCola(cola) {
  await chrome.storage.local.set({ cola });
  await chrome.action.setBadgeBackgroundColor({ color: cola.length ? '#C97B4B' : '#4A7A5A' });
  await chrome.action.setBadgeText({ text: cola.length ? String(cola.length) : '' });
}

async function registrarEnviada(item) {
  const { enviadas = [] } = await chrome.storage.local.get('enviadas');
  enviadas.unshift(item);
  await chrome.storage.local.set({ enviadas: enviadas.slice(0, 20) });
}

function avisar(titulo, mensaje) {
  chrome.notifications.create({ type: 'basic', iconUrl: 'icono.png', title: titulo, message: mensaje, priority: 1 });
}

// ───────────────────────── captura ─────────────────────────

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (tabId == null) return;
  if (msg.tipo === 'venta-capturada') {
    // Un segundo clic (Reservo pidió corregir algo) reemplaza la foto anterior.
    void guardarPendiente(tabId, { venta: msg.venta, clicEn: Date.now() });
  } else if (msg.tipo === 'pagina') {
    void revisarPagina(tabId, msg);
  }
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
      const p = await leerPendiente(d.tabId);
      if (!p) return;
      await guardarPendiente(d.tabId, { ...p, postEn: Date.now(), formulario: resumenFormulario(d.requestBody) });
    })();
  },
  { urls: [URL_POST] },
  ['requestBody'],
);

chrome.webRequest.onBeforeRedirect.addListener(
  (d) => {
    if (d.tabId < 0) return;
    void (async () => {
      const p = await leerPendiente(d.tabId);
      if (p) await guardarPendiente(d.tabId, { ...p, redirect: d.redirectUrl });
    })();
  },
  { urls: [URL_POST] },
);

chrome.webRequest.onCompleted.addListener(
  (d) => {
    if (d.tabId < 0) return;
    void (async () => {
      const p = await leerPendiente(d.tabId);
      if (p) await guardarPendiente(d.tabId, { ...p, estadoPost: d.statusCode });
    })();
  },
  { urls: [URL_POST] },
);

chrome.webRequest.onErrorOccurred.addListener(
  (d) => {
    if (d.tabId >= 0) void borrarPendiente(d.tabId);
  },
  { urls: [URL_POST] },
);

/**
 * Cada página que carga en la pestaña dice dónde quedó. Con una venta en curso
 * que ya hizo su POST, salir del formulario significa que Reservo la aceptó.
 */
async function revisarPagina(tabId, { url, esFormularioVenta }) {
  const p = await leerPendiente(tabId);
  if (!p) return;

  if (Date.now() - p.clicEn > VENTANA_MS) {
    await borrarPendiente(tabId);
    return;
  }
  // Todavía no hubo POST: es la misma carga del formulario, o una navegación ajena.
  if (!p.postEn) return;

  const ruta = new URL(url).pathname;
  const falloPost = p.estadoPost != null && p.estadoPost >= 400;
  // Si Reservo rechaza, vuelve a mostrar el formulario (en su ruta o en la del
  // POST). Cualquier otra página es la confirmación de la venta.
  const rechazada = esFormularioVenta || ruta.startsWith(RUTA_POST) || ruta.startsWith(RUTA_FORMULARIO);

  await borrarPendiente(tabId);
  if (falloPost || rechazada) return;

  await encolar(aVentaExterna(p, p.redirect || url));
  await procesarCola();
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

// ───────────────────────── envío a Cialo Hub ─────────────────────────

async function encolar(venta) {
  const cola = await leerCola();
  cola.push({ venta, intentos: 0, ultimoError: null, encoladaEn: Date.now() });
  await guardarCola(cola);
}

async function sesion() {
  const { sesion: s = null } = await chrome.storage.local.get('sesion');
  return s;
}

async function renovar(s) {
  const r = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: s.refreshToken }),
  });
  if (!r.ok) return null;
  const body = await r.json();
  const nueva = { accessToken: body.accessToken, refreshToken: body.refreshToken, user: body.user };
  await chrome.storage.local.set({ sesion: nueva });
  return nueva;
}

/** POST autenticado; si el token venció lo renueva una vez y reintenta. */
async function postApi(ruta, cuerpo) {
  let s = await sesion();
  if (!s) throw Object.assign(new Error('Sin sesión en Cialo Hub'), { sinSesion: true });

  const enviar = (token) =>
    fetch(`${API}${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(cuerpo),
    });

  let r = await enviar(s.accessToken);
  if (r.status === 401) {
    s = await renovar(s);
    if (!s) {
      await chrome.storage.local.remove('sesion');
      throw Object.assign(new Error('La sesión venció'), { sinSesion: true });
    }
    r = await enviar(s.accessToken);
  }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error || `HTTP ${r.status}`), { status: r.status });
  return body;
}

let procesando = false;

async function procesarCola() {
  if (procesando) return;
  procesando = true;
  try {
    const cola = await leerCola();
    const quedan = [];
    for (const item of cola) {
      try {
        const r = await postApi('/caja/ventas/externa', item.venta);
        await registrarEnviada({
          numero: r.venta?.numero,
          total: r.venta?.total,
          cliente: item.venta.cliente,
          duplicada: Boolean(r.duplicada),
          en: Date.now(),
        });
        if (!r.duplicada) {
          avisar('Venta registrada en Cialo Hub', `N° ${r.venta?.numero} · ${pesos(r.venta?.total ?? 0)}${item.venta.cliente ? ` · ${item.venta.cliente}` : ''}`);
        }
      } catch (e) {
        // Un 400 es un dato malo que no se arregla reintentando; el resto
        // (sin conexión, caja cerrada, sesión vencida) sí puede resolverse.
        const definitivo = e.status === 400;
        const conError = { ...item, intentos: item.intentos + 1, ultimoError: e.message };
        if (definitivo) {
          avisar('Venta no importada', `${item.venta.cliente ?? 'Sin cliente'}: ${e.message}`);
          await registrarEnviada({ error: e.message, cliente: item.venta.cliente, en: Date.now() });
        } else {
          quedan.push(conError);
          if (item.intentos === 0) {
            avisar(
              'Venta pendiente de enviar',
              e.sinSesion ? 'Inicia sesión en la extensión de Cialo Hub.' : `${e.message}. Se reintentará sola.`,
            );
          }
        }
      }
    }
    await guardarCola(quedan);
  } finally {
    procesando = false;
  }
}

// ───────────────────────── reintentos ─────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('cola', { periodInMinutes: 1 });
  void guardarCola([]).then(() => leerCola());
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('cola', { periodInMinutes: 1 });
  void leerCola().then(guardarCola);
});
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'cola') void procesarCola();
});

// El popup pide reintentar o login.
chrome.runtime.onMessage.addListener((msg, _sender, responder) => {
  if (msg.tipo === 'reintentar') {
    procesarCola().then(() => responder({ ok: true }));
    return true;
  }
  return undefined;
});
