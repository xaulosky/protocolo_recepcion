/**
 * ProtocolBase Component
 * Home con Dashboard de accesos rápidos y protocolos base
 */

function ProtocolBase() {
    const stats = getDashboardStats();

    return `
        <!-- Dashboard Header -->
        <div class="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-2xl text-white mb-6 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold mb-1">¡Bienvenido a Clínica Cialo!</h1>
                    <p class="text-purple-100">Panel de Recepción - ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div class="hidden md:flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-xs text-purple-200">Hora actual</p>
                        <p id="currentTime" class="text-2xl font-bold">${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <i data-lucide="clock" class="w-6 h-6"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-xl text-white shadow-md">
                <div class="flex items-center justify-between mb-2">
                    <i data-lucide="sparkles" class="w-6 h-6 opacity-80"></i>
                    <span class="text-2xl font-bold">${stats.tratamientos}</span>
                </div>
                <p class="text-sm text-pink-100">Tratamientos</p>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white shadow-md">
                <div class="flex items-center justify-between mb-2">
                    <i data-lucide="users" class="w-6 h-6 opacity-80"></i>
                    <span class="text-2xl font-bold">${stats.profesionales}</span>
                </div>
                <p class="text-sm text-blue-100">Profesionales</p>
            </div>
            <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-xl text-white shadow-md">
                <div class="flex items-center justify-between mb-2">
                    <i data-lucide="calendar-check" class="w-6 h-6 opacity-80"></i>
                    <span class="text-2xl font-bold">${stats.consultas}</span>
                </div>
                <p class="text-sm text-amber-100">Consultas</p>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl text-white shadow-md">
                <div class="flex items-center justify-between mb-2">
                    <i data-lucide="package" class="w-6 h-6 opacity-80"></i>
                    <span class="text-2xl font-bold">${stats.productos}</span>
                </div>
                <p class="text-sm text-green-100">Productos</p>
            </div>
        </div>

        <!-- Accesos Rápidos -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i data-lucide="zap" class="w-5 h-5 text-amber-500"></i>
                Accesos Rápidos
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                ${renderQuickAccess('tratamientos', 'sparkles', 'Tratamientos', 'from-pink-500 to-rose-500')}
                ${renderQuickAccess('profesionales', 'user-check', 'Profesionales', 'from-purple-500 to-violet-500')}
                ${renderQuickAccess('pagos', 'credit-card', 'Métodos de Pago', 'from-green-500 to-emerald-500')}
                ${renderQuickAccess('productos', 'shopping-bag', 'Productos', 'from-blue-500 to-cyan-500')}
                ${renderQuickAccess('consentimientos', 'file-signature', 'Consentimientos', 'from-amber-500 to-orange-500')}
                ${renderQuickAccess('guiones', 'message-square', 'Guiones', 'from-indigo-500 to-purple-500')}
            </div>
        </div>

        <!-- Sección de Tareas y Protocolos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Datos de Transferencia -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                    <h3 class="font-bold flex items-center gap-2">
                        <i data-lucide="banknote" class="w-5 h-5"></i>
                        Datos de Transferencia
                    </h3>
                </div>
                <div class="p-4 space-y-3 text-sm">
                    <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p class="font-bold text-green-800 mb-1">Centro Médico Cialo SPA</p>
                        <p class="text-slate-600">RUT: 78.155.814-1</p>
                        <p class="text-slate-600">Banco Santander — Cta. Cte. Nº 0-000-9779419-7</p>
                        <p class="text-slate-600">Mail: pagos@cialo.cl</p>
                    </div>
                    <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <p class="font-bold text-purple-800 mb-1">Cialo Facial SPA</p>
                        <p class="text-slate-600">RUT: 78.024.821-1</p>
                        <p class="text-slate-600">Banco Santander — Cta. Cte. Nº 0000-9648-3139</p>
                        <p class="text-slate-600">Mail: pagos@cialo.cl</p>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <a href="https://micrositios.getnet.cl/cialo" target="_blank" class="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-xs">
                            💳 Link Pago Cialo
                        </a>
                        <a href="https://micrositios.getnet.cl/cialofacial" target="_blank" class="flex-1 text-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-xs">
                            💳 Link Pago Facial
                        </a>
                    </div>
                </div>
            </div>

            <!-- Acciones Frecuentes y Ubicación -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-violet-500 p-4 text-white">
                    <h3 class="font-bold flex items-center gap-2">
                        <i data-lucide="zap" class="w-5 h-5"></i>
                        Acciones y Ubicación
                    </h3>
                </div>
                <div class="p-4 space-y-3">
                    <!-- Ubicación -->
                    <a href="https://maps.app.goo.gl/PyeYcr4JdqW7iJ4G9" target="_blank" 
                       class="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <i data-lucide="map-pin" class="w-5 h-5"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-slate-800">📍 Bulnes 220, Oficina 509</p>
                            <p class="text-xs text-slate-500">Ed. Puerto Mayor II, Los Ángeles</p>
                        </div>
                        <i data-lucide="external-link" class="w-4 h-4 text-blue-500"></i>
                    </a>
                    
                    <!-- Acciones -->
                    <button onclick="appState.setState({activeTab: 'presupuestos'})" 
                            class="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg text-left transition-colors border border-slate-100">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <i data-lucide="calculator" class="w-5 h-5 text-purple-600"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-800">Crear Presupuesto</p>
                            <p class="text-xs text-slate-500">Generar cotización para paciente</p>
                        </div>
                    </button>
                    <button onclick="appState.setState({activeTab: 'consentimientos'})" 
                            class="w-full flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg text-left transition-colors border border-slate-100">
                        <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <i data-lucide="file-check" class="w-5 h-5 text-amber-600"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-800">Imprimir Consentimiento</p>
                            <p class="text-xs text-slate-500">Documentos para firma</p>
                        </div>
                    </button>
                    <button onclick="appState.setState({activeTab: 'tratamientos'})" 
                            class="w-full flex items-center gap-3 p-3 hover:bg-pink-50 rounded-lg text-left transition-colors border border-slate-100">
                        <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <i data-lucide="search" class="w-5 h-5 text-pink-600"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-800">Buscar Tratamiento</p>
                            <p class="text-xs text-slate-500">Consultar precios y detalles</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Protocolos Base -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-red-500 to-rose-500 p-4 text-white">
                <h3 class="font-bold flex items-center gap-2">
                    <i data-lucide="shield-alert" class="w-5 h-5"></i>
                    Protocolos de Cumplimiento Obligatorio
                </h3>
            </div>
            <div class="bg-red-50 text-red-800 p-3 text-xs font-bold border-b border-red-100 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                ESTRICTO CUMPLIMIENTO: No se permiten modificaciones sin autorización de Dirección.
            </div>
            <div class="divide-y divide-slate-100">
                ${protocolRules.map(rule => renderProtocolRule(rule)).join('')}
            </div>
        </div>
    `;
}

function getDashboardStats() {
    return {
        tratamientos: typeof tratamientosData !== 'undefined' ? tratamientosData.length : 0,
        profesionales: typeof profesionalesData !== 'undefined' ? profesionalesData.length : 0,
        consultas: typeof consultasData !== 'undefined' ? consultasData.length : 0,
        productos: typeof products !== 'undefined' ? products.length : 0
    };
}

function renderQuickAccess(tab, icon, label, gradient) {
    return `
        <button onclick="appState.setState({activeTab: '${tab}'})" 
                class="group p-4 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
            <div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <i data-lucide="${icon}" class="w-6 h-6"></i>
            </div>
            <p class="text-sm font-medium text-slate-700 text-center">${label}</p>
        </button>
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

// Actualizar hora cada minuto
setInterval(() => {
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        timeEl.textContent = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    }
}, 60000);
