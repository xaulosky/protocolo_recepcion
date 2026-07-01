import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';

/**
 * Honorarios a profesionales — registro central de pagos.
 * Solo ADMIN. Varios registros por profesional/mes. El "mes" es un string
 * "YYYY-MM" (`periodo`). Pensado para, a futuro, autocompletar montos desde
 * las comisiones de Reservo.
 */

const ESTADOS = ['PAGADO', 'PENDIENTE_PAGO', 'PENDIENTE_FACTURA', 'PENDIENTE_BOLETA'] as const;

const createSchema = z.object({
  professionalId: z.string().min(1),
  periodo:        z.string().regex(/^\d{4}-\d{2}$/, 'El mes debe tener formato YYYY-MM'),
  monto:          z.number().int().min(0),
  estado:         z.enum(ESTADOS).default('PENDIENTE_PAGO'),
  fechaPago:      z.string().optional().nullable(),
  notas:          z.string().optional().nullable(),
});

const updateSchema = z.object({
  periodo:   z.string().regex(/^\d{4}-\d{2}$/).optional(),
  monto:     z.number().int().min(0).optional(),
  estado:    z.enum(ESTADOS).optional(),
  fechaPago: z.string().optional().nullable(),
  notas:     z.string().optional().nullable(),
});

const profSelect = { select: { id: true, nombreCompleto: true, especialidad: true } } as const;

export async function honorariosRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: app.authorize([Role.ADMIN]) };

  // GET /honorarios?professionalId=&periodo=&estado= — listado con filtros
  app.get('/', adminOnly, async (req) => {
    const { professionalId, periodo, estado } = req.query as {
      professionalId?: string; periodo?: string; estado?: string;
    };
    const pagos = await prisma.pagoProfesional.findMany({
      where: {
        ...(professionalId ? { professionalId } : {}),
        ...(periodo ? { periodo } : {}),
        ...(estado ? { estado: estado as (typeof ESTADOS)[number] } : {}),
      },
      include: { professional: profSelect },
      orderBy: [{ periodo: 'desc' }, { createdAt: 'desc' }],
    });
    return { pagos };
  });

  // GET /honorarios/resumen?periodo= — totales por estado + meses disponibles
  app.get('/resumen', adminOnly, async (req) => {
    const { periodo } = req.query as { periodo?: string };
    const pagos = await prisma.pagoProfesional.findMany({
      where: periodo ? { periodo } : {},
      select: { monto: true, estado: true },
    });
    const resumen = {
      count: pagos.length, total: 0,
      PAGADO: 0, PENDIENTE_PAGO: 0, PENDIENTE_FACTURA: 0, PENDIENTE_BOLETA: 0,
    };
    for (const p of pagos) {
      resumen.total += p.monto;
      resumen[p.estado] += p.monto;
    }
    const meses = await prisma.pagoProfesional.findMany({
      distinct: ['periodo'], select: { periodo: true }, orderBy: { periodo: 'desc' },
    });
    return { resumen, meses: meses.map((m) => m.periodo) };
  });

  // POST /honorarios — registrar pago
  app.post('/', adminOnly, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const prof = await prisma.professional.findUnique({ where: { id: body.professionalId } });
    if (!prof) return reply.code(404).send({ error: 'Profesional no encontrado' });

    const pago = await prisma.pagoProfesional.create({
      data: {
        professionalId: body.professionalId,
        periodo:        body.periodo,
        monto:          body.monto,
        estado:         body.estado,
        fechaPago:      body.fechaPago ? new Date(body.fechaPago) : null,
        notas:          body.notas || null,
        creadoPorId:    req.user.sub,
      },
      include: { professional: profSelect },
    });
    return reply.code(201).send({ pago });
  });

  // PATCH /honorarios/:id — editar
  app.patch('/:id', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateSchema.parse(req.body);
    const existing = await prisma.pagoProfesional.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrado' });

    const data: Record<string, unknown> = {};
    if (body.periodo   !== undefined) data.periodo = body.periodo;
    if (body.monto     !== undefined) data.monto = body.monto;
    if (body.estado    !== undefined) data.estado = body.estado;
    if (body.fechaPago !== undefined) data.fechaPago = body.fechaPago ? new Date(body.fechaPago) : null;
    if (body.notas     !== undefined) data.notas = body.notas || null;

    const pago = await prisma.pagoProfesional.update({
      where: { id }, data, include: { professional: profSelect },
    });
    return { pago };
  });

  // DELETE /honorarios/:id
  app.delete('/:id', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.pagoProfesional.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'No encontrado' });
    await prisma.pagoProfesional.delete({ where: { id } });
    return reply.code(204).send();
  });
}
