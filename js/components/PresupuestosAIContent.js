/**
 * PresupuestosAIContent Component
 * Generador de presupuestos con IA - Pantalla dedicada con chat y resultados
 */

// ==================== ESTADO ====================

// Estado del presupuesto AI
let presupuestoAIState = {
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

// Contador para IDs únicos
let aiItemIdCounter = 0;

// Estado del chat de IA
let chatHistoryIA = [];
let iaIsLoading = false;
let sugerenciasIA = [];
let modalEmailVisible = false;
let emailGenerado = '';

// ==================== CONFIGURACIÓN GROQ API ====================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function obtenerAPIKey() {
    return localStorage.getItem('groq_api_key') || '';
}

function guardarAPIKey(apiKey) {
    localStorage.setItem('groq_api_key', apiKey.trim());
}

function tieneAPIKey() {
    return obtenerAPIKey().length > 0;
}

// ==================== FUNCIONES DE IA ====================

function construirPromptSistema() {
    const tratamientosResumen = tratamientosData.slice(0, 80).map(t => ({
        id: t.id,
        nombre: t.nombre,
        categoria: t.categoria,
        profesional: t.profesional,
        valorDesde: t.valorDesde,
        valorHasta: t.valorHasta
    }));

    return `Eres un asistente de la Clínica Cialo en Chile que ayuda a crear presupuestos para pacientes.

TRATAMIENTOS DISPONIBLES (JSON):
${JSON.stringify(tratamientosResumen, null, 0)}

REGLAS IMPORTANTES:
1. Cuando el usuario describe lo que necesita un paciente, IDENTIFICA Y AGREGA AUTOMÁTICAMENTE los tratamientos al presupuesto
2. Si el usuario menciona datos del paciente (nombre, email, teléfono), EXTRÁELOS y agrégalos

FORMATO DE RESPUESTA (SIEMPRE JSON):

Para AGREGAR tratamientos automáticamente:
{
  "tipo": "auto_agregar",
  "tratamientos": [{"id": "id-tratamiento", "nombre": "Nombre", "valor": numero}],
  "paciente": {"nombre": "si se menciona", "email": "si se menciona"},
  "mensaje": "Resumen amigable de lo agregado"
}

Para modificar el presupuesto (quitar, descuento, cambiar precio):
{"tipo": "accion", "accion": "eliminar|descuento|modificar", "datos": {...}, "mensaje": "confirmación"}

Para conversación normal:
{"tipo": "mensaje", "texto": "tu respuesta"}

EJEMPLOS:
- Si dicen "María quiere botox y labios" -> Agrega toxina botulínica + relleno labios + guarda nombre María
- Si dicen "aplica 15% descuento" -> Ejecuta acción de descuento
- Si dicen "quita el botox" -> Elimina tratamientos con botox

IMPORTANTE:
- Los precios están en pesos chilenos (CLP)
- Si no encuentras un tratamiento exacto, sugiere el más similar del catálogo
- Siempre sé amable y conciso`;
}

