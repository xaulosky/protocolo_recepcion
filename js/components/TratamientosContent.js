/**
 * TratamientosContent Component
 * Catálogo de tratamientos con filtros, búsqueda y vista optimizada
 * Optimizado: debounce en búsqueda, cache de filtros, mejor UX mobile, panel sticky
 */

// Estado del filtro de tratamientos
let tratamientoSearchTerm = '';
let tratamientoCategoriaActiva = 'Todas';
let tratamientoSubcategoriaActiva = 'Todas';
let tratamientoProfesionalActivo = 'Todos';
let tratamientoSeleccionadoId = tratamientosData.length ? tratamientosData[0].id : null;
let tratamientoSoloConEvaluacion = false;
let _tratamientoDebounceTimer = null;
let _tratamientosMobileFiltersOpen = false;
let _tratamientosViewMode = 'grid'; // 'grid' | 'list'

// ─── Cache de filtros ────────────────────────────────────────────────
let _cachedFilteredTratamientos = null;
let _filterCacheKey = '';

function _buildFilterCacheKey() {
    return tratamientoCategoriaActiva + '|' + tratamientoSubcategoriaActiva + '|' + tratamientoProfesionalActivo + '|' + tratamientoSoloConEvaluacion + '|' + tratamientoSearchTerm;
}

function getFilteredTratamientos() {
    const key = _buildFilterCacheKey();
    if (_cachedFilteredTratamientos && _filterCacheKey === key) {
        return _cachedFilteredTratamientos;
    }

    let filtered = tratamientosData;

    if (tratamientoCategoriaActiva !== 'Todas') {
        filtered = filtered.filter(t => t.categoria === tratamientoCategoriaActiva);
    }
    if (tratamientoSubcategoriaActiva !== 'Todas') {
        filtered = filtered.filter(t => t.subcategoria === tratamientoSubcategoriaActiva);
    }
    if (tratamientoProfesionalActivo !== 'Todos') {
        filtered = filtered.filter(t => t.profesional === tratamientoProfesionalActivo);
    }
    if (tratamientoSoloConEvaluacion) {
        filtered = filtered.filter(t => t.requiereEvaluacion);
    }
    if (tratamientoSearchTerm) {
        const search = tratamientoSearchTerm.toLowerCase();
        filtered = filtered.filter(t =>
            t.nombre.toLowerCase().includes(search) ||
            t.descripcion.toLowerCase().includes(search) ||
            t.profesional.toLowerCase().includes(search) ||
            t.categoria.toLowerCase().includes(search) ||
            t.subcategoria.toLowerCase().includes(search)
        );
    }

    _cachedFilteredTratamientos = filtered;
    _filterCacheKey = key;
    return filtered;
}

function _invalidateFilterCache() {
    _cachedFilteredTratamientos = null;
    _filterCacheKey = '';
}

// ─── Contadores por categoría ────────────────────────────────────────
function _getCountByCategoria(cat) {
    if (cat === 'Todas') return tratamientosData.length;
    return tratamientosData.filter(t => t.categoria === cat).length;
}

function _getCountBySubcategoria(sub) {
    if (sub === 'Todas') {
        return tratamientoCategoriaActiva === 'Todas'
            ? tratamientosData.length
            : tratamientosData.filter(t => t.categoria === tratamientoCategoriaActiva).length;
    }
    let base = tratamientosData;
    if (tratamientoCategoriaActiva !== 'Todas') {
        base = base.filter(t => t.categoria === tratamientoCategoriaActiva);
    }
    return base.filter(t => t.subcategoria === sub).length;
}

function _getCountByProfesional(prof) {
    if (prof === 'Todos') return tratamientosData.length;
    return tratamientosData.filter(t => t.profesional === prof).length;
}

// ─── Utilidades ──────────────────────────────────────────────────────
function formatPrecio(desde, hasta) {
    if (desde === null && hasta === null) return 'Consultar';
    if (desde === null) return 'Hasta $' + hasta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formatNum = (n) => '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (hasta && hasta !== desde) {
        return formatNum(desde) + ' - ' + formatNum(hasta);
    }
    return formatNum(desde);
}

function getCategoriaColor(categoria) {
    const colores = {
        'Facial': 'from-pink-500 to-rose-500',
        'Corporal': 'from-purple-500 to-violet-500',
        'Capilar': 'from-amber-500 to-orange-500',
        'Urología': 'from-blue-500 to-cyan-500',
        'Ginecoestética': 'from-pink-400 to-fuchsia-500',
        'Nutrición': 'from-green-500 to-emerald-500',
        'Cirugía Maxilofacial': 'from-slate-500 to-gray-600',
        'Vascular': 'from-red-500 to-rose-600'
    };
    return colores[categoria] || 'from-indigo-500 to-purple-500';
}

