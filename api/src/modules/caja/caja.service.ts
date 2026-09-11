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
import { emitirBoletaDeVenta, type ResultadoEmision } from '../boletas/boletas.service.ts';

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
  // Campos livianos del documento: el XML firmado pesa más de 20 KB y no lo
  // necesita nadie en el navegador. El timbre se pide aparte, como imagen.
  documento: {
    select: {
      id: true, tipo: true, folio: true, fechaEmision: true,
      neto: true, exento: true, iva: true, total: true,
      estado: true, trackId: true, ultimoError: true,
    },
  },
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

/**
 * Un ítem de venta es un producto (con stock) o un tratamiento (sin stock).
 * El precio del tratamiento es obligatorio: el catálogo guarda un rango
 * (`valorDesde`/`valorHasta`), no un valor único, así que lo fija quien vende.
 */
export type ItemVentaInput =
  | { tipo: 'PRODUCTO'; productId: number; cantidad: number; precioUnitario?: number }
  | {
      tipo: 'TRATAMIENTO';
      treatmentId: string;
      cantidad: number;
      precioUnitario: number;
      /** Profesional que realizó la prestación; aparece en el comprobante. */
      professionalId?: string | null;
    };

export interface CreateVentaInput {
  cliente?: string | null;
  metodoPago: MetodoPago;
  descuento?: number;
  notas?: string | null;
  items: ItemVentaInput[];
}

