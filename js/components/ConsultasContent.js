/*
 * ConsultasContent Component
 * Muestra las consultas/evaluaciones organizadas por tipo
 */

// Variable para almacenar la búsqueda de consultas
let consultaSearchTerm = '';
// Variable para el modo de vista (list o grid)
let consultaViewMode = 'list';

function ConsultasContent() {
    return `
        <div class="space-y-6">
            <!-- Header Info -->
            <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
                <i data-lucide="calendar-check" class="text-indigo-600 w-5 h-5 mt-0.5"></i>
                <div class="flex-grow">
                    <h3 class="font-bold text-indigo-900 mb-1">Tipos de Consultas y Evaluaciones</h3>
                    <p class="text-sm text-indigo-800">Guía rápida de consultas disponibles, profesionales asignados y tratamientos asociados.</p>
                </div>
            </div>

            <!-- Buscador y Toggle de Vista -->
            <div class="flex flex-col sm:flex-row gap-3">
                <!-- Buscador -->
                <div class="relative flex-grow">
                    <input 
                        type="text" 
                        id="consultaSearchInput" 
                        placeholder="Buscar consulta, profesional o tratamiento..."
                        class="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-slate-800 placeholder-slate-400"
                        value="${consultaSearchTerm}"
                    />
                    <i data-lucide="search" class="absolute left-3 top-3.5 text-indigo-500 w-5 h-5"></i>
                    <button 
                        id="clearConsultaSearchBtn" 
                        class="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors ${consultaSearchTerm ? '' : 'hidden'}"
                    >
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Toggle de Vista -->
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button 
                        id="consultaViewList" 
                        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${consultaViewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}"
                        title="Vista Lista"
                    >
                        <i data-lucide="list" class="w-4 h-4"></i>
                        <span class="hidden sm:inline">Lista</span>
                    </button>
                    <button 
                        id="consultaViewGrid" 
                        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${consultaViewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}"
                        title="Vista Grid"
                    >
                        <i data-lucide="layout-grid" class="w-4 h-4"></i>
                        <span class="hidden sm:inline">Grid</span>
                    </button>
                </div>
            </div>

            <!-- Contador de resultados -->
            <div id="consultaResultsCount" class="text-sm text-slate-500 mb-2">
                ${getConsultaResultsCount()}
            </div>

            <!-- Lista de Consultas (container que se actualiza) -->
            <div id="consultaResultsContainer" class="${consultaViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}">
                ${renderConsultasList()}
            </div>
        </div>
    `;
}

function getConsultaResultsCount() {
    const filtered = getFilteredConsultas();
    return `Mostrando ${filtered.length} de ${consultasData.length} consultas`;
}

function getFilteredConsultas() {
    if (!consultaSearchTerm) {
        return consultasData;
    }

    return consultasData.filter(consulta => {
        const searchableText = [
            consulta.nombre,
            consulta.descripcion,
            ...consulta.profesionales.map(p => p.nombre + ' ' + p.especialidad),
            ...consulta.tratamientosAsociados
        ].join(' ').toLowerCase();
        return searchableText.includes(consultaSearchTerm.toLowerCase());
    });
}

function renderConsultasList() {
    const filteredConsultas = getFilteredConsultas();

    if (filteredConsultas.length === 0) {
        return `
            <div class="text-center py-8 text-slate-500 ${consultaViewMode === 'grid' ? 'col-span-full' : ''}">
                <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
                <p class="font-medium">No se encontraron consultas</p>
                <p class="text-sm">Intenta con otro término de búsqueda</p>
            </div>
        `;
    }

    if (consultaViewMode === 'grid') {
        return filteredConsultas.map(consulta => renderConsultaCardGrid(consulta)).join('');
    }
    return filteredConsultas.map(consulta => renderConsultaCard(consulta)).join('');
}

