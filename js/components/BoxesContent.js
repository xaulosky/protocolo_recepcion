/**
 * BoxesContent Component
 * Muestra información de los boxes de Clínica Cialo
 */

function BoxesContent() {
    const state = appState.getState();
    const searchTerm = state.boxSearchTerm || '';
    const selectedCategory = state.boxCategory || 'todas';
    const viewMode = state.boxViewMode || 'cards';

    return `
        <div class="space-y-6">
            <!-- Header de sección -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i data-lucide="door-open" class="w-6 h-6 text-indigo-600"></i>
                        Boxes y Pabellón
                    </h2>
                    <p class="text-slate-500 text-sm mt-1">Información de los espacios de atención de Clínica Cialo</p>
                </div>
                
                <!-- Controles de vista -->
                <div class="flex items-center gap-2">
                    <button onclick="setBoxViewMode('cards')" 
                        class="p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
                        <i data-lucide="layout-grid" class="w-5 h-5"></i>
                    </button>
                    <button onclick="setBoxViewMode('list')" 
                        class="p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
                        <i data-lucide="list" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Barra de búsqueda -->
            <div class="relative">
                <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input 
                    type="text" 
                    id="boxSearchInput"
                    placeholder="Buscar por nombre, tecnología, profesional o uso..." 
                    value="${searchTerm}"
                    class="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                ${searchTerm ? `
                    <button onclick="clearBoxSearch()" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                ` : ''}
            </div>

            <!-- Filtros por categoría -->
            <div class="flex flex-wrap gap-2">
                ${boxCategorias.map(cat => `
                    <button 
                        onclick="setBoxCategory('${cat.id}')"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${selectedCategory === cat.id 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
                    >
                        <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
                        ${cat.label}
                    </button>
                `).join('')}
            </div>

            <!-- Contenido de boxes -->
            ${renderBoxesContent(searchTerm, selectedCategory, viewMode)}
            
            <!-- Sección de Tecnologías -->
            ${renderTecnologiasSection()}
        </div>
    `;
}

function renderBoxesContent(searchTerm, selectedCategory, viewMode) {
    let filteredBoxes = boxesData;

    // Filtrar por categoría
    if (selectedCategory !== 'todas') {
        filteredBoxes = filteredBoxes.filter(box => 
            box.categorias.includes(selectedCategory)
        );
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredBoxes = filteredBoxes.filter(box => 
            box.nombre.toLowerCase().includes(term) ||
            box.alias.toLowerCase().includes(term) ||
            box.tipo.toLowerCase().includes(term) ||
            box.descripcion.toLowerCase().includes(term) ||
            box.usosPrincipales.some(uso => uso.toLowerCase().includes(term)) ||
            box.equipamiento.some(eq => eq.nombre.toLowerCase().includes(term)) ||
            box.profesionalesFrecuentes.some(prof => prof.toLowerCase().includes(term))
        );
    }

    if (filteredBoxes.length === 0) {
        return `
            <div class="text-center py-12 text-slate-500">
                <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-4 text-slate-300"></i>
                <p class="font-medium">No se encontraron boxes</p>
                <p class="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
        `;
    }

    if (viewMode === 'list') {
        return renderBoxesList(filteredBoxes);
    }

    return renderBoxesCards(filteredBoxes);
}

function renderBoxesCards(boxes) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${boxes.map(box => renderBoxCard(box)).join('')}
        </div>
    `;
}

function renderBoxCard(box) {
    const colorClasses = getColorClasses(box.color);
    const tecnologias = box.equipamiento.filter(eq => eq.tipo === 'tecnologia');
    
    return `
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
             onclick="toggleBoxDetail(${box.id})">
            <!-- Header del card -->
            <div class="${colorClasses.bg} p-4">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div class="${colorClasses.icon} p-2 rounded-lg">
                            <i data-lucide="${box.icono}" class="w-6 h-6 text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">${box.nombre}</h3>
                            <p class="text-sm ${colorClasses.text}">${box.alias}</p>
                        </div>
                    </div>
                    <span class="text-xs font-medium ${colorClasses.badge} px-2 py-1 rounded-full">
                        ${box.tipo.split('/')[0].trim()}
                    </span>
                </div>
            </div>
            
            <!-- Body del card -->
            <div class="p-4">
                <p class="text-sm text-slate-600 mb-3 line-clamp-2">${box.descripcion}</p>
                
                <!-- Tecnologías destacadas -->
                ${tecnologias.length > 0 ? `
                    <div class="mb-3">
                        <p class="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tecnologías</p>
                        <div class="flex flex-wrap gap-1.5">
                            ${tecnologias.map(t => `
                                <span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                                    ${t.nombre}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Profesionales -->
                <div class="flex items-center gap-2 text-xs text-slate-500">
                    <i data-lucide="users" class="w-4 h-4"></i>
                    <span>${box.profesionalesFrecuentes.slice(0, 2).join(', ')}${box.profesionalesFrecuentes.length > 2 ? '...' : ''}</span>
                </div>
            </div>
            
            <!-- Footer con indicador de expandir -->
            <div class="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
                <i data-lucide="chevron-down" class="w-4 h-4 mr-1"></i>
                Ver detalles
            </div>
        </div>
        
        <!-- Panel de detalles expandido -->
        <div id="boxDetail-${box.id}" class="hidden col-span-full">
            ${renderBoxDetailPanel(box)}
        </div>
    `;
}

function renderBoxDetailPanel(box) {
    const colorClasses = getColorClasses(box.color);
    
    return `
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="${box.icono}" class="${colorClasses.iconText} w-5 h-5"></i>
                    ${box.nombre} - ${box.alias}
                </h3>
                <button onclick="toggleBoxDetail(${box.id})" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <p class="text-slate-600">${box.descripcion}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Usos principales -->
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <i data-lucide="clipboard-list" class="w-4 h-4 text-indigo-500"></i>
                        Usos Principales
                    </h4>
                    <ul class="space-y-1.5">
                        ${box.usosPrincipales.map(uso => `
                            <li class="flex items-start gap-2 text-sm text-slate-600">
                                <i data-lucide="check" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></i>
                                ${uso}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- Equipamiento -->
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <i data-lucide="box" class="w-4 h-4 text-indigo-500"></i>
                        Equipamiento
                    </h4>
                    <ul class="space-y-1.5">
                        ${box.equipamiento.map(eq => `
                            <li class="flex items-start gap-2 text-sm text-slate-600">
                                <i data-lucide="${getEquipmentIcon(eq.tipo)}" class="w-4 h-4 ${getEquipmentColor(eq.tipo)} mt-0.5 flex-shrink-0"></i>
                                <div>
                                    <span class="font-medium">${eq.nombre}</span>
                                    <span class="text-slate-400 text-xs ml-1">(${eq.descripcion})</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            <!-- Profesionales frecuentes -->
            <div class="pt-4 border-t border-slate-200">
                <h4 class="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <i data-lucide="users" class="w-4 h-4 text-indigo-500"></i>
                    Profesionales Frecuentes
                </h4>
                <div class="flex flex-wrap gap-2">
                    ${box.profesionalesFrecuentes.map(prof => `
                        <span class="text-sm bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full">
                            ${prof}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderBoxesList(boxes) {
    return `
        <div class="space-y-3">
            ${boxes.map(box => renderBoxListItem(box)).join('')}
        </div>
    `;
}

function renderBoxListItem(box) {
    const colorClasses = getColorClasses(box.color);
    const tecnologias = box.equipamiento.filter(eq => eq.tipo === 'tecnologia');
    
    return `
        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start gap-4">
                <div class="${colorClasses.icon} p-3 rounded-xl flex-shrink-0">
                    <i data-lucide="${box.icono}" class="w-6 h-6 text-white"></i>
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-slate-800">${box.nombre}</h3>
                        <span class="text-slate-400">•</span>
                        <span class="text-sm ${colorClasses.text}">${box.alias}</span>
                    </div>
                    
                    <p class="text-sm text-slate-600 mb-2">${box.descripcion}</p>
                    
                    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        ${tecnologias.length > 0 ? `
                            <div class="flex items-center gap-1">
                                <i data-lucide="cpu" class="w-3.5 h-3.5"></i>
                                <span>${tecnologias.map(t => t.nombre).join(', ')}</span>
                            </div>
                        ` : ''}
                        <div class="flex items-center gap-1">
                            <i data-lucide="users" class="w-3.5 h-3.5"></i>
                            <span>${box.profesionalesFrecuentes.join(', ')}</span>
                        </div>
                    </div>
                </div>
                
                <button onclick="toggleBoxDetail(${box.id})" class="text-indigo-500 hover:text-indigo-700 p-2">
                    <i data-lucide="info" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    `;
}

function renderTecnologiasSection() {
    return `
        <div class="mt-8 pt-6 border-t border-slate-200">
            <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i data-lucide="cpu" class="w-5 h-5 text-indigo-600"></i>
                Tecnologías Disponibles
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                ${tecnologiasClinica.map(tech => `
                    <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-3">
                        <p class="font-semibold text-indigo-800 text-sm">${tech.nombre}</p>
                        <p class="text-xs text-indigo-600 mb-1">${tech.ubicacion}</p>
                        <p class="text-xs text-slate-500">${tech.descripcion}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Funciones auxiliares de colores
function getColorClasses(color) {
    const colors = {
        emerald: {
            bg: 'bg-emerald-50',
            icon: 'bg-emerald-500',
            text: 'text-emerald-600',
            badge: 'bg-emerald-100 text-emerald-700',
            iconText: 'text-emerald-500'
        },
        purple: {
            bg: 'bg-purple-50',
            icon: 'bg-purple-500',
            text: 'text-purple-600',
            badge: 'bg-purple-100 text-purple-700',
            iconText: 'text-purple-500'
        },
        orange: {
            bg: 'bg-orange-50',
            icon: 'bg-orange-500',
            text: 'text-orange-600',
            badge: 'bg-orange-100 text-orange-700',
            iconText: 'text-orange-500'
        },
        amber: {
            bg: 'bg-amber-50',
            icon: 'bg-amber-500',
            text: 'text-amber-600',
            badge: 'bg-amber-100 text-amber-700',
            iconText: 'text-amber-500'
        },
        rose: {
            bg: 'bg-rose-50',
            icon: 'bg-rose-500',
            text: 'text-rose-600',
            badge: 'bg-rose-100 text-rose-700',
            iconText: 'text-rose-500'
        },
        cyan: {
            bg: 'bg-cyan-50',
            icon: 'bg-cyan-500',
            text: 'text-cyan-600',
            badge: 'bg-cyan-100 text-cyan-700',
            iconText: 'text-cyan-500'
        },
        pink: {
            bg: 'bg-pink-50',
            icon: 'bg-pink-500',
            text: 'text-pink-600',
            badge: 'bg-pink-100 text-pink-700',
            iconText: 'text-pink-500'
        },
        blue: {
            bg: 'bg-blue-50',
            icon: 'bg-blue-500',
            text: 'text-blue-600',
            badge: 'bg-blue-100 text-blue-700',
            iconText: 'text-blue-500'
        },
        red: {
            bg: 'bg-red-50',
            icon: 'bg-red-500',
            text: 'text-red-600',
            badge: 'bg-red-100 text-red-700',
            iconText: 'text-red-500'
        }
    };
    return colors[color] || colors.blue;
}

function getEquipmentIcon(tipo) {
    const icons = {
        tecnologia: 'cpu',
        computador: 'monitor',
        oficina: 'printer',
        mobiliario: 'armchair',
        sanitario: 'droplets',
        equipamiento: 'wrench'
    };
    return icons[tipo] || 'box';
}

function getEquipmentColor(tipo) {
    const colors = {
        tecnologia: 'text-indigo-500',
        computador: 'text-slate-500',
        oficina: 'text-slate-400',
        mobiliario: 'text-amber-500',
        sanitario: 'text-cyan-500',
        equipamiento: 'text-red-500'
    };
    return colors[tipo] || 'text-slate-500';
}

// Funciones de interacción
function toggleBoxDetail(boxId) {
    const detailPanel = document.getElementById(`boxDetail-${boxId}`);
    if (detailPanel) {
        detailPanel.classList.toggle('hidden');
        lucide.createIcons();
    }
}

function setBoxCategory(category) {
    appState.setState({ boxCategory: category });
}

function setBoxViewMode(mode) {
    appState.setState({ boxViewMode: mode });
}

function clearBoxSearch() {
    appState.setState({ boxSearchTerm: '' });
    const input = document.getElementById('boxSearchInput');
    if (input) input.value = '';
}

function initBoxesContent() {
    const searchInput = document.getElementById('boxSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.setState({ boxSearchTerm: e.target.value });
        });
    }
}
