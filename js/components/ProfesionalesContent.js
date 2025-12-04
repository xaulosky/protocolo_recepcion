/**
 * ProfesionalesContent Component - Rediseñado
 * Soporta 3 modos de visualización: Lista, Grid, Tarjetas
 */

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function ProfesionalesContent() {
    const { profesionalViewMode } = appState.getState();

    return `
        <div class="space-y-6">
            <!-- Header Info -->
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
                <i data-lucide="info" class="text-purple-600 w-5 h-5 mt-0.5"></i>
                <div class="flex-grow">
                    <h3 class="font-bold text-purple-900 mb-1">Directorio de Profesionales</h3>
                    <p class="text-sm text-purple-800">Información de contacto, horarios y prestaciones de nuestros especialistas.</p>
                </div>
            </div>

            <!-- Buscador -->
            <div class="relative">
                <input 
                    type="text" 
                    id="profesionalSearchInput" 
                    placeholder="Buscar profesional por nombre, especialidad, servicio..."
                    class="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all text-slate-800 placeholder-slate-400"
                />
                <i data-lucide="search" class="absolute left-3 top-3.5 text-purple-500 w-5 h-5"></i>
                <button 
                    id="clearProfesionalSearchBtn" 
                    class="absolute right-3 top-3.5 text-slate-400 hover:text-purple-600 transition-colors hidden"
                >
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Selector de Vista -->
            <div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div class="flex items-center gap-2">
                    <i data-lucide="layout-dashboard" class="w-4 h-4 text-slate-600"></i>
                    <span class="text-sm font-medium text-slate-700">Vista:</span>
                </div>
                <div class="flex gap-2">
                    <button 
                        id="viewModeList"
                        class="px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${profesionalViewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-purple-50'}"
                        title="Vista de Lista"
                    >
                        <i data-lucide="list" class="w-4 h-4"></i>
                        <span class="text-sm font-medium">Lista</span>
                    </button>
                    <button 
                        id="viewModeGrid"
                        class="px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${profesionalViewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-purple-50'}"
                        title="Vista de Grid"
                    >
                        <i data-lucide="grid-3x3" class="w-4 h-4"></i>
                        <span class="text-sm font-medium">Grid</span>
                    </button>
                    <button 
                        id="viewModeCards"
                        class="px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${profesionalViewMode === 'cards' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-purple-50'}"
                        title="Vista de Tarjetas"
                    >
                        <i data-lucide="square-stack" class="w-4 h-4"></i>
                        <span class="text-sm font-medium">Tarjetas</span>
                    </button>
                </div>
            </div>

            <!-- Contenedor de Resultados -->
            <div id="profesionalesResultsContainer">
                ${renderProfesionales('', profesionalViewMode)}
            </div>
        </div>
    `;
}

// ============================================================================
// RENDERIZADO DE RESULTADOS
// ============================================================================

