import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { hashPassword } from '../../lib/password.ts';
import { syncUserChannels } from '../../lib/channels.ts';
import { syncBuzones } from '../../lib/buzon.ts';
import { sendMail, notify } from '../../lib/notify.ts';
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

// Perfil editable por el propio usuario (no toca email, rol ni permisos).
const perfilSchema = z.object({
  nombre: z.string().min(1).optional(),
  telefono: z.string().max(30).nullable().optional(),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

const select = { id: true, email: true, nombre: true, role: true, activo: true, permisos: true, ocultarEnDM: true, professionalId: true, telefono: true, fechaNacimiento: true, createdAt: true } as const;

/** "YYYY-MM-DD" de hoy en horario de Chile (el servidor corre en UTC). */
function hoyChile(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

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

  // PATCH /users/me/perfil — el propio usuario actualiza su perfil
  app.patch('/me/perfil', { preHandler: app.authenticate }, async (req, reply) => {
    const parsed = perfilSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    const user = await prisma.user.update({ where: { id: req.user.sub }, data: parsed.data, select });
    return { user };
  });

  // GET /users/cumpleanos — cumpleañeros de hoy y próximos 30 días.
  // Además, la primera visita del día dispara el aviso a todos los usuarios activos.
  app.get('/cumpleanos', { preHandler: app.authenticate }, async () => {
    const hoyStr = hoyChile(); // "YYYY-MM-DD"
    const [y, m, d] = hoyStr.split('-').map(Number);
    const hoyMD = hoyStr.slice(5); // "MM-DD"

    const users = await prisma.user.findMany({
      where: { activo: true, fechaNacimiento: { not: null } },
      select: { id: true, nombre: true, fechaNacimiento: true },
    });
    const conFecha = users.filter((u) => /^\d{4}-\d{2}-\d{2}$/.test(u.fechaNacimiento ?? ''));

    const hoy = conFecha
      .filter((u) => u.fechaNacimiento!.slice(5) === hoyMD)
      .map((u) => ({ id: u.id, nombre: u.nombre }));

    const base = Date.UTC(y, m - 1, d);
    const proximos = conFecha
      .map((u) => {
        const [, mm, dd] = u.fechaNacimiento!.split('-').map(Number);
        let next = Date.UTC(y, mm - 1, dd);
        if (next < base) next = Date.UTC(y + 1, mm - 1, dd);
        const dias = Math.round((next - base) / 86400000);
        return { id: u.id, nombre: u.nombre, fecha: `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}`, dias };
      })
      .filter((p) => p.dias > 0 && p.dias <= 30)
      .sort((a, b) => a.dias - b.dias);

    // Aviso diario idempotente: una sola tanda de notificaciones por día con cumpleaños.
    if (hoy.length > 0) {
      const yaAvisado = await prisma.notification.findFirst({
        where: {
          AND: [
            { data: { path: ['kind'], equals: 'cumpleanos' } },
            { data: { path: ['date'], equals: hoyStr } },
          ],
        },
        select: { id: true },
      });
      if (!yaAvisado) {
        const nombres = hoy.map((h) => h.nombre).join(', ');
        const destinatarios = await prisma.user.findMany({ where: { activo: true }, select: { id: true } });
        await Promise.allSettled(
          destinatarios.map((dest) =>
            notify({
              userId: dest.id,
              title: '🎂 ¡Hoy hay cumpleaños!',
              body: `Hoy está de cumpleaños: ${nombres}. ¡Envíale un saludo!`,
              data: { kind: 'cumpleanos', date: hoyStr },
              email: false, // in-app + push basta; sin spam de correo
            }),
          ),
        );
      }
    }

    return { hoy, proximos };
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
    await syncBuzones(); // crea su buzón (si es Box) o lo suma a los buzones (si es Recepción)

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
    // Si cambió el rol (o se reactivó), re-sincroniza canales y buzones.
    if (parsed.data.role !== undefined || parsed.data.activo !== undefined) {
      await syncUserChannels(id);
      await syncBuzones();
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
