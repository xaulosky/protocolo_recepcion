import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { health, iso, reservoHabilitado, ReservoError } from '../../lib/reservo.ts';
import {
  sincronizarAgenda,
  citasSinConsentimiento,
  aplicarProtocolo,
} from './citas.service.ts';

/**
 * Módulo Citas — espejo de la agenda de Reservo y protocolo de consentimientos.
 *
 * Lectura: cualquier usuario autenticado (recepción necesita ver la agenda).
 * Escritura (sincronizar, reglas, aplicar protocolo): ADMIN y RECEPCION.
 */

const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Se espera YYYY-MM-DD');

const syncSchema = z.object({
  desde: fecha.optional(),
  hasta: fecha.optional(),
});

const reglaSchema = z.object({
  patron:           z.string().min(2).max(120),
  consentId:        z.string().min(1),
  activo:           z.boolean().optional(),
  diasAnticipacion: z.number().int().min(0).max(90).optional(),
  autoEnviar:       z.boolean().optional(),
});

export async function citasRoutes(app: FastifyInstance) {
  const canWrite = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };

  // GET /citas/estado — ¿está configurada y viva la integración?
  app.get('/estado', { preHandler: app.authenticate }, async () => {
    const configurada = reservoHabilitado();
    const [ultima, total] = await Promise.all([
      prisma.cita.findFirst({ orderBy: { sincronizadoAt: 'desc' }, select: { sincronizadoAt: true } }),
      prisma.cita.count({ where: { vigente: true } }),
    ]);
    return {
      configurada,
      viva: configurada ? await health() : false,
      ultimaSincronizacion: ultima?.sincronizadoAt ?? null,
      citasVigentes: total,
    };
  });

  // GET /citas?desde=&hasta=&profesional=&q= — agenda ya sincronizada
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { desde, hasta, profesional, q, incluirArchivadas } = req.query as {
      desde?: string; hasta?: string; profesional?: string; q?: string; incluirArchivadas?: string;
    };

    const hoy = iso(new Date());
    const ini = new Date(`${desde || hoy}T00:00:00`);
    const fin = new Date(`${hasta || desde || hoy}T00:00:00`);

    const citas = await prisma.cita.findMany({
      where: {
        fecha: { gte: ini, lte: fin },
        ...(incluirArchivadas === 'true' ? {} : { vigente: true }),
        ...(profesional ? { profesional: { contains: profesional, mode: 'insensitive' as const } } : {}),
        ...(q ? { paciente: { contains: q, mode: 'insensitive' as const } } : {}),
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });

    return { citas, total: citas.length };
  });

  // POST /citas/sincronizar — trae la agenda desde Reservo (por defecto: hoy + 14 días)
  app.post('/sincronizar', canWrite, async (req, reply) => {
    const parsed = syncSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: 'Rango inválido' });

    const hoy = new Date();
    const fin = new Date(hoy);
    fin.setDate(fin.getDate() + 14);

    const desde = parsed.data.desde ?? iso(hoy);
    const hasta = parsed.data.hasta ?? iso(fin);

    try {
      const resultado = await sincronizarAgenda(desde, hasta);
      return { resultado };
    } catch (e) {
      if (e instanceof ReservoError) {
        // 502: el problema está en Reservo, no en esta API.
        return reply.code(502).send({ error: e.message });
      }
      throw e;
    }
  });

  // GET /citas/sin-consentimiento?dias= — citas próximas a las que les falta el documento
  app.get('/sin-consentimiento', { preHandler: app.authenticate }, async (req) => {
    const { dias } = req.query as { dias?: string };
    const n = Math.min(Math.max(Number(dias) || 14, 1), 90);
    const pendientes = await citasSinConsentimiento(n);
    return { pendientes, total: pendientes.length };
  });

  // POST /citas/aplicar-protocolo — crea los consentimientos que faltan
  app.post('/aplicar-protocolo', canWrite, async (req) => {
    const { dias, enviarCorreos } = (req.body ?? {}) as { dias?: number; enviarCorreos?: boolean };
    const resultado = await aplicarProtocolo({
      diasAdelante: Math.min(Math.max(Number(dias) || 14, 1), 90),
      // El envío automático de correo exige pedirlo explícitamente.
      enviarCorreos: enviarCorreos === true,
      usuarioId: req.user.sub,
    });
    return { resultado };
  });

  // ── Reglas: qué servicio de la agenda exige qué consentimiento ──

  // GET /citas/reglas
  app.get('/reglas', { preHandler: app.authenticate }, async () => {
    const reglas = await prisma.reglaConsentimiento.findMany({
      include: { consent: { select: { id: true, title: true, treatment: true } } },
      orderBy: { patron: 'asc' },
    });
    return { reglas };
  });

  // POST /citas/reglas
  app.post('/reglas', canWrite, async (req, reply) => {
    const parsed = reglaSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    }

    const plantilla = await prisma.consent.findUnique({ where: { id: parsed.data.consentId } });
    if (!plantilla) return reply.code(404).send({ error: 'Consentimiento no encontrado' });

    const existe = await prisma.reglaConsentimiento.findUnique({
      where: { patron_consentId: { patron: parsed.data.patron, consentId: parsed.data.consentId } },
    });
    if (existe) return reply.code(409).send({ error: 'Esa regla ya existe' });

    const regla = await prisma.reglaConsentimiento.create({
      data: { ...parsed.data, creadoPorId: req.user.sub },
      include: { consent: { select: { id: true, title: true, treatment: true } } },
    });
    return reply.code(201).send({ regla });
  });

  // PATCH /citas/reglas/:id
  app.patch('/reglas/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = reglaSchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const existe = await prisma.reglaConsentimiento.findUnique({ where: { id } });
    if (!existe) return reply.code(404).send({ error: 'Regla no encontrada' });

    const regla = await prisma.reglaConsentimiento.update({
      where: { id },
      data: parsed.data,
      include: { consent: { select: { id: true, title: true, treatment: true } } },
    });
    return { regla };
  });

  // DELETE /citas/reglas/:id
  app.delete('/reglas/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const existe = await prisma.reglaConsentimiento.findUnique({ where: { id } });
    if (!existe) return reply.code(404).send({ error: 'Regla no encontrada' });

    await prisma.reglaConsentimiento.delete({ where: { id } });
    return reply.code(204).send();
  });
}
