/* Service worker para Web Push (Cialo Hub / Mensajería). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = { title: 'Cialo Mensajería', body: 'Tienes un mensaje nuevo' };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    /* payload por defecto */
  }
  const data = payload.data || {};
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/chat-icon.svg',
      badge: '/chat-icon.svg',
      tag: data.conversationId || 'cialo-chat', // agrupa por conversación
      renotify: true,
      data,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/mensajeria';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Si ya hay una ventana de mensajería abierta, enfocarla; si no, abrir una.
      const open = clients.find((c) => c.url.includes('/mensajeria')) || clients.find((c) => 'focus' in c);
      if (open) return open.focus();
      return self.clients.openWindow(target);
    }),
  );
});
