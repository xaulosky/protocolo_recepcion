/**
 * Lógica de negocio de creación de tareas, compartida entre la ruta REST humana
 * (POST /tasks) y el dispatcher de tools del Copiloto IA — evita que ambos caminos
 * diverjan (ej. que uno notifique a los asignados y el otro no).
 */
import type { Prioridad } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';

export interface CreateTaskInput {
  tipo: string;
  descripcion: string;
  paciente?: string;
  prioridad?: Prioridad;
  asignadasIds?: string[];
  dueAt?: string | null;
  cirugiaId?: string | null;
  tags?: string[];
}

export const taskIncludeBase = {
  asignadas: { select: { id: true, nombre: true } },
  creadoPor: { select: { id: true, nombre: true } },
  checklist: { orderBy: { orden: 'asc' as const } },
} as const;

export async function recordTaskActivity(taskId: string, userId: string, tipo: string, detalle?: string) {
  await prisma.taskActivity.create({ data: { taskId, userId, tipo, detalle } });
}

export async function createTask(input: CreateTaskInput, creadoPorId: string) {
  const { asignadasIds = [], dueAt, ...rest } = input;

  const task = await prisma.task.create({
    data: {
      ...rest,
      dueAt: dueAt ? new Date(dueAt) : null,
      creadoPorId,
      asignadas: asignadasIds.length ? { connect: asignadasIds.map((id) => ({ id })) } : undefined,
    },
    include: taskIncludeBase,
  });

  const nombres = task.asignadas.map((u) => u.nombre).join(', ');
  await recordTaskActivity(task.id, creadoPorId, 'CREADA', nombres ? `Asignada a ${nombres}` : undefined);

  for (const u of task.asignadas) {
    if (u.id !== creadoPorId) {
      await notify({
        userId: u.id,
        type: 'TAREA_ASIGNADA',
        title: 'Nueva tarea asignada',
        body: `${task.tipo}: ${task.descripcion}`,
        data: { taskId: task.id },
      });
    }
  }

  return task;
}
