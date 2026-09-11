/*
 * Cialo Hub · puente entre la extensión y la app.
 *
 * Corre en administracion.cialo.cl sólo cuando la URL trae ?importar=reservo,
 * que es como la abre la extensión tras una venta en Reservo. Le entrega a la
 * app la venta pendiente y, cuando la app avisa que la registró o se descartó,
 * la saca de pendientes.
 *
 * Los datos viajan con postMessage dentro de la misma pestaña y no por la URL:
 * así el nombre del paciente no queda en el historial del navegador ni en los
 * logs del servidor.
 *
 * Protocolo (mensajes con `fuente` para no confundirse con otros):
 *   app → puente  { fuente: 'cialo-hub', tipo: 'listo-importar' }
 *   puente → app  { fuente: 'cialo-extension', tipo: 'importar-venta', venta }
 *   app → puente  { fuente: 'cialo-hub', tipo: 'importacion-resuelta', idExterno, estado, numero?, total? }
 *   puente → app  { fuente: 'cialo-extension', tipo: 'puente-listo' }   (por si la app habló primero)
 */
(() => {
  if (new URLSearchParams(location.search).get('importar') !== 'reservo') return;

  const enviar = (mensaje) => window.postMessage({ fuente: 'cialo-extension', ...mensaje }, location.origin);

  window.addEventListener('message', async (e) => {
    if (e.source !== window || e.origin !== location.origin) return;
    const d = e.data;
    if (d?.fuente !== 'cialo-hub') return;

    if (d.tipo === 'listo-importar') {
      const { pendientes = [], importacionActual } = await chrome.storage.local.get(['pendientes', 'importacionActual']);
      const item = pendientes.find((p) => p.venta.idExterno === importacionActual) ?? pendientes[0];
      enviar({ tipo: 'importar-venta', venta: item?.venta ?? null });
      return;
    }

    if (d.tipo === 'importacion-resuelta' && d.idExterno) {
      const { pendientes = [], historial = [] } = await chrome.storage.local.get(['pendientes', 'historial']);
      const resuelta = pendientes.find((p) => p.venta.idExterno === d.idExterno);
      historial.unshift({
        idExterno: d.idExterno,
        estado: d.estado,
        numero: d.numero ?? null,
        total: d.total ?? resuelta?.venta.totalReservo ?? null,
        cliente: resuelta?.venta.cliente ?? null,
        en: Date.now(),
      });
      await chrome.storage.local.set({
        pendientes: pendientes.filter((p) => p.venta.idExterno !== d.idExterno),
        historial: historial.slice(0, 20),
      });
      await chrome.storage.local.remove('importacionActual');
    }
  });

  // El puente corre al inicio de la página, pero por si la app ya estaba lista.
  enviar({ tipo: 'puente-listo' });
})();