async function llamarGroqAPI(mensajes) {
    const apiKey = obtenerAPIKey();
    if (!apiKey) {
        throw new Error('No hay API key configurada');
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: mensajes,
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

async function procesarMensajeIA(mensaje) {
    if (!tieneAPIKey()) {
        mostrarModalConfigAPI();
        return;
    }

    iaIsLoading = true;
    actualizarChatUI();

    chatHistoryIA.push({ rol: 'usuario', texto: mensaje });

    try {
        const contextoPresupuesto = presupuestoAIState.items.length > 0
            ? `\n\nPRESUPUESTO ACTUAL:\n${JSON.stringify(presupuestoAIState.items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, valor: i.valorUnitario })))}\nDescuento: ${presupuestoAIState.descuento}%`
            : '\n\nPRESUPUESTO ACTUAL: vacío';

        const mensajesAPI = [
            { role: 'system', content: construirPromptSistema() + contextoPresupuesto },
            ...chatHistoryIA.map(m => ({
                role: m.rol === 'usuario' ? 'user' : 'assistant',
                content: m.texto
            }))
        ];

        const respuesta = await llamarGroqAPI(mensajesAPI);

        let respuestaObj;
        try {
            const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                respuestaObj = JSON.parse(jsonMatch[0]);
            } else {
                respuestaObj = { tipo: 'mensaje', texto: respuesta };
            }
        } catch {
            respuestaObj = { tipo: 'mensaje', texto: respuesta };
        }

        await procesarRespuestaIA(respuestaObj);

    } catch (error) {
        console.error('Error IA:', error);
        chatHistoryIA.push({
            rol: 'ia',
            texto: `❌ Error: ${error.message}. Verifica tu API key en configuración.`,
            esError: true
        });
    }

    iaIsLoading = false;
    actualizarChatUI();
}

async function procesarRespuestaIA(respuesta) {
    switch (respuesta.tipo) {
        case 'auto_agregar':
            // Agregar tratamientos automáticamente
            const tratamientosAgregados = [];
            if (respuesta.tratamientos && respuesta.tratamientos.length > 0) {
                respuesta.tratamientos.forEach(t => {
                    const tratamiento = tratamientosData.find(tr => tr.id === t.id);
                    if (tratamiento) {
                        presupuestoAIState.items.push({
                            id: ++aiItemIdCounter,
                            nombre: tratamiento.nombre,
                            descripcion: tratamiento.descripcion,
                            cantidad: t.cantidad || 1,
                            valorUnitario: t.valor || tratamiento.valorDesde
                        });
                        tratamientosAgregados.push(tratamiento.nombre);
                    }
                });
            }

            // Extraer datos del paciente si los hay
            if (respuesta.paciente) {
                if (respuesta.paciente.nombre) {
                    presupuestoAIState.paciente.nombre = respuesta.paciente.nombre;
                    const inputNombre = document.getElementById('presupuestoAIPacienteNombre');
                    if (inputNombre) inputNombre.value = respuesta.paciente.nombre;
                }
                if (respuesta.paciente.email) {
                    presupuestoAIState.paciente.email = respuesta.paciente.email;
                    const inputEmail = document.getElementById('presupuestoAIPacienteEmail');
                    if (inputEmail) inputEmail.value = respuesta.paciente.email;
                }
            }

            actualizarPresupuestoAIUI();
            chatHistoryIA.push({
                rol: 'ia',
                texto: respuesta.mensaje || `✅ Agregados: ${tratamientosAgregados.join(', ')}`
            });
            break;

        case 'sugerencias':
            sugerenciasIA = respuesta.tratamientos || [];
            chatHistoryIA.push({
                rol: 'ia',
                texto: `He encontrado ${sugerenciasIA.length} tratamiento(s) que podrían interesarte:`,
                sugerencias: sugerenciasIA
            });
            break;

        case 'accion':
            ejecutarAccionIA(respuesta);
            chatHistoryIA.push({
                rol: 'ia',
                texto: respuesta.mensaje || 'Acción ejecutada correctamente ✅'
            });
            break;

        case 'mensaje':
        default:
            chatHistoryIA.push({ rol: 'ia', texto: respuesta.texto || respuesta });
            break;
    }
}

function ejecutarAccionIA(respuesta) {
    const { accion, datos } = respuesta;

    switch (accion) {
        case 'agregar':
            if (datos?.id) {
                const tratamiento = tratamientosData.find(t => t.id === datos.id);
                if (tratamiento) {
                    presupuestoAIState.items.push({
                        id: ++aiItemIdCounter,
                        nombre: tratamiento.nombre,
                        descripcion: tratamiento.descripcion,
                        cantidad: datos.cantidad || 1,
                        valorUnitario: datos.valor || tratamiento.valorDesde
                    });
                }
            } else if (datos?.nombre) {
                presupuestoAIState.items.push({
                    id: ++aiItemIdCounter,
                    nombre: datos.nombre,
                    descripcion: datos.descripcion || '',
                    cantidad: datos.cantidad || 1,
                    valorUnitario: datos.valor || 0
                });
            }
            break;

        case 'eliminar':
            if (datos?.nombre) {
                const nombreLower = datos.nombre.toLowerCase();
                presupuestoAIState.items = presupuestoAIState.items.filter(
                    item => !item.nombre.toLowerCase().includes(nombreLower)
                );
            } else if (datos?.indice !== undefined) {
                presupuestoAIState.items.splice(datos.indice, 1);
            }
            break;

        case 'descuento':
            if (datos?.porcentaje !== undefined) {
                presupuestoAIState.descuento = Math.min(100, Math.max(0, datos.porcentaje));
                const inputDesc = document.getElementById('presupuestoAIDescuento');
                if (inputDesc) inputDesc.value = presupuestoAIState.descuento;
            }
            break;

        case 'modificar':
            if (datos?.nombre && datos?.nuevoValor !== undefined) {
                const item = presupuestoAIState.items.find(
                    i => i.nombre.toLowerCase().includes(datos.nombre.toLowerCase())
                );
                if (item) {
                    item.valorUnitario = datos.nuevoValor;
                }
            }
            break;
    }

    actualizarPresupuestoAIUI();
}

function agregarSugerenciaIA(tratamientoId, valor) {
    const tratamiento = tratamientosData.find(t => t.id === tratamientoId);
    if (tratamiento) {
        presupuestoAIState.items.push({
            id: ++aiItemIdCounter,
            nombre: tratamiento.nombre,
            descripcion: tratamiento.descripcion,
            cantidad: 1,
            valorUnitario: valor || tratamiento.valorDesde
        });
        actualizarPresupuestoAIUI();

        chatHistoryIA.push({
            rol: 'ia',
            texto: `✅ Agregado: ${tratamiento.nombre} - $${formatNumberAI(valor || tratamiento.valorDesde)}`
        });
        actualizarChatUI();
    }
}

function agregarTodasSugerenciasIA() {
    sugerenciasIA.forEach(sug => {
        const tratamiento = tratamientosData.find(t => t.id === sug.id);
        if (tratamiento) {
            presupuestoAIState.items.push({
                id: ++aiItemIdCounter,
                nombre: tratamiento.nombre,
                descripcion: tratamiento.descripcion,
                cantidad: 1,
                valorUnitario: sug.valor || tratamiento.valorDesde
            });
        }
    });

    actualizarPresupuestoAIUI();
    chatHistoryIA.push({
        rol: 'ia',
        texto: `✅ Se agregaron ${sugerenciasIA.length} tratamiento(s) al presupuesto`
    });
    sugerenciasIA = [];
    actualizarChatUI();
}

// ==================== FUNCIONES DE EMAIL ====================

async function generarEmailPresupuestoAI() {
    if (presupuestoAIState.items.length === 0) {
        alert('Agrega al menos un tratamiento al presupuesto');
        return;
    }

    if (!tieneAPIKey()) {
        mostrarModalConfigAPI();
        return;
    }

    iaIsLoading = true;
    modalEmailVisible = true;
    emailGenerado = '';
    actualizarModalEmail();

    try {
        const subtotal = presupuestoAIState.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);
        const descuentoMonto = subtotal * (presupuestoAIState.descuento / 100);
        const total = subtotal - descuentoMonto;

        const prompt = `Redacta un correo electrónico profesional y cálido para enviar este presupuesto al paciente.

DATOS DEL PACIENTE:
- Nombre: ${presupuestoAIState.paciente.nombre || 'Estimado/a paciente'}
- Email: ${presupuestoAIState.paciente.email || 'No especificado'}

TRATAMIENTOS:
${presupuestoAIState.items.map(item => `- ${item.nombre}: $${formatNumberAI(item.valorUnitario)} x ${item.cantidad} = $${formatNumberAI(item.cantidad * item.valorUnitario)}`).join('\n')}

TOTALES:
- Subtotal: $${formatNumberAI(subtotal)}
${presupuestoAIState.descuento > 0 ? `- Descuento (${presupuestoAIState.descuento}%): -$${formatNumberAI(descuentoMonto)}` : ''}
- TOTAL: $${formatNumberAI(total)}

${presupuestoAIState.notas ? `NOTAS: ${presupuestoAIState.notas}` : ''}

INSTRUCCIONES:
1. Tono profesional pero cercano
2. Mencionar validez de 15 días
3. Incluir datos de contacto: +56 9 8202 8473, contacto@cialo.cl
4. Firma: Equipo Clínica Cialo, www.cialo.cl
5. NO uses formato JSON, solo el texto del email
6. Incluye un asunto sugerido al inicio`;

        const mensajes = [
            { role: 'system', content: 'Eres un asistente que redacta correos profesionales para una clínica estética en Chile. Responde SOLO con el texto del email, sin JSON.' },
            { role: 'user', content: prompt }
        ];

        emailGenerado = await llamarGroqAPI(mensajes);

    } catch (error) {
        emailGenerado = `Error al generar email: ${error.message}`;
    }

    iaIsLoading = false;
    actualizarModalEmail();
}

