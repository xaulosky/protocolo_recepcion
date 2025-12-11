/**
 * Consentimientos Informados Data
 * Datos de consentimientos informados para tratamientos
 */

const consentimientosData = [
    {
        id: 'exilis-ultra-360',
        title: 'CONSENTIMIENTO INFORMADO EXILIS ULTRA 360',
        treatment: 'Exilis Ultra 360',
        introduction: 'Exilis Ultra 360 es un dispositivo médico estético de radiofrecuencia monopolar que suministra energía controlada a la capa dérmica y subcutánea de la piel. Su objetivo es estimular la producción de colágeno y elastina, mejorar la calidad de la piel, reducir la flacidez y, en zonas corporales, contribuir a la disminución de grasa localizada de forma no invasiva, sin cirugía ni tiempo de recuperación.',
        beneficios: [
            'Mejora la firmeza y la elasticidad de la piel.',
            'Reducción progresiva de arrugas y líneas finas.',
            'Efecto tensor en rostro, cuello y cuerpo.',
            'Disminución de flacidez cutánea en diferentes áreas.',
            'Ayuda en la remodelación corporal al actuar sobre depósitos de grasa localizada.',
            'Tratamiento cómodo, ambulatorio, sin necesidad de anestesia ni reposo.',
            'Resultados visibles que continúan mejorando durante los meses posteriores a las sesiones.'
        ],
        efectosSecundarios: [
            'Eritema (enrojecimiento) transitorio en la zona tratada.',
            'Sensación de calor intenso durante o después del procedimiento.',
            'Dolor leve o molestia temporal.',
            'Sequedad o sensibilidad en la piel tratada.',
            'En casos poco frecuentes: aparición de pequeñas quemaduras superficiales, alteraciones de la sensibilidad o resultados menores a lo esperado.'
        ],
        contraindicaciones: [
            'Embarazo o lactancia.',
            'Presencia de marcapasos, desfibrilador u otros implantes electrónicos.',
            'Implantes metálicos en la zona a tratar.',
            'Cáncer activo o antecedentes recientes de radioterapia.',
            'Infecciones activas en la piel, heridas abiertas, quemaduras o inflamación aguda.',
            'Enfermedades cardiovasculares graves, insuficiencia renal o hepática.',
            'Enfermedades autoinmunes o patologías activas del colágeno (ej.: esclerodermia).',
            'Neuralgias, neuropatías o trastornos de sensibilidad en la zona.',
            'Uso de isotretinoína en los últimos 12 meses.',
            'Eccema, rosácea o trastornos hemorrágicos.',
            'Se recomienda siempre informar al profesional tratante sobre enfermedades actuales, uso de medicamentos o procedimientos estéticos recientes.'
        ],
        cuidados: [
            'Puede retomar inmediatamente sus actividades habituales.',
            'Mantener una adecuada hidratación (agua y cremas emolientes).',
            'Evitar exposición solar directa y utilizar fotoprotección SPF 50+.',
            'No aplicar calor adicional (saunas, baños muy calientes) durante 24-48 horas.',
            'Evitar consumo excesivo de alcohol y tabaco para optimizar resultados.',
            'Seguir el número de sesiones recomendado por el profesional.'
        ]
    },
    {
        id: 'soprano-titanium',
        title: 'CONSENTIMIENTO INFORMADO SOPRANO TITANIUM',
        treatment: 'Soprano Titanium',
        introduction: 'Soprano Titanium es un sistema de láser de diodo de triple longitud de onda (755, 810 y 1064 nm) con tecnología de enfriamiento, diseñado para la depilación láser médica-estética. Actúa mediante fototermólisis selectiva, entregando energía lumínica que destruye las células responsables del crecimiento del folículo piloso sin dañar los tejidos circundantes. Es un tratamiento no invasivo, seguro para todo tipo de piel (incluyendo piel bronceada) y se realiza en modalidad en movimiento para mayor comodidad y menor riesgo de efectos secundarios.',
        beneficios: [
            'Eliminación progresiva y duradera del vello no deseado.',
            'Puede realizarse en cualquier fototipo de piel, incluso bronceada.',
            'Procedimiento prácticamente indoloro gracias al sistema de enfriamiento.',
            'Sesiones rápidas y efectivas gracias a sus dos cabezales (2 cm² y 4 cm²).',
            'Reducción de foliculitis y pseudofoliculitis.',
            'Resultados visibles tras completar la serie de sesiones recomendadas (6 a 8 corporales, 8 a 10 faciales).'
        ],
        efectosSecundarios: [
            'Eritema (enrojecimiento) o edema perifolicular transitorio.',
            'Sensación de calor, ardor o molestias leves durante y después de la sesión.',
            'Hiperpigmentación o hipopigmentación temporal.',
            'Reacciones adversas poco frecuentes: quemaduras, ampollas, activación de acné o urticaria, crecimiento paradójico de vello en zonas faciales con bajas energías.',
            'En casos excepcionales: riesgo de cicatrices o alteraciones permanentes de pigmento.'
        ],
        contraindicaciones: [
            'Embarazo o lactancia.',
            'Cáncer de piel o antecedentes de melanoma.',
            'Cualquier cáncer activo.',
            'Epilepsia.',
            'Infecciones activas en la piel.',
            'Piel irritada, lesionada, con quemaduras o heridas abiertas.',
            'Uso de medicamentos fotosensibilizantes (ej. antibióticos, antiinflamatorios, psicofármacos, antihipertensivos, etc.).',
            'Historia de urticaria o reacciones alérgicas inducidas por calor.',
            'Sensibilidad reducida en la zona por parálisis, neuropatías o parestesias.',
            'Melasma activo o lesiones pigmentarias sospechosas (requiere evaluación médica previa).',
            'Varices extensas (precaución en la zona).',
            'Pacientes con tatuajes en la zona (deben cubrirse, nunca depilar directamente sobre ellos).'
        ],
        cuidados: [
            'Antes del tratamiento: Rasurar la zona la noche anterior o el mismo día (no usar cera, pinzas ni métodos que arranquen el vello desde la raíz al menos 2 semanas antes).',
            'Evitar cremas, perfumes o aceites en la zona el día de la sesión.',
            'Evitar la exposición solar directa 1-2 semanas antes y después del procedimiento.',
            'Informar al especialista sobre medicamentos en curso o condiciones médicas relevantes.',
            'Después del tratamiento: Evitar exposición solar directa y usar protector solar SPF 50+ en la zona tratada.',
            'Evitar baños calientes, saunas, piscinas y ejercicio intenso durante 24-48 horas.',
            'Mantener la zona hidratada con cremas calmantes.',
            'Seguir el calendario de sesiones indicado para obtener resultados óptimos.'
        ]
    },
    {
        id: 'scizer',
        title: 'CONSENTIMIENTO INFORMADO SCIZER',
        treatment: 'SCIZER',
        introduction: 'SCIZER es un tratamiento de remodelación corporal no invasivo que utiliza tecnología de ultrasonido macrofocalizado de alta intensidad (HIFU) para reducir la grasa localizada. El tratamiento actúa sobre la capa grasa subcutánea sin dañar la piel ni los tejidos circundantes, mediante cartuchos específicos que permiten personalizar la profundidad y la zona a tratar, lo que resulta en una reducción de volumen y un contorno corporal más definido.',
        beneficios: [
            'Reducción de grasa localizada en zonas resistentes a dieta y ejercicio.',
            'Definición y modelado corporal sin cirugía ni tiempo de recuperación.',
            'Tratamiento personalizado según zona y características del paciente.',
            'Resultados progresivos visibles a partir de pocas semanas. Reducción visible desde la 3ra y 6ta semana, con mejoría continua hasta 3 meses.'
        ],
        efectosSecundarios: [
            'Enrojecimiento (eritema).',
            'Hinchazón (edema).',
            'Sensibilidad o dolor leve en la zona tratada.',
            'Moretones (equimosis).',
            'Adormecimiento o cosquilleo transitorio.'
        ],
        contraindicaciones: [
            'Embarazo o lactancia.',
            'Heridas abiertas, lesiones cutáneas o infecciones en la zona.',
            'Acné severo o quístico en el área a tratar.',
            'Implantes metálicos, eléctricos o bioabsorbibles en la zona.',
            'Trastornos hemorrágicos o de coagulación.',
            'Hernias, cicatrices grandes o pliegues cutáneos redundantes.',
            'Enfermedades graves de la piel, cáncer de piel, lupus o herpes activo.',
            'Uso de anticoagulantes, enfermedades cardíacas o epilepsia.'
        ],
        cuidados: [
            'Evitar la exposición directa al sol o fuentes de calor intensas en las primeras 24 horas.',
            'Mantener hidratación adecuada.',
            'No realizar masajes intensos ni aplicar presión fuerte en la zona tratada por 48 horas.',
            'Mantener una alimentación equilibrada y hábitos saludables para potenciar los resultados.',
            'Informar al especialista ante cualquier síntoma inusual o prolongado.'
        ]
    },
    {
        id: 'clatuu-alpha',
        title: 'CONSENTIMIENTO INFORMADO CLATUU ALPHA',
        treatment: 'CLATUU Alpha',
        marcoLegal: 'Este consentimiento se otorga en conformidad con la Ley N° 20.584, que regula los derechos y deberes de las personas en relación con acciones vinculadas a su atención en salud, y el Decreto N° 31 del Ministerio de Salud. El paciente tiene derecho a aceptar o rechazar libremente este tratamiento, y puede revocar su decisión en cualquier momento antes de su ejecución.',
        introduction: 'CLATUU Alpha es un procedimiento estético no invasivo que utiliza un aplicador de vacío para succionar piel y grasa localizada, enfriando el tejido hasta temperaturas de hasta -9°C. Esto provoca la destrucción controlada de células grasas, que luego son eliminadas gradualmente por el organismo. Este tratamiento está indicado para la reducción localizada de grasa y no es un método para bajar de peso. Los resultados varían según la persona y se estima una reducción permanente de entre un 20% y 30% de la grasa en la zona tratada.',
        beneficios: [
            'Reducción visible de grasa localizada sin cirugía.',
            'Procedimiento no invasivo, sin agujas ni tiempo de recuperación significativo.',
            'Resultados progresivos desde las 3 semanas, con óptimos resultados entre 1 y 3 meses.',
            'Eliminación definitiva de las células grasas tratadas.'
        ],
        efectosSecundarios: [
            'Durante el tratamiento: Sensación de tirón, presión, pinzamiento, hormigueo, ardor o calambres, que disminuyen cuando el área se adormece.',
            'Después del tratamiento: Enrojecimiento, palidez o cambio de color en la piel.',
            'Hinchazón, moretones, sensibilidad, dolor leve, entumecimiento o picazón en la zona (pueden durar horas a semanas).',
            'Rigidez temporal del área tratada.',
            'En raros casos: Hiperplasia adiposa paradójica (aumento de volumen en la zona tratada, que podría requerir cirugía).',
            'Dolor tardío, espasmos musculares, quemadura por frío, endurecimiento subcutáneo, cambios temporales en la pigmentación de la piel.',
            'Formación o agravamiento de hernia.',
            'Sequedad bucal o disminución temporal del movimiento de labios/lengua (en tratamientos de papada).'
        ],
        contraindicaciones: [
            'Crioglobulinemia.',
            'Hemoglobinuria paroxística por frío.',
            'Enfermedad por aglutininas frías.',
            'Embarazo o lactancia.',
            'Hipersensibilidad al frío (urticaria por frío, enfermedad de Raynaud).',
            'Mala circulación periférica en la zona a tratar.',
            'Trastornos neuropáticos (ej. neuralgia postherpética, neuropatía diabética).',
            'Disestesias cutáneas.',
            'Heridas abiertas o infecciones en la zona.',
            'Trastornos de coagulación o uso de anticoagulantes.',
            'Cirugías recientes o cicatrices en la zona.',
            'Hernias en o cerca del área de tratamiento.',
            'Enfermedades cutáneas activas (eczema, dermatitis, erupciones).',
            'Dispositivos implantados activos (marcapasos, desfibriladores) en la zona de tratamiento.'
        ],
        cuidados: [
            'Mantener una alimentación saludable para favorecer los resultados.',
            'Realizar actividad física ligera (ej. caminar o trotar 30 min) dentro de las primeras 24–48 h.',
            'Evitar golpes, calor excesivo o masajes no indicados en la zona durante las primeras 48 h.',
            'Contactar inmediatamente a la clínica en caso de dolor intenso, inflamación progresiva o cualquier síntoma inusual.',
            'Faja compresiva, por lo menos 6 horas diarias, por 45 días.',
            'Omega 3 1000 mg, dosis diaria: 2000 - 3000 mg al día (2-3 cápsulas). Regula el proceso inflamatorio.',
            'Berberina 500 mg, dosis diaria: 1500 mg al día (3 cápsulas). Previene complicaciones (Hiperplasia adiposa paradójica).',
            'Coenzima Q10 200 mg, dosis diaria: 200 mg (1 cápsula).'
        ],
        usoImagenes: 'Autorizo la toma de fotografías antes, durante y después del tratamiento, con fines exclusivamente clínicos y confidenciales. Cualquier uso para fines publicitarios requerirá mi autorización adicional por escrito.'
    },
    {
        id: 'embody',
        title: 'CONSENTIMIENTO INFORMADO EMBODY',
        treatment: 'Embody',
        introduction: 'Embody es un dispositivo médico estético diseñado para el modelado corporal no invasivo. Funciona mediante contracciones musculares intensas e involuntarias, que no pueden lograrse mediante ejercicio voluntario. El objetivo es fortalecer, tonificar y aumentar la masa muscular, además de mejorar la forma de áreas específicas como abdomen y glúteos. Cada sesión tiene una duración aproximada de 30 minutos y no requiere anestesia ni tiempo de recuperación.',
        beneficios: [
            'Incremento de la fuerza y tono muscular.',
            'Mejora de la definición corporal en abdomen y glúteos.',
            'Estimulación del fortalecimiento del "core" (zona central del cuerpo).',
            'Reducción de grasa intramuscular asociada al tratamiento.',
            'Procedimiento no invasivo, ambulatorio y sin reposo posterior.',
            'Resultados progresivos tras completar la serie de sesiones recomendadas (mínimo 4, máximo 10).'
        ],
        efectosSecundarios: [
            'Dolor muscular similar al post-ejercicio intenso.',
            'Espasmos musculares temporales.',
            'Dolor o molestia leve en articulaciones o tendones.',
            'Eritema (enrojecimiento) local en la piel.',
            'Disminución de la grasa intramuscular.',
            'En casos aislados: riesgo de complicaciones por contracciones musculares en pacientes con lesiones previas.'
        ],
        contraindicaciones: [
            'Embarazo o lactancia.',
            'Marcapasos, desfibriladores, neuroestimuladores u otros implantes electrónicos.',
            'Implantes metálicos en la zona a tratar o DIU metálico.',
            'Tumores malignos o antecedentes de cáncer activo.',
            'Músculos lesionados, deteriorados o con procesos inflamatorios.',
            'Insuficiencia pulmonar o trastornos cardíacos graves.',
            'Epilepsia.',
            'Fiebre o infecciones activas.',
            'Procedimientos quirúrgicos recientes en la zona (puede alterar la cicatrización).',
            'El tratamiento no debe aplicarse sobre la cabeza, cuello ni corazón.'
        ],
        cuidados: [
            'Antes del tratamiento: Mantener una adecuada hidratación.',
            'Usar ropa cómoda que permita el posicionamiento correcto.',
            'Retirar todos los accesorios metálicos, ropa con hilos metálicos y dispositivos electrónicos.',
            'Informar al profesional sobre procedimientos médicos recientes, medicamentos en curso o condiciones de salud relevantes.',
            'Después del tratamiento: Retomar inmediatamente las actividades habituales.',
            'No realizar ejercicios musculares en las zonas tratadas por 24 horas.',
            'Mantener hidratación adecuada y una alimentación saludable.',
            'Evitar consumo excesivo de tabaco y alcohol para optimizar resultados.',
            'Seguir el plan de sesiones recomendado para lograr resultados óptimos.'
        ]
    },
    {
        id: 'aclarado-intimo-axilar',
        title: 'CONSENTIMIENTO INFORMADO - Aclarado Íntimo y/o Axilar',
        treatment: 'Aclarado Íntimo y/o Axilar con Peeling Químico y/o Láser CO₂',
        profesional: 'Matrona Stefania Kuncar Ferrón',
        introduction: 'Procedimiento de aclarado íntimo y/o axilar que puede incluir el uso de peeling químico y, de ser necesario y con autorización del paciente, la complementación del tratamiento con Láser CO₂ fraccionado, con el objetivo de mejorar los resultados clínicos y estéticos. Este procedimiento puede requerir más de una sesión para alcanzar los resultados esperados y la respuesta puede variar de acuerdo con las características de la piel y hábitos personales.',
        medicamentos: true,
        alergias: true,
        criteriosExclusion: [
            'Procesos infecciosos o inflamatorios en la zona a tratar (ej.: vaginitis, vulvitis, foliculitis activa).',
            'Dermatosis en fase activa (psoriasis, dermatitis seborreica, liquen plano, liquen escleroso, entre otras).',
            'Lesiones sospechosas, premalignas o malignas en la zona.',
            'Embarazo o lactancia.',
            'Cirugía reciente en la zona a tratar (menos de 6 meses).',
            'Uso de anticoagulantes.',
            'Bronceado reciente o exposición solar activa en la zona a tratar.'
        ],
        compromisoPaciente: [
            'Informar antecedentes de herpes genital o cutáneo antes del inicio del procedimiento.',
            'No exponer la zona a sol, solarium o fuentes de calor directo por al menos 15 días post procedimiento.',
            'Evitar ropa ajustada y utilizar ropa interior de algodón posterior al tratamiento.',
            'No realizar baños de tina, piscinas, sauna ni mar en las 48 horas posteriores.',
            'No realizar ejercicio físico intenso en los 3-4 días siguientes.',
            'Evitar relaciones sexuales en la primera semana tras un procedimiento genital.',
            'Seguir las indicaciones de cuidado domiciliario entregadas por la profesional.'
        ],
        efectosSecundarios: [
            'Molestias o sensación de ardor transitorio.',
            'Eritema (enrojecimiento) o edema (hinchazón leve) en la zona.',
            'Descamación en los días posteriores al peeling.'
        ],
        efectosInfrecuentes: [
            'Hiperpigmentación postinflamatoria o hipopigmentación.',
            'Infección secundaria si no se cumplen los cuidados posteriores.',
            'Cicatrización anómala (extremadamente infrecuente).',
            'Inflamación de ganglios inguinales en pacientes con inmunidad disminuida.'
        ],
        informacionRecibida: [
            'Beneficios potenciales del procedimiento y posibilidad de que no logre el resultado esperado en mi caso.',
            'Consecuencias razonables de no realizar el procedimiento.',
            'Riesgos y complicaciones asociadas tanto al peeling químico como al láser CO₂.',
            'Necesidad de varias sesiones para obtener resultados óptimos.',
            'Que debo informar de inmediato si quedo embarazada durante el tratamiento.'
        ],
        registroFotografico: true,
        liberacionResponsabilidad: 'Libero de responsabilidad a la Matrona Stefania Kuncar Ferrón y a su equipo frente a complicaciones derivadas del incumplimiento de las indicaciones post procedimiento o de condiciones personales no declaradas.'
    }
];
