import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import {
  CajaError, getTurnoActual, abrirTurno, cerrarTurno,
  createVenta,
  createVentaExterna, anularVenta, listVentas, resumenVentas,
} from './caja.service.ts';

const abrirSchema = z.object({
  montoInicial: z.number().int().min(0),
  notas: z.string().optional().nullable(),
});

const cerrarSchema = z.object({
  montoContado: z.number().int().min(0),
  notas: z.string().optional().nullable(),
});

const ventaSchema = z.object({
  cliente: z.string().optional().nullable(),
  metodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']),
  descuento: z.number().int().min(0).max(100).default(0),
  notas: z.string().optional().nullable(),
  items: z.array(
    z.discriminatedUnion('tipo', [
      z.object({
        tipo: z.literal('PRODUCTO'),
        productId: z.number().int(),
        cantidad: z.number().int().min(1),
        precioUnitario: z.number().int().min(0).optional(),
      }),
      z.object({
        tipo: z.literal('TRATAMIENTO'),
        treatmentId: z.string().min(1),
        cantidad: z.number().int().min(1),
        // Obligatorio: el catálogo guarda un rango, no un precio único.
        precioUnitario: z.number().int().min(1),
        professionalId: z.string().min(1).optional().nullable(),
      }),
    ]),
  ).min(1).max(50),
});

// Venta hecha en Reservo que trae la extensión de Chrome. Los ítems vienen con
// el nombre y precio que tenían allá: no hay ficha de tratamiento que exigir.
const ventaExternaSchema = z.object({
  origen: z.literal('RESERVO'),
  idExterno: z.string().min(8).max(100),
  referencia: z.string().max(300).optional().nullable(),
  cliente: z.string().max(200).optional().nullable(),
  metodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']),
  descuento: z.number().int().min(0).max(100).default(0),
  totalReservo: z.number().int().min(0).optional().nullable(),
  notas: z.string().max(1000).optional().nullable(),
  items: z
    .array(
      z.object({
        nombre: z.string().trim().min(1).max(200),
        cantidad: z.number().int().min(1).max(1000),
        precioUnitario: z.number().int().min(0),
        profesional: z.string().max(200).optional().nullable(),
        exento: z.boolean(),
      }),
    )
    .min(1)
    .max(50),
  datosReservo: z.record(z.string(), z.unknown()).optional().nullable(),
});

const anularSchema = z.object({
  motivo: z.string().optional().nullable(),
});

function handleCajaError(err: unknown, reply: FastifyReply) {
  if (err instanceof CajaError) return reply.code(err.status).send({ error: err.message });
  throw err;
}

export async function cajaRoutes(app: FastifyInstance) {
  const operarCaja = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };
  const adminOnly = { preHandler: app.authorize([Role.ADMIN]) };

  // GET /caja/turnos/actual — turno abierto (o null) con totales del turno
  app.get('/turnos/actual', operarCaja, async () => {
    const turno = await getTurnoActual();
    return { turno };
  });

  // POST /caja/turnos/abrir
  app.post('/turnos/abrir', operarCaja, async (req, reply) => {
    const body = abrirSchema.parse(req.body);
    try {
      const turno = await abrirTurno({ montoInicial: body.montoInicial, notas: body.notas }, req.user.sub);
      return reply.code(201).send({ turno });
    } catch (err) {
      return handleCajaError(err, reply);
    }
  });

  // PATCH /caja/turnos/:id/cerrar
  app.patch('/turnos/:id/cerrar', operarCaja, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = cerrarSchema.parse(req.body);
    try {
      const turno = await cerrarTurno(id, { montoContado: body.montoContado, notas: body.notas }, req.user.sub);
      return { turno };
    } catch (err) {
      return handleCajaError(err, reply);
    }
  });

  // POST /caja/ventas — registrar venta (descuenta stock, atómico)
  app.post('/ventas', operarCaja, async (req, reply) => {
    const body = ventaSchema.parse(req.body);
    try {
      const venta = await createVenta(body, req.user.sub);
      return reply.code(201).send({ venta });
    } catch (err) {
      return handleCajaError(err, reply);
    }
  });

  // POST /caja/ventas/externa — venta hecha en Reservo (extensión de Chrome).
  // Idempotente por idExterno: un reintento devuelve 200 con la venta existente.
  app.post('/ventas/externa', operarCaja, async (req, reply) => {
    const parsed = ventaExternaSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    }
    try {
      const r = await createVentaExterna(parsed.data, req.user.sub);
      return reply.code(r.duplicada ? 200 : 201).send(r);
    } catch (err) {
      return handleCajaError(err, reply);
    }
  });

  // GET /caja/ventas?turnoId=&periodo=YYYY-MM&q= — historial por turno, por mes
  // o búsqueda por cliente / N° de venta.
  app.get('/ventas', operarCaja, async (req, reply) => {
    const { turnoId, periodo, q } = req.query as { turnoId?: string; periodo?: string; q?: string };
    if (periodo && !/^\d{4}-\d{2}$/.test(periodo)) {
      return reply.code(400).send({ error: 'periodo debe tener formato YYYY-MM' });
    }
    const ventas = await listVentas({ turnoId, periodo, q });
    return { ventas };
  });

  // GET /caja/ventas/resumen?periodo=YYYY-MM — reporte mensual por vendedor (solo admin)
  app.get('/ventas/resumen', adminOnly, async (req, reply) => {
    const { periodo } = req.query as { periodo?: string };
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      return reply.code(400).send({ error: 'periodo debe tener formato YYYY-MM' });
    }
    return resumenVentas(periodo);
  });

  // PATCH /caja/ventas/:id/anular — anulación lógica + reposición de stock (solo admin)
  app.patch('/ventas/:id/anular', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = anularSchema.parse(req.body ?? {});
    try {
      const venta = await anularVenta(id, body.motivo ?? null, req.user.sub);
      return { venta };
    } catch (err) {
      return handleCajaError(err, reply);
    }
  });
}
