/**
 * App.js - Orquestador Principal
 * Coordina todos los componentes y gestiona el renderizado
 */

class App {
    constructor() {
        this.sidebarNav = null;
        this.mainContent = null;
        this.lastSidebarState = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.sidebarNav = document.getElementById('sidebarNav');
        this.mainContent = document.getElementById('mainContent');

        // Renderizar navegación del sidebar
        this.renderSidebarNav();

        // Inicializar iconos de Lucide para elementos estáticos
        lucide.createIcons();

        // Guardar estado inicial del sidebar
        const state = appState.getState();
        this.lastSidebarState = this.getSidebarStateKey(state);

        // Inicializar listeners del sidebar (solo una vez)
        initSidebarListeners();

        // Suscribirse a cambios de estado
        appState.subscribe(() => this.onStateChange());

        // Renderizado inicial del contenido
        this.renderContent();

        this.isInitialized = true;
    }

    /**
     * Obtiene la clave del estado del sidebar para comparación
     */
    getSidebarStateKey(state) {
        return JSON.stringify({
            activeTab: state.activeTab,
            scriptCategory: state.scriptCategory,
            sidebarCollapsed: state.sidebarCollapsed,
            expandedCategories: state.expandedCategories
        });
    }

    /**
     * Verifica si el sidebar necesita re-renderizarse
     */
    shouldUpdateSidebar(state) {
        const currentKey = this.getSidebarStateKey(state);
        if (this.lastSidebarState !== currentKey) {
            this.lastSidebarState = currentKey;
            return true;
        }
        return false;
    }

    /**
     * Renderiza solo la navegación del sidebar (no recrea el input)
     */
    renderSidebarNav() {
        if (this.sidebarNav) {
            this.sidebarNav.innerHTML = SidebarNavigation();
            lucide.createIcons({ nodes: [this.sidebarNav] });
        }
        // Actualizar estado visual (colapsado/expandido)
        updateSidebarVisualState();
    }

    /**
     * Maneja cambios de estado
     */
    onStateChange() {
        if (!this.mainContent) return;

        const state = appState.getState();

        // Solo actualizar navegación del sidebar si cambió algo relevante (NO searchTerm)
        if (this.shouldUpdateSidebar(state)) {
            this.renderSidebarNav();
        }

        // Siempre actualizar contenido
        this.renderContent();
    }

    /**
     * Renderiza solo el contenido principal
     */
    renderContent() {
        if (!this.mainContent) return;

        const state = appState.getState();

        // Si hay búsqueda activa, mostrar resultados
        if (state.searchTerm && state.searchTerm.trim() !== '') {
            this.mainContent.innerHTML = `
                <div class="fade-in">
                    ${SearchResults(state.searchTerm)}
                </div>
            `;
        } else {
            // Mostrar vista de contenido
            this.renderContentView(state);
        }

        // Refrescar iconos de Lucide en el contenido
        lucide.createIcons();
    }

    /**
     * Renderiza la vista de contenido (sin tabs)
     */
    renderContentView(state) {
        let content = '';
        let title = '';
        let icon = '';

        // Renderizar contenido según sección activa
        switch (state.activeTab) {
            case 'base':
                title = 'Inicio';
                icon = 'layout-dashboard';
                content = HomeContent();
                break;
            case 'protocolos-base':
                title = 'Protocolo Base';
                icon = 'clipboard-list';
                content = ProtocolBase();
                break;
            case 'guiones':
                title = 'Guiones Técnicos';
                icon = 'message-circle';
                content = GuionesContent();
                break;
            case 'protocolos-genericos':
                // Nota: El título e icono se gestionan internamente en el componente
                title = 'Protocolos Internos';
                icon = 'book-open';
                content = ProtocolCategoryContent();
                break;
            case 'pagos':
                title = 'Pagos y Citas';
                icon = 'credit-card';
                content = PagosContent();
                break;
            case 'productos':
                title = 'Productos';
                icon = 'shopping-bag';
                content = ProductosContent();
                break;
            case 'consentimientos':
                title = 'Consentimientos';
                icon = 'file-signature';
                content = ConsentimientosContent();
                break;
            case 'presupuestos':
                title = 'Presupuestos';
                icon = 'file-text';
                content = PresupuestosContent();
                break;
            case 'presupuestos-ai':
                title = 'Presupuestos con IA';
                icon = 'sparkles';
                content = PresupuestosAIContent();
                break;
            case 'profesionales':
                title = 'Profesionales';
                icon = 'users';
                content = ProfesionalesContent();
                break;
            case 'boxes':
                title = 'Boxes y Pabellón';
                icon = 'door-open';
                content = BoxesContent();
                break;
            case 'consultas':
                title = 'Consultas y Evaluaciones';
                icon = 'calendar-check';
                content = ConsultasContent();
                break;
            case 'tratamientos':
                title = 'Catálogo de Tratamientos';
                icon = 'sparkles';
                content = TratamientosContent();
                break;
            case 'suspension':
                title = 'Protocolo de Suspensión y Paquetes Prepagados';
                icon = 'alert-triangle';
                content = ProtocoloSuspensionContent();
                break;
            case 'solicitud-reembolso':
                title = 'Solicitud de Reembolso';
                icon = 'receipt-text';
                content = SolicitudReembolsoContent();
                break;
            case 'giftcards':
                title = 'Generar Gift Card';
                icon = 'gift';
                content = GiftCardContent();
                break;
            case 'faq':
                title = 'Preguntas Frecuentes';
                icon = 'help-circle';
                content = FAQContent();
                break;
            default:
                title = 'Inicio';
                icon = 'layout-dashboard';
                content = HomeContent();
        }

        if (state.activeTab === 'tratamientos') {
            // Aplicar modo full-height para Tratamientos
            this.mainContent.classList.add('app-mode-full-height');
            this.mainContent.innerHTML = `
                <div class="fade-in h-full">
                    ${content}
                </div>
            `;
        } else {
            // Modo normal con scroll
            this.mainContent.classList.remove('app-mode-full-height');
            this.mainContent.innerHTML = `
                <div class="fade-in">
                    <!-- Header de sección -->
                    <div class="mb-6 pb-4 border-b border-slate-200">
                        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div class="p-2 bg-purple-100 rounded-lg">
                                <i data-lucide="${icon}" class="w-6 h-6 text-purple-600"></i>
                            </div>
                            ${title}
                        </h1>
                    </div>
                    
                    <!-- Contenido -->
                    <div class="content-area">
                        ${content}
                    </div>
                </div>
            `;
        }

        // Inicializar event listeners específicos
        if (state.activeTab === 'guiones') {
            initGuionesContent();
        }
        if (state.activeTab === 'productos') {
            initProductosContent();
        }
        if (state.activeTab === 'profesionales') {
            initProfesionalesListeners();
        }
        if (state.activeTab === 'boxes') {
            initBoxesContent();
        }
        if (state.activeTab === 'consultas') {
            initConsultasContent();
        }
        if (state.activeTab === 'presupuestos') {
            initPresupuestosContent();
        }
        if (state.activeTab === 'presupuestos-ai') {
            initPresupuestosAIContent();
        }
        if (state.activeTab === 'tratamientos') {
            initTratamientosContent();
        }
        if (state.activeTab === 'solicitud-reembolso') {
            initSolicitudReembolsoContent();
        }
        if (state.activeTab === 'giftcards') {
            initGiftCardContent();
        }
    }
}

