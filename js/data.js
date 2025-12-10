/**
 * Data Module
 * Contiene todos los datos estáticos de la aplicación
 */

const protocolRules = [
    { number: "1", title: "Presentación Inicial", content: `ONLINE: "Hola, hablas con Martina de Clínica Cialo. Estaré encantada de ayudarte y resolver tus dudas 😊"\nPRESENCIAL: Buenos días/buenas tardes, bienvenido/a a Clinica Cialo. ¿En qué te podemos ayudar?` },
    { number: "2", title: "Nunca dejar en visto", content: `Todos los mensajes se responden. Si no sabes, avisa: "Estoy revisando la información para entregártela enseguida 🙌"\nNUNCA culpar a un paciente, siempre velar por darle solución.` },
    { number: "3", title: "Tiempo de Respuesta", content: `Máximo 10 min. Si hay carga: "Disculpe la demora en responder, son demasiados los mensajes que nos llegan 😩. Ya te ayudo con tu consulta."` },
    { number: "4", title: "Cierre de Respuesta", content: `Todas las respuestas de tratamientos deben finalizar con: "¿Deseas que agendemos tu cita?"\nEn general, terminar con pregunta para mantener activo: "¿Quieres que te enviemos la disponibilidad?" / "¿Prefieres que te mande fotos de resultados?"` },
    { number: "5", title: "Escalamiento", content: `Si no sabes, consulta a Natacha, Pablo o Nicolás. NUNCA INVENTAR ni dar información poco clara.` },
    { number: "6", title: "Manejo de Precios", content: `Si no conoces un valor exacto: "Para confirmarte el valor exacto, voy a consultar de inmediato con el equipo. Te escribo en un momento 🙌"` },
    { number: "7", title: "Estilo Comunicación", content: `Amable, cercano y profesional. Siempre con emojis moderados que transmitan calidez, pero sin abuso. Evitar mensajes secos de una palabra.` },
    { number: "8", title: "Principios Clave", content: `Disponibilidad total: que el paciente siempre sienta que es prioridad.\nEmpatía activa: "Te entiendo perfectamente", "Es una excelente pregunta", "Nos pasa mucho en estos casos".\nLenguaje positivo: nunca "no se puede"; cambiar por "Lo verifico de inmediato" o "Busquemos la mejor opción para ti".` },
    { number: "9", title: "Ambiente Sala Espera", content: `Música moderada. PROHIBIDO género urbano/reguetón. Reportar suciedad a Aseo inmediatamente para mantener la clínica impecable.` },
    { number: "10", title: "Área de Mesón", content: `Mantener siempre ordenado, con mínima cantidad de objetos en superficie. PROHIBIDO comer ("picotear") frente a pacientes. No puede quedar ningún residuo a la vista.` },
    { number: "11", title: "Uso Computador", content: `Volumen activo para escuchar alertas de Reservo. Especial atención a cambios de valores de pago.` },
    { number: "12", title: "Pacientes Tratamientos Láser", content: `Consultar proactivamente si desea productos post-láser:\n• Agua termal (calmar y refrescar)\n• Cicalfate (regeneración cutánea)\nPregunta directa: "¿Quieres que te llevemos agua termal o Cicalfate para tu recuperación post láser?"\nLas cremas pueden cambiar según stock.` },
    { number: "13", title: "Aviso Suspensión Dr.", content: `Si un paciente cancela a última hora y el profesional tiene agenda reducida ese día, AVISAR DE INMEDIATO. Permite reorganizar jornada y evitar tiempos muertos. Nunca omitir esta comunicación.` },
    { number: "14", title: "Suspensión Paciente", content: `Si cancela con tiempo, preguntar CUÁNDO reagenda (dar por hecho la continuidad). Nunca preguntar "si desea reagendar".\nEjemplo: "¿Qué día y horario te acomoda para reagendar tu cita?" / "Tenemos disponibilidad el día ___ a las ___ horas, ¿te acomoda?"` },
    { number: "15", title: "Oferta de Horarios", content: `Dar opciones cerradas, evitando preguntas abiertas. Dar por hecho que el paciente ya está concretando.\nCorrecto: "¿Le acomoda jueves o viernes?" / "¿Prefiere en horario de mañana o al mediodía?"\nIncorrecto: "¿Le gustaría agendar una hora?"` },
    { number: "16", title: "Evaluaciones Dr. Nicolás Laucirica", content: `EVALUACIONES GRATUITAS:\n📅 Días: Lunes, Martes, Jueves y Viernes\n🕐 Horarios: 9:00 AM, 12:00 PM y 15:00 PM\n\n💰 EVALUACIONES CON COSTO ($30.000):\nCualquier horario fuera de los mencionados anteriormente.\n\n⚠️ IMPORTANTE: Informar al paciente sobre esta política al momento de agendar para evitar confusiones.` },
    { number: "17", title: "Protocolo de Pago Consultas Médicas", content: `OBLIGATORIO para consultas médicas (Urólogo, Kinesiólogos, Matrona, etc.):\n\n1️⃣ PAGO PREVIO: El paciente DEBE pagar ANTES de ingresar a la consulta.\n\n2️⃣ DOCUMENTACIÓN: Entregar al paciente:\n   • Boleta de pago\n   • Comprobante de atención impreso\n\n3️⃣ INSTRUCCIÓN AL PACIENTE: "Por favor, solicita al profesional que timbre y firme tu comprobante de atención al finalizar la consulta."\n\n4️⃣ VERIFICACIÓN: Asegurar que el paciente tenga ambos documentos antes de ingresar.\n\n⚠️ IMPORTANTE: Sin pago previo, NO se permite el ingreso a la consulta. Sin excepciones.` }
];

const paymentPolicies = [
    { title: "Protocolo de Cobro en Vivo", content: "1. Iniciar cordial: '¿Cómo te fue?'\n2. Informar valor COMPLETO: 'Ciento veinte mil pesos' (nunca solo el número)\n3. Preguntar medio: '¿Efectivo o tarjeta?'\n4. Despedida: 'Muchas gracias. En caso de cualquier duda, nos puedes contactar vía WhatsApp o llamado.'", type: "General" },
    { title: "Datos de Transferencia Cialo", content: "Centro Médico Cialo SPA\nRUT: 78.155.814-1\nBanco Santander — Cuenta Corriente Nº 0-000-9779419-7\nMail: pagos@cialo.cl\n\n📌 Obligatorio: solicitar a Natacha o Nicolás la revisión de la transferencia antes de confirmar la cita.", type: "General" },
    { title: "Datos de Transferencia Cialo Facial", content: "Cialo Facial SPA\nRUT: 78.024.821-1\nBanco Santander — Cuenta Corriente Nº 0000-9648-3139\nMail: pagos@cialo.cl\n\n📌 Obligatorio: solicitar a Natacha o Nicolás la revisión de la transferencia antes de confirmar la cita.", type: "General" },
    { title: "Datos de Transferencia Horus Skincare", content: "Horus Skincare\nRUT: 77.576.241-1\nBanco Santander — Cuenta Corriente Nº 87068706\nMail: pagos@cialo.cl\n\n📌 Para pagos de productos de vitrina.\n📌 Obligatorio: solicitar a Natacha o Nicolás la revisión de la transferencia antes de confirmar.", type: "General" },
    { title: "Link de Pago Clínica Cialo", content: "Para pagos de tratamientos de Clínica Cialo:\nmicrositios.getnet.cl/cialo\n\nEnviar este link al paciente para que realice el pago online de forma segura.", type: "General" },
    { title: "Link de Pago Cialo Facial", content: "Para pagos de tratamientos faciales:\nmicrositios.getnet.cl/cialofacial\n\nEnviar este link al paciente para que realice el pago online de forma segura.", type: "General" },
    { title: "Link de Pago Productos", content: "Para pagos de productos:\nmicrositios.getnet.cl/productocialo\n\nEnviar este link al paciente para que realice el pago de productos de forma segura.", type: "General" },
    { title: "Mensaje Base Confirmación", content: "(Nombre), quedó agendada tu cita con [PROFESIONAL] el día __ de __ a las __ horas.\nLa dirección es: Bulnes 220, oficina 509, Clínica Cialo – Edificio Puerto Mayor II, Los Ángeles\nAcá te dejamos un link con la ubicación: https://maps.app.goo.gl/PyeYcr4JdqW7iJ4G9\n\n[Insertar Política de Cancelación correspondiente]", type: "General" },
    { title: "Política Corporal", content: "Evaluación gratuita. Si cancelas con menos de 24 horas de anticipación, para reagendar se solicitará un abono de $10.000 vía transferencia. Este abono será descontado de tu presupuesto de tratamiento.", type: "Corporal" },
    { title: "Política Urología", content: "Cita $50.000 (Reembolsable). Pago el mismo día antes de ingresar. En caso de cancelar con menos de 24 horas o inasistencia sin aviso: para reagendar deberás pagar el valor de la consulta por anticipado vía transferencia.", type: "Medica" },
    { title: "Política Matrona", content: "Cita $30.000 (Reembolsable). En caso de cancelar con menos de 24 horas o inasistencia sin aviso: para reagendar deberás pagar el valor de la consulta por anticipado vía transferencia.", type: "Medica" },
    { title: "Política Dra. Kiss", content: "Evaluación gratuita. Si cancelas con menos de 24 horas de anticipación, para reagendar se solicitará un abono de $10.000 vía transferencia. Este abono será descontado de tu presupuesto de tratamiento.", type: "Estetica" },
    { title: "Política Dra. Araya", content: "Cita $40.000 (Reembolsable). Pago el mismo día antes de ingresar. En caso de cancelar con menos de 24 horas o inasistencia sin aviso: para reagendar deberás pagar el valor de la consulta por anticipado vía transferencia.", type: "Medica" },
    { title: "Política Dr. Luis Pérez", content: "Cita $40.000 (Reembolsable). Pago el mismo día antes de ingresar. En caso de cancelar con menos de 24 horas o inasistencia sin aviso: para reagendar deberás pagar el valor de la consulta por anticipado vía transferencia.", type: "Medica" }
];

