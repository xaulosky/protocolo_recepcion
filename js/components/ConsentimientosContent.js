/**
 * ConsentimientosContent Component
 * Muestra y gestiona los consentimientos informados
 */

function ConsentimientosContent() {
    return `
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <i data-lucide="file-text" class="text-indigo-600 w-6 h-6"></i>
                <h3 class="text-xl font-bold text-slate-800">Consentimientos Informados</h3>
                <span class="text-sm text-slate-500">(${consentimientosData.length} ${consentimientosData.length === 1 ? 'documento' : 'documentos'})</span>
            </div>
            
            <p class="text-sm text-slate-600 mb-6">
                Selecciona un consentimiento para visualizarlo e imprimirlo con el logo de Cialo.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                ${consentimientosData.map(consent => renderConsentCard(consent)).join('')}
            </div>
        </div>

        <!-- Área de vista previa del consentimiento -->
        <div id="consentPreview"></div>
    `;
}

function renderConsentCard(consent) {
    return `
        <div 
            class="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
            onclick="showConsentPreview('${consent.id}')"
        >
            <div class="flex items-start gap-3 mb-3">
                <div class="p-2 bg-indigo-100 rounded-lg">
                    <i data-lucide="file-check" class="w-5 h-5 text-indigo-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-slate-800 text-sm mb-1">${consent.treatment}</h4>
                    <p class="text-xs text-slate-500">Consentimiento Informado</p>
                </div>
            </div>
            
            <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span class="text-xs text-slate-600 flex items-center gap-1">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                    Ver documento
                </span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
            </div>
        </div>
    `;
}

/**
 * Muestra la vista previa del consentimiento
 */
