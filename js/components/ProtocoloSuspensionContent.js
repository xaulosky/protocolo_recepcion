/**
 * ProtocoloSuspensionContent.js
 * Componente para mostrar el Protocolo de Suspensión y Paquetes Prepagados
 */

function ProtocoloSuspensionContent() {
    return `
        <div class="space-y-6">
            <!-- Principio Fundamental -->
            <div class="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-xl text-white shadow-lg">
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-white/20 rounded-xl">
                        <i data-lucide="alert-triangle" class="w-8 h-8"></i>
                    </div>
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold mb-3">Principio Fundamental</h2>
                        <p class="text-lg leading-relaxed bg-white/10 p-4 rounded-lg border-2 border-white/30">
                            "Las sesiones prepagadas están asociadas a tiempos de agenda.<br>
                            Si el paciente no usa ese tiempo según las reglas, la sesión se considera utilizada."
                        </p>
                        <p class="mt-3 text-white/90 text-sm">
                            ⚠️ Este es el corazón de la política. Todo el equipo debe repetir y aplicar este principio.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Políticas de Paquetes Prepagados -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="package" class="w-6 h-6 text-purple-600"></i>
                    Políticas de Paquetes Prepagados
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Vigencia del Paquete -->
                    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="calendar" class="w-5 h-5 text-blue-600"></i>
                            <h4 class="font-bold text-slate-800">Vigencia del Paquete</h4>
                        </div>
                        <div class="space-y-2 text-sm text-slate-700">
                            <p class="font-medium">📌 Paquetes válidos por 6 meses desde la primera sesión</p>
                            <p>Pasado ese plazo, las sesiones no utilizadas se considerarán vencidas.</p>
                        </div>
                    </div>

                    <!-- Reagendamiento -->
                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="clock" class="w-5 h-5 text-green-600"></i>
                            <h4 class="font-bold text-slate-800">Reagendamiento</h4>
                        </div>
                        <div class="space-y-2 text-sm text-slate-700">
                            <p class="font-medium">✅ Sin costo: Aviso con 24-48 hrs de anticipación</p>
                            <p class="font-medium text-red-600">❌ Se descuenta: Aviso tardío o inasistencia</p>
                            <p class="text-xs">El horario queda bloqueado y no puede asignarse a otro paciente.</p>
                        </div>
                    </div>

                    <!-- Límite de Cambios -->
                    <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="repeat" class="w-5 h-5 text-amber-600"></i>
                            <h4 class="font-bold text-slate-800">Límite de Cambios</h4>
                        </div>
                        <div class="space-y-2 text-sm text-slate-700">
                            <p class="font-medium">🔢 Máximo 2 reagendamientos por sesión</p>
                            <p>Después de 2 cambios, si no asiste, la sesión se pierde.</p>
                        </div>
                    </div>

                    <!-- Carta de Cortesía -->
                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="heart" class="w-5 h-5 text-purple-600"></i>
                            <h4 class="font-bold text-slate-800">Carta de Cortesía</h4>
                        </div>
                        <div class="space-y-2 text-sm text-slate-700">
                            <p class="font-medium">💙 1 excepción por paciente/paquete</p>
                            <p>Primera vez: No se descuenta, pero se advierte que desde ahora sí aplica la política.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Abono por Cancelaciones Consecutivas -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="banknote" class="w-6 h-6 text-emerald-600"></i>
                    Abono por Cancelaciones Consecutivas - Tratamientos Corporales
                </h3>

                <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <h4 class="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                        <i data-lucide="alert-circle" class="w-5 h-5"></i>
                        Política de Abono $10.000
                    </h4>
                    <p class="text-sm text-emerald-900 font-medium">
                        Si un paciente cancela <strong>2 citas seguidas</strong> en tratamientos corporales, 
                        debe realizar un <strong>abono de $10.000</strong> para reagendar su próxima cita.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <!-- Tratamientos Aplicables -->
                    <div class="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="list-checks" class="w-5 h-5 text-slate-600"></i>
                            <h4 class="font-bold text-slate-800">Tratamientos que Aplican</h4>
                        </div>
                        <ul class="space-y-1 text-sm text-slate-700">
                            <li class="flex items-center gap-2">
                                <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                Depilación Láser
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                EmBody / EmSculpt
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                Tratamientos Corporales Reductores
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                Otros tratamientos con maquinaria corporal
                            </li>
                        </ul>
                    </div>

                    <!-- Cuándo se aplica -->
                    <div class="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="calendar-x" class="w-5 h-5 text-red-600"></i>
                            <h4 class="font-bold text-slate-800">¿Cuándo se Aplica?</h4>
                        </div>
                        <div class="space-y-2 text-sm text-slate-700">
                            <p><strong>❌ 1ª cancelación:</strong> Se reagenda sin costo</p>
                            <p><strong>❌❌ 2ª cancelación consecutiva:</strong> Se solicita abono de $10.000</p>
                            <p class="text-xs text-red-700 mt-2">
                                El abono se descuenta del valor de la sesión. Si asiste, no pierde el dinero.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Guiones de Mensajes -->
                <div class="space-y-3">
                    ${renderMensajeCard(
        'Solicitud de Abono - 2da Cancelación Consecutiva',
        'banknote',
        'green',
        `Hola, [Nombre] 💙

Veo que esta es la segunda vez consecutiva que debemos reagendar tu sesión de [tratamiento].

Para poder confirmar tu próxima cita, te solicitamos un abono de $10.000 que se descontará del valor de tu sesión.

Esto nos ayuda a organizar mejor la agenda y asegurar que el horario esté disponible para ti.

¿Te parece bien? Te puedo enviar los datos para transferir y coordinamos la fecha 🙌`,
        'Usar cuando el paciente cancela por segunda vez consecutiva en tratamientos corporales.'
    )}

                    ${renderMensajeCard(
        'Explicación de la Política de Abono',
        'info',
        'blue',
        `Hola, [Nombre] 💙

Te comento sobre nuestra política:

Cuando se cancelan 2 citas seguidas en tratamientos corporales (como depilación láser, EmBody, etc.), pedimos un abono de $10.000 para reagendar.

Este abono se descuenta completamente del valor de tu sesión, así que no es un cobro extra, es solo para confirmar tu asistencia.

Si asistes a tu cita, ese dinero ya está incluido en tu pago. ¿Te queda claro? 💙`,
        'Usar para explicar la política cuando el paciente pregunta.'
    )}

                    ${renderMensajeCard(
        'Datos para Transferencia del Abono',
        'credit-card',
        'purple',
        `Para realizar el abono de $10.000, puedes transferir a:

🏦 Banco: [BANCO]
👤 Nombre: Clínica Cialo
📧 RUT: [RUT CLÍNICA]
💰 Monto: $10.000
📝 Comentario: Abono [Nombre Paciente]

Una vez recibido, te confirmo tu hora para el día [fecha] a las [hora].

¡Quedo atenta! 💙`,
        'Personalizar con los datos bancarios reales de la clínica.'
    )}

                    ${renderMensajeCard(
        'Confirmación de Abono Recibido',
        'check-circle',
        'green',
        `¡Hola, [Nombre]! 💙

Confirmamos la recepción de tu abono de $10.000. ¡Gracias!

Tu cita queda confirmada para:
📅 Fecha: [fecha]
🕐 Hora: [hora]
💆 Tratamiento: [tratamiento]

Recuerda llegar 5-10 minutos antes. ¡Te esperamos!`,
        'Enviar apenas se confirme la transferencia.'
    )}

                    ${renderMensajeCard(
        'Recordatorio de Política (Antes de 2da Cancelación)',
        'alert-triangle',
        'amber',
        `Hola, [Nombre] 💙

Te escribo porque tienes agendada tu sesión de [tratamiento] para el [fecha] a las [hora].

Como ya tuvimos que reagendar tu sesión anterior, te recuerdo que si esta cita también se cancela, para reagendar necesitaremos un abono de $10.000 (que se descuenta de tu sesión).

¿Confirmas tu asistencia? Así te reservamos el horario 🙌`,
        'Enviar 1-2 días antes de la cita cuando ya hubo una cancelación previa.'
    )}

                    ${renderMensajeCard(
        'Paciente Molesto por la Política',
        'heart-handshake',
        'purple',
        `Hola, [Nombre] 💙

Entiendo que la situación puede ser incómoda, y te agradezco tu paciencia.

Esta política la implementamos porque cuando se cancela una hora, ese espacio queda vacío y otros pacientes podrían haberlo aprovechado. El abono nos ayuda a confirmar que el horario realmente será utilizado.

La buena noticia es que ese dinero no se pierde: se descuenta directamente del valor de tu sesión, así que al final pagas lo mismo.

¿Coordinamos la próxima fecha? Estoy aquí para ayudarte 💙`,
        'Usar cuando el paciente reclama o cuestiona la política. Mantener tono empático.'
    )}

                    ${renderMensajeCard(
        'Nueva Cancelación (Aplicando la Política)',
        'ban',
        'red',
        `Hola, [Nombre] 💙

Lamentamos que no puedas asistir a tu cita de hoy.

Como esta es la segunda cancelación consecutiva en tu tratamiento de [tratamiento], para reagendar necesitamos un abono de $10.000.

Este abono se descuenta del valor de tu próxima sesión, así que no es un cobro adicional.

¿Te envío los datos para la transferencia y coordinamos una nueva fecha?`,
        'Usar cuando el paciente avisa que no puede asistir y es su 2da cancelación.'
    )}

                    ${renderMensajeCard(
        'Paciente Frecuente que Cancela - Tono Especial',
        'star',
        'yellow',
        `Hola, [Nombre] 💙

Sabemos que eres una paciente muy querida en CIALO y que a veces surgen imprevistos.

Esta sería la segunda vez que reagendamos esta sesión, por lo que para confirmar la nueva hora necesitaríamos el abono de $10.000.

Como siempre, este monto se descuenta de tu sesión, así que es solo una confirmación de tu asistencia.

¿Te parece si coordinamos una fecha que realmente te acomode? Queremos que puedas disfrutar tu tratamiento sin contratiempos 💙`,
        'Usar para pacientes frecuentes o VIP, manteniendo tono cercano.'
    )}
                </div>
            </div>

            <!-- Procedimiento ante Inasistencia -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="clipboard-list" class="w-6 h-6 text-red-600"></i>
                    Procedimiento ante Inasistencia
                </h3>

                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 class="font-bold text-red-800 mb-2">Cuando el paciente NO se presenta o avisa tarde:</h4>
                    <ol class="list-decimal list-inside space-y-2 text-sm text-red-900">
                        <li>Recepción marca la sesión como "perdida por inasistencia"</li>
                        <li>Se descuenta del saldo del paquete</li>
                        <li>Se registra en una nota interna (para historial)</li>
                        <li>Se envía mensaje según corresponda (ver guiones abajo)</li>
                    </ol>
                </div>

                <!-- Guiones de Mensajes -->
                <div class="space-y-3">
                    ${renderMensajeCard(
        'Inasistencia - Mensaje Estándar',
        'message-square',
        'blue',
        `Hola, [Nombre] 💙

Hoy tenías una sesión de tu paquete programada a las [hora] y no pudimos verte.

Como la cancelación fue con menos de 24-48 horas, según nuestra política la sesión se considera utilizada y se descuenta del paquete.

Sabemos que a veces pasan imprevistos, así que revisemos juntos los próximos horarios para que puedas aprovechar al máximo las sesiones restantes. 🙌

Te quedan [X] sesiones de tu paquete.

¿Cuándo te acomoda reagendar?`
    )}

                    ${renderMensajeCard(
        'Primera Inasistencia - Excepción de Cortesía',
        'heart',
        'purple',
        `Hola, [Nombre] 💙

Hoy tenías una sesión de tu paquete programada a las [hora] y no pudimos verte.

En esta oportunidad haremos una excepción y NO descontaremos la sesión del paquete, pero desde ahora sí tendremos que aplicar la política para cuidar la agenda de todos los pacientes.

Te recuerdo que puedes reagendar hasta 24-48 horas antes sin costo. Si cancelas muy encima de la hora o no asistes, la sesión se descuenta del paquete.

¿Cuándo te acomoda reagendar tu sesión?`,
        'Solo usar la PRIMERA vez. Registrar que se usó la excepción.'
    )}

                    ${renderMensajeCard(
        'Límite de Reagendamientos Alcanzado',
        'alert-circle',
        'amber',
        `Hola, [Nombre] 💙

Veo que has reagendado esta sesión 2 veces ya.

Para organizar bien la agenda, cada sesión puede reagendarse un máximo de 2 veces. Si después de esto no se asiste, la sesión se considera utilizada.

¿Podemos coordinar una fecha definitiva que realmente te acomode? Así aprovechas al máximo tu paquete. 🙌`,
        'Usar cuando el paciente ha reagendado la misma sesión 2 veces.'
    )}
                </div>
            </div>

            <!-- Explicación al Vender el Paquete -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="shopping-cart" class="w-6 h-6 text-green-600"></i>
                    Explicación al Vender el Paquete
                </h3>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p class="text-sm text-green-900 font-medium mb-2">
                        ⚠️ CLAVE: Esto se explica ANTES de cobrar el paquete, no después del problema.
                    </p>
                </div>

                ${renderMensajeCard(
        'Guion de Venta - Explicación de Políticas',
        'info',
        'green',
        `Antes de confirmar tu paquete, te comento algo importante 📝

Las sesiones tienen vigencia de 6 meses y puedes reagendar hasta 24-48 horas antes sin costo.

Si cancelas muy encima de la hora o no asistes, esa sesión se descuenta igual del paquete, porque ese bloque de tiempo queda reservado solo para ti.

¿Te parece bien? Si quieres, te lo enviamos por escrito para que lo tengas claro.`,
        'Enviar por WhatsApp/correo para que quede registro.'
    )}

                ${renderMensajeCard(
        'Confirmación de Compra de Paquete',
        'check-circle',
        'green',
        `¡Felicitaciones por tu decisión, [Nombre]! 🎉

Has adquirido el paquete de [X] sesiones de [tratamiento].

📋 Condiciones importantes:
✅ Vigencia: 6 meses desde hoy
✅ Puedes reagendar hasta 24-48 hrs antes sin costo
✅ Cada sesión puede moverse máximo 2 veces
✅ Si no asistes o cancelas tarde, la sesión se descuenta

Te enviamos las condiciones completas por escrito para que las tengas siempre a mano.

¿Cuándo quieres agendar tu primera sesión? 💙`,
        'Enviar inmediatamente después de la compra. Adjuntar documento de condiciones.'
    )}
            </div>

            <!-- Recordatorios de Vigencia -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="bell" class="w-6 h-6 text-orange-600"></i>
                    Recordatorios de Vigencia
                </h3>

                <div class="space-y-3">
                    ${renderMensajeCard(
        'Recordatorio 1 Mes Antes del Vencimiento',
        'calendar',
        'orange',
        `Hola, [Nombre] 💙

Te escribo para recordarte que tu paquete de [tratamiento] tiene vigencia hasta el [fecha].

Actualmente te quedan [X] sesiones por utilizar.

¿Quieres que coordinemos las fechas para que puedas aprovechar todas tus sesiones antes del vencimiento?

Quedo atenta para ayudarte a agendar. 🙌`,
        'Enviar 1 mes antes del vencimiento del paquete.'
    )}

                    ${renderMensajeCard(
        'Alerta 2 Semanas Antes del Vencimiento',
        'alert-triangle',
        'red',
        `Hola, [Nombre] 💙

Te escribo porque tu paquete de [tratamiento] vence el [fecha] (en [X] días).

Aún te quedan [X] sesiones por utilizar.

Es importante que las agendemos pronto para que no pierdas tu inversión.

¿Qué días y horarios te acomodan para coordinar las sesiones restantes?

Estoy aquí para ayudarte. 🙌`,
        'Enviar 2 semanas antes del vencimiento si quedan sesiones.'
    )}
                </div>
            </div>

            <!-- Pacientes VIP -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="star" class="w-6 h-6 text-yellow-600"></i>
                    Manejo de Pacientes VIP
                </h3>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p class="text-sm text-yellow-900 font-medium">
                        💡 Para pacientes de alto valor que aportan mucho ingreso: Mantener la regla pero ofrecer un gesto.
                    </p>
                </div>

                ${renderMensajeCard(
        'Paciente VIP con Inasistencia',
        'crown',
        'yellow',
        `Hola, [Nombre] 💙

Sabemos que han surgido varios imprevistos con tus horas.

Según la política del paquete, la sesión de hoy se descuenta, pero como valoramos mucho que te atiendas con nosotros, en la próxima visita te dejaremos un [pequeño beneficio: evaluación complementaria / descuento en producto / sesión adicional corta].

Lo importante es que podamos coordinar horarios que realmente te acomoden para que aproveches todo tu tratamiento.

¿Cuándo te viene bien para reagendar?`,
        'Solo para pacientes de alto valor. Consultar con supervisor antes de enviar.'
    )}
            </div>

            <!-- Documento de Condiciones -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="file-text" class="w-6 h-6 text-slate-600"></i>
                    Documento de Condiciones de Uso
                </h3>

                <div class="bg-slate-50 border border-slate-300 rounded-lg p-6">
                    <h4 class="text-lg font-bold text-center text-slate-800 mb-4">
                        CONDICIONES DE USO DE PAQUETES DE TRATAMIENTO – CLÍNICA CIALO
                    </h4>

                    <div class="space-y-4 text-sm text-slate-700">
                        <div>
                            <h5 class="font-bold text-slate-800 mb-2">📋 VIGENCIA</h5>
                            <p>Las sesiones del paquete tienen vigencia de 6 meses desde la primera atención.</p>
                        </div>

                        <div>
                            <h5 class="font-bold text-slate-800 mb-2">📅 AGENDAMIENTO Y CAMBIOS</h5>
                            <p>Los cambios/cancelaciones deben realizarse con mínimo 24-48 horas de anticipación.</p>
                        </div>

                        <div>
                            <h5 class="font-bold text-slate-800 mb-2">⚠️ INASISTENCIA / CANCELACIÓN TARDÍA</h5>
                            <p>Si el paciente no asiste o cancela fuera de ese plazo, la sesión se considera utilizada y se descontará del paquete.</p>
                        </div>

                        <div>
                            <h5 class="font-bold text-slate-800 mb-2">🔢 LÍMITE DE REAGENDAMIENTOS</h5>
                            <p>Cada sesión puede reagendarse un máximo de 2 veces. Después de eso, si no se asiste, la sesión se pierde.</p>
                        </div>

                        <div>
                            <h5 class="font-bold text-slate-800 mb-2">🤝 RESPONSABILIDAD COMPARTIDA</h5>
                            <p>El paciente es responsable de asistir a sus horas reservadas; CIALO se compromete a disponer del equipo profesional, sala e insumos necesarios en cada cita.</p>
                        </div>

                        <div>
                            <h5 class="font-bold text-slate-800 mb-2">💙 EXCEPCIONES (OPCIONAL)</h5>
                            <p>CIALO podrá, de manera excepcional, no descontar una sesión en caso de fuerza mayor debidamente informada, lo que no constituye obligación futura.</p>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-300">
                        <p class="text-xs text-slate-500 text-center">
                            Este documento puede ser revisado por el departamento legal para afinar redacción formal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderMensajeCard(title, icon, color, mensaje, nota = null) {
    const colorClasses = {
        blue: 'from-blue-50 to-cyan-50 border-blue-200',
        purple: 'from-purple-50 to-pink-50 border-purple-200',
        amber: 'from-amber-50 to-orange-50 border-amber-200',
        green: 'from-green-50 to-emerald-50 border-green-200',
        orange: 'from-orange-50 to-red-50 border-orange-200',
        red: 'from-red-50 to-pink-50 border-red-200',
        yellow: 'from-yellow-50 to-amber-50 border-yellow-200'
    };

    const iconColors = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        amber: 'text-amber-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600'
    };

    return `
        <div class="bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-4">
            <div class="flex items-start gap-3 mb-3">
                <i data-lucide="${icon}" class="w-5 h-5 ${iconColors[color]} flex-shrink-0 mt-0.5"></i>
                <div class="flex-1">
                    <h5 class="font-bold text-slate-800 mb-2">${title}</h5>
                    ${nota ? `<p class="text-xs text-slate-600 mb-2 italic">📝 ${nota}</p>` : ''}
                    <div class="bg-white/60 rounded p-3 text-sm text-slate-700 whitespace-pre-line font-mono">
${mensaje}
                    </div>
                    <button onclick="copyToClipboard(this)" data-text="${mensaje.replace(/"/g, '&quot;')}" 
                            class="mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        Copiar mensaje
                    </button>
                </div>
            </div>
        </div>
    `;
}

function initProtocoloSuspensionContent() {
    // Refrescar iconos
    lucide.createIcons();
}

// Función global para copiar al portapapeles
function copyToClipboard(button) {
    const text = button.getAttribute('data-text').replace(/&quot;/g, '"');

    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> ¡Copiado!';
        button.classList.add('bg-green-100', 'text-green-700', 'border-green-300');

        lucide.createIcons({ nodes: [button] });

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
            lucide.createIcons({ nodes: [button] });
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el texto');
    });
}
