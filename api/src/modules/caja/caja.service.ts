/**
 * Caja / Punto de venta — lógica de negocio.
 *
 * Reglas centrales:
 * - Turno GLOBAL único: solo puede haber uno ABIERTO (reforzado por un índice
 *   único parcial en Postgres). No se puede vender sin turno abierto.
 * - La venta descuenta stock real de forma ATÓMICA: `updateMany` condicional
 *   (`stock >= cantidad`) dentro de una transacción — si un ítem no alcanza,
 *   toda la venta hace rollback sin descontar nada.
 * - Anulación lógica (nunca DELETE): repone stock con movimientos ENTRADA y
 *   la venta sale del reporte mensual pero queda en el historial.
 */
import type { MetodoPago } from '@prisma/client';
import { prisma } from '../../db.ts';

export class CajaError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const ventaInclude = {
  vendedor: { select: { id: true, nombre: true } },
  anuladaPor: { select: { id: true, nombre: true } },
  items: true,
} as const;

const turnoInclude = {
  abiertoPor: { select: { id: true, nombre: true } },
  cerradoPor: { select: { id: true, nombre: true } },
} as const;

/** Mes "YYYY-MM" de una fecha, en horario de Chile (el servidor corre en UTC). */
function mesChile(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }).slice(0, 7);
}

/** Totales del turno (ventas no anuladas), para la cabecera y el cierre. */
async function resumenTurno(turnoId: string) {
  const ventas = await prisma.venta.findMany({
    where: { turnoId, anuladaAt: null },
    select: { total: true, metodoPago: true },
  });
  const resumen = { ventas: ventas.length, total: 0, EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 };
  for (const v of ventas) {
    resumen.total += v.total;
    resumen[v.metodoPago] += v.total;
  }
  return resumen;
}

export async function getTurnoActual() {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'ABIERTO' },
    include: turnoInclude,
  });
  if (!turno) return null;
  return { ...turno, resumen: await resumenTurno(turno.id) };
}

export async function abrirTurno(input: { montoInicial: number; notas?: string | null }, userId: string) {
  const abierto = await prisma.turno.findFirst({ where: { estado: 'ABIERTO' }, select: { id: true } });
  if (abierto) throw new CajaError('Ya hay una caja abierta. Ciérrala antes de abrir otra.', 409);
  try {
    const turno = await prisma.turno.create({
      data: { montoInicial: input.montoInicial, aperturaNotas: input.notas || null, abiertoPorId: userId },
      include: turnoInclude,
    });
    return { ...turno, resumen: await resumenTurno(turno.id) };
  } catch (err) {
    // Índice único parcial: dos aperturas simultáneas → la segunda cae aquí.
    if ((err as { code?: string }).code === 'P2002') {
      throw new CajaError('Ya hay una caja abierta. Ciérrala antes de abrir otra.', 409);
    }
    throw err;
  }
}

export async function cerrarTurno(turnoId: string, input: { montoContado: number; notas?: string | null }, userId: string) {
  const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
  if (!turno) throw new CajaError('Turno no encontrado', 404);
  if (turno.estado !== 'ABIERTO') throw new CajaError('Este turno ya está cerrado', 409);

  const efectivo = await prisma.venta.aggregate({
    where: { turnoId, metodoPago: 'EFECTIVO', anuladaAt: null },
    _sum: { total: true },
  });
  const montoEsperado = turno.montoInicial + (efectivo._sum.total ?? 0);
  const diferencia = input.montoContado - montoEsperado;

  return prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: 'CERRADO',
      montoContado: input.montoContado,
      montoEsperado,
      diferencia,
      cierreNotas: input.notas || null,
      cerradoPorId: userId,
      cerradoAt: new Date(),
    },
    include: turnoInclude,
  });
}

export interface CreateVentaInput {
  cliente?: string | null;
  metodoPago: MetodoPago;
  descuento?: number;
  notas?: string | null;
  items: { productId: number; cantidad: number; precioUnitario?: number }[];
}

