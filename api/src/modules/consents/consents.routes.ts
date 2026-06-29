import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { sendMail } from '../../lib/notify.ts';
import { consentimientoEmail } from '../../lib/emails.ts';

/** Genera el token secreto del enlace público (urlsafe, ~32 chars). */
function nuevoToken() {
  return randomBytes(24).toString('base64url');
}

/** Arma el enlace público de firma a partir del token. */
function enlaceFirma(token: string) {
  return `${env.APP_URL.replace(/\/$/, '')}/firma/${token}`;
}

/** 60 días desde ahora — vencimiento por defecto de nuevos enlaces. */
function defaultExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d;
}

const crearSchema = z.object({
  consentId:     z.string().min(1),
  paciente:      z.string().min(1),
  rut:           z.string().min(1),
  profesional:   z.string().min(1),
  procedimiento: z.string().min(1),
  fecha:         z.string().min(1),
  telefono:      z.string().optional().nullable(),
  email:         z.string().email().optional().or(z.literal('')).nullable(),
});

const editarSchema = z.object({
  email:    z.string().email().optional().or(z.literal('')).nullable(),
  telefono: z.string().optional().nullable(),
  fecha:    z.string().optional().nullable(),
});

// Campos visibles en el listado de recepción (sin el snapshot ni la imagen de firma).
const seleccionListado = {
  id: true, token: true, titulo: true, tratamiento: true,
  paciente: true, rut: true, profesional: true, procedimiento: true,
  telefono: true, email: true, fecha: true, estado: true,
  firmadoAt: true, createdAt: true,
  emailEnviadoAt: true, firmaManual: true, expiresAt: true,
  creadoPor: { select: { id: true, nombre: true } },
} as const;

/** Rutas autenticadas: recepción crea, lista y administra los envíos a firma. */
export async function consentsRoutes(app: FastifyInstance) {
  const canWrite = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };

  // GET /consentimientos — listado con filtros (estado, q por paciente)
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { estado, q } = req.query as { estado?: string; q?: string };
    const firmas = await prisma.signedConsent.findMany({
      where: {
        ...(estado ? { estado: estado as never } : {}),
        ...(q ? { paciente: { contains: q, mode: 'insensitive' as const } } : {}),
      },
      select: seleccionListado,
      orderBy: { createdAt: 'desc' },
    });
    return { firmas };
  });

  // POST /consentimientos — crear envío de firma (snapshot de la plantilla + token)
  app.post('/', canWrite, async (req, reply) => {
    const parsed = crearSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const plantilla = await prisma.consent.findUnique({ where: { id: parsed.data.consentId } });
    if (!plantilla) return reply.code(404).send({ error: 'Consentimiento no encontrado' });

    const firma = await prisma.signedConsent.create({
      data: {
        token:       nuevoToken(),
        consentId:   plantilla.id,
        titulo:      plantilla.title,
        tratamiento: plantilla.treatment,
        snapshot: {
          introduction:       plantilla.introduction,
          beneficios:         plantilla.beneficios,
          efectosSecundarios: plantilla.efectosSecundarios,
          contraindicaciones: plantilla.contraindicaciones,
          cuidados:           plantilla.cuidados,
        },
        paciente:      parsed.data.paciente,
        rut:           parsed.data.rut,
        profesional:   parsed.data.profesional,
        procedimiento: parsed.data.procedimiento,
        fecha:         parsed.data.fecha,
        telefono:      parsed.data.telefono || null,
        email:         parsed.data.email || null,
        expiresAt:     defaultExpiry(),
        creadoPorId:   req.user.sub,
      },
      select: seleccionListado,
    });

    return reply.code(201).send({ firma, enlace: enlaceFirma(firma.token) });
  });

  // GET /consentimientos/:id — detalle completo (incluye snapshot y firma) para imprimir/ver
  app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const firma = await prisma.signedConsent.findUnique({
      where: { id },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    return { firma, enlace: enlaceFirma(firma.token) };
  });

  // PATCH /consentimientos/:id — editar email, teléfono o fecha (solo si PENDIENTE)
  app.patch('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = editarSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const firma = await prisma.signedConsent.findUnique({ where: { id }, select: { estado: true } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    if (firma.estado !== 'PENDIENTE') return reply.code(409).send({ error: 'Solo se pueden editar consentimientos pendientes' });

    const data: Record<string, unknown> = {};
    if (parsed.data.email    !== undefined) data.email    = parsed.data.email    || null;
    if (parsed.data.telefono !== undefined) data.telefono = parsed.data.telefono || null;
    if (parsed.data.fecha    !== undefined && parsed.data.fecha) data.fecha = parsed.data.fecha;

    const actualizado = await prisma.signedConsent.update({ where: { id }, data, select: seleccionListado });
    return { firma: actualizado };
  });

  // POST /consentimientos/:id/email — enviar (o reenviar) el enlace por correo
  app.post('/:id/email', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const firma = await prisma.signedConsent.findUnique({ where: { id } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });

    const destino = (req.body as { email?: string })?.email || firma.email;
    if (!destino) return reply.code(400).send({ error: 'Falta el correo del paciente' });

    const enlace = enlaceFirma(firma.token);
    const tpl = consentimientoEmail({
      paciente:    firma.paciente,
      tratamiento: firma.tratamiento,
      profesional: firma.profesional,
      fecha:       firma.fecha,
      enlace,
    });
    const sent = await sendMail({ to: destino, ...tpl });

    await prisma.signedConsent.update({
      where: { id },
      data: {
        emailEnviadoAt: new Date(),
        ...(destino !== firma.email ? { email: destino } : {}),
      },
    });

    return { sent };
  });

  // POST /consentimientos/:id/firmar-manual — marcar como firmado en papel (presencial)
  app.post('/:id/firmar-manual', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const firma = await prisma.signedConsent.findUnique({ where: { id }, select: { estado: true } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    if (firma.estado === 'ANULADO') return reply.code(409).send({ error: 'El consentimiento está anulado' });
    if (firma.estado === 'FIRMADO') return reply.code(409).send({ error: 'Ya está firmado' });

    const actualizado = await prisma.signedConsent.update({
      where: { id },
      data: { estado: 'FIRMADO', firmaManual: true, firmadoAt: new Date() },
      select: seleccionListado,
    });
    return { firma: actualizado };
  });

  // DELETE /consentimientos/:id — anular (soft: conserva el registro legal)
  app.delete('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.signedConsent.update({ where: { id }, data: { estado: 'ANULADO' } });
    return reply.code(204).send();
  });
}
