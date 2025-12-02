/**
 * ProtocolBase Component
 * Muestra los protocolos base obligatorios
 */

function ProtocolBase() {
    return `
        <div class="bg-red-50 text-red-800 p-3 rounded mb-4 text-xs font-bold border border-red-100 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
            ESTRICTO CUMPLIMIENTO: No se permiten modificaciones sin autorización de Dirección.
        </div>
        <div class="space-y-0 divide-y divide-slate-100 border border-slate-100 rounded-lg">
            ${protocolRules.map(rule => renderProtocolRule(rule)).join('')}
        </div>
    `;
}

function renderProtocolRule(rule) {
    return `
        <div class="flex gap-4 p-4 hover:bg-slate-50 transition-colors bg-white">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                ${rule.number}
            </div>
            <div>
                <h5 class="font-bold text-slate-800 text-sm mb-1">${rule.title}</h5>
                <div class="text-sm text-slate-600 whitespace-pre-line">${rule.content}</div>
            </div>
        </div>
    `;
}
