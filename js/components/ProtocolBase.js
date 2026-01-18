/**
 * ProtocolBase Component
 * Visualización de Protocolos de Cumplimiento Obligatorio
 */

function ProtocolBase() {
    return `
        <div class="space-y-6 animate-fade-in">
            <!-- Header Sección -->
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                <i data-lucide="shield-alert" class="w-6 h-6 text-red-600 mt-0.5"></i>
                <div>
                    <h2 class="text-lg font-bold text-red-800">Protocolos de Cumplimiento Obligatorio</h2>
                    <p class="text-sm text-red-700">
                        Los siguientes lineamientos son de estricta aplicación para todo el equipo de recepción y atención al paciente.
                        Cualquier excepción debe ser autorizada por Dirección.
                    </p>
                </div>
            </div>

            <!-- Lista de Protocolos -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="font-bold text-slate-700 flex items-center gap-2">
                        <i data-lucide="list-checks" class="w-5 h-5 text-slate-500"></i>
                        Listado de Reglas (${protocolRules.length})
                    </h3>
                    <div class="text-xs text-slate-500">
                        Actualizado: ${new Date().toLocaleDateString('es-CL')}
                    </div>
                </div>
                <div class="divide-y divide-slate-100">
                    ${protocolRules.map(rule => renderProtocolRule(rule)).join('')}
                </div>
            </div>

            <!-- Footer Informativo -->
            <div class="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                <i data-lucide="info" class="w-5 h-5 text-blue-600"></i>
                <p class="text-sm text-blue-800">
                    Si tienes dudas sobre la aplicación de algún protocolo en una situación específica, consulta siempre con tu supervisor directo antes de actuar.
                </p>
            </div>
        </div>
    `;
}

function renderProtocolRule(rule) {
    return `
        <div class="flex gap-4 p-5 hover:bg-slate-50 transition-colors bg-white group">
            <div class="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-600 rounded-xl flex items-center justify-center font-bold text-lg transition-colors">
                ${rule.number}
            </div>
            <div class="flex-grow">
                <h5 class="font-bold text-slate-800 text-base mb-2 group-hover:text-purple-700 transition-colors">${rule.title}</h5>
                <div class="text-sm text-slate-600 whitespace-pre-line leading-relaxed">${rule.content}</div>
            </div>
        </div>
    `;
}