function renderProfesionales(searchTerm, viewMode) {
    const profesionalesFiltrados = filterProfesionales(searchTerm);

    let html = '';

    // Sin resultados
    if (searchTerm && profesionalesFiltrados.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-slate-500">
                <i data-lucide="user-x" class="w-16 h-16 mb-4 opacity-50"></i>
                <p class="font-bold text-lg mb-1">No se encontraron profesionales</p>
                <p class="text-sm">Intenta con otro término de búsqueda</p>
            </div>
        `;
    }

    // Contador de resultados
    if (searchTerm) {
        html += `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 mb-6">
                <i data-lucide="filter" class="w-4 h-4 text-blue-600"></i>
                <p class="text-sm text-blue-900">
                    <span class="font-bold">${profesionalesFiltrados.length}</span> 
                    profesional${profesionalesFiltrados.length !== 1 ? 'es' : ''} encontrado${profesionalesFiltrados.length !== 1 ? 's' : ''}
                </p>
            </div>
        `;
    }

    // Renderizar según vista
    switch (viewMode) {
        case 'list':
            html += renderListView(profesionalesFiltrados);
            break;
        case 'grid':
            html += renderGridView(profesionalesFiltrados);
            break;
        default:
            html += renderCardsView(profesionalesFiltrados);
    }

    return html;
}

// ============================================================================
// VISTAS ESPECÍFICAS
// ============================================================================

/**
 * Vista de Lista - Compacta en filas
 */
function renderListView(profesionales) {
    return `
        <div class="space-y-3">
            ${profesionales.map(prof => `
                <div class="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4 flex-grow">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i data-lucide="user" class="w-6 h-6 text-purple-600"></i>
                        </div>
                        <div class="flex-grow min-w-0">
                            <h3 class="font-bold text-slate-900 truncate">${prof.nombreCompleto}</h3>
                            <p class="text-sm text-slate-600 truncate">${prof.especialidad}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                        <div class="text-right hidden md:block">
                            <p class="text-xs text-slate-500">Servicios</p>
                            <p class="font-bold text-purple-600">${prof.prestaciones.servicios.length}</p>
                        </div>
                        <button 
                            onclick="showProfesionalDetails('${prof.id}')"
                            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        >
                            <i data-lucide="eye" class="w-4 h-4"></i>
                            <span class="hidden sm:inline">Ver</span>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Vista de Grid - Cuadrícula compacta
 */
function renderGridView(profesionales) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${profesionales.map(prof => `
                <div class="bg-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all">
                    <div class="flex flex-col items-center text-center mb-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mb-3">
                            <i data-lucide="user-circle" class="w-10 h-10 text-white"></i>
                        </div>
                        <h3 class="font-bold text-slate-900 mb-1">${prof.nombreCompleto}</h3>
                        <p class="text-xs text-slate-600 mb-2">${prof.especialidad}</p>
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <i data-lucide="briefcase" class="w-3 h-3"></i>
                            <span>${prof.prestaciones.servicios.length} servicio${prof.prestaciones.servicios.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="space-y-2 mb-4">
                        <div class="flex items-center gap-2 text-xs text-slate-600">
                            <i data-lucide="phone" class="w-3 h-3 text-purple-600"></i>
                            <span class="truncate">${prof.telefono}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-600">
                            <i data-lucide="mail" class="w-3 h-3 text-purple-600"></i>
                            <span class="truncate">${prof.email}</span>
                        </div>
                    </div>
                    <button 
                        onclick="showProfesionalDetails('${prof.id}')"
                        class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <i data-lucide="maximize-2" class="w-4 h-4"></i>
                        Ver detalles
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Vista de Tarjetas - Detallada (vista original)
 */
function renderCardsView(profesionales) {
    return `
        <div class="grid grid-cols-1 gap-6">
            ${profesionales.map(profesional => renderProfesionalCard(profesional)).join('')}
        </div>
    `;
}

// ============================================================================
// TARJETA DETALLADA (para vista Cards y Modal)
// ============================================================================

function renderProfesionalCard(profesional) {
    const tieneFormacion = profesional.formacion !== undefined;
    const tienePendientes = profesional.pendientesAdministrativos !== undefined;

    return `
        <div class="bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <!-- Header del profesional -->
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div class="flex items-start justify-between flex-wrap gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <i data-lucide="user-circle" class="w-10 h-10"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-1">${profesional.nombreCompleto}</h3>
                            <p class="text-purple-100 font-medium flex items-center gap-2">
                                <i data-lucide="stethoscope" class="w-4 h-4"></i>
                                ${profesional.especialidad}
                            </p>
                        </div>
                    </div>
                    <button 
                        onclick="showProfesionalDetails('${profesional.id}')"
                        class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                        <i data-lucide="maximize-2" class="w-4 h-4"></i>
                        Ver detalles
                    </button>
                </div>
            </div>

            <!-- Contenido del profesional -->
            <div class="p-6 space-y-6">
                <!-- Información de Contacto -->
                <div>
                    <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <i data-lucide="contact" class="w-4 h-4 text-purple-600"></i>
                        Información de Contacto
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                            <i data-lucide="phone" class="w-4 h-4 text-slate-500"></i>
                            <div>
                                <p class="text-xs text-slate-500 font-medium">Teléfono</p>
                                <p class="text-sm font-bold text-slate-800">${profesional.telefono}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                            <i data-lucide="mail" class="w-4 h-4 text-slate-500"></i>
                            <div>
                                <p class="text-xs text-slate-500 font-medium">Email</p>
                                <p class="text-sm font-bold text-slate-800 break-all">${profesional.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Disponibilidad -->
                <div>
                    <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <i data-lucide="calendar-clock" class="w-4 h-4 text-purple-600"></i>
                        Disponibilidad
                    </h4>
                    <div class="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <p class="text-sm font-bold text-blue-900">${profesional.disponibilidad.dias.join(', ')}</p>
                    </div>
                </div>

                <!-- Prestaciones Resumen -->
                <div>
                    <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <i data-lucide="clipboard-list" class="w-4 h-4 text-purple-600"></i>
                        Servicios (${profesional.prestaciones.servicios.length})
                    </h4>
                    <div class="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                        <div class="space-y-2">
                            ${profesional.prestaciones.servicios.slice(0, 3).map(servicio => {
        const nombre = typeof servicio === 'string' ? servicio : servicio.nombre;
        return `
                                    <div class="flex items-start gap-2 text-sm text-purple-900">
                                        <i data-lucide="check-circle" class="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0"></i>
                                        <span class="font-medium">${nombre}</span>
                                    </div>
                                `;
    }).join('')}
                            ${profesional.prestaciones.servicios.length > 3 ? `
                                <p class="text-xs text-purple-700 font-medium mt-2">
                                    + ${profesional.prestaciones.servicios.length - 3} servicio(s) más
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${tienePendientes ? `
                    <!-- Pendientes -->
                    <div class="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                        <div class="flex items-start gap-2">
                            <i data-lucide="alert-circle" class="w-5 h-5 text-orange-600 mt-0.5"></i>
                            <div>
                                <h4 class="font-bold text-orange-900 text-sm mb-2">Pendientes Administrativos</h4>
                                <ul class="space-y-1 text-sm text-orange-800">
                                    ${profesional.pendientesAdministrativos.map(p => `
                                        <li class="flex items-start gap-2">
                                            <span class="text-orange-600 mt-1">•</span>
                                            <span>${p}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================================================
// MODAL DE DETALLES
// ============================================================================

function showProfesionalDetails(profesionalId) {
    const profesional = profesionalesData.find(p => p.id === profesionalId);
    if (!profesional) return;

    const modal = document.createElement('div');
    modal.id = 'profesionalModal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
        if (e.target === modal) closeProfesionalModal();
    };

    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between z-10">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <i data-lucide="user-circle" class="w-10 h-10"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold">${profesional.nombreCompleto}</h2>
                        <p class="text-purple-100">${profesional.especialidad}</p>
                    </div>
                </div>
                <button 
                    onclick="closeProfesionalModal()"
                    class="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all"
                >
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Contenido completo -->
            <div class="p-6 space-y-6">
                ${renderProfesionalFullDetails(profesional)}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();
}

function renderProfesionalFullDetails(profesional) {
    const tieneFormacion = profesional.formacion !== undefined;
    const tienePendientes = profesional.pendientesAdministrativos !== undefined;
    const servicios = profesional.prestaciones.servicios;
    const esArraySimple = typeof servicios[0] === 'string';

    return `
        <div class="space-y-6">
            <!-- Contacto -->
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <i data-lucide="contact" class="w-5 h-5 text-purple-600"></i>
                    Información de Contacto
                </h3>
                <div class="space-y-2 text-sm">
                    <p><span class="font-bold">RUT:</span> ${profesional.rut}</p>
                    <p><span class="font-bold">Teléfono:</span> ${profesional.telefono}</p>
                    <p><span class="font-bold">Email:</span> ${profesional.email}</p>
                </div>
            </div>

            ${tieneFormacion ? `
                <!-- Formación -->
                <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 class="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        <i data-lucide="graduation-cap" class="w-5 h-5 text-indigo-600"></i>
                        Formación y Credenciales
                    </h3>
                    <div class="space-y-2 text-sm text-indigo-900">
                        ${profesional.formacion.pregrado ? `<p><span class="font-bold">Pregrado:</span> ${profesional.formacion.pregrado}</p>` : ''}
                        ${profesional.formacion.especialidad ? `<p><span class="font-bold">Especialidad:</span> ${profesional.formacion.especialidad}</p>` : ''}
                        ${profesional.formacion.subespecialidad ? `<p><span class="font-bold">Subespecialidad:</span> ${profesional.formacion.subespecialidad}</p>` : ''}
                        ${profesional.formacion.certificaciones ? `
                            <div>
                                <p class="font-bold mb-1">Certificaciones:</p>
                                <ul class="list-disc list-inside space-y-1 ml-2">
                                    ${profesional.formacion.certificaciones.map(c => `<li>${c}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Disponibilidad -->
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <i data-lucide="calendar-clock" class="w-5 h-5 text-blue-600"></i>
                    Disponibilidad y Horarios
                </h3>
                <div class="space-y-2 text-sm text-blue-900">
                    <p><span class="font-bold">Días:</span> ${profesional.disponibilidad.dias.join(', ')}</p>
                    <p><span class="font-bold">Horario:</span> ${profesional.disponibilidad.horario}</p>
                    <p><span class="font-bold">Frecuencia:</span> ${profesional.disponibilidad.frecuencia}</p>
                </div>
            </div>

            <!-- Servicios Detallados -->
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 class="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <i data-lucide="clipboard-list" class="w-5 h-5 text-purple-600"></i>
                    Servicios Detallados
                </h3>
                ${esArraySimple ? `
                    <ul class="list-disc list-inside space-y-1 ml-2 text-sm text-purple-900">
                        ${servicios.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                ` : `
                    <div class="space-y-4">
                        ${servicios.map(servicio => `
                            <div class="bg-white p-4 rounded-lg border border-purple-200">
                                <h4 class="font-bold text-purple-900 mb-2">${servicio.nombre}</h4>
                                <div class="space-y-1 text-sm text-purple-800">
                                    ${servicio.duracion ? `<p><span class="font-bold">Duración:</span> ${servicio.duracion}</p>` : ''}
                                    ${servicio.valor ? `<p><span class="font-bold">Valor:</span> ${servicio.valor}</p>` : ''}
                                    ${servicio.notas ? `<p class="text-xs mt-2 p-2 bg-purple-100 rounded">${servicio.notas}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            ${tienePendientes ? `
                <!-- Pendientes -->
                <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 class="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <i data-lucide="alert-circle" class="w-5 h-5 text-orange-600"></i>
                        Pendientes Administrativos
                    </h3>
                    <ul class="space-y-2 text-sm text-orange-800">
                        ${profesional.pendientesAdministrativos.map(p => `
                            <li class="flex items-start gap-2">
                                <i data-lucide="square" class="w-4 h-4 text-orange-600 mt-0.5"></i>
                                <span>${p}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

function closeProfesionalModal() {
    const modal = document.getElementById('profesionalModal');
    if (modal) modal.remove();
}

// ============================================================================
// FILTRADO
// ============================================================================

function filterProfesionales(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return profesionalesData;
    }

    const term = searchTerm.toLowerCase().trim();

    return profesionalesData.filter(profesional => {
        // Buscar en información básica
        if (profesional.nombreCompleto.toLowerCase().includes(term)) return true;
        if (profesional.especialidad.toLowerCase().includes(term)) return true;
        if (profesional.rut.includes(term)) return true;
        if (profesional.telefono.includes(term)) return true;
        if (profesional.email.toLowerCase().includes(term)) return true;

        // Buscar en formación
        if (profesional.formacion) {
            if (profesional.formacion.pregrado && profesional.formacion.pregrado.toLowerCase().includes(term)) return true;
            if (profesional.formacion.especialidad && profesional.formacion.especialidad.toLowerCase().includes(term)) return true;
            if (profesional.formacion.certificaciones && profesional.formacion.certificaciones.some(cert => cert.toLowerCase().includes(term))) return true;
        }

        // Buscar en disponibilidad
        if (profesional.disponibilidad.dias.some(dia => dia.toLowerCase().includes(term))) return true;
        if (profesional.disponibilidad.horario.toLowerCase().includes(term)) return true;

        // Buscar en servicios
        const servicios = profesional.prestaciones.servicios;
        if (Array.isArray(servicios)) {
            if (typeof servicios[0] === 'string') {
                if (servicios.some(serv => serv.toLowerCase().includes(term))) return true;
            } else {
                for (const servicio of servicios) {
                    if (servicio.nombre && servicio.nombre.toLowerCase().includes(term)) return true;
                    if (servicio.valor && servicio.valor.toLowerCase().includes(term)) return true;
                    if (servicio.notas && servicio.notas.toLowerCase().includes(term)) return true;
                }
            }
        }

        return false;
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initProfesionalesListeners() {
    const searchInput = document.getElementById('profesionalSearchInput');
    const clearBtn = document.getElementById('clearProfesionalSearchBtn');
    const viewModeList = document.getElementById('viewModeList');
    const viewModeGrid = document.getElementById('viewModeGrid');
    const viewModeCards = document.getElementById('viewModeCards');

    // Buscador
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            updateProfesionalesView(searchTerm);

            if (clearBtn) {
                clearBtn.classList.toggle('hidden', !searchTerm);
            }
        });
    }

    // Botón limpiar
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                updateProfesionalesView('');
                clearBtn.classList.add('hidden');
            }
        });
    }

    // Botones de vista
    if (viewModeList) {
        viewModeList.addEventListener('click', () => changeViewMode('list'));
    }
    if (viewModeGrid) {
        viewModeGrid.addEventListener('click', () => changeViewMode('grid'));
    }
    if (viewModeCards) {
        viewModeCards.addEventListener('click', () => changeViewMode('cards'));
    }
}

function changeViewMode(mode) {
    appState.setProfesionalViewMode(mode);
    updateViewButtons(mode);
    const searchInput = document.getElementById('profesionalSearchInput');
    updateProfesionalesView(searchInput ? searchInput.value : '');
}

function updateViewButtons(activeMode) {
    const buttons = {
        list: document.getElementById('viewModeList'),
        grid: document.getElementById('viewModeGrid'),
        cards: document.getElementById('viewModeCards')
    };

    Object.keys(buttons).forEach(mode => {
        const btn = buttons[mode];
        if (btn) {
            if (mode === activeMode) {
                btn.className = 'px-3 py-2 rounded-lg flex items-center gap-2 transition-all bg-purple-600 text-white';
            } else {
                btn.className = 'px-3 py-2 rounded-lg flex items-center gap-2 transition-all bg-white text-slate-600 hover:bg-purple-50';
            }
        }
    });
}

function updateProfesionalesView(searchTerm) {
    const container = document.getElementById('profesionalesResultsContainer');
    if (!container) return;

    const viewMode = appState.getState().profesionalViewMode;
    container.innerHTML = renderProfesionales(searchTerm, viewMode);
    lucide.createIcons();
}
