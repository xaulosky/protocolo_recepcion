import type { FastifyInstance } from 'fastify';
import { Role, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../db.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nullableJson = (v: unknown) => (v === null ? Prisma.JsonNull : v) as any;

const faqWriteSchema = z.object({
  id:        z.string().min(1),
  categoria: z.string().min(1),
  pregunta:  z.string().min(1),
  respuesta: z.string().min(1),
  tags:      z.array(z.string()).optional().default([]),
});

const consultationWriteSchema = z.object({
  id:            z.string().min(1),
  nombre:        z.string().min(1),
  descripcion:   z.string().min(1),
  valor:         z.string().min(1),
  categoria:     z.string().nullable().optional(),
  emoji:         z.string().nullable().optional(),
  duracion:      z.string().nullable().optional(),
  reembolsable:  z.boolean().optional().default(false),
  profesionales: z.unknown().nullable().optional(),
});

const treatmentWriteSchema = z.object({
  id:                 z.string().min(1),
  categoria:          z.string().min(1),
  subcategoria:       z.string().nullable().optional(),
  nombre:             z.string().min(1),
  descripcion:        z.string().min(1),
  profesional:        z.string().nullable().optional(),
  especialidad:       z.string().nullable().optional(),
  valorDesde:         z.number().int().nullable().optional(),
  valorHasta:         z.number().int().nullable().optional(),
  duracion:           z.string().nullable().optional(),
  sesiones:           z.string().nullable().optional(),
  protocolo:          z.string().nullable().optional(),
  requiereEvaluacion: z.boolean().optional().default(false),
  indicaciones:       z.array(z.string()).optional().default([]),
  contraindicaciones: z.array(z.string()).optional().default([]),
  preTratamiento:     z.array(z.string()).optional().default([]),
  postTratamiento:    z.array(z.string()).optional().default([]),
  extra:              z.record(z.unknown()).nullable().optional(),
});

const treatmentPatchSchema = treatmentWriteSchema.partial().omit({ id: true });

const professionalWriteSchema = z.object({
  id:             z.string().min(1),
  nombreCompleto: z.string().min(1),
  especialidad:   z.string().min(1),
  rut:            z.string().nullable().optional(),
  telefono:       z.string().nullable().optional(),
  email:          z.string().nullable().optional(),
  disponibilidad: z.record(z.unknown()).nullable().optional(),
  prestaciones:   z.record(z.unknown()).nullable().optional(),
  extra:          z.record(z.unknown()).nullable().optional(),
});

const professionalPatchSchema = professionalWriteSchema.partial().omit({ id: true });

/** Endpoints de solo lectura de la data clínica. Requieren sesión válida. */
export async function dataRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/treatments', async (req) => {
    const { categoria, q } = req.query as { categoria?: string; q?: string };
    const treatments = await prisma.treatment.findMany({
      where: {
        categoria: categoria && categoria !== 'Todas' ? categoria : undefined,
        OR: q
          ? [
              { nombre: { contains: q, mode: 'insensitive' } },
              { descripcion: { contains: q, mode: 'insensitive' } },
              { categoria: { contains: q, mode: 'insensitive' } },
              { subcategoria: { contains: q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { nombre: 'asc' },
    });
    return { treatments };
  });

  app.get('/treatments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: { profesionales: { include: { professional: true } } },
    });
    if (!treatment) return reply.code(404).send({ error: 'Tratamiento no encontrado' });
    return { treatment };
  });

  app.get('/professionals', async (req) => {
    const { q } = req.query as { q?: string };
    const professionals = await prisma.professional.findMany({
      where: q ? { OR: [
        { nombreCompleto: { contains: q, mode: 'insensitive' } },
        { especialidad:   { contains: q, mode: 'insensitive' } },
      ] } : undefined,
      orderBy: { nombreCompleto: 'asc' },
    });
    return { professionals };
  });
  app.get('/products', async () => ({ products: await prisma.product.findMany({ orderBy: [{ brand: 'asc' }, { name: 'asc' }] }) }));
  app.get('/consultations', async () => ({ consultations: await prisma.consultation.findMany({ orderBy: { nombre: 'asc' } }) }));
  app.get('/boxes', async () => ({ boxes: await prisma.box.findMany({ orderBy: { id: 'asc' } }) }));
  app.get('/consents', async () => ({ consents: await prisma.consent.findMany({ orderBy: { treatment: 'asc' } }) }));
  app.get('/faq', async () => ({ faq: await prisma.faqItem.findMany({ orderBy: { categoria: 'asc' } }) }));
  app.get('/protocols', async () => ({ protocols: await prisma.protocol.findMany({ orderBy: { numero: 'asc' } }) }));
  app.get('/scripts', async () => ({ scripts: await prisma.script.findMany({ orderBy: [{ categoria: 'asc' }, { orden: 'asc' }] }) }));
  app.get('/payment-policies', async () => ({ policies: await prisma.paymentPolicy.findMany({ orderBy: { orden: 'asc' } }) }));
  app.get('/internal-protocols', async () => ({ internalProtocols: await prisma.internalProtocol.findMany({ orderBy: { orden: 'asc' } }) }));

  app.get('/stats', async () => {
    const [treatments, professionals, products, consents, consultations, scripts, protocols] = await Promise.all([
      prisma.treatment.count(),
      prisma.professional.count(),
      prisma.product.count(),
      prisma.consent.count(),
      prisma.consultation.count(),
      prisma.script.count(),
      prisma.protocol.count(),
    ]);
    return { stats: { treatments, professionals, products, consents, consultations, scripts, protocols } };
  });

  // ── Endpoints de administración (solo ADMIN) ──────────────────────────────

  // POST /data/treatments — crear tratamiento
  app.post('/treatments', { preHandler: app.authorize([Role.ADMIN]) }, async (req, reply) => {
    const body = treatmentWriteSchema.parse(req.body);
    const { id, extra, ...rest } = body;
    const exists = await prisma.treatment.findUnique({ where: { id } });
    if (exists) return reply.code(409).send({ error: 'Ya existe un tratamiento con ese ID' });
    const treatment = await prisma.treatment.create({ data: { id, ...rest, extra: nullableJson(extra) } });
    return reply.code(201).send({ treatment });
  });

  // PATCH /data/treatments/:id — actualizar tratamiento
  app.patch('/treatments/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    const { extra, ...rest } = treatmentPatchSchema.parse(req.body);
    const treatment = await prisma.treatment.update({ where: { id }, data: { ...rest, ...(extra !== undefined ? { extra: nullableJson(extra) } : {}) } });
    return { treatment };
  });

  // DELETE /data/treatments/:id — eliminar tratamiento
  app.delete('/treatments/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.treatment.delete({ where: { id } });
    return { ok: true };
  });

  // POST /data/professionals — crear profesional
  app.post('/professionals', { preHandler: app.authorize([Role.ADMIN]) }, async (req, reply) => {
    const body = professionalWriteSchema.parse(req.body);
    const { id, disponibilidad, prestaciones, extra, ...rest } = body;
    const exists = await prisma.professional.findUnique({ where: { id } });
    if (exists) return reply.code(409).send({ error: 'Ya existe un profesional con ese ID' });
    const professional = await prisma.professional.create({ data: { id, ...rest, disponibilidad: nullableJson(disponibilidad), prestaciones: nullableJson(prestaciones), extra: nullableJson(extra) } });
    return reply.code(201).send({ professional });
  });

  // PATCH /data/professionals/:id — actualizar profesional
  app.patch('/professionals/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    const { disponibilidad, prestaciones, extra, ...rest } = professionalPatchSchema.parse(req.body);
    const professional = await prisma.professional.update({ where: { id }, data: { ...rest, ...(disponibilidad !== undefined ? { disponibilidad: nullableJson(disponibilidad) } : {}), ...(prestaciones !== undefined ? { prestaciones: nullableJson(prestaciones) } : {}), ...(extra !== undefined ? { extra: nullableJson(extra) } : {}) } });
    return { professional };
  });

  // DELETE /data/professionals/:id — eliminar profesional
  app.delete('/professionals/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.professional.delete({ where: { id } });
    return { ok: true };
  });

  // ── FAQ CRUD ──────────────────────────────────────────────────────────────

  app.post('/faq', { preHandler: app.authorize([Role.ADMIN]) }, async (req, reply) => {
    const body = faqWriteSchema.parse(req.body);
    const { id, ...data } = body;
    const exists = await prisma.faqItem.findUnique({ where: { id } });
    if (exists) return reply.code(409).send({ error: 'Ya existe un FAQ con ese ID' });
    const faqItem = await prisma.faqItem.create({ data: { id, ...data } });
    return reply.code(201).send({ faqItem });
  });

  app.patch('/faq/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    const body = faqWriteSchema.partial().omit({ id: true }).parse(req.body);
    const faqItem = await prisma.faqItem.update({ where: { id }, data: body });
    return { faqItem };
  });

  app.delete('/faq/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.faqItem.delete({ where: { id } });
    return { ok: true };
  });

  // ── Consultas CRUD ────────────────────────────────────────────────────────

  app.post('/consultations', { preHandler: app.authorize([Role.ADMIN]) }, async (req, reply) => {
    const body = consultationWriteSchema.parse(req.body);
    const { id, profesionales, ...rest } = body;
    const exists = await prisma.consultation.findUnique({ where: { id } });
    if (exists) return reply.code(409).send({ error: 'Ya existe una consulta con ese ID' });
    const consultation = await prisma.consultation.create({ data: { id, ...rest, profesionales: nullableJson(profesionales) } });
    return reply.code(201).send({ consultation });
  });

  app.patch('/consultations/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    const { profesionales, ...rest } = consultationWriteSchema.partial().omit({ id: true }).parse(req.body);
    const consultation = await prisma.consultation.update({ where: { id }, data: { ...rest, ...(profesionales !== undefined ? { profesionales: nullableJson(profesionales) } : {}) } });
    return { consultation };
  });

  app.delete('/consultations/:id', { preHandler: app.authorize([Role.ADMIN]) }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.consultation.delete({ where: { id } });
    return { ok: true };
  });
}
