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

    // Copiar al portapapeles
    navigator.clipboard.writeText(text).then(() => {
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

        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
            button.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-purple-100');
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el texto. Por favor, cópialo manualmente.');
    });
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
