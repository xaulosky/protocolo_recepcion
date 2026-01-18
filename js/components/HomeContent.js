/**
 * HomeContent Component
 * Dashboard principal de la aplicación
 */

function HomeContent() {
    // Calcular estadísticas
    const stats = {
        guiones: Object.values(scriptsData).flat().length,
        tratamientos: tratamientosData.length,
        profesionales: profesionalesData.length,
        protocolos: protocolRules.length
    };

    return `
        <div class="space-y-8 animate-fade-in">
            <!-- Hero Section -->
            <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-lg">
                <div class="relative z-10">
                    <h2 class="text-3xl font-bold mb-2">Bienvenido a Cialo Hub</h2>
                    <p class="text-purple-100 text-lg max-w-2xl">
                        Plataforma integral de gestión de protocolos, guiones y recursos clínicos de Clínica Cialo.
                    </p>
                </div>
                
                <!-- Decoración de fondo -->
                <div class="absolute right-0 top-0 h-full w-1/3 opacity-10">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-7.1C81.5,6.2,70.2,18.5,59.6,29.1C49,39.7,39.1,48.6,27.9,55.1C16.7,61.6,4.2,65.7,-7.6,63.9C-19.4,62.1,-30.5,54.4,-40.7,46.1C-50.9,37.8,-60.2,28.9,-67.2,17.9C-74.2,6.9,-78.9,-6.2,-75.6,-18.3C-72.3,-30.4,-61,-41.5,-49.4,-49.9C-37.8,-58.3,-25.9,-64,-13.4,-67.1C-0.9,-70.2,11.6,-70.7,24.1,-71.2Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            <!-- Accesos Rápidos -->
            <div>
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="zap" class="w-5 h-5 text-yellow-500"></i>
                    Accesos Rápidos
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Guiones -->
                    <button onclick="navigateToSection('guiones')" class="group p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left">
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <i data-lucide="message-circle" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-slate-800 mb-1">Guiones Técnicos</h4>
                        <p class="text-xs text-slate-500">Respuestas y manejo de pacientes</p>
                    </button>

                    <!-- Tratamientos -->
                    <button onclick="navigateToSection('tratamientos')" class="group p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left">
                        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <i data-lucide="sparkles" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-slate-800 mb-1">Catálogo de Tratamientos</h4>
                        <p class="text-xs text-slate-500">Precios y detalles de servicios</p>
                    </button>

                    <!-- Profesionales -->
                    <button onclick="navigateToSection('profesionales')" class="group p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left">
                        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <i data-lucide="users" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-slate-800 mb-1">Profesionales</h4>
                        <p class="text-xs text-slate-500">Directorio y especialidades</p>
                    </button>

                    <!-- Presupuestos -->
                    <button onclick="navigateToSection('presupuestos')" class="group p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left">
                        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <i data-lucide="file-text" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-slate-800 mb-1">Presupuestos</h4>
                        <p class="text-xs text-slate-500">Generador de presupuestos</p>
                    </button>
                </div>
            </div>

            <!-- Estadísticas Resumen -->
            <div>
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="bar-chart-2" class="w-5 h-5 text-purple-600"></i>
                    Resumen del Sistema
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p class="text-slate-500 text-sm mb-1">Total Guiones</p>
                        <p class="text-2xl font-bold text-slate-800">${stats.guiones}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p class="text-slate-500 text-sm mb-1">Tratamientos</p>
                        <p class="text-2xl font-bold text-slate-800">${stats.tratamientos}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p class="text-slate-500 text-sm mb-1">Profesionales</p>
                        <p class="text-2xl font-bold text-slate-800">${stats.profesionales}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p class="text-slate-500 text-sm mb-1">Protocolos Base</p>
                        <p class="text-2xl font-bold text-slate-800">${stats.protocolos}</p>
                    </div>
                </div>
            </div>

            <!-- Novedades / Info -->
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div class="flex items-start gap-4">
                    <div class="bg-white p-2 rounded-full shadow-sm">
                        <i data-lucide="info" class="w-6 h-6 text-blue-600"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-blue-900 mb-2">¿Necesitas ayuda rápida?</h4>
                        <p class="text-blue-800 text-sm mb-4">
                            Utiliza la barra de búsqueda global (Ctrl + K) para encontrar rápidamente cualquier tratamiento, profesional o guión sin necesidad de navegar por los menús.
                        </p>
                        <div class="flex gap-2">
                            <span class="px-2 py-1 bg-white/50 rounded text-xs font-mono text-blue-700 border border-blue-200">Ctrl + K</span>
                            <span class="text-blue-600 text-sm">para enfocar el buscador</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
