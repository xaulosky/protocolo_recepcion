/**
 * GuionesContent Component
 * Muestra los guiones técnicos por categoría
 */

function GuionesContent() {
    const { scriptCategory } = appState.getState();
    const categories = Object.keys(scriptsData);

    return `
        <div class="flex flex-wrap gap-2 mb-4 pb-2 border-b border-slate-100">
            ${categories.map(cat => renderCategoryButton(cat, scriptCategory)).join('')}
        </div>

        <div class="space-y-4">
            ${scriptsData[scriptCategory].map((script, index) => renderScript(script, index)).join('')}
        </div>
    `;
}

function renderCategoryButton(category, activeCategory) {
    const categoryLabels = {
        'Gestion': 'Gestión',
        'Estetica': 'Estética',
        'Corporal': 'Corporal',
        'Nutricion': 'Nutrición',
        'Medica': 'Médica',
        'Indicaciones': 'Indicaciones'
    };

    const isActive = activeCategory === category;

    return `
        <button 
            data-category="${category}"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap 
            ${isActive ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}"
        >
            ${categoryLabels[category] || category}
        </button>
    `;
}

function renderScript(script, index) {
    const scriptId = `script-${index}`;

    return `
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div class="flex items-start justify-between mb-3">
                <h4 class="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <i data-lucide="message-circle" class="text-purple-500 w-5 h-5"></i>
                    ${script.title}
                </h4>
                <button 
                    onclick="copyScriptContent('${scriptId}')"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all border border-slate-200 hover:border-purple-300"
                    title="Copiar mensaje"
                >
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    <span>Copiar</span>
                </button>
            </div>
            <div id="${scriptId}" class="bg-slate-50 p-4 rounded border border-slate-100 whitespace-pre-line text-sm text-slate-700 leading-relaxed font-medium">
                ${script.content}
            </div>
            ${script.note ? `
                <div class="mt-3 text-xs text-orange-700 bg-orange-50 p-2 rounded border border-orange-100 flex items-start gap-2">
                    <i data-lucide="alert-triangle" class="w-4 h-4 mt-0.5"></i>
                    <span>${script.note}</span>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Inicializa los event listeners de las categorías
 */
function initGuionesContent() {
    const categoryButtons = document.querySelectorAll('[data-category]');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            appState.setScriptCategory(category);
        });
    });
}
