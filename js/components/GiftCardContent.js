/**
 * GiftCardContent Component
 * Pantalla para generar Gift Cards en JPG con el logo de Cialo
 */

/**
 * Renderiza el contenido de la pantalla de Gift Cards
 */
function GiftCardContent() {
    return `
        <div class="space-y-6">
            <!-- Formulario de configuración -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="settings-2" class="w-5 h-5 text-purple-600"></i>
                    Configuración de Gift Card
                </h2>
                
                <!-- Selector de tipo de Gift Card -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-slate-700 mb-3">
                        Tipo de Gift Card
                    </label>
                    <div class="flex gap-4">
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="giftCardType" value="value" checked 
                                   class="sr-only peer" onchange="toggleGiftCardType()">
                            <div class="p-4 border-2 border-slate-200 rounded-xl text-center transition-all
                                        peer-checked:border-purple-500 peer-checked:bg-purple-50
                                        hover:border-purple-300">
                                <i data-lucide="banknote" class="w-8 h-8 mx-auto mb-2 text-purple-600"></i>
                                <span class="font-medium text-slate-700">Por Valor</span>
                                <p class="text-xs text-slate-500 mt-1">Monto en pesos</p>
                            </div>
                        </label>
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="giftCardType" value="treatment" 
                                   class="sr-only peer" onchange="toggleGiftCardType()">
                            <div class="p-4 border-2 border-slate-200 rounded-xl text-center transition-all
                                        peer-checked:border-purple-500 peer-checked:bg-purple-50
                                        hover:border-purple-300">
                                <i data-lucide="sparkles" class="w-8 h-8 mx-auto mb-2 text-purple-600"></i>
                                <span class="font-medium text-slate-700">Por Tratamiento</span>
                                <p class="text-xs text-slate-500 mt-1">Nombre del tratamiento</p>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Monto (visible cuando es por valor) -->
                    <div id="amountField">
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Monto de la Gift Card
                        </label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                            <input 
                                type="text" 
                                id="giftCardAmount" 
                                placeholder="50.000"
                                class="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                oninput="formatGiftCardAmount(this); updateGiftCardPreview()"
                            >
                        </div>
                    </div>
                    
                    <!-- Tratamiento (visible cuando es por tratamiento) -->
                    <div id="treatmentField" class="hidden">
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Nombre del Tratamiento
                        </label>
                        <input 
                            type="text" 
                            id="giftCardTreatment" 
                            placeholder="Ej: Depilación Láser Full Body"
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            oninput="updateGiftCardPreview()"
                        >
                    </div>
                    
                    <!-- Código de Gift Card -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Código de Gift Card (opcional)
                        </label>
                        <div class="flex gap-2">
                            <input 
                                type="text" 
                                id="giftCardCode" 
                                placeholder="GC-XXXX-XXXX"
                                maxlength="14"
                                class="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all uppercase"
                                oninput="updateGiftCardPreview()"
                            >
                            <button 
                                onclick="generateRandomCode()"
                                class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-2"
                                title="Generar código automático"
                            >
                                <i data-lucide="shuffle" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Destinatario -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Para (Destinatario)
                        </label>
                        <input 
                            type="text" 
                            id="giftCardRecipient" 
                            placeholder="Nombre del destinatario"
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            oninput="updateGiftCardPreview()"
                        >
                    </div>
                    
                    <!-- Remitente -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            De (Remitente)
                        </label>
                        <input 
                            type="text" 
                            id="giftCardSender" 
                            placeholder="Tu nombre"
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            oninput="updateGiftCardPreview()"
                        >
                    </div>
                    
                    <!-- Mensaje personalizado -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Mensaje personalizado (opcional)
                        </label>
                        <textarea 
                            id="giftCardMessage" 
                            rows="2"
                            placeholder="Escribe un mensaje especial..."
                            maxlength="100"
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                            oninput="updateGiftCardPreview()"
                        ></textarea>
                        <p class="text-xs text-slate-400 mt-1">Máximo 100 caracteres</p>
                    </div>
                    
                    <!-- Fecha de vencimiento -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Fecha de vencimiento
                        </label>
                        <input 
                            type="date" 
                            id="giftCardExpiry"
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            oninput="updateGiftCardPreview()"
                        >
                    </div>
                    
                    <!-- Estilo de diseño -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Estilo de diseño
                        </label>
                        <select 
                            id="giftCardStyle"
                            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            onchange="updateGiftCardPreview()"
                        >
                            <option value="elegant">✨ Luxury Gold</option>
                            <option value="modern">🌸 Rose Gold</option>
                            <option value="classic">🌊 Ocean Blue</option>
                            <option value="dark">🌙 Midnight Purple</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Vista previa -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <i data-lucide="eye" class="w-5 h-5 text-purple-600"></i>
                        Vista Previa
                    </h2>
                    <button 
                        onclick="updateGiftCardPreview()"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm flex items-center gap-1.5 transition-all"
                    >
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                        Actualizar
                    </button>
                </div>
                
                <!-- Canvas para el preview -->
                <div class="flex justify-center bg-slate-100 rounded-lg p-6">
                    <canvas id="giftCardCanvas" width="800" height="500" class="max-w-full h-auto rounded-lg shadow-lg"></canvas>
                </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex flex-wrap justify-center gap-4">
                <button 
                    onclick="downloadGiftCard('jpg')"
                    class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <i data-lucide="download" class="w-5 h-5"></i>
                    Descargar JPG
                </button>
                <button 
                    onclick="downloadGiftCard('png')"
                    class="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                    <i data-lucide="image" class="w-5 h-5"></i>
                    Descargar PNG
                </button>
                <button 
                    onclick="copyGiftCardToClipboard()"
                    class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                    <i data-lucide="copy" class="w-5 h-5"></i>
                    Copiar al portapapeles
                </button>
            </div>
            
            <!-- Información sobre uso -->
            <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <i data-lucide="info" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"></i>
                    <div class="text-sm text-purple-800">
                        <p class="font-medium mb-1">Información sobre Gift Cards</p>
                        <ul class="list-disc list-inside space-y-1 text-purple-700">
                            <li>La Gift Card se genera como imagen de alta calidad (800x500 px)</li>
                            <li>El código es único y debe registrarse en el sistema de pagos</li>
                            <li>Recuerda informar al cliente sobre la fecha de vencimiento</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Variable para almacenar el logo cargado
let giftCardLogoImage = null;

/**
 * Inicializa el contenido de Gift Card
 */
function initGiftCardContent() {
    // Cargar el logo de Cialo
    giftCardLogoImage = new Image();
    giftCardLogoImage.crossOrigin = 'anonymous';
    giftCardLogoImage.onload = function () {
        updateGiftCardPreview();
    };
    giftCardLogoImage.src = 'assets/logo-cialo-claro.png';

    // Establecer fecha por defecto (6 meses desde hoy)
    const expiryInput = document.getElementById('giftCardExpiry');
    if (expiryInput) {
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 6);
        expiryInput.value = defaultDate.toISOString().split('T')[0];
    }

    // Generar código por defecto
    generateRandomCode();

    // Renderizar preview inicial
    setTimeout(updateGiftCardPreview, 100);
}

/**
 * Formatea el monto con separador de miles
 */
function formatGiftCardAmount(input) {
    let value = input.value.replace(/\D/g, '');
    if (value) {
        value = parseInt(value).toLocaleString('es-CL');
    }
    input.value = value;
}

/**
 * Genera un código aleatorio para la Gift Card
 */
function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GC-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const codeInput = document.getElementById('giftCardCode');
    if (codeInput) {
        codeInput.value = code;
        updateGiftCardPreview();
    }
}

/**
 * Alterna entre tipo de Gift Card (valor o tratamiento)
 */
function toggleGiftCardType() {
    const type = getGiftCardType();
    const amountField = document.getElementById('amountField');
    const treatmentField = document.getElementById('treatmentField');

    if (type === 'treatment') {
        amountField.classList.add('hidden');
        treatmentField.classList.remove('hidden');
    } else {
        amountField.classList.remove('hidden');
        treatmentField.classList.add('hidden');
    }

    updateGiftCardPreview();
}

/**
 * Obtiene el tipo de Gift Card seleccionado
 */
function getGiftCardType() {
    const selected = document.querySelector('input[name="giftCardType"]:checked');
    return selected ? selected.value : 'value';
}

/**
 * Obtiene los estilos según el tema seleccionado
 */
function getGiftCardStyles(style) {
    const styles = {
        elegant: {
            name: 'Luxury Gold',
            bgGradient: [
                { pos: 0, color: '#1a1a2e' },
                { pos: 0.3, color: '#16213e' },
                { pos: 0.7, color: '#0f3460' },
                { pos: 1, color: '#1a1a2e' }
            ],
            accentColor: '#d4af37',
            accentGradient: ['#d4af37', '#f5e6a3', '#d4af37'],
            textColor: '#ffffff',
            secondaryText: '#c9c9c9',
            borderColor: '#d4af37',
            pattern: 'diamonds',
            glow: true
        },
        modern: {
            name: 'Rose Gold',
            bgGradient: [
                { pos: 0, color: '#2d1f3d' },
                { pos: 0.5, color: '#4a3153' },
                { pos: 1, color: '#2d1f3d' }
            ],
            accentColor: '#e8b4b8',
            accentGradient: ['#e8b4b8', '#f5d0d3', '#daa0a4'],
            textColor: '#ffffff',
            secondaryText: '#d4c5c7',
            borderColor: '#e8b4b8',
            pattern: 'waves',
            glow: true
        },
        classic: {
            name: 'Ocean Blue',
            bgGradient: [
                { pos: 0, color: '#0c2340' },
                { pos: 0.4, color: '#1a4570' },
                { pos: 0.7, color: '#2d6a9f' },
                { pos: 1, color: '#1a4570' }
            ],
            accentColor: '#7dd3fc',
            accentGradient: ['#38bdf8', '#7dd3fc', '#bae6fd'],
            textColor: '#ffffff',
            secondaryText: '#bae6fd',
            borderColor: '#38bdf8',
            pattern: 'circles',
            glow: true
        },
        dark: {
            name: 'Midnight Purple',
            bgGradient: [
                { pos: 0, color: '#0a0a0f' },
                { pos: 0.3, color: '#1a1a2e' },
                { pos: 0.6, color: '#2d1b4e' },
                { pos: 1, color: '#0a0a0f' }
            ],
            accentColor: '#a78bfa',
            accentGradient: ['#7c3aed', '#a78bfa', '#c4b5fd'],
            textColor: '#ffffff',
            secondaryText: '#c4b5fd',
            borderColor: '#8b5cf6',
            pattern: 'stars',
            glow: true
        }
    };
    return styles[style] || styles.elegant;
}

/**
 * Actualiza la vista previa de la Gift Card
 */
function updateGiftCardPreview() {
    const canvas = document.getElementById('giftCardCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Obtener valores del formulario
    const amount = document.getElementById('giftCardAmount')?.value || '';
    const treatment = document.getElementById('giftCardTreatment')?.value || '';
    const cardType = getGiftCardType();
    const code = document.getElementById('giftCardCode')?.value || '';
    const recipient = document.getElementById('giftCardRecipient')?.value || '';
    const sender = document.getElementById('giftCardSender')?.value || '';
    const message = document.getElementById('giftCardMessage')?.value || '';
    const expiry = document.getElementById('giftCardExpiry')?.value || '';
    const style = document.getElementById('giftCardStyle')?.value || 'elegant';

    const colors = getGiftCardStyles(style);

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // ========== FONDO CON GRADIENTE MULTI-STOP ==========
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    colors.bgGradient.forEach(stop => {
        bgGradient.addColorStop(stop.pos, stop.color);
    });
    ctx.fillStyle = bgGradient;
    roundRect(ctx, 0, 0, width, height, 24);
    ctx.fill();

    // ========== PATRÓN DECORATIVO DE FONDO ==========
    drawPattern(ctx, width, height, colors);

    // ========== EFECTO DE BRILLO/GLOW ==========
    if (colors.glow) {
        // Glow superior izquierdo
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
        glowGradient.addColorStop(0, hexToRgba(colors.accentColor, 0.15));
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, 400, 300);

        // Glow inferior derecho
        const glowGradient2 = ctx.createRadialGradient(width, height, 0, width, height, 350);
        glowGradient2.addColorStop(0, hexToRgba(colors.accentColor, 0.1));
        glowGradient2.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient2;
        ctx.fillRect(width - 400, height - 300, 400, 300);
    }

    // ========== BORDE ELEGANTE CON GRADIENTE ==========
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, colors.accentGradient[0]);
    borderGradient.addColorStop(0.5, colors.accentGradient[1]);
    borderGradient.addColorStop(1, colors.accentGradient[2]);
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    roundRect(ctx, 20, 20, width - 40, height - 40, 18);
    ctx.stroke();

    // Segundo borde interior más sutil
    ctx.strokeStyle = hexToRgba(colors.accentColor, 0.3);
    ctx.lineWidth = 1;
    roundRect(ctx, 30, 30, width - 60, height - 60, 14);
    ctx.stroke();

    // ========== LOGO DE CIALO ==========
    if (giftCardLogoImage && giftCardLogoImage.complete && giftCardLogoImage.naturalWidth > 0) {
        const logoHeight = 55;
        const logoWidth = (giftCardLogoImage.width / giftCardLogoImage.height) * logoHeight;
        ctx.drawImage(giftCardLogoImage, 50, 45, logoWidth, logoHeight);
    }

    // ========== TÍTULO "GIFT CARD" CON ESTILO ==========
    // Sombra del texto
    ctx.shadowColor = hexToRgba(colors.accentColor, 0.5);
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const titleGradient = ctx.createLinearGradient(width - 250, 40, width - 50, 80);
    titleGradient.addColorStop(0, colors.accentGradient[0]);
    titleGradient.addColorStop(0.5, colors.accentGradient[1]);
    titleGradient.addColorStop(1, colors.accentGradient[2]);
    ctx.fillStyle = titleGradient;
    ctx.font = '600 28px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.letterSpacing = '3px';
    ctx.fillText('GIFT CARD', width - 50, 75);

    // Reset sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Línea decorativa debajo del título
    const lineGradient = ctx.createLinearGradient(width - 200, 0, width - 50, 0);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.3, colors.accentGradient[0]);
    lineGradient.addColorStop(0.5, colors.accentGradient[1]);
    lineGradient.addColorStop(1, colors.accentGradient[2]);
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width - 200, 90);
    ctx.lineTo(width - 50, 90);
    ctx.stroke();

    // ========== LÍNEA SEPARADORA PRINCIPAL ==========
    const mainLineGradient = ctx.createLinearGradient(50, 0, width - 50, 0);
    mainLineGradient.addColorStop(0, 'transparent');
    mainLineGradient.addColorStop(0.1, hexToRgba(colors.accentColor, 0.5));
    mainLineGradient.addColorStop(0.5, colors.accentColor);
    mainLineGradient.addColorStop(0.9, hexToRgba(colors.accentColor, 0.5));
    mainLineGradient.addColorStop(1, 'transparent');
    ctx.strokeStyle = mainLineGradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 125);
    ctx.lineTo(width - 50, 125);
    ctx.stroke();

    // ========== CONTENIDO PRINCIPAL (MONTO O TRATAMIENTO) ==========
    // Sombra para el texto principal
    ctx.shadowColor = hexToRgba(colors.accentColor, 0.4);
    ctx.shadowBlur = 20;
    ctx.fillStyle = colors.textColor;
    ctx.textAlign = 'center';

    if (cardType === 'treatment') {
        // Mostrar nombre del tratamiento
        let displayTreatment = treatment || 'Tratamiento';

        // Ajustar tamaño de fuente según longitud
        let fontSize = 42;
        if (displayTreatment.length > 30) {
            fontSize = 32;
            if (displayTreatment.length > 40) {
                displayTreatment = displayTreatment.substring(0, 37) + '...';
            }
        } else if (displayTreatment.length > 20) {
            fontSize = 36;
        }

        ctx.font = `bold ${fontSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
        ctx.fillText(displayTreatment, width / 2, 200);

        // Reset sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Subtítulo
        ctx.fillStyle = hexToRgba(colors.secondaryText, 0.7);
        ctx.font = '300 14px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('— TRATAMIENTO INCLUIDO —', width / 2, 235);
    } else {
        // Mostrar monto
        const displayAmount = amount ? `$${amount}` : '$0';
        ctx.font = 'bold 68px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText(displayAmount, width / 2, 210);

        // Reset sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Subtítulo
        ctx.fillStyle = hexToRgba(colors.secondaryText, 0.7);
        ctx.font = '300 14px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('— PESOS CHILENOS —', width / 2, 240);
    }

    // ========== MENSAJE PERSONALIZADO ==========
    if (message) {
        ctx.fillStyle = colors.secondaryText;
        ctx.font = 'italic 300 16px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        // Truncar mensaje si es muy largo
        let displayMessage = message;
        if (message.length > 60) {
            displayMessage = message.substring(0, 57) + '...';
        }
        ctx.fillText(`"${displayMessage}"`, width / 2, 275);
    }

    // ========== DESTINATARIO Y REMITENTE (Layout horizontal) ==========
    const infoY = 320;

    ctx.textAlign = 'left';

    if (recipient) {
        ctx.fillStyle = hexToRgba(colors.secondaryText, 0.7);
        ctx.font = '400 12px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('PARA', 50, infoY);

        ctx.fillStyle = colors.textColor;
        ctx.font = '500 16px "Inter", "Helvetica Neue", Arial, sans-serif';
        // Truncar nombre si es muy largo
        let displayRecipient = recipient;
        if (recipient.length > 25) {
            displayRecipient = recipient.substring(0, 22) + '...';
        }
        ctx.fillText(displayRecipient, 50, infoY + 20);
    }

    if (sender) {
        // Posicionar "DE" a la derecha del destinatario
        const senderX = recipient ? 420 : 50;

        ctx.fillStyle = hexToRgba(colors.secondaryText, 0.7);
        ctx.font = '400 12px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillText('DE', senderX, infoY);

        ctx.fillStyle = colors.textColor;
        ctx.font = '500 16px "Inter", "Helvetica Neue", Arial, sans-serif';
        // Truncar nombre si es muy largo
        let displaySender = sender;
        if (sender.length > 20) {
            displaySender = sender.substring(0, 17) + '...';
        }
        ctx.fillText(displaySender, senderX, infoY + 20);
    }

    // ========== LÍNEA SEPARADORA INFERIOR ==========
    const bottomLineGradient = ctx.createLinearGradient(50, 0, width - 50, 0);
    bottomLineGradient.addColorStop(0, colors.accentColor);
    bottomLineGradient.addColorStop(0.5, hexToRgba(colors.accentColor, 0.3));
    bottomLineGradient.addColorStop(1, colors.accentColor);
    ctx.strokeStyle = bottomLineGradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 365);
    ctx.lineTo(width - 50, 365);
    ctx.stroke();

    // ========== CÓDIGO DE GIFT CARD ==========
    if (code) {
        // Fondo sutil para el código
        ctx.fillStyle = hexToRgba(colors.accentColor, 0.1);
        roundRect(ctx, 45, 380, 170, 32, 6);
        ctx.fill();

        ctx.fillStyle = colors.accentColor;
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(code, 55, 402);
    }

    // ========== FECHA DE VENCIMIENTO ==========
    if (expiry) {
        const expiryDate = new Date(expiry + 'T00:00:00');
        const formattedDate = expiryDate.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        ctx.fillStyle = colors.secondaryText;
        ctx.font = '400 12px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Válida hasta: ${formattedDate}`, width - 50, 398);
    }

    // ========== TEXTO FOOTER ==========
    ctx.fillStyle = hexToRgba(colors.secondaryText, 0.6);
    ctx.font = '400 11px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Clínica Cialo  •  www.cialo.cl', width - 50, 435);

    // Términos
    ctx.textAlign = 'left';
    ctx.fillStyle = hexToRgba(colors.secondaryText, 0.5);
    ctx.font = '300 9px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('No canjeable por dinero  •  Sujeta a disponibilidad  •  Un solo uso', 50, 455);
}

