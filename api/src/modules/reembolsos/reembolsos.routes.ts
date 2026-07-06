import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma as db } from '../../db.ts';
import { createReembolso } from './reembolsos.service.ts';

export const createSchema = z.object({
  paciente:       z.string().min(1),
  rut:            z.string().optional().nullable(),
  telefono:       z.string().optional().nullable(),
  email:          z.string().optional().nullable(),
  fechaPago:      z.string().optional().nullable(),
  fechaSolicitud: z.string().optional().nullable(),
  monto:          z.string().optional().nullable(),
  motivo:         z.string().min(1),
  banco:          z.string().optional().nullable(),
  tipoCuenta:     z.string().optional().nullable(),
  cuenta:         z.string().optional().nullable(),
  titular:        z.string().optional().nullable(),
  urgente:        z.boolean().default(false),
});

const updateSchema = z.object({
  estado:         z.enum(['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO']).optional(),
  notas:          z.string().optional().nullable(),
  urgente:        z.boolean().optional(),
  paciente:       z.string().min(1).optional(),
  rut:            z.string().optional().nullable(),
  telefono:       z.string().optional().nullable(),
  email:          z.string().optional().nullable(),
  fechaPago:      z.string().optional().nullable(),
  fechaSolicitud: z.string().optional().nullable(),
  monto:          z.string().optional().nullable(),
  motivo:         z.string().min(1).optional(),
  banco:          z.string().optional().nullable(),
  tipoCuenta:     z.string().optional().nullable(),
  cuenta:         z.string().optional().nullable(),
  titular:        z.string().optional().nullable(),
});

const actividadInclude = {
  user: { select: { id: true, nombre: true } },
};

export const reembolsosRoutes: FastifyPluginAsync = async (app) => {
  // GET /reembolsos
  app.get('/', { onRequest: [app.authenticate] }, async (req) => {
    const { estado, q } = req.query as { estado?: string; q?: string };

    const [reembolsos, resumenRaw] = await Promise.all([
      db.solicitudReembolso.findMany({
        where: {
          ...(estado ? { estado: estado as 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' } : {}),
          ...(q ? { OR: [
            { paciente: { contains: q, mode: 'insensitive' } },
            { motivo:   { contains: q, mode: 'insensitive' } },
          ] } : {}),
        },
        include: { creadoPor: { select: { id: true, nombre: true } } },
        orderBy: [{ urgente: 'desc' }, { createdAt: 'desc' }],
      }),
      db.solicitudReembolso.groupBy({ by: ['estado'], _count: { id: true } }),
    ]);

    const resumen: Record<string, number> = { PENDIENTE: 0, EN_REVISION: 0, APROBADO: 0, RECHAZADO: 0 };
    for (const r of resumenRaw) resumen[r.estado] = r._count.id;

    return { reembolsos, resumen };
  });

  // GET /reembolsos/:id — detalle completo con actividad
  app.get('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const reembolso = await db.solicitudReembolso.findUnique({
      where: { id },
      include: {
        creadoPor: { select: { id: true, nombre: true } },
        actividad: {
          include: actividadInclude,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!reembolso) return reply.code(404).send({ error: 'No encontrada' });
    return { reembolso };
  });

  // POST /reembolsos — registrar solicitud y crear tarea automática
  app.post('/', { onRequest: [app.authenticate] }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const reembolso = await createReembolso(body, req.user.sub);
    return reply.code(201).send({ reembolso });
  });

  // PATCH /reembolsos/:id — actualizar (admin o recepción)
  app.patch('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateSchema.parse(req.body);
    const existing = await db.solicitudReembolso.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrada' });

    if (req.user.role !== 'ADMIN' && req.user.role !== 'RECEPCION') {
      return reply.code(403).send({ error: 'Sin permiso' });
    }

    const reembolso = await db.solicitudReembolso.update({
      where: { id },
      data: body,
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    // Auditoría
    const estadoCambio = body.estado && body.estado !== existing.estado;
    const camposEditados = Object.keys(body).filter(k => k !== 'estado' && k !== 'notas' && k !== 'urgente');
    try {
      if (estadoCambio) {
        await db.reembolsoActividad.create({
          data: { reembolsoId: id, userId: req.user.sub, tipo: 'ESTADO', detalle: `${existing.estado} → ${body.estado}` },
        });
      } else if (camposEditados.length > 0) {
        await db.reembolsoActividad.create({
          data: { reembolsoId: id, userId: req.user.sub, tipo: 'EDICION', detalle: camposEditados.join(', ') },
        });
      }
    } catch (err) {
      app.log.error({ err }, 'No se pudo registrar actividad de reembolso');
    }

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
