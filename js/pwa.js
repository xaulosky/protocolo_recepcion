// PWA Manager - Gestión de instalación y actualizaciones
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.swRegistration = null;
        this.init();
    }

    init() {
        // Registrar Service Worker
        this.registerServiceWorker();

        // Detectar si ya está instalada
        this.checkIfInstalled();

        // Escuchar evento de instalación
        this.listenForInstallPrompt();

        // Detectar cuando se instala
        this.detectInstallation();

        // Verificar actualizaciones periódicamente
        this.checkForUpdates();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                this.swRegistration = registration;
                console.log('[PWA] Service Worker registrado:', registration.scope);

                // Verificar si hay actualizaciones
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('[PWA] Nueva versión del Service Worker encontrada');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Hay una nueva versión disponible
                            this.showUpdateNotification();
                        }
                    });
                });

                // Verificar actualizaciones cada hora
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (error) {
                console.error('[PWA] Error registrando Service Worker:', error);
            }
        } else {
            console.warn('[PWA] Service Workers no soportados en este navegador');
        }
    }

    checkIfInstalled() {
        // Verificar si está en modo standalone (instalada)
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('[PWA] App ejecutándose como instalada');
            document.body.classList.add('pwa-installed');
        }
    }

    listenForInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Evento beforeinstallprompt capturado');

            // Prevenir el prompt automático
            e.preventDefault();

            // Guardar el evento para usarlo después
            this.deferredPrompt = e;

            // Mostrar botón de instalación personalizado
            this.showInstallButton();
        });
    }

    detectInstallation() {
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App instalada exitosamente');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showInstalledNotification();
        });
    }

    showInstallButton() {
        // Crear botón de instalación si no existe
        let installBtn = document.getElementById('pwa-install-btn');

        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Instalar App
      `;
            installBtn.className = `
        fixed bottom-6 right-6 z-50
        flex items-center
        bg-gradient-to-r from-blue-600 to-purple-600
        text-white px-6 py-3 rounded-full
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        transition-all duration-300
        font-medium
        animate-bounce-slow
      `;

            installBtn.addEventListener('click', () => this.promptInstall());
            document.body.appendChild(installBtn);

            // Agregar animación personalizada
            const style = document.createElement('style');
            style.textContent = `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .animate-bounce-slow:hover {
          animation: none;
        }
      `;
            document.head.appendChild(style);
        }

        installBtn.style.display = 'flex';
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('[PWA] No hay prompt de instalación disponible');
            return;
        }

        // Mostrar el prompt de instalación
        this.deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWA] Usuario respondió:', outcome);

        if (outcome === 'accepted') {
            console.log('[PWA] Usuario aceptó la instalación');
        } else {
            console.log('[PWA] Usuario rechazó la instalación');
        }

        // Limpiar el prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    showUpdateNotification() {
        // Crear notificación de actualización
        const notification = document.createElement('div');
        notification.id = 'pwa-update-notification';
        notification.innerHTML = `
      <div class="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg shadow-lg">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span class="font-medium">Nueva versión disponible</span>
        </div>
        <button id="pwa-update-btn" class="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
          Actualizar
        </button>
      </div>
    `;
        notification.className = 'fixed top-6 right-6 z-50 max-w-md animate-slide-in';

        document.body.appendChild(notification);

        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });

        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            // Enviar mensaje al service worker para que se active
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

            // Recargar la página cuando el nuevo SW tome control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    showInstalledNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
      <div class="flex items-center p-4 bg-green-600 text-white rounded-lg shadow-lg">
        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="font-medium">¡App instalada exitosamente!</span>
      </div>
    `;
        notification.className = 'fixed top-6 right-6 z-50 animate-slide-in';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    checkForUpdates() {
        // Verificar actualizaciones cada vez que la app gana foco
        window.addEventListener('focus', () => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        });
    }

    // Método para pre-cachear recursos adicionales
    async cacheResources(urls) {
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage({
                type: 'CACHE_URLS',
                urls: urls
            });
        }
    }

    // Obtener información de conectividad
    getConnectionStatus() {
        return {
            online: navigator.onLine,
            effectiveType: navigator.connection?.effectiveType || 'unknown',
            saveData: navigator.connection?.saveData || false
        };
    }
}

// Inicializar PWA Manager cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaManager = new PWAManager();
    });
} else {
    window.pwaManager = new PWAManager();
}

// Exportar para uso global
window.PWAManager = PWAManager;
