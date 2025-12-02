/**
 * PagosContent Component
 * Muestra políticas de pago y citas
 */

function PagosContent() {
    const general = paymentPolicies.filter(p => p.type === 'General');
    const others = paymentPolicies.filter(p => p.type !== 'General');

    return `
        <div class="space-y-6">
            ${general.map(p => renderGeneralPolicy(p)).join('')}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${others.map(p => renderPolicy(p)).join('')}
            </div>

            <div class="bg-slate-50 p-4 rounded text-sm text-slate-600 border border-slate-200">
                <strong>Mensaje Base Confirmación (Agendado):</strong><br/>
                "(Nombre), quedó agendada tu cita para el día [Fecha] a las [Hora].<br/>
                Dirección: Bulnes 220, of 509, Edificio Puerto Mayor II.<br/>
                Ubicación: https://maps.app.goo.gl/PyeYcr4JdqW7iJ4G9<br/>
                [Insertar Política de Cancelación correspondiente aquí]"
            </div>
        </div>
    `;
}

function renderGeneralPolicy(policy) {
    return `
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 class="font-bold text-purple-900 mb-2">${policy.title}</h3>
            <p class="text-sm text-purple-800 font-medium whitespace-pre-line">${policy.content}</p>
        </div>
    `;
}

function renderPolicy(policy) {
    return `
        <div class="border p-4 rounded-lg bg-white">
            <h4 class="font-bold mb-2 text-sm uppercase text-slate-500">${policy.title}</h4>
            <p class="text-sm whitespace-pre-line text-slate-700">${policy.content}</p>
        </div>
    `;
}
