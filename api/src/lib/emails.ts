/** Plantillas HTML simples y consistentes para los correos del sistema. */

const BRAND = '#7C6247';

function layout(titulo: string, cuerpo: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F8F7F5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1A1918;">
  <div style="max-width:480px;margin:0 auto;padding:28px 20px;">
    <div style="text-align:center;margin-bottom:22px;">
      <div style="display:inline-block;background:${BRAND};color:#fff;font-weight:700;font-size:18px;padding:10px 16px;border-radius:10px;">Cialo Hub</div>
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
