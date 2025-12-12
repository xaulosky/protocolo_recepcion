/**
 * Catálogo de Consultas y Evaluaciones - Clínica Cialo
 * Estructura separada para gestionar agendamiento de primeras visitas y diagnósticos.
 */

const consultasData = [
    {
        id: 'consulta-urologia',
        categoria: 'Urología',
        nombre: 'Consulta Médica – Urología',
        descripcion: 'Evaluación urológica integral centrada en el diagnóstico, prevención y tratamiento de patologías del tracto urinario masculino y femenino, y salud sexual masculina. Aborda desde condiciones benignas hasta procedimientos avanzados en urología funcional y estética genital. Incluye evaluación prostática, manejo de infecciones, disfunción eréctil, enfermedad de Peyronie, cistoscopía flexible, y planificación de cirugías como circuncisión, frenuloplastía, vasectomía y engrosamiento peneano con ácido hialurónico.',
        profesional: 'Dr. Frank Ulloa / Dr. Guillermo Contreras',
        equipo: [
            {
                nombre: 'Dr. Frank Ulloa Carrasco',
                titulo: 'Urólogo',
                enfoque: 'Cistoscopía Flexible y Engrosamiento Peneano'
            },
            {
                nombre: 'Dr. Guillermo Jesús Contreras',
                titulo: 'Urólogo',
                enfoque: 'Estética Íntima, Vasectomía, Frenuloplastía, Cistoscopía y Engrosamiento de Pene'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'consulta-bariatrica',
        categoria: 'Cirugía Digestiva y Bariátrica',
        nombre: 'Consulta Bariátrica Inicial',
        descripcion: 'Evaluación integral para pacientes con obesidad o enfermedades metabólicas con posible resolución quirúrgica. Incluye historia clínica, análisis de comorbilidades y determinación de riesgo y perfil metabólico. Incorpora Calorimetría Indirecta (Q-NRG Max) para medir gasto energético y análisis de composición corporal de precisión con InBody 970. Se establece un plan preoperatorio multidisciplinario y protocolo de seguimiento postoperatorio.',
        profesional: 'Dr. Andrés Martínez Serrano',
        equipo: [
            {
                nombre: 'Dr. Andrés Martínez Serrano',
                titulo: 'Cirujano Digestivo y Bariátrico',
                enfoque: 'Cirugía Metabólica y Obesidad'
            }
        ],
        duracion: '45-60 min',
        requiereEvaluacion: false
    },
    {
        id: 'evaluacion-maxilofacial',
        categoria: 'Cirugía Maxilofacial',
        nombre: 'Evaluación Maxilofacial',
        descripcion: 'Evaluación integral del esqueleto facial, tejidos blandos y funcionalidad. Diagnóstico de alteraciones estructurales, asimetrías y envejecimiento facial. Incluye análisis clínico y fotogramétrico para planificar intervenciones como Bichectomía, Blefaroplastía, Lifting cervical, Lobuloplastías, Otoplastía y Mentoplastía. También aborda el ámbito funcional: ATM, bruxismo y oclusión.',
        profesional: 'Dr. Luis Pérez Lagos',
        equipo: [
            {
                nombre: 'Dr. Luis Pérez Lagos',
                titulo: 'Cirujano Maxilofacial',
                enfoque: 'Cirugía Facial y Funcional'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'evaluacion-estetica-facial',
        categoria: 'Medicina Estética Facial',
        nombre: 'Evaluación Estética Facial',
        descripcion: 'Evaluación avanzada del rostro con análisis clínico del envejecimiento y uso de tecnología Evelab Insight con IA. Se diseña un plan terapéutico no quirúrgico integral que puede incluir neuromodulación (Toxina botulínica), volumetría (Rellenos dérmicos), energía y remodelación tisular (Láser CO2, IPL, Láser Erbium, Q-Switched, Morpheus8) y bioestimulación.',
        profesional: 'Dr. Nicolás Laucirica / Dra. Mariane Kiss',
        equipo: [
            {
                nombre: 'Dr. Nicolás Laucirica',
                titulo: 'Medicina Estética Facial',
                enfoque: 'Armonización Facial Avanzada'
            },
            {
                nombre: 'Dra. Mariane Soledad Kiss Molina',
                titulo: 'Medicina Estética Facial',
                enfoque: 'Rejuvenecimiento Facial'
            }
        ],
        duracion: '30 min',
        valorDesde: 0,
        valorHasta: 30000,
        requiereEvaluacion: false,
        notas: 'Primera evaluación GRATUITA en horarios 09:00, 12:00 y 15:00 (L-V). Otros horarios: $30.000.'
    },
    {
        id: 'evaluacion-laucirica-losangeles',
        categoria: 'Medicina Estética Facial',
        nombre: 'Evaluación Diagnóstica en Los Ángeles',
        descripcion: 'Evaluación clínica completa por el Dr. Nicolás Laucirica para analizar necesidades de cada paciente. Se revisa historia clínica, fototipo, anatomía, calidad de piel, objetivos estéticos, tecnologías indicadas y protocolos personalizados. Esencial para determinar un plan seguro y efectivo.',
        profesional: 'Dr. Nicolás Laucirica',
        equipo: [
            {
                nombre: 'Dr. Nicolás Laucirica',
                titulo: 'Cirujano Dentista - Estética Facial',
                enfoque: 'Armonización Facial Avanzada'
            }
        ],
        duracion: '20-30 min',
        valorDesde: 0,
        valorHasta: 30000,
        requiereEvaluacion: false,
        notas: 'Primera evaluación GRATUITA en horarios 09:00, 12:00 y 15:00 (L-V). Otros horarios: $30.000. Se paga vía transferencia al reservar.'
    },
    {
        id: 'evaluacion-laucirica-concepcion',
        categoria: 'Medicina Estética Facial',
        nombre: 'Evaluación Diagnóstica en Concepción',
        descripcion: 'Evaluación clínica completa por el Dr. Nicolás Laucirica para analizar necesidades de cada paciente. Se revisa historia clínica, fototipo, anatomía, calidad de piel, objetivos estéticos, tecnologías indicadas y protocolos personalizados. Esencial para determinar un plan seguro y efectivo.',
        profesional: 'Dr. Nicolás Laucirica',
        equipo: [
            {
                nombre: 'Dr. Nicolás Laucirica',
                titulo: 'Cirujano Dentista - Estética Facial',
                enfoque: 'Armonización Facial Avanzada'
            }
        ],
        duracion: '20-30 min',
        valorDesde: 30000,
        valorHasta: null,
        requiereEvaluacion: false,
        notas: '$30.000 vía transferencia al reservar. Este abono se descuenta posteriormente del presupuesto del tratamiento.'
    },
    {
        id: 'consulta-medica-integral',
        categoria: 'Medicina General / Estética',
        nombre: 'Consulta Médica Integral y Estética',
        descripcion: 'Atención médica orientada al diagnóstico integral del envejecimiento cutáneo y armonía facial/corporal. Evaluación completa de piel, tejidos y proporciones. Diseño de planes personalizados con inyectables (Mesoterapia NCTF, Bioestimuladores, Toxina botulínica, Relleno de glúteos) y tecnologías de energía (Morpheus 8, HIFU Ultraformer III).',
        profesional: 'Dra. Elga Viviana Peña de Falcón',
        equipo: [
            {
                nombre: 'Dra. Elga Viviana Peña de Falcón',
                titulo: 'Médico Cirujano',
                enfoque: 'Estética Integral Facial y Corporal'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'consulta-flebologia',
        categoria: 'Flebología / Vascular',
        nombre: 'Consulta Médica – Flebología y Cirugía Vascular',
        descripcion: 'Evaluación integral de patologías venosas y arteriales de extremidades. Incluye estudio hemodinámico con Ecografía Doppler. Planificación de tratamientos para várices y telangiectasias (Escleroterapia, Láser vascular) y manejo ambulatorio de linfedema, pie diabético, trombosis, isquemia periférica y úlceras venosas.',
        profesional: 'Dra. Francisca González',
        equipo: [
            {
                nombre: 'Dra. Francisca González',
                titulo: 'Flebóloga / Cirujana Vascular',
                enfoque: 'Patología Venosa y Eco Doppler'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'consulta-tricologia',
        categoria: 'Tricología / Capilar',
        nombre: 'Consulta Médica – Tricología',
        descripcion: 'Evaluación clínica especializada del cuero cabelludo y salud folicular para diagnóstico de alopecias. Incluye análisis de densidad y miniaturización. Planificación terapéutica integral: Mesoterapia capilar, Plasma Rico en Plaquetas (PRP), Tricopat, Regenera (micrografting), Dutasteride inyectable y evaluación para injerto capilar.',
        profesional: 'Dra. Javiera Paola Araya Medina',
        equipo: [
            {
                nombre: 'Dra. Javiera Paola Araya Medina',
                titulo: 'Tricóloga',
                enfoque: 'Restauración Capilar y Alopecias'
            }
        ],
        duracion: '45 min',
        requiereEvaluacion: false
    },
    {
        id: 'consulta-ginecologia',
        categoria: 'Ginecología',
        nombre: 'Consulta Médica – Ginecología',
        descripcion: 'Atención integral en ginecología general, perimenopausia y menopausia. Enfoque avanzado en ginecología regenerativa, funcional y estética, evaluando indicaciones para Láser CO2 vaginal (atrofia, laxitud, incontinencia), Ninfoplastia y Lifting vulvar. Manejo de patologías frecuentes como trastornos del ciclo, dolor pélvico, infecciones y planificación reproductiva.',
        profesional: 'Dra. María Laura Villarroel Reyes',
        equipo: [
            {
                nombre: 'Dra. María Laura Villarroel Reyes',
                titulo: 'Ginecóloga',
                enfoque: 'Ginecología Regenerativa y Estética'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'consulta-matrona',
        categoria: 'Matronería',
        nombre: 'Consulta Matrona',
        descripcion: 'Atención integral en salud sexual y reproductiva con enfoque preventivo y educativo. Incluye control ginecológico básico, inserción/retiro de anticonceptivos (Implanon, DIU), toma de PAP, manejo de infecciones y consejería en planificación familiar. En ginecoestética, realiza procedimientos no quirúrgicos como Rejuvenecimiento íntimo con Láser CO2.',
        profesional: 'Stefania Kuncar',
        equipo: [
            {
                nombre: 'Stefania Kuncar',
                titulo: 'Matrona',
                enfoque: 'Salud Sexual y Ginecoestética No Quirúrgica'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'consulta-enfermeria',
        categoria: 'Enfermería Estética',
        nombre: 'Consulta Enfermería Estética Integral',
        descripcion: 'Evaluación clínica especializada para depilación láser y cuidados dermoestéticos. Revisión de fototipo, antecedentes y educación al paciente. Planificación de tratamientos de depilación láser (Soprano Titanium), limpiezas (Hydrafacial) y peelings láser (Hollywood Peel), además de coordinación para procedimientos médicos.',
        profesional: 'EU. María Jesús Contreras Merino',
        equipo: [
            {
                nombre: 'EU. María Jesús Contreras Merino',
                titulo: 'Enfermera',
                enfoque: 'Láser y Dermoestética'
            }
        ],
        duracion: '30 min',
        requiereEvaluacion: false
    },
    {
        id: 'evaluacion-corporal',
        categoria: 'Kinesiología Estética / Corporal',
        nombre: 'Evaluación Corporal Integral',
        descripcion: 'Valoración funcional y estética del contorno corporal. Diagnóstico de adiposidad localizada, flacidez, celulitis y estado del sistema linfático. Definición de protocolos personalizados utilizando tecnologías avanzadas (Scizer, Exilis Ultra 360, EmTone, Morpheus8 Body, Soprano Titanium) y manejo de postoperatorio de cirugía plástica (drenaje linfático, manejo de fibrosis).',
        profesional: 'Klga. Keren Matus / EU. María Jesús Contreras',
        equipo: [
            {
                nombre: 'Klga. Keren Matus',
                titulo: 'Kinesióloga',
                enfoque: 'Dermatofuncional y Postquirúrgicos'
            },
            {
                nombre: 'EU. María Jesús Contreras Merino',
                titulo: 'Enfermera',
                enfoque: 'Aparatología Corporal'
            }
        ],
        duracion: '30-45 min',
        requiereEvaluacion: false
    },
    {
        id: 'evaluacion-nutricional',
        categoria: 'Nutrición',
        nombre: 'Evaluación Nutricional Inicial',
        descripcion: 'Evaluación nutricional integral con enfoque clínico, deportivo y metabólico. Incluye medición avanzada de composición corporal con InBody 970 y opción de Calorimetría Indirecta (Q-NRG Max) para determinar gasto energético real. Elaboración de pautas de alimentación de alta precisión adaptadas a objetivos de composición corporal, rendimiento deportivo o manejo de patologías metabólicas.',
        profesional: 'Valentina Verdejo / Walter Zaror',
        equipo: [
            {
                nombre: 'Valentina Andrea Verdejo Merino',
                titulo: 'Nutricionista',
                enfoque: 'Clínica Deportiva'
            },
            {
                nombre: 'Walter Sebastián Zaror Maza',
                titulo: 'Nutricionista',
                enfoque: 'Deportivo'
            }
        ],
        duracion: '45-60 min',
        requiereEvaluacion: false
    }
];

/**
 * Funciones auxiliares para consultas
 */

// Obtener todas las categorías de consultas
function getCategoriasConsultas() {
    const categorias = [...new Set(consultasData.map(c => c.categoria))];
    return categorias.sort();
}

// Buscar consulta por ID
function getConsultaById(id) {
    return consultasData.find(c => c.id === id);
}

// Filtrar consultas por categoría
function getConsultasByCategoria(categoria) {
    return consultasData.filter(c => c.categoria === categoria);
}

// Buscar consultas por profesional
function getConsultasByProfesional(nombreProfesional) {
    return consultasData.filter(c =>
        c.profesional.toLowerCase().includes(nombreProfesional.toLowerCase())
    );
}
