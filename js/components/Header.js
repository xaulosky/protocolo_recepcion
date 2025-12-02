/**
 * Header Component
 * Renderiza el encabezado de la aplicación
 */

function Header() {
    return `
        <div class="bg-slate-900 text-white p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 class="text-2xl font-bold flex items-center gap-2">
                        <i data-lucide="book-open" class="text-purple-400"></i>
                        Manual de Recepción Cialo v3.1
                    </h1>
                    <p class="text-slate-400 text-sm mt-1">Protocolos obligatorios y Guiones de respuesta</p>
                </div>
            </div>
        </div>
    `;
}
