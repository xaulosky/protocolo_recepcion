/**
 * SearchResults Component
 * Muestra los resultados de búsqueda
 */

function SearchResults(searchTerm) {
    const results = performSearch(searchTerm);

    if (results.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center py-10 text-slate-500 h-full fade-in">
                <i data-lucide="help-circle" class="w-12 h-12 mb-2 opacity-50"></i>
                <p class="font-medium">No encontramos nada para "${searchTerm}".</p>
                <p class="text-sm">Intenta con sinónimos (ej: "pelo" en vez de "tricología").</p>
            </div>
        `;
    }

    return `
        <div class="p-6 bg-slate-50 flex-grow fade-in">
            <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <i data-lucide="search" class="w-5 h-5"></i>
                Resultados para "${searchTerm}" (${results.length})
            </h3>
            <div class="space-y-4">
                ${results.map((item, index) => renderSearchResult(item, index)).join('')}
            </div>
        </div>
    `;
}

function performSearch(term) {
    const lowerTerm = term.toLowerCase();
    const results = [];

    // Buscar en Protocolos
    protocolRules.forEach(rule => {
        if (rule.title.toLowerCase().includes(lowerTerm) || rule.content.toLowerCase().includes(lowerTerm)) {
            results.push({ ...rule, type: 'Protocolo Base', note: '' });
        }
    });

    // Buscar en Guiones
    Object.keys(scriptsData).forEach(cat => {
        scriptsData[cat].forEach(script => {
            if (script.title.toLowerCase().includes(lowerTerm) || script.content.toLowerCase().includes(lowerTerm)) {
                results.push({ ...script, type: `Guión (${cat})` });
            }
        });
    });

    // Buscar en Pagos
    paymentPolicies.forEach(pol => {
        if (pol.title.toLowerCase().includes(lowerTerm) || pol.content.toLowerCase().includes(lowerTerm)) {
            results.push({ ...pol, type: 'Política Pago', note: '' });
        }
    });

    return results;
}

function renderSearchResult(item, index) {
    const resultId = `search-result-${index}`;

    return `
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        ${item.type}
                    </span>
                    ${item.number ? `<span class="text-xs font-bold text-slate-400">#${item.number}</span>` : ''}
                </div>
                <button 
                    onclick="copyScriptContent('${resultId}')"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all border border-slate-200 hover:border-purple-300"
                    title="Copiar mensaje"
                >
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    <span>Copiar</span>
                </button>
            </div>
            <h4 class="font-bold text-lg text-slate-800 mb-2">${item.title}</h4>
            <div id="${resultId}" class="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                ${item.content}
            </div>
            ${item.note ? `
                <div class="mt-2 text-xs text-orange-700 flex items-center gap-1 bg-orange-50 p-2 rounded">
                    <i data-lucide="alert-triangle" class="w-3 h-3"></i> ${item.note}
                </div>
            ` : ''}
        </div>
    `;
}
