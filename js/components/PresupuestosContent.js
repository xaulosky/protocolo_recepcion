/**
 * PresupuestosContent Component
 * Generador de presupuestos para pacientes con búsqueda de tratamientos
 */

// Estado del presupuesto actual
let presupuestoState = {
    paciente: {
        nombre: '',
        rut: '',
        telefono: '',
        email: ''
    },
    items: [],
    descuento: 0,
    notas: ''
};

// Contador para IDs únicos de items
let itemIdCounter = 0;

// Estado de búsqueda de tratamientos
let busquedaTratamiento = '';
let tratamientoSeleccionado = null;

function PresupuestosContent() {
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-lg text-white">
                <div class="flex items-center gap-3">
                    <i data-lucide="file-text" class="w-8 h-8"></i>
                    <div>
                        <h2 class="font-bold text-xl">Generador de Presupuestos</h2>
                        <p class="text-emerald-100 text-sm">Crea presupuestos personalizados para pacientes</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Columna izquierda: Datos del paciente y agregar items -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Datos del Paciente -->
                    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i data-lucide="user" class="w-5 h-5 text-emerald-500"></i>
                            Datos del Paciente
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                                <input type="text" id="presupuestoPacienteNombre" 
                                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Nombre del paciente"
                                    value="${presupuestoState.paciente.nombre}"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">RUT</label>
                                <input type="text" id="presupuestoPacienteRut" 
                                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="12.345.678-9"
                                    value="${presupuestoState.paciente.rut}"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                <input type="tel" id="presupuestoPacienteTelefono" 
                                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="+56 9 1234 5678"
                                    value="${presupuestoState.paciente.telefono}"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" id="presupuestoPacienteEmail" 
                                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="paciente@email.com"
                                    value="${presupuestoState.paciente.email}"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Buscar y Agregar Tratamiento -->
                    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i data-lucide="search" class="w-5 h-5 text-emerald-500"></i>
                            Buscar Tratamiento
                        </h3>
                        
                        <!-- Buscador -->
                        <div class="relative">
                            <input type="text" id="buscarTratamientoInput" 
                                class="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                                placeholder="Escribe para buscar tratamientos..."
                                value="${busquedaTratamiento}"
                                autocomplete="off"
                            />
                            <i data-lucide="search" class="absolute left-3 top-3.5 text-emerald-400 w-5 h-5"></i>
                        </div>

                        <!-- Resultados de búsqueda -->
                        <div id="resultadosBusquedaTratamiento" class="mt-3">
                            ${renderResultadosBusqueda()}
                        </div>

                        <!-- Tratamiento seleccionado -->
                        <div id="tratamientoSeleccionadoContainer" class="${tratamientoSeleccionado ? '' : 'hidden'} mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            ${tratamientoSeleccionado ? renderTratamientoSeleccionado() : ''}
                        </div>
                    </div>

                    <!-- Agregar manualmente (colapsado) -->
                    <details class="bg-white border border-slate-200 rounded-xl shadow-sm">
                        <summary class="p-4 cursor-pointer font-medium text-slate-600 hover:text-slate-800 flex items-center gap-2">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                            Agregar tratamiento manualmente
                        </summary>
                        <div class="p-5 pt-0 border-t border-slate-100">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Tratamiento</label>
                                    <input type="text" id="nuevoItemNombre" 
                                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Nombre del tratamiento"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Cantidad</label>
                                    <input type="number" id="nuevoItemCantidad" 
                                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value="1" min="1"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Valor unitario</label>
                                    <input type="number" id="nuevoItemValor" 
                                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <button id="btnAgregarItemManual" 
                                class="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                                Agregar manualmente
                            </button>
                        </div>
                    </details>

                    <!-- Lista de Items -->
                    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i data-lucide="list" class="w-5 h-5 text-emerald-500"></i>
                            Tratamientos en el presupuesto
                            <span class="ml-auto text-sm font-normal text-slate-500">${presupuestoState.items.length} items</span>
                        </h3>
                        <div id="presupuestoItemsContainer">
                            ${renderPresupuestoItems()}
                        </div>
                    </div>
                </div>

                <!-- Columna derecha: Resumen y acciones -->
                <div class="space-y-6">
                    <!-- Resumen -->
                    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-4">
                        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i data-lucide="calculator" class="w-5 h-5 text-emerald-500"></i>
                            Resumen
                        </h3>
                        
                        <div id="presupuestoResumen">
                            ${renderPresupuestoResumen()}
                        </div>

                        <!-- Descuento -->
                        <div class="mt-4 pt-4 border-t border-slate-200">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Descuento (%)</label>
                            <input type="number" id="presupuestoDescuento" 
                                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                value="${presupuestoState.descuento}" min="0" max="100"
                            />
                        </div>

                        <!-- Notas -->
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Notas adicionales</label>
                            <textarea id="presupuestoNotas" rows="3"
                                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                placeholder="Observaciones, condiciones, validez..."
                            >${presupuestoState.notas}</textarea>
                        </div>

                        <!-- Acciones -->
                        <div class="mt-6 space-y-3">
                            <button id="btnCopiarPresupuesto" 
                                class="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium">
                                <i data-lucide="copy" class="w-5 h-5"></i>
                                Copiar presupuesto
                            </button>
                            <button id="btnImprimirPresupuesto" 
                                class="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-medium">
                                <i data-lucide="printer" class="w-5 h-5"></i>
                                Imprimir
                            </button>
                            <button id="btnLimpiarPresupuesto" 
                                class="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                Limpiar todo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderResultadosBusqueda() {
    if (!busquedaTratamiento || busquedaTratamiento.length < 2) {
        return `
            <div class="text-center py-4 text-slate-400 text-sm">
                <p>Escribe al menos 2 caracteres para buscar</p>
            </div>
        `;
    }

    const search = busquedaTratamiento.toLowerCase();
    const resultados = tratamientosData.filter(t =>
        t.nombre.toLowerCase().includes(search) ||
        t.categoria.toLowerCase().includes(search) ||
        t.profesional.toLowerCase().includes(search)
    ).slice(0, 8); // Máximo 8 resultados

    if (resultados.length === 0) {
        return `
            <div class="text-center py-4 text-slate-400">
                <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                <p class="text-sm">No se encontraron tratamientos</p>
            </div>
        `;
    }

    return `
        <div class="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
            ${resultados.map(t => `
                <button type="button" 
                    class="w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                    onclick="seleccionarTratamiento('${t.id}')"
                >
                    <div class="min-w-0 flex-grow">
                        <div class="font-medium text-slate-800 group-hover:text-emerald-700">${t.nombre}</div>
                        <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span class="bg-slate-100 px-1.5 py-0.5 rounded">${t.categoria}</span>
                            <span>${t.profesional}</span>
                        </div>
                    </div>
                    <div class="text-right ml-3 flex-shrink-0">
                        <div class="font-bold text-emerald-600">$${formatNumber(t.valorDesde)}</div>
                        ${t.valorHasta ? `<div class="text-xs text-slate-400">hasta $${formatNumber(t.valorHasta)}</div>` : ''}
                    </div>
                </button>
            `).join('')}
        </div>
    `;
}

