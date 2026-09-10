import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { sendMail } from '../../lib/notify.ts';
import { consentimientoEmail } from '../../lib/emails.ts';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { UPLOADS_ROOT, sanitizeFilename } from '../documentos/documentos.service.ts';

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

const RELACIONES = ['TITULAR', 'MADRE', 'PADRE', 'TUTOR', 'APODERADO', 'OTRO'] as const;

const firmaManualSchema = z
  .object({
    // Dónde queda archivado el papel: sin esto el registro no es verificable.
    observacion:      z.string().min(5).max(500),
    firmanteRelacion: z.enum(RELACIONES).default('TITULAR'),
    firmanteNombre:   z.string().min(2).max(120).optional(),
    firmanteRut:      z.string().min(7).max(20).optional(),
  })
  .refine((d) => d.firmanteRelacion === 'TITULAR' || Boolean(d.firmanteRut), {
    message: 'Falta el RUT del representante legal',
    path: ['firmanteRut'],
  });

const anularSchema = z.object({
  motivo: z.string().min(5).max(500),
});

// Campos visibles en el listado de recepción (sin el snapshot ni la imagen de firma).
const seleccionListado = {
  id: true, token: true, titulo: true, tratamiento: true,
  paciente: true, rut: true, profesional: true, procedimiento: true,
  telefono: true, email: true, fecha: true, estado: true,
  firmadoAt: true, createdAt: true,
  emailEnviadoAt: true, firmaManual: true, expiresAt: true,
  firmanteRelacion: true, firmanteRut: true, firmanteNombre: true,
  firmaManualObs: true, respaldoPath: true,
  anuladoAt: true, motivoAnulacion: true,
  creadoPor:      { select: { id: true, nombre: true } },
  firmaManualPor: { select: { id: true, nombre: true } },
  anuladoPor:     { select: { id: true, nombre: true } },
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

  // POST /consentimientos/:id/firmar-manual — marcar como firmado en papel.
  //
  // Un consentimiento en papel sin responsable ni ubicación del documento es una
  // afirmación que nadie puede sostener ante una fiscalización: exigimos indicar
  // dónde queda archivado y registramos qué usuario lo declara.
  app.post('/:id/firmar-manual', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = firmaManualSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Indique dónde queda archivado el documento en papel (mínimo 5 caracteres)',
        detalles: parsed.error.flatten(),
      });
    }

    const firma = await prisma.signedConsent.findUnique({ where: { id }, select: { estado: true } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    if (firma.estado === 'ANULADO') return reply.code(409).send({ error: 'El consentimiento está anulado' });
    if (firma.estado === 'FIRMADO') return reply.code(409).send({ error: 'Ya está firmado' });

    const actualizado = await prisma.signedConsent.update({
      where: { id },
      data: {
        estado:           'FIRMADO',
        firmaManual:      true,
        firmadoAt:        new Date(),
        firmaManualPorId: req.user.sub,
        firmaManualObs:   parsed.data.observacion.trim(),
        firmanteRelacion: parsed.data.firmanteRelacion,
        firmanteNombre:   parsed.data.firmanteNombre ?? null,
        firmanteRut:      parsed.data.firmanteRut ?? null,
      },
      select: seleccionListado,
    });
    return { firma: actualizado };
  });

  // POST /consentimientos/:id/respaldo — adjuntar el escaneo del papel firmado
  app.post('/:id/respaldo', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!req.isMultipart()) return reply.code(400).send({ error: 'Se espera multipart/form-data' });

    const firma = await prisma.signedConsent.findUnique({ where: { id }, select: { id: true } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });

    const parte = await req.file();
    if (!parte) return reply.code(400).send({ error: 'Falta el archivo' });

    const permitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!permitidos.includes(parte.mimetype)) {
      return reply.code(415).send({ error: 'Formato no admitido (use PDF, JPG, PNG o WEBP)' });
    }

    const buf = await parte.toBuffer();
    const rel = ['consentimientos', id, `${randomUUID()}-${sanitizeFilename(parte.filename)}`].join('/');
    const abs = path.join(UPLOADS_ROOT, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, buf);

    const actualizado = await prisma.signedConsent.update({
      where: { id },
      data: { respaldoPath: rel, respaldoMime: parte.mimetype, respaldoSize: buf.length },
      select: seleccionListado,
    });
    return { firma: actualizado };
  });

  // GET /consentimientos/:id/respaldo — descargar el escaneo (sólo autenticados)
  app.get('/:id/respaldo', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const firma = await prisma.signedConsent.findUnique({
      where: { id },
      select: { respaldoPath: true, respaldoMime: true },
    });
    if (!firma?.respaldoPath) return reply.code(404).send({ error: 'Sin respaldo adjunto' });

    const abs = path.join(UPLOADS_ROOT, firma.respaldoPath);
    const buf = await readFile(abs).catch(() => null);
    if (!buf) return reply.code(404).send({ error: 'El archivo no está disponible' });

    return reply.type(firma.respaldoMime ?? 'application/octet-stream').send(buf);
  });

  // DELETE /consentimientos/:id — anular (soft: conserva el registro legal).
  //
  // Exige motivo y deja constancia de quién y cuándo. Anular uno ya FIRMADO
  // invalida una firma válida, así que queda reservado a ADMIN.
  app.delete('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = anularSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Indique el motivo de la anulación (mínimo 5 caracteres)' });
    }

    const firma = await prisma.signedConsent.findUnique({ where: { id }, select: { estado: true } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    if (firma.estado === 'ANULADO') return reply.code(409).send({ error: 'Ya está anulado' });
    if (firma.estado === 'FIRMADO' && req.user.role !== Role.ADMIN) {
      return reply.code(403).send({
        error: 'Sólo un administrador puede anular un consentimiento ya firmado',
      });
    }

    await prisma.signedConsent.update({
      where: { id },
      data: {
        estado:          'ANULADO',
        anuladoPorId:    req.user.sub,
        anuladoAt:       new Date(),
        motivoAnulacion: parsed.data.motivo.trim(),
      },
    });
    return reply.code(204).send();
  });
}
