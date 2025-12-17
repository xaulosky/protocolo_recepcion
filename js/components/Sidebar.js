/**
 * Sidebar Component
 * Navegación lateral con categorías colapsables
 */

// Estructura de navegación del sidebar
const sidebarNavigation = {
    general: {
        title: 'General',
        icon: 'clipboard-list',
        items: [
            { id: 'base', label: 'Inicio', icon: 'home' },
            { id: 'pagos', label: 'Pagos y Citas', icon: 'credit-card' },
            { id: 'suspension', label: 'Protocolo de Suspensión', icon: 'alert-triangle' }
        ]
    },
    guiones: {
        title: 'Guiones',
        icon: 'message-circle',
        items: [
            { id: 'guiones', label: 'Todos los Guiones', icon: 'messages-square' },
            { id: 'guiones-gestion', label: 'Gestión', icon: 'folder', category: 'Gestion' },
            { id: 'guiones-estetica', label: 'Estética', icon: 'sparkles', category: 'Estetica' },
            { id: 'guiones-corporal', label: 'Corporal', icon: 'activity', category: 'Corporal' },
            { id: 'guiones-nutricion', label: 'Nutrición', icon: 'apple', category: 'Nutricion' },
            { id: 'guiones-medica', label: 'Médica', icon: 'stethoscope', category: 'Medica' },
            { id: 'guiones-indicaciones', label: 'Indicaciones', icon: 'file-text', category: 'Indicaciones' }
        ]
    },
    clinica: {
        title: 'Clínica',
        icon: 'building-2',
        items: [
            { id: 'tratamientos', label: 'Tratamientos', icon: 'sparkles' },
            { id: 'consultas', label: 'Consultas', icon: 'calendar-check' },
            { id: 'boxes', label: 'Boxes', icon: 'door-open' },
            { id: 'profesionales', label: 'Profesionales', icon: 'users' },
            { id: 'productos', label: 'Productos', icon: 'shopping-bag' }
        ]
    },
    documentos: {
        title: 'Documentos',
        icon: 'file-text',
        items: [
            { id: 'presupuestos', label: 'Presupuestos', icon: 'file-text' },
            { id: 'consentimientos', label: 'Consentimientos', icon: 'file-signature' }
        ]
    },
    administracion: {
        title: 'Administración',
        icon: 'building',
        items: [
            { id: 'solicitud-reembolso', label: 'Solicitud de Reembolso', icon: 'receipt-text' }
        ]
    }
};

/**
 * Renderiza SOLO la navegación del sidebar (no el sidebar completo)
 * El sidebar está en el HTML, solo actualizamos la navegación
 */
function SidebarNavigation() {
    const state = appState.getState();
    const expandedCategories = state.expandedCategories || ['general', 'guiones', 'clinica', 'documentos', 'administracion'];
    const isCollapsed = state.sidebarCollapsed || false;
    const isActive = state.activeTab === 'base';

    // Botón fijo de Dashboard + categorías
    const dashboardButton = `
        <button 
            onclick="appState.setState({activeTab: 'base'})"
            class="w-full flex items-center gap-3 px-3 py-3 mb-3 rounded-xl transition-all ${isActive
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        }"
        >
            <div class="w-8 h-8 ${isActive ? 'bg-white/20' : 'bg-purple-200'} rounded-lg flex items-center justify-center">
                <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
            </div>
            ${!isCollapsed ? `
                <div class="flex-1 text-left">
                    <span class="font-semibold text-sm">Dashboard</span>
                    <p class="text-xs ${isActive ? 'text-purple-200' : 'text-purple-500'}">Panel Principal</p>
                </div>
            ` : ''}
        </button>
    `;

    const categories = Object.entries(sidebarNavigation).map(([key, category]) =>
        renderSidebarCategory(key, category, state.activeTab, expandedCategories, isCollapsed)
    ).join('');

    return dashboardButton + categories;
}

/**
 * Actualiza el estado visual del sidebar (colapsado/expandido)
 */
function updateSidebarVisualState() {
    const state = appState.getState();
    const isCollapsed = state.sidebarCollapsed || false;
    const sidebar = document.getElementById('sidebar');
    const logo = document.getElementById('sidebarLogo');
    const searchContainer = document.getElementById('sidebarSearchContainer');
    const footer = document.getElementById('sidebarFooter');
    const toggleIcon = document.getElementById('sidebarToggleIcon');

    if (sidebar) {
        if (isCollapsed) {
            sidebar.classList.add('sidebar-collapsed');
        } else {
            sidebar.classList.remove('sidebar-collapsed');
        }
    }

    [logo, searchContainer, footer].forEach(el => {
        if (el) {
            if (isCollapsed) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        }
    });

    if (toggleIcon) {
        toggleIcon.setAttribute('data-lucide', isCollapsed ? 'panel-left-open' : 'panel-left-close');
        lucide.createIcons({ nodes: [toggleIcon] });
    }
}

