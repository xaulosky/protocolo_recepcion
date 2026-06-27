import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { env } from '../../env.ts';
import { sendMail } from '../../lib/notify.ts';

/** Genera el token secreto del enlace público (urlsafe, ~32 chars). */
function nuevoToken() {
  return randomBytes(24).toString('base64url');
}

/** Arma el enlace público de firma a partir del token. */
function enlaceFirma(token: string) {
  return `${env.APP_URL.replace(/\/$/, '')}/firma/${token}`;
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

// Campos visibles en el listado de recepción (sin el snapshot ni la imagen de firma).
const seleccionListado = {
  id: true, token: true, titulo: true, tratamiento: true,
  paciente: true, rut: true, profesional: true, procedimiento: true,
  telefono: true, email: true, fecha: true, estado: true,
  firmadoAt: true, createdAt: true,
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
        creadoPorId:   req.user.sub,
      },
      select: seleccionListado,
    });

    return reply.code(201).send({ firma, enlace: enlaceFirma(firma.token) });
  });

  // GET /consentimientos/:id — detalle completo (incluye snapshot y firma) para imprimir
  app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const firma = await prisma.signedConsent.findUnique({
      where: { id },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });
    return { firma, enlace: enlaceFirma(firma.token) };
  });

  // POST /consentimientos/:id/email — enviar (o reenviar) el enlace por correo
  app.post('/:id/email', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const firma = await prisma.signedConsent.findUnique({ where: { id } });
    if (!firma) return reply.code(404).send({ error: 'No encontrado' });

    const destino = (req.body as { email?: string })?.email || firma.email;
    if (!destino) return reply.code(400).send({ error: 'Falta el correo del paciente' });

    const enlace = enlaceFirma(firma.token);
    const sent = await sendMail({
      to: destino,
      subject: `Consentimiento informado — ${firma.tratamiento}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1A1918">
          <h2 style="color:#7C6247">Clínica Cialo</h2>
          <p>Hola ${firma.paciente},</p>
          <p>Tienes un consentimiento informado para <strong>${firma.tratamiento}</strong> pendiente de revisar y firmar.</p>
          <p style="margin:24px 0">
            <a href="${enlace}" style="background:#7C6247;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">
              Revisar y firmar
            </a>
          </p>
          <p style="font-size:13px;color:#888">O copia este enlace en tu navegador:<br>${enlace}</p>
        </div>`,
      text: `Hola ${firma.paciente}, revisa y firma tu consentimiento para ${firma.tratamiento}: ${enlace}`,
    });

    // Guarda el correo usado para futuros reenvíos.
    if (destino !== firma.email) await prisma.signedConsent.update({ where: { id }, data: { email: destino } });

    return { sent };
  });

  // DELETE /consentimientos/:id — anular (soft: conserva el registro legal)
  app.delete('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.signedConsent.update({ where: { id }, data: { estado: 'ANULADO' } });
    return reply.code(204).send();
  });
}
