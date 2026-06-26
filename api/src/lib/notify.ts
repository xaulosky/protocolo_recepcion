/**
 * Notificaciones unificadas: crea la notificación in-app y, si están configurados,
 * envía email (SMTP) y push (Web Push / VAPID). Degrada con elegancia si faltan credenciales.
 */
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import type { NotificationType } from '@prisma/client';
import { prisma } from '../db.ts';
import { env } from '../env.ts';

// ── Email (lazy) ──
let mailer: nodemailer.Transporter | null = null;
const emailEnabled = Boolean(env.SMTP_HOST);
if (emailEnabled) {
  mailer = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

// ── Web Push ──
const pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
if (pushEnabled) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

interface NotifyInput {
  userId: string;
  type?: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  email?: boolean; // forzar/omitir email para esta notificación
  push?: boolean;
}

/** Envía un correo directo (recuperación de clave, bienvenida, etc.). Devuelve false si SMTP no está configurado. */
export async function sendMail(opts: { to: string; subject: string; html?: string; text?: string }): Promise<boolean> {
  if (!emailEnabled || !mailer) {
    console.warn('[mail] SMTP no configurado; correo omitido:', opts.subject);
    return false;
  }
  try {
    await mailer.sendMail({ from: env.MAIL_FROM, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
    return true;
  } catch (e) {
    console.error('[mail] error enviando correo:', (e as Error)?.message);
    return false;
  }
}

/** Envía solo Web Push a todas las suscripciones de un usuario (sin crear Notification en BD). */
export async function sendPush(userId: string, payload: { title: string; body: string; data?: Record<string, unknown> }) {
  if (!pushEnabled) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;
  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map((s) =>
      webpush
        .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body)
        .catch(async (err: { statusCode?: number }) => {
          // Suscripción expirada/inválida → eliminar.
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          }
        }),
    ),
  );
}

export async function notify(input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? 'SISTEMA',
      title: input.title,
      body: input.body,
      data: (input.data as object) ?? undefined,
    },
  });

  // Email
  if (emailEnabled && input.email !== false && mailer) {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true } });
    if (user?.email) {
      mailer.sendMail({ from: env.MAIL_FROM, to: user.email, subject: input.title, text: input.body }).catch((e) => {
        console.error('[notify] email error', e?.message);
      });
    }
  }

  // Push
  if (input.push !== false) {
    await sendPush(input.userId, { title: input.title, body: input.body, data: input.data });
  }

  return notification;
}

export const channels = { email: emailEnabled, push: pushEnabled };
export const vapidPublicKey = env.VAPID_PUBLIC_KEY || null;
