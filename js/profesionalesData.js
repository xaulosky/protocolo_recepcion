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
        especialidad: 'Matrona - Especialista en Ginecoestética y Rejuvenecimiento Íntimo',
        rut: '20.161.174-1',
        telefono: '+56 9 6306 6212',
        email: 'stefaniakuncar@gmail.com',
        formacion: {
            pregrado: 'Matrona',
            especialidad: 'Ginecoestética y Rejuvenecimiento Íntimo',
            certificaciones: [
                'Técnico operador de Láser CO2',
                'Especialización en Ginecoestética',
                'Certificada en inserción/extracción de DIU (Mirena, Asertia, Kyleena)',
                'Certificada en inserción/extracción de implantes Implanon',
                'Certificada en inserción/extracción de implantes Jadelle'
            ]
        },
        disponibilidad: {
            dias: ['Lunes (todo el día)', 'Martes (desde 16:00)', 'Jueves (todo el día)', 'Viernes (todo el día)', 'Sábado (todo el día)'],
            horario: 'Lunes, Jueves, Viernes y Sábado: Todo el día / Martes: Desde 16:00',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Rejuvenecimiento Íntimo Láser CO2',
                    descripcion: 'Procedimiento no quirúrgico que estimula la producción de colágeno en la mucosa vaginal mediante energía láser. Mejora tonicidad, lubricación y sensibilidad. Para mujeres con sequedad vaginal, laxitud, incontinencia urinaria leve, molestias postmenopausia o postparto.',
                    duracion: '40 min',
                    espacio: 'Box con camilla ginecológica',
                    equipos: 'Láser CO2 Tetra Pro con pieza ginecológica, lámpara ginecológica',
                    insumos: 'Guantes de procedimiento, espéculo vaginal, bata de procedimientos',
                    protocolo: '3 sesiones iniciales (cada 1 mes), mantención cada 6-12 meses',
                    notas: 'Requiere traslado previo del equipo láser al box'
                },
                {
                    nombre: 'Control Ginecológico',
                    descripcion: 'Evaluación clínica completa de salud ginecológica: toma de PAP, VPH, examen de mamas, evaluación de flujo vaginal, consejería anticonceptiva, planificación familiar, climaterio y menopausia.',
                    duracion: '30 min',
                    espacio: 'Box con camilla ginecológica',
                    equipos: 'Lámpara ginecológica, toma presión, pesa',
                    insumos: 'Guantes de procedimiento, espéculo, citofijador (para PAP)',
                    valor: '$40.000 (sin exámenes incluidos)',
                    protocolo: 'Anual o ante molestias. Puede requerir control para revisión de exámenes'
                },
                {
                    nombre: 'Inserción de Implante Anticonceptivo',
                    descripcion: 'Procedimiento ambulatorio para colocar implante anticonceptivo en el brazo. Método de anticoncepción de larga duración, altamente eficaz.',
                    duracion: '40 min',
                    espacio: 'Box',
                    insumos: 'Lidocaína 2%, guantes procedimiento y estériles, gasa estéril 5x5, alcohol 70%, jeringa 3ml, aguja 21G, parche curita redondo estéril, Tegaderm 10x12, hoja bisturí N°11 (Jadelle/Levoplant)',
                    valor: '$50.000 (sin implante incluido)',
                    protocolo: 'Control en 7 días, 3 meses, 1 año'
                },
                {
                    nombre: 'Extracción de Implante Anticonceptivo',
                    descripcion: 'Procedimiento ambulatorio para extraer implante anticonceptivo del brazo.',
                    duracion: '40 min',
                    espacio: 'Box',
                    insumos: 'Lidocaína 2%, guantes procedimiento y estériles, gasa estéril 5x5, alcohol 70%, jeringa 3ml, aguja 21G, parche curita, Tegaderm 10x12, hoja bisturí N°11, pinza mosquito estéril, pinza anatómica estéril',
                    valor: '$55.000',
                    protocolo: 'Control en 7 días'
                },
                {
                    nombre: 'Inserción DIU Hormonal (Asertia/Mirena/Kyleena)',
                    descripcion: 'Colocación de DIU hormonal de larga duración. Asertia y Kyleena: 5 años, Mirena: hasta 8 años. Método eficaz, cómodo y reversible.',
                    duracion: '40 min',
                    espacio: 'Box con camilla ginecológica',
                    equipos: 'Lámpara ginecológica',
                    insumos: 'Pinza Pozzi estéril, tijera Metzenbaum, histerómetro, guantes procedimiento y estériles, espéculo, gasa estéril 5x5',
                    valor: '$70.000 (sin dispositivo incluido)',
                    protocolo: 'Control en 7 días, 1 mes, 6 meses, anual'
                },
                {
                    nombre: 'Inserción T de Cobre',
                    descripcion: 'Inserción de DIU no hormonal de cobre, anticonceptivo por hasta 10 años. Recomendado para quienes desean evitar hormonas.',
                    duracion: '40 min',
                    espacio: 'Box con camilla ginecológica',
                    equipos: 'Lámpara ginecológica',
                    insumos: 'Pinza Pozzi estéril, tijera Metzenbaum, histerómetro, guantes procedimiento y estériles, espéculo, gasa estéril 5x5',
                    valor: '$70.000 (sin dispositivo incluido)',
                    protocolo: 'Control en 7 días, 1 mes, 6 meses, anual'
                },
                {
                    nombre: 'Extracción de DIU',
                    descripcion: 'Extracción de dispositivos intrauterinos: T de Cobre, Mirena, Kyleena, Asertia.',
                    duracion: '30 min',
                    espacio: 'Box con camilla ginecológica',
                    equipos: 'Lámpara ginecológica',
                    insumos: 'Guantes procedimiento, espéculo, pinza Bozeman, gasa estéril 5x5',
                    valor: '$50.000'
                },
                {
                    nombre: 'Control 7 días Post Inserción/Extracción Implante',
                    descripcion: 'Evaluación clínica para verificar correcta cicatrización, ausencia de hematomas o infecciones, y resolución de dudas.',
                    duracion: '15 min',
                    espacio: 'Box',
                    insumos: 'Guantes procedimiento',
                    valor: 'Incluido en procedimiento'
                },
                {
                    nombre: 'Control 7 días Post Inserción DIU',
                    descripcion: 'Evaluación ginecológica para verificar correcta posición del dispositivo, observar vástagos, revisar síntomas. Se entrega solicitud de ecografía ginecológica para control en 1 mes.',
                    duracion: '15 min',
                    espacio: 'Box con camilla ginecológica',
                    equipos: 'Lámpara ginecológica',
                    insumos: 'Espéculo, guantes procedimiento',
                    valor: '$20.000'
                },
                {
                    nombre: 'Revisión de Resultados Ginecológicos',
                    descripcion: 'Consulta para analizar resultados de PAP, Test VPH, mamografía o ecografías ginecológicas. Incluye interpretación, indicaciones y resolución de dudas.',
                    duracion: '30 min',
                    espacio: 'Box',
                    valor: '$25.000'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'Espéculos vaginales',
                'Guantes de procedimiento',
                'Guantes estériles',
                'Gasas estériles 5x5',
                'Lidocaína 2%',
                'Alcohol 70%',
                'Jeringas 3ml',
                'Agujas 21G',
                'Parches curita redondos estériles',
                'Tegaderm 10x12',
                'Hojas bisturí N°11',
                'Citofijador',
                'Batas de procedimiento',
                'Pinza Pozzi estéril',
                'Histerómetro',
                'Pinza Bozeman',
                'Tijera Metzenbaum',
                'Pinza mosquito estéril',
                'Pinza anatómica estéril'
            ],
            equiposCriticos: [
                'Láser CO2 Tetra Pro con pieza ginecológica',
                'Lámpara ginecológica',
                'Camilla ginecológica',
                'Toma presión',
                'Pesa'
            ],
            espacioEspecial: 'Box con camilla ginecológica y lámpara ginecológica',
            notasEspeciales: 'Láser CO2 Tetra Pro requiere traslado previo al box antes de la atención'
        },
        pendientesAdministrativos: [
            'Preparar modelos de Consentimiento Informado para todos los procedimientos'
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
        nombreCompleto: 'Dr. Guillermo Jesús Contreras Rodríguez',
        especialidad: 'Urólogo – Especialista en Estética Íntima Masculina',
        rut: '26.232.417-6',
        telefono: '+56 9 4086 5810',
        email: 'dr.guillermocontreras@gmail.com',
        formacion: {
            pregrado: 'Médico Cirujano',
            especialidad: 'Urología (Inscrito en Superintendencia de Salud)',
            certificaciones: [
                'Especialidad médica en Urología',
                'Certificación en procedimientos estéticos masculinos con ácido hialurónico'
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
                    nombre: 'Bioplastía de Engrosamiento Peniano con Ácido Hialurónico',
                    descripcion: 'Procedimiento ambulatorio de estética íntima masculina que aumenta grosor y longitud aparente del pene, mejorando la confianza y satisfacción sexual.',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    equipos: '04 Jeringas de 3mL, cánula atraumática 80G x 70-100mm, aguja 18G, jeringa 5cc para lidocaína, guantes estériles 7.5, campo quirúrgico estéril abierto y cerrado, gasa estéril',
                    insumos: '10cc de ácido hialurónico certificado, lidocaína 2%, agua estéril 5cc o SF 0.9%',
                    protocolo: 'Procedimiento único, control consulta a los 15 días, posible retoque a los 3 ó 6 meses, luego anual'
                },
                {
                    nombre: 'Circuncisión',
                    descripcion: 'Cirugía menor urológica ambulatoria que consiste en la resección del prepucio, indicada por razones médicas o estéticas.',
                    duracion: '40 min',
                    espacio: 'Pabellón Menor',
                    equipos: 'Caja de cirugía menor (pinzas, bisturí, set básico), Electrobisturí lápiz estéril punta paleta',
                    insumos: 'Suturas absorbibles ácido poliglicólico 3-0, anestesia local, material de curación, guantes, campos estériles',
                    protocolo: 'Procedimiento único con controles a 7 y 30 días',
                    notas: 'Requiere TENS'
                },
                {
                    nombre: 'Vasectomía',
                    descripcion: 'Cirugía ambulatoria de esterilización masculina, segura y definitiva.',
                    duracion: '30 min',
                    espacio: 'Pabellón Menor',
                    equipos: 'Caja de cirugía menor con pinzas y set de vasectomía, bisturí',
                    insumos: 'Suturas absorbibles ácido poliglicólico 3-0, anestesia local, guantes, campos estériles, material de curación',
                    protocolo: 'Procedimiento único, control a las 2 semanas',
                    notas: 'Requiere TENS'
                },
                {
                    nombre: 'Frenuloplastía',
                    descripcion: 'Cirugía menor para resección parcial o elongación del frenillo prepucial corto, indicada para mejorar función, estética o reducir dolor durante actividad sexual.',
                    duracion: '15 min',
                    espacio: 'Sala de procedimientos o Pabellón Menor',
                    equipos: 'Caja de cirugía menor (pinzas, bisturí, instrumental básico)',
                    insumos: 'Suturas absorbibles ácido poliglicólico 3-0, lidocaína 2%, campos estériles, guantes estériles',
                    protocolo: 'Procedimiento único, control a los 7 y 30 días',
                    notas: 'Requiere TENS'
                },
                {
                    nombre: 'Cistoscopia Diagnóstica',
                    descripcion: 'Examen endoscópico que permite visualizar tracto urinario bajo (uretra y vejiga), indicado en pacientes con hematuria, litiasis vesical, síntomas urinarios, sospecha de tumores o control de tumores vesicales.',
                    duracion: '15 min',
                    espacio: 'Sala de procedimientos o Pabellón Menor',
                    equipos: 'Cistoscopio flexible, Torre de endoscopía',
                    insumos: 'Guantes estériles, Instillagel, lidocaína gel, material de asepsia, campos estériles abierto y cerrado, bajada de suero, SF 0.9% 500cc',
                    protocolo: 'Procedimiento único según indicación clínica',
                    notas: 'Requiere TENS'
                },
                {
                    nombre: 'Varicocelectomía',
                    descripcion: 'Procedimiento quirúrgico indicado en pacientes con varicocele sintomático o asociado a infertilidad. Puede mejorar parámetros seminales y aliviar dolor escrotal.',
                    duracion: '45-60 min',
                    espacio: 'Pabellón con apoyo anestésico (Sedación VEV)',
                    equipos: 'Caja de cirugía menor y bisturí',
                    insumos: 'Suturas absorbibles: Vicryl 3-0 y ácido poliglactil (Safil) 3-0 para planos superficiales, anestesia local o sedación endovenosa, campos quirúrgicos, guantes estériles',
                    protocolo: 'Procedimiento único, control postoperatorio a 7 y 30 días',
                    notas: 'Requiere sedación endovenosa'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS (en cirugías menores y cistoscopías)',
            insumosRequeridos: [
                'Ácido Hialurónico certificado (10cc)',
                'Suturas absorbibles ácido poliglicólico 3-0',
                'Suturas Vicryl 3-0',
                'Suturas Safil 3-0',
                'Instillagel',
                'Lidocaína 2%',
                'Lidocaína gel',
                'SF 0.9% 500cc',
                'Campos estériles',
                'Guantes estériles 7.5',
                'Gasas estériles',
                'Material de curación'
            ],
            espacioEspecial: 'Sala de procedimientos o Pabellón Menor. Varicocelectomía requiere Pabellón con apoyo anestésico (Sedación VEV)',
            equiposCriticos: [
                'Cistoscopio flexible',
                'Torre de endoscopía',
                'Electrobisturí',
                'Caja de cirugía menor'
            ],
            tiempoRecuperacion: '30-60 min en procedimientos quirúrgicos menores',
            tiempoLimpieza: '15-20 min entre sesiones',
            sedacion: 'Requerida en varicocelectomía, opcional en procedimientos seleccionados'
        },
        pendientesAdministrativos: [
            'Tiene consentimientos propios, requiere respaldo institucional del centro'
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
                    insumos: [
                        { cantidad: 1, item: 'Lápiz dermográfico estéril para marcaje', valor: '$10.000', nota: 'No reutilizable' },
                        { cantidad: 4, item: 'Sobres de gasas 10x10', valor: null, nota: null },
                        { cantidad: 1, item: 'Gel lubricante', valor: null, nota: 'Para separar levemente labios si es necesario' },
                        { cantidad: 1, item: 'Campo quirúrgico estéril', valor: null, nota: null },
                        { cantidad: 1, item: 'Suero fisiológico 20cc', valor: null, nota: 'Para humedecer gasa' },
                        { cantidad: 1, item: 'Ampolla Lidocaína 1% (o con epinefrina)', valor: null, nota: null },
                        { cantidad: 1, item: 'Jeringa 10ml', valor: null, nota: null },
                        { cantidad: 1, item: 'Jeringa 20ml', valor: null, nota: null },
                        { cantidad: 2, item: 'Agujas 25G o 27G', valor: null, nota: null },
                        { cantidad: 1, item: 'Suero fisiológico para irrigación', valor: null, nota: 'Prácticamente innecesario, solo para humedecer gasas' },
                        { cantidad: 1, item: 'Clorhexidina jabonosa y alcohólica', valor: null, nota: 'Para asepsia, uso mínimo' }
                    ],
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
    },
    {
        id: 'frank-ulloa',
        nombreCompleto: 'Dr. Frank Ulloa Carrasco',
        especialidad: 'Médico Urólogo',
        rut: '13.958.038-9',
        telefono: '+56 9 7667 4494',
        email: 'doctorulloa@gmail.com',
        formacion: {
            pregrado: 'Médico Cirujano',
            especialidad: 'Urología',
            certificaciones: [
                'Especialista en Urología'
            ]
        },
        disponibilidad: {
            dias: ['Lunes (19:00 hrs)', 'Jueves (19:00 hrs)'],
            horario: 'Lunes y Jueves desde las 19:00 hrs',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Cistoscopia Flexible',
                    descripcion: 'Endoscopía urológica para visualización del tracto urinario.',
                    duracion: '20 min',
                    espacio: 'Sala de procedimientos o Pabellón',
                    equipos: 'Cistoscopio Flexible',
                    insumos: 'Endogel, Suero fisiológico, bajada de suero, guantes estériles, gasas, campo perforado',
                    valor: 'Honorario médico $200.000',
                    protocolo: '2-4 semanal',
                    notas: 'Alta inmediata. Requiere aseo de sala post-procedimiento.'
                },
                {
                    nombre: 'Engrosamiento Peneano',
                    descripcion: 'Inyección de ácido hialurónico en pene para aumento de grosor.',
                    duracion: '20 min',
                    espacio: 'Sala de procedimientos o Pabellón',
                    equipos: 'Ácido hialurónico en jeringa de 1cc',
                    insumos: 'Jeringas, lidocaína, suero fisiológico, gasa, campo perforado, gasa tubular, gasa con alcohol',
                    valor: 'Desde $500.000 (según volumen y sesiones)',
                    protocolo: 'Semanal',
                    notas: 'Alta inmediata. Honorario variable según volumen.'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS o Enfermera',
            insumosRequeridos: [
                'Cistoscopio Flexible',
                'Ácido hialurónico',
                'Endogel',
                'Suero fisiológico',
                'Bajada de suero',
                'Guantes estériles',
                'Gasas',
                'Campo perforado',
                'Jeringas',
                'Lidocaína',
                'Gasa tubular',
                'Gasa con alcohol'
            ],
            espacioEspecial: 'Sala de procedimientos o Pabellón',
            tiempoRecuperacion: 'Alta inmediata',
            tiempoLimpieza: 'Aseo de sala entre procedimientos',
            controlesPosteriores: 'Consulta médica de control'
        },
        pendientesAdministrativos: [
            'Tiene consentimiento informado propio (adjuntado)',
            'Requiere modelo de consentimiento de Clínica Cialo para complementar'
        ]
    },
    {
        id: 'maria-jesus-contreras',
        nombreCompleto: 'María Jesús Contreras Merino',
        especialidad: 'Enfermera - Especialista en Aparatología Estética',
        rut: '19.293.373-0',
        telefono: '+56 9 9414 8093',
        email: 'mariajesuscontrerasm@gmail.com',
        formacion: {
            pregrado: 'Enfermera',
            certificaciones: [
                'Operadora de Láser Soprano Titanium',
                'Especialista en Aparatología Estética Corporal y Facial'
            ]
        },
        disponibilidad: {
            dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            horario: 'Todos los días (horario por confirmar)',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Láser Soprano Titanium - Depilación',
                    descripcion: 'Depilación láser prolongada en el tiempo para reducir gradualmente el vello corporal. Dirigido a personas con vello oscuro.',
                    duracion: 'Variable según zona (10 min a 2 hrs)',
                    espacio: 'Sala de procedimientos',
                    equipos: 'Láser Titanium Soprano',
                    insumos: 'Gel conductor transparente, bajalenguas, rasuradoras, pocillos blancos, toallitas húmedas, lápiz blanco, toallitas faciales, agua micelar, pétalos de algodón, cintillos, protector solar, lentes protectores',
                    protocolo: '6-8 sesiones cuerpo completo cada 45 días / 8-10 sesiones rostro cada 45 días',
                    zonas: [
                        { zona: 'Bozo (mini)', duracion: '10 min', precio: '$90.000 (pack 6)' },
                        { zona: 'Mejillas (mini)', duracion: '10 min', precio: '$90.000 (pack 6)' },
                        { zona: 'Entrecejo (mini)', duracion: '10 min', precio: '$90.000 (pack 6)' },
                        { zona: 'Axilas (pequeña)', duracion: '15 min', precio: '$98.000 (pack 6)' },
                        { zona: 'Frente (pequeña)', duracion: '10 min', precio: '$130.000 (pack 6)' },
                        { zona: 'Dedos (pequeña)', duracion: '10 min', precio: '$130.000 (pack 6)' },
                        { zona: '½ brazo (mediana)', duracion: '15 min', precio: '$150.000 (pack 6)' },
                        { zona: '½ rostro (mediana)', duracion: '15 min', precio: '$150.000 (pack 6)' },
                        { zona: 'Nuca (mediana)', duracion: '15 min', precio: '$150.000 (pack 6)' },
                        { zona: 'Perfilado barba (mediana)', duracion: '15 min', precio: '$150.000 (pack 6)' },
                        { zona: 'Rebaje + interglútea (mediana)', duracion: '20 min', precio: '$200.000 (pack 6)' },
                        { zona: 'Pecho (grande)', duracion: '20 min', precio: '$173.000 (pack 6)' },
                        { zona: 'Abdomen (grande)', duracion: '20 min', precio: '$173.000 (pack 6)' },
                        { zona: 'Glúteos (grande)', duracion: '20 min', precio: '$173.000 (pack 6)' },
                        { zona: '½ pierna (grande)', duracion: '30 min', precio: '$173.000 (pack 6)' },
                        { zona: 'Brazos + dedos (grande)', duracion: '25 min', precio: '$173.000 (pack 6)' },
                        { zona: 'Rostro completo (grande)', duracion: '30 min', precio: '$173.000 (pack 6)' },
                        { zona: 'Espalda (grande)', duracion: '20 min', precio: '$260.000 (pack 6)' },
                        { zona: 'Piernas completas (extragrande)', duracion: '40 min', precio: '$280.000 (pack 6)' },
                        { zona: 'Cuerpo Completo', duracion: '2 horas', precio: '$750.000 (pack 6)' }
                    ]
                },
                {
                    nombre: 'Clatuu Alpha - Criolipólisis',
                    descripcion: 'Tecnología avanzada que induce la muerte celular de adipocitos de manera controlada y localizada a través de congelamiento. Tratamiento no invasivo para moldear el cuerpo y disminuir grasa.',
                    duracion: 'Variable según zona',
                    espacio: 'Box',
                    equipos: 'Clatuu Alpha',
                    insumos: 'Batas, toallas de mano de algodón, Gel Pad, toallitas húmedas, marcadores, mantitas, cinta métrica, caliper',
                    protocolo: '1 sesión (máx 2). Control: 45 días y 90 días. Se puede complementar con RF al mes.',
                    precios: [
                        '1-2 cabezales: $200.000 c/u',
                        '4 cabezales: $180.000 c/u',
                        '6 cabezales: $150.000 c/u',
                        '8 cabezales: $120.000 c/u',
                        '10 cabezales: $100.000 c/u'
                    ],
                    recomendaciones: 'Faja compresiva 6 hrs/día por 45 días, Omega 3, Berberina 1.5g/día, Vitamina C 1g/día, Coenzima Q10'
                },
                {
                    nombre: 'Scizer - HIFU Corporal',
                    descripcion: 'Ultrasonido focalizado de alta intensidad que induce muerte celular de adipocitos de manera controlada. Tratamiento no invasivo para moldear el cuerpo y reducir grasa localizada.',
                    duracion: '30 min - 1 hora',
                    espacio: 'Box',
                    equipos: 'Scizer',
                    insumos: 'Toallas de mano de algodón, rociador con agua, lápiz blanco, cinta métrica, caliper',
                    protocolo: '2-3 sesiones cada 1 mes. Control: 45 y 90 días. Complementar con RF cada 15 días.',
                    precios: [
                        'Sesión individual: $250.000 por zona',
                        'Pack 1: 1 Scizer + 4 Exilis = $350.000 (2 meses)',
                        'Pack 2: 2 Scizer + 4 Exilis = $640.000 (2.5 meses)',
                        'Pack 3: 3 Scizer + 5 Exilis + Embody regalo = $900.000 (3.5 meses)'
                    ],
                    recomendaciones: 'Omega 3, Berberina 1.5g/día, Vitamina C 1g/día, Coenzima Q10'
                },
                {
                    nombre: 'HIFU Ultraformer III - Lifting Facial',
                    descripcion: 'Ultrasonido micro y macro focalizado de alta intensidad. Trabaja a diferentes profundidades de piel y tejido subcutáneo para tensar la piel, reducir grasa localizada y generar efecto lifting en rostro.',
                    duracion: '30 min - 1 hora',
                    espacio: 'Box',
                    equipos: 'HIFU Ultraformer III',
                    insumos: 'Gel conductor transparente, lápiz blanco, caliper, cintillo, bajalenguas, pocillo',
                    protocolo: '1-2 sesiones (mín 45 días entre sesiones). Máx 2 sesiones al año. Control: 45 y 90 días.',
                    precios: [
                        'Mejillas: $120.000/sesión',
                        'Papada: $180.000/sesión',
                        'Full Face: $490.000/sesión'
                    ],
                    recomendaciones: 'Omega 3, Vitamina C 1g/día, Coenzima Q10'
                },
                {
                    nombre: 'Morpheus8 - Radiofrecuencia Fraccionada',
                    descripcion: 'Radiofrecuencia fraccionada que estimula la producción de colágeno y elastina para tensar y mejorar el aspecto de la piel. Trata flacidez, arrugas finas, estrías y grasa localizada.',
                    duracion: '60-90 min (+ 1 hr anestesia tópica previa)',
                    espacio: 'Box',
                    equipos: 'Morpheus 8',
                    insumos: 'Cartucho estéril, lápiz blanco, cinta métrica, caliper, anestesia tópica, toallas de papel, alcohol 70%',
                    protocolo: '2-4 sesiones cada 4-6 semanas',
                    precios: [
                        '1 sesión: $350.000',
                        '4 sesiones: $700.000'
                    ]
                },
                {
                    nombre: 'Exilis Ultra 360 - Radiofrecuencia',
                    descripcion: 'Radiofrecuencia, ultrasonido y cooling para tensado de piel y modelamiento del contorno corporal.',
                    duracion: '30-60 min',
                    espacio: 'Box',
                    equipos: 'Exilis Ultra 360',
                    insumos: 'Lápiz blanco, gel conductor transparente, cinta métrica, caliper, toallas de papel, cintillo, agua micelar, pétalos de algodón',
                    protocolo: '1 sesión por semana',
                    precios: [
                        'Corporal 6 sesiones: $420.000 ($70.000 c/u)',
                        'Corporal 8 sesiones: $480.000 ($60.000 c/u)',
                        'Facial 4 sesiones: $200.000'
                    ]
                },
                {
                    nombre: 'Embody - Tonificación Muscular',
                    descripcion: 'Procedimiento no invasivo que utiliza energía electromagnética focalizada de alta intensidad (HIFEM) para provocar contracciones musculares supramáximas. Tonifica, reafirma músculos y aumenta masa muscular. Zonas: glúteos y abdomen.',
                    duracion: '40 min',
                    espacio: 'Box',
                    equipos: 'Embody',
                    insumos: 'Sabanillas, guantes',
                    protocolo: '2 sesiones por semana',
                    precios: [
                        '4 sesiones: $200.000',
                        '10 sesiones: $500.000'
                    ]
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'Gel conductor transparente',
                'Gel Pad (Clatuu)',
                'Cartuchos estériles (Morpheus8)',
                'Anestesia tópica',
                'Lápiz blanco',
                'Cinta métrica',
                'Caliper',
                'Bajalenguas',
                'Rasuradoras',
                'Toallitas húmedas',
                'Agua micelar',
                'Protector solar',
                'Lentes protectores',
                'Alcohol 70%'
            ],
            equiposCriticos: [
                'Láser Soprano Titanium',
                'Clatuu Alpha',
                'Scizer',
                'HIFU Ultraformer III',
                'Morpheus 8',
                'Exilis Ultra 360',
                'Embody'
            ],
            espacioEspecial: 'Sala de procedimientos o Box según tratamiento'
        }
    },
    {
        id: 'javiera-araya',
        nombreCompleto: 'Dra. Javiera Paola Araya Medina',
        especialidad: 'Médico Cirujana - Tricóloga y Cirugía Capilar',
        rut: '19.091.765-8',
        telefono: '+56 9 6577 0608',
        email: 'j.arayamedina02@gmail.com',
        formacion: {
            pregrado: 'Médico Cirujana',
            especialidad: 'Tricología',
            subespecialidad: 'Cirugía Capilar',
            certificaciones: [
                'Especialista en Tricología',
                'Cirugía Capilar e Injerto',
                'Técnica Regenera (única en Chile)'
            ]
        },
        disponibilidad: {
            dias: [
                'Lunes (09:00 hasta cierre) - Confirmado',
                'Martes AM (08:00-12:00) - Control post-injerto',
                'Jueves (cada 6 semanas según demanda)',
                'Sábados (1-2 al mes según necesidad)'
            ],
            horario: 'Lunes completo / Martes AM ocasional / Sábados ocasional',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí',
            notasEspeciales: 'En caso de injerto, permanece hasta las 12 hrs del día siguiente para control'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Consulta Tricología Presencial',
                    descripcion: 'Anamnesis completa tricológica, análisis clínico con tricoscopia, solicitud de exámenes y definición de tratamiento más adecuado.',
                    duracion: 'Primera: 40 min / Control: 20 min',
                    espacio: 'Box atención',
                    equipos: 'Tricoscopio',
                    insumos: 'Recetario Cialo, indicaciones, exámenes',
                    valor: 'Consulta: $40.000 / Control: $20.000',
                    protocolo: 'Según paciente'
                },
                {
                    nombre: 'Consulta Tricología Online',
                    descripcion: 'Anamnesis completa, solicitud de exámenes, agendamiento de evaluación presencial y definición de potencial tratamiento.',
                    duracion: 'Primera: 30 min / Control: 20 min',
                    espacio: 'Domicilio (telemedicina)',
                    equipos: 'Computador',
                    valor: 'Consulta online: $30.000 / Control presencial: $20.000',
                    protocolo: 'Según paciente',
                    notas: 'A veces evalúa exámenes por correo sin costo'
                },
                {
                    nombre: 'Evaluación Injerto Ceja',
                    descripcion: 'Evaluación presencial u online para determinar si es candidato a injerto de ceja. Incluye solicitud de laboratorios, planeación y explicación del procedimiento.',
                    duracion: 'Online: 30 min / Presencial: 30 min',
                    espacio: 'Box o telemedicina',
                    equipos: 'Computador, Tricoscopio',
                    insumos: 'Lápiz de ojos blanco, clorhexidina, tórula algodón, micrómetro',
                    valor: 'Sin costo',
                    protocolo: 'Evaluación única'
                },
                {
                    nombre: 'Mesoterapia Dutasteride',
                    descripcion: 'Tratamiento capilar mediante microinyecciones del medicamento en cuero cabelludo para pacientes con Alopecia Androgenética.',
                    duracion: '30 min',
                    espacio: 'Sala procedimiento',
                    equipos: 'Mesa auxiliar, Riñón acero inoxidable',
                    insumos: 'Gasa 10x10, clorhexidina, 2x jeringa 1cc luer lip, 2x aguja 32G 4mm, paño campo desechable, Dutasteride 0.01% 1ml, Lidocaína 2% 1ml, SF 0.9% 1ml, guantes procedimiento S',
                    valor: '$110.000 - $150.000 (Promoción por 3 sesiones disponible)',
                    protocolo: 'Cada 2 meses x 3 veces, luego cada 3-6 meses según evolución',
                    notas: 'Se puede hacer plan terapéutico combinado'
                },
                {
                    nombre: 'Mesoterapia Triamcinolona',
                    descripcion: 'Tratamiento capilar mediante microinyecciones o microneedling del medicamento para Alopecia Areata, liquen plano, efluvio telógeno activo, etc.',
                    duracion: '30 min',
                    espacio: 'Sala procedimiento',
                    equipos: 'Mesa auxiliar, Riñón acero inoxidable',
                    insumos: 'Gasa 10x10, clorhexidina, 2x jeringa 1cc luer lip, 2x aguja 32G 4mm, paño campo desechable, Triamcinolona 50mg/ml (rinde 8 pacientes), Lidocaína 2% 1ml, SF 0.9% 1ml, guantes procedimiento S',
                    valor: '$110.000 - $150.000',
                    protocolo: 'Según causa: 1 sesión, cada mes, cada 2 meses, etc.',
                    notas: 'Se puede hacer plan terapéutico combinado'
                },
                {
                    nombre: 'Mesoterapia Plasma Rico en Plaquetas (PRP)',
                    descripcion: 'Extracción de sangre venosa, centrifugación para separar plasma, aplicación con microinyecciones o microneedling directamente en cuero cabelludo.',
                    duracion: '30 min (+ 30 min previos para extracción)',
                    espacio: 'Sala procedimiento',
                    equipos: 'Mesa auxiliar, Centrífuga, Riñón acero inoxidable, Dermapen',
                    insumos: 'Gasa 10x10, clorhexidina, 2x jeringa 1cc luer lip, 2x aguja 32G 4mm, paño campo, mariposa scalp vein vacutainer, vacutainer reutilizable, 4 tubos 5ml tapa azul, liga, parche, alcohol, tórula algodón, guantes S',
                    valor: '$110.000 - $150.000 (Promoción 3-6 sesiones)',
                    protocolo: '3 sesiones iniciales (cada 2 sem a 1 mes), luego cada 3-6 meses según evolución',
                    notas: 'Paciente debe llegar 30 min antes para extracción sanguínea (enfermera o TENS)',
                    requiereAsistente: true
                },
                {
                    nombre: 'Regenera - Células Madre Capilares',
                    descripcion: 'Procedimiento ambulatorio: obtención de 3 muestras de tejido retroauricular para procesar en máquina Rigenera y obtener Células Madre y exosomas autólogos de tejido folicular. Indicado para Alopecia Androgenética leve a moderada. ÚNICO EN CHILE.',
                    duracion: '1 hora',
                    espacio: 'Box procedimiento (o pabellón cirugía menor según SEREMI)',
                    equipos: 'Máquina Rigenera (propio), Rigeneracons (consumible propio), Mesa auxiliar',
                    insumos: 'Clorhexidina acuosa, lidocaína 2% 5ml, cuchilla rasuradora, 6x jeringa Luer Slip 1cc, 2x jeringa Luer lock 3ml, conector jeringas, 3x aguja 30G x ½ 12mm, 1x aguja 21G 40mm, 1x punch dérmico 2.5mm, 1x pinzas Adson estériles, gasa 10x10, SF 0.9% 10ml, guantes estériles 6.5, paquete compresa gasa estéril (2 compresas), lápiz quirúrgico, 3x parche curita redondo, guante procedimiento',
                    valor: '$1.450.000 (única doctora en Chile)',
                    costoInsumos: 'Rigeneracons Derma ~$550.000 + insumos ~$25.000-30.000',
                    protocolo: 'Anual',
                    requiereAsistente: true,
                    tipoAsistente: 'TENS',
                    controlPosterior: 'Control sin costo a los 3 meses',
                    notas: 'Preparación de insumos 10 min previos'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS (para PRP y Regenera)',
            insumosRequeridos: [
                'Tricoscopio',
                'Centrífuga',
                'Dermapen',
                'Dutasteride ampolla 0.01%',
                'Triamcinolona 50mg/ml',
                'Lidocaína 2%',
                'SF 0.9%',
                'Jeringas 1cc luer lip',
                'Agujas 32G 4mm',
                'Agujas 30G 12mm',
                'Punch dérmico 2.5mm',
                'Tubos PRP tapa azul',
                'Vacutainer',
                'Mariposa scalp vein',
                'Clorhexidina acuosa',
                'Gasas 10x10',
                'Campos estériles',
                'Guantes estériles y procedimiento'
            ],
            equiposCriticos: [
                'Tricoscopio',
                'Centrífuga (para PRP)',
                'Dermapen',
                'Máquina Rigenera (propio)'
            ],
            espacioEspecial: 'Box atención y Sala de procedimientos',
            tiempoPreparacion: '10-30 min según procedimiento'
        },
        pendientesAdministrativos: [
            'Preparar consentimientos informados para todos los procedimientos'
        ]
    },
    {
        id: 'luis-perez',
        nombreCompleto: 'Dr. Luis Pérez Lagos',
        especialidad: 'Cirujano Dentista – Cirujano Maxilofacial',
        rut: '16.353.720-6',
        telefono: '+56 9 8300 2718',
        email: 'dr.maxilofacialchile@gmail.com',
        formacion: {
            pregrado: 'Cirujano Dentista',
            especialidad: 'Cirugía Maxilofacial',
            certificaciones: [
                'Especialidad en Cirugía Maxilofacial'
            ]
        },
        disponibilidad: {
            dias: ['Viernes', 'Sábados'],
            horario: 'Viernes y Sábados (horario flexible)',
            frecuencia: 'Quincenal / Mensual',
            flexibilidad: 'Sí, maneja sus propios horarios'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Bichectomía',
                    descripcion: 'Adelgazar/estilizar región geniana mediante extracción de bola de Bichat.',
                    duracion: '30 min',
                    espacio: 'Box / Sala de procedimientos / Pabellón',
                    equipos: 'Caja de Cirugía con 2-3 pinzas mosquito/Kelly',
                    insumos: 'Catgut 4-0, anestesia local, campo perforado, hoja bisturí 15c',
                    costoInsumos: '~$10.000',
                    protocolo: '1 vez'
                },
                {
                    nombre: 'Blefaroplastía Superior',
                    descripcion: 'Retiro de exceso de piel, reposición grasa y/o glándula lagrimal del párpado superior. Refresca la mirada, mejora campo visual. Para blefarocalasia por envejecimiento o predisposición genética.',
                    duracion: '2-3 horas',
                    espacio: 'Pabellón',
                    equipos: 'Caja de Blefaroplastía, electrobisturí/radiofrecuencia con punta colorado',
                    insumos: 'Vicryl incoloro y normal 5-0 y 6-0, Prolene 5-0 y 6-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, SF 0.9%, hoja bisturí 15c y 11',
                    costoInsumos: '~$60.000',
                    protocolo: '1 vez'
                },
                {
                    nombre: 'Blefaroplastía Inferior',
                    descripcion: 'Retiro de piel y/o grasa del párpado inferior. Atenúa "bolsas" bajo los ojos. Técnica transconjuntival (grasa) o transcutánea (piel). Para pacientes con laxitud de piel y herniación grasa.',
                    duracion: '1-3 horas',
                    espacio: 'Pabellón',
                    equipos: 'Caja de Blefaroplastía, eventualmente Láser CO2, electrobisturí/radiofrecuencia punta colorado',
                    insumos: 'Vicryl incoloro y normal 5-0 y 6-0, Prolene 5-0 y 6-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, SF 0.9%, hoja bisturí 15c',
                    costoInsumos: '~$60.000',
                    protocolo: '1 vez'
                },
                {
                    nombre: 'Lipoaspiración Cervical y Facial',
                    descripcion: 'Disminuir grasa supraplastismal en zona de jowls, submentoniana y cervical. Para pacientes con peso adecuado que no logran resultados con dieta/ejercicio/medicina estética. Complemento a bichectomía.',
                    duracion: '1-1.5 horas',
                    espacio: 'Sala de procedimientos / Pabellón',
                    equipos: 'Caja de cánulas + caja cirugía básica',
                    insumos: 'Prolene o nylon 5-0 y 6-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, bicarbonato ampolla, SF 0.9%, hoja bisturí 15c u 11',
                    costoInsumos: '~$40.000',
                    protocolo: '1 vez + sesiones de kinesioterapia para drenaje, prevención de fibrosis y retracción subcutánea'
                },
                {
                    nombre: 'Lifting Cervical',
                    descripcion: 'Manejo de grasa supra y subplastismal, mejoría considerable del contorno cervical y ángulo cérvico-mandibular. Para pacientes con abundante tejido adiposo, piel redundante post-lipo, hiperlaxitud cervical o bandas platismales.',
                    duracion: '3 horas',
                    espacio: 'Pabellón',
                    equipos: 'Caja de Lifting, electrobisturí/radiofrecuencia con punta colorado y paleta + pinza bipolar',
                    insumos: 'Vicryl 2-0, 3-0 y 4-0, Nylon o Prolene 5-0 y 6-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, SF 0.9%, hoja bisturí 15c',
                    costoInsumos: '~$60.000',
                    protocolo: '1 vez, complementar con tratamiento revitalizante/láser según caso'
                },
                {
                    nombre: 'Otoplastía',
                    descripcion: 'Corrección de orejas aladas o protuidas. Para pacientes pediátricos y adultos que busquen mejorar su estética auricular.',
                    duracion: '1.5-3 horas (según técnica: antehélix nuevo o resección concha)',
                    espacio: 'Pabellón',
                    equipos: 'Caja de Cirugía, electrobisturí/radiofrecuencia monopolar y pinza bipolar',
                    insumos: 'Nylon o Prolene 4-0 y 5-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, SF 0.9%, hoja bisturí 15',
                    costoInsumos: '~$40.000',
                    protocolo: '1 vez'
                },
                {
                    nombre: 'Browlift Indirecto',
                    descripcion: 'Corrección de "caída" de las cejas. Procedimiento aislado o complementario a blefaroplastía.',
                    duracion: '1.5-2 horas',
                    espacio: 'Pabellón',
                    equipos: 'Óptica endoscopio (opcional), caja lifting, motor Qx con pieza de mano y fresa cilíndrica, electrobisturí/radiofrecuencia punta colorado y paleta',
                    insumos: 'Vicryl 4-0, Nylon 2-0, 3-0 y 4-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, SF 0.9%, hoja bisturí 15 u 11',
                    costoInsumos: '~$50.000',
                    protocolo: '1 vez'
                },
                {
                    nombre: 'Liplift',
                    descripcion: 'Lifting o elevación del labio superior para mejorar exposición dentaria y rejuvenecer. Especialmente para pacientes de mayor edad. Nota: cicatriz visible en base de nariz.',
                    duracion: '30-60 min',
                    espacio: 'Sala de procedimientos / Pabellón',
                    equipos: 'Caja cirugía básica',
                    insumos: 'Vicryl 4-0 y 5-0 incoloros, Prolene 5-0 y 6-0, pack estéril pabellón, guantes Qx, lidocaína, epinefrina, ácido tranexámico, SF 0.9%, hoja bisturí 15 u 11',
                    costoInsumos: '~$40.000',
                    protocolo: '1 vez'
                },
                {
                    nombre: 'Mentoplastía',
                    descripcion: 'Avanzar, retroceder, ascender, descender o enderezar el mentón para mejorar perfil y armonía de tercios faciales. Con implante de silicona + tornillos o con osteotomías.',
                    duracion: '1-1.5 horas',
                    espacio: 'Pabellón',
                    equipos: 'Motor piezoeléctrico/Motor sierra reciprocante (óseo) o Motor para tornillos (implante stock)',
                    insumos: 'Tornillos de OTS, placa de OTS, caja mentoplastía',
                    costoInsumos: 'Variable según caso',
                    protocolo: '1 vez'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'Sala procedimiento: TENS para abrir instrumental (trabajan 2 cirujanos). Pabellón: Arsenalera y pabellonera',
            insumosRequeridos: [
                'Catgut 4-0',
                'Vicryl 2-0 a 6-0 (incoloro y normal)',
                'Prolene/Nylon 4-0 a 6-0',
                'Lidocaína',
                'Epinefrina',
                'Ácido tranexámico',
                'Bicarbonato ampolla',
                'SF 0.9%',
                'Hojas bisturí 11, 15, 15c',
                'Campos perforados',
                'Pack estéril pabellón',
                'Guantes quirúrgicos'
            ],
            equiposCriticos: [
                'Caja de Cirugía Maxilofacial',
                'Caja de Blefaroplastía',
                'Caja de Lifting',
                'Caja de cánulas',
                'Electrobisturí/Radiofrecuencia',
                'Motor piezoeléctrico',
                'Motor sierra reciprocante',
                'Pinza bipolar'
            ],
            espacioEspecial: 'Sala de procedimientos o Pabellón según cirugía. Bioseguridad propia del procedimiento',
            tiempoRecuperacion: 'Variable según procedimiento, todos requieren recuperación',
            controlesPosteriores: 'Sí, obligatorios'
        },
        pendientesAdministrativos: [
            'Tiene consentimientos propios (genéricos y específicos)',
            'Clínica puede preparar consentimientos adicionales si lo desea'
        ]
    },
    {
        id: 'walter-zaror',
        nombreCompleto: 'Walter Sebastián Zaror Maza',
        especialidad: 'Nutricionista Deportivo',
        rut: '17.366.487-7',
        telefono: '+56 9 8188 7714',
        email: 'walterszm2@gmail.com',
        formacion: {
            pregrado: 'Nutricionista',
            especialidad: 'Nutrición Deportiva',
            certificaciones: [
                'Nutricionista Deportivo'
            ]
        },
        disponibilidad: {
            dias: ['Lunes a Jueves (10:00-13:00 y 14:00-16:00)', 'Sábados AM (horarios a convenir)'],
            horario: 'Lunes a Jueves: 10:00-13:00 y 14:00-16:00 / Sábados AM',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Evaluación Nutricional Integral InBody 970',
                    descripcion: 'Evaluación nutricional integral dirigida a todo público para apoyar diferentes tratamientos estéticos y/o fases agudas que requieran complementación nutricional y alimenticia.',
                    duracion: 'Primera: 1 hora / Control: 30 min',
                    espacio: 'Box nutricional',
                    equipos: 'InBody 970, Camilla',
                    insumos: 'Alcohol para desinfección de equipos',
                    valor: '$40.000',
                    protocolo: 'Evaluación inicial + controles mensuales según disponibilidad del paciente'
                },
                {
                    nombre: 'Calorimetría Indirecta + Evaluación Nutricional',
                    descripcion: 'Medición del gasto energético en reposo mediante calorimetría indirecta, complementada con evaluación nutricional integral.',
                    duracion: '30 min',
                    espacio: 'Box nutricional',
                    equipos: 'Calorimetría indirecta, InBody 970, Camilla',
                    insumos: 'Alcohol, filtros y plásticos para calorimetría',
                    valor: '$75.000 - $80.000',
                    protocolo: 'Inicial y derivada por médico',
                    notas: 'Paciente debe llegar 10-15 min previo a la cita'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'InBody 970',
                'Equipo de Calorimetría Indirecta',
                'Camilla',
                'Alcohol para desinfección',
                'Filtros para calorimetría',
                'Plásticos para calorimetría'
            ],
            equiposCriticos: [
                'InBody 970',
                'Calorimetría Indirecta'
            ],
            espacioEspecial: 'Box nutricional',
            tiempoPreparacion: '10-15 min previos para calorimetría indirecta'
        },
        pendientesAdministrativos: [
            'Preparar modelo de consentimiento informado'
        ]
    },
    {
        id: 'keren-matus',
        nombreCompleto: 'Keren Matus',
        especialidad: 'Cosmetóloga - Remodelación Corporal',
        telefono: '',
        email: '',
        disponibilidad: {
            dias: ['Lunes a Sábado'],
            horario: 'Según agenda',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Depilación Láser Soprano Titanium',
                    descripcion: 'Depilación láser con tecnología Soprano Titanium de triple longitud de onda.',
                    duracion: 'Variable según zona',
                    espacio: 'Box corporal'
                },
                {
                    nombre: 'Criolipólisis Clatuu Alpha',
                    descripcion: 'Tratamiento de criolipólisis 360° para reducción de grasa localizada.',
                    duracion: '60 min por cabezal',
                    espacio: 'Box corporal'
                },
                {
                    nombre: 'HIFU Corporal Ultraformer III',
                    descripcion: 'Ultrasonido focalizado para tensado y reafirmación corporal.',
                    duracion: '60-90 min',
                    espacio: 'Box corporal'
                },
                {
                    nombre: 'Morpheus8 Corporal',
                    descripcion: 'Radiofrecuencia fraccionada con microagujas para flacidez y estrías.',
                    duracion: '45-60 min',
                    espacio: 'Box corporal'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: ['Gel conductor', 'Gasas', 'Guantes'],
            equiposCriticos: ['Soprano Titanium', 'Clatuu Alpha', 'Ultraformer III', 'Morpheus8'],
            espacioEspecial: 'Box corporal'
        }
    },
    {
        id: 'susana-pereira',
        nombreCompleto: 'Susana Pereira',
        especialidad: 'Cosmetóloga - Depilación Láser',
        telefono: '',
        email: '',
        disponibilidad: {
            dias: ['Lunes a Sábado'],
            horario: 'Según agenda',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Depilación Láser Soprano Titanium',
                    descripcion: 'Depilación láser con tecnología Soprano Titanium de triple longitud de onda para todo tipo de piel.',
                    duracion: 'Variable según zona',
                    espacio: 'Box depilación'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: ['Gel conductor', 'Gasas', 'Guantes'],
            equiposCriticos: ['Soprano Titanium'],
            espacioEspecial: 'Box depilación'
        }
    },
    {
        id: 'mariane-kiss',
        nombreCompleto: 'Mariane Soledad Kiss Molina',
        especialidad: 'Odontóloga - Armonización Orofacial',
        rut: '15.039.063-9',
        telefono: '+56 9 9077 5288',
        email: 'marianekissm@gmail.com',
        formacion: {
            pregrado: 'Odontóloga',
            especialidad: 'Armonización Orofacial',
            certificaciones: [
                'Especialista en Armonización Orofacial'
            ]
        },
        disponibilidad: {
            dias: ['Miércoles', 'Jueves'],
            horario: 'Miércoles y Jueves: 10:00-19:00 hrs',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí, horario puede acomodarse si es necesario'
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Toxina Botulínica',
                    descripcion: 'Se utiliza para atenuar arrugas faciales',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    equipos: '',
                    insumos: '1 par de guantes látex sin polvo, 1 mascarilla, 4 gasa estéril, clorhexidina 2%, 2 jeringa insulina 50 UI 31G X 6mm, lápiz blanco (marcar puntos a nivel facial)',
                    valor: '$179.000',
                    protocolo: 'Cada 5 meses',
                    requiereAsistente: false,
                    controlesPosteriores: 'Control 14 días',
                    requiereCertificacion: 'Ejecutado por odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Aumento de volumen o perfilado labial',
                    descripcion: 'Inyección de ácido hialurónico en labios para aumentar el volumen o perfilar',
                    duracion: '45 min',
                    espacio: 'Sala de procedimientos',
                    equipos: 'Ácido hialurónico en jeringa de 1 ml - Marca Juvederm Ultra plus XC',
                    insumos: '2-3 anestesia Mepivacaína 3% sin vasoconstrictor, 1-2 cánulas 23 G, aguja corta para anestesiar, carpule, mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%',
                    valor: '$180.000',
                    protocolo: 'Depende de lo que quiere el paciente y lo que podemos lograr',
                    requiereAsistente: true,
                    tipoAsistente: 'TENS',
                    tiempoLimpieza: 'Aseo de la sala',
                    controlesPosteriores: 'Control 21 días',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Aumento de volumen Mentón o pómulos',
                    descripcion: 'Inyección de ácido hialurónico en mentón o pómulos para armonizar el perfil o reponer pérdida de volumen',
                    duracion: '45 min',
                    espacio: 'Sala de procedimientos',
                    equipos: 'Ácido hialurónico en jeringa de 1 ml',
                    insumos: '1 anestesia Mepivacaína 3% sin vasoconstrictor, 1-2 cánulas 22 G, mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%, 1 jeringa insulina 50 UI 31G X 6mm, lápiz blanco marcaje',
                    valor: '$180.000',
                    protocolo: 'Depende de lo que el paciente requiere',
                    requiereAsistente: true,
                    tipoAsistente: 'TENS',
                    tiempoLimpieza: 'Aseo de la sala',
                    controlesPosteriores: 'Control 21 días',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Mesoterapia Pink glow o NCTF Filorga',
                    descripcion: 'Tratamiento facial mínimamente invasivo que consiste en la aplicación de un cóctel nutritivo directamente en la piel mediante microinyecciones o Dermapen. Diseñado para hidratar, iluminar, revitalizar y unificar el tono de la piel.',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    equipos: 'Dermapen',
                    insumos: '1 aguja Dermapen, mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%, 1 jeringa (puede ser de 1, 2 o 3 ml), 1-1,5 ml de Pink glow o NCTF Filorga, opcional una mascarilla de hidratación facial',
                    valor: 'Depende del valor que quiera cobrar la clínica',
                    protocolo: '1 sesión al mes',
                    requiereAsistente: false,
                    tiempoLimpieza: 'Aseo de la sala',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Polinucleótidos en zona de ojera, REJURAN',
                    descripcion: 'Tratamiento de rejuvenecimiento de la piel en zona ocular. Mejora la hidratación, reducción de arrugas y flacidez cutánea, reducción de pigmentación',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    equipos: 'Ácido hialurónico en jeringa de 1 ml',
                    insumos: 'Mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%, 3-4 gasas, 0,5 – 1 ml de REJURAN',
                    valor: 'Precio de la clínica',
                    protocolo: 'Ideal 3-4 veces cada 3 semanas',
                    requiereAsistente: false,
                    tiempoLimpieza: 'Aseo de la sala',
                    controlesPosteriores: 'Control 21 días',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'SCULPTRA',
                    descripcion: 'Tratamiento inyectable que estimula la producción de colágeno en la piel. Promueve un rejuvenecimiento gradual y profundo.',
                    duracion: '45-60 min',
                    espacio: 'Sala de procedimientos',
                    equipos: '',
                    insumos: '1 anestesia Mepivacaína 3% sin vasoconstrictor, 1-2 cánulas 22 G, mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%, 1 jeringa insulina 50 UI 31G X 6mm, lápiz blanco marcaje, 1 vial SCULPTRA, 1 agua para inyectables, 1 Lidocaína, 2 jeringas 1 ml, 2 jeringas 3 ml, 5 gasas',
                    valor: '$480.000 - $500.000',
                    protocolo: 'Depende de lo que el paciente requiere',
                    requiereAsistente: true,
                    tipoAsistente: 'TENS',
                    tiempoLimpieza: 'Aseo de la sala',
                    controlesPosteriores: 'Control 1-3 meses',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Hilos revitalizantes en mejillas o papada',
                    descripcion: 'Hilos lisos de PDO que se aplican en malla para estimular la producción de colágeno. Atenúan arrugas finas y flacidez leve a moderada.',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    equipos: '1 paquete hilos lisos PDO (envío proveedor)',
                    insumos: 'Mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%, lápiz blanco marcaje, 1 paquete hilos lisos PDO, hielo',
                    valor: '$120.000',
                    protocolo: 'Cada 5 meses',
                    requiereAsistente: false,
                    tiempoLimpieza: 'Aseo de la sala',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Hilos multifill surco nasogeniano',
                    descripcion: 'Aplicación de hilo multifill (Paquete de 8-10 hilos lisos PDO) en surco nasogeniano para estimular la producción de colágeno.',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    equipos: '1 Paquete hilo multifill',
                    insumos: 'Mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2%, 1 paquete hilos multifill, hielo',
                    valor: '$160.000 - $180.000',
                    protocolo: 'Cada 8-12 meses',
                    requiereAsistente: true,
                    tipoAsistente: 'TENS',
                    tiempoLimpieza: 'Aseo de la sala',
                    controlesPosteriores: 'Control 21 días',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                },
                {
                    nombre: 'Láser Coolpeel',
                    descripcion: 'Tratamiento de rejuvenecimiento facial con láser CO2 fraccionado superficial',
                    duracion: '45 min',
                    espacio: 'Sala de procedimientos',
                    equipos: 'Láser',
                    insumos: 'Anestesia tópica, mascarilla, 1 par guantes de látex sin polvo, clorhexidina 2% o suero fisiológico, 5 gasas',
                    valor: '$199.000',
                    protocolo: '',
                    requiereAsistente: true,
                    tipoAsistente: 'TENS',
                    tiempoLimpieza: 'Aseo de la sala',
                    controlesPosteriores: 'Control 1 mes',
                    requiereCertificacion: 'Ejecutado por Odontólogo',
                    consentimientoInformado: 'Clínica Cialo preparará modelo'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: true,
            tipoAsistente: 'TENS (para procedimientos con ácido hialurónico, Sculptra, hilos multifill y láser)',
            insumosRequeridos: [
                'Guantes látex sin polvo',
                'Mascarillas',
                'Gasas estériles',
                'Clorhexidina 2%',
                'Jeringas insulina 50 UI 31G X 6mm',
                'Anestesia Mepivacaína 3% sin vasoconstrictor',
                'Cánulas 22 G y 23 G',
                'Lápiz blanco marcaje',
                'Ácido hialurónico Juvederm Ultra plus XC',
                'REJURAN',
                'SCULPTRA',
                'Pink glow o NCTF Filorga',
                'Hilos PDO',
                'Dermapen',
                'Anestesia tópica'
            ],
            equiposCriticos: [
                'Dermapen',
                'Láser CO2'
            ],
            espacioEspecial: 'Sala de procedimientos',
            tiempoLimpieza: 'Aseo de sala entre procedimientos'
        },
        pendientesAdministrativos: [
            'Preparar consentimientos informados para todos los procedimientos'
        ]
    },
    {
        id: 'nicolas-laucirica',
        nombreCompleto: 'Nicolás Laucirica Muñoz',
        especialidad: 'Medicina Estética Facial',
        rut: '18.155.817-2',
        telefono: '+56 9 5130 2863',
        email: 'dr.laucirica@gmail.com',
        disponibilidad: {
            dias: [
                'Lunes a Viernes (08:30-19:30) - Los Ángeles',
                'Miércoles (09:00-19:30) - Concepción',
                'Sábado (08:00-14:30) - Los Ángeles'
            ],
            horario: 'Lunes a Viernes 08:30-19:30 (excepto Miércoles que atiende en Concepción 09:00-19:30) / Sábado 08:00-14:30',
            frecuencia: 'Semanal',
            flexibilidad: 'Sí',
            ubicaciones: {
                losAngeles: 'Lunes, Martes, Jueves, Viernes (08:30-19:30) y Sábado (08:00-14:30)',
                concepcion: 'Miércoles (09:00-19:30)'
            }
        },
        prestaciones: {
            servicios: [
                {
                    nombre: 'Toxina Botulínica 1 Zona (Botox 1 Zona)',
                    descripcion: 'Procedimiento inyectable con toxina botulínica tipo A dirigido a relajar un grupo muscular específico del rostro. Una "zona" corresponde a un área facial donde se trata un patrón muscular definido (ej.: frente, entrecejo, patitas de gallo, mentón, bunny lines, DAO, etc.). Reduce arrugas dinámicas y previene la formación de líneas estáticas. Ideal para pacientes que desean un ajuste focal, un tratamiento preventivo o mantener correcciones previas sin realizar un full face.',
                    duracion: '30 min',
                    espacio: 'Sala de procedimientos',
                    insumos: 'Vial de toxina botulínica tipo A (marca autorizada por ISP), suero fisiológico para reconstitución, jeringas de 1 ml tipo insulina o tuberculina, agujas 30G–32G estériles, torundas con clorhexidina alcohólica al 2%, guantes desechables',
                    valor: '$130.000',
                    protocolo: 'Cada 4 a 6 meses según necesidad'
                },
                {
                    nombre: 'Toxina Botulínica en Tercio Superior Facial',
                    descripcion: 'Procedimiento inyectable que utiliza toxina botulínica tipo A para relajar temporalmente los músculos responsables de arrugas dinámicas del tercio superior (frente, glabela/entrecejo y líneas perioculares). Reduce líneas de expresión, suaviza la apariencia del rostro y previene el envejecimiento prematuro. Dirigido a mujeres y hombres que buscan un resultado natural, preventivo o correctivo, con seguridad y respaldo científico.',
                    duracion: '20 min',
                    espacio: 'Sala de procedimientos',
                    insumos: 'Vial de toxina botulínica tipo A (marca autorizada por ISP), suero fisiológico para reconstitución, jeringas de 1 ml tipo insulina o tuberculina, agujas 30G–32G estériles, torundas con clorhexidina alcohólica al 2%, guantes desechables',
                    valor: '$210.000 (Fidelización: $189.000)',
                    protocolo: 'Cada 4-6 meses. Control a los 10-14 días para ajustes. Uso preventivo en pacientes jóvenes.'
                }
            ]
        },
        requisitosLogisticos: {
            necesitaAsistente: false,
            insumosRequeridos: [
                'Vial de toxina botulínica tipo A (marca autorizada por ISP)',
                'Suero fisiológico para reconstitución',
                'Jeringas de 1 ml tipo insulina o tuberculina',
                'Agujas 30G–32G estériles',
                'Torundas con clorhexidina alcohólica al 2%',
                'Guantes desechables'
            ],
            espacioEspecial: 'Box estándar',
            notasEspeciales: 'Atiende en dos ubicaciones: Clínica Cialo Los Ángeles (mayoría de días) y Concepción (miércoles)'
        },
        pendientesAdministrativos: [
            'Definir servicios específicos de Medicina Estética Facial',
            'Establecer precios de prestaciones',
            'Preparar consentimientos informados'
        ]
    },
    {
        id: 'keren-matus',
        nombreCompleto: 'Keren Hapuc Matus Islas',
        especialidad: 'Kinesióloga Dermatofuncional',
        subespecialidad: 'Rehabilitación Kinésica Post Quirúrgica de Cirugía Plástica y Reconstructiva',
        rut: '19.716.896-K',
        telefono: '+56 9 3136 5173',
        email: 'kerencialo2025@gmail.com',
        emailAlternativo: 'klgakeren.matus@gmail.com',
        disponibilidad: {
            turno1: {
                descripcion: 'Lunes a Viernes',
                horarios: {
                    lunesAJueves: '09:00-14:00, 16:00-20:00',
                    viernes: '10:00-14:00, 16:00-20:00'
                },
                descanso: 'Sábado, Domingo, Lunes'
            },
            turno2: {
                descripcion: 'Martes a Sábado',
                horarios: {
                    martesAViernes: '09:00-14:00, 16:00-20:00',
                    sabado: '09:00-13:00, 14:00-18:00'
                }
            },
            frecuencia: 'Semanal',
            flexibilidad: true,
            ubicaciones: ['Clínica Cialo Los Ángeles']
        },
        prestaciones: {
            descripcionGeneral: 'Kinesiología Dermatofuncional especializada en rehabilitación post quirúrgica de cirugía plástica y reconstructiva. Tratamientos faciales y corporales con aparatología avanzada.',
            servicios: []
        },
        requisitosLogisticos: {
            insumosRequeridos: [
                'Gel conductor',
                'Guantes',
                'Toallas húmedas',
                'Alcohol desinfectante',
                'Lápiz blanco marcador',
                'Electrodos y cables según equipo'
            ],
            espacioEspecial: 'Box estándar',
            asistenciaRequerida: 'TENS para preparación de box en agenda llena y para tratamientos Clatuu',
            tiempoEntreSesiones: '10 minutos mínimo para limpieza/preparación',
            controlPosterior: 'Recomendado control al mes del tratamiento (no obligatorio)',
            notasEspeciales: 'Especializada en recuperación post quirúrgica. Requiere certificación de Kinesiólogo para equipos. Tiene consentimientos informados propios.'
        },
        pendientesAdministrativos: []
    }
];

// Obtener especialidades únicas de profesionales
function getEspecialidadesProfesionales() {
    const especialidades = [...new Set(profesionalesData.map(p => p.especialidad))];
    return especialidades.sort();
}

// Obtener días de atención únicos
function getDiasAtencionProfesionales() {
    const dias = new Set();
    profesionalesData.forEach(p => {
        p.disponibilidad.dias.forEach(d => dias.add(d));
    });
    return [...dias].sort();
}
