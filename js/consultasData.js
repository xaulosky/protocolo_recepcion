/**
 * Catálogo de Consultas y Evaluaciones - Clínica Cialo
 * Estructura actualizada para gestionar agendamiento de primeras visitas y diagnósticos.
 */

const consultasData = [
    {
        id: 'consulta-urologia',
        categoria: 'Urología',
        emoji: '🩺',
        nombre: 'Consulta Médica – Urología',
        descripcion: 'Evaluación urológica integral centrada en el diagnóstico, prevención y tratamiento de patologías del tracto urinario masculino y femenino, y salud sexual masculina. Aborda desde condiciones benignas hasta procedimientos avanzados en urología funcional y estética genital. Incluye evaluación prostática, manejo de infecciones, disfunción eréctil, enfermedad de Peyronie, cistoscopía flexible, y planificación de cirugías como circuncisión, frenuloplastía, vasectomía y engrosamiento peneano con ácido hialurónico.',
        valor: '$50.000',
        duracion: '30-45 min',
        reembolsable: true,
        profesionales: [
            {
                nombre: 'Dr. Frank Ulloa Carrasco',
                especialidad: 'Urólogo - Cistoscopía y Engrosamiento Peneano',
                disponibilidad: 'Lunes y Jueves desde 19:00 hrs'
            },
            {
                nombre: 'Dr. Guillermo Jesús Contreras',
                especialidad: 'Urólogo - Estética Íntima Masculina',
                disponibilidad: 'Lunes y Miércoles 18:30-21:00 hrs'
            }
        ],
        tratamientosAsociados: [
            'Bioplastía de Engrosamiento Peniano',
            'Circuncisión',
            'Vasectomía',
            'Frenuloplastía',
            'Cistoscopia Diagnóstica',
            'Varicocelectomía'
        ],
        requisitos: 'Traer exámenes previos si los tiene. No requiere preparación especial.',
        politicaCancelacion: 'Cancelar con mínimo 24 horas de anticipación. Reagendar sin costo.'
    },
    {
        id: 'consulta-bariatrica',
        categoria: 'Cirugía Digestiva y Bariátrica',
        emoji: '⚖️',
        nombre: 'Consulta Bariátrica Inicial',
        descripcion: 'Evaluación integral para pacientes con obesidad o enfermedades metabólicas con posible resolución quirúrgica. Incluye historia clínica, análisis de comorbilidades y determinación de riesgo y perfil metabólico. Incorpora Calorimetría Indirecta (Q-NRG Max) para medir gasto energético y análisis de composición corporal de precisión con InBody 970. Se establece un plan preoperatorio multidisciplinario y protocolo de seguimiento postoperatorio.',
        valor: '$40.000',
        duracion: '45-60 min',
        reembolsable: true,
        profesionales: [
            {
                nombre: 'Dr. Andrés Martínez Serrano',
                especialidad: 'Cirujano Digestivo y Bariátrico',
                disponibilidad: 'Viernes 09:00-12:00 hrs (Flexible)'
            }
        ],
        tratamientosAsociados: [
            'Cirugía Bariátrica',
            'Manga Gástrica',
            'Bypass Gástrico',
            'Consulta Pre y Postoperatoria'
        ],
        requisitos: 'Traer exámenes de sangre recientes si los tiene. Idealmente en ayunas para medición InBody.',
        politicaCancelacion: 'Cancelar con mínimo 48 horas de anticipación.'
    },
    {
        id: 'evaluacion-maxilofacial',
        categoria: 'Cirugía Maxilofacial',
        emoji: '🦷',
        nombre: 'Evaluación Maxilofacial',
        descripcion: 'Evaluación integral del esqueleto facial, tejidos blandos y funcionalidad. Diagnóstico de alteraciones estructurales, asimetrías y envejecimiento facial. Incluye análisis clínico y fotogramétrico para planificar intervenciones como Bichectomía, Blefaroplastía, Lifting cervical, Lobuloplastías, Otoplastía y Mentoplastía. También aborda el ámbito funcional: ATM, bruxismo y oclusión.',
        valor: '$50.000',
        duracion: '30-45 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'Dr. Luis Pérez Lagos',
                especialidad: 'Cirujano Maxilofacial',
                disponibilidad: 'Viernes y Sábados (Flexible)'
            }
        ],
        tratamientosAsociados: [
            'Bichectomía',
            'Blefaroplastía Superior',
            'Blefaroplastía Inferior',
            'Lipoaspiración Cervical y Facial',
            'Lifting Cervical',
            'Otoplastía',
            'Mentoplastía',
            'Liplift'
        ],
        requisitos: 'Traer fotos previas si desea comparar resultados.',
        politicaCancelacion: 'Cancelar con mínimo 24 horas. El costo de evaluación puede descontarse en cirugía.'
    },
    {
        id: 'evaluacion-estetica-facial',
        categoria: 'Medicina Estética Facial',
        emoji: '✨',
        nombre: 'Evaluación Estética Facial',
        descripcion: 'Evaluación avanzada del rostro con análisis clínico del envejecimiento y uso de tecnología Evelab Insight con IA. Se diseña un plan terapéutico no quirúrgico integral que puede incluir neuromodulación (Toxina botulínica), volumetría (Rellenos dérmicos), energía y remodelación tisular (Láser CO2, IPL, Láser Erbium, Q-Switched, Morpheus8) y bioestimulación.',
        valor: 'GRATUITA*',
        duracion: '20-30 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'Dr. Nicolás Laucirica',
                especialidad: 'Medicina Estética Facial Avanzada',
                disponibilidad: 'Los Ángeles: L-Ma-J-V 08:30-19:30, Sáb 08:00-14:30 | Concepción: Mi 09:00-19:30'
            },
            {
                nombre: 'Dra. Mariane Kiss Molina',
                especialidad: 'Armonización Orofacial',
                disponibilidad: 'Miércoles y Jueves 10:00-19:00 hrs'
            }
        ],
        tratamientosAsociados: [
            'Toxina Botulínica Tercio Superior',
            'Toxina Botulínica Full Face',
            'Relleno de Labios con Ácido Hialurónico',
            'Relleno de Mentón',
            'Relleno de Pómulos',
            'Sculptra',
            'Radiesse',
            'Hilos Tensores',
            'Polinucleótidos',
            'Morpheus 8 Facial',
            'HIFU Ultraformer III',
            'Láser CO₂ Resurfacing'
        ],
        requisitos: 'Sin maquillaje para mejor evaluación. Traer fotos si desea comparar.',
        politicaCancelacion: '*Gratuita en horarios 09:00, 12:00 y 15:00 (L-V). Otros horarios: $30.000 (se descuenta del tratamiento).'
    },
    {
        id: 'consulta-medica-integral',
        categoria: 'Medicina Estética Corporal',
        emoji: '💉',
        nombre: 'Consulta Médica Estética Integral',
        descripcion: 'Atención médica orientada al diagnóstico integral del envejecimiento cutáneo y armonía corporal. Evaluación completa de piel, tejidos y proporciones. Diseño de planes personalizados con inyectables (Mesoterapia NCTF, Bioestimuladores, Relleno de glúteos con Sculptra o Radiesse) y tecnologías de energía corporal (Morpheus 8, HIFU Ultraformer III, Plexr Plus).',
        valor: '$20.000',
        duracion: '30 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'Dra. Elga Viviana Peña',
                especialidad: 'Médico Cirujano - Medicina Estética Corporal',
                disponibilidad: 'L 12:00-17:00, Mi-J-V 09:00-16:00, Sáb 09:00-15:00'
            }
        ],
        tratamientosAsociados: [
            'Mesoterapia NCTF HA 135',
            'Rejuvenecimiento de Escote',
            'Rejuvenecimiento de Manos',
            'Hiperhidrosis Axilar con Botox',
            'Reafirmación Glúteos con Sculptra',
            'Fibrosis con Enzimas Recombinantes',
            'Morpheus 8 Corporal',
            'HIFU Corporal',
            'Plexr Plus'
        ],
        requisitos: 'Sin preparación especial.',
        politicaCancelacion: 'Cancelar con mínimo 24 horas de anticipación.'
    },
    {
        id: 'consulta-flebologia',
        categoria: 'Flebología / Vascular',
        emoji: '🩸',
        nombre: 'Consulta Médica – Flebología y Cirugía Vascular',
        descripcion: 'Evaluación integral de patologías venosas y arteriales de extremidades. Incluye estudio hemodinámico con Ecografía Doppler (la doctora trae su propio ecógrafo). Planificación de tratamientos para várices y telangiectasias (Escleroterapia, Láser vascular) y manejo ambulatorio de linfedema, pie diabético, trombosis, isquemia periférica y úlceras venosas.',
        valor: '$50.000',
        duracion: '20-30 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'Dra. Francisca González Saldivia',
                especialidad: 'Cirujana Vascular Periférico y Endovascular',
                disponibilidad: 'Sábados AM o días de semana post 17:00 hrs'
            }
        ],
        tratamientosAsociados: [
            'Escleroterapia para Telangiectasias',
            'Escleroterapia de Ejes Safenos',
            'Láser Vascular',
            'Ecografía Doppler Vascular'
        ],
        requisitos: 'Consulta incluye ecografía vascular. Traer exámenes previos si los tiene.',
        politicaCancelacion: 'Sin convenios Fonasa/Isapre. Cancelar con 24 horas de anticipación.'
    },
    {
        id: 'consulta-tricologia',
        categoria: 'Tricología / Capilar',
        emoji: '💇',
        nombre: 'Consulta Médica – Tricología',
        descripcion: 'Evaluación clínica especializada del cuero cabelludo y salud folicular para diagnóstico de alopecias. Incluye análisis de densidad y miniaturización con tricoscopio. Planificación terapéutica integral: Mesoterapia capilar, Plasma Rico en Plaquetas (PRP), Tricopat, Regenera (micrografting - única doctora en Chile), Dutasteride inyectable y evaluación para injerto capilar.',
        valor: '$40.000',
        duracion: '40-45 min',
        reembolsable: true,
        profesionales: [
            {
                nombre: 'Dra. Javiera Paola Araya Medina',
                especialidad: 'Tricóloga y Cirugía Capilar',
                disponibilidad: 'Lunes todo el día, Martes AM ocasional'
            }
        ],
        tratamientosAsociados: [
            'Mesoterapia con Dutasteride',
            'Mesoterapia con Triamcinolona',
            'Plasma Rico en Plaquetas (PRP) Capilar',
            'Regenera - Células Madre Capilares',
            'Injerto Capilar',
            'Injerto de Cejas'
        ],
        requisitos: 'Traer exámenes hormonales si los tiene. Control: $20.000.',
        politicaCancelacion: 'Consulta online disponible ($30.000). Cancelar con 24 horas.'
    },
    {
        id: 'consulta-ginecologia',
        categoria: 'Ginecología',
        emoji: '👩‍⚕️',
        nombre: 'Consulta Médica – Ginecología',
        descripcion: 'Atención integral en ginecología general, perimenopausia y menopausia. Enfoque avanzado en ginecología regenerativa, funcional y estética, evaluando indicaciones para Láser CO2 vaginal (atrofia, laxitud, incontinencia), Ninfoplastia y Lifting vulvar. Manejo de patologías frecuentes como trastornos del ciclo, dolor pélvico, infecciones y planificación reproductiva.',
        valor: 'Consultar',
        duracion: '30-45 min',
        reembolsable: true,
        profesionales: [
            {
                nombre: 'Dra. María Laura Villarroel Reyes',
                especialidad: 'Ginecóloga - Ginecoestética',
                disponibilidad: 'Por confirmar'
            }
        ],
        tratamientosAsociados: [
            'Rejuvenecimiento Vaginal Láser',
            'Ninfoplastia (Labioplastia) Láser',
            'Lifting Vulvar Láser',
            'Blanqueamiento Genital Láser',
            'Biopsia Vulva/Vagina',
            'Manejo Glándula de Bartolino'
        ],
        requisitos: 'Traer exámenes ginecológicos previos si los tiene.',
        politicaCancelacion: 'Cancelar con mínimo 24 horas de anticipación.'
    },
    {
        id: 'consulta-matrona',
        categoria: 'Matronería / Ginecoestética',
        emoji: '🌸',
        nombre: 'Control Ginecológico con Matrona',
        descripcion: 'Atención integral en salud sexual y reproductiva con enfoque preventivo y educativo. Incluye control ginecológico (toma de PAP, VPH, examen de mamas), inserción/retiro de anticonceptivos (Implanon, Jadelle, DIU Mirena/Kyleena/Asertia, T de Cobre), consejería en planificación familiar, climaterio y menopausia. En ginecoestética, realiza Rejuvenecimiento íntimo con Láser CO2.',
        valor: '$40.000',
        duracion: '30-40 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'Stefania Leticia Kuncar Ferrón',
                especialidad: 'Matrona - Ginecoestética y Rejuvenecimiento Íntimo',
                disponibilidad: 'L-J-V-Sáb todo el día, Martes desde 16:00'
            }
        ],
        tratamientosAsociados: [
            'Rejuvenecimiento Íntimo Láser CO2',
            'Control Ginecológico',
            'Inserción de Implante Anticonceptivo',
            'Extracción de Implante Anticonceptivo',
            'Inserción DIU Hormonal',
            'Inserción T de Cobre',
            'Extracción de DIU'
        ],
        requisitos: 'Control ginecológico: sin exámenes incluidos. PAP requiere citofijador.',
        politicaCancelacion: 'Cancelar con 24 horas de anticipación. Controles post-procedimiento incluidos.'
    },
    {
        id: 'consulta-enfermeria',
        categoria: 'Enfermería Estética',
        emoji: '💆',
        nombre: 'Consulta Enfermería Estética',
        descripcion: 'Evaluación clínica especializada para depilación láser y cuidados dermoestéticos. Revisión de fototipo, antecedentes y educación al paciente. Planificación de tratamientos de depilación láser (Soprano Titanium), limpiezas (Hydrafacial) y cuidados faciales, además de coordinación para procedimientos médicos.',
        valor: 'GRATUITA',
        duracion: '15-30 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'EU. María Jesús Contreras Merino',
                especialidad: 'Enfermera - Aparatología Estética',
                disponibilidad: 'Lunes a Sábado (horario por confirmar)'
            }
        ],
        tratamientosAsociados: [
            'Depilación Láser Soprano Titanium',
            'HydraFacial MD',
            'Criolipólisis Clatuu Alpha',
            'HIFU Corporal',
            'Morpheus 8 Corporal'
        ],
        requisitos: 'Sin preparación especial. Para depilación: zona sin rasurar 24 hrs antes.',
        politicaCancelacion: 'Evaluación gratuita. Cancelar con 24 horas de anticipación.'
    },
    {
        id: 'evaluacion-corporal',
        categoria: 'Kinesiología Estética / Corporal',
        emoji: '🏋️',
        nombre: 'Evaluación Corporal Integral',
        descripcion: 'Valoración funcional y estética del contorno corporal. Diagnóstico de adiposidad localizada, flacidez, celulitis y estado del sistema linfático. Definición de protocolos personalizados utilizando tecnologías avanzadas (Scizer, Clatuu Alpha, Exilis Ultra 360, EmBody, Morpheus8 Body, Soprano Titanium) y manejo de postoperatorio de cirugía plástica (drenaje linfático, manejo de fibrosis).',
        valor: '$30.000',
        duracion: '30-45 min',
        reembolsable: false,
        profesionales: [
            {
                nombre: 'Klga. Keren Hapuc Matus Islas',
                especialidad: 'Kinesióloga Dermatofuncional',
                disponibilidad: 'L-V 09:00-14:00 y 16:00-20:00'
            },
            {
                nombre: 'EU. María Jesús Contreras Merino',
                especialidad: 'Enfermera - Aparatología Corporal',
                disponibilidad: 'Lunes a Sábado'
            }
        ],
        tratamientosAsociados: [
            'Exilis Corporal',
            'Morpheus 8 Corporal',
            'EmBody - Tonificación Muscular',
            'Criolipólisis Clatuu Alpha',
            'Scizer - HIFU Corporal',
            'Depilación Láser',
            'Postquirúrgicos y Drenaje Linfático'
        ],
        requisitos: 'Idealmente en ayunas para mediciones. Ropa cómoda.',
        politicaCancelacion: 'Cancelar con 24 horas de anticipación.'
    },
    {
        id: 'evaluacion-nutricional',
        categoria: 'Nutrición',
        emoji: '🥗',
        nombre: 'Evaluación Nutricional Integral',
        descripcion: 'Evaluación nutricional integral con enfoque clínico, deportivo y metabólico. Incluye medición avanzada de composición corporal con InBody 970 y opción de Calorimetría Indirecta (Q-NRG Max) para determinar gasto energético real. Elaboración de pautas de alimentación de alta precisión adaptadas a objetivos de composición corporal, rendimiento deportivo o manejo de patologías metabólicas.',
        valor: '$40.000',
        duracion: '45-60 min',
        reembolsable: true,
        profesionales: [
            {
                nombre: 'Valentina Andrea Verdejo Merino',
                especialidad: 'Nutricionista Clínica Deportiva',
                disponibilidad: 'Mi PM, J AM-PM, V PM, Sáb AM (2 al mes)'
            },
            {
                nombre: 'Walter Sebastián Zaror Maza',
                especialidad: 'Nutricionista Deportivo',
                disponibilidad: 'L-J 10:00-16:00, Sábados AM'
            }
        ],
        tratamientosAsociados: [
            'Consulta Nutricional Integral con InBody 970',
            'Examen InBody 970',
            'Calorimetría Indirecta',
            'Seguimiento Nutricional'
        ],
        requisitos: 'Idealmente en ayunas para InBody. Sin ejercicio intenso 24 hrs antes.',
        politicaCancelacion: 'Cancelar con 24 horas de anticipación. Control cada 4-6 semanas recomendado.'
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
        c.profesionales.some(p =>
            p.nombre.toLowerCase().includes(nombreProfesional.toLowerCase())
        )
    );
}

// Obtener consultas gratuitas
function getConsultasGratuitas() {
    return consultasData.filter(c =>
        c.valor.includes('GRATUITA') || c.valor === '$0'
    );
}

// Obtener consultas reembolsables
function getConsultasReembolsables() {
    return consultasData.filter(c => c.reembolsable === true);
}
