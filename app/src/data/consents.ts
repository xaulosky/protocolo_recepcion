/**
 * Consentimientos Informados Data
 * Datos de consentimientos informados para tratamientos
 */

export const consentimientosData = [
    {
        id: 'general-esteticos',
        title: 'CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTOS ESTÉTICOS',
        treatment: 'Procedimientos Estéticos (General)',
        introduction: 'Yo, la persona indicada más abajo, mayor de edad, declaro que toda la información suministrada es veraz y fidedigna. Por medio del presente, autorizo a Clínica Cialo a realizarme el procedimiento indicado, el cual me ha sido explicado de forma clara y comprensible. Declaro que comprendo la naturaleza del procedimiento, los resultados esperados, así como las posibles complicaciones y riesgos, y que he tenido la oportunidad de realizar todas las preguntas necesarias, recibiendo respuestas satisfactorias.',
        beneficios: [],
        efectosSecundarios: [
            'Eritema (enrojecimiento) o inflamación transitoria en la zona tratada.',
            'Sensación de calor, ardor o molestia temporal.',
            'Posibilidad de resultados menores a los esperados dependiendo de la respuesta individual.',
            'En casos poco frecuentes: hiperpigmentación transitoria u otras reacciones cutáneas.',
        ],
        contraindicaciones: [
            'Embarazo o lactancia.',
            'Enfermedades de la piel activas en la zona a tratar.',
            'Infecciones o heridas abiertas en la zona.',
            'Enfermedades graves no comunicadas al profesional.',
            'Alergias o hipersensibilidades relevantes no informadas.',
        ],
        cuidados: [
            'Seguir las indicaciones post-procedimiento entregadas por el profesional tratante.',
            'Comunicar de inmediato cualquier síntoma inusual o reacción adversa.',
            'Usar fotoprotección según las indicaciones.',
            'Asistir a los controles programados.',
        ],
    },
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
    },
    {
        id: 'contrato-servicios',
        title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS MÉDICOS, ESTÉTICOS Y AMBULATORIOS DE SALUD',
        treatment: 'Servicios Clínica Cialo',
        introduction: 'El presente documento constituye un Contrato de Prestación de Servicios entre el paciente y Clínica Cialo, el cual regula las condiciones bajo las cuales se otorgarán los servicios médicos, estéticos y ambulatorios de salud. La firma de este contrato implica la aceptación expresa de todas las cláusulas aquí establecidas. En el caso de pacientes menores de edad, se entenderá que uno de sus padres o tutor legal actuará como representante, autorizando los tratamientos correspondientes. El paciente declara que este contrato ha sido revisado previamente, que ha tenido la oportunidad de realizar todas las consultas necesarias y que firma de manera informada, consciente y voluntaria, comprendiendo cada uno de los puntos expuestos.',
        beneficios: [],
        efectosSecundarios: [],
        contraindicaciones: [],
        cuidados: [
            '1.A) Ningún plan, servicio individual o abono dará derecho a cambio de tratamiento una vez realizado el pago, si las modificaciones, cancelaciones o reprogramaciones no se efectúan con al menos 24 horas de anticipación, a través de los canales oficiales de la clínica. La inasistencia sin aviso previo se considerará como sesión realizada. No se realizan devoluciones de dinero.',
            '1.B) Cualquier reclamo relacionado con pagos deberá ser informado directamente en recepción y posteriormente formalizado mediante una solicitud escrita enviada al correo electrónico contacto@cialo.cl, para su revisión por parte de la administración de la clínica.',
            '1.C.1) El paciente entiende y acepta que los resultados de los tratamientos pueden variar entre individuos, y reconoce que es imposible predecir la respuesta específica de su organismo, así como el número exacto de sesiones necesarias. Todos los tratamientos ofrecidos son complementarios, y su efectividad dependerá del cumplimiento de las sesiones, la dieta, las recomendaciones y los cuidados indicados por el profesional tratante. Ningún tratamiento es garantizado al 100%. Algunos tratamientos pueden requerir ser complementados con otros procedimientos, modificados o incluso suspendidos, según criterio del profesional clínico.',
            '1.C.2) El procedimiento puede requerir sesiones adicionales a las recomendadas en la evaluación inicial, debido a la respuesta individual del paciente, con el fin de alcanzar el resultado esperado.',
            '1.D) El tratamiento comenzará a contar desde el agendamiento de la primera cita correspondiente al plan o servicio. Una vez iniciado, tendrá una vigencia de 10 meses para su realización. Los servicios individuales tendrán una vigencia de 6 meses. El paciente se compromete a ser puntual en la asistencia a cada sesión agendada.',
            '1.E) El tratamiento vencerá y el paciente perderá automáticamente el derecho a continuar con este si no asiste a la clínica por un período superior a 90 días consecutivos desde la última sesión realizada.',
            '1.F) Los tratamientos son realizados por el equipo interdisciplinario de Clínica Cialo, sin exclusividad de un profesional específico. Todos los profesionales asignados estarán debidamente capacitados para ejecutar el tratamiento correspondiente.',
            '1.G) Una vez leído el presente contrato, el paciente declara que ha comprendido su contenido, que le fue debidamente informado el procedimiento y tratamiento a realizar, y que acepta todas las condiciones aquí establecidas.',
        ],
    },
    {
        id: 'laser-drug-delivery-vulvar',
        title: 'CONSENTIMIENTO INFORMADO – LÁSER DRUG DELIVERY Y/O PEELING PARA HIPOPIGMENTACIÓN VULVAR',
        treatment: 'Láser Drug Delivery y/o Peeling para Hipopigmentación Vulvar',
        profesional: 'Dra. María Laura Villarroel',
        introduction: 'Declaro que he sido debidamente informada y aclarada sobre el procedimiento de Láser Drug Delivery y/o Peeling en el área genital femenina para hipopigmentación. Con Drug Delivery: se aumenta la permeación de activos aclarantes y se mejora la textura y calidad de la piel. Con Peeling genital: se promueve la renovación celular y la uniformización del tono de la piel. Los resultados varían según la respuesta individual y el oscurecimiento de la hiperpigmentación genital es un proceso crónico que requiere mantenimiento continuo; no existe tratamiento definitivo para esta condición.',
        beneficios: [
            'Laser Drug Delivery: Aumento de la permeación de activos aclarantes en la zona.',
            'Laser Drug Delivery: Mejora de la textura y calidad de la piel.',
            'Peeling genital: Renovación celular en la región tratada.',
            'Peeling genital: Uniformización del tono de la piel.',
        ],
        efectosSecundarios: [
            'Enrojecimiento, leve hinchazón y sensación de ardor en la zona tratada.',
            'Descamación de la piel tratada y sensación de resequedad.',
            'Formación de costras finas, especialmente después del peeling.',
            'Irritación y sensibilidad prolongada en la región tratada.',
            'Hiperpigmentación post-inflamatoria (manchas oscuras), principalmente si hay exposición solar inadecuada durante la recuperación.',
            'Infecciones secundarias si el área tratada es manipulada inapropiadamente o expuesta a agentes contaminantes.',
            'Reacción inflamatoria exacerbada que puede derivar en edema prolongado y malestar.',
        ],
        contraindicaciones: [
            'El procedimiento puede requerir múltiples sesiones para optimizar los resultados.',
            'Las sesiones de mantenimiento son necesarias; factores hormonales, fricción, irritantes, depilación y envejecimiento influyen en la durabilidad.',
            'Los resultados varían según la respuesta individual, hidratación, exposición solar y cuidados en casa.',
        ],
        cuidados: [
            'Evitar la exposición solar directa en la región tratada; usar protección adecuada para evitar hiperpigmentación post-inflamatoria.',
            'Mantener la hidratación de la piel según orientaciones médicas para optimizar la regeneración del tejido.',
            'Evitar el uso de ropa muy ajustada en los primeros días para no causar fricción excesiva.',
            'No retirar las costras o descamaciones manualmente; puede comprometer el resultado y generar manchas o cicatrices.',
            'Seguir rigurosamente las orientaciones médicas sobre los productos permitidos en la región durante la recuperación.',
            'Informar de inmediato al médico ante cualquier síntoma inesperado o adverso posterior al procedimiento.',
        ],
    },
    {
        id: 'consentimiento-estetico-pena',
        title: 'CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTOS ESTÉTICOS',
        treatment: 'Procedimientos Faciales y/o Corporales Estéticos',
        profesional: 'Dra. Elga Viviana Peña de Falcón',
        introduction: 'Yo, o quien suscribe en representación del paciente, declaro que toda la información suministrada es veraz y fidedigna. Autorizo a la Dra. Elga Viviana Peña de Falcón (RUT 26.756.102-8) a realizar procedimientos faciales y/o corporales con fines estéticos, los cuales han sido explicados de forma clara y comprensible. En caso de actuar como representante de un tercero (ej. menor de edad), suscribo este consentimiento en nombre del representado. Declaro comprender la naturaleza del procedimiento, los resultados esperados, las posibles complicaciones y riesgos, y que he tenido la oportunidad de realizar todas las preguntas necesarias, recibiendo respuestas satisfactorias.',
        beneficios: [],
        efectosSecundarios: [],
        contraindicaciones: [],
        cuidados: [],
    },
    {
        id: 'cirugia-maxilofacial',
        title: 'CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTOS DE CIRUGÍA MAXILOFACIAL Y ESTÉTICA FACIAL',
        treatment: 'Cirugía Maxilofacial y Estética Facial',
        profesional: 'Dr. Luis Pérez',
        introduction: 'En pleno uso de mis facultades mentales, declaro haber sido informado(a) de manera clara, suficiente y comprensible por el Dr. Luis Pérez, médico cirujano maxilofacial, acerca de los procedimientos que se detallan. Este consentimiento es válido de manera general y conjunta para TODOS los procedimientos realizados por el Dr. Luis Pérez y su equipo, incluyendo: Bichectomía, Blefaroplastía superior, Blefaroplastía inferior, Lipoaspiración cervical y facial, Lifting cervical, Otoplastía, Browlift indirecto, Liplift y Mentoplastía. Dichos procedimientos tienen carácter estético y/o funcional, son voluntarios y no esenciales para la preservación de la vida o salud general.',
        beneficios: [
            'Mejora de la armonía facial, el contorno y la apariencia estética, de acuerdo con las características individuales.',
            'En algunos procedimientos, mejora de la función anatómica además del aspecto estético.',
            'Los resultados se realizan conforme a evaluación clínica previa y lex artis médica.',
        ],
        efectosSecundarios: [
            'Dolor, inflamación y edema postoperatorio.',
            'Hematomas y equimosis.',
            'Infección.',
            'Sangrado.',
            'Alteraciones de la cicatrización.',
            'Asimetrías o irregularidades estéticas.',
            'Resultados no satisfactorios según expectativas personales.',
            'Alteraciones transitorias o permanentes de la sensibilidad.',
            'Lesión de estructuras anatómicas vecinas.',
            'Necesidad de procedimientos adicionales o correctivos.',
            'Reacciones adversas a anestesia local o general.',
            'Pueden presentarse complicaciones poco frecuentes o imprevisibles aun actuando con técnica adecuada.',
        ],
        contraindicaciones: [
            'Los resultados pueden variar de un paciente a otro según anatomía, condiciones de salud, proceso de cicatrización y cumplimiento de indicaciones médicas.',
            'No existen garantías absolutas respecto a los resultados finales, la simetría perfecta ni la duración de los resultados.',
            'La no realización de estos procedimientos no implica riesgo para la salud general; existen alternativas conservadoras.',
        ],
        cuidados: [
            'Es fundamental cumplir estrictamente las indicaciones pre y postoperatorias entregadas por el médico.',
            'Asistir a todos los controles médicos programados; el incumplimiento puede afectar los resultados y aumentar el riesgo de complicaciones.',
            'Exonero al Dr. Luis Pérez, a su equipo médico y al centro donde se realicen los procedimientos, de responsabilidad por complicaciones inherentes siempre que se haya actuado conforme a la lex artis médica.',
            'Mi decisión de someterme a uno o más procedimientos mencionados es libre, consciente y voluntaria, sin presiones externas de ningún tipo.',
        ],
    },
    {
        id: 'tratamiento-intimo-femenino-laser',
        title: 'CONSENTIMIENTO INFORMADO TRATAMIENTO ÍNTIMO FEMENINO (LÁSER, RADIOFRECUENCIA Y ULTRASONIDO)',
        treatment: 'Tratamiento Íntimo Femenino con Láser, Radiofrecuencia y Ultrasonido',
        profesional: 'Dra. María Laura Villarroel Reyes',
        introduction: 'Declaro que he sido debidamente informada y aclarada respecto del procedimiento de aplicación de tecnologías genitales femeninas, incluyendo láser, radiofrecuencia y ultrasonido microfocalizado. El procedimiento tiene como objetivo mejorar aspectos funcionales y estéticos de la zona genital femenina. El tratamiento se realiza en múltiples sesiones; el protocolo inicial es de aproximadamente tres sesiones cada 4 a 6 semanas. Postergar los tiempos recomendados es responsabilidad de la paciente y puede afectar los resultados.',
        beneficios: [
            'Canal vaginal: Reducción de la laxitud vaginal; tratamiento de la atrofia y sequedad vaginal; cicatrización de fisuras vaginales; mejora del liquen esceroatrófico y otras condiciones dermatológicas de la mucosa vaginal.',
            'Zona genital externa: Mejora de la calidad de la piel de la región vulvar y labios mayores; aumento de la firmeza y sostén tisular; aclaramiento de la zona; retracción de labios menores y capuchón clitorídeo.',
            'Los resultados no son comparables a los de una cirugía (labioplastia u otros) y no sustituyen dichos procedimientos.',
        ],
        efectosSecundarios: [
            'Quemaduras de la piel o mucosa que pueden causar dolor, cicatrices o alteraciones en la pigmentación local.',
            'Cambios en la sensibilidad: disminución o aumento de la sensibilidad local (transitorios o permanentes).',
            'Aplicación vaginal: es común una secreción serosanguinolenta durante los primeros días.',
            'Aplicación vaginal: puede presentarse leve exacerbación temporal de la incontinencia urinaria durante las dos primeras semanas (en pacientes con este antecedente).',
        ],
        contraindicaciones: [
            'Se requieren sesiones de mantenimiento para prolongar los efectos, ya que el envejecimiento y la degradación de tejidos continúa con el tiempo.',
            'Factores como terapia de reemplazo hormonal, estilo de vida, hidratación y hábitos de depilación pueden influir directamente en los resultados.',
            'Puede ser necesaria la combinación de diferentes abordajes terapéuticos para optimizar los resultados según cada caso.',
        ],
        cuidados: [
            'Informar oportunamente a la médica tratante ante cualquier síntoma inesperado o adverso posterior al procedimiento.',
            'La adherencia al seguimiento médico y a las sesiones de mantenimiento es esencial para asegurar mejores resultados y evitar complicaciones.',
        ],
    },
    {
        id: 'rellenos-bioestimuladores-genitales',
        title: 'CONSENTIMIENTO INFORMADO – RELLENOS, BIOESTIMULADORES Y BIORREMODELADORES TISULARES',
        treatment: 'Rellenos, Bioestimuladores y Biorremodeladores Tisulares (Área Genital)',
        profesional: 'Dra. María Laura Villarroel Reyes',
        introduction: 'Declaro que he sido debidamente informada sobre el procedimiento de aplicación de rellenos, bioestimuladores y biorremodeladores tisulares en el área genital femenina. El procedimiento busca mejorar aspectos funcionales y estéticos de la zona genital externa: mejora de la calidad de la piel de los labios mayores, aumento de la firmeza y soporte tisular, suavización de arrugas y flacidez, y voluminización del área (en caso de rellenos). El procedimiento es temporal y requiere sesiones de mantención cada 3 semanas para obtener resultados efectivos.',
        beneficios: [
            'Mejora de la calidad de la piel de los labios mayores.',
            'Aumento de la firmeza y del soporte tisular en la región genital externa.',
            'Suavización de arrugas y flacidez en la región.',
            'Voluminización y embellecimiento del área genital femenina (en caso de rellenos).',
        ],
        efectosSecundarios: [
            'Primeros días: inflamación, leve dolor, pequeños sangrados y formación de nódulos (esperado; forma parte del proceso).',
            'El producto puede ser palpable en la región tratada, especialmente en zonas con poca grasa (en caso de rellenos).',
            'Reacciones inmunológicas al producto, aunque son raras.',
            'Oclusión vascular y necrosis, que pueden provocar daño en la piel y tejidos subyacentes.',
            'Embolia pulmonar: evento extremadamente raro pero descrito en la literatura médica.',
            'Otras reacciones: enrojecimiento intenso, inflamación anormal, dolor persistente, hematomas extensos, nódulos dolorosos, fiebre o dificultad respiratoria.',
        ],
        contraindicaciones: [
            'El procedimiento es temporal; se requieren sesiones de mantención para preservar los resultados.',
            'Factores como terapia de reemplazo hormonal, variaciones de peso y estilo de vida pueden influir en la duración y calidad del resultado.',
        ],
        cuidados: [
            'Informar de inmediato al médico ante cualquier síntoma adverso (dolor persistente, nódulos, fiebre, dificultad respiratoria).',
            'El seguimiento médico adecuado es fundamental para prevenir complicaciones y garantizar el mejor resultado posible.',
        ],
    },
    {
        id: 'telangiectasias-escleroterapia-laser',
        title: 'CONSENTIMIENTO INFORMADO – TRATAMIENTO DE TELANGIECTASIAS Y VENAS RETICULARES CON ESCLEROTERAPIA Y LÁSER VASCULAR (M22)',
        treatment: 'Telangiectasias y Venas Reticulares (Escleroterapia y Láser M22)',
        introduction: 'Presento venas superficiales en las piernas (telangiectasias y/o venas reticulares), principalmente de carácter estético. El tratamiento puede incluir, en una o varias sesiones: Escleroterapia con polidocanol (inyección de un medicamento dentro de las venas para cerrarlas y que el cuerpo las reabsorba) y/o Láser/Luz Pulsada Vascular M22 (aplicación de energía luminosa sobre la piel para coagular y cerrar los vasos dilatados). El médico puede usar uno o ambos métodos según la evaluación del caso. El objetivo es mejorar el aspecto estético y, en algunos casos, aliviar molestias leves. No se garantiza la desaparición total de todas las venas ni que no aparezcan nuevas en el futuro.',
        beneficios: [],
        efectosSecundarios: [
            'Dolor o molestia durante o después del tratamiento.',
            'Hematomas, inflamación o enrojecimiento local.',
            'Manchas en la piel (hiperpigmentación o aclaramiento), que pueden ser prolongadas o raramente permanentes.',
            '"Matting": aparición de pequeñas venitas finas en la zona tratada.',
            'Ampollas, costras o pequeñas quemaduras cutáneas; muy raramente quemaduras más profundas o cicatrices.',
            'Reacciones alérgicas al medicamento esclerosante; en casos excepcionales graves (anafilaxia).',
            'La combinación de escleroterapia y láser en una misma zona puede aumentar la inflamación, el riesgo de hematomas y manchas.',
        ],
        contraindicaciones: [],
        cuidados: [
            'He recibido información clara sobre el procedimiento, sus beneficios, riesgos y alternativas, con respuestas satisfactorias a mis preguntas.',
            'Entiendo que el resultado es variable y que no se garantiza un resultado estético perfecto ni la desaparición total y definitiva de las venas.',
        ],
    },
    {
        id: 'engrosamiento-peneano-ha',
        title: 'CONSENTIMIENTO INFORMADO – ENGROSAMIENTO PENEANO CON ÁCIDO HIALURÓNICO',
        treatment: 'Engrosamiento Peneano con Ácido Hialurónico',
        introduction: 'En pleno uso de mis facultades, declaro haber sido informado de manera clara y comprensible sobre el procedimiento de engrosamiento peneano con ácido hialurónico, sus alcances, beneficios, limitaciones y posibles riesgos. Es un procedimiento estético, voluntario y no esencial para la salud, cuyo objetivo es mejorar el grosor y volumen del pene mediante la infiltración de ácido hialurónico, sustancia biocompatible y reabsorbible. El efecto es temporal, con una duración estimada de 6–24 meses según factores individuales; no existen garantías absolutas de resultado ni de duración exacta.',
        beneficios: [
            'Puede aumentar el grosor peneano, con variaciones individuales en cada paciente.',
            'El ácido hialurónico es una sustancia biocompatible y reabsorbible.',
        ],
        efectosSecundarios: [
            'Dolor, inflamación, equimosis o hematomas en la zona tratada.',
            'Infección local.',
            'Reacción adversa al material infiltrado.',
            'Asimetrías, irregularidades o resultados estéticos no satisfactorios.',
            'Migración o reabsorción irregular del producto.',
            'Necesidad eventual de procedimientos correctivos.',
            'Aun aplicándose con técnica adecuada y materiales certificados, siempre existe un margen de riesgo inherente.',
        ],
        contraindicaciones: [
            'La no realización del procedimiento no conlleva ningún riesgo para la salud general, dado que se trata de una intervención exclusivamente estética.',
        ],
        cuidados: [
            'Exonero de toda responsabilidad al equipo médico y al centro donde se realice el procedimiento, respecto de complicaciones inherentes o reacciones adversas, siempre que se haya actuado conforme a la lex artis médica.',
            'Confirmo que mi decisión es totalmente libre, informada y voluntaria, sin presiones de ningún tipo.',
            'Declaro haber comprendido toda la información recibida y haber recibido respuestas satisfactorias a todas mis preguntas.',
        ],
    },
    {
        id: 'implante-capilar-fue',
        title: 'CONSENTIMIENTO INFORMADO - IMPLANTE CAPILAR (TÉCNICA FUE)',
        treatment: 'Implante Capilar FUE',
        profesional: 'Dra. Javiera Araya Medina',
        introduction: 'He sido informado(a) de que me realizaré una cirugía de implante capilar mediante técnica FUE (Follicular Unit Extraction), la cual consiste en extraer unidades foliculares de la zona donante (generalmente occipital y temporal) e implantarlas en la zona receptora previamente definida con la doctora. La cirugía puede incluir la administración de anestesia local y, si es necesario, sedantes.',
        beneficios: [],
        efectosSecundarios: [
            'Frecuentes: Dolor, sangrado, inflamación e infección en la zona tratada.',
            'Frecuentes: Cicatrización en zona donante o receptora.',
            'Frecuentes: Pérdida transitoria de cabello (shock loss).',
            'Frecuentes: Crecimiento irregular o insuficiente de los folículos implantados.',
            'Frecuentes: Reacciones alérgicas a medicamentos o anestesia.',
            'Menos frecuentes: Formación de queloides o cicatrices evidentes.',
            'Menos frecuentes: Necrosis o daño en la piel del cuero cabelludo.',
            'Menos frecuentes: Insensibilidad persistente o permanente en la zona tratada.',
            'Menos frecuentes: Pérdida parcial o total de los folículos implantados o donantes.',
        ],
        contraindicaciones: [
            'Los resultados finales dependen de factores biológicos, genéticos y de respuesta individual, pudiendo variar entre pacientes.',
            'Los folículos implantados son limitados; la alopecia puede continuar progresando en áreas no tratadas y podría requerirse nuevos procedimientos en el futuro.',
            'Los resultados cosméticos no son totalmente predecibles y pueden requerirse retoques o cirugías adicionales.',
            'El procedimiento puede prolongarse más de lo previsto según la calidad y cantidad de folículos disponibles.',
            'La cirugía requiere el rasurado parcial o total de la zona donante.',
            'En algunos casos puede ser necesario suspender o interrumpir el procedimiento por motivos de seguridad clínica.',
        ],
        cuidados: [
            'Me comprometo a asistir a todos los controles médicos posteriores en las fechas y frecuencia que indique el equipo tratante.',
            'En caso de complicaciones o situaciones imprevistas, seguiré estrictamente los protocolos médicos y tratamientos indicados por el profesional tratante.',
            'Declaro que entregaré información veraz y completa sobre mi historia médica, medicamentos, alergias, antecedentes quirúrgicos y hábitos (tabaco, alcohol, drogas) que pudieran afectar el procedimiento o la recuperación.',
            'Comprendo que la responsabilidad profesional recae sobre el equipo médico tratante, y que Clínica Cialo actúa como prestadora de servicios de salud entregando infraestructura, insumos y apoyo logístico.',
            'En caso de no presentarme el día de la cirugía sin aviso previo, o cancelar con menos de 5 días de anticipación, la clínica podrá aplicar un cargo administrativo o retener parte del monto abonado.',
            'Reconozco que he sido informado de mis derechos y deberes como paciente según la Ley N° 20.584, y acepto voluntariamente este consentimiento habiendo recibido respuesta satisfactoria a todas mis preguntas.',
        ],
    },
];
