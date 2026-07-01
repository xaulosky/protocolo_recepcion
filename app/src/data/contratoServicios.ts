/**
 * Contrato de Prestación de Servicios — texto único (fuente de verdad).
 *
 * Se renderiza en TODAS las rutas del flujo de consentimientos:
 *  - Preview de recepción y modal del firmado (ContratoServiciosBox en Consentimientos.tsx)
 *  - Documento imprimible presencial (buildPrintHtml en Consentimientos.tsx)
 *  - PDF del consentimiento ya firmado (ImprimirConsentimiento.tsx)
 *  - Página pública que lee y firma el paciente (FirmaPublica.tsx)
 *
 * Editar el texto aquí actualiza todas las vistas por igual.
 */

export const CONTRATO_TITULO =
  'Contrato de Prestación de Servicios Médicos, Estéticos y Ambulatorios de Salud';

export const CONTRATO_INTRO =
  'Estimado/a Usuario/a: El presente documento constituye un Contrato de Prestación de Servicios entre el paciente y Clínica Cialo, el cual regula las condiciones bajo las cuales se otorgarán los servicios médicos, estéticos y ambulatorios de salud. La firma de este contrato implica la aceptación expresa de todas las cláusulas aquí establecidas. En el caso de pacientes menores de edad, se entenderá que uno de sus padres o tutor legal actuará como representante, autorizando los tratamientos correspondientes. El paciente declara que este contrato ha sido revisado previamente, que ha tenido la oportunidad de realizar todas las consultas necesarias y que firma de manera informada, consciente y voluntaria, comprendiendo cada uno de los puntos expuestos.';

export interface ContratoClausula {
  id: string;
  texto: string;
}

export const CONTRATO_CLAUSULAS: ContratoClausula[] = [
  {
    id: '1.A)',
    texto:
      'Ningún plan, servicio individual o abono dará derecho a cambio de tratamiento una vez realizado el pago, si las modificaciones, cancelaciones o reprogramaciones no se efectúan con al menos 24 horas de anticipación, a través de los canales oficiales de la clínica. La inasistencia sin aviso previo se considerará como sesión realizada. No se realizan devoluciones de dinero.',
  },
  {
    id: '1.B)',
    texto:
      'Cualquier reclamo relacionado con pagos deberá ser informado directamente en recepción y posteriormente formalizado mediante una solicitud escrita enviada al correo electrónico: contacto@cialo.cl, para su revisión por parte de la administración de la clínica.',
  },
  {
    id: '1.C.1)',
    texto:
      'El paciente entiende y acepta que los resultados de los tratamientos pueden variar entre individuos, y reconoce que es imposible predecir la respuesta específica de su organismo, así como el número exacto de sesiones necesarias. Todos los tratamientos ofrecidos son complementarios, y su efectividad dependerá del cumplimiento de las sesiones, la dieta, las recomendaciones y los cuidados indicados por el profesional tratante. Ningún tratamiento es garantizado al 100%, ya que cada paciente puede reaccionar de manera distinta. Por lo anterior, algunos tratamientos pueden requerir ser complementados con otros procedimientos, modificados o incluso suspendidos, según criterio del profesional clínico.',
  },
  {
    id: '1.C.2)',
    texto:
      'El procedimiento puede requerir sesiones adicionales a las recomendadas en la evaluación inicial, debido a la respuesta individual del paciente, con el fin de alcanzar el resultado esperado.',
  },
  {
    id: '1.D)',
    texto:
      'El tratamiento comenzará a contar desde el agendamiento de la primera cita correspondiente al plan o servicio individual. Una vez iniciado, tendrá una vigencia de 10 meses para su realización. Los servicios individuales tendrán una vigencia de 6 meses para su realización. El paciente se compromete a ser puntual en la asistencia a cada sesión agendada.',
  },
  {
    id: '1.E)',
    texto:
      'El tratamiento vencerá y el paciente perderá automáticamente el derecho a continuar con este si no asiste a la clínica por un período superior a 90 días consecutivos desde la última sesión realizada.',
  },
  {
    id: '1.F)',
    texto:
      'Los tratamientos son realizados por el equipo interdisciplinario de Clínica Cialo, sin exclusividad de un profesional específico. Todos los profesionales asignados estarán debidamente capacitados para ejecutar el tratamiento correspondiente.',
  },
  {
    id: '1.G)',
    texto:
      'Una vez leído el presente contrato, el paciente declara que ha comprendido su contenido, que le fue debidamente informado el procedimiento y tratamiento a realizar, y que acepta todas las condiciones aquí establecidas.',
  },
];

/** Escapa texto para insertarlo con seguridad dentro de un template HTML. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Bloque HTML del contrato para documentos construidos con template strings
 * (buildPrintHtml). Mantiene el mismo texto que las vistas React.
 */
export function contratoServiciosHtml(): string {
  const clausulas = CONTRATO_CLAUSULAS.map(
    (c) =>
      `<p style="font-size:11px;margin:3px 0;color:#333;line-height:1.6;text-align:justify;"><strong>${c.id}</strong> ${esc(c.texto)}</p>`,
  ).join('');
  return `<div style="margin-top:18px;padding:14px 16px;border:1px solid #ccc;border-radius:6px;background:#f9f9f9;page-break-inside:avoid;">
    <h3 style="margin:0 0 8px;font-size:9.5px;font-family:Arial,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:#111;border-bottom:1px solid #ddd;padding-bottom:5px;">${esc(CONTRATO_TITULO)}</h3>
    <p style="font-size:11px;margin:0 0 7px;color:#333;line-height:1.6;text-align:justify;">${esc(CONTRATO_INTRO)}</p>
    ${clausulas}
  </div>`;
}
