/**
 * faqData.js
 * Base de conocimiento para preguntas frecuentes
 * Categorías: General, Facial, Corporal, Cirugía, Protocolos
 */

const faqData = [
    // ==================== GENERAL / ADMINISTRATIVO ====================
    {
        id: 'gen-001',
        categoria: 'General',
        pregunta: '¿Cuáles son los métodos de pago aceptados?',
        respuesta: 'Aceptamos efectivo, tarjetas de débito y crédito (rotativo y cuotas), y transferencia bancaria. Para cirugías, las opciones pueden variar y se coordinan con administración.',
        tags: ['pago', 'tarjeta', 'transferencia', 'cuotas']
    },
    {
        id: 'gen-002',
        categoria: 'General',
        pregunta: '¿Tienen estacionamiento?',
        respuesta: 'Sí, contamos con estacionamiento para pacientes. El ingreso es por la calle principal. Solicitar ticket de validación en recepción al retirarse.',
        tags: ['estacionamiento', 'auto', 'llegada']
    },
    {
        id: 'gen-003',
        categoria: 'General',
        pregunta: '¿Cómo agendo una hora?',
        respuesta: 'Puedes agendar directamente vía WhatsApp, por teléfono o a través de nuestra página web. Para tratamientos específicos o cirugías, recomendamos una evaluación previa.',
        tags: ['agendar', 'hora', 'cita', 'reserva']
    },
    {
        id: 'gen-004',
        categoria: 'General',
        pregunta: '¿Realizan evaluaciones gratuitas?',
        respuesta: 'Sí, la mayoría de nuestros tratamientos estéticos (Botox, Ácido Hialurónico, Láser) incluyen una evaluación gratuita para determinar el plan de tratamiento adecuado. Las consultas médicas de especialidad (ej. Nutrición) tienen costo.',
        tags: ['evaluacion', 'costo', 'gratis', 'consulta']
    },

    // ==================== FACIAL (BOTOX / AH) ====================
    {
        id: 'fac-001',
        categoria: 'Facial',
        pregunta: '¿Cuánto dura el efecto de la Toxina Botulínica (Botox)?',
        respuesta: 'El efecto dura entre 4 y 6 meses, dependiendo del metabolismo de cada paciente. Se recomienda repetir el tratamiento antes de que se pierda el efecto por completo para mantener los resultados.',
        tags: ['botox', 'duracion', 'toxina', 'tiempo']
    },
    {
        id: 'fac-002',
        categoria: 'Facial',
        pregunta: '¿Qué cuidados debo tener después de aplicarme Botox?',
        respuesta: 'No acostarse ni agachar la cabeza por 4 horas. No realizar ejercicio físico intenso por 24 horas. No masajear la zona tratada. Evitar calor extremo (sauna) el mismo día.',
        tags: ['botox', 'cuidados', 'post', 'ejercicio']
    },
    {
        id: 'fac-003',
        categoria: 'Facial',
        pregunta: '¿El Ácido Hialurónico en labios duele?',
        respuesta: 'El procedimiento es tolerable y se utiliza anestesia local (interoral o tópica) para minimizar las molestias. Puede haber una leve inflamación los primeros días.',
        tags: ['labios', 'dolor', 'acido hialuronico', 'hinchazon']
    },
    {
        id: 'fac-004',
        categoria: 'Facial',
        pregunta: '¿Puedo tomar sol después de un tratamiento facial?',
        respuesta: 'Se recomienda evitar la exposición solar directa, especialmente si hay hematomas (moretones), para evitar manchas. Usar protector solar factor 50+ es obligatorio.',
        tags: ['sol', 'playa', 'verano', 'manchas']
    },

    // ==================== CORPORAL / LÁSER ====================
    {
        id: 'corp-001',
        categoria: 'Corporal',
        pregunta: '¿Cuántas sesiones necesito de Depilación Láser?',
        respuesta: 'Generalmente se recomiendan pack de 6 sesiones para cuerpo y 8 para rostro. Sin embargo, depende del tipo de vello y piel. Se evalúa progreso sesión a sesión.',
        tags: ['laser', 'sesiones', 'cantidad', 'depilacion']
    },
    {
        id: 'corp-002',
        categoria: 'Corporal',
        pregunta: '¿Debo rasurarme antes del láser?',
        respuesta: 'Sí, debes venir rasurada de la noche anterior o el mismo día. NO usar cera ni pinzas, ya que el láser necesita la raíz del pelo para actuar.',
        tags: ['laser', 'rasurado', 'cera', 'preparacion']
    },
    {
        id: 'corp-003',
        categoria: 'Corporal',
        pregunta: '¿La criolipólisis sirve para bajar de peso?',
        respuesta: 'No es un tratamiento para bajar de peso, sino para reducir grasa localizada (modelado corporal) que no se va con dieta ni ejercicio. Es ideal para "rollitos" específicos.',
        tags: ['criolipolisis', 'peso', 'grasa', 'adelgazar']
    },

    // ==================== CIRUGÍA ====================
    {
        id: 'cir-001',
        categoria: 'Cirugía',
        pregunta: '¿Cuánto tiempo de licencia necesito para una Blefaroplastía?',
        respuesta: 'Generalmente se recomiendan 3 a 5 días de reposo relativo. Los puntos se retiran a los 5-7 días. La inflamación baja considerablemente a la semana.',
        tags: ['blefaroplastia', 'licencia', 'reposo', 'recuperacion']
    },
    {
        id: 'cir-002',
        categoria: 'Cirugía',
        pregunta: '¿Queda cicatriz visible después de una Lipoescultura?',
        respuesta: 'Las incisiones son mínimas (3-4 mm) y se ubican en zonas estratégicas (pliegues naturales o zonas cubiertas por ropa interior), por lo que las cicatrices son prácticamente imperceptibles con el tiempo.',
        tags: ['lipo', 'cicatriz', 'marcas', 'lipoescultura']
    },
    {
        id: 'cir-003',
        categoria: 'Cirugía',
        pregunta: '¿Necesito pase cardiológico para operarme?',
        respuesta: 'Sí, para cualquier cirugía mayor o con sedación/anestesia general, solicitamos exámenes preoperatorios completos y evaluación cardiológica (pase quirúrgico) para garantizar tu seguridad.',
        tags: ['pase', 'cardiologo', 'examenes', 'seguridad']
    }
];

// Función helper para buscar preguntas
function searchFAQ(query) {
    if (!query) return faqData;
    const lowerQuery = query.toLowerCase();
    return faqData.filter(item =>
        item.pregunta.toLowerCase().includes(lowerQuery) ||
        item.respuesta.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.includes(lowerQuery))
    );
}

// Función helper para obtener categorías únicas
function getFAQCategories() {
    return ['Todas', ...new Set(faqData.map(item => item.categoria))];
}
