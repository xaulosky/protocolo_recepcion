import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EtapaCirugia, PresupuestoEstado, InsumoTipo, CanalComunicacion, Role } from '@prisma/client';
import { prisma } from '../../db.ts';

const createSchema = z.object({
  paciente:      z.string().min(1),
  tipo:          z.string().min(1),
  telefono:      z.string().optional().nullable(),
  email:         z.string().optional().nullable(),
  notas:         z.string().optional().nullable(),
  fechaCirugia:  z.string().datetime({ offset: true }).optional().nullable(),
  professionalId: z.string().optional().nullable(),
});

const updateSchema = z.object({
  paciente:      z.string().min(1).optional(),
  tipo:          z.string().min(1).optional(),
  telefono:      z.string().optional().nullable(),
  email:         z.string().optional().nullable(),
  notas:         z.string().optional().nullable(),
  etapa:         z.nativeEnum(EtapaCirugia).optional(),
  fechaCirugia:  z.string().datetime({ offset: true }).optional().nullable(),
  professionalId: z.string().optional().nullable(),
});

const presupuestoSchema = z.object({
  monto:     z.number().int().min(0),
  descuento: z.number().int().min(0).max(100).default(0),
  estado:    z.nativeEnum(PresupuestoEstado).default(PresupuestoEstado.PENDIENTE),
  enviadoAt: z.string().datetime({ offset: true }).optional().nullable(),
  notas:     z.string().optional().nullable(),
});

const insumoCreateSchema = z.object({
  tipo:      z.nativeEnum(InsumoTipo),
  nombre:    z.string().min(1),
  productId: z.number().int().optional().nullable(),
  cantidad:  z.number().int().min(1).default(1),
  unidad:    z.string().optional().nullable(),
});

const insumoUpdateSchema = z.object({
  nombre:   z.string().min(1).optional(),
  cantidad: z.number().int().min(1).optional(),
  unidad:   z.string().optional().nullable(),
  listo:    z.boolean().optional(),
});

const comunicacionSchema = z.object({
  canal:       z.nativeEnum(CanalComunicacion),
  descripcion: z.string().min(1),
});

const incluyeListado = {
  professional:  { select: { id: true, nombreCompleto: true, especialidad: true } },
  creadoPor:     { select: { id: true, nombre: true } },
  presupuesto:   { select: { estado: true, monto: true, descuento: true } },
  _count:        { select: { tareas: true, insumos: true } },
} as const;

