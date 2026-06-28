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
  asignadasIds: z.array(z.string()).optional().default([]),
  dueAt: z.string().datetime({ offset: true }).optional().nullable(),
  cirugiaId: z.string().optional().nullable(),
});

const updateSchema = z.object({
  tipo: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  paciente: z.string().nullable().optional(),
  prioridad: z.nativeEnum(Prioridad).optional(),
  etapa: z.nativeEnum(Etapa).optional(),
  asignadasIds: z.array(z.string()).optional(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
});

const includeBase = {
  asignadas:  { select: { id: true, nombre: true } },
  creadoPor:  { select: { id: true, nombre: true } },
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
      where: isAdmin ? undefined : {
        OR: [
          { asignadas: { some: { id: userId } } },
          { creadoPorId: userId },
        ],
      },
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

    const { asignadasIds, dueAt, ...rest } = parsed.data;

    const task = await prisma.task.create({
      data: {
        ...rest,
        dueAt: dueAt ? new Date(dueAt) : null,
        creadoPorId: req.user.sub,
        asignadas: asignadasIds.length ? { connect: asignadasIds.map((id) => ({ id })) } : undefined,
      },
      include: includeBase,
    });

    const nombres = task.asignadas.map((u) => u.nombre).join(', ');
    await recordActivity(task.id, req.user.sub, 'CREADA',
      nombres ? `Asignada a ${nombres}` : undefined
    );

    for (const u of task.asignadas) {
      if (u.id !== req.user.sub) {
        await notify({
          userId: u.id,
          type: 'TAREA_ASIGNADA',
          title: 'Nueva tarea asignada',
          body: `${task.tipo}: ${task.descripcion}`,
          data: { taskId: task.id },
        });
      }
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
      include: { asignadas: { select: { id: true, nombre: true } } },
    });
    if (!before) return reply.code(404).send({ error: 'Tarea no encontrada' });

    const { asignadasIds, dueAt, ...rest } = parsed.data;

    const data: Record<string, unknown> = {
      ...rest,
      ...(dueAt !== undefined ? { dueAt: dueAt ? new Date(dueAt) : null } : {}),
      ...(asignadasIds !== undefined
        ? { asignadas: { set: asignadasIds.map((uid) => ({ id: uid })) } }
        : {}),
    };

    const task = await prisma.task.update({ where: { id }, data, include: includeBase });

    // Registrar actividades según qué cambió
    if (parsed.data.etapa && parsed.data.etapa !== before.etapa) {
      await recordActivity(id, req.user.sub, 'MOVIDA',
        `${ETAPA_ES[before.etapa]} → ${ETAPA_ES[parsed.data.etapa]}`);

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
    if (asignadasIds !== undefined) {
      const beforeIds = new Set(before.asignadas.map((u) => u.id));
      const afterIds  = new Set(asignadasIds);
      const changed   = beforeIds.size !== afterIds.size || [...afterIds].some((uid) => !beforeIds.has(uid));
      if (changed) {
        const nombres = task.asignadas.map((u) => u.nombre).join(', ') || 'nadie';
        await recordActivity(id, req.user.sub, 'REASIGNADA', `Reasignada a ${nombres}`);

        // Notificar a los nuevos asignados
        for (const u of task.asignadas) {
          if (!beforeIds.has(u.id) && u.id !== req.user.sub) {
            await notify({
              userId: u.id,
              type: 'TAREA_ASIGNADA',
              title: 'Tarea asignada a ti',
              body: `${task.tipo}: ${task.descripcion}`,
              data: { taskId: task.id },
            });
          }
        }
      }
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

    return { task };
  });

  // DELETE /tasks/:id
  app.delete('/:id', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.task.delete({ where: { id } });
    return reply.code(204).send();
  });
}
