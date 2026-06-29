import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma as db } from '../../db.ts';

const itemSchema = z.object({
  nombre:   z.string(),
  cat:      z.string(),
  precio:   z.number().int().min(0),
  cantidad: z.number().int().min(1),
});

const createSchema = z.object({
  paciente:  z.string().min(1),
  rut:       z.string().optional().nullable(),
  telefono:  z.string().optional().nullable(),
  email:     z.string().email().optional().nullable(),
  items:     z.array(itemSchema),
  descuento: z.number().int().min(0).max(100).default(0),
  notas:     z.string().optional().nullable(),
});

const updateSchema = createSchema.partial();

export const quotesRoutes: FastifyPluginAsync = async (app) => {
  // GET /quotes — listado
  app.get('/', { onRequest: [app.authenticate] }, async (req) => {
    const { user } = req;
    const isAdmin = user.role === 'ADMIN';
    const quotes = await db.quote.findMany({
      where: isAdmin ? undefined : { creadoPorId: user.sub },
      include: { creadoPor: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { quotes };
  });

  // POST /quotes — crear
  app.post('/', { onRequest: [app.authenticate] }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const subtotal = body.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
    const total    = Math.round(subtotal * (1 - body.descuento / 100));
    const quote = await db.quote.create({
      data: {
        ...body,
        items:      body.items,
        subtotal,
        total,
        creadoPorId: req.user.sub,
      },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return reply.code(201).send({ quote });
  });

  // GET /quotes/:id — detalle
  app.get('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const quote = await db.quote.findUnique({
      where: { id },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    if (!quote) return reply.code(404).send({ error: 'No encontrado' });
    return { quote };
  });

  // PATCH /quotes/:id — actualizar
  app.patch('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateSchema.parse(req.body);
    const existing = await db.quote.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrado' });
    if (existing.creadoPorId !== req.user.sub && req.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Sin permiso' });
    }
    const items = body.items ?? (existing.items as unknown as typeof body.items);
    const subtotal = items ? items.reduce((s, it) => s + it.precio * it.cantidad, 0) : existing.subtotal;
    const desc    = body.descuento ?? existing.descuento;
    const total   = Math.round(subtotal * (1 - desc / 100));
    const quote = await db.quote.update({
      where: { id },
      data: { ...body, subtotal, total },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return { quote };
  });

  // DELETE /quotes/:id — eliminar
  app.delete('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await db.quote.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrado' });
    if (existing.creadoPorId !== req.user.sub && req.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Sin permiso' });
    }
    await db.quote.delete({ where: { id } });
    return { ok: true };
  });
};