/**
 * Dibuja patrones decorativos según el estilo
 */
function drawPattern(ctx, width, height, colors) {
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = colors.accentColor;
    ctx.strokeStyle = colors.accentColor;

    switch (colors.pattern) {
        case 'diamonds':
            // Patrón de diamantes elegantes
            for (let x = 0; x < width; x += 60) {
                for (let y = 0; y < height; y += 60) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(Math.PI / 4);
                    ctx.strokeRect(-10, -10, 20, 20);
                    ctx.restore();
                }
            }
            break;

        case 'waves':
            // Ondas elegantes
            for (let y = 50; y < height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                for (let x = 0; x < width; x += 20) {
                    ctx.quadraticCurveTo(x + 10, y - 15, x + 20, y);
                }
                ctx.stroke();
            }
            break;

        case 'circles':
            // Círculos concéntricos
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.arc(width - 150, height - 120, 50 + i * 40, 0, Math.PI * 2);
                ctx.stroke();
            }
            // Círculos adicionales en la esquina opuesta
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(100, 80, 30 + i * 35, 0, Math.PI * 2);
                ctx.stroke();
            }
            break;

        case 'stars':
            // Estrellas dispersas
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 3 + 1;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            // Algunas estrellas más grandes
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                drawStar(ctx, x, y, 5, 8, 4);
            }
            break;
    }

    ctx.globalAlpha = 1;
}

