/**
 * Documentos personales de usuarios (contratos, anexos, liquidaciones, certificados).
 * Los archivos viven en disco bajo `api/uploads/documentos/<userId>/` y se sirven
 * siempre a través del API (con auth): nginx no expone la carpeta.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createReadStream } from 'node:fs';
import { unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';
import { TIPOS, UPLOADS_ROOT, documentoInclude as include, saveUserDocument } from './documentos.service.ts';

const metaSchema = z.object({
  userId: z.string().min(1),
  tipo: z.enum(TIPOS),
  titulo: z.string().min(1),
  periodo: z.string().optional(),
  notas: z.string().optional(),
});

export async function documentosRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: app.authorize([Role.ADMIN]) };

  // GET /documentos — mis documentos; el admin puede ver los de otro usuario con ?userId=
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { userId } = req.query as { userId?: string };
    const targetId = userId && req.user.role === 'ADMIN' ? userId : req.user.sub;
    const documentos = await prisma.userDocument.findMany({
      where: { userId: targetId },
      include,
      orderBy: { createdAt: 'desc' },
    });
    return { documentos };
  });

  // POST /documentos — subir uno o varios documentos para un usuario (solo admin, multipart)
  app.post('/', adminOnly, async (req, reply) => {
    if (!req.isMultipart()) return reply.code(400).send({ error: 'Se espera multipart/form-data' });

    const fields: Record<string, string> = {};
    const files: { buf: Buffer; filename: string; mime: string }[] = [];

    for await (const part of req.parts()) {
      if (part.type === 'file') {
        const buf = await part.toBuffer();
        if (buf.length > 0) {
          files.push({ buf, filename: part.filename || 'documento', mime: part.mimetype || 'application/octet-stream' });
        }
      } else {
        fields[part.fieldname] = String(part.value ?? '');
      }
    }

    if (files.length === 0) return reply.code(400).send({ error: 'Falta el archivo' });

    const parsed = metaSchema.safeParse(fields);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, nombre: true } });
    if (!target) return reply.code(404).send({ error: 'Usuario no encontrado' });

    const documentos = [];
    for (const f of files) {
      // Con varios archivos, cada documento lleva el título base + su nombre de archivo.
      const sinExt = f.filename.replace(/\.[^.]+$/, '');
      const titulo = files.length === 1 ? parsed.data.titulo : `${parsed.data.titulo} — ${sinExt}`;

      documentos.push(await saveUserDocument({
        userId: target.id,
        tipo: parsed.data.tipo,
        titulo,
        periodo: parsed.data.periodo,
        notas: parsed.data.notas,
        file: f,
        subidoPorId: req.user.sub,
      }));
    }

    // Un solo aviso al dueño, sin importar cuántos archivos (no bloquea la respuesta).
    notify({
      userId: target.id,
      title: documentos.length === 1 ? 'Nuevo documento disponible' : 'Nuevos documentos disponibles',
      body: documentos.length === 1
        ? `Se agregó "${documentos[0].titulo}" a tu sección Mis Documentos.`
        : `Se agregaron ${documentos.length} documentos a tu sección Mis Documentos.`,
      data: { kind: 'documento', documentoIds: documentos.map((d) => d.id) },
    }).catch(() => {});

    return reply.code(201).send({ documentos });
  });

  // GET /documentos/:id/archivo — descarga (dueño o admin)
  app.get('/:id/archivo', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const doc = await prisma.userDocument.findUnique({ where: { id } });
    if (!doc) return reply.code(404).send({ error: 'No encontrado' });
    if (doc.userId !== req.user.sub && req.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Sin permiso' });
    }

    const abs = path.join(UPLOADS_ROOT, doc.path);
    try {
      await stat(abs);
    } catch {
      return reply.code(410).send({ error: 'El archivo ya no está disponible en el servidor' });
    }

    // Acuse de recibo: primera descarga/vista por el dueño.
    if (doc.userId === req.user.sub && !doc.vistoAt) {
      await prisma.userDocument.update({ where: { id: doc.id }, data: { vistoAt: new Date() } }).catch(() => {});
    }

    reply.header('Content-Type', doc.mime);
    reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(doc.filename)}`);
    return reply.send(createReadStream(abs));
  });

  // DELETE /documentos/:id — solo admin
  app.delete('/:id', adminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    const doc = await prisma.userDocument.findUnique({ where: { id } });
    if (!doc) return reply.code(404).send({ error: 'No encontrado' });
    await prisma.userDocument.delete({ where: { id } });
    await unlink(path.join(UPLOADS_ROOT, doc.path)).catch(() => {});
    return { ok: true };
  });
}