/**
 * Renderiza el sidebar completo (legacy - mantener por compatibilidad)
 */
function Sidebar() {
    const state = appState.getState();
    const isCollapsed = state.sidebarCollapsed || false;
    const expandedCategories = state.expandedCategories || ['general', 'guiones', 'clinica', 'documentos', 'administracion'];

    return `
        <aside id="sidebar" class="sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}" role="navigation">
            <!-- Header del Sidebar -->
            <div class="sidebar-header">
                <div class="sidebar-logo ${isCollapsed ? 'hidden' : ''}">
                    <i data-lucide="layout-dashboard" class="w-6 h-6 text-purple-400"></i>
                    <span class="sidebar-title">Cialo Hub</span>
                </div>
                <button onclick="toggleSidebar()" class="sidebar-toggle" aria-label="Toggle sidebar">
                    <i data-lucide="${isCollapsed ? 'panel-left-open' : 'panel-left-close'}" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Búsqueda en Sidebar -->
            <div class="sidebar-search ${isCollapsed ? 'hidden' : ''}">
                ${SidebarSearch()}
            </div>

            <!-- Navegación -->
            <nav class="sidebar-nav">
                ${Object.entries(sidebarNavigation).map(([key, category]) =>
        renderSidebarCategory(key, category, state.activeTab, expandedCategories, isCollapsed)
    ).join('')}
            </nav>

            <!-- Footer del Sidebar -->
            <div class="sidebar-footer ${isCollapsed ? 'hidden' : ''}">
                <div class="text-xs text-slate-500 text-center">
                    <p>Clínica Cialo</p>
                    <p class="text-slate-400">v1.0.0</p>
                </div>
            </div>
        </aside>
    `;
}

/**
 * Renderiza la búsqueda del sidebar
 */