/**
 * Dibuja una estrella
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

/**
 * Convierte color hex a rgba
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Función auxiliar para dibujar rectángulos redondeados
 */
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Descarga la Gift Card como imagen
 */
function downloadGiftCard(format) {
    const canvas = document.getElementById('giftCardCanvas');
    if (!canvas) return;

    const code = document.getElementById('giftCardCode')?.value || 'GIFTCARD';
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'png' ? 1 : 0.95;

    // Para JPG, necesitamos un fondo blanco primero
    if (format === 'jpg') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Fondo blanco
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Dibujar el canvas original encima
        tempCtx.drawImage(canvas, 0, 0);

        const dataURL = tempCanvas.toDataURL(mimeType, quality);
        downloadDataURL(dataURL, `GiftCard_${code}.jpg`);
    } else {
        const dataURL = canvas.toDataURL(mimeType, quality);
        downloadDataURL(dataURL, `GiftCard_${code}.png`);
    }

    // Mostrar notificación de éxito
    showGiftCardNotification('¡Gift Card descargada correctamente!', 'success');
}

/**
 * Función auxiliar para descargar un data URL
 */
function downloadDataURL(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Copia la Gift Card al portapapeles
 */
async function copyGiftCardToClipboard() {
    const canvas = document.getElementById('giftCardCanvas');
    if (!canvas) return;

    try {
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showGiftCardNotification('¡Imagen copiada al portapapeles!', 'success');
            } catch (err) {
                console.error('Error copiando al portapapeles:', err);
                showGiftCardNotification('No se pudo copiar. Intenta descargar la imagen.', 'error');
            }
        }, 'image/png');
    } catch (err) {
        console.error('Error:', err);
        showGiftCardNotification('Error al copiar. Tu navegador puede no soportar esta función.', 'error');
    }
}

/**
 * Muestra una notificación para Gift Card
 */
function showGiftCardNotification(message, type) {
    // Remover notificación anterior si existe
    const existing = document.getElementById('giftCardNotification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'giftCardNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${type === 'success' ? '#16a34a' : '#dc2626'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        opacity: 0;
        transition: all 0.3s ease;
    `;

    const icon = type === 'success' ? 'check-circle' : 'x-circle';
    notification.innerHTML = `
        <i data-lucide="${icon}" class="w-5 h-5"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    lucide.createIcons({ nodes: [notification] });

    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
