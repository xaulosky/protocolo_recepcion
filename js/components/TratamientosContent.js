/**
 * TratamientosContent Component
 * Catálogo de tratamientos con filtros y búsqueda
 */

// Estado del filtro de tratamientos
let tratamientoSearchTerm = '';
let tratamientoCategoriaActiva = 'Todas';
let tratamientoSubcategoriaActiva = 'Todas';
let tratamientoProfesionalActivo = 'Todos';

function TratamientosContent() {
    const categorias = ['Todas', ...getCategoriasTratamientos()];
    const profesionales = ['Todos', ...getProfesionalesTratamientos()];

    // Subcategorías dinámicas según categoría seleccionada
    let subcategorias = ['Todas'];
    if (tratamientoCategoriaActiva !== 'Todas') {
        subcategorias = ['Todas', ...getSubcategoriasTratamientos(tratamientoCategoriaActiva)];
    }

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
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                <!-- Primera fila: Búsqueda y Profesional -->
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
                    
                    <!-- Filtro por Profesional -->
                    <div class="min-w-48">
                        <select id="tratamientoProfesionalSelect" 
                                class="w-full py-2.5 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm">
                            ${profesionales.map(prof => `
                                <option value="${prof}" ${tratamientoProfesionalActivo === prof ? 'selected' : ''}>
                                    ${prof === 'Todos' ? '👨‍⚕️ Todos los profesionales' : prof}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Segunda fila: Categorías -->
                <div>
                    <p class="text-xs text-slate-500 mb-2 font-medium">Categoría:</p>
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
                
                <!-- Tercera fila: Subcategorías (solo si hay categoría seleccionada) -->
                ${tratamientoCategoriaActiva !== 'Todas' ? `
                    <div>
                        <p class="text-xs text-slate-500 mb-2 font-medium">Subcategoría:</p>
                        <div class="flex flex-wrap gap-2">
                            ${subcategorias.map(subcat => `
                                <button 
                                    data-subcategoria="${subcat}"
                                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                    ${tratamientoSubcategoriaActiva === subcat
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 border border-slate-200'}"
                                >
                                    ${subcat}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
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

    // Filtrar por subcategoría
    if (tratamientoSubcategoriaActiva !== 'Todas') {
        filtered = filtered.filter(t => t.subcategoria === tratamientoSubcategoriaActiva);
    }

    // Filtrar por profesional
    if (tratamientoProfesionalActivo !== 'Todos') {
        filtered = filtered.filter(t => t.profesional === tratamientoProfesionalActivo);
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
    // Si ambos son null, mostrar "Consultar"
    if (desde === null && hasta === null) {
        return 'Consultar';
    }

    // Si solo desde es null pero hay hasta
    if (desde === null) {
        return 'Hasta $' + hasta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const formatNum = (n) => '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (hasta && hasta !== desde) {
        return `${formatNum(desde)} - ${formatNum(hasta)} `;
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
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
            onclick="openTratamientoModal('${tratamiento.id}')">
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

                <!-- Botón Ver Detalles -->
                <button class="w-full mt-3 px-4 py-2 bg-gradient-to-r ${gradiente} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    onclick="event.stopPropagation(); openTratamientoModal('${tratamiento.id}')">
                    <i data-lucide="info" class="w-4 h-4"></i>
                    Ver Detalles Completos
                </button>
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

function openTratamientoModal(tratamientoId) {
    const tratamiento = tratamientosData.find(t => t.id === tratamientoId);
    if (!tratamiento) return;

    // Crear modal si no existe
    let modal = document.getElementById('tratamientoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tratamientoModal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = renderTratamientoModal(tratamiento);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Refrescar iconos
    lucide.createIcons({ nodes: [modal] });
}

function closeTratamientoModal() {
    const modal = document.getElementById('tratamientoModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function renderTratamientoModal(tratamiento) {
    const gradiente = getCategoriaColor(tratamiento.categoria);
    const icono = getCategoriaIcon(tratamiento.categoria);

    return `
        <!-- Modal Overlay -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onclick="closeTratamientoModal()">
            <!-- Modal Content -->
            <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                onclick="event.stopPropagation()">

                <!-- Header con gradiente -->
                <div class="bg-gradient-to-r ${gradiente} p-6 text-white relative">
                    <button onclick="closeTratamientoModal()"
                        class="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>

                    <div class="flex items-start gap-4">
                        <div class="p-3 bg-white/20 rounded-xl">
                            <i data-lucide="${icono}" class="w-8 h-8"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium bg-white/20 px-3 py-1 rounded-full inline-block mb-2">
                                ${tratamiento.categoria} • ${tratamiento.subcategoria}
                            </div>
                            <h2 class="text-2xl font-bold mb-2">${tratamiento.nombre}</h2>
                            <div class="flex items-center gap-2 text-white/90">
                                <i data-lucide="user" class="w-4 h-4"></i>
                                <span class="text-sm">${tratamiento.profesional}</span>
                            </div>
                            ${tratamiento.especialidad ? `
                                <p class="text-sm text-white/75 mt-1">${tratamiento.especialidad}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Body con scroll -->
                <div class="overflow-y-auto max-h-[calc(90vh-200px)] p-6">

                    <!-- Descripción -->
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="file-text" class="w-5 h-5 text-purple-500"></i>
                            Descripción del Tratamiento
                        </h3>
                        <p class="text-slate-700 leading-relaxed">${tratamiento.descripcion}</p>
                    </div>

                    <!-- Información Clave -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <!-- Precio -->
                        <div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="dollar-sign" class="w-5 h-5 text-purple-600"></i>
                                <h4 class="font-semibold text-slate-800">Precio</h4>
                            </div>
                            <p class="text-2xl font-bold text-purple-600">
                                ${formatPrecio(tratamiento.valorDesde, tratamiento.valorHasta)}
                            </p>
                        </div>

                        <!-- Duración -->
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="clock" class="w-5 h-5 text-blue-600"></i>
                                <h4 class="font-semibold text-slate-800">Duración</h4>
                            </div>
                            <p class="text-lg font-medium text-blue-600">${tratamiento.duracion}</p>
                        </div>

                        <!-- Sesiones -->
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="repeat" class="w-5 h-5 text-green-600"></i>
                                <h4 class="font-semibold text-slate-800">Sesiones</h4>
                            </div>
                            <p class="text-lg font-medium text-green-600">${tratamiento.sesiones}</p>
                        </div>

                        <!-- Evaluación -->
                        <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="clipboard-check" class="w-5 h-5 text-amber-600"></i>
                                <h4 class="font-semibold text-slate-800">Evaluación</h4>
                            </div>
                            ${tratamiento.evaluacionGratuita ? `
                                <div class="flex items-center gap-2">
                                    <span class="text-lg font-medium text-green-600">Gratuita</span>
                                    <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Incluida</span>
                                </div>
                            ` : tratamiento.requiereEvaluacion ? `
                                <p class="text-lg font-medium text-amber-600">Requerida</p>
                                <p class="text-xs text-amber-700 mt-1">Consultar valor</p>
                            ` : `
                                <p class="text-lg font-medium text-slate-600">No requerida</p>
                            `}
                        </div>
                    </div>

                    <!-- Profesional -->
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="stethoscope" class="w-5 h-5 text-purple-500"></i>
                            Profesional
                        </h3>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-gradient-to-r ${gradiente} rounded-full flex items-center justify-center text-white font-bold text-lg">
                                ${tratamiento.profesional.charAt(0)}
                            </div>
                            <div>
                                <p class="font-semibold text-slate-800">${tratamiento.profesional}</p>
                                ${tratamiento.especialidad ? `
                                    <p class="text-sm text-slate-600">${tratamiento.especialidad}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    ${tratamiento.insumos && tratamiento.insumos.length > 0 ? `
                    <!-- Insumos Requeridos -->
                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-6">
                        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="package" class="w-5 h-5 text-orange-500"></i>
                            Insumos Requeridos
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-orange-200">
                                        <th class="text-left py-2 px-2 font-semibold text-slate-700">Cant.</th>
                                        <th class="text-left py-2 px-2 font-semibold text-slate-700">Insumo</th>
                                        <th class="text-left py-2 px-2 font-semibold text-slate-700">Valor</th>
                                        <th class="text-left py-2 px-2 font-semibold text-slate-700">Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tratamiento.insumos.map(insumo => `
                                        <tr class="border-b border-orange-100 hover:bg-orange-100/50">
                                            <td class="py-2 px-2 text-center font-medium text-orange-700">${insumo.cantidad}</td>
                                            <td class="py-2 px-2 text-slate-700">${insumo.item}</td>
                                            <td class="py-2 px-2 text-slate-600">${insumo.valor || '-'}</td>
                                            <td class="py-2 px-2 text-slate-500 text-xs">${insumo.nota || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Nota informativa -->
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div class="flex gap-3">
                            <i data-lucide="info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
                            <div class="text-sm text-blue-800">
                                <p class="font-medium mb-1">Información Importante</p>
                                <p>Para agendar este tratamiento o solicitar más información, contacta a recepción. Los precios pueden variar según evaluación personalizada.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="border-t border-slate-200 p-4 bg-slate-50 flex gap-3 justify-end">
                    <button onclick="closeTratamientoModal()"
                        class="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors">
                        Cerrar
                    </button>
                    <button class="px-6 py-2.5 bg-gradient-to-r ${gradiente} text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        Agendar Cita
                    </button>
                </div>
            </div>
        </div>
`;
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

    // Filtro por profesional (select)
    const profesionalSelect = document.getElementById('tratamientoProfesionalSelect');
    if (profesionalSelect) {
        profesionalSelect.onchange = (e) => {
            tratamientoProfesionalActivo = e.target.value;
            updateTratamientoResults();
        };
    }

    // Filtros de categoría
    const categoriaBtns = document.querySelectorAll('[data-categoria]');
    categoriaBtns.forEach(btn => {
        btn.onclick = () => {
            tratamientoCategoriaActiva = btn.dataset.categoria;
            // Reset subcategoría cuando cambia la categoría
            tratamientoSubcategoriaActiva = 'Todas';

            // Re-renderizar todo el componente para actualizar subcategorías
            const container = document.getElementById('mainContent');
            if (container) {
                container.innerHTML = TratamientosContent();
                lucide.createIcons({ nodes: [container] });
                initTratamientosContent(); // Reinicializar listeners
            }
        };
    });

    // Filtros de subcategoría
    const subcategoriaBtns = document.querySelectorAll('[data-subcategoria]');
    subcategoriaBtns.forEach(btn => {
        btn.onclick = () => {
            tratamientoSubcategoriaActiva = btn.dataset.subcategoria;

            // Actualizar estilos de botones de subcategoría
            subcategoriaBtns.forEach(b => {
                if (b.dataset.subcategoria === tratamientoSubcategoriaActiva) {
                    b.classList.remove('bg-slate-50', 'text-slate-600', 'hover:bg-indigo-100', 'hover:text-indigo-700', 'border', 'border-slate-200');
                    b.classList.add('bg-indigo-500', 'text-white');
                } else {
                    b.classList.remove('bg-indigo-500', 'text-white');
                    b.classList.add('bg-slate-50', 'text-slate-600', 'hover:bg-indigo-100', 'hover:text-indigo-700', 'border', 'border-slate-200');
                }
            });

            updateTratamientoResults();
        };
    });

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTratamientoModal();
        }
    });
}
