/**
 * Lógica de negocio de guardado de documentos personales (disco + registro),
 * compartida entre la ruta REST humana (POST /documentos) y el dispatcher de
 * tools del Copiloto IA. La notificación al dueño queda a cargo de cada llamador
 * (la ruta humana agrupa varios archivos en un solo aviso; el copiloto guarda uno).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../db.ts';

export const TIPOS = ['CONTRATO', 'ANEXO', 'LIQUIDACION', 'CERTIFICADO', 'OTRO'] as const;

// Raíz de uploads relativa al cwd del proceso (en el VPS: /var/www/cialo-hub/api/uploads).
export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

export const documentoInclude = {
  subidoPor: { select: { id: true, nombre: true } },
} as const;

/** Limpia el nombre original para usarlo en disco sin caracteres problemáticos. */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9à-ÿÀ-ß._\- ]/g, '_').slice(-120) || 'documento';
}

export interface SaveUserDocumentInput {
  userId: string;
  tipo: string;
  titulo: string;
  periodo?: string | null;
  notas?: string | null;
  file: { buf: Buffer; filename: string; mime: string };
  subidoPorId: string;
}

export async function saveUserDocument(input: SaveUserDocumentInput) {
  const rel = ['documentos', input.userId, `${randomUUID()}-${sanitizeFilename(input.file.filename)}`].join('/');
  const abs = path.join(UPLOADS_ROOT, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, input.file.buf);

  return prisma.userDocument.create({
    data: {
      userId: input.userId,
      tipo: input.tipo,
      titulo: input.titulo,
      filename: input.file.filename,
      path: rel,
      mime: input.file.mime,
      size: input.file.buf.length,
      periodo: input.periodo || null,
      notas: input.notas || null,
      subidoPorId: input.subidoPorId,
    },
    include: documentoInclude,
  });
}