/**
 * Función global para copiar contenido de guiones al portapapeles
 */
function copyScriptContent(scriptId) {
    const element = document.getElementById(scriptId);
    if (!element) return;

    // Obtener el texto y limpiar espacios innecesarios
    let text = element.textContent;

    // Eliminar espacios al inicio y final
    text = text.trim();

    // Eliminar espacios excesivos al inicio de cada línea
    text = text.split('\n').map(line => line.trimStart()).join('\n');

    // Eliminar comillas del inicio y final si existen
    text = text.replace(/^[""]|[""]$/g, '');

    // Función para copiar con método moderno
    const copyWithClipboardAPI = () => {
        return navigator.clipboard.writeText(text);
    };

    // Función de fallback para navegadores antiguos o contextos sin HTTPS
    const copyWithFallback = () => {
        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('execCommand failed'));
                }
            } catch (err) {
                document.body.removeChild(textarea);
                reject(err);
            }
        });
    };

    // Intentar copiar con el método moderno, si falla usar fallback
    const copyPromise = navigator.clipboard && navigator.clipboard.writeText
        ? copyWithClipboardAPI()
        : copyWithFallback();

    copyPromise.then(() => {
        // Feedback visual: cambiar el botón temporalmente
        const button = event.target.closest('button');
        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>¡Copiado!</span>
        `;
        button.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-purple-100');
        button.classList.add('bg-green-100', 'text-green-700', 'border-green-300');

        // Refrescar iconos
        lucide.createIcons();

        // Mostrar tooltip de notificación
        showCopyTooltip(button);

        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
            button.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-purple-100');
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);

        // Mostrar tooltip de error
        const button = event.target.closest('button');
        showErrorTooltip(button);
    });
}

/**
 * Mostrar tooltip de éxito al copiar
 */
function showCopyTooltip(button) {
    // Remover tooltip anterior si existe
    const existingTooltip = document.getElementById('copyTooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.id = 'copyTooltip';
    tooltip.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: #16a34a;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        opacity: 0;
        transition: all 0.3s ease;
    `;

    tooltip.innerHTML = `
        <i data-lucide="check-circle" class="w-5 h-5"></i>
        <span>¡Texto copiado correctamente!</span>
    `;

    document.body.appendChild(tooltip);
    lucide.createIcons();

    // Animar entrada
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Remover después de 3 segundos
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

/**
 * Mostrar tooltip de error
 */
function showErrorTooltip(button) {
    // Remover tooltip anterior si existe
    const existingTooltip = document.getElementById('errorTooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.id = 'errorTooltip';
    tooltip.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: #dc2626;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        opacity: 0;
        transition: all 0.3s ease;
    `;

    tooltip.innerHTML = `
        <i data-lucide="x-circle" class="w-5 h-5"></i>
        <span>Error al copiar. Intenta de nuevo.</span>
    `;

    document.body.appendChild(tooltip);
    lucide.createIcons();

    // Animar entrada
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Remover después de 3 segundos
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