function renderTratamientoSeleccionado() {
    if (!tratamientoSeleccionado) return '';

    const t = tratamientoSeleccionado;
    return `
        <div class="flex items-start justify-between gap-4">
            <div class="flex-grow">
                <div class="font-bold text-emerald-800 text-lg">${t.nombre}</div>
                <div class="text-sm text-emerald-700 mt-1">${t.profesional}</div>
                <div class="text-xs text-emerald-600 mt-1">${t.descripcion}</div>
            </div>
            <button onclick="cancelarSeleccion()" class="text-emerald-600 hover:text-emerald-800 p-1">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <div class="mt-4 grid grid-cols-3 gap-3">
            <div>
                <label class="block text-xs font-medium text-emerald-700 mb-1">Cantidad</label>
                <input type="number" id="cantidadSeleccionado" value="1" min="1"
                    class="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                />
            </div>
            <div>
                <label class="block text-xs font-medium text-emerald-700 mb-1">Valor unitario</label>
                <input type="number" id="valorSeleccionado" value="${t.valorDesde}"
                    class="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                />
            </div>
            <div class="flex items-end">
                <button id="btnAgregarSeleccionado"
                    class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Agregar
                </button>
            </div>
        </div>
    `;
}

function seleccionarTratamiento(id) {
    tratamientoSeleccionado = tratamientosData.find(t => t.id === id);
    busquedaTratamiento = '';

    // Actualizar UI
    document.getElementById('buscarTratamientoInput').value = '';
    document.getElementById('resultadosBusquedaTratamiento').innerHTML = renderResultadosBusqueda();

    const container = document.getElementById('tratamientoSeleccionadoContainer');
    container.classList.remove('hidden');
    container.innerHTML = renderTratamientoSeleccionado();

    lucide.createIcons();

    // Agregar listener al botón
    const btnAgregar = document.getElementById('btnAgregarSeleccionado');
    if (btnAgregar) {
        btnAgregar.onclick = agregarTratamientoSeleccionado;
    }
}

