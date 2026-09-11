/*
 * Popup de la extensión: iniciar sesión en Cialo Hub y ver qué pasó con las
 * ventas importadas (enviadas, en cola, con error).
 *
 * La sesión es la de un usuario normal de Cialo Hub, con su rol: sólo ADMIN y
 * RECEPCION pueden registrar ventas, igual que en la caja.
 */
const API = 'https://administracion.cialo.cl/api';
const ROLES_CAJA = ['ADMIN', 'RECEPCION'];

const $contenido = document.getElementById('contenido');
const $estado = document.getElementById('estado');

const pesos = (n) => `$${Math.round(n || 0).toLocaleString('es-CL')}`;
const hora = (ms) => new Date(ms).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function el(tag, attrs = {}, ...hijos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const h of hijos.flat()) if (h != null) e.append(h);
  return e;
}

async function render() {
  const { sesion, cola = [], enviadas = [] } = await chrome.storage.local.get(['sesion', 'cola', 'enviadas']);
  $contenido.replaceChildren();

  if (!sesion) {
    $estado.textContent = 'Sin sesión: las ventas quedan en cola hasta que ingreses.';
    renderLogin(cola.length);
    return;
  }

  const { user } = sesion;
  $estado.textContent = `Conectado como ${user.nombre}`;

  if (!ROLES_CAJA.includes(user.role)) {
    $contenido.append(el('div', { class: 'aviso error' }, `Tu usuario (${user.role}) no puede registrar ventas. Ingresa con uno de recepción o administración.`));
  }

  // Cola
  $contenido.append(el('section', {},
    el('h2', {}, `En cola (${cola.length})`),
    cola.length
      ? el('ul', {}, cola.map((c) => el('li', { class: 'error' },
          `${c.venta.cliente ?? 'Sin cliente'} · ${pesos(c.venta.totalReservo)}`,
          el('span', { class: 'sub' }, c.ultimoError ? `${c.ultimoError} (${c.intentos} intento${c.intentos === 1 ? '' : 's'})` : 'Esperando envío'))))
      : el('p', { class: 'vacio' }, 'Nada pendiente.'),
  ));

  // Últimas
  $contenido.append(el('section', {},
    el('h2', {}, 'Últimas ventas'),
    enviadas.length
      ? el('ul', {}, enviadas.slice(0, 6).map((e) => e.error
          ? el('li', { class: 'error' }, e.cliente ?? 'Sin cliente', el('span', { class: 'sub' }, `No importada: ${e.error}`))
          : el('li', {}, `N° ${e.numero} · ${pesos(e.total)}${e.duplicada ? ' (ya estaba)' : ''}`,
              el('span', { class: 'sub' }, `${e.cliente ?? 'Sin cliente'} · ${hora(e.en)}`))))
      : el('p', { class: 'vacio' }, 'Todavía no se importó ninguna venta.'),
  ));

  $contenido.append(el('div', { class: 'fila' },
    el('button', { class: 'primario', onclick: reintentar }, 'Reintentar ahora'),
    el('button', { class: 'secundario', onclick: salir }, 'Cerrar sesión'),
  ));
}

function renderLogin(pendientes) {
  const email = el('input', { type: 'email', autocomplete: 'username', required: '' });
  const clave = el('input', { type: 'password', autocomplete: 'current-password', required: '' });
  const aviso = el('div');

  const form = el('form', {
    onsubmit: async (e) => {
      e.preventDefault();
      aviso.replaceChildren();
      try {
        const r = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value.trim(), password: clave.value }),
        });
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || 'No se pudo ingresar');
        await chrome.storage.local.set({
          sesion: { accessToken: body.accessToken, refreshToken: body.refreshToken, user: body.user },
        });
        await reintentar();
      } catch (err) {
        aviso.replaceChildren(el('div', { class: 'aviso error' }, err.message));
      }
    },
  },
    el('label', {}, 'Correo de Cialo Hub', email),
    el('label', {}, 'Contraseña', clave),
    aviso,
    el('button', { class: 'primario', type: 'submit' }, 'Ingresar'),
  );
  form.style.cssText = 'display:flex;flex-direction:column;gap:10px';

  if (pendientes) {
    $contenido.append(el('div', { class: 'aviso error' }, `${pendientes} venta(s) esperando que ingreses.`));
  }
  $contenido.append(form);
}

async function reintentar() {
  $estado.textContent = 'Enviando…';
  await chrome.runtime.sendMessage({ tipo: 'reintentar' });
  await render();
}

async function salir() {
  const { sesion } = await chrome.storage.local.get('sesion');
  if (sesion?.refreshToken) {
    // Se invalida también en el servidor; si falla, igual se cierra acá.
    fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: sesion.refreshToken }),
    }).catch(() => {});
  }
  await chrome.storage.local.remove('sesion');
  await render();
}

void render();
