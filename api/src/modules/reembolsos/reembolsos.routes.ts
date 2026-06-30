import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma as db } from '../../db.ts';

const createSchema = z.object({
  paciente:  z.string().min(1),
  rut:       z.string().optional().nullable(),
  telefono:  z.string().optional().nullable(),
  fechaPago: z.string().optional().nullable(),
  monto:     z.string().optional().nullable(),
  motivo:    z.string().min(1),
  banco:     z.string().optional().nullable(),
  cuenta:    z.string().optional().nullable(),
  urgente:   z.boolean().default(false),
});

const updateSchema = z.object({
  estado:  z.enum(['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO']).optional(),
  notas:   z.string().optional().nullable(),
  urgente: z.boolean().optional(),
});

export const reembolsosRoutes: FastifyPluginAsync = async (app) => {
  // GET /reembolsos
  app.get('/', { onRequest: [app.authenticate] }, async (req) => {
    const { estado, q } = req.query as { estado?: string; q?: string };
    const reembolsos = await db.solicitudReembolso.findMany({
      where: {
        ...(estado ? { estado: estado as 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' } : {}),
        ...(q ? { OR: [
          { paciente: { contains: q, mode: 'insensitive' } },
          { motivo:   { contains: q, mode: 'insensitive' } },
        ] } : {}),
      },
      include: { creadoPor: { select: { id: true, nombre: true } } },
      orderBy: [{ urgente: 'desc' }, { createdAt: 'desc' }],
    });
    return { reembolsos };
  });

  // POST /reembolsos — registrar solicitud y crear tarea automática
  app.post('/', { onRequest: [app.authenticate] }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const reembolso = await db.solicitudReembolso.create({
      data: { ...body, creadoPorId: req.user.sub },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    // Crear tarea con todos los datos del reembolso
    const detalles = [
      `Paciente: ${body.paciente}`,
      body.rut       ? `RUT: ${body.rut}`                  : null,
      body.telefono  ? `Teléfono: ${body.telefono}`        : null,
      body.fechaPago ? `Fecha de pago: ${body.fechaPago}`  : null,
      body.monto     ? `Monto: ${body.monto}`              : null,
      `Motivo: ${body.motivo}`,
      body.banco     ? `Banco: ${body.banco}`              : null,
      body.cuenta    ? `N° cuenta: ${body.cuenta}`         : null,
      body.urgente   ? `URGENTE`                           : null,
    ].filter(Boolean).join('\n');

    try {
      await db.task.create({
        data: {
          tipo: 'Reembolso',
          descripcion: detalles,
          paciente: body.paciente,
          prioridad: body.urgente ? 'URGENTE' : 'NORMAL',
          tags: ['reembolso'],
          creadoPorId: req.user.sub,
        },
      });
    } catch (err) {
      app.log.error({ err }, 'No se pudo crear la tarea para el reembolso');
    }

    return reply.code(201).send({ reembolso });
  });

  // PATCH /reembolsos/:id — actualizar estado/notas (admin o quien lo creó)
  app.patch('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateSchema.parse(req.body);
    const existing = await db.solicitudReembolso.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrada' });
    // Solo admin puede cambiar estado
    if (body.estado && req.user.role !== 'ADMIN' && req.user.role !== 'RECEPCION') {
      return reply.code(403).send({ error: 'Sin permiso para cambiar estado' });
    }
    const reembolso = await db.solicitudReembolso.update({
      where: { id },
      data: body,
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return { reembolso };
  });

  // DELETE /reembolsos/:id — solo el creador o admin
  app.delete('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await db.solicitudReembolso.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrada' });
    if (existing.creadoPorId !== req.user.sub && req.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Sin permiso' });
    }
    await db.solicitudReembolso.delete({ where: { id } });
    return { ok: true };
  });
};
