/**
 * Eventos internos del Calendario general (reuniones, feriados/cierres, u otro).
 * Lectura: cualquier usuario autenticado. Escritura: ADMIN o RECEPCION.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';

const createSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  categoria: z.enum(['REUNION', 'FERIADO', 'OTRO']).default('OTRO'),
  fecha: z.string().datetime({ offset: true }),
  fechaFin: z.string().datetime({ offset: true }).optional().nullable(),
  todoElDia: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

const include = { creadoPor: { select: { id: true, nombre: true } } } as const;

export async function eventosRoutes(app: FastifyInstance) {
  const gestionar = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };

  // GET /eventos?desde=&hasta= — eventos en un rango (ISO), o todos si no se pasa rango
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { desde, hasta } = req.query as { desde?: string; hasta?: string };
    const eventos = await prisma.eventoInterno.findMany({
      where: (desde && hasta) ? {
        OR: [
          { fecha: { gte: new Date(desde), lte: new Date(hasta) } },
          { fechaFin: { gte: new Date(desde), lte: new Date(hasta) } },
          { AND: [{ fecha: { lte: new Date(desde) } }, { fechaFin: { gte: new Date(hasta) } }] },
        ],
      } : {},
      include,
      orderBy: { fecha: 'asc' },
    });
    return { eventos };
  });

  // POST /eventos
  app.post('/', gestionar, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const evento = await prisma.eventoInterno.create({
      data: { ...body, creadoPorId: req.user.sub },
      include,
    });
    return reply.code(201).send({ evento });
  });

  // PATCH /eventos/:id
  app.patch('/:id', gestionar, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateSchema.parse(req.body);
    const existing = await prisma.eventoInterno.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'Evento no encontrado' });
    const evento = await prisma.eventoInterno.update({ where: { id }, data: body, include });
    return { evento };
  });

  // DELETE /eventos/:id
  app.delete('/:id', gestionar, async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.eventoInterno.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'Evento no encontrado' });
    await prisma.eventoInterno.delete({ where: { id } });
    return { ok: true };
  });
}
