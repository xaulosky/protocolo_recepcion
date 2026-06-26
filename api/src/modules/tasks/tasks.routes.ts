import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Etapa, Prioridad, Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';

const createSchema = z.object({
  tipo: z.string().min(1),
  descripcion: z.string().min(1),
  paciente: z.string().optional(),
  prioridad: z.nativeEnum(Prioridad).default(Prioridad.NORMAL),
  asignadaId: z.string().optional(),
});

const updateSchema = z.object({
  tipo: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  paciente: z.string().nullable().optional(),
  prioridad: z.nativeEnum(Prioridad).optional(),
  etapa: z.nativeEnum(Etapa).optional(),
  asignadaId: z.string().nullable().optional(),
});

const includeUsers = {
  asignada: { select: { id: true, nombre: true } },
  creadoPor: { select: { id: true, nombre: true } },
} as const;

export async function tasksRoutes(app: FastifyInstance) {
  const canEdit = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION, Role.PROFESIONAL]) };

  // GET /tasks
  app.get('/', { preHandler: app.authenticate }, async () => {
    const tasks = await prisma.task.findMany({ include: includeUsers, orderBy: { createdAt: 'asc' } });
    return { tasks };
  });

  // POST /tasks
  app.post('/', canEdit, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const task = await prisma.task.create({
      data: { ...parsed.data, creadoPorId: req.user.sub },
      include: includeUsers,
    });

    if (task.asignadaId && task.asignadaId !== req.user.sub) {
      await notify({
        userId: task.asignadaId,
        type: 'TAREA_ASIGNADA',
        title: 'Nueva tarea asignada',
        body: `${task.tipo}: ${task.descripcion}`,
        data: { taskId: task.id },
      });
    }
    return reply.code(201).send({ task });
  });

  // PATCH /tasks/:id
  app.patch('/:id', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const before = await prisma.task.findUnique({ where: { id } });
    if (!before) return reply.code(404).send({ error: 'Tarea no encontrada' });

    const task = await prisma.task.update({ where: { id }, data: parsed.data, include: includeUsers });

    // Notificar si se reasignó a otra persona.
    if (task.asignadaId && task.asignadaId !== before.asignadaId && task.asignadaId !== req.user.sub) {
      await notify({
        userId: task.asignadaId,
        type: 'TAREA_ASIGNADA',
        title: 'Tarea asignada a ti',
        body: `${task.tipo}: ${task.descripcion}`,
        data: { taskId: task.id },
      });
    }
    return { task };
  });

  // DELETE /tasks/:id
  app.delete('/:id', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.task.delete({ where: { id } });
    return reply.code(204).send();
  });
}
