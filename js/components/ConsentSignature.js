/**
 * ConsentSignature Component
 * Sistema de firma digital para consentimientos informados
 */

// Variables globales para el canvas de firma
let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

/**
 * Abre el modal de firma para un consentimiento
 */
function openSignatureModal(consentId) {
    const consent = consentimientosData.find(c => c.id === consentId);
    if (!consent) return;

    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'signatureModal';
    modal.className = 'signature-modal';
    modal.innerHTML = `
        <div class="signature-modal-overlay" onclick="closeSignatureModal()"></div>
        <div class="signature-modal-content">
            <!-- Header -->
            <div class="signature-modal-header">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-purple-500/20 rounded-lg">
                        <i data-lucide="pen-tool" class="w-6 h-6 text-purple-400"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-white">Firmar Consentimiento</h2>
                        <p class="text-sm text-slate-400">${consent.treatment}</p>
                    </div>
                </div>
                <button onclick="closeSignatureModal()" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Body -->
            <div class="signature-modal-body">
                <!-- Paso 1: Datos del paciente -->
                <div id="signatureStep1" class="signature-step active">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span class="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                        Datos del Paciente
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="patientName">Nombre Completo *</label>
                            <input type="text" id="patientName" placeholder="Nombre y apellidos" required>
                        </div>
                        <div class="form-group">
                            <label for="patientRut">RUT *</label>
                            <input type="text" id="patientRut" placeholder="12.345.678-9" required>
                        </div>
                        <div class="form-group">
                            <label for="patientEmail">Email</label>
                            <input type="email" id="patientEmail" placeholder="correo@ejemplo.com">
                        </div>
                        <div class="form-group">
                            <label for="patientPhone">Teléfono</label>
                            <input type="tel" id="patientPhone" placeholder="+56 9 1234 5678">
                        </div>
                        <div class="form-group md:col-span-2">
                            <label for="patientAddress">Dirección</label>
                            <input type="text" id="patientAddress" placeholder="Calle, número, comuna">
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end">
                        <button onclick="goToSignatureStep(2)" class="btn-primary">
                            Continuar a Firma
                            <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                        </button>
                    </div>
                </div>

                <!-- Paso 2: Firma -->
                <div id="signatureStep2" class="signature-step">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span class="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                        Firma del Paciente
                    </h3>

                    <p class="text-sm text-slate-600 mb-4">
                        Firme en el recuadro inferior usando el mouse o su dedo (en dispositivos táctiles).
                    </p>

                    <div class="signature-canvas-container">
                        <canvas id="signatureCanvas" width="600" height="200"></canvas>
                        <button onclick="clearSignature()" class="clear-signature-btn" title="Limpiar firma">
                            <i data-lucide="eraser" class="w-4 h-4"></i>
                            Limpiar
                        </button>
                    </div>

                    <!-- Checkbox de aceptación -->
                    <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" id="acceptTerms" class="mt-1 w-5 h-5 accent-purple-600">
                            <span class="text-sm text-slate-700">
                                Declaro haber leído y comprendido la información proporcionada sobre el tratamiento 
                                <strong>${consent.treatment}</strong>, incluyendo beneficios, efectos secundarios y 
                                contraindicaciones. Acepto voluntariamente someterme al procedimiento.
                            </span>
                        </label>
                    </div>

                    <div class="mt-6 flex justify-between">
                        <button onclick="goToSignatureStep(1)" class="btn-secondary">
                            <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
                            Volver
                        </button>
                        <button onclick="generateSignedPDF('${consent.id}')" class="btn-primary" id="generatePdfBtn">
                            <i data-lucide="file-down" class="w-4 h-4 mr-2"></i>
                            Generar PDF Firmado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar estilos si no existen
    addSignatureStyles();

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    lucide.createIcons();

    // Inicializar canvas de firma
    setTimeout(() => {
        initSignatureCanvas();
    }, 100);
}

/**
 * Cierra el modal de firma
 */
function closeSignatureModal() {
    const modal = document.getElementById('signatureModal');
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.remove();
            document.body.classList.remove('modal-open');
        }, 300);
    }
}

/**
 * Navega entre pasos del formulario
 */
function goToSignatureStep(step) {
    // Validar paso 1
    if (step === 2) {
        const name = document.getElementById('patientName').value.trim();
        const rut = document.getElementById('patientRut').value.trim();
        
        if (!name || !rut) {
            showSignatureAlert('Por favor complete los campos obligatorios (Nombre y RUT)');
            return;
        }
    }

    // Ocultar todos los pasos
    document.querySelectorAll('.signature-step').forEach(s => s.classList.remove('active'));
    
    // Mostrar paso seleccionado
    document.getElementById(`signatureStep${step}`).classList.add('active');
    
    // Reinicializar canvas si vamos al paso 2
    if (step === 2) {
        setTimeout(() => initSignatureCanvas(), 100);
    }
}

/**
 * Inicializa el canvas de firma
 */
function initSignatureCanvas() {
    signatureCanvas = document.getElementById('signatureCanvas');
    if (!signatureCanvas) return;

    signatureCtx = signatureCanvas.getContext('2d');
    
    // Ajustar tamaño del canvas al contenedor
    const container = signatureCanvas.parentElement;
    const rect = container.getBoundingClientRect();
    signatureCanvas.width = rect.width - 20;
    signatureCanvas.height = 200;

    // Estilo de línea
    signatureCtx.strokeStyle = '#1e293b';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';

    // Fondo blanco
    signatureCtx.fillStyle = '#ffffff';
    signatureCtx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);

    // Línea guía para firma
    signatureCtx.strokeStyle = '#e2e8f0';
    signatureCtx.lineWidth = 1;
    signatureCtx.beginPath();
    signatureCtx.moveTo(20, signatureCanvas.height - 40);
    signatureCtx.lineTo(signatureCanvas.width - 20, signatureCanvas.height - 40);
    signatureCtx.stroke();

    // Restaurar estilo para firma
    signatureCtx.strokeStyle = '#1e293b';
    signatureCtx.lineWidth = 2;

    // Event listeners para mouse
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);

    // Event listeners para touch
    signatureCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    signatureCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    signatureCanvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    isDrawing = true;
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();

    lastX = x;
    lastY = y;
}

/**
 * Limpia el canvas de firma
 */
function clearSignature() {
    if (!signatureCanvas || !signatureCtx) return;
    
    signatureCtx.fillStyle = '#ffffff';
    signatureCtx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    
    // Redibujar línea guía
    signatureCtx.strokeStyle = '#e2e8f0';
    signatureCtx.lineWidth = 1;
    signatureCtx.beginPath();
    signatureCtx.moveTo(20, signatureCanvas.height - 40);
    signatureCtx.lineTo(signatureCanvas.width - 20, signatureCanvas.height - 40);
    signatureCtx.stroke();
    
    signatureCtx.strokeStyle = '#1e293b';
    signatureCtx.lineWidth = 2;
}

/**
 * Verifica si el canvas tiene firma
 */
function hasSignature() {
    if (!signatureCanvas) return false;
    
    const ctx = signatureCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
    const data = imageData.data;
    
    // Contar píxeles oscuros (de la firma)
    let darkPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
        // Si el pixel es oscuro (no blanco ni gris claro)
        if (data[i] < 100 && data[i + 1] < 100 && data[i + 2] < 100) {
            darkPixels++;
        }
    }
    
    // Debe haber al menos algunos píxeles de firma
    return darkPixels > 100;
}

/**
 * Genera el PDF firmado
 */
async function generateSignedPDF(consentId) {
    const consent = consentimientosData.find(c => c.id === consentId);
    if (!consent) return;

    // Validaciones
    const acceptTerms = document.getElementById('acceptTerms').checked;
    if (!acceptTerms) {
        showSignatureAlert('Debe aceptar los términos del consentimiento');
        return;
    }

    if (!hasSignature()) {
        showSignatureAlert('Por favor firme en el recuadro antes de continuar');
        return;
    }

    // Obtener datos del paciente
    const patientData = {
        name: document.getElementById('patientName').value.trim(),
        rut: document.getElementById('patientRut').value.trim(),
        email: document.getElementById('patientEmail').value.trim(),
        phone: document.getElementById('patientPhone').value.trim(),
        address: document.getElementById('patientAddress').value.trim()
    };

    // Mostrar loading
    const btn = document.getElementById('generatePdfBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Generando...';
    btn.disabled = true;
    lucide.createIcons();

    try {
        // Cargar jsPDF si no está cargado
        if (typeof jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Logo/Header
        doc.setFillColor(79, 70, 229); // Indigo
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('CLÍNICA CIALO', pageWidth / 2, 18, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Consentimiento Informado', pageWidth / 2, 28, { align: 'center' });

        y = 50;

        // Título del consentimiento
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(consent.title, pageWidth / 2, y, { align: 'center' });
        y += 15;

        // Datos del paciente
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 35, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL PACIENTE', margin + 5, y + 3);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        y += 10;
        doc.text(`Nombre: ${patientData.name}`, margin + 5, y);
        doc.text(`RUT: ${patientData.rut}`, pageWidth / 2, y);
        y += 6;
        if (patientData.email) doc.text(`Email: ${patientData.email}`, margin + 5, y);
        if (patientData.phone) doc.text(`Teléfono: ${patientData.phone}`, pageWidth / 2, y);
        y += 6;
        if (patientData.address) doc.text(`Dirección: ${patientData.address}`, margin + 5, y);
        
        y += 15;

        // Introducción
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const introLines = doc.splitTextToSize(consent.introduction, pageWidth - margin * 2);
        doc.text(introLines, margin, y);
        y += introLines.length * 5 + 10;

        // Función para agregar sección
        const addSection = (title, items) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text(title, margin, y);
            y += 7;
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            
            items.forEach(item => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 5);
                doc.text(lines, margin + 5, y);
                y += lines.length * 4 + 2;
            });
            y += 5;
        };

        addSection('BENEFICIOS', consent.beneficios);
        addSection('POSIBLES EFECTOS SECUNDARIOS', consent.efectosSecundarios);
        addSection('CONTRAINDICACIONES', consent.contraindicaciones);
        addSection('CUIDADOS POST-TRATAMIENTO', consent.cuidados);

        // Nueva página para firma
        doc.addPage();
        y = 20;

        // Declaración de consentimiento
        doc.setFillColor(254, 249, 195); // Amarillo suave
        doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('DECLARACIÓN DE CONSENTIMIENTO', margin + 5, y + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const declaracion = `Yo, ${patientData.name}, con RUT ${patientData.rut}, declaro que he sido informado/a de manera clara y comprensible sobre el tratamiento ${consent.treatment}, incluyendo sus beneficios, posibles efectos secundarios, contraindicaciones y cuidados necesarios. Entiendo la información proporcionada y acepto voluntariamente someterme al procedimiento.`;
        const declLines = doc.splitTextToSize(declaracion, pageWidth - margin * 2 - 10);
        doc.text(declLines, margin + 5, y + 16);
        
        y += 55;

        // Firma
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('FIRMA DEL PACIENTE:', margin, y);
        y += 5;

        // Agregar imagen de firma
        const signatureData = signatureCanvas.toDataURL('image/png');
        doc.addImage(signatureData, 'PNG', margin, y, 80, 30);
        
        // Línea bajo la firma
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + 32, margin + 80, y + 32);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(patientData.name, margin, y + 38);
        doc.text(`RUT: ${patientData.rut}`, margin, y + 43);

        y += 55;

        // Fecha y hora
        const now = new Date();
        const fecha = now.toLocaleDateString('es-CL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const hora = now.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        doc.setFontSize(9);
        doc.text(`Fecha: ${fecha}`, margin, y);
        doc.text(`Hora: ${hora}`, margin + 60, y);

        // Footer
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 280, pageWidth, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Clínica Cialo - Documento generado digitalmente', pageWidth / 2, 288, { align: 'center' });
        doc.text(`ID: ${consent.id}-${Date.now()}`, pageWidth / 2, 293, { align: 'center' });

        // Guardar PDF
        const fileName = `Consentimiento_${consent.treatment.replace(/\s+/g, '_')}_${patientData.rut.replace(/\./g, '')}_${now.toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        // Mostrar éxito
        showSignatureSuccess('¡PDF generado exitosamente!');
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            closeSignatureModal();
        }, 2000);

    } catch (error) {
        console.error('Error generando PDF:', error);
        showSignatureAlert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        lucide.createIcons();
    }
}