function SidebarSearch() {
    const state = appState.getState();
    return `
        <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"></i>
            <input 
                type="text" 
                id="globalSearchInput"
                placeholder="Buscar..." 
                value="${state.searchTerm || ''}"
                class="sidebar-search-input"
                autocomplete="off"
            >
            <button 
                id="clearSearchBtn"
                onclick="clearGlobalSearch()" 
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 ${state.searchTerm ? '' : 'hidden'}"
            >
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
}

/**
 * Renderiza una categoría del sidebar
 */
function renderSidebarCategory(key, category, activeTab, expandedCategories, isCollapsed) {
    const isExpanded = expandedCategories.includes(key);
    const hasActiveItem = category.items.some(item => {
        if (item.category) {
            return activeTab === 'guiones' && appState.getState().scriptCategory === item.category;
        }
        return item.id === activeTab || item.id.startsWith(activeTab);
    });

    if (isCollapsed) {
        // Versión colapsada: solo iconos
        return `
            <div class="sidebar-category-collapsed">
                <button 
                    onclick="expandSidebarAndNavigate('${category.items[0].id}')"
                    class="sidebar-item-collapsed ${hasActiveItem ? 'active' : ''}"
                    title="${category.title}"
                >
                    <i data-lucide="${category.icon}" class="w-5 h-5"></i>
                </button>
            </div>
        `;
    }

    return `
        <div class="sidebar-category">
            <button 
                onclick="toggleSidebarCategory('${key}')"
                class="sidebar-category-header ${hasActiveItem ? 'has-active' : ''}"
            >
                <div class="flex items-center gap-2">
                    <i data-lucide="${category.icon}" class="w-4 h-4"></i>
                    <span>${category.title}</span>
                </div>
                <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4 transition-transform"></i>
            </button>
            
            <div class="sidebar-category-items ${isExpanded ? '' : 'hidden'}">
                ${category.items.map(item => renderSidebarItem(item, activeTab)).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderiza un item del sidebar
 */
function renderSidebarItem(item, activeTab) {
    const state = appState.getState();
    let isActive = false;

    // Determinar si está activo
    if (item.category) {
        isActive = activeTab === 'guiones' && state.scriptCategory === item.category;
    } else if (item.id.startsWith('guiones-')) {
        isActive = false; // Los sub-items de guiones se manejan por categoría
    } else {
        isActive = item.id === activeTab;
    }

    return `
        <button 
            onclick="navigateToSection('${item.id}'${item.category ? `, '${item.category}'` : ''})"
            class="sidebar-item ${isActive ? 'active' : ''}"
        >
            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            <span>${item.label}</span>
        </button>
    `;
}

/**
 * Renderiza el overlay móvil
 */
function SidebarOverlay() {
    return `<div id="sidebarOverlay" class="sidebar-overlay hidden" onclick="closeMobileSidebar()"></div>`;
}

/**
 * Renderiza el botón de menú móvil
 */
function MobileMenuButton() {
    return `
        <button onclick="openMobileSidebar()" class="mobile-menu-btn" aria-label="Abrir menú">
            <i data-lucide="menu" class="w-6 h-6"></i>
        </button>
    `;
}

// ==================== FUNCIONES DE INTERACCIÓN ====================

/**
 * Toggle del sidebar (expandir/colapsar)
 */
function toggleSidebar() {
    const state = appState.getState();
    appState.setState({ sidebarCollapsed: !state.sidebarCollapsed });
}

/**
 * Toggle de una categoría del sidebar
 */
function toggleSidebarCategory(categoryKey) {
    const state = appState.getState();
    const expandedCategories = state.expandedCategories || ['general', 'guiones', 'clinica', 'documentos', 'administracion'];

    let newExpanded;
    if (expandedCategories.includes(categoryKey)) {
        newExpanded = expandedCategories.filter(c => c !== categoryKey);
    } else {
        newExpanded = [...expandedCategories, categoryKey];
    }

    appState.setState({ expandedCategories: newExpanded });
}

/**
 * Navegar a una sección
 */
function navigateToSection(sectionId, category = null) {
    // Cerrar sidebar en móvil
    closeMobileSidebar();

    // Si es un guion con categoría específica
    if (sectionId.startsWith('guiones-') && category) {
        appState.setState({
            activeTab: 'guiones',
            scriptCategory: category,
            searchTerm: ''
        });
    } else if (sectionId === 'guiones') {
        appState.setState({
            activeTab: 'guiones',
            searchTerm: ''
        });
    } else {
        appState.setState({
            activeTab: sectionId,
            searchTerm: ''
        });
    }
}

/**
 * Expandir sidebar y navegar (para modo colapsado)
 */
function expandSidebarAndNavigate(sectionId) {
    appState.setState({ sidebarCollapsed: false });
    // Pequeño delay para que se vea la animación
    setTimeout(() => {
        navigateToSection(sectionId);
    }, 100);
}

/**
 * Abrir sidebar en móvil
 */
function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) {
        sidebar.classList.add('mobile-open');
    }
    if (overlay) {
        overlay.classList.remove('hidden');
    }
    document.body.classList.add('sidebar-mobile-open');
}

/**
 * Cerrar sidebar en móvil
 */
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    if (overlay) {
        overlay.classList.add('hidden');
    }
    document.body.classList.remove('sidebar-mobile-open');
}

/**
 * Limpiar búsqueda global
 */
function clearGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    appState.setState({ searchTerm: '' });
}

// Variable para debounce
let searchDebounceTimer = null;
// Flag para evitar inicializar listeners globales múltiples veces
let globalListenersInitialized = false;

/**
 * Inicializar listeners del sidebar (solo una vez)
 */
function initSidebarListeners() {
    // Solo inicializar una vez
    if (globalListenersInitialized) return;
    globalListenersInitialized = true;

    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        // Búsqueda en tiempo real con debounce
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', handleSearchKeypress);
    }

    // Cerrar sidebar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileSidebar();
        }
    });

    // Manejar resize para cerrar sidebar móvil si se agranda la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            closeMobileSidebar();
        }
    });
}

/**
 * Handler para input de búsqueda con debounce
 */
function handleSearchInput(e) {
    const value = e.target.value;

    // Mostrar/ocultar botón de limpiar inmediatamente
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        if (value) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    // Limpiar timer anterior
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    // Debounce de 250ms para búsqueda
    searchDebounceTimer = setTimeout(() => {
        appState.setState({ searchTerm: value });
    }, 250);
}

/**
 * Handler para keypress en búsqueda (Enter busca inmediatamente)
 */
function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        appState.setState({ searchTerm: e.target.value });
    }
}
