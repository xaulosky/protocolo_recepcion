/**
 * protocolsData.js
 * Contenido detallado de los protocolos internos de la clínica
 * Categorías: Recepción, Caja, TENS, Inventario, Administración
 */

const protocolsData = {
    // ==================== RECEPCIÓN Y ATENCIÓN ====================
    recepcion: {
        title: "Protocolos de Recepción y Atención",
        icon: "monitor",
        color: "purple",
        sections: [
            {
                title: "Apertura y Cierre de Recepción",
                content: `1. **Llegada (15 min antes):** Encender luces, aire acondicionado y equipos informáticos.
2. **Revisión de Agenda:** Verificar citas del día y profesionales activos.
3. **Verificación de Entorno:** Sala de espera limpia, dispensador de agua con carga, música ambiental volumen bajo.
4. **Cierre de Jornada:** Apagar equipos, asegurar puertas/ventanas, desconectar cafeteras/hervidores.`
            },
            {
                title: "Recepción del Paciente",
                content: `1. **Saludo:** "Buenos días/tardes, bienvenido a Clínica Cialo". Contacto visual y sonrisa.
2. **Verificación:** Solicitar nombre y confirmar cita en sistema Reservo.
3. **Documentación:** Verificar si tiene fichas o consentimientos pendientes de firma.
4. **Espera:** Indicar dónde tomar asiento. Ofrecer agua/café si corresponde.
5. **Aviso:** Notificar al profesional la llegada del paciente ("Paciente [Nombre] espera en sala").`
            },
            {
                title: "Manejo de Atrasos",
                content: `• **Hasta 10 min:** Se permite ingreso.
• **10-15 min:** Consultar con profesional si puede atender (quizás sesión más corta).
• **+15 min:** Se considera inasistencia. Ofrecer reagendar o esperar si se libera un espacio (sin garantía).
• **Clave:** Nunca culpar al paciente, explicar que es por respeto a la agenda del siguiente paciente.`
            }
        ]
    },

    // ==================== CONTROL DE CAJA ====================
    caja: {
        title: "Protocolos de Control de Caja",
        icon: "banknote",
        color: "emerald",
        sections: [
            {
                title: "Apertura de Caja",
                content: `1. Contar fondo fijo inicial (sencillo) y registrar monto.
2. Verificar rollos de papel en terminales Transbank.
3. Abrir sistema de recaudación y verificar fecha contable correcta.`
            },
            {
                title: "Cobro a Pacientes",
                content: `1. Confirmar monto exacto con profesional o sistema.
2. **Efectivo:** Revisar billetes (falsos/estado), contar frente al paciente. Registrar ingreso inmediato.
3. **Transbank:** Ingresar monto, pasar tarjeta, esperar comprobante "APROBADO".
4. **Transferencia:** Verificar recepción efectiva en cartola/mail (NO solo comprobante PDF).
5. **Boleta:** Emitir boleta electrónica obligatoria por todo pago.`
            },
            {
                title: "Cuadratura y Cierre Diario",
                content: `1. Sumar total ventas por medio de pago (Efectivo, Débito, Crédito, Transferencia).
2. Imprimir cierre (Z) de máquinas Transbank.
3. Comparar sistema vs físico.
4. **Diferencias:** Si sobra/falta dinero, informar inmediatamente a Administración. No poner dinero propio ni retirar sobrantes.
5. Guardar efectivo en caja fuerte/sobre sellado con fecha y firma.`
            }
        ]
    },

    // ==================== TENS / ÁREA CLÍNICA ====================
    tens: {
        title: "Protocolos Clínicos y TENS",
        icon: "stethoscope",
        color: "blue",
        sections: [
            {
                title: "Preparación de Box",
                content: `1. **Antes de cada paciente:** Limpiar camilla con desinfectante de superficies.
2. **Cambio de sabanilla:** Desechar sabanilla usada y colocar nueva.
3. **Insumos:** Verificar stock de guantes, mascarillas, gasas, jeringas según tratamiento.
4. **Equipos:** Verificar encendido y configuración base de láser/aparatología.`
            },
            {
                title: "Manejo de Residuos (REAS)",
                content: `• **Contenedor Amarillo:** Cortopunzantes (agujas, bisturí, ampollas rotas). Máximo 3/4 de capacidad.
• **Bolsa Roja (o contenedor específico):** Residuos biológicos (sangre, fluidos, tejidos).
• **Bolsa Negra/Gris:** Basura común (envoltorios, papeles administrativos).
• **Retiro:** Trasladar residuos a área de acopio sucio final al terminar jornada.`
            },
            {
                title: "Esterilización",
                content: `1. **Lavado:** Lavar instrumental con detergente enzimático. Cepillar ranuras.
2. **Secado:** Secar completamente con paño que no deje pelusa o aire comprimido.
3. **Empaque:** Usar manga de esterilización, sellar extremos. Poner cinta testigo.
4. **Autoclave:** Cargar sin sobrellenar. Ciclo correspondiente.
5. **Almacenaje:** Guardar en cajones limpios, ordenado por fecha de vencimiento.`
            },
            {
                title: "Asistencia en Procedimientos",
                content: `• Preparar mesa de mayo con técnica aséptica.
• Asistir al médico entregando insumos sin tocar campos estériles.
• Contención emocional del paciente durante el procedimiento.
• Limpieza inmediata de fluidos o derrames accidentales.`
            }
        ]
    },

    // ==================== INVENTARIO ====================
    inventario: {
        title: "Control de Inventario e Insumos",
        icon: "package",
        color: "orange",
        sections: [
            {
                title: "Recepción de Insumos",
                content: `1. Verificar Guía de Despacho vs productos físicos (cantidad y estado).
2. revisar fechas de vencimiento (mínimo 6 meses o rechazar, salvo autorización).
3. Almacenar inmediatamente: Refrigerados primero, luego bodega seca.
4. Rotular productos de uso inmediato si corresponde ("Abierto el: [Fecha]").`
            },
            {
                title: "Control de Stock Crítico",
                content: `• **Toxina Botulínica / Ácido Hialurónico:** Conteo unitario diario.
• **Insumos generales:** Revisión visual semanal.
• **Alerta de Quiebre:** Avisar a Adquisiciones cuando quede el mínimo establecido (ej: 2 cajas de guantes).`
            },
            {
                title: "Inventario Mensual",
                content: `• Se realiza el último día hábil del mes.
• Conteo "ciego" (contar sin mirar sistema primero).
• Registrar lote y vencimiento de productos médicos.
• Identificar mermas (vencidos, rotos) y separar para dar de baja.`
            }
        ]
    }
};