function showConsentPreview(consentId) {
    const consent = consentimientosData.find(c => c.id === consentId);
    if (!consent) return;

    const previewContainer = document.getElementById('consentPreview');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
        <div class="bg-white border-2 border-indigo-200 rounded-xl overflow-hidden">
            <!-- Header con botones -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i data-lucide="file-text" class="w-6 h-6"></i>
                    <div>
                        <h3 class="font-bold text-lg">${consent.treatment}</h3>
                        <p class="text-sm text-indigo-100">Consentimiento Informado</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button 
                        onclick="printConsent('${consent.id}')"
                        class="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                        <i data-lucide="printer" class="w-4 h-4"></i>
                        Imprimir
                    </button>
                    <button 
                        onclick="closeConsentPreview()"
                        class="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Contenido del consentimiento -->
            <div id="printableConsent" class="p-8 max-w-4xl mx-auto">
                ${renderConsentDocument(consent)}
            </div>
        </div>
    `;

    lucide.createIcons();

    // Scroll suave hacia la vista previa
    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Renderiza el documento de consentimiento completo
 */
function renderConsentDocument(consent) {
    return `
        <!-- Logo (visible en impresión) -->
        <div class="text-center mb-8 print-only" style="display: none;">
            <img src="assets/logo-cialo.png" alt="Cialo" class="mx-auto" style="max-width: 300px; height: auto;">
        </div>

        <!-- Título -->
        <h1 class="text-2xl font-bold text-center text-slate-800 mb-8 uppercase">
            ${consent.title}
        </h1>

        <!-- Introducción -->
        <div class="mb-6">
            <p class="text-slate-700 leading-relaxed text-justify">
                ${consent.introduction}
            </p>
        </div>

        <!-- Beneficios -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Beneficios</h2>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.beneficios.map(b => `<li class="text-slate-700">${b}</li>`).join('')}
            </ul>
        </div>

        <!-- Efectos Secundarios -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Posibles efectos secundarios transitorios</h2>
            <p class="text-slate-700 mb-2">Tras el tratamiento pueden aparecer reacciones leves y temporales, tales como:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.efectosSecundarios.map(e => `<li class="text-slate-700">${e}</li>`).join('')}
            </ul>
        </div>

        <!-- Contraindicaciones -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Contraindicaciones</h2>
            <p class="text-slate-700 mb-2">El tratamiento no debe realizarse en pacientes con:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.contraindicaciones.map(c => `<li class="text-slate-700">${c}</li>`).join('')}
            </ul>
        </div>

        <!-- Cuidados -->
        <div class="mb-8">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Cuidados</h2>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.cuidados.map(c => `<li class="text-slate-700">${c}</li>`).join('')}
            </ul>
        </div>

        <!-- Declaración del paciente -->
        <div class="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p class="text-slate-700 leading-relaxed text-justify mb-4">
                Por medio del presente documento, yo, <span class="inline-block border-b-2 border-slate-300 min-w-[300px] px-2">____________________________________</span>,
                Rut <span class="inline-block border-b-2 border-slate-300 min-w-[150px] px-2">____________________</span>, declaro que he recibido información clara, suficiente y
                comprensible acerca del procedimiento a realizar, incluyendo sus objetivos, beneficios
                esperados, posibles efectos secundarios, contraindicaciones y cuidados posteriores.
            </p>
            <p class="text-slate-700 leading-relaxed text-justify mb-4">
                He tenido oportunidad de realizar todas las preguntas necesarias y comprendo que los resultados pueden variar según las características individuales.
            </p>
            <p class="text-slate-700 leading-relaxed text-justify">
                Asimismo, autorizo al equipo profesional del centro a realizar dicho procedimiento, y
                consiento ser fotografiado/a antes, durante y después del tratamiento, con el único propósito
                de documentar clínicamente el proceso y los resultados obtenidos.
            </p>
        </div>

        <!-- Firmas -->
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="text-center">
                <div class="border-t-2 border-slate-800 pt-2 mb-2">
                    <p class="text-sm font-medium text-slate-800">Firma del paciente</p>
                </div>
            </div>
            <div class="text-center">
                <div class="border-t-2 border-slate-800 pt-2 mb-2">
                    <p class="text-sm font-medium text-slate-800">Firma del tratante</p>
                </div>
            </div>
        </div>

        <!-- Fecha -->
        <div class="text-center">
            <p class="text-slate-700">
                Fecha: <span class="inline-block border-b-2 border-slate-300 min-w-[200px] px-2">____________________</span>
            </p>
        </div>
    `;
}

/**
 * Imprime el consentimiento en una nueva ventana limpia
 */
function printConsent(consentId) {
    const consent = consentimientosData.find(c => c.id === consentId);
    if (!consent) return;

    // Crear nueva ventana
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    // Escribir contenido HTML limpio para impresión
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${consent.title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    line-height: 1.5;
                    color: #000;
                    background: white;
                    padding: 15px;
                    max-width: 100%;
                    margin: 0 auto;
                }
                
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .logo img {
                    max-width: 250px;
                    height: auto;
                }
                
                h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    page-break-after: avoid;
                }
                
                h2 {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 15px;
                    margin-bottom: 8px;
                    page-break-after: avoid;
                    page-break-inside: avoid;
                }
                
                p {
                    margin-bottom: 12px;
                    text-align: justify;
                    font-size: 12px;
                    orphans: 3;
                    widows: 3;
                }
                
                ul {
                    margin-left: 25px;
                    margin-bottom: 12px;
                    page-break-inside: avoid;
                }
                
                li {
                    margin-bottom: 6px;
                    font-size: 12px;
                }
                
                .declaration {
                    background: #f8f8f8;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    margin: 20px 0;
                    page-break-inside: avoid;
                }
                
                .signatures {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 25px 0;
                    page-break-inside: avoid;
                }
                
                .signature-line {
                    text-align: center;
                    border-top: 2px solid #000;
                    padding-top: 8px;
                    margin-top: 50px;
                }
                
                .signature-line p {
                    font-size: 11px;
                }
                
                .date {
                    text-align: center;
                    margin-top: 20px;
                    page-break-inside: avoid;
                }
                
                .date p {
                    font-size: 12px;
                }
                
                .underline {
                    display: inline-block;
                    border-bottom: 1px solid #000;
                    min-width: 200px;
                    padding: 0 8px;
                    text-decoration: none;
                }
                
                @media print {
                    body {
                        padding: 10mm;
                    }
                    
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Logo -->
            <div class="logo">
                <img src="assets/logo-cialo.png" alt="Cialo">
            </div>
            
            <!-- Título -->
            <h1>${consent.title}</h1>
            
            <!-- Marco Legal (si existe) -->
            ${consent.marcoLegal ? `
                <h2>Marco Legal</h2>
                <p>${consent.marcoLegal}</p>
            ` : ''}
            
            <!-- Introducción -->
            ${consent.marcoLegal ? '<h2>Descripción del Tratamiento</h2>' : ''}
            <p>${consent.introduction}</p>
            
            <!-- Beneficios -->
            <h2>Beneficios</h2>
            <ul>
                ${consent.beneficios.map(b => `<li>${b}</li>`).join('')}
            </ul>
            
            <!-- Efectos Secundarios -->
            <h2>Posibles efectos secundarios transitorios</h2>
            ${consent.id === 'clatuu-alpha' ? '' : '<p>Tras el tratamiento pueden aparecer reacciones leves y temporales, tales como:</p>'}
            <ul>
                ${consent.efectosSecundarios.map(e => `<li>${e}</li>`).join('')}
            </ul>
            
            <!-- Contraindicaciones -->
            <h2>Contraindicaciones</h2>
            ${consent.id === 'clatuu-alpha' ? '' : '<p>El tratamiento no debe realizarse en pacientes con:</p>'}
            <ul>
                ${consent.contraindicaciones.map(c => `<li>${c}</li>`).join('')}
            </ul>
            
            <!-- Cuidados -->
            <h2>Cuidados${consent.id === 'clatuu-alpha' ? ' posteriores' : ''}</h2>
            <ul>
                ${consent.cuidados.map(c => `<li>${c}</li>`).join('')}
            </ul>
            
            <!-- Uso de Imágenes (si existe) -->
            ${consent.usoImagenes ? `
                <h2>Uso de imágenes</h2>
                <p>${consent.usoImagenes}</p>
            ` : ''}
            
            <!-- Declaración del paciente -->
            <div class="declaration">
                <p>
                    Por medio del presente documento, yo, <span class="underline">&nbsp;</span>,
                    Rut <span class="underline" style="min-width: 150px;">&nbsp;</span>, declaro que he recibido información clara, suficiente y
                    comprensible acerca del procedimiento a realizar, incluyendo sus objetivos, beneficios
                    esperados, posibles efectos secundarios, contraindicaciones y cuidados posteriores.
                </p>
                <p>
                    He tenido oportunidad de realizar todas las preguntas necesarias y comprendo que los resultados pueden variar según las características individuales.
                </p>
                <p>
                    Asimismo, autorizo al equipo profesional del centro a realizar dicho procedimiento, y
                    consiento ser fotografiado/a antes, durante y después del tratamiento, con el único propósito
                    de documentar clínicamente el proceso y los resultados obtenidos.
                </p>
            </div>
            
            <!-- Firmas -->
            <div class="signatures">
                <div>
                    <div class="signature-line">
                        <p><strong>Firma del paciente</strong></p>
                    </div>
                </div>
                <div>
                    <div class="signature-line">
                        <p><strong>Firma del tratante</strong></p>
                    </div>
                </div>
            </div>
            
            <!-- Fecha -->
            <div class="date">
                <p>Fecha: <span class="underline" style="min-width: 200px;">&nbsp;</span></p>
            </div>
            
            <script>
                // Auto-imprimir cuando la ventana cargue
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

/**
 * Cierra la vista previa del consentimiento
 */
function closeConsentPreview() {
    const previewContainer = document.getElementById('consentPreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
}
