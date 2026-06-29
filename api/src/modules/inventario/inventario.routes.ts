import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';

const itemCreateSchema = z.object({
  nombre: z.string().min(1),
  sku: z.string().optional().nullable(),
  codigoBarras: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  stockMinimo: z.number().int().min(0).default(0),
  unidad: z.string().default('unidad'),
  categoria: z.string().optional().nullable(),
  costo: z.number().nonnegative().default(0),
  activo: z.boolean().default(true),
  notas: z.string().optional().nullable(),
});

const itemUpdateSchema = itemCreateSchema.partial();

const movimientoSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE']),
  cantidad: z.number().int().min(0),
  codigoMotivo: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
  profesionalId: z.string().optional().nullable(),
  fechaMovimiento: z.string().datetime({ offset: true }).optional().nullable(),
});

const includeBase = {
  creadoPor: { select: { id: true, nombre: true } },
} as const;

const includeMovimiento = {
  realizadoPor: { select: { id: true, nombre: true } },
  profesional: { select: { id: true, nombreCompleto: true } },
} as const;

export async function inventarioRoutes(app: FastifyInstance) {
  const canEdit = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };

  // GET /inventario/dashboard — stats + últimos movimientos
  app.get('/dashboard', { preHandler: app.authenticate }, async () => {
    const [allItems, ultimosMovimientos] = await Promise.all([
      prisma.inventarioItem.findMany({ where: { activo: true } }),
      prisma.inventarioMovimiento.findMany({
        take: 15,
        orderBy: { fechaMovimiento: 'desc' },
        include: {
          ...includeMovimiento,
          item: { select: { nombre: true, unidad: true } },
        },
      }),
    ]);

    const bajoStock = allItems.filter(i => i.stockMinimo > 0 && i.stock <= i.stockMinimo).length;
    const sinStock  = allItems.filter(i => i.stock === 0).length;
    const valorTotal = allItems.reduce((sum, i) => sum + i.stock * Number(i.costo), 0);

    return {
      dashboard: { totalItems: allItems.length, bajoStock, sinStock, valorTotal, ultimosMovimientos },
    };
  });

  // GET /inventario/bajo-stock
  app.get('/bajo-stock', { preHandler: app.authenticate }, async () => {
    const items = await prisma.inventarioItem.findMany({
      where: { activo: true },
      include: includeBase,
      orderBy: [{ stock: 'asc' }, { nombre: 'asc' }],
    });
    return { items: items.filter(i => i.stock <= i.stockMinimo) };
  });

  // GET /inventario/categorias
  app.get('/categorias', { preHandler: app.authenticate }, async () => {
    const rows = await prisma.inventarioItem.findMany({
      where: { activo: true, NOT: { categoria: null } },
      select: { categoria: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' },
    });
    return { categorias: rows.map(r => r.categoria).filter(Boolean) };
  });

  // GET /inventario
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { q, categoria, bajoStock, inactivos } = req.query as {
      q?: string; categoria?: string; bajoStock?: string; inactivos?: string;
    };

    const items = await prisma.inventarioItem.findMany({
      where: {
        ...(inactivos !== 'true' ? { activo: true } : {}),
        ...(categoria ? { categoria } : {}),
        ...(q ? {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' as const } },
            { sku: { contains: q, mode: 'insensitive' as const } },
            { descripcion: { contains: q, mode: 'insensitive' as const } },
            { categoria: { contains: q, mode: 'insensitive' as const } },
          ],
        } : {}),
      },
      include: includeBase,
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });

    const result = bajoStock === 'true' ? items.filter(i => i.stock <= i.stockMinimo) : items;
    return { items: result };
  });

  // POST /inventario
  app.post('/', canEdit, async (req, reply) => {
    const parsed = itemCreateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const { costo, ...rest } = parsed.data;
    const item = await prisma.inventarioItem.create({
      data: { ...rest, costo: costo ?? 0, creadoPorId: req.user.sub },
      include: includeBase,
    });
    return reply.code(201).send({ item });
  });

  // GET /inventario/:id
  app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const item = await prisma.inventarioItem.findUnique({
      where: { id },
      include: {
        ...includeBase,
        movimientos: {
          orderBy: { fechaMovimiento: 'desc' },
          take: 100,
          include: includeMovimiento,
        },
      },
    });
    if (!item) return reply.code(404).send({ error: 'Item no encontrado' });
    return { item };
  });

  // PATCH /inventario/:id
  app.patch('/:id', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = itemUpdateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const { costo, ...rest } = parsed.data;
    const item = await prisma.inventarioItem.update({
      where: { id },
      data: { ...rest, ...(costo !== undefined ? { costo } : {}) },
      include: includeBase,
    });
    return { item };
  });

  // DELETE /inventario/:id — soft delete
  app.delete('/:id', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.inventarioItem.update({ where: { id }, data: { activo: false } });
    return reply.code(204).send();
  });

  // POST /inventario/:id/movimiento
  app.post('/:id/movimiento', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = movimientoSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const item = await prisma.inventarioItem.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Item no encontrado' });

    const { tipo, cantidad, profesionalId, fechaMovimiento, ...rest } = parsed.data;

    let stockDespues: number;
    let cantidadReal: number;
    if (tipo === 'ENTRADA') {
      stockDespues = item.stock + cantidad;
      cantidadReal = cantidad;
    } else if (tipo === 'SALIDA') {
      stockDespues = Math.max(0, item.stock - cantidad);
      cantidadReal = item.stock - stockDespues; // real amount deducted
    } else {
      // AJUSTE: cantidad es el nuevo stock absoluto
      stockDespues = cantidad;
      cantidadReal = Math.abs(stockDespues - item.stock);
    }

    const [movimiento] = await prisma.$transaction([
      prisma.inventarioMovimiento.create({
        data: {
          itemId: id,
          tipo,
          cantidad: cantidadReal,
          stockAntes: item.stock,
          stockDespues,
          realizadoPorId: req.user.sub,
          ...(profesionalId ? { profesionalId } : {}),
          ...(fechaMovimiento ? { fechaMovimiento: new Date(fechaMovimiento) } : {}),
          ...rest,
        },
        include: { ...includeMovimiento, item: { select: { nombre: true } } },
      }),
      prisma.inventarioItem.update({ where: { id }, data: { stock: stockDespues } }),
    ]);

    return reply.code(201).send({ movimiento });
  });
}
