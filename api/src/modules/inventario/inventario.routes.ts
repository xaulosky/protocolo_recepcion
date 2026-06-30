import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';

// ── schemas ───────────────────────────────────────────────────────────────────

const itemCreateSchema = z.object({
  nombre:       z.string().min(1),
  sku:          z.string().optional().nullable(),
  codigoBarras: z.string().optional().nullable(),
  descripcion:  z.string().optional().nullable(),
  stock:        z.number().int().min(0).default(0),
  stockMinimo:  z.number().int().min(0).default(0),
  unidad:       z.string().default('unidad'),
  categoria:    z.string().optional().nullable(),
  costo:        z.number().nonnegative().default(0),
  activo:       z.boolean().default(true),
  notas:        z.string().optional().nullable(),
});

const itemUpdateSchema = itemCreateSchema.partial();

const movimientoSchema = z.object({
  tipo:                z.enum(['ENTRADA', 'SALIDA', 'AJUSTE', 'TRASLADO']),
  cantidad:            z.number().int().min(0),
  codigoMotivo:        z.string().optional().nullable(),
  notas:               z.string().optional().nullable(),
  profesionalId:       z.string().optional().nullable(),
  ubicacionId:         z.string().optional().nullable(),
  ubicacionDestinoId:  z.string().optional().nullable(),
  fechaMovimiento:     z.string().datetime({ offset: true }).optional().nullable(),
});

const locationSchema = z.object({
  nombre:      z.string().min(1),
  codigo:      z.string().min(1),
  descripcion: z.string().optional().nullable(),
  tipo:        z.string().default('storage'),
  parentId:    z.string().optional().nullable(),
});

// ── includes ──────────────────────────────────────────────────────────────────

const includeBase = {
  creadoPor: { select: { id: true, nombre: true } },
} as const;

const includeMovimiento = {
  realizadoPor:    { select: { id: true, nombre: true } },
  profesional:     { select: { id: true, nombreCompleto: true } },
  ubicacion:       { select: { id: true, nombre: true, codigo: true } },
  ubicacionDestino:{ select: { id: true, nombre: true, codigo: true } },
} as const;

// ── upsert location inventory helper ─────────────────────────────────────────

async function upsertLocInv(locationId: string, itemId: string, delta: number) {
  const existing = await prisma.locationInventario.findUnique({
    where: { locationId_itemId: { locationId, itemId } },
  });
  const newQty = Math.max(0, (existing?.quantity ?? 0) + delta);
  await prisma.locationInventario.upsert({
    where:  { locationId_itemId: { locationId, itemId } },
    create: { locationId, itemId, quantity: newQty },
    update: { quantity: newQty },
  });
  return newQty;
}

// ── routes ────────────────────────────────────────────────────────────────────

