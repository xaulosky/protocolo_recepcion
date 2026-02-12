/**
 * Tabla Relacional: Tratamientos - Profesionales
 * Conecta tratamientos con los profesionales que los realizan
 * Permite relación muchos-a-muchos (un tratamiento puede tener varios profesionales)
 */

const tratamientosProfesionalesData = [
    // ==================== DR. NICOLÁS LAUCIRICA - Medicina Estética Facial ====================
    { tratamientoId: 'toxina-tercio-superior', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'toxina-bruxismo', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'toxina-sonrisa-gingival', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'toxina-full-face', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'toxina-espasmos-paralisis', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'toxina-botulinica-1-zona', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'toxina-tercio-superior-facial', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'rinomodelacion', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'labios-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'menton-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'pomulos-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'fosa-temporal-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'ojeras-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'surco-nasogeniano-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'definicion-mandibular', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'bichectomia-laucirica', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'armonizacion-facial', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'sculptra', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'radiesse', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'ellanse', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'adn-salmon', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'adn-salmon-fullface', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'hilos-tensores', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'exosomas', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'hydrafacial', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'hollywood-peel', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'coolpeel-exosomas', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-melasma', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-pigmentaciones', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-flacidez-facial', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-rosacea', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-cicatrices-acne', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-co2-resurfacing', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'evaluacion-laucirica-losangeles', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'evaluacion-laucirica-concepcion', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'morpheus8-facial', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-resurfx', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'hialuronidasa', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'retiro-acrocordones-laser', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-lentigos-pecas', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'mesoterapia-vitaminas', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'laser-telangiectasias', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'hifu-ultraformer', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'cicatrices-faciales', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'relleno-peribucal-ah', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'xantelasmas-laser', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'blefaroplastia-laser', profesionalId: 'nicolas-laucirica' },
    { tratamientoId: 'hydrafacial', profesionalId: 'nicolas-laucirica' },

    // ==================== DRA. MARIANE KISS - Estética Facial ====================
    { tratamientoId: 'toxina-tercio-superior', profesionalId: 'mariane-kiss' },
    { tratamientoId: 'toxina-full-face', profesionalId: 'mariane-kiss' },
    { tratamientoId: 'labios-ah', profesionalId: 'mariane-kiss' },
    { tratamientoId: 'sculptra', profesionalId: 'mariane-kiss' },
    { tratamientoId: 'adn-salmon', profesionalId: 'mariane-kiss' },
    { tratamientoId: 'adn-salmon-fullface', profesionalId: 'mariane-kiss' },
    { tratamientoId: 'hilos-tensores', profesionalId: 'mariane-kiss' },

    // ==================== KEREN MATUS - Kinesiología Dermatofuncional ====================
    { tratamientoId: 'exilis-facial', profesionalId: 'keren-matus' },
    { tratamientoId: 'exilis-corporal', profesionalId: 'keren-matus' },
    { tratamientoId: 'morpheus8-corporal-keren', profesionalId: 'keren-matus' },
    { tratamientoId: 'clatuu-alpha', profesionalId: 'keren-matus' },
    { tratamientoId: 'embody-corporal-keren', profesionalId: 'keren-matus' },
    { tratamientoId: 'depilacion-laser', profesionalId: 'keren-matus' },
    { tratamientoId: 'hydrafacial', profesionalId: 'keren-matus' },
    { tratamientoId: 'hifu-facial-keren', profesionalId: 'keren-matus' },
    { tratamientoId: 'postquirurgicos-keren', profesionalId: 'keren-matus' },

    // ==================== MARÍA JESÚS CONTRERAS - Aparatología Estética ====================
    { tratamientoId: 'depilacion-laser', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'clatuu-alpha', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'scizer', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'hifu-corporal', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'morpheus8-corporal', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'exilis-ultra', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'hydrafacial', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'embody', profesionalId: 'maria-jesus-contreras' },

    // ==================== DRA. JAVIERA ARAYA - Tricología ====================
    { tratamientoId: 'consulta-tricologia', profesionalId: 'javiera-araya' },
    { tratamientoId: 'mesoterapia-dutasteride', profesionalId: 'javiera-araya' },
    { tratamientoId: 'mesoterapia-prp-capilar', profesionalId: 'javiera-araya' },
    { tratamientoId: 'regenera', profesionalId: 'javiera-araya' },
    { tratamientoId: 'implante-capilar', profesionalId: 'javiera-araya' },
    { tratamientoId: 'consulta-capilar', profesionalId: 'javiera-araya' },
    { tratamientoId: 'mesoterapia-capilar', profesionalId: 'javiera-araya' },
    { tratamientoId: 'prp-capilar', profesionalId: 'javiera-araya' },

    // ==================== DR. GUILLERMO CONTRERAS - Urología ====================
    { tratamientoId: 'bioplastia-pene', profesionalId: 'guillermo-contreras' },
    { tratamientoId: 'circuncision', profesionalId: 'guillermo-contreras' },
    { tratamientoId: 'vasectomia', profesionalId: 'guillermo-contreras' },
    { tratamientoId: 'frenuloplastia', profesionalId: 'guillermo-contreras' },

    // ==================== DR. FRANK ULLOA - Urología ====================
    { tratamientoId: 'bioplastia-pene', profesionalId: 'frank-ulloa' },  // Compartido con Dr. Contreras

    // ==================== STEFANIA KUNCAR - Ginecoestética ====================
    { tratamientoId: 'rejuvenecimiento-vaginal-laser', profesionalId: 'stefania-kuncar' },
    { tratamientoId: 'insercion-diu', profesionalId: 'stefania-kuncar' },
    { tratamientoId: 'insercion-implante', profesionalId: 'stefania-kuncar' },
    { tratamientoId: 'laser-co2-vaginal', profesionalId: 'stefania-kuncar' },
    { tratamientoId: 'consulta-matrona', profesionalId: 'stefania-kuncar' },
    { tratamientoId: 'peeling-intimo', profesionalId: 'stefania-kuncar' },

    // ==================== DRA. MARÍA LAURA VILLARROEL - Ginecoestética ====================
    { tratamientoId: 'prp-dermapen-vulvar', profesionalId: 'maria-villarroel' },
    { tratamientoId: 'labioplastia-laser', profesionalId: 'maria-villarroel' },

    // ==================== DR. LUIS PÉREZ - Cirugía Maxilofacial ====================
    { tratamientoId: 'bichectomia', profesionalId: 'luis-perez' },
    { tratamientoId: 'blefaroplastia-quirurgica', profesionalId: 'luis-perez' },
    { tratamientoId: 'otoplastia', profesionalId: 'luis-perez' },
    { tratamientoId: 'lipo-papada', profesionalId: 'luis-perez' },
    { tratamientoId: 'lobuloplastia', profesionalId: 'luis-perez' },

    // ==================== DRA. FRANCISCA GONZÁLEZ - Cirugía Vascular ====================
    { tratamientoId: 'consulta-vascular', profesionalId: 'francisca-gonzalez' },
    { tratamientoId: 'escleroterapia-pequenas', profesionalId: 'francisca-gonzalez' },
    { tratamientoId: 'escleroterapia-grandes', profesionalId: 'francisca-gonzalez' },

    // ==================== VALENTINA VERDEJO - Nutrición ====================
    { tratamientoId: 'consulta-nutricional', profesionalId: 'valentina-verdejo' },
    { tratamientoId: 'examen-inbody', profesionalId: 'valentina-verdejo' },
    { tratamientoId: 'calorimetria-indirecta', profesionalId: 'valentina-verdejo' },

    // ==================== WALTER ZAROR - Nutrición ====================
    { tratamientoId: 'consulta-nutricional', profesionalId: 'walter-zaror' },
    { tratamientoId: 'examen-inbody', profesionalId: 'walter-zaror' },
    { tratamientoId: 'calorimetria-indirecta', profesionalId: 'walter-zaror' },

    // ==================== DRA. ELGA PEÑA - Medicina Estética ====================
    { tratamientoId: 'ah-gluteo-100ml', profesionalId: 'elga-pena' },
    { tratamientoId: 'ah-gluteo-200ml', profesionalId: 'elga-pena' },

    // ==================== DRA. MARÍA VILLARROEL - Ginecoestética ====================
    { tratamientoId: 'consulta-ginecologica', profesionalId: 'maria-villarroel' },
    { tratamientoId: 'laser-co2-vaginal', profesionalId: 'maria-villarroel' },

    // ==================== DRA. JAVIERA ARAYA - Tricología (adicionales) ====================
    // Injertos FUE Corto Zafiro
    { tratamientoId: 'injerto-1000uf-zafiro', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-1500uf-zafiro', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-2000uf-zafiro', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-2500uf-zafiro', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-3000uf-zafiro', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-3500uf-zafiro', profesionalId: 'javiera-araya' },
    // Injertos FUE Corto Implanters
    { tratamientoId: 'injerto-1000uf-implanters', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-1500uf-implanters', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-2000uf-implanters', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-2500uf-implanters', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-3000uf-implanters', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-3500uf-implanters', profesionalId: 'javiera-araya' },
    // Injertos FUE Pelo Largo
    { tratamientoId: 'injerto-1000uf-pelo-largo', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-1500uf-pelo-largo', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-2000uf-pelo-largo', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-2500uf-pelo-largo', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-3000uf-pelo-largo', profesionalId: 'javiera-araya' },
    { tratamientoId: 'injerto-3500uf-pelo-largo', profesionalId: 'javiera-araya' },
    { tratamientoId: 'regenera-capilar', profesionalId: 'javiera-araya' },

    // ==================== MARÍA JESÚS CONTRERAS - Aparatología (adicionales) ====================
    { tratamientoId: 'consulta-corporal', profesionalId: 'maria-jesus-contreras' },
    { tratamientoId: 'criolipolis-clatuu', profesionalId: 'maria-jesus-contreras' },



    // ==================== DR. GUILLERMO CONTRERAS - Urología (adicionales) ====================
    { tratamientoId: 'consulta-urologica', profesionalId: 'guillermo-contreras' },

    // ==================== SUSANA PEREIRA - Cosmetóloga ====================
    { tratamientoId: 'depilacion-laser', profesionalId: 'susana-pereira' }
];

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Obtiene todos los tratamientos de un profesional
 * @param {string} profesionalId - ID del profesional
 * @returns {Array} Lista de tratamientos del profesional
 */
function getTratamientosByProfesional(profesionalId) {
    const tratamientoIds = tratamientosProfesionalesData
        .filter(rel => rel.profesionalId === profesionalId)
        .map(rel => rel.tratamientoId);

    return tratamientosData.filter(t => tratamientoIds.includes(t.id));
}

/**
 * Obtiene todos los profesionales que realizan un tratamiento
 * @param {string} tratamientoId - ID del tratamiento
 * @returns {Array} Lista de profesionales que realizan el tratamiento
 */
function getProfesionalesByTratamiento(tratamientoId) {
    const profesionalIds = tratamientosProfesionalesData
        .filter(rel => rel.tratamientoId === tratamientoId)
        .map(rel => rel.profesionalId);

    return profesionalesData.filter(p => profesionalIds.includes(p.id));
}

/**
 * Verifica si un profesional realiza un tratamiento específico
 * @param {string} profesionalId - ID del profesional
 * @param {string} tratamientoId - ID del tratamiento
 * @returns {boolean}
 */
function profesionalRealizaTratamiento(profesionalId, tratamientoId) {
    return tratamientosProfesionalesData.some(
        rel => rel.profesionalId === profesionalId && rel.tratamientoId === tratamientoId
    );
}

/**
 * Obtiene estadísticas de la relación
 * @returns {Object} Estadísticas
 */
function getRelacionEstadisticas() {
    const profesionales = [...new Set(tratamientosProfesionalesData.map(r => r.profesionalId))];
    const tratamientos = [...new Set(tratamientosProfesionalesData.map(r => r.tratamientoId))];

    return {
        totalRelaciones: tratamientosProfesionalesData.length,
        totalProfesionalesConTratamientos: profesionales.length,
        totalTratamientosAsignados: tratamientos.length,
        relacionesPorProfesional: profesionales.map(p => ({
            profesionalId: p,
            cantidad: tratamientosProfesionalesData.filter(r => r.profesionalId === p).length
        }))
    };
}
