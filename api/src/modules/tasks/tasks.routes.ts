import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Etapa, Prioridad, Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';

const ETAPA_ES: Record<string, string> = {
  PENDIENTE: 'Pendiente', ASIGNADO: 'Asignado', EN_PROCESO: 'En proceso',
  REVISION: 'Revisión', CERRADO: 'Cerrado',
};

const createSchema = z.object({
  tipo: z.string().min(1),
  descripcion: z.string().min(1),
  paciente: z.string().optional(),
  prioridad: z.nativeEnum(Prioridad).default(Prioridad.NORMAL),
  asignadaId: z.string().optional(),
  dueAt: z.string().datetime({ offset: true }).optional().nullable(),
  cirugiaId: z.string().optional().nullable(),
});

const updateSchema = z.object({
  tipo: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  paciente: z.string().nullable().optional(),
  prioridad: z.nativeEnum(Prioridad).optional(),
  etapa: z.nativeEnum(Etapa).optional(),
  asignadaId: z.string().nullable().optional(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
});

const includeBase = {
  asignada:  { select: { id: true, nombre: true } },
  creadoPor: { select: { id: true, nombre: true } },
} as const;

const includeWithHistory = {
  ...includeBase,
  activities: {
    orderBy: { createdAt: 'asc' as const },
    include: { user: { select: { id: true, nombre: true } } },
  },
} as const;

async function recordActivity(taskId: string, userId: string, tipo: string, detalle?: string) {
  await prisma.taskActivity.create({ data: { taskId, userId, tipo, detalle } });
}

export async function tasksRoutes(app: FastifyInstance) {
  const canEdit = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION, Role.PROFESIONAL]) };

  // GET /tasks — admin ve todas; el resto solo las que creó o le asignaron
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const userId = req.user.sub;
    const isAdmin = req.user.role === Role.ADMIN;
    const tasks = await prisma.task.findMany({
      where: isAdmin ? undefined : { OR: [{ asignadaId: userId }, { creadoPorId: userId }] },
      include: includeBase,
      orderBy: { createdAt: 'asc' },
    });
    return { tasks };
  });

  // GET /tasks/:id — detalle completo con historial de actividad
  app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const task = await prisma.task.findUnique({ where: { id }, include: includeWithHistory });
    if (!task) return reply.code(404).send({ error: 'Tarea no encontrada' });
    return { task };
  });

  // POST /tasks
  app.post('/', canEdit, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const task = await prisma.task.create({
      data: { ...parsed.data, dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null, creadoPorId: req.user.sub },
      include: includeBase,
    });

    await recordActivity(task.id, req.user.sub, 'CREADA',
      task.asignada ? `Asignada a ${task.asignada.nombre}` : undefined
    );

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

    const before = await prisma.task.findUnique({
      where: { id },
      include: { asignada: { select: { nombre: true } } },
    });
    if (!before) return reply.code(404).send({ error: 'Tarea no encontrada' });

    const data = { ...parsed.data, dueAt: parsed.data.dueAt !== undefined
      ? (parsed.data.dueAt ? new Date(parsed.data.dueAt) : null)
      : undefined };

    const task = await prisma.task.update({ where: { id }, data, include: includeBase });

    // Registrar actividades según qué cambió
    if (parsed.data.etapa && parsed.data.etapa !== before.etapa) {
      await recordActivity(id, req.user.sub, 'MOVIDA',
        `${ETAPA_ES[before.etapa]} → ${ETAPA_ES[parsed.data.etapa]}`);

      // Si la tarea está vinculada a una cirugía, registrar en actividad de cirugía
      if (before.cirugiaId) {
        await prisma.cirugiaActividad.create({
          data: {
            cirugiaId:   before.cirugiaId,
            usuarioId:   req.user.sub,
            tipo:        'TAREA',
            descripcion: `Tarea "${before.tipo}": ${ETAPA_ES[before.etapa]} → ${ETAPA_ES[parsed.data.etapa]}`,
          },
        });
      }
    }
    if (parsed.data.asignadaId !== undefined && parsed.data.asignadaId !== before.asignadaId) {
      const nombre = task.asignada?.nombre ?? 'nadie';
      await recordActivity(id, req.user.sub, 'REASIGNADA', `Reasignada a ${nombre}`);
    }
    if (parsed.data.dueAt !== undefined) {
      const label = parsed.data.dueAt
        ? `Fecha: ${new Date(parsed.data.dueAt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}`
        : 'Fecha eliminada';
      await recordActivity(id, req.user.sub, 'FECHA', label);
    }
    if (parsed.data.descripcion && parsed.data.descripcion !== before.descripcion) {
      await recordActivity(id, req.user.sub, 'EDITADA', 'Descripción actualizada');
    }
    if (parsed.data.prioridad && parsed.data.prioridad !== before.prioridad) {
      const PRIO: Record<string, string> = { BAJA: 'Baja', NORMAL: 'Normal', URGENTE: 'Urgente' };
      await recordActivity(id, req.user.sub, 'EDITADA', `Prioridad: ${PRIO[parsed.data.prioridad]}`);
    }

    // Notificar si se reasignó a otra persona
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
