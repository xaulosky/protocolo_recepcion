/**
 * FAQContent Component
 * Sección de Preguntas Frecuentes con buscador y filtrado
 */

function FAQContent() {
    // Estado local simple para el filtrado (se podría mover al store si crece mucho)
    // Por simplicidad, usaremos variables globales temporales o data attributes
    const categories = getFAQCategories();

    return `
        <div class="space-y-6 fade-in">
            <!-- Header -->
            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <div class="flex items-start gap-4">
                    <div class="bg-white p-3 rounded-lg shadow-sm text-indigo-600">
                        <i data-lucide="help-circle" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-indigo-900">Preguntas Frecuentes (FAQ)</h2>
                        <p class="text-indigo-700 mt-1">
                            Respuestas rápidas para las dudas más comunes de los pacientes. 
                            Utiliza el buscador o los filtros para encontrar información específica.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Buscador y Filtros -->
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
                <div class="flex flex-col md:flex-row gap-4">
                    <!-- Buscador -->
                    <div class="flex-grow relative">
                        <i data-lucide="search" class="absolute left-3 top-3.5 text-slate-400 w-5 h-5"></i>
                        <input 
                            type="text" 
                            id="faqSearchInput"
                            placeholder="Buscar por palabra clave (ej: pago, botox, licencia)..." 
                            class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            oninput="handleFAQSearch(this.value)"
                        >
                    </div>
                    
                    <!-- Filtros de Categoría -->
                    <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0" id="faqCategoryFilters">
                        ${categories.map(cat => `
                            <button 
                                onclick="filterFAQByCategory('${cat}')"
                                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${cat === 'Todas' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
                                data-category="${cat}"
                            >
                                ${cat}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Lista de Preguntas (Accordion) -->
            <div id="faqListContainer" class="space-y-4">
                ${renderFAQList(faqData)}
            </div>
            
            <!-- Estado vacío (oculto por defecto) -->
            <div id="faqEmptyState" class="hidden text-center py-12">
                <div class="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
                </div>
                <h3 class="text-lg font-medium text-slate-900">No se encontraron resultados</h3>
                <p class="text-slate-500">Intenta con otros términos de búsqueda.</p>
            </div>
        </div>
    `;
}

// Renderiza la lista de preguntas
function renderFAQList(data) {
    if (!data || data.length === 0) return '';

    // Agrupar por categoría si se muestran todas, o listar plano
    // Para simplificar, listamos plano pero con distintivo de categoría

    return data.map(item => `
        <div class="bg-white border boundary-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow faq-item" data-category="${item.categoria}">
            <button 
                onclick="toggleFAQAccordion('${item.id}')"
                class="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none"
            >
                <div class="flex items-center gap-4">
                    <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-${getCategoryColor(item.categoria)}-100 text-${getCategoryColor(item.categoria)}-700 border border-${getCategoryColor(item.categoria)}-200">
                        ${item.categoria}
                    </span>
                    <span class="font-bold text-slate-800 text-lg">${item.pregunta}</span>
                </div>
                <i id="icon-${item.id}" data-lucide="chevron-down" class="w-5 h-5 text-slate-400 transition-transform duration-300"></i>
            </button>
            <div 
                id="content-${item.id}" 
                class="hidden border-t border-slate-100 bg-slate-50/50"
            >
                <div class="p-5 text-slate-600 leading-relaxed">
                    ${item.respuesta}
                    
                    ${item.tags && item.tags.length > 0 ? `
                        <div class="mt-4 flex flex-wrap gap-2">
                            ${item.tags.map(tag => `
                                <span class="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">#${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Helpers
function getCategoryColor(category) {
    const colors = {
        'General': 'slate',
        'Facial': 'purple',
        'Corporal': 'emerald',
        'Cirugía': 'blue',
        'Protocolos': 'orange'
    };
    return colors[category] || 'gray';
}

// Funciones globales de interacción
window.toggleFAQAccordion = function (id) {
    const content = document.getElementById(`content-${id}`);
    const icon = document.getElementById(`icon-${id}`);

    if (content.classList.contains('hidden')) {
        // Abrir
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        // Cerrar
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
};

window.handleFAQSearch = function (query) {
    const results = searchFAQ(query);
    const container = document.getElementById('faqListContainer');
    const emptyState = document.getElementById('faqEmptyState');

    // Si hay una categoría activa, filtrar también por eso? 
    // Por simplicidad, la búsqueda busca en todo y resetea filtros visuales
    // O podríamos mantener el filtro. Vamos a buscar en todo por ahora.

    // Resetear botones de filtro visualmente a 'Todas' si hay búsqueda
    if (query) {
        document.querySelectorAll('#faqCategoryFilters button').forEach(btn => {
            btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
            btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
        });
        // Si quisiéramos resaltar "Todas"
    }

    if (results.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        container.innerHTML = renderFAQList(results);
        lucide.createIcons();
    }
};

window.filterFAQByCategory = function (category) {
    // Actualizar estilos botones
    document.querySelectorAll('#faqCategoryFilters button').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
            btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
        } else {
            btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
            btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
        }
    });

    // Resetear search input
    const searchInput = document.getElementById('faqSearchInput');
    if (searchInput) searchInput.value = '';

    const container = document.getElementById('faqListContainer');
    const emptyState = document.getElementById('faqEmptyState');

    let results = faqData;
    if (category !== 'Todas') {
        results = faqData.filter(item => item.categoria === category);
    }

    if (results.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        container.innerHTML = renderFAQList(results);
        lucide.createIcons();
    }
};