export async function inventarioRoutes(app: FastifyInstance) {
  const canEdit = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };
  const canAdmin = { preHandler: app.authorize([Role.ADMIN]) };

  // ── UBICACIONES (Storage Locations) ────────────────────────────────────────

  // GET /inventario/ubicaciones
  app.get('/ubicaciones', { preHandler: app.authenticate }, async () => {
    const locations = await prisma.storageLocation.findMany({
      where: { activo: true },
      include: {
        parent:   { select: { id: true, nombre: true, codigo: true } },
        children: { select: { id: true, nombre: true, codigo: true, activo: true }, where: { activo: true } },
        _count:   { select: { locationInventario: true } },
      },
      orderBy: [{ parentId: 'asc' }, { nombre: 'asc' }],
    });
    return { locations };
  });

  // POST /inventario/ubicaciones
  app.post('/ubicaciones', canEdit, async (req, reply) => {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    const location = await prisma.storageLocation.create({ data: parsed.data });
    return reply.code(201).send({ location });
  });

  // GET /inventario/ubicaciones/:id — con todos los items de esa ubicación
  app.get('/ubicaciones/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const location = await prisma.storageLocation.findUnique({
      where: { id },
      include: {
        parent:   { select: { id: true, nombre: true, codigo: true } },
        children: { select: { id: true, nombre: true, codigo: true }, where: { activo: true } },
        locationInventario: {
          include: { item: { select: { id: true, nombre: true, sku: true, unidad: true, categoria: true, costo: true, stockMinimo: true } } },
          orderBy: [{ item: { categoria: 'asc' } }, { item: { nombre: 'asc' } }],
        },
      },
    });
    if (!location) return reply.code(404).send({ error: 'Ubicación no encontrada' });
    return { location };
  });

  // PATCH /inventario/ubicaciones/:id
  app.patch('/ubicaciones/:id', canEdit, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = locationSchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });
    const location = await prisma.storageLocation.update({ where: { id }, data: parsed.data });
    return { location };
  });

  // DELETE /inventario/ubicaciones/:id — soft delete
  app.delete('/ubicaciones/:id', canAdmin, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.storageLocation.update({ where: { id }, data: { activo: false } });
    return reply.code(204).send();
  });

  // ── POR UBICACIÓN ────────────────────────────────────────────────────────────

  // GET /inventario/por-ubicacion — resumen de stock total agrupado por ubicación
  app.get('/por-ubicacion', { preHandler: app.authenticate }, async () => {
    const locations = await prisma.storageLocation.findMany({
      where: { activo: true },
      include: {
        parent: { select: { nombre: true } },
        locationInventario: {
          where: { quantity: { gt: 0 } },
          include: { item: { select: { id: true, nombre: true, unidad: true, categoria: true, costo: true, stockMinimo: true } } },
        },
        _count: { select: { locationInventario: true } },
      },
      orderBy: [{ parentId: 'asc' }, { nombre: 'asc' }],
    });

    const result = locations.map(loc => {
      const items = loc.locationInventario;
      const valorTotal = items.reduce((sum, li) => sum + li.quantity * Number(li.item.costo), 0);
      const bajoStock = items.filter(li => li.item.stockMinimo > 0 && li.quantity <= li.item.stockMinimo).length;
      return {
        id: loc.id, nombre: loc.nombre, codigo: loc.codigo, descripcion: loc.descripcion,
        parentNombre: loc.parent?.nombre ?? null,
        totalItems: items.length, valorTotal, bajoStock,
        items,
      };
    });

    return { locations: result };
  });

  // ── DASHBOARD ────────────────────────────────────────────────────────────────

  app.get('/dashboard', { preHandler: app.authenticate }, async () => {
    const [allItems, ultimosMovimientos, totalUbicaciones] = await Promise.all([
      prisma.inventarioItem.findMany({ where: { activo: true } }),
      prisma.inventarioMovimiento.findMany({
        take: 15,
        orderBy: { fechaMovimiento: 'desc' },
        include: {
          ...includeMovimiento,
          item: { select: { nombre: true, unidad: true } },
        },
      }),
      prisma.storageLocation.count({ where: { activo: true } }),
    ]);

    const bajoStock  = allItems.filter(i => i.stockMinimo > 0 && i.stock <= i.stockMinimo).length;
    const sinStock   = allItems.filter(i => i.stock === 0).length;
    const valorTotal = allItems.reduce((sum, i) => sum + i.stock * Number(i.costo), 0);

    return {
      dashboard: { totalItems: allItems.length, bajoStock, sinStock, valorTotal, totalUbicaciones, ultimosMovimientos },
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
    const { q, categoria, bajoStock, inactivos, ubicacionId } = req.query as {
      q?: string; categoria?: string; bajoStock?: string; inactivos?: string; ubicacionId?: string;
    };

    // Si piden por ubicación, buscar en LocationInventario
    if (ubicacionId) {
      const locItems = await prisma.locationInventario.findMany({
        where: {
          locationId: ubicacionId,
          item: {
            ...(inactivos !== 'true' ? { activo: true } : {}),
            ...(categoria ? { categoria } : {}),
            ...(q ? { OR: [
              { nombre: { contains: q, mode: 'insensitive' as const } },
              { sku: { contains: q, mode: 'insensitive' as const } },
            ] } : {}),
          },
        },
        include: {
          item: { include: includeBase },
          location: { select: { id: true, nombre: true, codigo: true } },
        },
        orderBy: [{ item: { categoria: 'asc' } }, { item: { nombre: 'asc' } }],
      });
      const result = bajoStock === 'true'
        ? locItems.filter(li => li.item.stockMinimo > 0 && li.quantity <= li.item.stockMinimo)
        : locItems;
      return { items: result };
    }

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
      include: {
        ...includeBase,
        locationInventario: {
          include: { location: { select: { id: true, nombre: true, codigo: true } } },
          orderBy: { location: { nombre: 'asc' } },
        },
      },
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
      include: { ...includeBase, locationInventario: { include: { location: { select: { id: true, nombre: true, codigo: true } } } } },
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
        locationInventario: {
          include: { location: { select: { id: true, nombre: true, codigo: true } } },
          orderBy: { location: { nombre: 'asc' } },
        },
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
      include: { ...includeBase, locationInventario: { include: { location: { select: { id: true, nombre: true, codigo: true } } } } },
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

    const { tipo, cantidad, profesionalId, ubicacionId, ubicacionDestinoId, fechaMovimiento, ...rest } = parsed.data;

    let stockDespues: number;
    let cantidadReal: number;

    if (tipo === 'TRASLADO') {
      // No cambia el stock total del ítem, solo redistribuye entre ubicaciones
      if (!ubicacionId || !ubicacionDestinoId) {
        return reply.code(400).send({ error: 'TRASLADO requiere ubicacionId y ubicacionDestinoId' });
      }
      stockDespues = item.stock;
      cantidadReal = cantidad;

      // Obtener stock actual en ubicación origen
      const locInvOrig = await prisma.locationInventario.findUnique({
        where: { locationId_itemId: { locationId: ubicacionId, itemId: id } },
      });
      const stockOrigenAntes = locInvOrig?.quantity ?? 0;
      const stockOrigenDespues = Math.max(0, stockOrigenAntes - cantidadReal);

      const [movimiento] = await prisma.$transaction([
        prisma.inventarioMovimiento.create({
          data: {
            itemId: id, tipo, cantidad: cantidadReal,
            stockAntes: stockOrigenAntes, stockDespues: stockOrigenDespues,
            realizadoPorId: req.user.sub,
            ubicacionId, ubicacionDestinoId,
            ...(profesionalId ? { profesionalId } : {}),
            ...(fechaMovimiento ? { fechaMovimiento: new Date(fechaMovimiento) } : {}),
            ...rest,
          },
          include: { ...includeMovimiento, item: { select: { nombre: true } } },
        }),
        // No update InventarioItem.stock for TRASLADO
        prisma.inventarioItem.update({ where: { id }, data: { updatedAt: new Date() } }),
      ]);

      // Update location inventories outside transaction (upsert not supported in tx easily)
      await upsertLocInv(ubicacionId, id, -cantidadReal);
      await upsertLocInv(ubicacionDestinoId, id, cantidadReal);

      return reply.code(201).send({ movimiento });
    }

    if (tipo === 'ENTRADA') {
      stockDespues = item.stock + cantidad;
      cantidadReal = cantidad;
    } else if (tipo === 'SALIDA') {
      stockDespues = Math.max(0, item.stock - cantidad);
      cantidadReal = item.stock - stockDespues;
    } else {
      // AJUSTE: cantidad es el nuevo stock absoluto
      stockDespues = cantidad;
      cantidadReal = Math.abs(stockDespues - item.stock);
    }

    const [movimiento] = await prisma.$transaction([
      prisma.inventarioMovimiento.create({
        data: {
          itemId: id, tipo, cantidad: cantidadReal,
          stockAntes: item.stock, stockDespues,
          realizadoPorId: req.user.sub,
          ...(ubicacionId ? { ubicacionId } : {}),
          ...(profesionalId ? { profesionalId } : {}),
          ...(fechaMovimiento ? { fechaMovimiento: new Date(fechaMovimiento) } : {}),
          ...rest,
        },
        include: { ...includeMovimiento, item: { select: { nombre: true } } },
      }),
      prisma.inventarioItem.update({ where: { id }, data: { stock: stockDespues } }),
    ]);

    // Update location inventory if ubicacion provided
    if (ubicacionId) {
      const delta = tipo === 'ENTRADA' ? cantidadReal
        : tipo === 'SALIDA' ? -cantidadReal
        : null; // AJUSTE at location level: set absolute value
      if (delta !== null) {
        await upsertLocInv(ubicacionId, id, delta);
      } else {
        // AJUSTE: set location quantity to match (approximation — set to new total)
        await prisma.locationInventario.upsert({
          where:  { locationId_itemId: { locationId: ubicacionId, itemId: id } },
          create: { locationId: ubicacionId, itemId: id, quantity: stockDespues },
          update: { quantity: stockDespues },
        });
      }
    }

    return reply.code(201).send({ movimiento });
  });
}