export async function createVenta(input: CreateVentaInput, vendedorId: string) {
  const venta = await prisma.$transaction(async (tx) => {
    // Releer el turno DENTRO de la transacción: evita vender contra una caja
    // que se cerró un instante antes.
    const turno = await tx.turno.findFirst({ where: { estado: 'ABIERTO' }, select: { id: true } });
    if (!turno) throw new CajaError('No hay una caja abierta. Abre la caja antes de vender.', 409);

    const idsProductos = input.items.flatMap((i) => (i.tipo === 'PRODUCTO' ? [i.productId] : []));
    const idsTratamientos = input.items.flatMap((i) => (i.tipo === 'TRATAMIENTO' ? [i.treatmentId] : []));

    const idsProfesionales = input.items.flatMap((i) =>
      i.tipo === 'TRATAMIENTO' && i.professionalId ? [i.professionalId] : [],
    );

    const [products, treatments, profesionales] = await Promise.all([
      idsProductos.length
        ? tx.product.findMany({
            where: { id: { in: idsProductos } },
            select: { id: true, brand: true, name: true, price: true, inventarioItemId: true },
          })
        : [],
      idsTratamientos.length
        ? tx.treatment.findMany({
            where: { id: { in: idsTratamientos } },
            select: { id: true, nombre: true, categoria: true },
          })
        : [],
      idsProfesionales.length
        ? tx.professional.findMany({
            where: { id: { in: idsProfesionales } },
            select: { id: true, nombreCompleto: true, especialidad: true },
          })
        : [],
    ]);
    const byId = new Map(products.map((p) => [p.id, p]));
    const byTratamiento = new Map(treatments.map((t) => [t.id, t]));
    const byProfesional = new Map(profesionales.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemsData = input.items.map((it) => {
      if (it.tipo === 'TRATAMIENTO') {
        const t = byTratamiento.get(it.treatmentId);
        if (!t) throw new CajaError(`Tratamiento ${it.treatmentId} no encontrado`, 404);
        if (!Number.isFinite(it.precioUnitario) || it.precioUnitario <= 0) {
          throw new CajaError(`Indica el precio de "${t.nombre}"`, 400);
        }
        const prof = it.professionalId ? byProfesional.get(it.professionalId) : null;
        if (it.professionalId && !prof) {
          throw new CajaError(`Profesional ${it.professionalId} no encontrado`, 404);
        }
        subtotal += it.precioUnitario * it.cantidad;
        return {
          treatmentId: t.id,
          productId: null,
          inventarioItemId: null,
          professionalId: prof?.id ?? null,
          profesionalNombre: prof?.nombreCompleto ?? null,
          nombre: t.nombre,
          precioUnitario: it.precioUnitario,
          cantidad: it.cantidad,
        };
      }

      const p = byId.get(it.productId);
      if (!p) throw new CajaError(`Producto ${it.productId} no encontrado`, 404);
      const precio = it.precioUnitario ?? p.price;
      subtotal += precio * it.cantidad;
      return {
        treatmentId: null,
        professionalId: null,
        profesionalNombre: null,
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

  // Boleta electrónica: DESPUÉS de que la venta está confirmada, y en su propia
  // transacción. Si fuera parte de la anterior, un error de emisión abortaría
  // la transacción en Postgres y se perdería la venta ya cobrada. Aquí, lo peor
  // que puede pasar es una venta sin documento, que es recuperable.
  let boleta: ResultadoEmision = { emitida: false, motivo: 'No evaluada' };
  try {
    boleta = await prisma.$transaction((tx) =>
      emitirBoletaDeVenta(tx, {
        id: venta.id,
        descuento: venta.descuento,
        items: venta.items.map((vi) => ({
          treatmentId: vi.treatmentId,
          nombre: vi.nombre,
          precioUnitario: vi.precioUnitario,
          cantidad: vi.cantidad,
        })),
      }),
    );
  } catch (e) {
    boleta = { emitida: false, motivo: (e as Error)?.message ?? 'Error al emitir la boleta' };
  }

  return { ...venta, boleta };
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

    // Si la venta tenía boleta, el documento queda anulado junto con ella. El
    // folio NO se reutiliza: el SII exige que la numeración sea continua, así
    // que un folio anulado se declara anulado, no se recicla.
    await tx.documentoTributario.updateMany({
      where: { ventaId, estado: { not: 'ANULADA' } },
      data: { estado: 'ANULADA', resueltoAt: new Date() },
    });

    return tx.venta.update({
      where: { id: ventaId },
      data: { anuladaAt: new Date(), anuladaPorId: userId, motivoAnulacion: motivo || null },
      include: ventaInclude,
    });
  });
}

/**
 * Historial de ventas. Sin filtros trae las últimas; con `periodo` (YYYY-MM)
 * trae las de ese mes en horario de Chile, que es lo que necesita el reporte
 * mensual para poder abrir cada venta y revisarla.
 *
 * El mes se resuelve igual que en `resumenVentas`: se pide el rango ampliado
 * ±1 día y se filtra en memoria, para que una venta de las 23:00 del día 31 no
 * se cuele al mes siguiente por la diferencia con UTC.
 */
export async function listVentas(filtro: { turnoId?: string; periodo?: string; q?: string }) {
  const where: Record<string, unknown> = {};

  if (filtro.turnoId) where.turnoId = filtro.turnoId;

  if (filtro.periodo) {
    const [y, m] = filtro.periodo.split('-').map(Number);
    where.createdAt = {
      gte: new Date(Date.UTC(y, m - 1, 1) - 24 * 60 * 60 * 1000),
      lt: new Date(Date.UTC(y, m, 1) + 24 * 60 * 60 * 1000),
    };
  }

  if (filtro.q?.trim()) {
    const q = filtro.q.trim();
    const comoNumero = Number(q);
    where.OR = [
      { cliente: { contains: q, mode: 'insensitive' } },
      ...(Number.isInteger(comoNumero) && comoNumero > 0 ? [{ numero: comoNumero }] : []),
    ];
  }

  const ventas = await prisma.venta.findMany({
    where,
    include: ventaInclude,
    orderBy: { createdAt: 'desc' },
    take: filtro.periodo ? 500 : 200,
  });

  // Las ventas anuladas SÍ se devuelven: revisar el historial incluye poder ver
  // qué se anuló y por qué.
  return filtro.periodo
    ? ventas.filter((v) => mesChile(v.createdAt) === filtro.periodo)
    : ventas;
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
