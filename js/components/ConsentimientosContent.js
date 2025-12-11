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
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <i data-lucide="file-text" class="w-6 h-6"></i>
                    <div>
                        <h3 class="font-bold text-lg">${consent.treatment}</h3>
                        <p class="text-sm text-indigo-100">Consentimiento Informado</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button 
                        onclick="openSignatureModal('${consent.id}')"
                        class="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                        <i data-lucide="pen-tool" class="w-4 h-4"></i>
                        Firmar
                    </button>
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
    // Caso especial para aclarado íntimo
    if (consent.id === 'aclarado-intimo-axilar') {
        return renderAclaradoIntimoConsent(consent);
    }

    // Renderizado estándar para otros consentimientos
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
        ${consent.beneficios ? `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Beneficios</h2>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.beneficios.map(b => `<li class="text-slate-700">${b}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <!-- Efectos Secundarios -->
        ${consent.efectosSecundarios ? `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Posibles efectos secundarios transitorios</h2>
            <p class="text-slate-700 mb-2">Tras el tratamiento pueden aparecer reacciones leves y temporales, tales como:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.efectosSecundarios.map(e => `<li class="text-slate-700">${e}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <!-- Contraindicaciones -->
        ${consent.contraindicaciones ? `
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Contraindicaciones</h2>
            <p class="text-slate-700 mb-2">El tratamiento no debe realizarse en pacientes con:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.contraindicaciones.map(c => `<li class="text-slate-700">${c}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <!-- Cuidados -->
        ${consent.cuidados ? `
        <div class="mb-8">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Cuidados</h2>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.cuidados.map(c => `<li class="text-slate-700">${c}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

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
 * Renderiza el consentimiento específico de aclarado íntimo
 */
function renderAclaradoIntimoConsent(consent) {
    return `
        <!-- Logo (visible en impresión) -->
        <div class="text-center mb-8 print-only" style="display: none;">
            <img src="assets/logo-cialo.png" alt="Cialo" class="mx-auto" style="max-width: 300px; height: auto;">
        </div>

        <!-- Título -->
        <h1 class="text-2xl font-bold text-center text-slate-800 mb-8 uppercase">
            ${consent.title}
        </h1>

        <h2 class="text-lg font-semibold text-center text-slate-700 mb-6">
            ${consent.treatment}
        </h2>

        <!-- Autorización inicial -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-slate-700 leading-relaxed text-justify">
                YO <span class="inline-block border-b-2 border-slate-400 min-w-[250px] px-2 font-medium">____________________________</span>, 
                RUT <span class="inline-block border-b-2 border-slate-400 min-w-[150px] px-2 font-medium">__________________</span>, 
                autorizo a la <strong>${consent.profesional}</strong> a realizarme el procedimiento de aclarado íntimo y/o axilar, 
                que puede incluir el uso de peeling químico y, de ser necesario y con mi autorización, la complementación del 
                tratamiento con Láser CO₂ fraccionado, con el objetivo de mejorar los resultados clínicos y estéticos.
            </p>
            <p class="text-slate-700 leading-relaxed text-justify mt-3">
                Entiendo que este procedimiento puede requerir más de una sesión para alcanzar los resultados esperados y 
                que la respuesta puede variar de acuerdo con las características de mi piel y hábitos personales.
            </p>
        </div>

        <!-- Medicamentos y Alergias -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-slate-700 text-sm">
                    <strong>Declaro usar los siguientes medicamentos:</strong><br>
                    <span class="inline-block border-b border-slate-300 w-full mt-2">__________________________________</span>
                </p>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-slate-700 text-sm">
                    <strong>Y ser alérgico(a) a:</strong><br>
                    <span class="inline-block border-b border-slate-300 w-full mt-2">__________________________________</span>
                </p>
            </div>
        </div>

        <!-- Criterios de Exclusión -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Criterios de exclusión</h2>
            <p class="text-slate-700 mb-2">El tratamiento no debe realizarse en caso de:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.criteriosExclusion.map(c => `<li class="text-slate-700">${c}</li>`).join('')}
            </ul>
        </div>

        <!-- Compromiso del Paciente -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Compromiso del paciente</h2>
            <p class="text-slate-700 mb-2">Me comprometo a:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.compromisoPaciente.map(c => `<li class="text-slate-700">${c}</li>`).join('')}
            </ul>
        </div>

        <!-- Efectos Secundarios -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Posibles efectos secundarios</h2>
            <p class="text-slate-700 mb-2">El tratamiento puede generar:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.efectosSecundarios.map(e => `<li class="text-slate-700">${e}</li>`).join('')}
            </ul>
            ${consent.efectosInfrecuentes ? `
                <p class="text-slate-700 mt-3 mb-2">En casos poco frecuentes pueden ocurrir:</p>
                <ul class="list-disc pl-6 space-y-2">
                    ${consent.efectosInfrecuentes.map(e => `<li class="text-slate-700">${e}</li>`).join('')}
                </ul>
            ` : ''}
        </div>

        <!-- Información Recibida -->
        <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Información recibida</h2>
            <p class="text-slate-700 mb-2">Declaro que se me han explicado y entiendo los siguientes puntos:</p>
            <ul class="list-disc pl-6 space-y-2">
                ${consent.informacionRecibida.map(i => `<li class="text-slate-700">${i}</li>`).join('')}
            </ul>
        </div>

        <!-- Registro Fotográfico -->
        ${consent.registroFotografico ? `
        <div class="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Registro fotográfico</h2>
            <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 text-indigo-600 rounded">
                    <span class="text-slate-700">Autorizo</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 text-indigo-600 rounded">
                    <span class="text-slate-700">No autorizo</span>
                </label>
            </div>
            <p class="text-sm text-slate-600 mt-2">
                el uso de mis fotografías clínicas con fines comparativos, científicos o didácticos.
            </p>
        </div>
        ` : ''}

        <!-- Aceptación -->
        <div class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 class="text-lg font-bold text-slate-800 mb-3">Aceptación</h2>
            <p class="text-slate-700 mb-2">Con mi firma confirmo que:</p>
            <ul class="list-disc pl-6 space-y-2 text-slate-700">
                <li>He leído y comprendido este consentimiento informado.</li>
                <li>He resuelto mis dudas y recibido respuestas satisfactorias.</li>
                <li>Estoy consciente de los beneficios, limitaciones y riesgos del procedimiento.</li>
                <li>Me comprometo a seguir las indicaciones posteriores entregadas por la Matrona tratante.</li>
            </ul>
        </div>

        <!-- Liberación de Responsabilidad -->
        ${consent.liberacionResponsabilidad ? `
        <div class="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
            <p class="text-sm text-slate-700 leading-relaxed text-justify">
                ${consent.liberacionResponsabilidad}
            </p>
        </div>
        ` : ''}

        <!-- Firmas -->
        <div class="grid grid-cols-2 gap-8 mb-6">
            <div class="text-center">
                <div class="border-t-2 border-slate-800 pt-2 mb-2 mt-12">
                    <p class="text-sm font-medium text-slate-800">Firma del paciente</p>
                </div>
                <p class="text-xs text-slate-600 mt-2">
                    Fecha: <span class="inline-block border-b border-slate-300 min-w-[120px] px-2">____________</span>
                </p>
            </div>
            <div class="text-center">
                <div class="border-t-2 border-slate-800 pt-2 mb-2 mt-12">
                    <p class="text-sm font-medium text-slate-800">Firma profesional tratante</p>
                </div>
                <p class="text-xs text-slate-600 mt-2">
                    Fecha: <span class="inline-block border-b border-slate-300 min-w-[120px] px-2">____________</span>
                </p>
            </div>
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

    // Caso especial para aclarado íntimo
    if (consent.id === 'aclarado-intimo-axilar') {
        printAclaradoIntimoConsent(printWindow, consent);
        return;
    }

    // Escribir contenido HTML limpio para impresión (consentimientos estándar)
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
            ${consent.beneficios ? `
                <h2>Beneficios</h2>
                <ul>
                    ${consent.beneficios.map(b => `<li>${b}</li>`).join('')}
                </ul>
            ` : ''}
            
            <!-- Efectos Secundarios -->
            ${consent.efectosSecundarios ? `
                <h2>Posibles efectos secundarios transitorios</h2>
                ${consent.id === 'clatuu-alpha' ? '' : '<p>Tras el tratamiento pueden aparecer reacciones leves y temporales, tales como:</p>'}
                <ul>
                    ${consent.efectosSecundarios.map(e => `<li>${e}</li>`).join('')}
                </ul>
            ` : ''}
            
            <!-- Contraindicaciones -->
            ${consent.contraindicaciones ? `
                <h2>Contraindicaciones</h2>
                ${consent.id === 'clatuu-alpha' ? '' : '<p>El tratamiento no debe realizarse en pacientes con:</p>'}
                <ul>
                    ${consent.contraindicaciones.map(c => `<li>${c}</li>`).join('')}
                </ul>
            ` : ''}
            
            <!-- Cuidados -->
            ${consent.cuidados ? `
                <h2>Cuidados${consent.id === 'clatuu-alpha' ? ' posteriores' : ''}</h2>
                <ul>
                    ${consent.cuidados.map(c => `<li>${c}</li>`).join('')}
                </ul>
            ` : ''}
            
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
 * Imprime el consentimiento de aclarado íntimo
 */
function printAclaradoIntimoConsent(printWindow, consent) {
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
                    line-height: 1.4;
                    color: #000;
                    background: white;
                    padding: 15px;
                    max-width: 100%;
                    margin: 0 auto;
                    font-size: 11px;
                }
                
                .logo {
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .logo img {
                    max-width: 200px;
                    height: auto;
                }
                
                h1 {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    page-break-after: avoid;
                }
                
                h2 {
                    font-size: 13px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 12px;
                    page-break-after: avoid;
                }
                
                h3 {
                    font-size: 12px;
                    font-weight: bold;
                    margin-top: 12px;
                    margin-bottom: 6px;
                    page-break-after: avoid;
                }
                
                p {
                    margin-bottom: 8px;
                    text-align: justify;
                    font-size: 11px;
                }
                
                ul {
                    margin-left: 20px;
                    margin-bottom: 10px;
                }
                
                li {
                    margin-bottom: 4px;
                    font-size: 10px;
                }
                
                .auth-box {
                    background: #f0f8ff;
                    padding: 12px;
                    border: 1px solid #4a90e2;
                    border-radius: 4px;
                    margin: 12px 0;
                    page-break-inside: avoid;
                }
                
                .med-box {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin: 10px 0;
                }
                
                .med-item {
                    background: #f8f8f8;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 10px;
                }
                
                .underline {
                    display: inline-block;
                    border-bottom: 1px solid #000;
                    min-width: 150px;
                    padding: 0 4px;
                }
                
                .checkbox-group {
                    margin: 8px 0;
                }
                
                .checkbox-item {
                    display: inline-block;
                    margin-right: 20px;
                }
                
                .checkbox {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border: 1px solid #000;
                    margin-right: 4px;
                    vertical-align: middle;
                }
                
                .signatures {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 20px 0;
                    page-break-inside: avoid;
                }
                
                .signature-line {
                    text-align: center;
                    border-top: 2px solid #000;
                    padding-top: 6px;
                    margin-top: 40px;
                }
                
                .signature-line p {
                    font-size: 10px;
                    font-weight: bold;
                }
                
                .date-line {
                    font-size: 9px;
                    margin-top: 4px;
                }
                
                .section {
                    margin-bottom: 12px;
                    page-break-inside: avoid;
                }
                
                .highlight {
                    background: #fff3cd;
                    padding: 8px;
                    border: 1px solid #ffc107;
                    border-radius: 4px;
                    margin: 8px 0;
                }
                
                .warning {
                    background: #f8d7da;
                    padding: 8px;
                    border: 1px solid #dc3545;
                    border-radius: 4px;
                    margin: 8px 0;
                    font-size: 10px;
                }
                
                @media print {
                    body {
                        padding: 8mm;
                    }
                    
                    @page {
                        size: A4;
                        margin: 8mm;
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
            <h2>${consent.treatment}</h2>
            
            <!-- Autorización -->
            <div class="auth-box">
                <p>
                    YO <span class="underline" style="min-width: 200px;">&nbsp;</span>, 
                    RUT <span class="underline" style="min-width: 120px;">&nbsp;</span>, 
                    autorizo a la <strong>${consent.profesional}</strong> a realizarme el procedimiento de aclarado íntimo y/o axilar, 
                    que puede incluir el uso de peeling químico y, de ser necesario y con mi autorización, la complementación del 
                    tratamiento con Láser CO₂ fraccionado, con el objetivo de mejorar los resultados clínicos y estéticos.
                </p>
                <p style="margin-top: 8px;">
                    Entiendo que este procedimiento puede requerir más de una sesión para alcanzar los resultados esperados y 
                    que la respuesta puede variar de acuerdo con las características de mi piel y hábitos personales.
                </p>
            </div>
            
            <!-- Medicamentos y Alergias -->
            <div class="med-box">
                <div class="med-item">
                    <strong>Declaro usar los siguientes medicamentos:</strong><br>
                    <span class="underline" style="width: 100%; margin-top: 4px;">&nbsp;</span>
                </div>
                <div class="med-item">
                    <strong>Y ser alérgico(a) a:</strong><br>
                    <span class="underline" style="width: 100%; margin-top: 4px;">&nbsp;</span>
                </div>
            </div>
            
            <!-- Criterios de Exclusión -->
            <div class="section">
                <h3>Criterios de exclusión</h3>
                <p style="font-size: 10px; margin-bottom: 4px;">El tratamiento no debe realizarse en caso de:</p>
                <ul>
                    ${consent.criteriosExclusion.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Compromiso del Paciente -->
            <div class="section">
                <h3>Compromiso del paciente</h3>
                <p style="font-size: 10px; margin-bottom: 4px;">Me comprometo a:</p>
                <ul>
                    ${consent.compromisoPaciente.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Efectos Secundarios -->
            <div class="section">
                <h3>Posibles efectos secundarios</h3>
                <p style="font-size: 10px; margin-bottom: 4px;">El tratamiento puede generar:</p>
                <ul>
                    ${consent.efectosSecundarios.map(e => `<li>${e}</li>`).join('')}
                </ul>
                ${consent.efectosInfrecuentes ? `
                    <p style="font-size: 10px; margin-top: 6px; margin-bottom: 4px;">En casos poco frecuentes pueden ocurrir:</p>
                    <ul>
                        ${consent.efectosInfrecuentes.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
            
            <!-- Información Recibida -->
            <div class="section">
                <h3>Información recibida</h3>
                <p style="font-size: 10px; margin-bottom: 4px;">Declaro que se me han explicado y entiendo los siguientes puntos:</p>
                <ul>
                    ${consent.informacionRecibida.map(i => `<li>${i}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Registro Fotográfico -->
            <div class="highlight">
                <h3 style="margin-top: 0;">Registro fotográfico</h3>
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <span class="checkbox"></span> Autorizo
                    </div>
                    <div class="checkbox-item">
                        <span class="checkbox"></span> No autorizo
                    </div>
                </div>
                <p style="font-size: 9px; margin-top: 4px;">
                    el uso de mis fotografías clínicas con fines comparativos, científicos o didácticos.
                </p>
            </div>
            
            <!-- Aceptación -->
            <div class="section">
                <h3>Aceptación</h3>
                <p style="font-size: 10px; margin-bottom: 4px;">Con mi firma confirmo que:</p>
                <ul>
                    <li>He leído y comprendido este consentimiento informado.</li>
                    <li>He resuelto mis dudas y recibido respuestas satisfactorias.</li>
                    <li>Estoy consciente de los beneficios, limitaciones y riesgos del procedimiento.</li>
                    <li>Me comprometo a seguir las indicaciones posteriores entregadas por la Matrona tratante.</li>
                </ul>
            </div>
            
            <!-- Liberación de Responsabilidad -->
            <div class="warning">
                <p style="margin: 0;">
                    ${consent.liberacionResponsabilidad}
                </p>
            </div>
            
            <!-- Firmas -->
            <div class="signatures">
                <div>
                    <div class="signature-line">
                        <p>Firma del paciente</p>
                    </div>
                    <p class="date-line">Fecha: <span class="underline" style="min-width: 100px;">&nbsp;</span></p>
                </div>
                <div>
                    <div class="signature-line">
                        <p>Firma profesional tratante</p>
                    </div>
                    <p class="date-line">Fecha: <span class="underline" style="min-width: 100px;">&nbsp;</span></p>
                </div>
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
