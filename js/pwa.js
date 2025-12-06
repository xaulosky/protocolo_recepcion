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
        // Remover notificación anterior si existe
        const existingNotification = document.getElementById('pwa-update-notification');
        if (existingNotification) existingNotification.remove();

        // Crear notificación de actualización mejorada
        const notification = document.createElement('div');
        notification.id = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="update-notification-content">
                <div class="update-notification-icon">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                </div>
                <div class="update-notification-text">
                    <p class="update-notification-title">¡Nueva versión disponible!</p>
                    <p class="update-notification-subtitle">Actualiza para obtener las últimas mejoras</p>
                </div>
                <div class="update-notification-actions">
                    <button id="pwa-update-btn" class="update-btn-primary">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        Actualizar
                    </button>
                    <button id="pwa-update-dismiss" class="update-btn-dismiss">
                        Después
                    </button>
                </div>
            </div>
        `;
        notification.className = 'pwa-update-notification';

        // Agregar estilos para la notificación
        if (!document.getElementById('pwa-update-styles')) {
            const style = document.createElement('style');
            style.id = 'pwa-update-styles';
            style.textContent = `
                .pwa-update-notification {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    z-index: 9999;
                    animation: slideUp 0.5s ease-out forwards, pulse-glow 2s ease-in-out infinite 0.5s;
                }
                
                @media (min-width: 640px) {
                    .pwa-update-notification {
                        bottom: auto;
                        top: 24px;
                        transform: translateX(-50%) translateY(-100px);
                        animation: slideDown 0.5s ease-out forwards, pulse-glow 2s ease-in-out infinite 0.5s;
                    }
                }
                
                @keyframes slideUp {
                    to { transform: translateX(-50%) translateY(0); }
                }
                
                @keyframes slideDown {
                    to { transform: translateX(-50%) translateY(0); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 10px 40px rgba(0, 0, 0, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 10px 40px rgba(0, 0, 0, 0.3); }
                }
                
                .update-notification-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
                    border-radius: 16px;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: white;
                    min-width: 280px;
                    max-width: 360px;
                }
                
                @media (min-width: 640px) {
                    .update-notification-content {
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: center;
                        min-width: 400px;
                    }
                }
                
                .update-notification-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    background: rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    animation: spin-slow 3s linear infinite;
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .update-notification-text {
                    text-align: center;
                    flex: 1;
                }
                
                @media (min-width: 640px) {
                    .update-notification-text {
                        text-align: left;
                    }
                }
                
                .update-notification-title {
                    font-weight: 600;
                    font-size: 1rem;
                    margin: 0;
                    color: white;
                }
                
                .update-notification-subtitle {
                    font-size: 0.8rem;
                    margin: 4px 0 0 0;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .update-notification-actions {
                    display: flex;
                    gap: 8px;
                    width: 100%;
                    justify-content: center;
                }
                
                @media (min-width: 640px) {
                    .update-notification-actions {
                        width: auto;
                    }
                }
                
                .update-btn-primary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #8b5cf6, #a855f7);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex: 1;
                }
                
                @media (min-width: 640px) {
                    .update-btn-primary {
                        flex: none;
                    }
                }
                
                .update-btn-primary:hover {
                    background: linear-gradient(135deg, #7c3aed, #9333ea);
                    transform: scale(1.05);
                }
                
                .update-btn-dismiss {
                    padding: 10px 16px;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .update-btn-dismiss:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .pwa-update-notification.hiding {
                    animation: fadeOut 0.3s ease-out forwards;
                }
                
                @keyframes fadeOut {
                    to { 
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Event listener para actualizar
        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });
        
        // Event listener para descartar
        document.getElementById('pwa-update-dismiss').addEventListener('click', () => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        });

        // NO auto-ocultar - dejar que el usuario decida
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
