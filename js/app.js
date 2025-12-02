/**
 * App.js - Orquestador Principal
 * Coordina todos los componentes y gestiona el renderizado
 */

class App {
    constructor() {
        this.headerContainer = null;
        this.mainContent = null;
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.headerContainer = document.getElementById('headerContainer');
        this.mainContent = document.getElementById('mainContent');

        // Renderizar header (estático)
        this.renderHeader();

        // Suscribirse a cambios de estado
        appState.subscribe(() => this.render());

        // Renderizado inicial
        this.render();
    }

    /**
     * Renderiza el header (solo una vez)
     */
    renderHeader() {
        if (this.headerContainer) {
            this.headerContainer.innerHTML = Header() + SearchBar();
            initSearchBar();
            lucide.createIcons();
        }
    }

    /**
     * Renderiza el contenido principal basado en el estado
     */
    render() {
        if (!this.mainContent) return;

        const state = appState.getState();

        // Si hay búsqueda activa, mostrar resultados
        if (state.searchTerm.trim() !== '') {
            this.mainContent.innerHTML = SearchResults(state.searchTerm);
        } else {
            // Mostrar vista de pestañas
            this.renderTabsView(state);
        }

        // Refrescar iconos de Lucide
        lucide.createIcons();
    }

    /**
     * Renderiza la vista de pestañas
     */
    renderTabsView(state) {
        let content = '';

        // Renderizar contenido según pestaña activa
        switch (state.activeTab) {
            case 'base':
                content = ProtocolBase();
                break;
            case 'guiones':
                content = GuionesContent();
                break;
            case 'pagos':
                content = PagosContent();
                break;
        }

        this.mainContent.innerHTML = `
            ${TabNavigation()}
            <div class="p-6 flex-grow overflow-y-auto fade-in">
                ${content}
            </div>
        `;

        // Inicializar event listeners
        initTabNavigation();
        if (state.activeTab === 'guiones') {
            initGuionesContent();
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
    const tooltip = document.createElement('div');
    tooltip.className = 'fixed bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    tooltip.style.top = '20px';
    tooltip.style.right = '20px';
    tooltip.innerHTML = `
        <div class="flex items-center gap-2">
            <i data-lucide="check-circle" class="w-5 h-5"></i>
            <span class="font-medium">¡Texto copiado al portapapeles!</span>
        </div>
    `;

    document.body.appendChild(tooltip);
    lucide.createIcons();

    // Remover después de 3 segundos
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

/**
 * Mostrar tooltip de error
 */
function showErrorTooltip(button) {
    const tooltip = document.createElement('div');
    tooltip.className = 'fixed bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    tooltip.style.top = '20px';
    tooltip.style.right = '20px';
    tooltip.innerHTML = `
        <div class="flex items-center gap-2">
            <i data-lucide="x-circle" class="w-5 h-5"></i>
            <span class="font-medium">Error al copiar. Intenta de nuevo.</span>
        </div>
    `;

    document.body.appendChild(tooltip);
    lucide.createIcons();

    // Remover después de 3 segundos
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
