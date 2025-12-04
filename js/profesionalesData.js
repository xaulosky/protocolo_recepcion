/**
 * Profesionales Data
 * Información de profesionales de Clínica Cialo
 */

const profesionalesData = [
    {
        id: 'andres-martinez',
        nombreCompleto: 'Andrés Martínez Serrano',
        especialidad: 'Cirujano Digestivo y Bariátrico',
        rut: '22.523.174-5',
        telefono: '+56 9 8700 5869',
        email: 'andres.martinez.s@gmail.com',
        disponibilidad: {
            dias: ['Viernes'],
            horario: '09:00 a 12:00 horas',
            frecuencia: 'Semanal / Mensual (Flexible/Adaptable)',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                'Consulta Bariátricos',
                'Consulta Pre y Postoperatoria'
            ],
            duracionPromedio: '15 a 30 minutos aprox. por paciente',
            esquemaControles: 'A la semana de cirugía, y luego a los 1, 3, 6, 9 y 12 meses.'
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: ['Guantes de Vinilo']
        }
    },
    {
        id: 'francisca-gonzalez',
        nombreCompleto: 'Francisca González Saldivia',
        especialidad: 'Cirujana Vascular Periférico y Endovascular',
        rut: '16.507.703-2',
        telefono: '+56 9 5424 9145',
        email: 'fcagonza@gmail.com',
        formacion: {
            pregrado: 'Médico (UACH)',
            especialidad: 'Cirugía General (Universidad de Chile)',
            subespecialidad: 'Cirugía Vascular (Universidad de Chile)',
            membresias: ['Sociedad Chilena de Cirugía', 'Sociedad de Cirugía Vascular'],
            registro: 'Inscrita en la Superintendencia de Salud'
        },
        disponibilidad: {
            dias: ['Sábados (AM)', 'Días de semana (después de las 17:00 hrs)', 'Viernes (después de las 16:00 hrs)'],
            horario: 'Sábados AM / Semana post 17:00 hrs / Viernes post 16:00 hrs',
            frecuencia: '2 veces al mes (inicialmente), con posibilidad de pasar a semanal',
            flexibilidad: 'No (reside en Angol y tiene hijos pequeños)'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Consulta Médica (Vascular)',
                    duracion: '20-30 min',
                    valor: '$50.000',
                    notas: 'Incluye ecografía vascular. Sin convenios Fonasa/Isapre. Requiere sistema para licencia médica. Trae su propio ecógrafo. Requiere Gel.'
                },
                {
                    nombre: 'Escleroterapia (Telangiectasias)',
                    duracion: '30 min',
                    valor: '$80.000',
                    insumos: 'Polidocanol, jeringas tuberculina/insulina',
                    notas: 'Paciente costea medias de compresión.'
                },
                {
                    nombre: 'Láser',
                    duracion: '30 min',
                    equipo: 'Láser'
                },
                {
                    nombre: 'Escleroterapia Ejes Safenos (Várices)',
                    duracion: '60 min',
                    espacio: 'Pabellón de cirugía menor',
                    valor: '$400.000 - $500.000 (aprox)',
                    notas: 'Requiere tiempo extra de limpieza entre sesiones. Requiere tiempo adicional de recuperación.'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS',
            insumosRequeridos: ['Gel para ecógrafo', 'Polidocanol', 'Jeringas tuberculina/insulina'],
            espacioEspecial: 'Pabellón de cirugía menor (para escleroterapia de ejes safenos)',
            notasEspeciales: 'Requiere tiempo extra de limpieza entre sesiones en pabellón. Trae su propio ecógrafo.'
        },
        pendientesAdministrativos: [
            'Trabajar en conjunto un modelo de Consentimiento Informado',
            'Crear hoja estandarizada de indicaciones y cuidados post-procedimiento'
        ]
    },
    {
        id: 'stefania-kuncar',
        nombreCompleto: 'Stefania Leticia Kuncar Ferrón',
        especialidad: 'Matrona, Especialista en Ginecoestética y Rejuvenecimiento Íntimo',
        rut: '20.161.174-1',
        telefono: '+56 9 6306 6212',
        email: 'stefaniakuncar@gmail.com',
        formacion: {
            pregrado: 'Matrona',
            especialidad: 'Ginecoestética y Rejuvenecimiento Íntimo',
            certificaciones: [
                'Técnico operador de Láser CO2',
                'Especialización en Ginecoestética',
                'Certificada en inserción/extracción de dispositivos intrauterinos (Mirena, Asertia, Kyleena)',
                'Certificada en inserción/extracción de implantes (Implanon, Jadelle)'
            ]
        },
        disponibilidad: {
            dias: ['Lunes (todo el día)', 'Jueves (todo el día)', 'Viernes (todo el día)', 'Sábado (todo el día)', 'Martes (desde 16:00 hrs)'],
            horario: 'Lunes, Jueves, Viernes y Sábado: Todo el día / Martes: Desde 16:00 hrs',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Rejuvenecimiento Íntimo Láser CO2',
                    duracion: '40 min',
                    equipo: 'Láser CO2 Tetra Pro (requiere traslado previo al box)',
                    notas: 'Protocolo: 3 sesiones iniciales (mensuales) + mantención anual'
                },
                {
                    nombre: 'Control Ginecológico (PAP, VPH, mamas, consejería)',
                    duracion: '30-40 min',
                    valor: '$40.000',
                    notas: 'Sin exámenes incluidos'
                },
                {
                    nombre: 'Implantes Anticonceptivos - Inserción',
                    duracion: '20-30 min',
                    valor: '$50.000',
                    notas: 'Sin implante incluido. Implantes: Implanon, Jadelle'
                },
                {
                    nombre: 'Implantes Anticonceptivos - Extracción',
                    duracion: '20-30 min',
                    valor: '$55.000'
                },
                {
                    nombre: 'DIU/Mirena/T Cobre - Inserción',
                    duracion: '30-40 min',
                    valor: '$70.000',
                    notas: 'Sin dispositivo incluido. Dispositivos: Mirena, Asertia, Kyleena, T de Cobre'
                },
                {
                    nombre: 'DIU/Mirena/T Cobre - Extracción',
                    duracion: '20-30 min',
                    valor: '$50.000'
                },
                {
                    nombre: 'Control 7 días post DIU',
                    duracion: '15-20 min',
                    valor: '$20.000'
                },
                {
                    nombre: 'Revisión de Exámenes',
                    duracion: '20-30 min',
                    valor: '$25.000'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'Espéculos',
                'Guantes de procedimiento',
                'Guantes estériles',
                'Gasas',
                'Lidocaína 2%',
                'Instrumental estéril (Pozzi, Histerómetro, Pinza Bozeman, Tijera Metzenbaum)'
            ],
            espacioEspecial: 'Box con camilla ginecológica y lámpara ginecológica',
            notasEspeciales: 'Láser CO2 Tetra Pro requiere traslado previo al box antes de la atención'
        },
        pendientesAdministrativos: [
            'Necesita que Clínica Cialo prepare modelos de Consentimiento Informado'
        ]
    },
    {
        id: 'valentina-verdejo',
        nombreCompleto: 'Valentina Andrea Verdejo Merino',
        especialidad: 'Nutricionista Clínica Deportiva',
        rut: '18.292.227-7',
        telefono: '+56 9 9969 7698',
        email: 'valentinaverdejo.m@gmail.com',
        disponibilidad: {
            dias: ['Miércoles (PM)', 'Jueves (AM y PM)', 'Viernes (PM)', 'Sábado (AM - 2 sábados al mes)'],
            horario: 'Miércoles PM / Jueves AM y PM / Viernes PM / Sábado AM (2 sábados al mes)',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Consulta Nutricional Integral',
                    duracion: '45-60 min',
                    valor: 'Fonasa $40.000 / Isapres $50.000',
                    notas: 'Incluye: Anamnesis, revisión exámenes, InBody (composición corporal), pauta de alimentación (envío inmediato), educación y suplementación. Público: Deportistas, gestantes, adolescentes, adultos mayores, patologías. Control cada 4-6 semanas.'
                },
                {
                    nombre: 'Medición InBody + Informe',
                    duracion: '10-15 min',
                    notas: 'Análisis de composición corporal con informe detallado'
                },
                {
                    nombre: 'Examen de Calorimetría',
                    notas: 'Tiempo por definir por la clínica'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'InBody (equipamiento crítico)',
                'Computador',
                'Cinta métrica',
                'Toma de presión',
                'Toma de glicemias'
            ],
            espacioEspecial: 'Box estándar',
            notasEspeciales: 'Requiere InBody como equipamiento crítico para mediciones de composición corporal'
        },
        pendientesAdministrativos: [
            'Necesita que Clínica Cialo prepare un modelo de consentimiento informado para procedimientos específicos como la Calorimetría'
        ]
    },
    {
        id: 'elga-pena',
        nombreCompleto: 'Elga Viviana Peña',
        especialidad: 'Médico Cirujano especialista en Medicina Estética',
        rut: '26.756.102-8',
        telefono: '+56 9 4450 0412',
        email: 'sinsaludnohaybelleza@gmail.com',
        disponibilidad: {
            dias: ['Lunes (12:00-17:00)', 'Miércoles (09:00-16:00)', 'Jueves (09:00-16:00)', 'Viernes (09:00-16:00)', 'Sábado (09:00-15:00)'],
            horario: 'Lunes 12:00-17:00 / Miércoles, Jueves, Viernes 09:00-16:00 / Sábado 09:00-15:00',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Consulta Medicina Estética',
                    duracion: '30 min',
                    valor: '$20.000',
                    notas: 'Sugiere uso de EveLab Insight para evaluación'
                },
                {
                    nombre: 'Rejuvenecimiento Escote - Mesoterapia NCTF HA 135',
                    valor: '$120.000',
                    notas: 'Por sesión'
                },
                {
                    nombre: 'Rejuvenecimiento Manos - Bioestimuladores',
                    valor: '$500.000',
                    insumos: 'Radiesse o Sculptra',
                    notas: 'Opción con bioestimuladores'
                },
                {
                    nombre: 'Rejuvenecimiento Manos - Mesoterapia/Skinbooster',
                    valor: '$120.000',
                    notas: 'Opción alternativa'
                },
                {
                    nombre: 'Hiperhidrosis Axilar - Botox',
                    valor: '$320.000',
                    insumos: 'Botox 100u',
                    notas: 'Tratamiento para sudoración excesiva'
                },
                {
                    nombre: 'Fibrosis - Enzimas Recombinantes',
                    valor: '$120.000',
                    notas: 'Tratamiento de fibrosis'
                },
                {
                    nombre: 'Reafirmación Glúteos - Sculptra',
                    valor: '$950.000',
                    insumos: 'Sculptra',
                    notas: 'Bioestimulación glútea'
                },
                {
                    nombre: 'Plexr Plus - Eliminación Acrocordones',
                    equipo: 'Plexr Plus',
                    notas: 'Eliminación de lesiones cutáneas'
                },
                {
                    nombre: 'Plexr Plus - Blefaroplastia',
                    equipo: 'Plexr Plus',
                    notas: 'Rejuvenecimiento de párpados sin cirugía'
                },
                {
                    nombre: 'Plexr Plus - Código de Barras',
                    equipo: 'Plexr Plus',
                    notas: 'Tratamiento de arrugas peribucales'
                },
                {
                    nombre: 'Plexr Plus - Estrías',
                    equipo: 'Plexr Plus',
                    notas: 'Reducción de estrías'
                },
                {
                    nombre: 'Morpheus 8 - Rejuvenecimiento Escote',
                    equipo: 'Morpheus 8',
                    notas: 'Radiofrecuencia microneedling'
                },
                {
                    nombre: 'Morpheus 8 - Rejuvenecimiento Glúteos',
                    equipo: 'Morpheus 8',
                    notas: 'Reafirmación y textura'
                },
                {
                    nombre: 'HIFU - Rejuvenecimiento Escote y Glúteos',
                    equipo: 'HIFU',
                    notas: 'Ultrasonido focalizado de alta intensidad'
                },
                {
                    nombre: 'Ultraformer III - Lifting sin Cirugía',
                    equipo: 'Ultraformer III',
                    notas: 'Lifting facial y corporal no invasivo'
                },
                {
                    nombre: 'Scizer - Reducción Grasa Localizada',
                    equipo: 'Scizer',
                    notas: 'Criolipólisis'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'NCTF HA 135',
                'Radiesse',
                'Sculptra',
                'Botox 100u',
                'Enzimas recombinantes',
                'Crema anestésica',
                'Clorhexidina'
            ],
            espacioEspecial: 'Box con camilla estándar',
            notasEspeciales: 'Requiere múltiples equipos de aparatología: Plexr Plus, Morpheus 8, HIFU, Ultraformer III, Scizer'
        },
        pendientesAdministrativos: [
            'Necesita que Clínica Cialo prepare modelos de Consentimiento Informado'
        ]
    },
    {
        id: 'guillermo-contreras',
        nombreCompleto: 'Guillermo Jesús Contreras Rodríguez',
        especialidad: 'Urólogo – Especialista en Estética Íntima Masculina',
        rut: '26.232.417-6',
        telefono: '+56 9 4086 5810',
        email: 'dr.guillermocontreras@gmail.com',
        formacion: {
            pregrado: 'Médico Cirujano',
            especialidad: 'Urología',
            certificaciones: [
                'Especialidad en Urología',
                'Certificación en Estética Masculina'
            ]
        },
        disponibilidad: {
            dias: ['Lunes (18:30-21:00)', 'Miércoles (18:30-21:00)'],
            horario: 'Lunes y Miércoles 18:30 - 21:00',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Bioplastía de Engrosamiento Peniano',
                    duracion: '30 min',
                    insumos: 'Ácido Hialurónico certificado (10cc)',
                    notas: 'Procedimiento estético con ácido hialurónico'
                },
                {
                    nombre: 'Circuncisión',
                    duracion: '40 min',
                    espacio: 'Pabellón Menor',
                    notas: 'Resección de prepucio. Cirugía ambulatoria. Requiere TENS.'
                },
                {
                    nombre: 'Vasectomía',
                    duracion: '30 min',
                    espacio: 'Pabellón Menor',
                    notas: 'Esterilización masculina. Cirugía ambulatoria. Requiere TENS.'
                },
                {
                    nombre: 'Frenuloplastía',
                    duracion: '15 min',
                    espacio: 'Pabellón Menor',
                    notas: 'Elongación de frenillo. Cirugía ambulatoria. Requiere TENS.'
                },
                {
                    nombre: 'Cistoscopia Diagnóstica',
                    duracion: '15 min',
                    equipo: 'Cistoscopio flexible, Torre de endoscopía',
                    notas: 'Visualización tracto urinario. Procedimiento diagnóstico. Requiere TENS.'
                },
                {
                    nombre: 'Varicocelectomía',
                    duracion: '45-60 min',
                    espacio: 'Pabellón con apoyo anestésico (Sedación VEV)',
                    notas: 'Tratamiento de varicocele. Cirugía Mayor Ambulatoria. Requiere sedación.'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS (en cirugías menores y cistoscopías)',
            insumosRequeridos: [
                'Ácido Hialurónico certificado (10cc)',
                'Suturas absorbibles',
                'Instillagel',
                'Lidocaína'
            ],
            espacioEspecial: 'Sala de procedimientos o Pabellón Menor. Varicocelectomía requiere Pabellón con apoyo anestésico (Sedación VEV)',
            notasEspeciales: 'Equipos críticos: Cistoscopio flexible, Torre de endoscopía, Electrobisturí. Requiere tiempo extra de limpieza (15-20 min) y recuperación (30-60 min)'
        },
        pendientesAdministrativos: [
            'Tiene consentimientos propios, pero solicita respaldo institucional del centro'
        ]
    },
    {
        id: 'maria-villarroel',
        nombreCompleto: 'María Laura Villarroel Reyes',
        especialidad: 'Ginecología y Obstetricia – Especialista en Ginecoestética y Rejuvenecimiento Vaginal',
        rut: '26.408.119-K',
        telefono: '+56 9 3573 8075',
        email: 'marylaura863@gmail.com',
        formacion: {
            pregrado: 'Médico Cirujano',
            especialidad: 'Obstetricia y Ginecología',
            subespecialidad: 'Ginecoestética y Rejuvenecimiento Vaginal',
            certificaciones: [
                'Obstetricia y Ginecología (Universidad del Zulia / CONACEM aprobado)',
                'Láser Estética Técnica de Rejuvenecimiento Vaginal',
                'Labioplastia Segura (World Society of Cosmetic Gynecology)',
                'Cirugía Vulvar (Sociedad Iberoamericana)',
                'Ultrasonografía',
                'Histeroscopía'
            ]
        },
        disponibilidad: {
            dias: ['Pendiente de confirmar'],
            horario: 'Pendiente de confirmar por la doctora',
            frecuencia: 'Por definir',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Tratamiento Láser - Atrofia (Climaterio)',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Tratamiento de atrofia vaginal en menopausia'
                },
                {
                    nombre: 'Tratamiento Láser - Post-parto',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Recuperación vaginal post-parto'
                },
                {
                    nombre: 'Rejuvenecimiento Vaginal Láser',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Rejuvenecimiento vaginal con láser'
                },
                {
                    nombre: 'Lifting Vulvar Láser',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Lifting de zona vulvar con láser'
                },
                {
                    nombre: 'Blanqueamiento Genital Láser',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Blanqueamiento de zona íntima'
                },
                {
                    nombre: 'Tratamiento Láser - Estrías',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Tratamiento de estrías en zona genital'
                },
                {
                    nombre: 'Ninfoplastia (Labioplastia) Láser',
                    espacio: 'Pabellón Menor',
                    equipo: 'Láser Ginecoestético',
                    notas: 'Cirugía estética de labios menores con láser. Requiere TENS/Matrona.'
                },
                {
                    nombre: 'Manejo Glándula de Bartolino',
                    espacio: 'Pabellón Menor',
                    notas: 'Tratamiento de quistes o abscesos. Requiere TENS/Matrona.'
                },
                {
                    nombre: 'Biopsia Vulva/Vagina',
                    espacio: 'Box ginecológico o Pabellón Menor',
                    notas: 'Procedimiento diagnóstico. Requiere TENS/Matrona.'
                },
                {
                    nombre: 'Extirpación de Condilomas',
                    espacio: 'Box ginecológico o Pabellón Menor',
                    notas: 'Eliminación de verrugas genitales'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS/Matrona (para procedimientos mayores: Ninfoplastia, Biopsias)',
            insumosRequeridos: [
                'Láser Ginecoestético',
                'Material de biopsia',
                'Instrumental quirúrgico ginecológico',
                'Anestesia local'
            ],
            espacioEspecial: 'Box ginecológico y Pabellón menor (según procedimiento)',
            notasEspeciales: 'Requiere láser ginecoestético para la mayoría de procedimientos. Procedimientos mayores requieren pabellón menor.'
        },
        pendientesAdministrativos: [
            'Confirmar horarios de disponibilidad',
            'Definir precios de servicios',
            'Preparar consentimientos informados'
        ]
    }
];