function copiarEmailAI() {
    navigator.clipboard.writeText(emailGenerado).then(() => {
        const btn = document.getElementById('btnCopiarEmailAI');
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> ¡Copiado!';
            btn.classList.add('bg-green-600');
            lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = original;
                btn.classList.remove('bg-green-600');
                lucide.createIcons();
            }, 2000);
        }
    });
}

function abrirEnClienteCorreoAI() {
    const destinatario = presupuestoAIState.paciente.email || '';
    const asunto = encodeURIComponent(`Presupuesto Clínica Cialo - ${presupuestoAIState.paciente.nombre || 'Paciente'}`);
    const cuerpo = encodeURIComponent(emailGenerado);
    window.open(`mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`);
}

function cerrarModalEmail() {
    modalEmailVisible = false;
    actualizarModalEmail();
}

// ==================== GENERACIÓN DE PDF ====================

function generarHTMLPresupuesto() {
    const subtotal = presupuestoAIState.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);
    const descuentoMonto = subtotal * (presupuestoAIState.descuento / 100);
    const total = subtotal - descuentoMonto;
    const fechaHoy = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
    const numeroPresupuesto = `PRE-${Date.now().toString().slice(-6)}`;

    // Colores Cialo
    const colors = {
        grisClaro: '#cbcfd1',
        negro: '#1d1d1d',
        dorado: '#d4c1a0',
        beige: '#d3c8ba',
        grisOscuro: '#4f4f51'
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Presupuesto ${numeroPresupuesto} - Clínica Cialo</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&family=Italiana&family=Poppins:wght@300;400;500;600&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Poppins', sans-serif;
                    color: ${colors.negro};
                    line-height: 1.5;
                    background: white;
                    font-size: 12px;
                }
                .container { max-width: 800px; margin: 0 auto; padding: 25px 30px; }
                
                /* Header */
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid ${colors.dorado};
                }
                .logo-section { display: flex; align-items: center; }
                .logo { width: 100px; height: auto; object-fit: contain; }
                .doc-info { text-align: right; }
                .doc-title { 
                    font-family: 'Italiana', serif;
                    font-size: 32px; 
                    font-weight: 400;
                    color: ${colors.dorado};
                    text-transform: uppercase;
                    letter-spacing: 4px;
                }
                .doc-number { font-size: 10px; color: ${colors.grisOscuro}; margin-top: 3px; letter-spacing: 1px; }
                .doc-date { font-size: 10px; color: ${colors.grisOscuro}; }
                
                /* Info boxes */
                .info-row { 
                    display: flex; 
                    gap: 20px; 
                    margin-bottom: 20px;
                }
                .info-box { 
                    flex: 1; 
                    background: ${colors.beige}15;
                    padding: 15px;
                    border-left: 2px solid ${colors.dorado};
                }
                .info-box h3 { 
                    font-family: 'Comfortaa', cursive;
                    font-size: 9px; 
                    text-transform: uppercase; 
                    color: ${colors.dorado};
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                .info-box p { font-size: 11px; color: ${colors.grisOscuro}; margin: 3px 0; line-height: 1.4; }
                .info-box .name { font-size: 13px; font-weight: 500; color: ${colors.negro}; margin-bottom: 5px; }
                
                /* Table */
                .treatments-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                }
                .treatments-table th { 
                    background: ${colors.negro};
                    color: ${colors.beige};
                    padding: 10px 12px;
                    text-align: left;
                    font-family: 'Comfortaa', cursive;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-weight: 500;
                }
                .treatments-table th:last-child { text-align: right; }
                .treatments-table td { 
                    padding: 10px 12px;
                    border-bottom: 1px solid ${colors.grisClaro};
                    font-size: 11px;
                    color: ${colors.grisOscuro};
                    vertical-align: top;
                }
                .treatments-table td:last-child { text-align: right; font-weight: 600; color: ${colors.negro}; }
                .treatments-table tr:nth-child(even) { background: ${colors.beige}10; }
                .treatment-name { font-weight: 500; color: ${colors.negro}; font-size: 12px; }
                .treatment-desc { font-size: 10px; color: ${colors.grisOscuro}; margin-top: 3px; font-weight: 300; line-height: 1.3; }
                
                /* Summary */
                .summary { 
                    display: flex; 
                    justify-content: flex-end; 
                    margin-bottom: 20px;
                }
                .summary-box { 
                    width: 260px; 
                    background: ${colors.negro};
                    padding: 15px 18px;
                }
                .summary-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 6px 0;
                    font-size: 11px;
                    color: ${colors.grisClaro};
                }
                .summary-row.discount { color: ${colors.dorado}; }
                .summary-row.total { 
                    font-family: 'Italiana', serif;
                    font-size: 24px; 
                    font-weight: 400;
                    color: ${colors.dorado};
                    border-top: 1px solid ${colors.grisOscuro};
                    margin-top: 10px;
                    padding-top: 12px;
                }
                
                /* Payment methods */
                .payment-section { 
                    background: ${colors.beige}20;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .payment-section h3 { 
                    font-family: 'Comfortaa', cursive;
                    font-size: 9px; 
                    color: ${colors.grisOscuro};
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-weight: 600;
                }
                .payment-methods { display: flex; gap: 10px; flex-wrap: wrap; }
                .payment-method { 
                    background: white;
                    padding: 8px 14px;
                    font-size: 10px;
                    color: ${colors.grisOscuro};
                    border: 1px solid ${colors.grisClaro};
                }
                
                /* Notes */
                .notes { 
                    background: ${colors.dorado}15;
                    padding: 12px 15px;
                    margin-bottom: 20px;
                    border-left: 2px solid ${colors.dorado};
                }
                .notes h4 { 
                    font-family: 'Comfortaa', cursive;
                    font-size: 9px; 
                    color: ${colors.grisOscuro}; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5px;
                    margin-bottom: 6px;
                    font-weight: 600;
                }
                .notes p { font-size: 11px; color: ${colors.grisOscuro}; line-height: 1.4; }
                
                /* Footer */
                .footer { 
                    text-align: center; 
                    padding-top: 20px;
                    border-top: 1px solid ${colors.grisClaro};
                    color: ${colors.grisOscuro};
                }
                .footer-contact { 
                    margin-bottom: 10px;
                    font-size: 10px;
                }
                .footer-contact span { margin: 0 15px; }
                .footer-thanks {
                    font-family: 'Italiana', serif;
                    font-size: 20px;
                    color: ${colors.negro};
                    margin-bottom: 12px;
                    letter-spacing: 1px;
                }
                .validity { 
                    display: inline-block;
                    background: ${colors.dorado};
                    color: ${colors.negro};
                    padding: 8px 20px;
                    font-family: 'Comfortaa', cursive;
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 15px;
                }
                
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .container { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="logo-section">
                        <img src="assets/logo-cialo.png" alt="Clínica Cialo" class="logo" onerror="this.style.display='none'">
                    </div>
                    <div class="doc-info">
                        <div class="doc-title">Presupuesto</div>
                        <div class="doc-number">N° ${numeroPresupuesto}</div>
                        <div class="doc-date">${fechaHoy}</div>
                    </div>
                </div>
                
                <!-- Info Row -->
                <div class="info-row">
                    <div class="info-box">
                        <h3>Datos del Paciente</h3>
                        <p class="name">${presupuestoAIState.paciente.nombre || 'Por confirmar'}</p>
                        ${presupuestoAIState.paciente.email ? `<p>${presupuestoAIState.paciente.email}</p>` : ''}
                        ${presupuestoAIState.paciente.telefono ? `<p>${presupuestoAIState.paciente.telefono}</p>` : ''}
                        ${presupuestoAIState.paciente.rut ? `<p>RUT: ${presupuestoAIState.paciente.rut}</p>` : ''}
                    </div>
                    <div class="info-box">
                        <h3>Clínica Cialo</h3>
                        <p class="name">Bulnes 220, oficina 509</p>
                        <p>Edificio Puerto Mayor II, Los Ángeles</p>
                        <p>+56 9 8202 8473</p>
                        <p>contacto@cialo.cl</p>
                    </div>
                </div>
                
                <!-- Treatments Table -->
                <table class="treatments-table">
                    <thead>
                        <tr>
                            <th>Tratamiento</th>
                            <th>Cantidad</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${presupuestoAIState.items.map(item => `
                            <tr>
                                <td>
                                    <div class="treatment-name">${item.nombre}</div>
                                    ${item.descripcion ? `<div class="treatment-desc">${item.descripcion.substring(0, 100)}...</div>` : ''}
                                </td>
                                <td>${item.cantidad} ${item.cantidad > 1 ? 'sesiones' : 'sesión'}</td>
                                <td>$${formatNumberAI(item.cantidad * item.valorUnitario)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <!-- Summary -->
                <div class="summary">
                    <div class="summary-box">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${formatNumberAI(subtotal)}</span>
                        </div>
                        ${presupuestoAIState.descuento > 0 ? `
                            <div class="summary-row discount">
                                <span>Descuento (${presupuestoAIState.descuento}%)</span>
                                <span>-$${formatNumberAI(descuentoMonto)}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>TOTAL</span>
                            <span>$${formatNumberAI(total)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Payment Methods -->
                <div class="payment-section">
                    <h3>Métodos de Pago Aceptados</h3>
                    <div class="payment-methods">
                        <div class="payment-method">Tarjeta Crédito/Débito</div>
                        <div class="payment-method">Transferencia Bancaria</div>
                        <div class="payment-method">Efectivo</div>
                        <div class="payment-method">Mercado Pago</div>
                        <div class="payment-method">Cuotas sin interés</div>
                    </div>
                </div>
                
                ${presupuestoAIState.notas ? `
                    <div class="notes">
                        <h4>Notas Adicionales</h4>
                        <p>${presupuestoAIState.notas}</p>
                    </div>
                ` : ''}
                
                <!-- Footer -->
                <div class="footer">
                    <div class="footer-contact">
                        <span>contacto@cialo.cl</span>
                        <span>+56 9 8202 8473</span>
                        <span>www.cialo.cl</span>
                    </div>
                    <p class="footer-thanks">Gracias por confiar en nosotros</p>
                    <div class="validity">Presupuesto válido por 15 días</div>
                </div>
            </div>
        </body>
        </html>
    `;

    return htmlContent;
}

function mostrarVistaPrevia() {
    // Si no hay items, usar datos de ejemplo para ver el diseño
    let usarEjemplo = false;
    let itemsOriginales = [];
    let pacienteOriginal = {};
    let descuentoOriginal = 0;

    if (presupuestoAIState.items.length === 0) {
        usarEjemplo = true;
        // Guardar estado original
        itemsOriginales = [...presupuestoAIState.items];
        pacienteOriginal = { ...presupuestoAIState.paciente };
        descuentoOriginal = presupuestoAIState.descuento;

        // Cargar datos de ejemplo
        presupuestoAIState.items = [
            { id: 1, nombre: 'Toxina Botulínica Facial', descripcion: 'Tratamiento para líneas de expresión en frente, entrecejo y patas de gallo', cantidad: 1, valorUnitario: 350000 },
            { id: 2, nombre: 'Relleno de Ácido Hialurónico Labios', descripcion: 'Aumento y definición de labios con ácido hialurónico', cantidad: 1, valorUnitario: 280000 },
            { id: 3, nombre: 'Limpieza Facial Profunda', descripcion: 'Limpieza con extracción, mascarilla y serum', cantidad: 2, valorUnitario: 45000 }
        ];
        presupuestoAIState.paciente = { nombre: 'María González Pérez', email: 'maria.gonzalez@email.com', telefono: '+56 9 1234 5678', rut: '12.345.678-9' };
        presupuestoAIState.descuento = 10;
    }

    const htmlContent = generarHTMLPresupuesto();

    // Crear modal de vista previa
    const modal = document.createElement('div');
    modal.id = 'modalVistaPrevia';
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; width: 100%; max-width: 850px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
            <div style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #1d1d1d; color: white;">
                <span style="font-weight: 600;">Vista Previa del Presupuesto ${usarEjemplo ? '<span style="background: #d4c1a0; color: #1d1d1d; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 10px;">EJEMPLO</span>' : ''}</span>
                <div style="display: flex; gap: 10px;">
                    ${!usarEjemplo ? '<button onclick="generarPDFPresupuesto(); cerrarVistaPrevia();" style="background: #d4c1a0; color: #1d1d1d; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px;">Imprimir / PDF</button>' : ''}
                    <button onclick="cerrarVistaPrevia()" style="background: transparent; border: 1px solid #4f4f51; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        Cerrar
                    </button>
                </div>
            </div>
            <div style="flex: 1; overflow: auto; background: #f5f5f5; padding: 20px;">
                <iframe id="iframeVistaPrevia" style="width: 100%; height: 100%; min-height: 600px; border: none; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Escribir contenido en el iframe
    const iframe = document.getElementById('iframeVistaPrevia');
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();

    // Restaurar estado original si usamos ejemplo
    if (usarEjemplo) {
        presupuestoAIState.items = itemsOriginales;
        presupuestoAIState.paciente = pacienteOriginal;
        presupuestoAIState.descuento = descuentoOriginal;
    }

    // Cerrar con click afuera
    modal.onclick = (e) => {
        if (e.target === modal) cerrarVistaPrevia();
    };
}

function cerrarVistaPrevia() {
    const modal = document.getElementById('modalVistaPrevia');
    if (modal) modal.remove();
}

function generarPDFPresupuesto() {
    if (presupuestoAIState.items.length === 0) {
        alert('Agrega al menos un tratamiento al presupuesto');
        return;
    }

    const htmlContent = generarHTMLPresupuesto();

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Esperar a que cargue y abrir diálogo de impresión
    printWindow.onload = function () {
        printWindow.print();
    };
}

// ==================== FUNCIONES DE UI ====================

function mostrarModalConfigAPI() {
    const modal = document.getElementById('modalConfigAPIAI');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('inputAPIKeyAI').value = obtenerAPIKey();
    }
}

function cerrarModalConfigAPI() {
    const modal = document.getElementById('modalConfigAPIAI');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function guardarConfigAPI() {
    const apiKey = document.getElementById('inputAPIKeyAI').value;
    guardarAPIKey(apiKey);
    cerrarModalConfigAPI();

    if (apiKey) {
        chatHistoryIA.push({
            rol: 'ia',
            texto: '✅ API key configurada correctamente. ¡Ya puedes usar el asistente!'
        });
        actualizarChatUI();
    }
}

function limpiarChatIA() {
    chatHistoryIA = [];
    sugerenciasIA = [];
    actualizarChatUI();
}

function actualizarChatUI() {
    const container = document.getElementById('chatIAContainerAI');
    if (container) {
        container.innerHTML = renderChatHistory();
        lucide.createIcons();
        container.scrollTop = container.scrollHeight;
    }
}

function actualizarModalEmail() {
    const modal = document.getElementById('modalEmailContainerAI');
    if (modal) {
        modal.innerHTML = renderModalEmail();
        lucide.createIcons();
    }
}

function actualizarPresupuestoAIUI() {
    const itemsContainer = document.getElementById('presupuestoAIItemsContainer');
    const resumenContainer = document.getElementById('presupuestoAIResumen');

    if (itemsContainer) {
        itemsContainer.innerHTML = renderPresupuestoAIItems();
    }
    if (resumenContainer) {
        resumenContainer.innerHTML = renderPresupuestoAIResumen();
    }
    lucide.createIcons();
}

function formatNumberAI(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function eliminarItemPresupuestoAI(id) {
    presupuestoAIState.items = presupuestoAIState.items.filter(item => item.id !== id);
    actualizarPresupuestoAIUI();
}

function limpiarPresupuestoAI() {
    if (presupuestoAIState.items.length > 0 && !confirm('¿Estás seguro de limpiar todo el presupuesto?')) {
        return;
    }

    presupuestoAIState = {
        paciente: { nombre: '', rut: '', telefono: '', email: '' },
        items: [],
        descuento: 0,
        notas: ''
    };

    document.getElementById('presupuestoAIPacienteNombre').value = '';
    document.getElementById('presupuestoAIPacienteEmail').value = '';
    document.getElementById('presupuestoAIDescuento').value = '0';
    document.getElementById('presupuestoAINotas').value = '';

    actualizarPresupuestoAIUI();
}

// ==================== RENDER FUNCTIONS ====================

function renderChatHistory() {
    if (chatHistoryIA.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center h-full text-center text-slate-400 py-8">
                <i data-lucide="message-square-plus" class="w-12 h-12 mb-3 opacity-50"></i>
                <p class="font-medium">Asistente IA</p>
                <p class="text-sm mt-1">Cuéntame qué tratamientos necesita el paciente</p>
                <p class="text-xs mt-3 text-slate-300">Ejemplo: "Paciente quiere botox y labios"</p>
            </div>
        `;
    }

    let html = '<div class="space-y-3 p-3">';

    chatHistoryIA.forEach(msg => {
        if (msg.rol === 'usuario') {
            html += `
                <div class="flex justify-end">
                    <div class="bg-violet-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
                        ${msg.texto}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="flex justify-start">
                    <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%] shadow-sm ${msg.esError ? 'border-red-300 bg-red-50' : ''}">
                        <p class="text-slate-700">${msg.texto}</p>
                        ${msg.sugerencias ? renderSugerenciasEnChat(msg.sugerencias) : ''}
                    </div>
                </div>
            `;
        }
    });

    if (iaIsLoading) {
        html += `
            <div class="flex justify-start">
                <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div class="flex items-center gap-2 text-slate-400">
                        <div class="flex gap-1">
                            <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                            <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                            <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                        </div>
                        <span class="text-sm">Pensando...</span>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function renderSugerenciasEnChat(sugerencias) {
    if (!sugerencias || sugerencias.length === 0) return '';

    let html = '<div class="mt-3 space-y-2">';

    sugerencias.forEach(sug => {
        const tratamiento = tratamientosData.find(t => t.id === sug.id);
        const nombre = tratamiento?.nombre || sug.nombre || 'Tratamiento';
        const valor = sug.valor || tratamiento?.valorDesde || 0;

        html += `
            <div class="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <div class="flex items-start justify-between gap-2">
                    <div class="flex-grow min-w-0">
                        <p class="font-medium text-violet-800 text-sm">${nombre}</p>
                        ${sug.razon ? `<p class="text-xs text-violet-600 mt-0.5">${sug.razon}</p>` : ''}
                    </div>
                    <div class="text-right flex-shrink-0">
                        <p class="font-bold text-violet-700">$${formatNumberAI(valor)}</p>
                    </div>
                </div>
                <button onclick="agregarSugerenciaIA('${sug.id}', ${valor})" 
                    class="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <i data-lucide="plus" class="w-3 h-3"></i>
                    Agregar
                </button>
            </div>
        `;
    });

    if (sugerencias.length > 1) {
        html += `
            <button onclick="agregarTodasSugerenciasIA()" 
                class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-200">
                <i data-lucide="list-plus" class="w-3 h-3"></i>
                Agregar todos (${sugerencias.length})
            </button>
        `;
    }

    html += '</div>';
    return html;
}

function renderPresupuestoAIItems() {
    if (presupuestoAIState.items.length === 0) {
        return `
            <div class="text-center py-8 text-slate-400">
                <i data-lucide="package" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p>No hay tratamientos agregados</p>
                <p class="text-sm">Usa el chat para agregar tratamientos</p>
            </div>
        `;
    }

    return `
        <div class="space-y-3">
            ${presupuestoAIState.items.map(item => `
                <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex-grow min-w-0">
                            <div class="font-medium text-slate-800">${item.nombre}</div>
                            ${item.descripcion ? `<div class="text-xs text-slate-500 mt-1 line-clamp-2">${item.descripcion}</div>` : ''}
                        </div>
                        <button onclick="eliminarItemPresupuestoAI(${item.id})" 
                            class="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-sm">
                        <span class="text-slate-500">${item.cantidad > 1 ? `${item.cantidad} sesiones x $${formatNumberAI(item.valorUnitario)}` : ''}</span>
                        <span class="font-bold text-violet-600">$${formatNumberAI(item.cantidad * item.valorUnitario)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPresupuestoAIResumen() {
    const subtotal = presupuestoAIState.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);
    const descuentoMonto = subtotal * (presupuestoAIState.descuento / 100);
    const total = subtotal - descuentoMonto;

    return `
        <div class="space-y-2">
            <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span class="font-medium">$${formatNumberAI(subtotal)}</span>
            </div>
            ${presupuestoAIState.descuento > 0 ? `
                <div class="flex justify-between text-violet-600">
                    <span>Descuento (${presupuestoAIState.descuento}%):</span>
                    <span class="font-medium">-$${formatNumberAI(descuentoMonto)}</span>
                </div>
            ` : ''}
            <div class="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span>$${formatNumberAI(total)}</span>
            </div>
        </div>
    `;
}

function renderModalEmail() {
    if (!modalEmailVisible) return '';

    return `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between p-5 border-b border-slate-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                            <i data-lucide="mail" class="w-5 h-5 text-violet-600"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">Email del Presupuesto</h3>
                            <p class="text-sm text-slate-500">Generado con IA</p>
                        </div>
                    </div>
                    <button onclick="cerrarModalEmail()" class="text-slate-400 hover:text-slate-600 p-2">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                
                <div class="flex-grow overflow-y-auto p-5">
                    ${iaIsLoading ? `
                        <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                            <div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p>Procesando solicitud...</p>
                        </div>
                    ` : `
                        <div class="space-y-4">
                            <pre class="whitespace-pre-wrap font-sans text-sm text-slate-700 bg-slate-50 rounded-lg p-4 border border-slate-200">${emailGenerado}</pre>
                            
                            <!-- Chat para modificar email -->
                            <div class="flex gap-2 pt-2">
                                <input type="text" id="inputModificarEmailAI" 
                                    class="flex-grow px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                                    placeholder="Ej: Hazlo más formal, agrega mención a pago con tarjeta..."
                                    onkeypress="if(event.key === 'Enter') modificarEmailPresupuestoAI()"
                                />
                                <button onclick="modificarEmailPresupuestoAI()" 
                                    class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium flex items-center gap-2">
                                    <i data-lucide="sparkles" class="w-4 h-4"></i>
                                    Modificar
                                </button>
                            </div>
                        </div>
                    `}
                </div>
                
                <div class="p-5 border-t border-slate-200 flex gap-3">
                    <button id="btnCopiarEmailAI" onclick="copiarEmailAI()" 
                        class="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                        Copiar email
                    </button>
                    <button onclick="abrirEnClienteCorreoAI()" 
                        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="send" class="w-4 h-4"></i>
                        Abrir en correo
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function modificarEmailPresupuestoAI() {
    const input = document.getElementById('inputModificarEmailAI');
    const instruccion = input ? input.value.trim() : '';

    if (!instruccion) return;

    iaIsLoading = true;
    actualizarModalEmail();

    try {
        const prompt = `
TIENES ESTE EMAIL BORRADOR:
---
${emailGenerado}
---

INSTRUCCIÓN DEL USUARIO:
"${instruccion}"

TAREA:
Reescribe el email completo incorporando la instrucción del usuario.
Mantén los datos del presupuesto intactos a menos que se pida cambiarlos.
Mantén el tono profesional.
Responde SOLO con el nuevo texto del email.
`;

        const mensajes = [
            { role: 'system', content: 'Eres un asistente experto en redacción de correos clínicos. Modificas correos según instrucciones.' },
            { role: 'user', content: prompt }
        ];

        emailGenerado = await llamarGroqAPI(mensajes);

    } catch (error) {
        alert(`Error al modificar email: ${error.message}`);
    }

    iaIsLoading = false;
    actualizarModalEmail();
}

// ==================== COMPONENTE PRINCIPAL ====================

function PresupuestosAIContent() {
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-gradient-to-r from-violet-500 to-purple-600 p-4 rounded-lg text-white">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <i data-lucide="sparkles" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <h2 class="font-bold text-xl">Presupuestos con IA</h2>
                            <p class="text-violet-100 text-sm">Genera presupuestos conversando con el asistente</p>
                        </div>
                    </div>
                    <button onclick="mostrarModalConfigAPI()" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Configurar API">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Columna izquierda: Chat -->
                <div class="space-y-4">
                    <!-- Chat -->
                    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style="height: 500px;">
                        <div class="bg-violet-50 border-b border-violet-100 p-3 flex items-center justify-between">
                            <div class="flex items-center gap-2 text-violet-700">
                                <i data-lucide="bot" class="w-5 h-5"></i>
                                <span class="font-medium">Chat con IA</span>
                            </div>
                            <button onclick="limpiarChatIA()" class="text-violet-500 hover:text-violet-700 p-1" title="Limpiar chat">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            </button>
                        </div>
                        
                        <div id="chatIAContainerAI" class="flex-grow overflow-y-auto bg-slate-50">
                            ${renderChatHistory()}
                        </div>
                        
                        <div class="p-3 border-t border-slate-200 bg-white">
                            <div class="flex gap-2">
                                <input type="text" id="inputMensajeIAAI" 
                                    class="flex-grow px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="Ej: Paciente quiere botox y labios..."
                                    autocomplete="off"
                                />
                                <button id="btnEnviarMensajeIAAI" 
                                    class="px-4 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors flex items-center gap-2 font-medium">
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Datos del paciente -->
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <i data-lucide="user" class="w-4 h-4 text-violet-500"></i>
                            Datos del Paciente
                        </h3>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="presupuestoAIPacienteNombre" 
                                class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="Nombre"
                                value="${presupuestoAIState.paciente.nombre}"
                            />
                            <input type="email" id="presupuestoAIPacienteEmail" 
                                class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="Email"
                                value="${presupuestoAIState.paciente.email}"
                            />
                        </div>
                    </div>
                </div>

                <!-- Columna derecha: Resultados -->
                <div class="space-y-4">
                    <!-- Lista de tratamientos -->
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="list" class="w-5 h-5 text-violet-500"></i>
                            Tratamientos
                            <span class="ml-auto text-sm font-normal text-slate-500">${presupuestoAIState.items.length} items</span>
                        </h3>
                        <div id="presupuestoAIItemsContainer" class="max-h-64 overflow-y-auto">
                            ${renderPresupuestoAIItems()}
                        </div>
                    </div>

                    <!-- Resumen -->
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="calculator" class="w-5 h-5 text-violet-500"></i>
                            Resumen
                        </h3>
                        
                        <div id="presupuestoAIResumen">
                            ${renderPresupuestoAIResumen()}
                        </div>

                        <div class="mt-4 pt-4 border-t border-slate-200">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Descuento (%)</label>
                            <input type="number" id="presupuestoAIDescuento" 
                                class="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                value="${presupuestoAIState.descuento}" min="0" max="100"
                            />
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Notas adicionales</label>
                            <textarea id="presupuestoAINotas" rows="2"
                                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="Observaciones..."
                            >${presupuestoAIState.notas}</textarea>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="space-y-2">
                        <button id="btnVistaPrevia" 
                            class="w-full px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 font-medium">
                            <i data-lucide="eye" class="w-5 h-5"></i>
                            Vista Previa
                        </button>
                        <div class="grid grid-cols-2 gap-2">
                            <button id="btnGenerarPDFAI" 
                                class="px-4 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                                <i data-lucide="file-text" class="w-4 h-4"></i>
                                Imprimir PDF
                            </button>
                            <button id="btnGenerarEmailAI" 
                                class="px-4 py-2.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                                <i data-lucide="mail" class="w-4 h-4"></i>
                                Email IA
                            </button>
                        </div>
                        <button id="btnLimpiarPresupuestoAI" 
                            class="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                            Limpiar todo
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal Configuración API -->
            <div id="modalConfigAPIAI" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <div class="flex items-center justify-between p-5 border-b border-slate-200">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                                <i data-lucide="key" class="w-5 h-5 text-violet-600"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800">Configurar API de IA</h3>
                                <p class="text-sm text-slate-500">Groq API (Gratis)</p>
                            </div>
                        </div>
                        <button onclick="cerrarModalConfigAPI()" class="text-slate-400 hover:text-slate-600 p-2">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    
                    <div class="p-5">
                        <div class="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                            <p class="text-sm text-violet-800">
                                <strong>¿Cómo obtener tu API key gratis?</strong>
                            </p>
                            <ol class="text-xs text-violet-700 mt-2 space-y-1 list-decimal list-inside">
                                <li>Ve a <a href="https://console.groq.com" target="_blank" class="underline font-medium">console.groq.com</a></li>
                                <li>Crea una cuenta gratuita</li>
                                <li>Genera una API key en "API Keys"</li>
                                <li>Copia y pega la key aquí</li>
                            </ol>
                        </div>
                        
                        <label class="block text-sm font-medium text-slate-700 mb-2">API Key de Groq</label>
                        <input type="password" id="inputAPIKeyAI" 
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                            placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                    </div>
                    
                    <div class="p-5 border-t border-slate-200 flex gap-3">
                        <button onclick="cerrarModalConfigAPI()" 
                            class="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                            Cancelar
                        </button>
                        <button onclick="guardarConfigAPI()" 
                            class="flex-1 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors font-medium">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenedor para modal de email -->
            <div id="modalEmailContainerAI">
                ${renderModalEmail()}
            </div>
        </div>
    `;
}

// Exponer funciones globales para onclick
// Exponer funciones globales para onclick
window.modificarEmailPresupuestoAI = modificarEmailPresupuestoAI;
window.copiarEmailAI = copiarEmailAI;
window.abrirEnClienteCorreoAI = abrirEnClienteCorreoAI;
window.cerrarModalEmail = cerrarModalEmail;

// ==================== INICIALIZACIÓN ====================

function initPresupuestosAIContent() {
    // Enviar mensaje de IA
    const btnEnviarIA = document.getElementById('btnEnviarMensajeIAAI');
    const inputMensajeIA = document.getElementById('inputMensajeIAAI');

    if (btnEnviarIA && inputMensajeIA) {
        btnEnviarIA.onclick = () => {
            const mensaje = inputMensajeIA.value.trim();
            if (mensaje) {
                inputMensajeIA.value = '';
                procesarMensajeIA(mensaje);
            }
        };

        inputMensajeIA.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const mensaje = inputMensajeIA.value.trim();
                if (mensaje) {
                    inputMensajeIA.value = '';
                    procesarMensajeIA(mensaje);
                }
            }
        };
    }

    // Generar email
    const btnGenerarEmail = document.getElementById('btnGenerarEmailAI');
    if (btnGenerarEmail) {
        btnGenerarEmail.onclick = generarEmailPresupuestoAI;
    }

    // Limpiar presupuesto
    const btnLimpiar = document.getElementById('btnLimpiarPresupuestoAI');
    if (btnLimpiar) {
        btnLimpiar.onclick = limpiarPresupuestoAI;
    }

    // Generar PDF
    const btnGenerarPDF = document.getElementById('btnGenerarPDFAI');
    if (btnGenerarPDF) {
        btnGenerarPDF.onclick = generarPDFPresupuesto;
    }

    // Vista Previa
    const btnVistaPrevia = document.getElementById('btnVistaPrevia');
    if (btnVistaPrevia) {
        btnVistaPrevia.onclick = mostrarVistaPrevia;
    }

    // Descuento
    const inputDescuento = document.getElementById('presupuestoAIDescuento');
    if (inputDescuento) {
        inputDescuento.oninput = (e) => {
            presupuestoAIState.descuento = parseInt(e.target.value) || 0;
            document.getElementById('presupuestoAIResumen').innerHTML = renderPresupuestoAIResumen();
        };
    }

    // Datos del paciente
    const inputNombre = document.getElementById('presupuestoAIPacienteNombre');
    if (inputNombre) {
        inputNombre.oninput = (e) => {
            presupuestoAIState.paciente.nombre = e.target.value;
        };
    }

    const inputEmail = document.getElementById('presupuestoAIPacienteEmail');
    if (inputEmail) {
        inputEmail.oninput = (e) => {
            presupuestoAIState.paciente.email = e.target.value;
        };
    }

    // Notas
    const inputNotas = document.getElementById('presupuestoAINotas');
    if (inputNotas) {
        inputNotas.oninput = (e) => {
            presupuestoAIState.notas = e.target.value;
        };
    }

    // Mensaje de bienvenida si no hay API key
    if (!tieneAPIKey()) {
        setTimeout(() => {
            chatHistoryIA.push({
                rol: 'ia',
                texto: '👋 ¡Hola! Para usar el asistente IA, primero configura tu API key gratuita de Groq haciendo clic en ⚙️'
            });
            actualizarChatUI();
        }, 500);
    }
}
