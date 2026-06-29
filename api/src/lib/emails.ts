/** Plantillas HTML simples y consistentes para los correos del sistema. */

import { env } from '../env.ts';

const BRAND = '#7C6247';

function layout(titulo: string, cuerpo: string): string {
  const logoUrl = `${env.APP_URL.replace(/\/$/, '')}/logo-cialo.png`;
  return `<!doctype html><html><body style="margin:0;background:#F8F7F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1A1918;">
  <div style="max-width:480px;margin:0 auto;padding:28px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${logoUrl}" alt="Clínica Cialo" style="height:52px;width:auto;display:block;margin:0 auto;" />
    </div>
    <div style="background:#fff;border:1px solid #E5E0D8;border-radius:12px;padding:28px;">
      <h1 style="font-size:18px;margin:0 0 14px;color:#1A1918;">${titulo}</h1>
      ${cuerpo}
    </div>
    <p style="text-align:center;color:#9A8F84;font-size:11.5px;margin-top:18px;">Clínica Cialo · Este es un correo automático, no respondas a este mensaje.</p>
  </div></body></html>`;
}

function boton(href: string, texto: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;">${texto}</a>`;
}

export function resetPasswordEmail(nombre: string, link: string): { subject: string; html: string; text: string } {
  return {
    subject: 'Recuperar tu contraseña — Cialo Hub',
    html: layout('Recuperar contraseña', `
      <p style="font-size:14px;line-height:1.6;color:#4A4540;margin:0 0 18px;">Hola ${nombre}, recibimos una solicitud para restablecer la contraseña de tu cuenta. El enlace vence en 1 hora.</p>
      <p style="margin:0 0 20px;">${boton(link, 'Crear nueva contraseña')}</p>
      <p style="font-size:12.5px;line-height:1.6;color:#9A8F84;margin:0;">Si no fuiste tú, ignora este correo; tu contraseña no cambiará.</p>`),
    text: `Hola ${nombre}, para restablecer tu contraseña abre este enlace (vence en 1 hora): ${link}`,
  };
}

export function welcomeEmail(nombre: string, email: string, appUrl: string): { subject: string; html: string; text: string } {
  return {
    subject: 'Tu cuenta en Cialo Hub',
    html: layout('¡Bienvenido/a a Cialo Hub!', `
      <p style="font-size:14px;line-height:1.6;color:#4A4540;margin:0 0 14px;">Hola ${nombre}, se creó tu cuenta para el sistema interno de Clínica Cialo.</p>
      <p style="font-size:14px;line-height:1.6;color:#4A4540;margin:0 0 18px;"><strong>Usuario:</strong> ${email}</p>
      <p style="margin:0 0 18px;">${boton(appUrl, 'Ingresar al sistema')}</p>
      <p style="font-size:12.5px;line-height:1.6;color:#9A8F84;margin:0;">El administrador te asignó una contraseña inicial. Si no la tienes, usa la opción <strong>"¿Olvidaste tu contraseña?"</strong> en la pantalla de inicio para crear una.</p>`),
    text: `Se creó tu cuenta en Cialo Hub. Usuario: ${email}. Ingresa en ${appUrl}. Si no tienes contraseña, usa "¿Olvidaste tu contraseña?".`,
  };
}

export function consentimientoEmail(opts: {
  paciente: string;
  tratamiento: string;
  profesional: string;
  fecha: string;
  enlace: string;
}): { subject: string; html: string; text: string } {
  const { paciente, tratamiento, profesional, fecha, enlace } = opts;
  const primerNombre = paciente.split(' ')[0];

  const cuerpo = `
    <p style="font-size:14px;line-height:1.7;color:#4A4540;margin:0 0 6px;">Hola <strong>${primerNombre}</strong>,</p>
    <p style="font-size:14px;line-height:1.7;color:#4A4540;margin:0 0 20px;">
      Clínica Cialo te envía el consentimiento informado para tu procedimiento. Por favor léelo con calma y fírmalo desde tu teléfono o computador antes de la atención.
    </p>

    <div style="background:#F8F7F5;border:1px solid #E5E0D8;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:11px;color:#9A8F84;text-transform:uppercase;letter-spacing:.8px;padding-bottom:2px;">Procedimiento</td>
        </tr>
        <tr>
          <td style="font-size:15px;font-weight:700;color:#1A1918;padding-bottom:12px;">${tratamiento}</td>
        </tr>
        <tr>
          <td style="font-size:11px;color:#9A8F84;text-transform:uppercase;letter-spacing:.8px;padding-bottom:2px;">Profesional tratante</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#4A4540;padding-bottom:12px;">${profesional}</td>
        </tr>
        <tr>
          <td style="font-size:11px;color:#9A8F84;text-transform:uppercase;letter-spacing:.8px;padding-bottom:2px;">Fecha</td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#4A4540;">${fecha}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 22px;text-align:center;">${boton(enlace, '✍️  Revisar y firmar consentimiento')}</p>

    <p style="font-size:12px;color:#9A8F84;line-height:1.6;margin:0 0 10px;text-align:center;">
      O copia este enlace en tu navegador:
    </p>
    <p style="font-size:11.5px;color:#7C6247;word-break:break-all;text-align:center;margin:0 0 22px;background:#F8F7F5;padding:10px;border-radius:6px;">${enlace}</p>

    <p style="font-size:12.5px;color:#9A8F84;line-height:1.6;margin:0;border-top:1px solid #E5E0D8;padding-top:16px;">
      Si tienes dudas sobre el procedimiento o el consentimiento, no dudes en contactarnos antes de firmarlo. El enlace es de uso personal — no lo compartas con otras personas.
    </p>`;

  return {
    subject: `Tu consentimiento informado — ${tratamiento} · Clínica Cialo`,
    html: layout(`Consentimiento informado`, cuerpo),
    text: [
      `Hola ${primerNombre},`,
      ``,
      `Clínica Cialo te envía el consentimiento informado para tu procedimiento de ${tratamiento} con ${profesional}.`,
      ``,
      `Por favor revísalo y fírmalo antes de tu atención del ${fecha}:`,
      enlace,
      ``,
      `Si tienes dudas, contáctanos antes de firmar.`,
    ].join('\n'),
  };
}