export async function createVenta(input: CreateVentaInput, vendedorId: string) {
  return prisma.$transaction(async (tx) => {
    // Releer el turno DENTRO de la transacción: evita vender contra una caja
    // que se cerró un instante antes.
    const turno = await tx.turno.findFirst({ where: { estado: 'ABIERTO' }, select: { id: true } });
    if (!turno) throw new CajaError('No hay una caja abierta. Abre la caja antes de vender.', 409);

    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
      select: { id: true, brand: true, name: true, price: true, inventarioItemId: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemsData = input.items.map((it) => {
      const p = byId.get(it.productId);
      if (!p) throw new CajaError(`Producto ${it.productId} no encontrado`, 404);
      const precio = it.precioUnitario ?? p.price;
      subtotal += precio * it.cantidad;
      return {
        productId: p.id,
        inventarioItemId: p.inventarioItemId,
        nombre: `${p.brand} ${p.name}`.trim(),
        precioUnitario: precio,
        cantidad: it.cantidad,
      };
    });
    const descuento = input.descuento ?? 0;
    const total = Math.round(subtotal * (1 - descuento / 100));

    const venta = await tx.venta.create({
      data: {
        turnoId: turno.id,
        cliente: input.cliente?.trim() || null,
        metodoPago: input.metodoPago,
        subtotal,
        descuento,
        total,
        notas: input.notas || null,
        vendedorId,
        items: { create: itemsData },
      },
      include: ventaInclude,
    });

    // Descuento de stock atómico por ítem: la condición `stock >= cantidad` se
    // evalúa y aplica en una sola sentencia SQL — dos ventas concurrentes no
    // pueden llevarse el mismo stock.
    for (const vi of venta.items) {
      if (!vi.inventarioItemId) continue;
      const res = await tx.inventarioItem.updateMany({
        where: { id: vi.inventarioItemId, stock: { gte: vi.cantidad } },
        data: { stock: { decrement: vi.cantidad } },
      });
      if (res.count === 0) {
        throw new CajaError(`Stock insuficiente para "${vi.nombre}". La venta no se registró.`, 409);
      }
      const despues = await tx.inventarioItem.findUnique({
        where: { id: vi.inventarioItemId },
        select: { stock: true },
      });
      await tx.inventarioMovimiento.create({
        data: {
          itemId: vi.inventarioItemId,
          tipo: 'SALIDA',
          cantidad: vi.cantidad,
          stockAntes: (despues!.stock) + vi.cantidad,
          stockDespues: despues!.stock,
          codigoMotivo: 'venta',
          notas: `Venta #${venta.numero}`,
          realizadoPorId: vendedorId,
          ventaItemId: vi.id,
        },
      });
    }

    return venta;
  });
}

export async function anularVenta(ventaId: string, motivo: string | null, userId: string) {
  return prisma.$transaction(async (tx) => {
    const venta = await tx.venta.findUnique({ where: { id: ventaId }, include: { items: true } });
    if (!venta) throw new CajaError('Venta no encontrada', 404);
    if (venta.anuladaAt) throw new CajaError('Esta venta ya está anulada', 409);

    for (const vi of venta.items) {
      if (!vi.inventarioItemId) continue;
      const item = await tx.inventarioItem.findUnique({
        where: { id: vi.inventarioItemId },
        select: { stock: true },
      });
      if (!item) continue; // el ítem de inventario fue eliminado después de la venta
      await tx.inventarioItem.update({
        where: { id: vi.inventarioItemId },
        data: { stock: { increment: vi.cantidad } },
      });
      await tx.inventarioMovimiento.create({
        data: {
          itemId: vi.inventarioItemId,
          tipo: 'ENTRADA',
          cantidad: vi.cantidad,
          stockAntes: item.stock,
          stockDespues: item.stock + vi.cantidad,
          codigoMotivo: 'devolucion',
          notas: `Anulación venta #${venta.numero}`,
          realizadoPorId: userId,
          ventaItemId: vi.id,
        },
      });
    }

    return tx.venta.update({
      where: { id: ventaId },
      data: { anuladaAt: new Date(), anuladaPorId: userId, motivoAnulacion: motivo || null },
      include: ventaInclude,
    });
  });
}

export async function listVentas(filtro: { turnoId?: string }) {
  return prisma.venta.findMany({
    where: filtro.turnoId ? { turnoId: filtro.turnoId } : {},
    include: ventaInclude,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

/**
 * Reporte mensual por vendedor. El mes se calcula en horario de Chile: se trae
 * el rango ampliado ±1 día y se agrupa en memoria (volumen bajo, precisión
 * de zona horaria exacta).
 */
export async function resumenVentas(periodo: string) {
  const [y, m] = periodo.split('-').map(Number);
  const desde = new Date(Date.UTC(y, m - 1, 1) - 24 * 60 * 60 * 1000);
  const hasta = new Date(Date.UTC(y, m, 1) + 24 * 60 * 60 * 1000);

  const ventas = await prisma.venta.findMany({
    where: { createdAt: { gte: desde, lt: hasta }, anuladaAt: null },
    select: {
      total: true,
      metodoPago: true,
      createdAt: true,
      vendedor: { select: { id: true, nombre: true } },
    },
  });
  const delMes = ventas.filter((v) => mesChile(v.createdAt) === periodo);

  const porVendedorMap = new Map<string, { vendedorId: string; nombre: string; total: number; cantidad: number }>();
  const porMetodoPago = { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 };
  let total = 0;
  for (const v of delMes) {
    total += v.total;
    porMetodoPago[v.metodoPago] += v.total;
    const cur = porVendedorMap.get(v.vendedor.id) ?? { vendedorId: v.vendedor.id, nombre: v.vendedor.nombre, total: 0, cantidad: 0 };
    cur.total += v.total;
    cur.cantidad += 1;
    porVendedorMap.set(v.vendedor.id, cur);
  }
  const porVendedor = [...porVendedorMap.values()].sort((a, b) => b.total - a.total);

  // Meses con ventas (para el selector). Volumen bajo: dedupe en memoria.
  const fechas = await prisma.venta.findMany({
    where: { anuladaAt: null },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  const meses = [...new Set(fechas.map((f) => mesChile(f.createdAt)))];

  return {
    resumen: { total, cantidad: delMes.length, porVendedor, porMetodoPago },
    meses,
  };
}