const scriptsData = {
    Gestion: [
        { title: "Confirmación de Asistencia (Llamado 48hrs)", content: `"Hola, buenos días/buenas tardes, hablas con ___ de Clínica Cialo. Te llamaba para confirmar tu asistencia a tu cita con ___ el día ___ a las ___ horas.\n¿Confirmas tu asistencia?"`, note: "Realizar 48 horas antes. Máximo 2 intentos. Si no contesta, pasar a WhatsApp." },
        { title: "Confirmación WhatsApp (tras no contestar)", content: `"¡Hola! ¿Cómo estás? Te llamábamos desde Clínica Cialo para confirmar tu asistencia a tu cita con ___ el día ___ a las ___ horas.\n¿Confirmas tu cita? En caso de no poder asistir, agradeceríamos cancelarla con anticipación 🙏\nQuedo atenta a tu respuesta"` },
        { title: "Segundo Llamado + Mensaje Final (24hrs)", content: `"¡Hola! Hemos intentado comunicarnos contigo vía teléfono, correo y WhatsApp para confirmar tu asistencia a tu cita de mañana.\nAgradeceríamos mucho tu respuesta para que así no figures en nuestro sistema como inasistente sin previo aviso. 🙏"`, note: "Enviar solo si no respondió al primer WhatsApp. Realizar 24 horas antes." },
        { title: "Inasistencia (No Show)", content: `"Hola, ¿cómo estás? Te estuvimos esperando el día de hoy en tu cita.\n¿Ocurrió algo? ¿Te gustaría reagendar tu hora?"`, note: "Registrar como inasistente en Reservo. Si desea reagendar: Informar cobro de abono." },
        { title: "Cobro de Abono por Inasistencia", content: `"Para reagendar, el sistema nos solicita un abono previo debido a la inasistencia sin aviso.\nEste abono se descuenta del valor de tu consulta o del presupuesto de tu tratamiento el día de la cita.\n¿Deseas que te enviemos los datos para realizar la reserva?"\n\nAl reagendar informar: "Ud. puede realizar una modificación de la cita hasta 48 horas hábiles antes. En caso de cancelar después de ese plazo, el abono no es reembolsable."` },
        { title: "Solicitud de Boleta", content: `"¡Hola! Para emitir tu boleta necesitamos los siguientes datos:\n\n📋 Nombre completo\n📋 RUT\n📋 Correo electrónico\n📋 Dirección completa\n\nUna vez que nos envíes esta información, procesaremos tu boleta y te la enviaremos al correo indicado.\n\n¿Me podrías confirmar estos datos?"`, note: "Recopilar todos los datos antes de emitir la boleta." },
        { title: "Solicitud de Reembolso", content: `"¡Hola! Para procesar tu solicitud de reembolso con tu isapre o seguro, necesitamos emitir una boleta con los siguientes datos:\n\n📋 Nombre completo\n📋 RUT\n📋 Correo electrónico\n📋 Dirección completa\n\nLa boleta será enviada a tu correo y podrás presentarla directamente en tu isapre o seguro para solicitar el reembolso según tu plan de cobertura.\n\n¿Me podrías confirmar estos datos?"`, note: "Recordar que el reembolso depende del plan de cada paciente con su isapre/seguro." },
        { title: "Solicitud de Datos Completos", content: `"¡Hola! Para poder registrarte en nuestro sistema y agendar tu cita, necesito que me confirmes los siguientes datos:\n\n📋 Nombre completo\n📋 RUT\n📋 Correo electrónico\n📋 Teléfono de contacto\n\n¿Me podrías confirmar esta información?"`, note: "Usar para nuevos pacientes o actualización de datos." },
        { title: "Clausura por Reagendamientos Excesivos", content: `"Hola, ¿cómo estás? Te escribo porque hemos notado que has reagendado tu tratamiento en múltiples ocasiones.\n\nEntendemos que pueden surgir imprevistos, sin embargo, cada vez que reagendas, estamos bloqueando un cupo que otro paciente podría necesitar.\n\nPara poder continuar con tu tratamiento, necesitamos que confirmes una fecha definitiva y te comprometas a asistir. De lo contrario, lamentablemente tendremos que proceder con la clausura de tu tratamiento.\n\nEl valor pagado quedaría como crédito a favor para cuando estés en condiciones de retomar el tratamiento de forma comprometida.\n\n¿Podemos coordinar una fecha definitiva?"`, note: "Usar después de 3+ reagendamientos. Consultar con supervisor antes de enviar." },
        { title: "Cancelación Tardía (Tratamiento No Pagado)", content: `"Hola, hablas con Mónica de Clínica Cialo. Por políticas de nuestra clínica, si no te presentas a tu cita o cancelas con menos de 24 horas de anticipación, para reagendar se solicitará un abono de $10.000 vía transferencia. Este abono será descontado de tu presupuesto de tratamiento.\n\n¿Deseas que te enviemos los datos para realizar el abono y reagendar tu cita?"`, note: "Solo para tratamientos NO pagados. Si ya está pagado, usar otro protocolo." },
        { title: "Recetas Médicas Listas", content: `"Hola [NOMBRE], buenas tardes 🌿\n\nVimos tu mensaje respecto a las recetas que solicitaste y entendemos que estás quedando con poco medicamento, sobre todo considerando que son formulaciones magistrales y se demoran en la farmacia.\n\nTe cuento que tus recetas ya están listas y firmadas por el médico.\n\nLas puedes retirar impresas en Clínica CIALO (Bulnes 220, oficina 509, Edificio Puerto Mayor II, Los Ángeles).\n\nGracias por escribirnos y por la paciencia. 🙌\n\nClínica CIALO 💚"`, note: "Personalizar con el nombre del paciente. Usar para notificar recetas listas." }
    ],
    Estetica: [
        { title: "Polinucleótidos (Dra. Kiss)", content: `En Clínica Cialo ofrecemos tratamientos con polinucleótidos, una de las terapias más avanzadas en bioestimulación y rejuvenecimiento cutáneo.\n\nSus principales beneficios son:\n✨ Estimulan la producción de colágeno y elastina, mejorando la firmeza y elasticidad de la piel.\n👁️ Reducen arrugas finas y ojeras en la zona periocular.\n🌟 Mejoran la calidad, textura e hidratación global de la piel cuando se aplican en full face.\n💎 Tratamiento seguro, biocompatible y con respaldo científico.\n\nValores por sesión:\n🔹 Zona periocular: $139.000\n🔹 Full face: $190.000\n\n¿Deseas que agendemos tu cita para comenzar tu tratamiento?` },
        { title: "Toxina Botulínica Dysport (Dra. Kiss)", content: `En Clínica Cialo realizamos tratamientos con toxina botulínica Dysport®, reconocida como una de las mejores y más seguras marcas del mundo, con amplio respaldo científico.\n\nSus beneficios incluyen:\n✨ Relajación de las arrugas dinámicas (frente, entrecejo, patas de gallo).\n🌟 Rejuvenecimiento natural, sin alterar la expresión.\n💎 Procedimiento rápido, seguro y con resultados progresivos en pocos días.\n\nValores Dra. Kiss:\n🔹 1 zona: $100.000\n🔹 Tercio superior (frente, entrecejo y patas de gallo): $179.000\n🔹 Full face (rostro completo): $329.000\n\n¿Quieres que coordinemos tu cita para el tratamiento?` },
        { title: "Relleno de Labios (Dra. Kiss)", content: `El valor del tratamiento de labios con Dra Mariane es de $180.000\n\nEs un tratamiento ambulatorio el cual se realiza bajo anestesia local.\nTrabajamos con marca Juvederm de Allergan, la marca de relleno más prestigiosa del mundo.\nLa durabilidad es de 8-12 meses aproximadamente en reabsorberse de manera completa.\n\n¿Desea ud una cita para el tratamiento?` },
        { title: "Ácido Hialurónico (Dra. Kiss)", content: `En Clínica Cialo realizamos tratamientos con ácido hialurónico de la más alta calidad, aplicados por la Dra. Mariane Kiss, especialista en medicina estética.\n\nCon este producto podemos abordar múltiples objetivos como relleno de labios, ojeras, surcos, perfilado mandibular, hidratación y armonización facial.\n\nEl valor de cada tratamiento con ácido hialurónico es de $180.000 por jeringa, ajustando la técnica y la cantidad según tus necesidades.\n\n¿Deseas que coordinemos tu cita con la Dra. Mariane Kiss para este procedimiento?` },
        { title: "CoolPeel (Láser CO2)", content: `Se trata de uno de los protocolos más avanzados en rejuvenecimiento facial no invasivo. Combinamos la última tecnología en láser de CO2 fraccionado superficial (CoolPeel) con exosomas de grado médico para:\n\n✅ Mejorar textura y poros dilatados\n✅ Aumentar luminosidad y firmeza de la piel\n✅ Estimular colágeno sin dañar capas profundas\n✅ Acelerar la recuperación postláser gracias a los exosomas\n\nEs ideal para quienes desean resultados visibles sin tiempos prolongados de reposo ni inflamación significativa.\n\n🔬 Trabajamos con tecnología TetraPro by DEKA, y exosomas Purasome NutriComplex, con evidencia clínica en regeneración dérmica.\n\nValor con Dra Mariane: $190.000 por sesión.\n\n¿Deseas una cita?` },
        { title: "Hilos Revitalizantes (Dra. Kiss)", content: `En Clínica Cialo ofrecemos tratamientos con hilos revitalizantes, realizados por la Dra. Mariane Kiss.\n\nEstos hilos tienen como objetivo estimular la producción natural de colágeno, mejorando la firmeza, textura y calidad de la piel de manera progresiva y natural.\n\nEl valor del tratamiento es de $120.000 por pack, lo que contempla la aplicación de 10 hilos revitalizantes.\n\n¿Deseas que coordinemos tu cita con la Dra. Kiss para este procedimiento?` },
        { title: "Promo Polinucleótidos + Botox", content: `En Clínica Cialo contamos con una promoción exclusiva realizada por la Dra. Mariane Kiss, especialista en medicina estética.\n\n✨ Polinucleótidos → estimulan la producción de colágeno y elastina, mejorando la firmeza, textura e hidratación de la piel.\n🌟 Toxina Botulínica Dysport® → relaja las arrugas dinámicas del tercio superior, logrando un resultado natural y armónico.\n\nValor promoción completa: $269.900\n\n¿Deseas que coordinemos tu cita con la Dra. Mariane Kiss para aprovechar esta combinación de tratamientos?` },
        { title: "Eliminación de Tatuajes", content: `El valor dependerá del tamaño y color del tatuaje. Si deseas puedes enviarme una fotografía para ayudarte en el valor por sesión 😊\n\n(REENVIAR FOTO A DR. NICOLÁS PARA VALOR)\n\nAl entregar presupuesto:\n"El valor de su tatuaje es de ____ por sesión.\n\nContamos con el láser Spectra XT, actualmente el mejor láser del mundo para remoción de tatuajes. Tiene un riesgo de cicatriz mucho menor que los demás láseres.\n\nLa cantidad de sesiones dependerá del tipo de tinta, profundidad, densidad, zona del cuerpo, cantidad de colores, metabolismo del paciente, hábitos, etc. Es difícil determinar una cantidad exacta, pero frecuentemente varían de 5 a 10 sesiones.\n\nLas sesiones se realizan cada 6 semanas, solo pagas la sesión a la que asistes.\n\n¿Desea ud una cita?"` },
        { title: "Sculptra (Bioestimulador)", content: `En Clínica Cialo ofrecemos tratamientos con Sculptra, el bioestimulador de colágeno más avanzado y duradero del mercado.\n\nSculptra es diferente a los rellenos tradicionales porque no solo rellena, sino que estimula la producción natural de colágeno de tu propia piel, logrando resultados progresivos, naturales y de larga duración.\n\nBeneficios principales:\n✨ Restaura el volumen facial perdido de forma gradual y natural\n🌟 Mejora la firmeza y elasticidad de la piel\n💎 Resultados que pueden durar hasta 2 años o más\n🎯 Ideal para rejuvenecimiento facial global, mejillas, sienes y mandíbula\n\nLa evaluación es gratuita para determinar el plan de tratamiento personalizado según tus necesidades.\n\n¿Deseas que agendemos tu evaluación con la Dra. Mariane Kiss?` }
    ],
    Corporal: [
        { title: "Depilación Láser (Soprano Titanium)", content: `En Clínica Cialo trabajamos con Soprano Titanium, considerado el gold standard en depilación láser a nivel mundial.\n\nEsta tecnología combina triple longitud de onda (Alexandrita, Diodo y Nd:YAG), lo que permite tratar todo tipo de pieles y vellos, incluso en pacientes morenos o con vellos resistentes.\n\nAdemás, cuenta con el sistema ICE Plus, un avanzado mecanismo de enfriamiento que protege la piel durante cada disparo, logrando un procedimiento seguro, eficaz y prácticamente indoloro.\n\nLa cantidad de sesiones dependerá de tu tipo de piel, grosor del vello y zona a tratar.\n\nLa evaluación es gratuita, para determinar el plan más adecuado para ti.\n\nPrecios: Tenemos valores tanto por sesión individual como en packs de varias sesiones, además de precios diferenciados según si deseas tratar una zona específica o varias zonas en conjunto.\n\n¿Tienes alguna zona en particular en mente para poder orientarte mejor?\n\nRecuerda que la evaluación es gratuita, donde podremos definir el plan ideal para ti según tu tipo de piel y vello.` },
        { title: "Tratamientos Reductivos", content: `Contamos con una amplia variedad de tratamientos corporales para reductivos, celulitis, estrías y flacidez, siempre ajustados a las necesidades de cada paciente, considerando la cantidad de grasa, IMC, tipo de piel y condiciones médicas.\n\nNuestros protocolos son totalmente personalizados y diseñados en base a una evaluación con nuestro equipo de profesionales.\n\nLa evaluación es gratuita, así podremos asesorarte sobre qué opción es la más adecuada para ti.\n\n¿Quieres que agendemos tu evaluación?` },
        { title: "Post-Láser (Venta Cruzada)", content: `(Preguntar proactivamente): "¿Quieres que te llevemos agua termal o Cicalfate para tu recuperación post láser?"\n\nLas cremas pueden cambiar según stock en vitrina.` },
        { title: "Exilis Ultra 360 (Radiofrecuencia)", content: `En Clínica Cialo contamos con Exilis Ultra 360, la tecnología más avanzada en radiofrecuencia monopolar para tratamientos corporales y faciales no invasivos.\n\nEsta tecnología combina radiofrecuencia y ultrasonido para:\n✨ Reducción de grasa localizada\n🔥 Tratamiento de celulitis\n💪 Reafirmación y tonificación de la piel\n🎯 Remodelación corporal sin cirugía\n\nEs un tratamiento completamente indoloro, sin tiempo de recuperación, que permite retomar actividades normales de inmediato.\n\nLa evaluación es gratuita para diseñar un protocolo personalizado según tus objetivos y zona a tratar.\n\n¿Quieres que agendemos tu evaluación?` },
        { title: "Clatuu (Criolipólisis)", content: `En Clínica Cialo ofrecemos Clatuu, tecnología de criolipólisis de última generación para eliminación de grasa localizada sin cirugía.\n\nClatuu utiliza frío controlado para cristalizar y eliminar las células grasas de forma definitiva, logrando una reducción visible y medible de grasa en las zonas tratadas.\n\nBeneficios principales:\n❄️ Eliminación definitiva de células grasas\n🎯 Ideal para abdomen, flancos, muslos, brazos y papada\n💎 Procedimiento no invasivo, sin agujas ni incisiones\n⏱️ Sin tiempo de recuperación\n📊 Resultados visibles desde la primera sesión, óptimos a los 2-3 meses\n\nLa evaluación es gratuita para determinar si eres candidato ideal y diseñar el plan de tratamiento.\n\n¿Deseas que agendemos tu evaluación?` }
    ],
    Nutricion: [
        { title: "Consulta Nutricional", content: `En Clínica Cialo contamos con 2 nutricionistas altamente calificados: Valentina Verdejo y Walter Zaror, especialistas en planificación personalizada y optimización de resultados.\n\nAdemás, disponemos de la calorimetría indirecta Q-NRG Max, tecnología de última generación que mide de forma precisa tu gasto energético en reposo. Con esta información podemos diseñar planes nutricionales y de entrenamiento totalmente personalizados, asegurando que tus resultados sean efectivos, medibles y sostenibles.\n\n✨ Esta combinación de especialistas + tecnología única en la ciudad convierte tu consulta en una experiencia mucho más completa que una visita nutricional convencional.\n\n¿Deseas que coordinemos tu consulta nutricional?` },
        { title: "Examen InBody 970", content: `En Clínica Cialo contamos con el único InBody 970 disponible en la ciudad, el analizador de composición corporal más avanzado del mundo.\n\nEste examen entrega un informe de 7 páginas con un desglose extremadamente preciso de tu cuerpo: masa muscular segmental, grasa visceral, distribución de líquidos, minerales, proteínas, metabolismo basal y mucho más.\n\nEs considerado el examen de composición corporal más completo del mundo, utilizado en centros médicos de alto nivel, hospitales universitarios y equipos de alto rendimiento deportivo.\n\nEn Cialo lo ponemos a tu disposición como herramienta clave para diseñar planes personalizados de nutrición, entrenamiento y salud.\n\nTienes dos formas de acceder al examen:\n🔹 Solo examen: $15.000 - Obtienes tu reporte completo con todos los indicadores.\n🔹 Examen + interpretación profesional: Incluido en la consulta nutricional ($40.000) - Recibirás evaluación completa, pauta personalizada y orientación profesional.\n\n¿Qué opción te acomoda más?` },
        { title: "Calorimetría Indirecta", content: `En Clínica Cialo contamos con la única Calorimetría Indirecta disponible en Los Ángeles, utilizando el equipo Q-NRG Max, considerado el más avanzado del mundo en este tipo de medición.\n\nEste examen permite conocer con exactitud tu gasto energético en reposo (metabolismo basal) y cómo tu cuerpo utiliza grasas, carbohidratos y proteínas como fuente de energía.\n\n🔹 Con esta información podemos diseñar planes nutricionales y de entrenamiento totalmente personalizados, evitando dietas genéricas y asegurando resultados efectivos, medibles y sostenibles en el tiempo.\n\nEl valor del examen es de $50.000 e incluye la interpretación profesional de los resultados.\n\n¿Deseas que coordinemos tu cita para realizar este examen?` }
    ],
    Medica: [
        { title: "Cirugía Bariátrica (Dr. Andrés Martínez)", content: `En Clínica Cialo contamos con el Dr. Andrés Martínez Serrano, Cirujano Digestivo y Bariátrico certificado por CONACEM.\n\nEl Dr. Martínez realiza evaluaciones y seguimiento de pacientes que requieren cirugía bariátrica (manga gástrica, bypass gástrico) como tratamiento para la obesidad mórbida.\n\n📌 La evaluación es fundamental para determinar si eres candidato a cirugía bariátrica, considerando:\n🔹 Índice de Masa Corporal (IMC)\n🔹 Antecedentes médicos y comorbilidades\n🔹 Intentos previos de pérdida de peso\n🔹 Evaluación psicológica y nutricional\n\nLa consulta médica tiene un valor de $50.000, reembolsable con tu isapre o seguro según tu plan.\n\nEl Dr. Martínez atiende los viernes de 09:00 a 12:00 hrs.\n\n¿Deseas que coordinemos tu consulta de evaluación?` },
        { title: "Cirugía Vascular (Dra. Francisca González)", content: `En Clínica Cialo contamos con la Dra. Francisca González Saldivia, Cirujana Vascular Periférico y Endovascular certificada por CONACEM.\n\nLa Dra. González realiza diagnóstico y tratamiento de patologías vasculares como várices, úlceras venosas, insuficiencia venosa y otras alteraciones del sistema circulatorio.\n\nServicios disponibles:\n🔹 Consulta médica con ecografía doppler incluida: $50.000\n🔹 Escleroterapia (várices pequeñas): $80.000\n🔹 Escleroterapia várices grandes: $400.000 - $500.000\n🔹 Úlceras venosas: Evaluación personalizada\n\nLa Dra. González atiende 3-4 días por semana en horarios de tarde y sábados.\n\n⚠️ Todos los valores son reembolsables con tu isapre o seguro según tu plan.\n\n¿Deseas que coordinemos tu consulta vascular?` },
        { title: "Várices - Escleroterapia (Dra. González)", content: `En Clínica Cialo realizamos tratamiento de várices con escleroterapia, procedimiento realizado por la Dra. Francisca González, Cirujana Vascular certificada.\n\nLa escleroterapia es un tratamiento mínimamente invasivo que consiste en la inyección de una solución especial que cierra las venas varicosas, mejorando tanto la apariencia como los síntomas.\n\nBeneficios:\n✨ Procedimiento ambulatorio, sin cirugía\n💉 Mínimamente invasivo\n⏱️ Sin tiempo de recuperación prolongado\n🎯 Efectivo para várices pequeñas y medianas\n\nValores:\n🔹 Escleroterapia várices pequeñas: $80.000\n🔹 Escleroterapia várices grandes: $400.000 - $500.000\n\nLa consulta previa incluye ecografía doppler ($50.000) para evaluar el sistema venoso y determinar el tratamiento más adecuado.\n\n¿Deseas que agendemos tu evaluación vascular?` },
        { title: "Úlceras Venosas (Dra. González)", content: `En Clínica Cialo tratamos úlceras venosas con la Dra. Francisca González, Cirujana Vascular certificada.\n\nLas úlceras venosas son heridas crónicas que aparecen generalmente en las piernas debido a problemas de circulación venosa. Requieren evaluación y tratamiento especializado para su correcta cicatrización.\n\nLa Dra. González realizará:\n🔹 Evaluación completa con ecografía doppler\n🔹 Diagnóstico del origen de la úlcera\n🔹 Plan de tratamiento personalizado\n🔹 Seguimiento hasta la cicatrización completa\n\nLa consulta médica con ecografía incluida tiene un valor de $50.000 (reembolsable).\n\n¿Deseas que coordinemos tu evaluación?` },
        { title: "Urología - Consulta General", content: `En Clínica Cialo contamos con 2 especialistas certificados en Urología:\n\n👨‍⚕️ Dr. Guillermo Contreras - Inscrito en Superintendencia de Salud\n   📅 Lunes y Miércoles 18:30 - 21:00\n\n👨‍⚕️ Dr. Frank Ulloa - Especialista en Urología\n   📅 Lunes y Jueves desde las 19:00\n\nLa cita médica tiene un costo de $50.000, reembolsable con tu isapre o seguro según tu plan.\n\n⚠️ El pago se realiza el mismo día antes de ingresar a la consulta.\n⚠️ En caso de cancelación con menos de 24 horas o inasistencia, para reagendar será necesario pago anticipado vía transferencia.\n\n¿Deseas que coordinemos tu horario?` },
        { title: "Agrandamiento de Pene (Dr. Contreras / Dr. Ulloa)", content: `El agrandamiento de pene es uno de los tratamientos más solicitados en Clínica Cialo, realizado exclusivamente por médicos urólogos certificados.\n\n👨‍⚕️ Dr. Guillermo Contreras:\nBioplastía de Engrosamiento Peniano con Ácido Hialurónico\n⏱️ Duración: 30 min\n💰 Valor desde $800.000 (según volumen requerido)\n📋 Protocolo: Procedimiento único, control a los 15 días, retoque a los 3-6 meses si necesario\n\n👨‍⚕️ Dr. Frank Ulloa:\nEngrosamiento Peneano con Ácido Hialurónico\n⏱️ Duración: 20 min\n💰 Valor desde $500.000 (según volumen y sesiones)\n\n🔒 Toda tu información es 100% confidencial.\n\n¿Deseas que coordinemos una cita de evaluación?` },
        { title: "Circuncisión (Dr. Contreras)", content: `En Clínica Cialo realizamos circuncisión con el Dr. Guillermo Contreras, Urólogo certificado.\n\nLa circuncisión es una cirugía menor urológica ambulatoria que consiste en la resección del prepucio, indicada por razones médicas (fimosis, infecciones) o estéticas.\n\nCaracterísticas del procedimiento:\n⏱️ Duración: 40 minutos\n🏥 Cirugía ambulatoria en Pabellón Menor\n💉 Anestesia local\n👨‍⚕️ Requiere apoyo de TENS\n🏠 Recuperación en casa\n📋 Controles: 7 y 30 días post-operatorio\n\nLa consulta de evaluación tiene un valor de $50.000 (reembolsable).\n\nEl Dr. Contreras atiende lunes y miércoles de 18:30 a 21:00 hrs.\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Vasectomía (Dr. Contreras)", content: `En Clínica Cialo realizamos vasectomía con el Dr. Guillermo Contreras, Urólogo certificado.\n\nLa vasectomía es una cirugía ambulatoria de esterilización masculina, segura y definitiva.\n\nCaracterísticas:\n⏱️ Duración: 30 minutos\n🏥 Cirugía ambulatoria en Pabellón Menor\n💉 Anestesia local\n👨‍⚕️ Requiere apoyo de TENS\n🏠 Recuperación rápida\n✅ Efectividad superior al 99%\n📋 Control: 2 semanas post-operatorio\n\nLa consulta de evaluación tiene un valor de $50.000 (reembolsable).\n\n¿Deseas que coordinemos tu consulta?` },
        { title: "Frenuloplastía (Dr. Contreras)", content: `En Clínica Cialo realizamos frenuloplastía con el Dr. Guillermo Contreras, Urólogo certificado.\n\nLa frenuloplastía es una cirugía menor para resección parcial o elongación del frenillo prepucial corto, indicada para mejorar función, estética o reducir dolor durante la actividad sexual.\n\nCaracterísticas:\n⏱️ Duración: 15 minutos\n🏥 Sala de procedimientos o Pabellón Menor\n💉 Anestesia local (Lidocaína 2%)\n👨‍⚕️ Requiere apoyo de TENS\n📋 Controles: 7 y 30 días post-operatorio\n\nLa consulta de evaluación tiene un valor de $50.000 (reembolsable).\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Cistoscopia (Dr. Contreras / Dr. Ulloa)", content: `En Clínica Cialo realizamos cistoscopia diagnóstica con nuestros urólogos certificados.\n\nLa cistoscopia es un examen endoscópico que permite visualizar el tracto urinario bajo (uretra y vejiga), indicado en pacientes con:\n🔹 Hematuria (sangre en orina)\n🔹 Litiasis vesical\n🔹 Síntomas urinarios\n🔹 Sospecha o control de tumores vesicales\n\nCaracterísticas:\n⏱️ Duración: 15-20 minutos\n🏥 Sala de procedimientos o Pabellón Menor\n🔬 Equipo: Cistoscopio flexible + Torre de endoscopía\n👨‍⚕️ Requiere apoyo de TENS\n🏠 Alta inmediata\n\n💰 Honorario médico Dr. Ulloa: $200.000\n\n¿Deseas que coordinemos tu cita?` },
        { title: "Varicocele (Dr. Contreras)", content: `En Clínica Cialo tratamos el varicocele con el Dr. Guillermo Contreras, Urólogo certificado.\n\nEl varicocele es la dilatación de las venas del cordón espermático, que puede causar dolor escrotal, infertilidad o atrofia testicular. La varicocelectomía puede mejorar parámetros seminales y aliviar el dolor.\n\nCaracterísticas:\n⏱️ Duración: 45-60 minutos\n🏥 Cirugía Mayor Ambulatoria\n💤 Requiere sedación VEV (anestesia endovenosa)\n👨‍⚕️ Pabellón con apoyo anestésico\n🏠 Recuperación: 30-60 min en clínica + reposo en casa\n📋 Control postoperatorio: 7 y 30 días\n\nLa consulta de evaluación tiene un valor de $50.000 (reembolsable).\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Matrona - Ginecoestética (Stefania Kuncar)", content: `En Clínica Cialo contamos con Stefania Kuncar, Matrona especialista en Ginecoestética y Rejuvenecimiento Íntimo, certificada en Láser CO2 e inserción/extracción de dispositivos anticonceptivos.\n\nServicios disponibles:\n\n� Rejuvenecimiento Íntimo Láser CO2 - 40 min\n   Mejora tonicidad, lubricación y sensibilidad vaginal\n   Protocolo: 3 sesiones iniciales + mantención cada 6-12 meses\n\n🩺 Control Ginecológico - $40.000\n   PAP, VPH, examen de mamas, consejería anticonceptiva\n\n💉 Implantes Anticonceptivos:\n   • Inserción: $50.000 (sin implante)\n   • Extracción: $55.000\n\n🔘 DIU (Mirena/Asertia/Kyleena/T Cobre):\n   • Inserción: $70.000 (sin dispositivo)\n   • Extracción: $50.000\n   • Control post-inserción: $20.000\n\n📋 Revisión de resultados: $25.000\n\n📅 Disponibilidad: Lunes, Martes (desde 16:00), Jueves, Viernes, Sábado\n\n¿Deseas que coordinemos tu consulta?` },
        { title: "Ginecología - Dra. María Laura Villarroel", content: `En Clínica Cialo contamos con la Dra. María Laura Villarroel Reyes, Ginecóloga y Obstetra certificada por CONACEM, especialista en Ginecoestética y Rejuvenecimiento Vaginal.\n\nLa Dra. Villarroel ofrece atención integral en:\n🔹 Ginecología general y obstetricia\n🔹 Ginecoestética láser\n🔹 Rejuvenecimiento vaginal\n🔹 Cirugía estética genital\n🔹 Procedimientos diagnósticos\n\nServicios disponibles:\n✨ Tratamientos láser: Atrofia, Post-parto, Rejuvenecimiento, Lifting vulvar, Blanqueamiento, Estrías\n💎 Cirugía láser: Ninfoplastia (Labioplastia), Manejo glándula de Bartolino\n🔬 Procedimientos: Biopsias vulva/vagina, Extirpación de condilomas\n\nLa Dra. Villarroel cuenta con certificaciones internacionales en:\n• Láser Estética - Rejuvenecimiento Vaginal\n• Labioplastia Segura (World Society of Cosmetic Gynecology)\n• Cirugía Vulvar (Sociedad Iberoamericana)\n\n¿Deseas que coordinemos tu consulta de evaluación?` },
        { title: "Rejuvenecimiento Vaginal Láser (Dra. Villarroel)", content: `En Clínica Cialo realizamos rejuvenecimiento vaginal con láser ginecoestético, procedimiento realizado por la Dra. María Laura Villarroel, especialista certificada.\n\nEste tratamiento láser puede ayudar a mejorar:\n✨ Tonicidad y firmeza vaginal\n💧 Hidratación y lubricación natural\n🌸 Función sexual y confort\n🎯 Síntomas de atrofia vaginal (climaterio/menopausia)\n🤰 Recuperación post-parto\n\nBeneficios:\n• Procedimiento no invasivo\n• Sin tiempo de recuperación\n• Resultados progresivos\n• Mejora calidad de vida íntima\n\nLa evaluación previa es fundamental para determinar el plan de tratamiento personalizado según tus necesidades.\n\n¿Deseas que agendemos tu consulta de evaluación con la Dra. Villarroel?` },
        { title: "Labioplastia Láser (Dra. Villarroel)", content: `En Clínica Cialo realizamos ninfoplastia (labioplastia) con láser, procedimiento realizado por la Dra. María Laura Villarroel, certificada por la World Society of Cosmetic Gynecology.\n\nLa labioplastia es una cirugía estética de los labios menores que puede realizarse por motivos funcionales (molestias, roce) o estéticos.\n\nCaracterísticas del procedimiento:\n🏥 Cirugía ambulatoria en Pabellón Menor\n⚡ Técnica láser (menos sangrado, mejor cicatrización)\n💉 Anestesia local\n👩‍⚕️ Requiere apoyo de TENS/Matrona\n🏠 Recuperación en casa\n⏱️ Retorno a actividades normales: 1-2 semanas\n\nLa evaluación previa es fundamental para determinar el plan quirúrgico y presupuesto personalizado.\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Láser CO2 Íntimo Femenino", content: `En Clínica Cialo realizamos tratamientos de rejuvenecimiento íntimo femenino con Láser CO₂ TetraPRO, una de las tecnologías más avanzadas y seguras disponibles a nivel mundial.\n\nEste procedimiento puede ayudar a mejorar:\n✨ Tonicidad y firmeza de la zona íntima.\n💧 Hidratación y lubricación natural.\n🌸 Función sexual y confort.\n🎯 Tratamiento de incontinencia leve y alteraciones postparto o por envejecimiento.\n\n📌 El valor del tratamiento se entrega solo tras la evaluación previa, ya que cada paciente requiere un protocolo distinto. La intensidad, número de sesiones y técnicas complementarias dependen de factores como:\n🔹 Antecedentes médicos y ginecológicos.\n🔹 Grado de laxitud o atrofia vaginal.\n🔹 Presencia de síntomas como resequedad, dolor o incontinencia.\n\nSolo una evaluación médica puede definir un presupuesto realista y seguro, ajustado a tus necesidades y objetivos.\n\n¿Deseas que agendemos tu consulta para evaluar si eres candidata a este procedimiento?` },
        { title: "Despigmentación Íntima Femenina", content: `En Clínica Cialo contamos con protocolos combinados de láser, peelings y tópicos para mejorar el tono de la zona íntima pigmentada.\n\nLa evaluación previa es fundamental para definir el presupuesto, ya que dependerá de:\n🔹 Tipo y origen del pigmento.\n🔹 Plan de tratamiento (peeling, láser, tópicos o combinación).\n🔹 Cantidad de sesiones según tu piel y la intensidad de la pigmentación.\n\n¿Deseas que coordinemos tu cita de evaluación para orientarte con el plan más adecuado?` },
        { title: "Salud Capilar - Dra. Javiera Araya", content: `En Clínica Cialo contamos con la Dra. Javiera Araya Medina, médico especialista en Tricología y Cirugía Capilar.\n\nLa Dra. Araya es la ÚNICA profesional en Chile certificada en la técnica Regenera (células madre capilares).\n\nServicios disponibles:\n\n🩺 Consulta Tricología Presencial - $40.000 / Control $20.000\n💻 Consulta Tricología Online - $30.000\n👁️ Evaluación Injerto Ceja - Sin costo\n\n💉 Mesoterapias Capilares ($110.000 - $150.000):\n   • Dutasteride (Alopecia Androgenética)\n   • Triamcinolona (Alopecia Areata, liquen plano)\n   • Plasma Rico en Plaquetas (PRP)\n\n🧬 REGENERA - Células Madre Capilares\n   Procedimiento ÚNICO EN CHILE\n   💰 Valor: $1.450.000\n   Indicado para Alopecia Androgenética leve a moderada\n\n📅 Disponibilidad: Lunes completo (confirmado), Martes AM ocasional, Sábados 1-2 al mes\n\n¿Deseas que coordinemos tu consulta con la Dra. Araya?` },
        { title: "Implante Capilar - Dra. Javiera Araya", content: `En Clínica Cialo la cirugía de implante capilar es realizada por la Dra. Javiera Araya Medina, especialista en Tricología y Cirugía Capilar.\n\nEl presupuesto se ajusta según la cantidad de unidades foliculares que sea necesario implantar. Esta cantidad se determina en la consulta médica, considerando:\n🔹 El grado de alopecia.\n🔹 La densidad y grosor del cabello.\n🔹 La calidad de las unidades foliculares presentes.\n\nDurante la consulta recibirás un pronóstico claro (si es necesario o no realizar el implante) y un presupuesto detallado de acuerdo a tu caso.\n\nLa Dra. Araya permanece hasta las 12 hrs del día siguiente para control post-injerto.\n\n¿Deseas que coordinemos tu cita de evaluación capilar?` },
        { title: "Regenera - Células Madre Capilares (Dra. Araya)", content: `En Clínica Cialo ofrecemos el tratamiento REGENERA, realizado EXCLUSIVAMENTE por la Dra. Javiera Araya Medina, la única profesional en Chile certificada en esta técnica.\n\n🧬 ¿Qué es Regenera?\nProcedimiento ambulatorio que obtiene células madre y exosomas autólogos de tu propio tejido folicular para regenerar el cabello.\n\nIndicaciones:\n✅ Alopecia Androgenética leve a moderada\n✅ Alternativa cuando tratamientos convencionales no funcionan\n✅ Complemento a otras terapias capilares\n\nCaracterísticas:\n⏱️ Duración: 1 hora\n💉 Anestesia local\n👨‍⚕️ Requiere apoyo de TENS\n🏠 Alta inmediata\n📋 Control sin costo a los 3 meses\n🔄 Frecuencia: Anual\n\n💰 Valor: $1.450.000 (único en Chile)\n\n¿Deseas que agendemos tu consulta de evaluación con la Dra. Araya?` },
        { title: "Cirugía Maxilofacial - Dr. Luis Pérez Lagos", content: `En Clínica Cialo contamos con el Dr. Luis Pérez Lagos, Cirujano Dentista y Cirujano Maxilofacial certificado.\n\nEl Dr. Pérez ofrece cirugías estéticas faciales especializadas:\n\n🔪 Bichectomía - 30 min\n   Adelgazar/estilizar región geniana\n   Insumos: ~$10.000\n\n👁️ Blefaroplastía Superior - 2-3 hrs\n   Retiro exceso de piel y reposición grasa del párpado\n\n👁️ Blefaroplastía Inferior - 1-3 hrs\n   Atenuar "bolsas" bajo los ojos\n\n💉 Lipoaspiración Cervical y Facial - 1-1.5 hrs\n   Reducción de grasa en jowls, papada y cuello\n\n✨ Lifting Cervical - 3 hrs\n   Mejoría del contorno cervical y ángulo mandibular\n\n👂 Otoplastía - 1.5-3 hrs\n   Corrección de orejas aladas o protruidas\n\n👄 Liplift - 30-60 min\n   Elevación del labio superior\n\n🦷 Mentoplastía - 1-1.5 hrs\n   Remodelación del mentón\n\n📅 Disponibilidad: Viernes y Sábados (Quincenal/Mensual)\n\nTodas las cirugías requieren evaluación previa. El Dr. Pérez trabaja con 2 cirujanos y requiere TENS o arsenalera según el procedimiento.\n\n¿Deseas que coordinemos tu consulta de evaluación?` },
        { title: "Bichectomía (Dr. Luis Pérez)", content: `En Clínica Cialo realizamos bichectomía con el Dr. Luis Pérez Lagos, Cirujano Maxilofacial certificado.\n\nLa bichectomía es un procedimiento para adelgazar y estilizar la región geniana mediante la extracción de la bola de Bichat.\n\nCaracterísticas:\n⏱️ Duración: 30 minutos\n🏥 Box / Sala de procedimientos / Pabellón\n� Anestesia local\n🔧 Caja de Cirugía con pinzas mosquito/Kelly\n📋 Procedimiento único\n\nInsumos: Catgut 4-0, anestesia local, campo perforado, hoja bisturí 15c\n\nEl Dr. Pérez atiende viernes y sábados (quincenal/mensual).\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Blefaroplastía (Dr. Luis Pérez)", content: `En Clínica Cialo realizamos blefaroplastía con el Dr. Luis Pérez Lagos, Cirujano Maxilofacial certificado.\n\n👁️ Blefaroplastía Superior (2-3 hrs):\nRetiro de exceso de piel, reposición de grasa y/o glándula lagrimal del párpado superior. Refresca la mirada y mejora el campo visual. Indicada para blefarocalasia por envejecimiento o predisposición genética.\n\n👁️ Blefaroplastía Inferior (1-3 hrs):\nRetiro de piel y/o grasa del párpado inferior. Atenúa "bolsas" bajo los ojos. Técnica transconjuntival (grasa) o transcutánea (piel).\n\nCaracterísticas:\n🏥 Cirugía en Pabellón\n⚡ Equipo: Caja de Blefaroplastía, electrobisturí, eventualmente Láser CO2\n📋 Procedimiento único\n\nLa evaluación previa es fundamental para determinar el plan quirúrgico.\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Onicomicosis (Tratamiento Láser)", content: `En Clínica Cialo ofrecemos tratamiento láser para onicomicosis (hongos en las uñas), una solución efectiva, segura y sin efectos secundarios.\n\nEl tratamiento con láser elimina los hongos de forma directa, penetrando en la uña sin dañar el tejido circundante.\n\nBeneficios del tratamiento:\n✨ Sin medicamentos orales ni efectos secundarios\n🎯 Procedimiento rápido e indoloro\n💎 Alta tasa de efectividad\n⏱️ Sin tiempo de recuperación\n🔬 Tecnología láser de última generación\n\nLa cantidad de sesiones dependerá del grado de afectación de las uñas, determinado en la evaluación médica.\n\nLa consulta médica tiene un valor de $40.000 (reembolsable).\n\n¿Deseas que coordinemos tu consulta para evaluar tu caso?` }
    ],
    Nutricion: [
        { title: "Consulta Nutricional", content: `En Clínica Cialo contamos con 2 nutricionistas altamente calificados:\n\n👩‍⚕️ Valentina Verdejo - Nutricionista Clínica Deportiva\n   📅 Miércoles PM, Jueves, Viernes PM, Sábados AM\n   💰 Consulta: $40.000 (Fonasa) / $50.000 (Isapres)\n\n👨‍⚕️ Walter Zaror - Nutricionista Deportivo\n   📅 Lunes a Jueves (10:00-13:00 y 14:00-16:00), Sábados AM\n   💰 Consulta: $40.000\n\nAmbos especialistas trabajan con:\n🔹 InBody 970 - El analizador de composición corporal más avanzado del mundo\n🔹 Calorimetría Indirecta Q-NRG Max - Única en la ciudad\n\n✨ Esta combinación de especialistas + tecnología única convierte tu consulta en una experiencia mucho más completa que una visita nutricional convencional.\n\n¿Deseas que coordinemos tu consulta nutricional?` },
        { title: "Nutrición Deportiva (Valentina Verdejo)", content: `En Clínica Cialo contamos con Valentina Verdejo, Nutricionista Clínica Deportiva especializada en optimización del rendimiento deportivo y composición corporal.\n\nValentina ofrece:\n🏃‍♂️ Planes nutricionales para deportistas\n💪 Optimización de composición corporal\n⚡ Mejora del rendimiento atlético\n🎯 Nutrición para objetivos específicos (ganancia muscular, pérdida de grasa, resistencia)\n\nServicios disponibles:\n🔹 Consulta Nutricional Integral: $40.000 (Fonasa) / $50.000 (Isapres)\n   Incluye: Anamnesis, InBody, pauta alimentación, educación nutricional\n🔹 Control: $20.000\n🔹 Examen de Calorimetría: Valor a consultar\n\n📅 Disponibilidad: Miércoles PM, Jueves AM/PM, Viernes PM, Sábados AM (2 al mes)\n\n¿Deseas que coordinemos tu consulta nutricional deportiva?` },
        { title: "Nutrición Deportiva (Walter Zaror)", content: `En Clínica Cialo contamos con Walter Zaror, Nutricionista Deportivo especializado en evaluación nutricional integral.\n\nWalter ofrece:\n🏃‍♂️ Evaluación nutricional integral con InBody 970\n📊 Análisis de composición corporal avanzado\n🔬 Calorimetría Indirecta (gasto energético en reposo)\n💪 Planes personalizados para deportistas y público general\n\nServicios disponibles:\n🔹 Evaluación Nutricional Integral (InBody 970): $40.000\n   - Primera consulta: 1 hora\n   - Control: 30 min\n🔹 Calorimetría Indirecta + Evaluación: $75.000 - $80.000\n   - Duración: 30 min\n   - Paciente debe llegar 10-15 min antes\n\n📅 Disponibilidad: Lunes a Jueves (10:00-13:00 y 14:00-16:00), Sábados AM\n\n¿Deseas que coordinemos tu consulta nutricional?` },
        { title: "Examen InBody 970", content: `En Clínica Cialo contamos con el único InBody 970 disponible en la ciudad, el analizador de composición corporal más avanzado del mundo.\n\nEste examen entrega un informe de 7 páginas con un desglose extremadamente preciso de tu cuerpo: masa muscular segmental, grasa visceral, distribución de líquidos, minerales, proteínas, metabolismo basal y mucho más.\n\nEs considerado el examen de composición corporal más completo del mundo, utilizado en centros médicos de alto nivel, hospitales universitarios y equipos de alto rendimiento deportivo.\n\nEn Cialo lo ponemos a tu disposición como herramienta clave para diseñar planes personalizados de nutrición, entrenamiento y salud.\n\nTienes dos formas de acceder al examen:\n🔹 Solo examen: $15.000 - Obtienes tu reporte completo con todos los indicadores.\n🔹 Examen + interpretación profesional: Incluido en la consulta nutricional ($40.000) - Recibirás evaluación completa, pauta personalizada y orientación profesional.\n\n¿Qué opción te acomoda más?` },
        { title: "Calorimetría Indirecta", content: `En Clínica Cialo contamos con la única Calorimetría Indirecta disponible en Los Ángeles, utilizando el equipo Q-NRG Max, considerado el más avanzado del mundo en este tipo de medición.\n\nEste examen permite conocer con exactitud tu gasto energético en reposo (metabolismo basal) y cómo tu cuerpo utiliza grasas, carbohidratos y proteínas como fuente de energía.\n\n🔹 Con esta información podemos diseñar planes nutricionales y de entrenamiento totalmente personalizados, evitando dietas genéricas y asegurando resultados efectivos, medibles y sostenibles en el tiempo.\n\nEl valor del examen con Walter Zaror es de $75.000 - $80.000 e incluye la interpretación profesional de los resultados.\n\n⚠️ El paciente debe llegar 10-15 minutos antes para preparación de la muestra.\n\n¿Deseas que coordinemos tu cita para realizar este examen?` }
    ],
    Estetica: [
        { title: "Medicina Estética - Dra. Elga Peña", content: `En Clínica Cialo contamos con la Dra. Elga Viviana Peña, Médico Cirujano especialista en Medicina Estética con amplia experiencia en procedimientos faciales y corporales.\n\nLa Dra. Elga ofrece consulta médica estética por $20.000 y una amplia gama de tratamientos:\n\n💉 Inyectables:\n• Mesoterapia facial\n• Bioestimuladores (manos, rostro)\n• Botox (hiperhidrosis axilar)\n• Enzimas (fibrosis)\n• Sculptra (reafirmación glúteos)\n\n⚡ Aparatología:\n• Plexr Plus (blefaroplastia, código de barras, estrías)\n• Morpheus 8 (escote, glúteos)\n• HIFU (escote y glúteos)\n• Ultraformer III (lifting sin cirugía)\n• Scizer (reducción grasa localizada)\n\nLa Dra. Elga atiende 5 días por semana (Lunes, Miércoles, Jueves, Viernes, Sábado).\n\n¿Deseas que agendemos tu consulta de evaluación?` },
        { title: "Sculptra Glúteos (Dra. Elga Peña)", content: `En Clínica Cialo ofrecemos tratamiento de reafirmación de glúteos con Sculptra, realizado por la Dra. Elga Peña.\n\nSculptra es el bioestimulador de colágeno más avanzado y duradero del mercado. A diferencia de los rellenos tradicionales, Sculptra estimula la producción natural de colágeno de tu propia piel.\n\nBeneficios para glúteos:\n🍑 Reafirmación y lifting natural\n✨ Mejora de textura y firmeza\n💎 Resultados progresivos y naturales\n⏱️ Duración hasta 2 años o más\n\nValor del tratamiento: $950.000\n\nLa evaluación previa es necesaria para determinar el plan de tratamiento personalizado.\n\n¿Deseas que agendemos tu consulta con la Dra. Elga Peña?` },
        { title: "Morpheus 8 (Dra. Elga Peña)", content: `En Clínica Cialo ofrecemos tratamientos con Morpheus 8, tecnología de microneedling con radiofrecuencia fraccionada, realizado por la Dra. Elga Peña.\n\nMorpheus 8 combina microagujas con energía de radiofrecuencia para remodelar el colágeno en las capas profundas de la piel.\n\nBeneficios:\n✨ Reafirmación profunda de la piel\n🎯 Mejora de textura y tono\n💎 Reducción de arrugas y flacidez\n🔥 Estimulación de colágeno y elastina\n\nZonas de tratamiento:\n• Morpheus 8 Escote\n• Morpheus 8 Glúteos\n\nLa evaluación previa es necesaria para determinar el plan de tratamiento y presupuesto.\n\n¿Deseas que agendemos tu consulta?` },
        { title: "Plexr Plus (Dra. Elga Peña)", content: `En Clínica Cialo ofrecemos tratamientos con Plexr Plus, tecnología de plasma para procedimientos estéticos no invasivos, realizado por la Dra. Elga Peña.\n\nPlexr Plus permite realizar:\n👁️ Blefaroplastia (párpados sin cirugía)\n💋 Código de Barras (arrugas peribucales)\n🏷️ Eliminación de Acrocordones\n📏 Tratamiento de Estrías\n\nBeneficios:\n• Sin cirugía ni incisiones\n• Recuperación rápida\n• Resultados naturales\n• Procedimiento ambulatorio\n\nLa evaluación previa es necesaria para determinar el plan de tratamiento y presupuesto.\n\n¿Deseas que agendemos tu consulta con la Dra. Elga Peña?` },
        { title: "HIFU - Lifting sin Cirugía (Dra. Elga Peña)", content: `En Clínica Cialo ofrecemos tratamiento con HIFU (Ultrasonido Focalizado de Alta Intensidad) para lifting sin cirugía, realizado por la Dra. Elga Peña.\n\nHIFU es una tecnología no invasiva que estimula la producción de colágeno en las capas profundas de la piel, logrando un efecto lifting natural.\n\nBeneficios:\n✨ Lifting facial y corporal sin cirugía\n🎯 Reafirmación profunda\n💎 Resultados progresivos y naturales\n⏱️ Sin tiempo de recuperación\n\nZonas de tratamiento:\n• HIFU Escote y Glúteos\n• HIFU Facial (consultar disponibilidad)\n\nLa evaluación previa es necesaria para determinar si eres candidato ideal.\n\n¿Deseas que agendemos tu consulta?` },
        { title: "Polinucleótidos (Dra. Kiss)", content: `En Clínica Cialo ofrecemos tratamientos con polinucleótidos, una de las terapias más avanzadas en bioestimulación y rejuvenecimiento cutáneo.\n\nSus principales beneficios son:\n✨ Estimulan la producción de colágeno y elastina, mejorando la firmeza y elasticidad de la piel.\n👁️ Reducen arrugas finas y ojeras en la zona periocular.\n🌟 Mejoran la calidad, textura e hidratación global de la piel cuando se aplican en full face.\n💎 Tratamiento seguro, biocompatible y con respaldo científico.\n\nValores por sesión:\n🔹 Zona periocular: $139.000\n🔹 Full face: $190.000\n\n¿Deseas que agendemos tu cita para comenzar tu tratamiento?` },
        { title: "Toxina Botulínica Dysport (Dra. Kiss)", content: `En Clínica Cialo realizamos tratamientos con toxina botulínica Dysport®, reconocida como una de las mejores y más seguras marcas del mundo, con amplio respaldo científico.\n\nSus beneficios incluyen:\n✨ Relajación de las arrugas dinámicas (frente, entrecejo, patas de gallo).\n🌟 Rejuvenecimiento natural, sin alterar la expresión.\n💎 Procedimiento rápido, seguro y con resultados progresivos en pocos días.\n\nValores Dra. Kiss:\n🔹 1 zona: $100.000\n🔹 Tercio superior (frente, entrecejo y patas de gallo): $179.000\n🔹 Full face (rostro completo): $329.000\n\n¿Quieres que coordinemos tu cita para el tratamiento?` },
        { title: "Relleno de Labios (Dra. Kiss)", content: `El valor del tratamiento de labios con Dra Mariane es de $180.000\n\nEs un tratamiento ambulatorio el cual se realiza bajo anestesia local.\nTrabajamos con marca Juvederm de Allergan, la marca de relleno más prestigiosa del mundo.\nLa durabilidad es de 8-12 meses aproximadamente en reabsorberse de manera completa.\n\n¿Desea ud una cita para el tratamiento?` },
        { title: "Ácido Hialurónico (Dra. Kiss)", content: `En Clínica Cialo realizamos tratamientos con ácido hialurónico de la más alta calidad, aplicados por la Dra. Mariane Kiss, especialista en medicina estética.\n\nCon este producto podemos abordar múltiples objetivos como relleno de labios, ojeras, surcos, perfilado mandibular, hidratación y armonización facial.\n\nEl valor de cada tratamiento con ácido hialurónico es de $180.000 por jeringa, ajustando la técnica y la cantidad según tus necesidades.\n\n¿Deseas que coordinemos tu cita con la Dra. Mariane Kiss para este procedimiento?` },
        { title: "CoolPeel (Láser CO2)", content: `Se trata de uno de los protocolos más avanzados en rejuvenecimiento facial no invasivo. Combinamos la última tecnología en láser de CO2 fraccionado superficial (CoolPeel) con exosomas de grado médico para:\n\n✅ Mejorar textura y poros dilatados\n✅ Aumentar luminosidad y firmeza de la piel\n✅ Estimular colágeno sin dañar capas profundas\n✅ Acelerar la recuperación postláser gracias a los exosomas\n\nEs ideal para quienes desean resultados visibles sin tiempos prolongados de reposo ni inflamación significativa.\n\n🔬 Trabajamos con tecnología TetraPro by DEKA, y exosomas Purasome NutriComplex, con evidencia clínica en regeneración dérmica.\n\nValor con Dra Mariane: $190.000 por sesión.\n\n¿Deseas una cita?` },
        { title: "Hilos Revitalizantes (Dra. Kiss)", content: `En Clínica Cialo ofrecemos tratamientos con hilos revitalizantes, realizados por la Dra. Mariane Kiss.\n\nEstos hilos tienen como objetivo estimular la producción natural de colágeno, mejorando la firmeza, textura y calidad de la piel de manera progresiva y natural.\n\nEl valor del tratamiento es de $120.000 por pack, lo que contempla la aplicación de 10 hilos revitalizantes.\n\n¿Deseas que coordinemos tu cita con la Dra. Kiss para este procedimiento?` },
        { title: "Promo Polinucleótidos + Botox", content: `En Clínica Cialo contamos con una promoción exclusiva realizada por la Dra. Mariane Kiss, especialista en medicina estética.\n\n✨ Polinucleótidos → estimulan la producción de colágeno y elastina, mejorando la firmeza, textura e hidratación de la piel.\n🌟 Toxina Botulínica Dysport® → relaja las arrugas dinámicas del tercio superior, logrando un resultado natural y armónico.\n\nValor promoción completa: $269.900\n\n¿Deseas que coordinemos tu cita con la Dra. Mariane Kiss para aprovechar esta combinación de tratamientos?` },
        { title: "Eliminación de Tatuajes", content: `El valor dependerá del tamaño y color del tatuaje. Si deseas puedes enviarme una fotografía para ayudarte en el valor por sesión 😊\n\n(REENVIAR FOTO A DR. NICOLÁS PARA VALOR)\n\nAl entregar presupuesto:\n"El valor de su tatuaje es de ____ por sesión.\n\nContamos con el láser Spectra XT, actualmente el mejor láser del mundo para remoción de tatuajes. Tiene un riesgo de cicatriz mucho menor que los demás láseres.\n\nLa cantidad de sesiones dependerá del tipo de tinta, profundidad, densidad, zona del cuerpo, cantidad de colores, metabolismo del paciente, hábitos, etc. Es difícil determinar una cantidad exacta, pero frecuentemente varían de 5 a 10 sesiones.\n\nLas sesiones se realizan cada 6 semanas, solo pagas la sesión a la que asistes.\n\n¿Desea ud una cita?"` },
        { title: "Sculptra (Bioestimulador)", content: `En Clínica Cialo ofrecemos tratamientos con Sculptra, el bioestimulador de colágeno más avanzado y duradero del mercado.\n\nSculptra es diferente a los rellenos tradicionales porque no solo rellena, sino que estimula la producción natural de colágeno de tu propia piel, logrando resultados progresivos, naturales y de larga duración.\n\nBeneficios principales:\n✨ Restaura el volumen facial perdido de forma gradual y natural\n🌟 Mejora la firmeza y elasticidad de la piel\n💎 Resultados que pueden durar hasta 2 años o más\n🎯 Ideal para rejuvenecimiento facial global, mejillas, sienes y mandíbula\n\nLa evaluación es gratuita para determinar el plan de tratamiento personalizado según tus necesidades.\n\n¿Deseas que agendemos tu evaluación con la Dra. Mariane Kiss?` }
    ],
    Indicaciones: [
        { title: "Indicaciones Previas InBody 970", content: `📲 Para que el examen sea preciso y confiable, te pedimos considerar estas indicaciones:\n\n1. ⚖️ No comer ni beber (excepto agua) al menos 2 horas antes del examen.\n2. 🏃‍♂️ Evitar ejercicio intenso en las 12 horas previas.\n3. 🍷☕ No consumir alcohol ni cafeína 24 horas antes.\n4. 👚 Usar ropa ligera y cómoda, sin accesorios metálicos.\n5. 💧 Mantener una hidratación adecuada el día anterior.\n6. 👩‍🦰 Si eres mujer, idealmente realizar el examen fuera del periodo menstrual, ya que puede alterar los resultados por retención de líquidos.\n7. ⚠️ El examen no se realiza en embarazadas ni en personas con marcapasos o dispositivos electrónicos implantados.`, note: "Enviar una vez agendado el examen" },
        { title: "Indicaciones Previas Calorimetría Indirecta", content: `📲 Para obtener una medición precisa de tu metabolismo basal y gasto energético, sigue estas recomendaciones:\n\n1. 🌙 Ayuno mínimo de 6 horas antes del examen (solo se permite agua).\n2. 🛌 Descansar bien la noche anterior (evitar trasnocho).\n3. 🚭 No fumar al menos 4 horas antes.\n4. ☕🍵 Evitar cafeína, alcohol y estimulantes 24 horas previas.\n5. 🏃‍♂️ No realizar ejercicio intenso previo examen.`, note: "Enviar una vez agendado el examen" }
    ]
};

// Sección de Consultas/Evaluaciones organizadas
const consultasData = [
    {
        id: 'consulta-capilar',
        nombre: 'Consulta Médica Capilar',
        emoji: '💇',
        profesionales: [
            { nombre: 'Dra. Javiera Araya Medina', especialidad: 'Tricóloga - Cirugía Capilar', disponibilidad: 'Lunes completo, Martes AM ocasional, Sábados 1-2 al mes' }
        ],
        valor: '$40.000 (Presencial) / $30.000 (Online) / Control: $20.000',
        duracion: 'Primera: 40 min / Control: 20 min',
        descripcion: 'Evaluación completa de salud capilar incluyendo tricoscopia, análisis clínico, solicitud de exámenes y definición de tratamiento.',
        tratamientosAsociados: [
            'Mesoterapia Dutasteride (Alopecia Androgenética)',
            'Mesoterapia Triamcinolona (Alopecia Areata, liquen plano)',
            'Mesoterapia PRP (Plasma Rico en Plaquetas)',
            'REGENERA - Células Madre Capilares (ÚNICO EN CHILE - $1.450.000)',
            'Implante/Injerto Capilar',
            'Evaluación Injerto Ceja (sin costo)'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-depilacion',
        nombre: 'Consulta Depilación Láser',
        emoji: '✨',
        profesionales: [
            { nombre: 'María Jesús Contreras Merino', especialidad: 'Enfermera - Especialista en Aparatología Estética', disponibilidad: 'Lunes a Sábado (flexible)' }
        ],
        valor: 'GRATUITA',
        duracion: '15-20 min',
        descripcion: 'Evaluación gratuita para determinar el plan de depilación láser más adecuado según tipo de piel y vello.',
        tratamientosAsociados: [
            'Depilación Láser Soprano Titanium (triple longitud de onda)',
            'Depilación de zonas individuales o packs',
            'Depilación full body'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: abono de $10.000 para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-corporal',
        nombre: 'Consulta Corporal',
        emoji: '💪',
        profesionales: [
            { nombre: 'María Jesús Contreras Merino', especialidad: 'Especialista en Aparatología Estética', disponibilidad: 'Lunes a Sábado (flexible)' }
        ],
        valor: 'GRATUITA',
        duracion: '20-30 min',
        descripcion: 'Evaluación corporal para diseñar protocolo personalizado de tratamientos reductivos, reafirmantes o modeladores.',
        tratamientosAsociados: [
            'Clatuu Alpha (Criolipólisis)',
            'Exilis Ultra 360 (Radiofrecuencia)',
            'Morpheus8 (Microagujas + RF)',
            'HIFU Ultraformer III (Lifting sin cirugía)',
            'Scizer (Reducción grasa localizada)',
            'Embody (Tonificación muscular)'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: abono de $10.000 para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-ginecologica',
        nombre: 'Consulta Ginecológica',
        emoji: '🩺',
        profesionales: [
            { nombre: 'Dra. María Laura Villarroel Reyes', especialidad: 'Ginecóloga y Obstetra - Ginecoestética', disponibilidad: 'Consultar disponibilidad' }
        ],
        valor: 'Consultar según procedimiento',
        duracion: '30-45 min',
        descripcion: 'Evaluación ginecológica completa especializada en ginecoestética y rejuvenecimiento vaginal.',
        tratamientosAsociados: [
            'Rejuvenecimiento Vaginal Láser CO2',
            'Ninfoplastia/Labioplastia Láser',
            'Lifting Vulvar',
            'Blanqueamiento Íntimo',
            'Tratamiento de Atrofia Vaginal',
            'Biopsias vulva/vagina',
            'Extirpación de condilomas',
            'Manejo glándula de Bartolino'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-matrona',
        nombre: 'Consulta Matrona',
        emoji: '👩‍⚕️',
        profesionales: [
            { nombre: 'Stefania Kuncar Ferrón', especialidad: 'Matrona - Ginecoestética y Rejuvenecimiento Íntimo', disponibilidad: 'Lunes, Martes (desde 16:00), Jueves, Viernes, Sábado' }
        ],
        valor: '$40.000 (Control Ginecológico)',
        duracion: '30-40 min',
        descripcion: 'Atención integral en salud femenina: control ginecológico, métodos anticonceptivos, rejuvenecimiento íntimo y ginecoestética.',
        tratamientosAsociados: [
            'Rejuvenecimiento Íntimo Láser CO2',
            'Inserción/Extracción DIU (Mirena, Asertia, Kyleena, T Cobre)',
            'Inserción/Extracción Implantes Anticonceptivos',
            'PAP, VPH, Examen de Mamas',
            'Consejería Anticonceptiva',
            'Planificación Familiar'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-medicina-estetica',
        nombre: 'Consulta Medicina Estética',
        emoji: '💎',
        profesionales: [
            { nombre: 'Dra. Elga Viviana Peña', especialidad: 'Médico Cirujano - Medicina Estética', disponibilidad: 'Lunes 12-17h, Mié-Vie 9-16h, Sáb 9-15h' },
            { nombre: 'Dra. Mariane Kiss', especialidad: 'Medicina Estética', disponibilidad: 'Consultar disponibilidad' }
        ],
        valor: '$20.000 (Dra. Elga Peña)',
        duracion: '30 min',
        descripcion: 'Evaluación médica estética inicial: anamnesis, registro fotográfico, diagnóstico, indicación de tratamientos y presupuesto.',
        tratamientosAsociados: [
            'Toxina Botulínica (Dysport)',
            'Ácido Hialurónico (Juvederm)',
            'Polinucleótidos',
            'Bioestimuladores (Sculptra, Radiesse)',
            'Mesoterapia Facial',
            'Hilos Revitalizantes',
            'Plexr Plus (Blefaroplastia sin cirugía)',
            'Morpheus 8',
            'HIFU Ultraformer III',
            'CoolPeel Láser CO2'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: abono de $10.000 para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-urologica',
        nombre: 'Consulta Urológica',
        emoji: '🔵',
        profesionales: [
            { nombre: 'Dr. Guillermo Contreras Rodríguez', especialidad: 'Urólogo - Estética Íntima Masculina', disponibilidad: 'Lunes y Miércoles 18:30-21:00' },
            { nombre: 'Dr. Frank Ulloa Carrasco', especialidad: 'Médico Urólogo', disponibilidad: 'Lunes y Jueves desde 19:00' }
        ],
        valor: '$50.000',
        duracion: '20-30 min',
        descripcion: 'Evaluación urológica completa para diagnóstico y planificación de tratamientos urológicos y estética íntima masculina.',
        tratamientosAsociados: [
            'Bioplastía de Engrosamiento Peniano',
            'Circuncisión',
            'Vasectomía',
            'Frenuloplastía',
            'Cistoscopia',
            'Varicocelectomía'
        ],
        requisitos: 'Pago PREVIO a la consulta (obligatorio)',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    },
    {
        id: 'evaluacion-facial',
        nombre: 'Evaluación Facial',
        emoji: '✨',
        profesionales: [
            { nombre: 'Dr. Nicolás Laucirica', especialidad: 'Cirujano Dentista - Estética y Rejuvenecimiento Facial', disponibilidad: 'Lunes, Martes, Jueves, Viernes' }
        ],
        valor: 'GRATUITA (horarios: 9:00, 12:00, 15:00) / $30.000 (otros horarios)',
        duracion: '20-30 min',
        descripcion: 'Evaluación facial integral para procedimientos estéticos y de rejuvenecimiento facial. El Dr. Laucirica ofrece una amplia gama de tratamientos con toxina, rellenos, bioestimuladores, láser y dermatofuncional.',
        tratamientosAsociados: [
            // Toxina Botulínica
            'Toxina Botulínica Tercio Superior (arrugas y líneas)',
            'Toxina Botulínica Bruxismo (maseteros)',
            'Toxina Botulínica Sonrisa Gingival',
            'Toxina Botulínica Full Face',
            // Ácido Hialurónico
            'Rinomodelación',
            'Labios con Ácido Hialurónico',
            'Mentón con Ácido Hialurónico',
            'Pómulos con Ácido Hialurónico',
            'Reposición del tercio medio',
            'Ojeras / Surco lagrimal',
            'Surco nasogeniano',
            'Definición mandibular',
            'Relleno Fosa temporal',
            // Bioestimuladores
            'Sculptra® (densidad dérmica)',
            'Radiesse® (efecto tensor)',
            'Ellansé® (bioestímulo duración extendida)',
            // Otros tratamientos
            'Armonización Facial',
            'ADN de Salmón',
            'Hilos Tensores y Revitalizantes',
            'Exosomas',
            // Tratamientos Láser
            'Láser Melasma y pigmentaciones',
            'Láser Cicatrices y poros',
            'Láser Arrugas y líneas marcadas',
            'Láser Flacidez y redefinición',
            'Blefaroplastía láser',
            'Lesiones benignas',
            'Cicatrices traumáticas',
            'Borrado de tatuajes',
            'Borrado de micropigmentación',
            'Estrías',
            'Acné activo',
            'Hollywood Peel',
            // Dermatofuncional
            'HydraFacial® MD',
            'Mesoterapias faciales (NCTF®, Pink Glow, Exosomas)',
            'PRP Facial',
            'Limpieza Facial Convencional'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: abono de $10.000 para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-nutricional',
        nombre: 'Consulta Nutricional Integral',
        emoji: '🥗',
        profesionales: [
            { nombre: 'Valentina Verdejo Merino', especialidad: 'Nutricionista Clínica Deportiva', disponibilidad: 'Miércoles PM, Jueves, Viernes PM, Sábados AM' },
            { nombre: 'Walter Zaror Maza', especialidad: 'Nutricionista Deportivo', disponibilidad: 'Lunes a Jueves 10:00-16:00, Sábados AM' }
        ],
        valor: '$40.000 (Fonasa) / $50.000 (Isapres)',
        duracion: 'Primera: 1 hora / Control: 30 min',
        descripcion: 'Evaluación nutricional integral con InBody 970, anamnesis clínica, social y alimentaria, entrega de pauta personalizada.',
        tratamientosAsociados: [
            'Evaluación Nutricional con InBody 970',
            'Calorimetría Indirecta ($75.000-$80.000)',
            'Plan Nutricional Personalizado',
            'Nutrición Deportiva',
            'Control de Peso',
            'Nutrición para Patologías'
        ],
        requisitos: 'Ver indicaciones previas para InBody y Calorimetría',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-maxilofacial',
        nombre: 'Consulta Cirugía Maxilofacial',
        emoji: '🦷',
        profesionales: [
            { nombre: 'Dr. Luis Pérez Lagos', especialidad: 'Cirujano Dentista - Cirujano Maxilofacial', disponibilidad: 'Viernes y Sábados (Quincenal/Mensual)' }
        ],
        valor: 'Consultar según procedimiento',
        duracion: '30-45 min',
        descripcion: 'Evaluación para cirugías estéticas faciales especializadas con cirujano maxilofacial.',
        tratamientosAsociados: [
            'Bichectomía',
            'Blefaroplastía Superior',
            'Blefaroplastía Inferior',
            'Lipoaspiración Cervical y Facial',
            'Lifting Cervical',
            'Otoplastía',
            'Browlift Indirecto',
            'Liplift',
            'Mentoplastía'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    },
    {
        id: 'consulta-vascular',
        nombre: 'Consulta Médica Vascular',
        emoji: '🩸',
        profesionales: [
            { nombre: 'Dra. Francisca González Saldivia', especialidad: 'Cirujana Vascular Periférico y Endovascular', disponibilidad: '3-4 días por semana, tardes y sábados' }
        ],
        valor: '$50.000 (incluye Ecografía Doppler)',
        duracion: '30-45 min',
        descripcion: 'Evaluación vascular completa con ecografía doppler incluida para diagnóstico y tratamiento de patologías vasculares.',
        tratamientosAsociados: [
            'Escleroterapia Várices Pequeñas ($80.000)',
            'Escleroterapia Várices Grandes ($400.000-$500.000)',
            'Tratamiento Úlceras Venosas',
            'Insuficiencia Venosa Crónica'
        ],
        requisitos: 'No requiere preparación especial',
        politicaCancelacion: 'Cancelación con menos de 24 hrs: pago anticipado para reagendar',
        reembolsable: false
    }
];
