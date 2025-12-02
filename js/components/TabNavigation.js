/**
 * TabNavigation Component
 * Navegación por pestañas
 */

function TabNavigation() {
    const { activeTab } = appState.getState();

    const tabs = [
        { id: 'base', label: 'Protocolo Base', icon: 'check-circle' },
        { id: 'guiones', label: 'Guiones Técnicos', icon: 'message-circle' },
        { id: 'pagos', label: 'Pagos y Citas', icon: 'credit-card' },
        { id: 'productos', label: 'Productos', icon: 'shopping-bag' }
    ];

    return `
        <div class="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto no-scrollbar">
            ${tabs.map(tab => renderTabButton(tab, activeTab)).join('')}
        </div>
    `;
}

function renderTabButton(tab, activeTab) {
    const isActive = activeTab === tab.id;
    return `
        <button 
            data-tab="${tab.id}"
            class="flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap 
            ${isActive ? 'bg-white text-purple-700 border-purple-600' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}"
        >
            <i data-lucide="${tab.icon}" class="w-4 h-4"></i> ${tab.label}
        </button>
    `;
}

/**
 * Inicializa los event listeners de las pestañas
 */
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('[data-tab]');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            appState.setActiveTab(tabId);
        });
    });
}
