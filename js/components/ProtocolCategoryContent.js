/**
 * ProtocolCategoryContent.js
 * Componente genérico para visualizar protocolos por categoría
 * Lee datos globales de protocolsData
 */

function ProtocolCategoryContent() {
    // Obtener categoría del estado
    const state = appState.getState();
    const currentCategory = state.scriptCategory; // Reutilizamos esta propiedad del estado para la categoría del protocolo

    // Verificar si existe la categoría
    if (!currentCategory || !protocolsData[currentCategory]) {
        return `
            <div class="p-8 text-center">
                <div class="inline-block p-4 bg-slate-100 rounded-full mb-4">
                    <i data-lucide="help-circle" class="w-8 h-8 text-slate-400"></i>
                </div>
                <h2 class="text-xl font-bold text-slate-700 mb-2">Protocolo no encontrado</h2>
                <p class="text-slate-500">Selecciona una categoría válida del menú lateral.</p>
            </div>
        `;
    }

    const data = protocolsData[currentCategory];

    // Colores para el header
    const colors = {
        purple: "from-purple-600 to-indigo-600",
        emerald: "from-emerald-600 to-teal-600",
        blue: "from-blue-600 to-cyan-600",
        orange: "from-orange-500 to-red-500",
        slate: "from-slate-600 to-gray-600"
    };

    const headerGradient = colors[data.color] || colors.slate;

    return `
        <div class="space-y-6 animate-fade-in">
            <!-- Header de Categoría -->
            <div class="bg-gradient-to-r ${headerGradient} p-6 rounded-2xl text-white shadow-lg">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-white/20 rounded-xl">
                        <i data-lucide="${data.icon || 'file-text'}" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold mb-1">${data.title}</h2>
                        <p class="text-white/80 text-sm">Protocolos operativos estandarizados - Clínica Cialo</p>
                    </div>
                </div>
            </div>

            <!-- Secciones del Protocolo -->
            <div class="grid grid-cols-1 gap-6">
                ${data.sections.map((section, index) => renderProtocolSection(section, index, data.color)).join('')}
            </div>
            
            <!-- Footer de Control -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mt-8">
                <div class="text-xs text-slate-500">
                    <p class="font-bold">Control de Versiones</p>
                    <p>Última actualización: ${new Date().toLocaleDateString('es-CL')}</p>
                </div>
                <button onclick="window.print()" class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
                    <i data-lucide="printer" class="w-4 h-4"></i>
                    Imprimir Protocolo
                </button>
            </div>
        </div>
    `;
}

function renderProtocolSection(section, index, colorName) {
    // Mapa de colores ligeros para los iconos de paso
    const lightColors = {
        purple: "bg-purple-100 text-purple-700",
        emerald: "bg-emerald-100 text-emerald-700",
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-700",
        slate: "bg-slate-100 text-slate-700"
    };

    const badgeClass = lightColors[colorName] || lightColors.slate;

    return `
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <div class="p-5">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full ${badgeClass} flex items-center justify-center text-sm font-bold">
                        ${index + 1}
                    </span>
                    ${section.title}
                </h3>
                
                <div class="pl-11">
                    <div class="prose prose-sm max-w-none text-slate-600 space-y-2 leading-relaxed">
                        ${renderMarkdownText(section.content)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderizador simple de markdown para listas y negritas
 */
function renderMarkdownText(text) {
    if (!text) return '';

    let html = text
        // Negritas: **texto**
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
        // Listas bullet: • texto o - texto
        .replace(/^[•-]\s+(.*)$/gm, '<div class="flex items-start gap-2 mb-1"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span><span>$1</span></div>')
        // Listas numeradas: 1. texto
        .replace(/^\d+\.\s+(.*)$/gm, '<div class="flex items-start gap-2 mb-1"><span class="font-bold text-slate-400 min-w-[1.2rem] mt-0.5">•</span><span>$1</span></div>')
        // Saltos de línea
        .replace(/\n/g, '<br>');

    return html;
}
