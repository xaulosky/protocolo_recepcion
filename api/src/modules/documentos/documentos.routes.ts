/**
 * Documentos personales de usuarios (contratos, anexos, liquidaciones, certificados).
 * Los archivos viven en disco bajo `api/uploads/documentos/<userId>/` y se sirven
 * siempre a través del API (con auth): nginx no expone la carpeta.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';

const TIPOS = ['CONTRATO', 'ANEXO', 'LIQUIDACION', 'CERTIFICADO', 'OTRO'] as const;

// Raíz de uploads relativa al cwd del proceso (en el VPS: /var/www/cialo-hub/api/uploads).
const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

const include = {
  subidoPor: { select: { id: true, nombre: true } },
} as const;

const metaSchema = z.object({
  userId: z.string().min(1),
  tipo: z.enum(TIPOS),
  titulo: z.string().min(1),
  periodo: z.string().optional(),
  notas: z.string().optional(),
});

/** Limpia el nombre original para usarlo en disco sin caracteres problemáticos. */
function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9à-ÿÀ-ß._\- ]/g, '_').slice(-120) || 'documento';
}

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

  // POST /documentos — subir un documento para un usuario (solo admin, multipart)
  app.post('/', adminOnly, async (req, reply) => {
    if (!req.isMultipart()) return reply.code(400).send({ error: 'Se espera multipart/form-data' });

    const fields: Record<string, string> = {};
    let fileBuf: Buffer | null = null;
    let filename = '';
    let mime = 'application/octet-stream';

    for await (const part of req.parts()) {
      if (part.type === 'file') {
        filename = part.filename || 'documento';
        mime = part.mimetype || mime;
        fileBuf = await part.toBuffer();
      } else {
        fields[part.fieldname] = String(part.value ?? '');
      }
    }

    if (!fileBuf || fileBuf.length === 0) return reply.code(400).send({ error: 'Falta el archivo' });

    const parsed = metaSchema.safeParse(fields);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, nombre: true } });
    if (!target) return reply.code(404).send({ error: 'Usuario no encontrado' });

    // Ruta relativa siempre con "/" (portable entre SO y lo que se guarda en BD).
    const rel = ['documentos', target.id, `${randomUUID()}-${sanitize(filename)}`].join('/');
    const abs = path.join(UPLOADS_ROOT, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, fileBuf);

    const documento = await prisma.userDocument.create({
      data: {
        userId: target.id,
        tipo: parsed.data.tipo,
        titulo: parsed.data.titulo,
        filename,
        path: rel,
        mime,
        size: fileBuf.length,
        periodo: parsed.data.periodo || null,
        notas: parsed.data.notas || null,
        subidoPorId: req.user.sub,
      },
      include,
    });

    // Avisar al dueño del documento (no bloquea la respuesta si falla).
    notify({
      userId: target.id,
      title: 'Nuevo documento disponible',
      body: `Se agregó "${parsed.data.titulo}" a tu sección Mis Documentos.`,
      data: { kind: 'documento', documentoId: documento.id },
    }).catch(() => {});

    return reply.code(201).send({ documento });
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
