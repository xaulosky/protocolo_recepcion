/**
 * SolicitudReembolsoContent Component
 * Formulario para que las recepcionistas soliciten reembolsos a administración
 */

// Estado local del formulario de reembolso
let reembolsoFormState = {
    nombrePaciente: '',
    rutPaciente: '',
    telefonoPaciente: '',
    emailPaciente: '',
    monto: '',
    motivo: '',
    metodoPagoOriginal: '',
    fechaPagoOriginal: '',
    numeroComprobante: '',
    cuentaDestino: '',
    tipoCuenta: '',
    bancoDestino: '',
    nombreTitular: '',
    rutTitular: '',
    observaciones: '',
    urgente: false
};

// Lista de solicitudes guardadas (simulado - en producción sería una API)
let solicitudesReembolso = [];

/**
 * Renderiza el contenido principal de Solicitud de Reembolso
 */
function SolicitudReembolsoContent() {
    return `
        <div class="space-y-6">
            <!-- Descripción -->
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <div class="p-2 bg-amber-100 rounded-lg">
                        <i data-lucide="info" class="w-5 h-5 text-amber-600"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-amber-800">Solicitud de Reembolso a Paciente</h3>
                        <p class="text-sm text-amber-700 mt-1">
                            Complete este formulario para solicitar a administración la devolución de dinero a un paciente. 
                            Una vez enviado, el equipo de administración revisará y procesará la solicitud.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Formulario -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                    <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                        <i data-lucide="file-plus" class="w-5 h-5"></i>
                        Nueva Solicitud de Reembolso
                    </h2>
                </div>
                
                <form id="reembolsoForm" class="p-6 space-y-6">
                    <!-- Sección: Datos del Paciente -->
                    <div class="space-y-4">
                        <h3 class="text-md font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                            <i data-lucide="user" class="w-4 h-4 text-purple-500"></i>
                            Datos del Paciente
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre Completo <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="nombrePaciente"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="Nombre completo del paciente"
                                    required
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    RUT <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="rutPaciente"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="12.345.678-9"
                                    required
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Teléfono
                                </label>
                                <input 
                                    type="tel" 
                                    id="telefonoPaciente"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="+56 9 1234 5678"
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>
                                <input 
                                    type="email" 
                                    id="emailPaciente"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="paciente@email.com"
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Información del Pago Original -->
                    <div class="space-y-4">
                        <h3 class="text-md font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                            <i data-lucide="credit-card" class="w-4 h-4 text-purple-500"></i>
                            Información del Pago Original
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Monto a Reembolsar <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input 
                                        type="text" 
                                        id="monto"
                                        class="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        placeholder="0"
                                        required
                                        oninput="formatMontoInput(this)"
                                    >
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Fecha del Pago Original <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="date" 
                                    id="fechaPagoOriginal"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    required
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Método de Pago Original <span class="text-red-500">*</span>
                                </label>
                                <select 
                                    id="metodoPagoOriginal"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="debito">Tarjeta de Débito</option>
                                    <option value="credito">Tarjeta de Crédito</option>
                                    <option value="transferencia">Transferencia Bancaria</option>
                                    <option value="getnet">Link de Pago GetNet</option>
                                </select>
                            </div>
                            <div class="md:col-span-2 lg:col-span-3">
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    N° de Comprobante / Boleta
                                </label>
                                <input 
                                    type="text" 
                                    id="numeroComprobante"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="Número de boleta o comprobante de pago"
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Motivo del Reembolso -->
                    <div class="space-y-4">
                        <h3 class="text-md font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                            <i data-lucide="message-square" class="w-4 h-4 text-purple-500"></i>
                            Motivo del Reembolso
                        </h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">
                                Seleccione el motivo <span class="text-red-500">*</span>
                            </label>
                            <select 
                                id="motivoCategoria"
                                class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors mb-3"
                                required
                                onchange="toggleMotivoOtro(this)"
                            >
                                <option value="">Seleccionar motivo...</option>
                                <option value="cancelacion_paciente">Cancelación solicitada por el paciente</option>
                                <option value="cancelacion_clinica">Cancelación por parte de la clínica</option>
                                <option value="error_cobro">Error en el cobro (cobro duplicado, monto incorrecto)</option>
                                <option value="tratamiento_no_realizado">Tratamiento no realizado</option>
                                <option value="insatisfaccion">Insatisfacción con el servicio</option>
                                <option value="cambio_tratamiento">Cambio de tratamiento (diferencia de valor)</option>
                                <option value="abono_no_utilizado">Abono no utilizado</option>
                                <option value="otro">Otro motivo</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">
                                Descripción detallada <span class="text-red-500">*</span>
                            </label>
                            <textarea 
                                id="motivo"
                                rows="4"
                                class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                                placeholder="Describa detalladamente el motivo del reembolso..."
                                required
                            ></textarea>
                        </div>
                    </div>

                    <!-- Sección: Datos para la Transferencia -->
                    <div class="space-y-4">
                        <h3 class="text-md font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                            <i data-lucide="building-2" class="w-4 h-4 text-purple-500"></i>
                            Datos Bancarios para Transferencia
                        </h3>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p class="text-sm text-blue-700 flex items-center gap-2">
                                <i data-lucide="info" class="w-4 h-4"></i>
                                Complete los datos bancarios del paciente para realizar la transferencia del reembolso.
                            </p>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre del Titular <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="nombreTitular"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="Nombre del titular de la cuenta"
                                    required
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    RUT del Titular <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="rutTitular"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="12.345.678-9"
                                    required
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Banco <span class="text-red-500">*</span>
                                </label>
                                <select 
                                    id="bancoDestino"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    required
                                >
                                    <option value="">Seleccionar banco...</option>
                                    <option value="santander">Banco Santander</option>
                                    <option value="chile">Banco de Chile</option>
                                    <option value="bci">BCI</option>
                                    <option value="estado">Banco Estado</option>
                                    <option value="scotiabank">Scotiabank</option>
                                    <option value="itau">Banco Itaú</option>
                                    <option value="security">Banco Security</option>
                                    <option value="falabella">Banco Falabella</option>
                                    <option value="bice">BICE</option>
                                    <option value="consorcio">Banco Consorcio</option>
                                    <option value="ripley">Banco Ripley</option>
                                    <option value="internacional">Banco Internacional</option>
                                    <option value="mercado_pago">Mercado Pago</option>
                                    <option value="tenpo">Tenpo</option>
                                    <option value="mach">MACH</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Tipo de Cuenta <span class="text-red-500">*</span>
                                </label>
                                <select 
                                    id="tipoCuenta"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    required
                                >
                                    <option value="">Seleccionar tipo...</option>
                                    <option value="corriente">Cuenta Corriente</option>
                                    <option value="vista">Cuenta Vista / RUT</option>
                                    <option value="ahorro">Cuenta de Ahorro</option>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">
                                    Número de Cuenta <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="cuentaDestino"
                                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    placeholder="Número de cuenta bancaria"
                                    required
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Observaciones Adicionales -->
                    <div class="space-y-4">
                        <h3 class="text-md font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-500"></i>
                            Observaciones Adicionales
                        </h3>
                        
                        <textarea 
                            id="observaciones"
                            rows="3"
                            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                            placeholder="Agregue cualquier información adicional relevante para el proceso de reembolso..."
                        ></textarea>
                        
                        <!-- Checkbox Urgente -->
                        <label class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                            <input 
                                type="checkbox" 
                                id="urgente"
                                class="w-5 h-5 text-red-600 border-2 border-red-300 rounded focus:ring-red-500"
                            >
                            <div>
                                <span class="font-medium text-red-700">Marcar como URGENTE</span>
                                <p class="text-xs text-red-600">Solo marcar si el paciente requiere el reembolso de forma inmediata</p>
                            </div>
                        </label>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                        <button 
                            type="submit"
                            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <i data-lucide="send" class="w-5 h-5"></i>
                            Enviar Solicitud a Administración
                        </button>
                        <button 
                            type="button"
                            onclick="limpiarFormularioReembolso()"
                            class="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <i data-lucide="eraser" class="w-5 h-5"></i>
                            Limpiar Formulario
                        </button>
                    </div>
                </form>
            </div>

            <!-- Lista de Solicitudes Recientes -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h2 class="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <i data-lucide="history" class="w-5 h-5 text-slate-500"></i>
                        Solicitudes Recientes
                    </h2>
                </div>
                
                <div id="listaSolicitudes" class="p-6">
                    ${renderSolicitudesRecientes()}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza la lista de solicitudes recientes
 */
function renderSolicitudesRecientes() {
    if (solicitudesReembolso.length === 0) {
        return `
            <div class="text-center py-8 text-slate-500">
                <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <i data-lucide="inbox" class="w-8 h-8 text-slate-400"></i>
                </div>
                <p class="font-medium">No hay solicitudes recientes</p>
                <p class="text-sm">Las solicitudes enviadas aparecerán aquí</p>
            </div>
        `;
    }

    return `
        <div class="space-y-3">
            ${solicitudesReembolso.map((solicitud, index) => `
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 ${solicitud.urgente ? 'bg-red-100' : 'bg-purple-100'} rounded-full flex items-center justify-center">
                            <i data-lucide="${solicitud.urgente ? 'alert-circle' : 'receipt'}" class="w-5 h-5 ${solicitud.urgente ? 'text-red-600' : 'text-purple-600'}"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-slate-800">${solicitud.nombrePaciente}</p>
                            <p class="text-sm text-slate-500">${solicitud.motivoCategoria} - ${formatMonto(solicitud.monto)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoStyles(solicitud.estado)}">
                            ${solicitud.estado}
                        </span>
                        <p class="text-xs text-slate-400 mt-1">${solicitud.fecha}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Obtiene los estilos según el estado de la solicitud
 */
function getEstadoStyles(estado) {
    switch (estado) {
        case 'Pendiente':
            return 'bg-yellow-100 text-yellow-800';
        case 'En Proceso':
            return 'bg-blue-100 text-blue-800';
        case 'Aprobado':
            return 'bg-green-100 text-green-800';
        case 'Rechazado':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-slate-100 text-slate-800';
    }
}

/**
 * Formatea el monto para mostrar
 */
function formatMonto(monto) {
    const numero = parseInt(monto.replace(/\D/g, ''));
    return '$' + numero.toLocaleString('es-CL');
}

/**
 * Formatea el input de monto mientras se escribe
 */
function formatMontoInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value) {
        value = parseInt(value).toLocaleString('es-CL');
    }
    input.value = value;
}

/**
 * Toggle para mostrar campo de otro motivo
 */
function toggleMotivoOtro(select) {
    const motivoTextarea = document.getElementById('motivo');
    if (select.value === 'otro') {
        motivoTextarea.placeholder = 'Especifique el motivo del reembolso...';
    } else {
        motivoTextarea.placeholder = 'Describa detalladamente el motivo del reembolso...';
    }
}

/**
 * Limpia el formulario de reembolso
 */
function limpiarFormularioReembolso() {
    const form = document.getElementById('reembolsoForm');
    if (form) {
        form.reset();
        reembolsoFormState = {
            nombrePaciente: '',
            rutPaciente: '',
            telefonoPaciente: '',
            emailPaciente: '',
            monto: '',
            motivo: '',
            metodoPagoOriginal: '',
            fechaPagoOriginal: '',
            numeroComprobante: '',
            cuentaDestino: '',
            tipoCuenta: '',
            bancoDestino: '',
            nombreTitular: '',
            rutTitular: '',
            observaciones: '',
            urgente: false
        };
    }
}

/**
 * Envía la solicitud de reembolso via mailto
 */
function enviarSolicitudReembolso(event) {
    event.preventDefault();

    // Recopilar datos del formulario
    const nombrePaciente = document.getElementById('nombrePaciente').value;
    const rutPaciente = document.getElementById('rutPaciente').value;
    const telefonoPaciente = document.getElementById('telefonoPaciente').value || 'No especificado';
    const emailPaciente = document.getElementById('emailPaciente').value || 'No especificado';
    const monto = document.getElementById('monto').value;
    const motivoCategoriaSelect = document.getElementById('motivoCategoria');
    const motivoCategoria = motivoCategoriaSelect.options[motivoCategoriaSelect.selectedIndex].text;
    const motivo = document.getElementById('motivo').value;
    const metodoPagoSelect = document.getElementById('metodoPagoOriginal');
    const metodoPagoOriginal = metodoPagoSelect.options[metodoPagoSelect.selectedIndex].text;
    const fechaPagoOriginal = document.getElementById('fechaPagoOriginal').value;
    const numeroComprobante = document.getElementById('numeroComprobante').value || 'No especificado';
    const nombreTitular = document.getElementById('nombreTitular').value;
    const rutTitular = document.getElementById('rutTitular').value;
    const bancoSelect = document.getElementById('bancoDestino');
    const bancoDestino = bancoSelect.options[bancoSelect.selectedIndex].text;
    const tipoCuentaSelect = document.getElementById('tipoCuenta');
    const tipoCuenta = tipoCuentaSelect.options[tipoCuentaSelect.selectedIndex].text;
    const cuentaDestino = document.getElementById('cuentaDestino').value;
    const observaciones = document.getElementById('observaciones').value || 'Sin observaciones adicionales';
    const urgente = document.getElementById('urgente').checked;

    // Formatear fecha
    const fechaFormateada = new Date(fechaPagoOriginal).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Crear asunto del correo
    const asunto = urgente
        ? `🚨 [URGENTE] Solicitud de Reembolso - ${nombrePaciente} - $${monto}`
        : `Solicitud de Reembolso - ${nombrePaciente} - $${monto}`;

    // Crear cuerpo del correo formateado
    const cuerpo = `
SOLICITUD DE REEMBOLSO A PACIENTE
${'='.repeat(50)}
${urgente ? '⚠️ SOLICITUD MARCADA COMO URGENTE ⚠️\n' : ''}
📋 DATOS DEL PACIENTE
${'-'.repeat(30)}
• Nombre: ${nombrePaciente}
• RUT: ${rutPaciente}
• Teléfono: ${telefonoPaciente}
• Email: ${emailPaciente}

💳 INFORMACIÓN DEL PAGO ORIGINAL
${'-'.repeat(30)}
• Monto a Reembolsar: $${monto}
• Fecha del Pago: ${fechaFormateada}
• Método de Pago: ${metodoPagoOriginal}
• N° Comprobante/Boleta: ${numeroComprobante}

📝 MOTIVO DEL REEMBOLSO
${'-'.repeat(30)}
• Categoría: ${motivoCategoria}
• Descripción: ${motivo}

🏦 DATOS BANCARIOS PARA TRANSFERENCIA
${'-'.repeat(30)}
• Titular de la Cuenta: ${nombreTitular}
• RUT del Titular: ${rutTitular}
• Banco: ${bancoDestino}
• Tipo de Cuenta: ${tipoCuenta}
• Número de Cuenta: ${cuentaDestino}

📌 OBSERVACIONES ADICIONALES
${'-'.repeat(30)}
${observaciones}

${'='.repeat(50)}
Solicitud generada desde Cialo Hub
Fecha de solicitud: ${new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}
`;

    // Crear el enlace de Gmail compose
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=contacto@cialo.cl&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

    // Abrir Gmail en nueva pestaña
    window.open(gmailLink, '_blank');

    // Guardar en lista local para referencia
    const formData = {
        nombrePaciente,
        rutPaciente,
        monto,
        motivoCategoria,
        urgente,
        estado: 'Enviado por Email',
        fecha: new Date().toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    solicitudesReembolso.unshift(formData);

    // Mostrar mensaje de éxito
    mostrarMensajeExito();

    // Limpiar formulario después de un pequeño delay
    setTimeout(() => {
        limpiarFormularioReembolso();

        // Actualizar lista de solicitudes
        const listaSolicitudes = document.getElementById('listaSolicitudes');
        if (listaSolicitudes) {
            listaSolicitudes.innerHTML = renderSolicitudesRecientes();
            lucide.createIcons({ nodes: [listaSolicitudes] });
        }
    }, 500);
}

/**
 * Muestra mensaje de éxito al enviar la solicitud
 */
function mostrarMensajeExito() {
    const existingToast = document.getElementById('reembolsoToast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'reembolsoToast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: linear-gradient(135deg, #16a34a, #15803d);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(22, 163, 74, 0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    toast.innerHTML = `
        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i data-lucide="check-circle" class="w-6 h-6"></i>
        </div>
        <div>
            <p class="font-semibold">¡Solicitud Enviada!</p>
            <p class="text-sm text-green-100">El equipo de administración la revisará pronto</p>
        </div>
    `;

    document.body.appendChild(toast);
    lucide.createIcons();

    // Animar entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Remover después de 4 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/**
 * Inicializa los listeners del formulario de reembolso
 */
function initSolicitudReembolsoContent() {
    const form = document.getElementById('reembolsoForm');
    if (form) {
        form.addEventListener('submit', enviarSolicitudReembolso);
    }

    // Establecer fecha máxima como hoy
    const fechaInput = document.getElementById('fechaPagoOriginal');
    if (fechaInput) {
        fechaInput.max = new Date().toISOString().split('T')[0];
    }
}