function getCategoriaColorBg(categoria) {
    const colores = {
        'Facial': 'bg-pink-50 text-pink-700 border-pink-200',
        'Corporal': 'bg-purple-50 text-purple-700 border-purple-200',
        'Capilar': 'bg-amber-50 text-amber-700 border-amber-200',
        'Urología': 'bg-blue-50 text-blue-700 border-blue-200',
        'Ginecoestética': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
        'Nutrición': 'bg-green-50 text-green-700 border-green-200',
        'Cirugía Maxilofacial': 'bg-slate-50 text-slate-700 border-slate-200',
        'Vascular': 'bg-red-50 text-red-700 border-red-200'
    };
    return colores[categoria] || 'bg-indigo-50 text-indigo-700 border-indigo-200';
}

function getCategoriaIcon(categoria) {
    const iconos = {
        'Facial': 'smile',
        'Corporal': 'activity',
        'Capilar': 'scissors',
        'Urología': 'user',
        'Ginecoestética': 'heart',
        'Nutrición': 'apple',
        'Cirugía Maxilofacial': 'scissors',
        'Vascular': 'heart-pulse'
    };
    return iconos[categoria] || 'sparkles';
}

// ─── Componente Principal ────────────────────────────────────────────
function TratamientosContent() {
    const categorias = ['Todas', ...getCategoriasTratamientos()];
    const profesionales = ['Todos', ...getProfesionalesTratamientos()];
    const subcategorias = tratamientoCategoriaActiva === 'Todas'
        ? ['Todas', ...getAllSubcategoriasTratamientos()]
        : ['Todas', ...getSubcategoriasTratamientos(tratamientoCategoriaActiva)];
    const totalTratamientos = tratamientosData.length;
    const filtered = getFilteredTratamientos();
    const filteredCount = filtered.length;
    const hasActiveFilters = tratamientoCategoriaActiva !== 'Todas' ||
        tratamientoSubcategoriaActiva !== 'Todas' ||
        tratamientoProfesionalActivo !== 'Todos' ||
        tratamientoSoloConEvaluacion ||
        tratamientoSearchTerm.length > 0;

    return `
        <div class="space-y-5 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(248,242,226,0.8))] p-4 md:p-6 rounded-[32px] shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
            <!-- Header -->
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Catálogo y documentación</p>
                    <h2 class="text-2xl md:text-3xl font-bold text-slate-900">Tratamientos de Clínica Cialo</h2>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                    <span class="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                        <i data-lucide="layers" class="w-3 h-3 inline-block mr-1"></i>${totalTratamientos} tratamientos
                    </span>
                    <span id="tratamientosVisibleBadge" class="px-3 py-1.5 rounded-full ${filteredCount < totalTratamientos ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'} font-medium transition-colors">
                        <i data-lucide="eye" class="w-3 h-3 inline-block mr-1"></i>${filteredCount} visibles
                    </span>
                    ${hasActiveFilters ? `
                        <button onclick="resetTratamientoFilters()" class="px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors flex items-center gap-1">
                            <i data-lucide="x-circle" class="w-3 h-3"></i> Limpiar
                        </button>
                    ` : ''}

                </div>
            </div>

            <!-- Layout principal: 2 columnas -->
            <div class="grid gap-4 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
                <!-- COLUMNA IZQUIERDA: Filtros + Lista -->
                <div class="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-3 pr-1">
                    <!-- Toggle filtros mobile -->
                    <button id="btnToggleTratamientoFilters"
                        class="lg:hidden w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors ${hasActiveFilters ? 'ring-2 ring-purple-200 border-purple-300' : ''}"
                        onclick="toggleTratamientoMobileFilters()">
                        <i data-lucide="sliders-horizontal" class="w-4 h-4"></i> Filtros
                        ${hasActiveFilters ? '<span class="w-2 h-2 bg-purple-500 rounded-full"></span>' : ''}
                    </button>

                    <!-- Panel de Filtros unificado -->
                    <aside id="tratamientoFiltersSidebar"
                        class="bg-white/90 backdrop-blur border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">

                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i data-lucide="filter" class="w-4 h-4 text-purple-500"></i> Filtros
                            </h3>
                            <button class="lg:hidden p-1 rounded-lg hover:bg-slate-100" onclick="toggleTratamientoMobileFilters()">
                                <i data-lucide="x" class="w-4 h-4 text-slate-400"></i>
                            </button>
                        </div>

                        <!-- Buscar -->
                        <div class="space-y-1">
                            <label class="text-xs font-semibold text-slate-500">Buscar</label>
                            <div class="relative">
                                <input type="text" id="tratamientoSearchInput"
                                    placeholder="Nombre, categoría o palabra clave"
                                    class="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-shadow focus:shadow-md"
                                    value="${tratamientoSearchTerm}" />
                                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                                ${tratamientoSearchTerm ? `
                                    <button onclick="clearTratamientoSearch()" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5">
                                        <i data-lucide="x" class="w-4 h-4"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Categoría -->
                        <div class="space-y-1">
                            <label class="text-xs font-semibold text-slate-500">Categoría</label>
                            <select id="tratamientoCategoriaSelect"
                                class="w-full py-2 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                                ${categorias.map(cat => `<option value="${cat}" ${tratamientoCategoriaActiva === cat ? 'selected' : ''}>${cat === 'Todas' ? 'Todas (categorías)' : cat} (${_getCountByCategoria(cat)})</option>`).join('')}
                            </select>
                        </div>

                        <!-- Subcategoría -->
                        <div class="space-y-1">
                            <label class="text-xs font-semibold text-slate-500">Subcategoría</label>
                            <select id="tratamientoSubcategoriaSelect"
                                class="w-full py-2 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                                ${subcategorias.map(sub => `<option value="${sub}" ${tratamientoSubcategoriaActiva === sub ? 'selected' : ''}>${sub === 'Todas' ? 'Todas (subcategorías)' : sub} (${_getCountBySubcategoria(sub)})</option>`).join('')}
                            </select>
                        </div>

                        <!-- Profesional -->
                        <div class="space-y-1">
                            <label class="text-xs font-semibold text-slate-500">Profesional</label>
                            <select id="tratamientoProfesionalSelect"
                                class="w-full py-2 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                                ${profesionales.map(prof => `<option value="${prof}" ${tratamientoProfesionalActivo === prof ? 'selected' : ''}>${prof === 'Todos' ? 'Clínica' : prof} (${_getCountByProfesional(prof)})</option>`).join('')}
                            </select>
                        </div>

                        <!-- Evaluación previa -->
                        <label class="flex items-center gap-2.5 text-sm text-slate-600 py-1 cursor-pointer hover:text-slate-800 transition-colors">
                            <input type="checkbox" id="tratamientoSoloConEvaluacion"
                                class="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" ${tratamientoSoloConEvaluacion ? 'checked' : ''}>
                            <span>Solo tratamientos con evaluación previa</span>
                        </label>

                        <!-- Limpiar filtros -->
                        ${hasActiveFilters ? `
                            <button id="btnLimpiarFiltrosTratamientos"
                                class="w-full px-4 py-2 text-sm font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Limpiar filtros
                            </button>
                        ` : ''}
                    </aside>

                    <!-- Lista de tratamientos -->
                    <div class="space-y-2 min-w-0">
                        <div id="tratamientoResultsCount" class="text-xs text-slate-500 flex items-center justify-between">
                            <span>${getTratamientoResultsCount()}</span>
                        </div>
                        <div id="tratamientoResultsContainer"
                            class="grid grid-cols-2 gap-3">
                            ${renderTratamientosList(filtered)}
                        </div>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: Detalle completo -->
                <div id="tratamientoDetailPanel" class="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                    ${renderTratamientoDetailPanel()}
                </div>
            </div>
        </div>
    `;
}

// ─── Renderizado de lista ────────────────────────────────────────────
function getTratamientoResultsCount() {
    const filtered = getFilteredTratamientos();
    if (filtered.length === tratamientosData.length) {
        return 'Mostrando todos los ' + tratamientosData.length + ' tratamientos';
    }
    return 'Mostrando <strong>' + filtered.length + '</strong> de ' + tratamientosData.length + ' tratamientos';
}

function renderTratamientosList(filtered) {
    if (!filtered) filtered = getFilteredTratamientos();
    if (filtered.length === 0) {
        return `
            <div class="col-span-full text-center py-16 text-slate-500">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <i data-lucide="search-x" class="w-10 h-10 text-slate-300"></i>
                </div>
                <p class="font-semibold text-lg text-slate-700">No se encontraron tratamientos</p>
                <p class="text-sm mt-1 max-w-xs mx-auto">Prueba con otro término de búsqueda o modifica los filtros activos</p>
                <button onclick="resetTratamientoFilters()"
                    class="mt-4 px-5 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-200 transition-colors inline-flex items-center gap-2">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Limpiar filtros
                </button>
            </div>
        `;
    }

    return filtered.map(t => renderTratamientoCard(t)).join('');
}

// ─── Tarjeta Grid (optimizada) ──────────────────────────────────────
function renderTratamientoCard(tratamiento) {
    const gradiente = getCategoriaColor(tratamiento.categoria);
    const isSelected = tratamientoSeleccionadoId === tratamiento.id;

    return `
        <article onclick="seleccionarTratamiento('${tratamiento.id}')"
            class="group bg-white rounded-2xl transition-all duration-200 cursor-pointer
            ${isSelected
            ? 'ring-2 ring-purple-400 border border-purple-200 shadow-lg shadow-purple-100/50'
            : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5'}">

            <div class="h-2 bg-gradient-to-r ${gradiente} rounded-t-2xl"></div>

            <div class="p-4 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoriaColorBg(tratamiento.categoria)} truncate">
                        ${tratamiento.subcategoria}
                    </span>
                    <span class="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                        ${tratamiento.duracion || 'Variable'}
                    </span>
                </div>

                <h3 class="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
                    ${tratamiento.nombre}
                </h3>

                <div class="flex items-center gap-2 text-xs text-slate-500">
                    <i data-lucide="user" class="w-4 h-4 flex-shrink-0"></i>
                    <span class="truncate">${tratamiento.profesional}</span>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                    <p class="font-bold text-purple-600 text-base">${formatPrecio(tratamiento.valorDesde, tratamiento.valorHasta)}</p>
                    ${tratamiento.evaluacionGratuita ? `
                        <span class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-200">✓ Eval. gratis</span>
                    ` : tratamiento.requiereEvaluacion ? `
                        <span class="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200">Req. eval.</span>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

// ─── Vista Lista compacta ────────────────────────────────────────────
function renderTratamientoListItem(tratamiento) {
    const isSelected = tratamientoSeleccionadoId === tratamiento.id;
    const gradiente = getCategoriaColor(tratamiento.categoria);

    return `
        <article onclick="seleccionarTratamiento('${tratamiento.id}')"
            class="group flex items-center gap-3 bg-white rounded-xl p-3.5 transition-all duration-200 cursor-pointer
            ${isSelected
            ? 'ring-2 ring-purple-400 border border-purple-200 shadow-md'
            : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200'}">

            <div class="w-1.5 self-stretch rounded-full bg-gradient-to-b ${gradiente} flex-shrink-0"></div>

            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoriaColorBg(tratamiento.categoria)} truncate">
                        ${tratamiento.subcategoria}
                    </span>
                    ${tratamiento.evaluacionGratuita ? `
                        <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">✓ Eval. gratis</span>
                    ` : ''}
                </div>
                <h3 class="font-bold text-slate-900 text-base truncate group-hover:text-purple-700 transition-colors">
                    ${tratamiento.nombre}
                </h3>
                <p class="text-sm text-slate-500 truncate">${tratamiento.profesional}</p>
            </div>

            <div class="text-right flex-shrink-0">
                <p class="font-bold text-purple-600 text-base whitespace-nowrap">${formatPrecio(tratamiento.valorDesde, tratamiento.valorHasta)}</p>
                <p class="text-xs text-slate-400">${tratamiento.duracion || ''}</p>
            </div>

            <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300 group-hover:text-purple-400 flex-shrink-0 transition-colors"></i>
        </article>
    `;
}

// ─── Panel de Detalle ────────────────────────────────────────────────
function renderTratamientoDetailPanel() {
    if (!tratamientoSeleccionadoId) {
        return `
            <div class="bg-white/80 backdrop-blur border border-dashed border-slate-300 rounded-3xl p-8 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
                    <i data-lucide="hand-metal" class="w-8 h-8 text-purple-300"></i>
                </div>
                <p class="text-sm font-medium text-slate-600">Selecciona un tratamiento</p>
                <p class="text-xs text-slate-400 mt-1">Haz clic en cualquier tratamiento para ver su documentación clínica completa</p>
            </div>
        `;
    }

    const tratamiento = tratamientosData.find(t => t.id === tratamientoSeleccionadoId);
    if (!tratamiento) {
        return `
            <div class="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 text-slate-600">
                <p class="text-sm">El tratamiento seleccionado no está disponible actualmente.</p>
            </div>
        `;
    }

    const gradiente = getCategoriaColor(tratamiento.categoria);
    const icono = getCategoriaIcon(tratamiento.categoria);
    const evaluacionColor = tratamiento.evaluacionGratuita
        ? 'text-emerald-600' : tratamiento.requiereEvaluacion ? 'text-amber-600' : 'text-slate-500';

    return `
        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r ${gradiente} p-4 text-white">
                <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${icono}" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-medium bg-white/25 px-2.5 py-0.5 rounded-full">${tratamiento.categoria}</span>
                            <span class="text-xs font-medium bg-white/25 px-2.5 py-0.5 rounded-full">${tratamiento.subcategoria}</span>
                        </div>
                        <h3 class="text-xl font-bold leading-snug">${tratamiento.nombre}</h3>
                        <p class="text-sm text-white/80 mt-0.5">${tratamiento.profesional}</p>
                    </div>
                </div>
            </div>

            <div class="p-4 space-y-3">
                <div class="grid grid-cols-2 gap-2.5">
                    <div class="bg-purple-50/80 border border-purple-100 rounded-xl p-3 text-center">
                        <p class="text-xs text-purple-500 uppercase tracking-wide font-semibold">Precio</p>
                        <p class="font-bold text-purple-700 text-base mt-1">${formatPrecio(tratamiento.valorDesde, tratamiento.valorHasta)}</p>
                    </div>
                    <div class="bg-blue-50/80 border border-blue-100 rounded-xl p-3 text-center">
                        <p class="text-xs text-blue-500 uppercase tracking-wide font-semibold">Duración</p>
                        <p class="font-bold text-blue-700 text-base mt-1">${tratamiento.duracion || 'Variable'}</p>
                    </div>
                    <div class="bg-green-50/80 border border-green-100 rounded-xl p-3 text-center">
                        <p class="text-xs text-green-500 uppercase tracking-wide font-semibold">Sesiones</p>
                        <p class="font-bold text-green-700 text-base mt-1">${tratamiento.sesiones || 'Según plan'}</p>
                    </div>
                    <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Evaluación</p>
                        <p class="font-bold ${evaluacionColor} text-base mt-1">${tratamiento.evaluacionGratuita ? 'Gratuita' : tratamiento.requiereEvaluacion ? 'Requerida' : 'No requerida'}</p>
                    </div>
                </div>

                <details class="group" open>
                    <summary class="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-800 py-1.5 hover:text-purple-700 transition-colors">
                        <span class="flex items-center gap-2">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-500"></i>
                            Descripción clínica
                        </span>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <p class="text-sm text-slate-600 leading-relaxed mt-1.5 pl-6">${tratamiento.descripcion}</p>
                </details>

                ${renderTratamientoGeneralInfo(tratamiento)}

                ${tratamiento.protocolo ? `
                    <details class="group">
                        <summary class="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-800 py-1.5 hover:text-purple-700 transition-colors">
                            <span class="flex items-center gap-2">
                                <i data-lucide="clipboard-list" class="w-4 h-4 text-purple-500"></i>
                                Protocolo operativo
                            </span>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
                        </summary>
                        <p class="text-sm text-slate-600 leading-relaxed mt-1.5 pl-6">${tratamiento.protocolo.replace(/\\n/g, '<br>')}</p>
                    </details>
                ` : ''}

                ${tratamiento.notas ? `
                    <details class="group">
                        <summary class="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-800 py-1.5 hover:text-purple-700 transition-colors">
                            <span class="flex items-center gap-2">
                                <i data-lucide="sticky-note" class="w-4 h-4 text-amber-500"></i>
                                Notas y precios
                            </span>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
                        </summary>
                        <div class="text-sm text-slate-600 leading-relaxed mt-1.5 pl-6 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                            ${tratamiento.notas.replace(/\\n/g, '<br>')}
                        </div>
                    </details>
                ` : ''}

                ${tratamiento.insumos && tratamiento.insumos.length > 0 ? `
                    <details class="group">
                        <summary class="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-800 py-1.5 hover:text-purple-700 transition-colors">
                            <span class="flex items-center gap-2">
                                <i data-lucide="package" class="w-4 h-4 text-orange-500"></i>
                                Insumos requeridos (${tratamiento.insumos.length})
                            </span>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
                        </summary>
                        <div class="mt-1.5 pl-6">
                            <div class="overflow-x-auto">
                                <table class="w-full text-xs">
                                    <thead>
                                        <tr class="border-b border-orange-200">
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-600">Cant.</th>
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-600">Insumo</th>
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-600">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tratamiento.insumos.map(insumo => `
                                            <tr class="border-b border-orange-50 hover:bg-orange-50/50">
                                                <td class="py-1.5 px-2 text-center font-medium text-orange-700">${insumo.cantidad}</td>
                                                <td class="py-1.5 px-2 text-slate-700">${insumo.item}</td>
                                                <td class="py-1.5 px-2 text-slate-500">${insumo.valor || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                ` : ''}

                <button type="button" onclick="openTratamientoModal('${tratamiento.id}')"
                    class="w-full px-4 py-2.5 bg-gradient-to-r ${gradiente} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 mt-2">
                    <i data-lucide="maximize-2" class="w-4 h-4"></i>
                    Ver ficha completa
                </button>
            </div>
        </div>
    `;
}

function renderTratamientoGeneralInfo(tratamiento) {
    const info = tratamientosInfoBase[tratamiento.subcategoria];
    if (!info) return '';

    const puntos = info.puntos.map(p => '<li class="text-sm text-slate-600 leading-relaxed">' + p + '</li>').join('');

    return `
        <details class="group">
            <summary class="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-800 py-1.5 hover:text-purple-700 transition-colors">
                <span class="flex items-center gap-2">
                    <i data-lucide="sparkles" class="w-4 h-4 text-purple-500"></i>
                    Info general · ${info.titulo}
                </span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div class="mt-1.5 pl-6 space-y-2">
                <p class="text-sm text-slate-600 leading-relaxed">${info.resumen}</p>
                <ul class="list-disc list-inside space-y-1">${puntos}</ul>
            </div>
        </details>
    `;
}

// ─── Updates parciales ───────────────────────────────────────────────
function updateTratamientoResults() {
    _invalidateFilterCache();
    const container = document.getElementById('tratamientoResultsContainer');
    const countElement = document.getElementById('tratamientoResultsCount');
    const badge = document.getElementById('tratamientosVisibleBadge');
    const filtered = getFilteredTratamientos();

    ensureTratamientoSeleccionado(filtered);

    if (container) {
        container.className = 'grid grid-cols-2 gap-3';
        container.innerHTML = renderTratamientosList(filtered);
        lucide.createIcons({ nodes: [container] });
    }

    if (countElement) {
        countElement.innerHTML = getTratamientoResultsCount();
    }

    if (badge) {
        const total = tratamientosData.length;
        badge.className = 'px-3 py-1.5 rounded-full font-medium transition-colors ' + (filtered.length < total ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600');
        badge.innerHTML = '<i data-lucide="eye" class="w-3 h-3 inline-block mr-1"></i>' + filtered.length + ' visibles';
        lucide.createIcons({ nodes: [badge] });
    }

    updateTratamientoDetailPanel();
}

function ensureTratamientoSeleccionado(filtered) {
    if (filtered.length === 0) {
        tratamientoSeleccionadoId = null;
        return;
    }
    if (!tratamientoSeleccionadoId || !filtered.some(t => t.id === tratamientoSeleccionadoId)) {
        tratamientoSeleccionadoId = filtered[0].id;
    }
}

function seleccionarTratamiento(id) {
    tratamientoSeleccionadoId = id;

    const container = document.getElementById('tratamientoResultsContainer');
    if (container) {
        container.innerHTML = renderTratamientosList();
        lucide.createIcons({ nodes: [container] });
    }
    updateTratamientoDetailPanel();

    // En mobile, scroll al panel de detalle
    if (window.innerWidth < 1024) {
        const panel = document.getElementById('tratamientoDetailPanel');
        if (panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function updateTratamientoDetailPanel() {
    const panel = document.getElementById('tratamientoDetailPanel');
    if (!panel) return;
    panel.innerHTML = renderTratamientoDetailPanel();
    lucide.createIcons({ nodes: [panel] });
}

function updateSubcategoriaSelectOptions() {
    const select = document.getElementById('tratamientoSubcategoriaSelect');
    if (!select) return;

    const opciones = tratamientoCategoriaActiva === 'Todas'
        ? ['Todas', ...getAllSubcategoriasTratamientos()]
        : ['Todas', ...getSubcategoriasTratamientos(tratamientoCategoriaActiva)];

    select.innerHTML = opciones.map(sub =>
        '<option value="' + sub + '">' + sub + ' (' + _getCountBySubcategoria(sub) + ')</option>'
    ).join('');
    select.value = tratamientoSubcategoriaActiva;
}

// ─── Acciones de filtros ─────────────────────────────────────────────
function setTratamientoCategoria(cat) {
    tratamientoCategoriaActiva = cat;
    tratamientoSubcategoriaActiva = 'Todas';

    const catSelect = document.getElementById('tratamientoCategoriaSelect');
    if (catSelect) catSelect.value = cat;
    updateSubcategoriaSelectOptions();

    const chipsContainer = document.getElementById('tratamientoCategoryChips');
    if (chipsContainer) {
        const categorias = ['Todas', ...getCategoriasTratamientos()];
        chipsContainer.innerHTML = categorias.map(function (c) {
            var isActive = tratamientoCategoriaActiva === c;
            var count = c !== 'Todas' ? ' <span class="opacity-70">(' + _getCountByCategoria(c) + ')</span>' : '';
            var cls = isActive
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600';
            return '<button onclick="setTratamientoCategoria(\'' + c + '\')" class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ' + cls + '">' + c + count + '</button>';
        }).join('');
    }

    updateTratamientoResults();
}

function removeTratamientoFilter(type) {
    switch (type) {
        case 'categoria':
            tratamientoCategoriaActiva = 'Todas';
            tratamientoSubcategoriaActiva = 'Todas';
            var catSel = document.getElementById('tratamientoCategoriaSelect');
            if (catSel) catSel.value = 'Todas';
            updateSubcategoriaSelectOptions();
            break;
        case 'subcategoria':
            tratamientoSubcategoriaActiva = 'Todas';
            var subSel = document.getElementById('tratamientoSubcategoriaSelect');
            if (subSel) subSel.value = 'Todas';
            break;
        case 'profesional':
            tratamientoProfesionalActivo = 'Todos';
            var profSel = document.getElementById('tratamientoProfesionalSelect');
            if (profSel) profSel.value = 'Todos';
            break;
        case 'evaluacion':
            tratamientoSoloConEvaluacion = false;
            var evalCheck = document.getElementById('tratamientoSoloConEvaluacion');
            if (evalCheck) evalCheck.checked = false;
            break;
    }
    updateTratamientoResults();
}

function resetTratamientoFilters() {
    tratamientoSearchTerm = '';
    tratamientoCategoriaActiva = 'Todas';
    tratamientoSubcategoriaActiva = 'Todas';
    tratamientoProfesionalActivo = 'Todos';
    tratamientoSoloConEvaluacion = false;

    var searchInput = document.getElementById('tratamientoSearchInput');
    var categoriaSelect = document.getElementById('tratamientoCategoriaSelect');
    var profesionalSelect = document.getElementById('tratamientoProfesionalSelect');
    var soloEvalCheckbox = document.getElementById('tratamientoSoloConEvaluacion');

    if (searchInput) searchInput.value = '';
    if (categoriaSelect) categoriaSelect.value = 'Todas';
    updateSubcategoriaSelectOptions();
    if (profesionalSelect) profesionalSelect.value = 'Todos';
    if (soloEvalCheckbox) soloEvalCheckbox.checked = false;

    setTratamientoCategoria('Todas');
}

function clearTratamientoSearch() {
    tratamientoSearchTerm = '';
    var input = document.getElementById('tratamientoSearchInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    updateTratamientoResults();
}

function toggleTratamientoMobileFilters() {
    _tratamientosMobileFiltersOpen = !_tratamientosMobileFiltersOpen;
    var sidebar = document.getElementById('tratamientoFiltersSidebar');
    if (sidebar) {
        if (_tratamientosMobileFiltersOpen) {
            sidebar.classList.remove('hidden');
        } else {
            sidebar.classList.add('hidden');
        }
    }
}

function toggleTratamientosViewMode(mode) {
    _tratamientosViewMode = mode;
    updateTratamientoResults();

    document.querySelectorAll('[onclick*="toggleTratamientosViewMode"]').forEach(function (btn) {
        var onclick = btn.getAttribute('onclick') || '';
        var isActive = onclick.indexOf(mode) !== -1;
        btn.className = 'p-1.5 rounded-full transition-colors ' + (isActive ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:text-slate-600');
    });
}

// ─── Modal ───────────────────────────────────────────────────────────
function openTratamientoModal(tratamientoId) {
    var tratamiento = tratamientosData.find(t => t.id === tratamientoId);
    if (!tratamiento) return;

    var modal = document.getElementById('tratamientoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tratamientoModal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = renderTratamientoModal(tratamiento);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons({ nodes: [modal] });
}

function closeTratamientoModal() {
    var modal = document.getElementById('tratamientoModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function renderTratamientoModal(tratamiento) {
    var gradiente = getCategoriaColor(tratamiento.categoria);
    var icono = getCategoriaIcon(tratamiento.categoria);

    return `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onclick="closeTratamientoModal()">
            <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                onclick="event.stopPropagation()">

                <div class="bg-gradient-to-r ${gradiente} p-5 text-white relative">
                    <button onclick="closeTratamientoModal()"
                        class="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <div class="flex items-start gap-3 pr-10">
                        <div class="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
                            <i data-lucide="${icono}" class="w-7 h-7"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap gap-1.5 mb-2">
                                <span class="text-xs font-medium bg-white/20 px-2.5 py-0.5 rounded-full">${tratamiento.categoria}</span>
                                <span class="text-xs font-medium bg-white/20 px-2.5 py-0.5 rounded-full">${tratamiento.subcategoria}</span>
                            </div>
                            <h2 class="text-xl font-bold mb-1">${tratamiento.nombre}</h2>
                            <div class="flex items-center gap-2 text-white/90">
                                <i data-lucide="user" class="w-4 h-4"></i>
                                <span class="text-sm">${tratamiento.profesional}</span>
                            </div>
                            ${tratamiento.especialidad ? '<p class="text-sm text-white/70 mt-0.5">' + tratamiento.especialidad + '</p>' : ''}
                        </div>
                    </div>
                </div>

                <div class="overflow-y-auto max-h-[calc(90vh-200px)] p-5 space-y-5">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="bg-purple-50 p-3 rounded-xl border border-purple-100 text-center">
                            <div class="flex items-center justify-center gap-1.5 mb-1">
                                <i data-lucide="dollar-sign" class="w-4 h-4 text-purple-500"></i>
                                <span class="text-xs font-semibold text-slate-600">Precio</span>
                            </div>
                            <p class="text-lg font-bold text-purple-600">${formatPrecio(tratamiento.valorDesde, tratamiento.valorHasta)}</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                            <div class="flex items-center justify-center gap-1.5 mb-1">
                                <i data-lucide="clock" class="w-4 h-4 text-blue-500"></i>
                                <span class="text-xs font-semibold text-slate-600">Duración</span>
                            </div>
                            <p class="text-lg font-bold text-blue-600">${tratamiento.duracion}</p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                            <div class="flex items-center justify-center gap-1.5 mb-1">
                                <i data-lucide="repeat" class="w-4 h-4 text-green-500"></i>
                                <span class="text-xs font-semibold text-slate-600">Sesiones</span>
                            </div>
                            <p class="text-sm font-bold text-green-600">${tratamiento.sesiones}</p>
                        </div>
                        <div class="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                            <div class="flex items-center justify-center gap-1.5 mb-1">
                                <i data-lucide="clipboard-check" class="w-4 h-4 text-amber-500"></i>
                                <span class="text-xs font-semibold text-slate-600">Evaluación</span>
                            </div>
                            ${tratamiento.evaluacionGratuita
            ? '<p class="text-sm font-bold text-emerald-600">Gratuita ✓</p>'
            : tratamiento.requiereEvaluacion
                ? '<p class="text-sm font-bold text-amber-600">Requerida</p>'
                : '<p class="text-sm font-bold text-slate-500">No requerida</p>'
        }
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-500"></i>
                            Descripción del Tratamiento
                        </h3>
                        <p class="text-sm text-slate-700 leading-relaxed">${tratamiento.descripcion}</p>
                    </div>

                    ${renderTratamientoGeneralInfoModal(tratamiento)}

                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <i data-lucide="stethoscope" class="w-4 h-4 text-purple-500"></i>
                            Profesional
                        </h3>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-r ${gradiente} rounded-full flex items-center justify-center text-white font-bold text-sm">
                                ${tratamiento.profesional.charAt(0)}
                            </div>
                            <div>
                                <p class="font-semibold text-slate-800 text-sm">${tratamiento.profesional}</p>
                                ${tratamiento.especialidad ? '<p class="text-xs text-slate-500">' + tratamiento.especialidad + '</p>' : ''}
                            </div>
                        </div>
                    </div>

                    ${tratamiento.protocolo ? `
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <i data-lucide="clipboard-list" class="w-4 h-4 text-purple-500"></i>
                                Protocolo operativo
                            </h3>
                            <p class="text-sm text-slate-600 leading-relaxed">${tratamiento.protocolo.replace(/\\n/g, '<br>')}</p>
                        </div>
                    ` : ''}

                    ${tratamiento.notas ? `
                        <div class="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                            <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <i data-lucide="sticky-note" class="w-4 h-4 text-amber-500"></i>
                                Notas
                            </h3>
                            <p class="text-sm text-slate-600 leading-relaxed">${tratamiento.notas.replace(/\\n/g, '<br>')}</p>
                        </div>
                    ` : ''}

                    ${tratamiento.insumos && tratamiento.insumos.length > 0 ? `
                        <div class="bg-orange-50 p-3.5 rounded-xl border border-orange-200">
                            <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <i data-lucide="package" class="w-4 h-4 text-orange-500"></i>
                                Insumos Requeridos
                            </h3>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="border-b border-orange-200">
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-700">Cant.</th>
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-700">Insumo</th>
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-700">Valor</th>
                                            <th class="text-left py-1.5 px-2 font-semibold text-slate-700">Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tratamiento.insumos.map(insumo => `
                                            <tr class="border-b border-orange-100 hover:bg-orange-100/50">
                                                <td class="py-1.5 px-2 text-center font-medium text-orange-700">${insumo.cantidad}</td>
                                                <td class="py-1.5 px-2 text-slate-700">${insumo.item}</td>
                                                <td class="py-1.5 px-2 text-slate-600">${insumo.valor || '-'}</td>
                                                <td class="py-1.5 px-2 text-slate-500 text-xs">${insumo.nota || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : ''}

                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                        <div class="flex gap-3">
                            <i data-lucide="info" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"></i>
                            <div class="text-sm text-blue-800">
                                <p class="font-medium mb-0.5">Información Importante</p>
                                <p class="text-xs">Para agendar este tratamiento o solicitar más información, contacta a recepción. Los precios pueden variar según evaluación personalizada.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-200 p-3.5 bg-slate-50 flex gap-3 justify-end">
                    <button onclick="closeTratamientoModal()"
                        class="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors text-sm">
                        Cerrar
                    </button>
                    <button class="px-5 py-2 bg-gradient-to-r ${gradiente} text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        Agendar Cita
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderTratamientoGeneralInfoModal(tratamiento) {
    var info = tratamientosInfoBase[tratamiento.subcategoria];
    if (!info) return '';

    var puntos = info.puntos.map(p => '<li class="text-sm text-slate-600 leading-relaxed">' + p + '</li>').join('');

    return `
        <div>
            <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <i data-lucide="sparkles" class="w-4 h-4 text-purple-500"></i>
                Información general · ${info.titulo}
            </h3>
            <p class="text-sm text-slate-700 leading-relaxed mb-2">${info.resumen}</p>
            <ul class="list-disc list-inside space-y-1">${puntos}</ul>
        </div>
    `;
}

// ─── Inicialización ──────────────────────────────────────────────────
function initTratamientosContent() {
    var searchInput = document.getElementById('tratamientoSearchInput');
    var categoriaSelect = document.getElementById('tratamientoCategoriaSelect');
    var subcategoriaSelect = document.getElementById('tratamientoSubcategoriaSelect');
    var profesionalSelect = document.getElementById('tratamientoProfesionalSelect');
    var soloEvalCheckbox = document.getElementById('tratamientoSoloConEvaluacion');
    var resetBtn = document.getElementById('btnLimpiarFiltrosTratamientos');

    if (searchInput) {
        searchInput.oninput = function (e) {
            var value = e.target.value;
            clearTimeout(_tratamientoDebounceTimer);
            _tratamientoDebounceTimer = setTimeout(function () {
                tratamientoSearchTerm = value;
                updateTratamientoResults();
            }, 200);
        };
    }

    if (categoriaSelect) {
        categoriaSelect.onchange = function (e) {
            setTratamientoCategoria(e.target.value);
        };
    }

    if (subcategoriaSelect) {
        subcategoriaSelect.onchange = function (e) {
            tratamientoSubcategoriaActiva = e.target.value;
            updateTratamientoResults();
        };
    }

    if (profesionalSelect) {
        profesionalSelect.onchange = function (e) {
            tratamientoProfesionalActivo = e.target.value;
            updateTratamientoResults();
        };
    }

    if (soloEvalCheckbox) {
        soloEvalCheckbox.onchange = function (e) {
            tratamientoSoloConEvaluacion = e.target.checked;
            updateTratamientoResults();
        };
    }

    if (resetBtn) {
        resetBtn.onclick = resetTratamientoFilters;
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (_tratamientosMobileFiltersOpen) {
                toggleTratamientoMobileFilters();
            }
            closeTratamientoModal();
        }
    });

    updateSubcategoriaSelectOptions();
    updateTratamientoResults();
}
