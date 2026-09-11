import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { estadoBoletas, codigoSii } from './boletas.service.ts';
import { datosEmisor } from './emisor.ts';

/**
 * Administración de boletas electrónicas: carga de CAF y seguimiento.
 *
 * La emisión ocurre sola al vender (ver caja.service). Aquí sólo se administra
 * lo que la clínica descarga del SII y se revisa qué quedó pendiente.
 */

const cafSchema = z
  .object({
    tipo:  z.enum(['BOLETA_AFECTA', 'BOLETA_EXENTA']),
    desde: z.number().int().min(1),
    hasta: z.number().int().min(1),
    // El CAF completo tal como lo entrega el SII.
    xml:   z.string().min(50),
    vencimiento: z.string().datetime().optional().nullable(),
    notas: z.string().max(300).optional().nullable(),
  })
  .refine((d) => d.hasta >= d.desde, {
    message: 'El folio "hasta" no puede ser menor que "desde"',
    path: ['hasta'],
  });

export async function boletasRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: app.authorize([Role.ADMIN]) };

  /**
   * GET /boletas/consulta — consulta pública de una boleta emitida.
   *
   * Sin sesión, a propósito: el SII obliga a publicar las boletas en un sitio
   * web donde el cliente pueda verlas durante los tres meses siguientes a la
   * emisión, y esa URL va impresa bajo el timbre (ver
   * docs/sii/certificacion-boletas.md). Es requisito para que autoricen.
   *
   * Pide folio Y monto total: los dos están en el papel, pero juntos evitan
   * que alguien recorra los folios uno por uno. No se devuelve nada del
   * cliente ni de la venta interna, sólo el documento tributario.
   */
  app.get('/consulta', async (req, reply) => {
    const q = req.query as { folio?: string; total?: string; tipo?: string };
    const folio = Number(q.folio);
    const total = Number(q.total);
    if (!Number.isInteger(folio) || folio < 1 || !Number.isFinite(total)) {
      return reply.code(400).send({ error: 'Indica el folio y el monto total de la boleta' });
    }

    const tipo = q.tipo === '39' ? 'BOLETA_AFECTA' : 'BOLETA_EXENTA';
    const doc = await prisma.documentoTributario.findUnique({
      where: { tipo_folio: { tipo, folio } },
      select: {
        tipo: true, folio: true, fechaEmision: true, estado: true,
        neto: true, iva: true, exento: true, total: true,
        venta: { select: { items: { select: { nombre: true, cantidad: true, precioUnitario: true } } } },
      },
    });

    // Mismo error para "no existe" y "el monto no cuadra": distinguirlos
    // permitiría averiguar qué folios existen.
    if (!doc || doc.total !== Math.round(total)) {
      return reply.code(404).send({ error: 'No encontramos una boleta con ese folio y monto' });
    }

    const emisor = datosEmisor();
    return {
      boleta: {
        tipo: doc.tipo,
        codigoSii: codigoSii(doc.tipo),
        folio: doc.folio,
        fechaEmision: doc.fechaEmision,
        estado: doc.estado,
        neto: doc.neto,
        iva: doc.iva,
        exento: doc.exento,
        total: doc.total,
        items: doc.venta.items,
        emisor: {
          rut: emisor.rut,
          razonSocial: emisor.razonSocial,
          giro: emisor.giro,
          direccion: `${emisor.dirOrigen}, ${emisor.cmnaOrigen}`,
        },
      },
    };
  });

  // GET /boletas/estado — folios disponibles y documentos por resolver
  app.get('/estado', { preHandler: app.authenticate }, async () => estadoBoletas());

  // GET /boletas — documentos emitidos, para revisión y reintentos
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { estado, limite } = req.query as { estado?: string; limite?: string };
    const documentos = await prisma.documentoTributario.findMany({
      where: estado ? { estado: estado as never } : {},
      include: { venta: { select: { id: true, numero: true, cliente: true, total: true } } },
      orderBy: { fechaEmision: 'desc' },
      take: Math.min(Math.max(Number(limite) || 100, 1), 500),
    });
    return {
      documentos: documentos.map((d) => ({ ...d, codigoSii: codigoSii(d.tipo) })),
    };
  });

  // POST /boletas/caf — cargar un rango de folios descargado del SII
  app.post('/caf', adminOnly, async (req, reply) => {
    const parsed = cafSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    }
    const { tipo, desde, hasta, xml, vencimiento, notas } = parsed.data;

    // Un rango solapado provocaría folios repetidos: se rechaza antes de grabar.
    const solapado = await prisma.caf.findFirst({
      where: { tipo, activo: true, desde: { lte: hasta }, hasta: { gte: desde } },
      select: { id: true, desde: true, hasta: true },
    });
    if (solapado) {
      return reply.code(409).send({
        error: `El rango se solapa con un CAF ya cargado (${solapado.desde}-${solapado.hasta})`,
      });
    }

    const caf = await prisma.caf.create({
      data: {
        tipo,
        desde,
        hasta,
        siguiente: desde,
        xml,
        vencimiento: vencimiento ? new Date(vencimiento) : null,
        notas: notas || null,
        cargadoPorId: req.user.sub,
      },
      select: {
        id: true, tipo: true, desde: true, hasta: true, siguiente: true,
        activo: true, vencimiento: true, createdAt: true,
      },
    });

    return reply.code(201).send({ caf });
  });

  // GET /boletas/caf — rangos cargados y cuánto queda de cada uno
  app.get('/caf', adminOnly, async () => {
    const cafs = await prisma.caf.findMany({
      select: {
        id: true, tipo: true, desde: true, hasta: true, siguiente: true,
        activo: true, vencimiento: true, notas: true, createdAt: true,
        cargadoPor: { select: { id: true, nombre: true } },
      },
      orderBy: [{ tipo: 'asc' }, { desde: 'asc' }],
    });
    return {
      cafs: cafs.map((c) => ({ ...c, disponibles: Math.max(0, c.hasta - c.siguiente + 1) })),
    };
  });

  // PATCH /boletas/caf/:id — activar o desactivar un rango
  app.patch('/caf/:id', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    const activo = (req.body as { activo?: boolean })?.activo;
    if (typeof activo !== 'boolean') return reply.code(400).send({ error: 'Indica "activo"' });

    const existe = await prisma.caf.findUnique({ where: { id }, select: { id: true } });
    if (!existe) return reply.code(404).send({ error: 'CAF no encontrado' });

    const caf = await prisma.caf.update({ where: { id }, data: { activo } });
    return { caf };
  });
}