const incluyeDetalle = {
  professional:  { select: { id: true, nombreCompleto: true, especialidad: true } },
  creadoPor:     { select: { id: true, nombre: true } },
  presupuesto:   true,
  insumos:       { orderBy: { createdAt: 'asc' as const } },
  comunicaciones: {
    orderBy: { createdAt: 'desc' as const },
    include: { usuario: { select: { id: true, nombre: true } } },
  },
  tareas: {
    include: {
      asignada:  { select: { id: true, nombre: true } },
      creadoPor: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export async function cirugiasRoutes(app: FastifyInstance) {
  const canWrite = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };

  // GET /cirugias
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { etapa, q, professionalId } = req.query as { etapa?: string; q?: string; professionalId?: string };

    let proFilter: string | undefined;
    if (req.user.role === Role.PROFESIONAL) {
      const u = await prisma.user.findUnique({ where: { id: req.user.sub }, select: { professionalId: true } });
      proFilter = u?.professionalId ?? undefined;
    }

    const where = {
      ...(etapa        ? { etapa: etapa as EtapaCirugia }                                : {}),
      ...(q            ? { paciente: { contains: q, mode: 'insensitive' as const } }     : {}),
      ...(proFilter    ? { professionalId: proFilter }
        : professionalId ? { professionalId }                                             : {}),
    };

    const cirugias = await prisma.cirugia.findMany({ where, include: incluyeListado, orderBy: { updatedAt: 'desc' } });
    return { cirugias };
  });

  // POST /cirugias
  app.post('/', canWrite, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const cirugia = await prisma.cirugia.create({
      data: {
        ...parsed.data,
        fechaCirugia: parsed.data.fechaCirugia ? new Date(parsed.data.fechaCirugia) : null,
        creadoPorId: req.user.sub,
      },
      include: incluyeListado,
    });
    return reply.code(201).send({ cirugia });
  });

  // GET /cirugias/:id
  app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const cirugia = await prisma.cirugia.findUnique({ where: { id }, include: incluyeDetalle });
    if (!cirugia) return reply.code(404).send({ error: 'Cirugía no encontrada' });

    if (req.user.role === Role.PROFESIONAL) {
      const u = await prisma.user.findUnique({ where: { id: req.user.sub }, select: { professionalId: true } });
      if (cirugia.professionalId !== u?.professionalId) return reply.code(403).send({ error: 'Sin acceso' });
    }

    return { cirugia };
  });

  // PATCH /cirugias/:id
  app.patch('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const data = {
      ...parsed.data,
      fechaCirugia: parsed.data.fechaCirugia !== undefined
        ? (parsed.data.fechaCirugia ? new Date(parsed.data.fechaCirugia) : null)
        : undefined,
    };

    const cirugia = await prisma.cirugia.update({ where: { id }, data, include: incluyeListado });
    return { cirugia };
  });

  // DELETE /cirugias/:id
  app.delete('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.cirugia.delete({ where: { id } });
    return reply.code(204).send();
  });

  // PUT /cirugias/:id/presupuesto
  app.put('/:id/presupuesto', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = presupuestoSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const { enviadoAt, ...rest } = parsed.data;
    const enviadoAtDate = enviadoAt ? new Date(enviadoAt) : null;

    const presupuesto = await prisma.presupuesto.upsert({
      where:  { cirugiaId: id },
      update: { ...rest, enviadoAt: enviadoAt !== undefined ? enviadoAtDate : undefined },
      create: { ...rest, cirugiaId: id, enviadoAt: enviadoAtDate },
    });
    await prisma.cirugia.update({ where: { id }, data: {} }); // touch updatedAt
    return { presupuesto };
  });

  // POST /cirugias/:id/insumos
  app.post('/:id/insumos', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = insumoCreateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const insumo = await prisma.cirugiaInsumo.create({ data: { ...parsed.data, cirugiaId: id } });
    await prisma.cirugia.update({ where: { id }, data: {} });
    return reply.code(201).send({ insumo });
  });

  // PATCH /cirugias/:id/insumos/:insumoId
  app.patch('/:id/insumos/:insumoId', canWrite, async (req, reply) => {
    const { insumoId } = req.params as { id: string; insumoId: string };
    const parsed = insumoUpdateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const insumo = await prisma.cirugiaInsumo.update({ where: { id: insumoId }, data: parsed.data });
    return { insumo };
  });

  // DELETE /cirugias/:id/insumos/:insumoId
  app.delete('/:id/insumos/:insumoId', canWrite, async (req, reply) => {
    const { insumoId } = req.params as { id: string; insumoId: string };
    await prisma.cirugiaInsumo.delete({ where: { id: insumoId } });
    return reply.code(204).send();
  });

  // POST /cirugias/:id/comunicaciones
  app.post('/:id/comunicaciones', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = comunicacionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const comunicacion = await prisma.comunicacionLog.create({
      data: { ...parsed.data, cirugiaId: id, usuarioId: req.user.sub },
      include: { usuario: { select: { id: true, nombre: true } } },
    });
    await prisma.cirugia.update({ where: { id }, data: {} });
    return reply.code(201).send({ comunicacion });
  });

  // DELETE /cirugias/:id/comunicaciones/:logId
  app.delete('/:id/comunicaciones/:logId', canWrite, async (req, reply) => {
    const { logId } = req.params as { id: string; logId: string };
    await prisma.comunicacionLog.delete({ where: { id: logId } });
    return reply.code(204).send();
  });
}
