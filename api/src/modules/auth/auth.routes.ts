import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.ts';
import { verifyPassword } from '../../lib/password.ts';
import { issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../../lib/tokens.ts';
import type { AccessPayload } from '../../lib/auth.ts';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

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

  // GET /auth/me
  app.get('/me', { preHandler: app.authenticate }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' });
    return { user: publicUser(user) };
  });
}