function cancelarSeleccion() {
    tratamientoSeleccionado = null;
    const container = document.getElementById('tratamientoSeleccionadoContainer');
    container.classList.add('hidden');
    container.innerHTML = '';
}

function agregarTratamientoSeleccionado() {
    if (!tratamientoSeleccionado) return;

    const cantidad = parseInt(document.getElementById('cantidadSeleccionado').value) || 1;
    const valorUnitario = parseInt(document.getElementById('valorSeleccionado').value) || tratamientoSeleccionado.valorDesde;

    presupuestoState.items.push({
        id: ++itemIdCounter,
        nombre: tratamientoSeleccionado.nombre,
        cantidad,
        valorUnitario
    });

    cancelarSeleccion();
    actualizarPresupuestoUI();
}

function renderPresupuestoItems() {
    if (presupuestoState.items.length === 0) {
        return `
            <div class="text-center py-8 text-slate-400">
                <i data-lucide="package" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p>No hay tratamientos agregados</p>
                <p class="text-sm">Busca y agrega tratamientos arriba</p>
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left text-sm text-slate-500 border-b border-slate-200">
                        <th class="pb-2 font-medium">Tratamiento</th>
                        <th class="pb-2 font-medium text-center">Cant.</th>
                        <th class="pb-2 font-medium text-right">V. Unit.</th>
                        <th class="pb-2 font-medium text-right">Subtotal</th>
                        <th class="pb-2 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    ${presupuestoState.items.map(item => `
                        <tr class="border-b border-slate-100 last:border-0">
                            <td class="py-3 text-slate-800">${item.nombre}</td>
                            <td class="py-3 text-center text-slate-600">${item.cantidad}</td>
                            <td class="py-3 text-right text-slate-600">$${formatNumber(item.valorUnitario)}</td>
                            <td class="py-3 text-right font-medium text-slate-800">$${formatNumber(item.cantidad * item.valorUnitario)}</td>
                            <td class="py-3">
                                <button onclick="eliminarItemPresupuesto(${item.id})" 
                                    class="text-red-400 hover:text-red-600 transition-colors p-1">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderPresupuestoResumen() {
    const subtotal = presupuestoState.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);
    const descuentoMonto = subtotal * (presupuestoState.descuento / 100);
    const total = subtotal - descuentoMonto;

    return `
        <div class="space-y-2">
            <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span class="font-medium">$${formatNumber(subtotal)}</span>
            </div>
            ${presupuestoState.descuento > 0 ? `
                <div class="flex justify-between text-emerald-600">
                    <span>Descuento (${presupuestoState.descuento}%):</span>
                    <span class="font-medium">-$${formatNumber(descuentoMonto)}</span>
                </div>
            ` : ''}
            <div class="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span>$${formatNumber(total)}</span>
            </div>
        </div>
    `;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function agregarItemPresupuesto() {
    const nombre = document.getElementById('nuevoItemNombre').value.trim();
    const cantidad = parseInt(document.getElementById('nuevoItemCantidad').value) || 1;
    const valorUnitario = parseInt(document.getElementById('nuevoItemValor').value) || 0;

    if (!nombre) {
        alert('Por favor ingresa el nombre del tratamiento');
        return;
    }

    if (valorUnitario <= 0) {
        alert('Por favor ingresa un valor válido');
        return;
    }

    presupuestoState.items.push({
        id: ++itemIdCounter,
        nombre,
        cantidad,
        valorUnitario
    });

    // Limpiar formulario
    document.getElementById('nuevoItemNombre').value = '';
    document.getElementById('nuevoItemCantidad').value = '1';
    document.getElementById('nuevoItemValor').value = '';

    actualizarPresupuestoUI();
}

function eliminarItemPresupuesto(id) {
    presupuestoState.items = presupuestoState.items.filter(item => item.id !== id);
    actualizarPresupuestoUI();
}

function actualizarPresupuestoUI() {
    const itemsContainer = document.getElementById('presupuestoItemsContainer');
    const resumenContainer = document.getElementById('presupuestoResumen');

    if (itemsContainer) {
        itemsContainer.innerHTML = renderPresupuestoItems();
    }
    if (resumenContainer) {
        resumenContainer.innerHTML = renderPresupuestoResumen();
    }
    lucide.createIcons();
}

function generarTextoPresupuesto() {
    const subtotal = presupuestoState.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);
    const descuentoMonto = subtotal * (presupuestoState.descuento / 100);
    const total = subtotal - descuentoMonto;
    const fecha = new Date().toLocaleDateString('es-CL');

    let texto = `📋 *PRESUPUESTO CLÍNICA CIALO*\n`;
    texto += `📅 Fecha: ${fecha}\n\n`;

    if (presupuestoState.paciente.nombre) {
        texto += `👤 *Paciente:* ${presupuestoState.paciente.nombre}\n`;
        if (presupuestoState.paciente.rut) texto += `🆔 RUT: ${presupuestoState.paciente.rut}\n`;
        texto += `\n`;
    }

    texto += `*TRATAMIENTOS:*\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━\n`;

    presupuestoState.items.forEach(item => {
        const subtotalItem = item.cantidad * item.valorUnitario;
        if (item.cantidad > 1) {
            texto += `• ${item.nombre}\n  ${item.cantidad} x $${formatNumber(item.valorUnitario)} = $${formatNumber(subtotalItem)}\n`;
        } else {
            texto += `• ${item.nombre}: $${formatNumber(subtotalItem)}\n`;
        }
    });

    texto += `━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `💰 Subtotal: $${formatNumber(subtotal)}\n`;

    if (presupuestoState.descuento > 0) {
        texto += `✨ Descuento (${presupuestoState.descuento}%): -$${formatNumber(descuentoMonto)}\n`;
    }

    texto += `\n💎 *TOTAL: $${formatNumber(total)}*\n`;

    if (presupuestoState.notas) {
        texto += `\n📝 *Notas:* ${presupuestoState.notas}\n`;
    }

    texto += `\n✅ Presupuesto válido por 30 días\n`;
    texto += `📍 Clínica Cialo - Los Ángeles`;

    return texto;
}

function copiarPresupuesto() {
    if (presupuestoState.items.length === 0) {
        alert('Agrega al menos un tratamiento al presupuesto');
        return;
    }

    const texto = generarTextoPresupuesto();

    navigator.clipboard.writeText(texto).then(() => {
        const btn = document.getElementById('btnCopiarPresupuesto');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Copiado!';
        btn.classList.remove('bg-emerald-500');
        btn.classList.add('bg-green-600');
        lucide.createIcons();

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-emerald-500');
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('Error al copiar. Intenta de nuevo.');
    });
}

function limpiarPresupuesto() {
    if (presupuestoState.items.length > 0 && !confirm('¿Estás seguro de limpiar todo el presupuesto?')) {
        return;
    }

    presupuestoState = {
        paciente: { nombre: '', rut: '', telefono: '', email: '' },
        items: [],
        descuento: 0,
        notas: ''
    };
    busquedaTratamiento = '';
    tratamientoSeleccionado = null;

    // Limpiar todos los inputs
    document.getElementById('presupuestoPacienteNombre').value = '';
    document.getElementById('presupuestoPacienteRut').value = '';
    document.getElementById('presupuestoPacienteTelefono').value = '';
    document.getElementById('presupuestoPacienteEmail').value = '';
    document.getElementById('presupuestoDescuento').value = '0';
    document.getElementById('presupuestoNotas').value = '';
    document.getElementById('buscarTratamientoInput').value = '';

    cancelarSeleccion();
    actualizarPresupuestoUI();
    document.getElementById('resultadosBusquedaTratamiento').innerHTML = renderResultadosBusqueda();
}

function imprimirPresupuesto() {
    if (presupuestoState.items.length === 0) {
        alert('Agrega al menos un tratamiento al presupuesto');
        return;
    }

    const subtotal = presupuestoState.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);
    const descuentoMonto = subtotal * (presupuestoState.descuento / 100);
    const total = subtotal - descuentoMonto;
    const fecha = new Date().toLocaleDateString('es-CL');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Presupuesto - Clínica Cialo</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
                .header h1 { color: #10b981; margin: 0; }
                .header p { color: #666; margin: 5px 0; }
                .info { margin-bottom: 20px; }
                .info p { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f8fafc; font-weight: 600; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; font-size: 1.2em; background: #ecfdf5; }
                .notes { background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; }
                .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CLÍNICA CIALO</h1>
                <p>Presupuesto de Tratamientos</p>
                <p>Fecha: ${fecha}</p>
            </div>

            ${presupuestoState.paciente.nombre ? `
                <div class="info">
                    <p><strong>Paciente:</strong> ${presupuestoState.paciente.nombre}</p>
                    ${presupuestoState.paciente.rut ? `<p><strong>RUT:</strong> ${presupuestoState.paciente.rut}</p>` : ''}
                    ${presupuestoState.paciente.telefono ? `<p><strong>Teléfono:</strong> ${presupuestoState.paciente.telefono}</p>` : ''}
                    ${presupuestoState.paciente.email ? `<p><strong>Email:</strong> ${presupuestoState.paciente.email}</p>` : ''}
                </div>
            ` : ''}

            <table>
                <thead>
                    <tr>
                        <th>Tratamiento</th>
                        <th class="text-right">Cantidad</th>
                        <th class="text-right">Valor Unitario</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${presupuestoState.items.map(item => `
                        <tr>
                            <td>${item.nombre}</td>
                            <td class="text-right">${item.cantidad}</td>
                            <td class="text-right">$${formatNumber(item.valorUnitario)}</td>
                            <td class="text-right">$${formatNumber(item.cantidad * item.valorUnitario)}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                        <td class="text-right">$${formatNumber(subtotal)}</td>
                    </tr>
                    ${presupuestoState.descuento > 0 ? `
                        <tr>
                            <td colspan="3" class="text-right" style="color: #10b981;"><strong>Descuento (${presupuestoState.descuento}%):</strong></td>
                            <td class="text-right" style="color: #10b981;">-$${formatNumber(descuentoMonto)}</td>
                        </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td colspan="3" class="text-right">TOTAL:</td>
                        <td class="text-right">$${formatNumber(total)}</td>
                    </tr>
                </tbody>
            </table>

            ${presupuestoState.notas ? `
                <div class="notes">
                    <strong>Notas:</strong><br>
                    ${presupuestoState.notas}
                </div>
            ` : ''}

            <div class="footer">
                <p>Este presupuesto tiene una validez de 30 días.</p>
                <p>Clínica Cialo - Los Ángeles, Chile</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Inicializa los event listeners del componente de presupuestos
 */
function initPresupuestosContent() {
    // Buscador de tratamientos
    const buscarInput = document.getElementById('buscarTratamientoInput');
    if (buscarInput) {
        buscarInput.oninput = (e) => {
            busquedaTratamiento = e.target.value;
            document.getElementById('resultadosBusquedaTratamiento').innerHTML = renderResultadosBusqueda();
            lucide.createIcons();
        };
    }

    // Agregar item manual
    const btnAgregarManual = document.getElementById('btnAgregarItemManual');
    if (btnAgregarManual) {
        btnAgregarManual.onclick = agregarItemPresupuesto;
    }

    // Copiar presupuesto
    const btnCopiar = document.getElementById('btnCopiarPresupuesto');
    if (btnCopiar) {
        btnCopiar.onclick = copiarPresupuesto;
    }

    // Imprimir
    const btnImprimir = document.getElementById('btnImprimirPresupuesto');
    if (btnImprimir) {
        btnImprimir.onclick = imprimirPresupuesto;
    }

    // Limpiar
    const btnLimpiar = document.getElementById('btnLimpiarPresupuesto');
    if (btnLimpiar) {
        btnLimpiar.onclick = limpiarPresupuesto;
    }

    // Actualizar descuento
    const inputDescuento = document.getElementById('presupuestoDescuento');
    if (inputDescuento) {
        inputDescuento.oninput = (e) => {
            presupuestoState.descuento = parseInt(e.target.value) || 0;
            document.getElementById('presupuestoResumen').innerHTML = renderPresupuestoResumen();
        };
    }

    // Guardar datos del paciente
    ['Nombre', 'Rut', 'Telefono', 'Email'].forEach(field => {
        const input = document.getElementById(`presupuestoPaciente${field}`);
        if (input) {
            input.oninput = (e) => {
                presupuestoState.paciente[field.toLowerCase()] = e.target.value;
            };
        }
    });

    // Guardar notas
    const inputNotas = document.getElementById('presupuestoNotas');
    if (inputNotas) {
        inputNotas.oninput = (e) => {
            presupuestoState.notas = e.target.value;
        };
    }

    // Enter para agregar item rápido (manual)
    const inputValor = document.getElementById('nuevoItemValor');
    if (inputValor) {
        inputValor.onkeypress = (e) => {
            if (e.key === 'Enter') {
                agregarItemPresupuesto();
            }
        };
    }
}
