/*
 * Popup de la extensión: ventas confirmadas en Reservo que todavía no se
 * registran en Cialo Hub (para volver a abrirlas), las últimas registradas y
 * el registro de lo que hizo la extensión.
 *
 * No hay login: la venta la registra la app de Cialo Hub con la sesión que ya
 * tiene abierta, así que la extensión no guarda contraseñas ni tokens.
 */
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
  const { pendientes = [], historial = [], registro = [] } = await chrome.storage.local.get(['pendientes', 'historial', 'registro']);
  $contenido.replaceChildren();
  $estado.textContent = pendientes.length
    ? `${pendientes.length} venta(s) por registrar en Cialo Hub`
    : 'Al realizar una venta en Reservo se abre Cialo Hub con la venta cargada.';

  $contenido.append(el('section', {},
    el('h2', {}, `Por registrar (${pendientes.length})`),
    pendientes.length
      ? el('ul', {}, pendientes.map((p) => el('li', {},
          `${p.venta.cliente ?? 'Sin cliente'} · ${pesos(p.venta.totalReservo)}`,
          el('span', { class: 'sub' }, `${p.venta.items.length} ítem(s) · ${hora(p.en)}`),
          el('button', { class: 'primario', style: 'margin-top:6px;width:100%', onclick: () => abrir(p.venta.idExterno) }, 'Abrir en Cialo Hub'))))
      : el('p', { class: 'vacio' }, 'Nada pendiente.'),
  ));

  $contenido.append(el('section', {},
    el('h2', {}, 'Últimas'),
    historial.length
      ? el('ul', {}, historial.slice(0, 6).map((h) => el('li', {},
          h.estado === 'registrada' ? `N° ${h.numero} · ${pesos(h.total)}` : `Descartada · ${pesos(h.total)}`,
          el('span', { class: 'sub' }, `${h.cliente ?? 'Sin cliente'} · ${hora(h.en)}`))))
      : el('p', { class: 'vacio' }, 'Todavía no se registró ninguna venta.'),
  ));

  const detalles = el('details', {},
    el('summary', {}, `Registro (${registro.length})`),
    registro.length
      ? el('ul', {}, registro.slice(0, 15).map((r) => el('li', {},
          `${hora(r.en)} · ${r.evento}`,
          r.detalle ? el('span', { class: 'sub' }, r.detalle) : null)))
      : el('p', { class: 'vacio' }, 'Sin actividad todavía.'),
  );
  detalles.style.cssText = 'font-size:12px;color:var(--muted)';
  $contenido.append(detalles);
}

async function abrir(idExterno) {
  await chrome.runtime.sendMessage({ tipo: 'abrir', idExterno });
  window.close();
}

chrome.storage.onChanged.addListener(() => void render());
void render();
