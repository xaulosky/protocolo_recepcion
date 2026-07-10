/**
 * Lógica de invitación de usuarios, compartida entre la ruta REST (POST /users/invitar)
 * y el tool `invitar_usuarios` del Copiloto IA.
 *
 * Una invitación crea el usuario con una contraseña aleatoria (desconocida para todos)
 * y le envía un enlace de "crear contraseña" reutilizando el flujo de PasswordResetToken
 * ya existente (/reset?token=...), con vencimiento extendido a 7 días. El enlace se
 * devuelve SIEMPRE al invocador (admin), de modo que si el correo falla —p. ej. SMTP
 * caído— pueda compartirse a mano por WhatsApp u otro canal.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { hashPassword } from '../../lib/password.ts';
import { syncUserChannels } from '../../lib/channels.ts';
import { syncBuzones } from '../../lib/buzon.ts';
import { sendMail } from '../../lib/notify.ts';
import { inviteEmail } from '../../lib/emails.ts';

const INVITE_TTL_DIAS = 7;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export interface InviteUserInput {
  nombre: string;
  email: string;
  role?: Role;
  permisos?: string[];
  ocultarEnDM?: boolean;
  copilotoHabilitado?: boolean;
}

export interface InviteUserResult {
  ok: boolean;
  email: string;
  nombre: string;
  userId?: string;
  enlace?: string;
  emailEnviado?: boolean;
  error?: string;
}

export async function inviteUser(input: InviteUserInput): Promise<InviteUserResult> {
  const email = input.email.trim().toLowerCase();
  const nombre = input.nombre.trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, email, nombre, error: 'Ese email ya está registrado' };

  // Contraseña aleatoria irrecuperable: el usuario define la suya vía el enlace.
  const user = await prisma.user.create({
    data: {
      email,
      nombre,
      role: input.role ?? 'RECEPCION',
      permisos: input.permisos ?? [],
      ocultarEnDM: input.ocultarEnDM ?? false,
      copilotoHabilitado: input.copilotoHabilitado ?? false,
      passwordHash: await hashPassword(randomBytes(24).toString('base64url')),
    },
    select: { id: true, email: true, nombre: true, role: true },
  });
  await syncUserChannels(user.id);
  await syncBuzones();

  const raw = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + INVITE_TTL_DIAS * 24 * 60 * 60 * 1000);
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(raw), expiresAt } });
  const enlace = `${env.APP_URL}/reset?token=${raw}`;

  const mail = inviteEmail(nombre, email, enlace);
  const emailEnviado = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text }).catch(() => false);

  return { ok: true, email, nombre, userId: user.id, enlace, emailEnviado };
}
