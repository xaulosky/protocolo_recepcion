import { createHash, randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { hashPassword, verifyPassword } from '../../lib/password.ts';
import { issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../../lib/tokens.ts';
import { sendMail } from '../../lib/notify.ts';
import { resetPasswordEmail } from '../../lib/emails.ts';
import type { AccessPayload } from '../../lib/auth.ts';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(6) });

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

function publicUser(u: { id: string; email: string; nombre: string; role: AccessPayload['role']; permisos: string[]; professionalId: string | null }) {
  return { id: u.id, email: u.email, nombre: u.nombre, role: u.role, permisos: u.permisos, professionalId: u.professionalId };
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/login
  app.post('/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }

    const payload: AccessPayload = { sub: user.id, email: user.email, nombre: user.nombre, role: user.role };
    const accessToken = app.jwt.sign(payload);
    const refreshToken = await issueRefreshToken(user.id);
    return { accessToken, refreshToken, user: publicUser(user) };
  });

  // POST /auth/refresh
  app.post('/refresh', async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const rotated = await rotateRefreshToken(parsed.data.refreshToken);
    if (!rotated) return reply.code(401).send({ error: 'Refresh token inválido o expirado' });

    const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
    if (!user || !user.activo) return reply.code(401).send({ error: 'Usuario no disponible' });

    const payload: AccessPayload = { sub: user.id, email: user.email, nombre: user.nombre, role: user.role };
    const accessToken = app.jwt.sign(payload);
    return { accessToken, refreshToken: rotated.token, user: publicUser(user) };
  });

  // POST /auth/logout
  app.post('/logout', async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (parsed.success) await revokeRefreshToken(parsed.data.refreshToken);
    return reply.code(204).send();
  });

  // POST /auth/forgot-password — envía un enlace de recuperación (siempre responde 200).
  app.post('/forgot-password', async (req) => {
    const parsed = forgotSchema.safeParse(req.body);
    if (parsed.success) {
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (user && user.activo) {
        const raw = randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(raw), expiresAt } });
        const link = `${env.APP_URL}/reset?token=${raw}`;
        const mail = resetPasswordEmail(user.nombre, link);
        await sendMail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text });
      }
    }
    // No revelamos si el email existe.
    return { ok: true };
  });

  // POST /auth/reset-password — fija una nueva contraseña con el token del correo.
  app.post('/reset-password', async (req, reply) => {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(parsed.data.token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return reply.code(400).send({ error: 'El enlace es inválido o expiró. Solicita uno nuevo.' });
    }

    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    // Cierra todas las sesiones activas del usuario.
    await prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { ok: true };
  });

  // GET /auth/me
  app.get('/me', { preHandler: app.authenticate }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' });
    return { user: publicUser(user) };
  });
}
