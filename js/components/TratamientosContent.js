/**
 * TratamientosContent Component
 * Catálogo de tratamientos con filtros y búsqueda
 */

// Estado del filtro de tratamientos
let tratamientoSearchTerm = '';
let tratamientoCategoriaActiva = 'Todas';

function TratamientosContent() {
    const categorias = ['Todas', ...getCategoriasTratamientos()];

    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-lg text-white">
                <div class="flex items-center gap-3">
                    <i data-lucide="sparkles" class="w-8 h-8"></i>
                    <div>
                        <h2 class="font-bold text-xl">Catálogo de Tratamientos</h2>
                        <p class="text-purple-100 text-sm">${tratamientosData.length} tratamientos disponibles</p>
                    </div>
                </div>
            </div>

            <!-- Filtros y búsqueda -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Buscador -->
                    <div class="flex-grow relative">
                        <input 
                            type="text" 
                            id="tratamientoSearchInput" 
                            placeholder="Buscar tratamiento, profesional..."
                            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value="${tratamientoSearchTerm}"
                        />
                        <i data-lucide="search" class="absolute left-3 top-3 text-slate-400 w-5 h-5"></i>
                    </div>
                    
                    <!-- Filtro por categoría -->
                    <div class="flex flex-wrap gap-2">
                        ${categorias.map(cat => `
                            <button 
                                data-categoria="${cat}"
                                class="px-3 py-2 rounded-lg text-sm font-medium transition-all
                                ${tratamientoCategoriaActiva === cat
            ? 'bg-purple-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700'}"
                            >
                                ${cat}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Contador de resultados -->
            <div id="tratamientoResultsCount" class="text-sm text-slate-500">
                ${getTratamientoResultsCount()}
            </div>

            <!-- Lista de tratamientos -->
            <div id="tratamientoResultsContainer" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                ${renderTratamientosList()}
            </div>
        </div>
    `;
}

function getFilteredTratamientos() {
    let filtered = tratamientosData;

    // Filtrar por categoría
    if (tratamientoCategoriaActiva !== 'Todas') {
        filtered = filtered.filter(t => t.categoria === tratamientoCategoriaActiva);
    }

    // Filtrar por búsqueda
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

    return filtered;
}

function getTratamientoResultsCount() {
    const filtered = getFilteredTratamientos();
    return `Mostrando ${filtered.length} de ${tratamientosData.length} tratamientos`;
}

function renderTratamientosList() {
    const filtered = getFilteredTratamientos();

    if (filtered.length === 0) {
        return `
            <div class="col-span-full text-center py-12 text-slate-500">
                <i data-lucide="search-x" class="w-16 h-16 mx-auto mb-4 text-slate-300"></i>
                <p class="font-medium text-lg">No se encontraron tratamientos</p>
                <p class="text-sm">Intenta con otro término de búsqueda o categoría</p>
            </div>
        `;
    }

    return filtered.map(t => renderTratamientoCard(t)).join('');
}

function formatPrecio(desde, hasta) {
    const formatNum = (n) => '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (hasta && hasta !== desde) {
        return `${formatNum(desde)} - ${formatNum(hasta)}`;
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

function renderTratamientoCard(tratamiento) {
    const gradiente = getCategoriaColor(tratamiento.categoria);
    const icono = getCategoriaIcon(tratamiento.categoria);

    return `
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
            <!-- Header con gradiente -->
            <div class="bg-gradient-to-r ${gradiente} p-3 text-white">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                        ${tratamiento.subcategoria}
                    </span>
                    <i data-lucide="${icono}" class="w-5 h-5 opacity-75"></i>
                </div>
            </div>
            
            <!-- Contenido -->
            <div class="p-4">
                <h3 class="font-bold text-slate-800 text-lg mb-2 group-hover:text-purple-600 transition-colors">
                    ${tratamiento.nombre}
                </h3>
                
                <p class="text-sm text-slate-600 mb-3 line-clamp-2">
                    ${tratamiento.descripcion}
                </p>
                
                <!-- Profesional -->
                <div class="flex items-center gap-2 mb-3 text-sm">
                    <i data-lucide="user" class="w-4 h-4 text-purple-500"></i>
                    <span class="text-slate-700 font-medium">${tratamiento.profesional}</span>
                </div>
                
                <!-- Info grid -->
                <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div class="flex items-center gap-1 text-slate-500">
                        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                        <span>${tratamiento.duracion}</span>
                    </div>
                    <div class="flex items-center gap-1 text-slate-500">
                        <i data-lucide="repeat" class="w-3.5 h-3.5"></i>
                        <span>${tratamiento.sesiones}</span>
                    </div>
                </div>
                
                <!-- Precio y evaluación -->
                <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div class="text-lg font-bold text-purple-600">
                        ${formatPrecio(tratamiento.valorDesde, tratamiento.valorHasta)}
                    </div>
                    ${tratamiento.evaluacionGratuita ? `
                        <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Eval. gratuita
                        </span>
                    ` : tratamiento.requiereEvaluacion ? `
                        <span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                            Requiere eval.
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function updateTratamientoResults() {
    const container = document.getElementById('tratamientoResultsContainer');
    const countElement = document.getElementById('tratamientoResultsCount');

    if (container) {
        container.innerHTML = renderTratamientosList();
        lucide.createIcons({ nodes: [container] });
    }

    if (countElement) {
        countElement.textContent = getTratamientoResultsCount();
    }
}

function initTratamientosContent() {
    // Buscador
    const searchInput = document.getElementById('tratamientoSearchInput');
    if (searchInput) {
        searchInput.oninput = (e) => {
            tratamientoSearchTerm = e.target.value;
            updateTratamientoResults();
        };
    }

    // Filtros de categoría
    const categoriaBtns = document.querySelectorAll('[data-categoria]');
    categoriaBtns.forEach(btn => {
        btn.onclick = () => {
            tratamientoCategoriaActiva = btn.dataset.categoria;

            // Actualizar estilos de botones
            categoriaBtns.forEach(b => {
                if (b.dataset.categoria === tratamientoCategoriaActiva) {
                    b.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-purple-100', 'hover:text-purple-700');
                    b.classList.add('bg-purple-500', 'text-white');
                } else {
                    b.classList.remove('bg-purple-500', 'text-white');
                    b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-purple-100', 'hover:text-purple-700');
                }
            });

            updateTratamientoResults();
        };
    });
}
