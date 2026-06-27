import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { hashPassword } from '../../lib/password.ts';
import { syncUserChannels } from '../../lib/channels.ts';
import { sendMail } from '../../lib/notify.ts';
import { welcomeEmail } from '../../lib/emails.ts';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(1),
  role: z.nativeEnum(Role),
  professionalId: z.string().optional(),
  permisos: z.array(z.string()).optional(),
  ocultarEnDM: z.boolean().optional(),
});

const updateSchema = z.object({
  nombre: z.string().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  activo: z.boolean().optional(),
  password: z.string().min(6).optional(),
  professionalId: z.string().nullable().optional(),
  permisos: z.array(z.string()).optional(),
  ocultarEnDM: z.boolean().optional(),
});

const select = { id: true, email: true, nombre: true, role: true, activo: true, permisos: true, ocultarEnDM: true, professionalId: true, createdAt: true } as const;

export async function usersRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: app.authorize([Role.ADMIN]) };

  // GET /users/assignable — lista mínima para asignar tareas (cualquier usuario autenticado)
  app.get('/assignable', { preHandler: app.authenticate }, async () => {
    const users = await prisma.user.findMany({
      where: { activo: true, role: { in: [Role.ADMIN, Role.RECEPCION, Role.PROFESIONAL] } },
      select: { id: true, nombre: true, role: true },
      orderBy: { nombre: 'asc' },
    });
    return { users };
  });

  // GET /users
  app.get('/', adminOnly, async () => {
    const users = await prisma.user.findMany({ select, orderBy: { createdAt: 'asc' } });
    return { users };
  });

  // POST /users
  app.post('/', adminOnly, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return reply.code(409).send({ error: 'Ese email ya está registrado' });

    const { password, ...rest } = parsed.data;
    const user = await prisma.user.create({
      data: { ...rest, passwordHash: await hashPassword(password) },
      select,
    });
    await syncUserChannels(user.id); // entra a los canales de su rol

    // Correo de bienvenida (no bloquea la respuesta si falla/no hay SMTP).
    const mail = welcomeEmail(user.nombre, user.email, env.APP_URL);
    sendMail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text }).catch(() => {});

    return reply.code(201).send({ user });
  });

  // PATCH /users/:id
  app.patch('/:id', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const { password, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (password) data.passwordHash = await hashPassword(password);

    const user = await prisma.user.update({ where: { id }, data, select });
    // Si cambió el rol (o se reactivó), re-sincroniza su pertenencia a canales.
    if (parsed.data.role !== undefined || parsed.data.activo !== undefined) {
      await syncUserChannels(id);
    }
    return { user };
  });

  // DELETE /users/:id
  app.delete('/:id', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (id === req.user.sub) return reply.code(400).send({ error: 'No puedes eliminar tu propio usuario' });
    await prisma.user.delete({ where: { id } });
    return reply.code(204).send();
  });
}