/**
 * Carga un script dinámicamente
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Muestra alerta en el modal
 */
function showSignatureAlert(message) {
    const existing = document.querySelector('.signature-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = 'signature-alert error';
    alert.innerHTML = `
        <i data-lucide="alert-circle" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    
    const body = document.querySelector('.signature-modal-body');
    body.insertBefore(alert, body.firstChild);
    lucide.createIcons();

    setTimeout(() => alert.remove(), 5000);
}

/**
 * Muestra mensaje de éxito
 */
function showSignatureSuccess(message) {
    const existing = document.querySelector('.signature-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = 'signature-alert success';
    alert.innerHTML = `
        <i data-lucide="check-circle" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    
    const body = document.querySelector('.signature-modal-body');
    body.insertBefore(alert, body.firstChild);
    lucide.createIcons();
}

/**
 * Agrega estilos del componente de firma
 */
function addSignatureStyles() {
    if (document.getElementById('signature-styles')) return;

    const style = document.createElement('style');
    style.id = 'signature-styles';
    style.textContent = `
        body.modal-open {
            overflow: hidden;
        }

        .signature-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            animation: fadeIn 0.3s ease;
        }

        .signature-modal.closing {
            animation: fadeOut 0.3s ease forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        .signature-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
        }

        .signature-modal-content {
            position: relative;
            width: 100%;
            max-width: 700px;
            max-height: 90vh;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }

        .signature-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            background: linear-gradient(135deg, #1e1b4b, #312e81);
            color: white;
        }

        .signature-modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }

        .signature-step {
            display: none;
        }

        .signature-step.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }

        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.2s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .signature-canvas-container {
            position: relative;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 10px;
        }

        #signatureCanvas {
            width: 100%;
            height: 200px;
            background: white;
            border-radius: 8px;
            cursor: crosshair;
            touch-action: none;
        }

        .clear-signature-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 12px;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
        }

        .clear-signature-btn:hover {
            background: #fee2e2;
            border-color: #fca5a5;
            color: #dc2626;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            transform: translateY(-1px);
        }

        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            background: white;
            color: #4b5563;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-secondary:hover {
            background: #f9fafb;
            border-color: #d1d5db;
        }

        .signature-alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 16px;
            font-size: 14px;
        }

        .signature-alert.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
        }

        .signature-alert.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;
        }

        @media (max-width: 640px) {
            .signature-modal-content {
                max-height: 95vh;
                border-radius: 12px;
            }

            .signature-modal-header {
                padding: 16px;
            }

            .signature-modal-body {
                padding: 16px;
            }

            .grid {
                grid-template-columns: 1fr !important;
            }
        }
    `;
    document.head.appendChild(style);
}
