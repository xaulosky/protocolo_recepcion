import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma as db } from '../../db.ts';

function genCodigo() {
  return 'GC-' + Math.floor(10000 + Math.random() * 90000);
}

const createSchema = z.object({
  para:    z.string().min(1),
  de:      z.string().optional().nullable(),
  monto:   z.number().int().min(1),
  mensaje: z.string().optional().nullable(),
  notas:   z.string().optional().nullable(),
});

export const giftcardsRoutes: FastifyPluginAsync = async (app) => {
  // GET /gift-cards
  app.get('/', { onRequest: [app.authenticate] }, async (req) => {
    const { estado, q } = req.query as { estado?: string; q?: string };
    const giftCards = await db.giftCard.findMany({
      where: {
        ...(estado ? { estado: estado as 'ACTIVA' | 'CANJEADA' | 'ANULADA' } : {}),
        ...(q ? { para: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: { creadoPor: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { giftCards };
  });

  // POST /gift-cards — crear
  app.post('/', { onRequest: [app.authenticate] }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    // Asegurar código único
    let codigo = genCodigo();
    while (await db.giftCard.findUnique({ where: { codigo } })) {
      codigo = genCodigo();
    }
    const gc = await db.giftCard.create({
      data: { ...body, codigo, creadoPorId: req.user.sub },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return reply.code(201).send({ giftCard: gc });
  });

  // PATCH /gift-cards/:id/canjear — marcar como canjeada
  app.patch('/:id/canjear', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const gc = await db.giftCard.findUnique({ where: { id } });
    if (!gc) return reply.code(404).send({ error: 'No encontrada' });
    if (gc.estado !== 'ACTIVA') return reply.code(400).send({ error: 'Solo se pueden canjear Gift Cards activas' });
    const updated = await db.giftCard.update({
      where: { id },
      data: { estado: 'CANJEADA', canjeoAt: new Date() },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return { giftCard: updated };
  });

  // PATCH /gift-cards/:id/anular — anular
  app.patch('/:id/anular', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const gc = await db.giftCard.findUnique({ where: { id } });
    if (!gc) return reply.code(404).send({ error: 'No encontrada' });
    if (gc.estado === 'ANULADA') return reply.code(400).send({ error: 'Ya anulada' });
    const { notas } = (req.body as { notas?: string }) ?? {};
    const updated = await db.giftCard.update({
      where: { id },
      data: { estado: 'ANULADA', ...(notas ? { notas } : {}) },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return { giftCard: updated };
  });

  // PATCH /gift-cards/:id — actualizar notas (general)
  app.patch('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { notas } = (req.body as { notas?: string }) ?? {};
    const gc = await db.giftCard.findUnique({ where: { id } });
    if (!gc) return reply.code(404).send({ error: 'No encontrada' });
    const updated = await db.giftCard.update({
      where: { id },
      data: { ...(notas !== undefined ? { notas } : {}) },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    return { giftCard: updated };
  });

  // DELETE /gift-cards/:id — solo ADMIN
  app.delete('/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    if (req.user.role !== 'ADMIN') return reply.code(403).send({ error: 'Solo administradores' });
    const { id } = req.params as { id: string };
    await db.giftCard.delete({ where: { id } });
    return { ok: true };
  });
};
