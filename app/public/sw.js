/* Service worker para Web Push (Cialo Hub). */
self.addEventListener('push', (event) => {
  let payload = { title: 'Cialo Hub', body: 'Tienes una notificación' };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    /* payload por defecto */
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: payload.data || {},
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => 'focus' in c);
      if (client) return client.focus();
      return self.clients.openWindow('/');
    }),
  );
});
