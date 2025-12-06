// Service Worker para PWA - Cialo Hub
const CACHE_NAME = 'cialo-hub-v1.3.0';
const RUNTIME_CACHE = 'cialo-hub-runtime-v1.3.0';

// Archivos esenciales para cachear durante la instalación
const ESSENTIAL_FILES = [
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/state.js',
    '/js/data.js',
    '/js/productsData.js',
    '/js/consentimientosData.js',
    '/js/profesionalesData.js',
    '/js/boxesData.js',
    '/js/components/Sidebar.js',
    '/js/components/Header.js',
    '/js/components/SearchBar.js',
    '/js/components/TabNavigation.js',
    '/js/components/ProtocolBase.js',
    '/js/components/GuionesContent.js',
    '/js/components/PagosContent.js',
    '/js/components/ProductosContent.js',
    '/js/components/ConsentimientosContent.js',
    '/js/components/ConsentSignature.js',
    '/js/components/ProfesionalesContent.js',
    '/js/components/BoxesContent.js',
    '/js/components/SearchResults.js',
    '/manifest.json'
];

// CDN resources (cacheamos pero no son críticos)
const CDN_RESOURCES = [
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker v3.1.0...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando archivos esenciales...');
                // Intentamos cachear archivos esenciales
                return cache.addAll(ESSENTIAL_FILES)
                    .catch((error) => {
                        console.warn('[SW] Error cacheando algunos archivos esenciales:', error);
                        // Intentamos cachear uno por uno para identificar cuál falla
                        return Promise.all(
                            ESSENTIAL_FILES.map(url =>
                                cache.add(url).catch(err => console.warn(`[SW] No se pudo cachear ${url}:`, err))
                            )
                        );
                    });
            })
            .then(() => {
                console.log('[SW] Archivos esenciales cacheados');
                // Intentamos cachear CDN resources (no crítico)
                return caches.open(RUNTIME_CACHE);
            })
            .then((cache) => {
                console.log('[SW] Cacheando recursos CDN...');
                return Promise.all(
                    CDN_RESOURCES.map(url =>
                        cache.add(url).catch(err => console.warn(`[SW] No se pudo cachear CDN ${url}:`, err))
                    )
                );
            })
            .then(() => {
                console.log('[SW] Service Worker instalado correctamente');
                return self.skipWaiting(); // Activar inmediatamente
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker v3.1.0...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // Eliminar cachés antiguos
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[SW] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim(); // Tomar control inmediatamente
            })
    );
});

// Estrategia de fetch: Cache First con Network Fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests que no sean GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar chrome-extension y otros protocolos
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[SW] Sirviendo desde caché:', request.url);
                    return cachedResponse;
                }

                // Si no está en caché, hacer fetch
                console.log('[SW] Fetching desde red:', request.url);
                return fetch(request)
                    .then((response) => {
                        // Solo cachear respuestas válidas
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clonar la respuesta porque es un stream de un solo uso
                        const responseToCache = response.clone();

                        // Decidir qué caché usar
                        const cacheName = ESSENTIAL_FILES.includes(url.pathname) ||
                            url.pathname.endsWith('.js') ||
                            url.pathname.endsWith('.css') ||
                            url.pathname.endsWith('.html')
                            ? CACHE_NAME
                            : RUNTIME_CACHE;

                        caches.open(cacheName)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                                console.log('[SW] Recurso cacheado:', request.url);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] Error en fetch:', error);

                        // Si es una página HTML, podríamos retornar una página offline
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }

                        throw error;
                    });
            })
    );
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Recibido mensaje SKIP_WAITING');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        console.log('[SW] Recibido mensaje para cachear URLs:', event.data.urls);
        event.waitUntil(
            caches.open(RUNTIME_CACHE)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
});

// Sincronización en segundo plano (opcional, para futuras features)
self.addEventListener('sync', (event) => {
    console.log('[SW] Evento de sincronización:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Aquí podrías sincronizar datos cuando haya conexión
            Promise.resolve()
        );
    }
});

console.log('[SW] Service Worker cargado');