// Vista Lista (detallada)
function renderConsultaCard(consulta) {
    const profesionalesList = consulta.profesionales.map(p => `
        <div class="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
            <i data-lucide="user" class="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0"></i>
            <div class="min-w-0">
                <div class="font-medium text-slate-800 text-sm">${p.nombre}</div>
                <div class="text-xs text-slate-500">${p.especialidad}</div>
                <div class="text-xs text-indigo-600 flex items-center gap-1 mt-1">
                    <i data-lucide="clock" class="w-3 h-3"></i>
                    ${p.disponibilidad}
                </div>
            </div>
        </div>
    `).join('');

    const tratamientosList = consulta.tratamientosAsociados.map(t => `
        <span class="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium mr-1 mb-1">
            ${t}
        </span>
    `).join('');

    const valorBadgeColor = consulta.valor.includes('GRATUITA')
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-indigo-100 text-indigo-800 border-indigo-200';

    return `
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${consulta.emoji}</span>
                    <div>
                        <h3 class="font-bold text-white text-lg">${consulta.nombre}</h3>
                        <div class="flex flex-wrap gap-2 mt-1">
                            <span class="inline-flex items-center px-2 py-0.5 ${valorBadgeColor} rounded-full text-xs font-bold border">
                                ${consulta.valor}
                            </span>
                            <span class="inline-flex items-center px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${consulta.duracion}
                            </span>
                            ${consulta.reembolsable ? `
                                <span class="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                                    <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i>
                                    Reembolsable
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Body -->
            <div class="p-4 space-y-4">
                <!-- Descripción -->
                <div class="text-sm text-slate-600 leading-relaxed">
                    ${consulta.descripcion}
                </div>

                <!-- Profesionales -->
                <div>
                    <h4 class="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                        <i data-lucide="users" class="w-4 h-4 text-indigo-500"></i>
                        Profesionales
                    </h4>
                    <div class="bg-slate-50 rounded-lg p-3">
                        ${profesionalesList}
                    </div>
                </div>

                <!-- Tratamientos Asociados -->
                <div>
                    <h4 class="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                        <i data-lucide="list-checks" class="w-4 h-4 text-purple-500"></i>
                        Tratamientos que requieren esta consulta
                    </h4>
                    <div class="flex flex-wrap">
                        ${tratamientosList}
                    </div>
                </div>

                <!-- Requisitos y Política -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <div class="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                            <i data-lucide="alert-circle" class="w-4 h-4"></i>
                            Requisitos
                        </div>
                        <div class="text-xs text-amber-700">${consulta.requisitos}</div>
                    </div>
                    <div class="bg-red-50 border border-red-100 rounded-lg p-3">
                        <div class="flex items-center gap-2 text-red-800 font-bold text-xs mb-1">
                            <i data-lucide="calendar-x" class="w-4 h-4"></i>
                            Política de Cancelación
                        </div>
                        <div class="text-xs text-red-700">${consulta.politicaCancelacion}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Vista Grid (compacta)
function renderConsultaCardGrid(consulta) {
    const valorBadgeColor = consulta.valor.includes('GRATUITA')
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-indigo-100 text-indigo-800 border-indigo-200';

    const profesionalesNames = consulta.profesionales.map(p => p.nombre.split(' ').slice(0, 2).join(' ')).join(' / ');

    return `
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-500 p-3">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${consulta.emoji}</span>
                    <div class="min-w-0 flex-grow">
                        <h3 class="font-bold text-white text-sm truncate">${consulta.nombre}</h3>
                        <div class="flex flex-wrap gap-1 mt-1">
                            <span class="inline-flex items-center px-2 py-0.5 ${valorBadgeColor} rounded-full text-xs font-bold border">
                                ${consulta.valor}
                            </span>
                            <span class="inline-flex items-center px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${consulta.duracion}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Body -->
            <div class="p-3 flex-grow flex flex-col gap-2">
                <!-- Profesionales -->
                <div class="flex items-center gap-2 text-xs text-slate-600">
                    <i data-lucide="user" class="w-4 h-4 text-indigo-500 flex-shrink-0"></i>
                    <span class="truncate">${profesionalesNames}</span>
                </div>

                <!-- Descripción corta -->
                <p class="text-xs text-slate-500 line-clamp-2 flex-grow">
                    ${consulta.descripcion.substring(0, 120)}...
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1 mt-auto">
                    ${consulta.reembolsable ? `
                        <span class="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i>
                            Reembolsable
                        </span>
                    ` : ''}
                    <span class="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                        ${consulta.tratamientosAsociados.length} tratamientos
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Actualiza solo la lista de resultados (sin parpadear todo)
 */
function updateConsultaResults() {
    const container = document.getElementById('consultaResultsContainer');
    const countElement = document.getElementById('consultaResultsCount');
    const clearBtn = document.getElementById('clearConsultaSearchBtn');

    if (container) {
        // Actualizar clase del contenedor según el modo de vista
        if (consultaViewMode === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';
        } else {
            container.className = 'space-y-4';
        }
        container.innerHTML = renderConsultasList();
        lucide.createIcons({ nodes: [container] });
    }

    if (countElement) {
        countElement.textContent = getConsultaResultsCount();
    }

    if (clearBtn) {
        if (consultaSearchTerm) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    // Actualizar estilos de los botones de vista
    updateViewModeButtons();
}

/**
 * Actualiza los estilos de los botones de vista
 */
function updateViewModeButtons() {
    const listBtn = document.getElementById('consultaViewList');
    const gridBtn = document.getElementById('consultaViewGrid');

    if (listBtn && gridBtn) {
        if (consultaViewMode === 'list') {
            listBtn.className = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all bg-white text-indigo-600 shadow-sm';
            gridBtn.className = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all text-slate-600 hover:text-slate-800';
        } else {
            listBtn.className = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all text-slate-600 hover:text-slate-800';
            gridBtn.className = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all bg-white text-indigo-600 shadow-sm';
        }
    }
}

/**
 * Inicializa los event listeners del componente de consultas
 */
function initConsultasContent() {
    const searchInput = document.getElementById('consultaSearchInput');
    const clearBtn = document.getElementById('clearConsultaSearchBtn');
    const listBtn = document.getElementById('consultaViewList');
    const gridBtn = document.getElementById('consultaViewGrid');

    if (searchInput) {
        searchInput.oninput = (e) => {
            consultaSearchTerm = e.target.value;
            updateConsultaResults();
        };
    }

    if (clearBtn) {
        clearBtn.onclick = () => {
            consultaSearchTerm = '';
            const input = document.getElementById('consultaSearchInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            updateConsultaResults();
        };
    }

    if (listBtn) {
        listBtn.onclick = () => {
            consultaViewMode = 'list';
            updateConsultaResults();
        };
    }

    if (gridBtn) {
        gridBtn.onclick = () => {
            consultaViewMode = 'grid';
            updateConsultaResults();
        };
    }
}
