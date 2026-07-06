/**
 * Copiloto IA: chat 1:1 usuario↔asistente con function-calling sobre DeepSeek.
 * Sin polling (a diferencia del Chat de equipo): es petición-respuesta directa,
 * la respuesta viene en el mismo request HTTP.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../db.ts';
import { chatCompletion, DeepSeekError } from './deepseek.ts';
import type { ChatMessageIn } from './deepseek.ts';
import { TOOLS, ejecutarTool } from './tools.ts';
import type { ArchivoAdjunto } from './tools.ts';
import { SYSTEM_PROMPT } from './system-prompt.ts';

const HISTORY_LIMIT = 60; // lo que se muestra en el panel al abrir
const CONTEXT_LIMIT = 20; // lo que se manda a DeepSeek como contexto conversacional

/** Guard manual: el JWT no lleva `copilotoHabilitado` (activarlo/desactivarlo no reemite tokens). */
async function requireCopilotoHabilitado(req: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub }, select: { copilotoHabilitado: true } });
  if (!user?.copilotoHabilitado) {
    reply.code(403).send({ error: 'El Copiloto IA no está habilitado para tu usuario.' });
    return false;
  }
  return true;
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export async function copilotoRoutes(app: FastifyInstance) {
  // GET /copiloto/mensajes — historial del usuario autenticado
  app.get('/mensajes', { preHandler: app.authenticate }, async (req, reply) => {
    if (!(await requireCopilotoHabilitado(req, reply))) return;
    const mensajes = await prisma.copilotoMensaje.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'asc' },
      take: HISTORY_LIMIT,
    });
    return { mensajes };
  });

  // POST /copiloto/mensajes — envía un mensaje; acepta JSON {contenido} o multipart (contenido + archivo)
  app.post('/mensajes', { preHandler: app.authenticate }, async (req, reply) => {
    if (!(await requireCopilotoHabilitado(req, reply))) return;

    let contenido = '';
    let archivoAdjunto: ArchivoAdjunto | null = null;

    if (req.isMultipart()) {
      for await (const part of req.parts()) {
        if (part.type === 'file') {
          const buf = await part.toBuffer();
          if (buf.length > 0) {
            archivoAdjunto = { buf, filename: part.filename || 'documento', mime: part.mimetype || 'application/octet-stream' };
          }
        } else if (part.fieldname === 'contenido') {
          contenido = String(part.value ?? '');
        }
      }
    } else {
      const body = (req.body ?? {}) as { contenido?: string };
      contenido = body.contenido ?? '';
    }

    if (!contenido.trim() && !archivoAdjunto) {
      return reply.code(400).send({ error: 'Escribe un mensaje o adjunta un archivo.' });
    }

    const userMsg = await prisma.copilotoMensaje.create({
      data: { userId: req.user.sub, role: 'user', contenido: contenido.trim() || '(archivo adjunto sin texto)' },
    });
    const nuevos = [userMsg];

    // Historial reciente (solo user/assistant — los tool-results de turnos previos
    // ya están resumidos en la respuesta assistant que los siguió).
    const historialDesc = await prisma.copilotoMensaje.findMany({
      where: { userId: req.user.sub, role: { in: ['user', 'assistant'] } },
      orderBy: { createdAt: 'desc' },
      take: CONTEXT_LIMIT,
    });
    const historial = historialDesc.reverse();

    const baseMessages: ChatMessageIn[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historial.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.contenido })),
    ];

    try {
      const first = await chatCompletion(baseMessages, TOOLS);

      if (first.tool_calls && first.tool_calls.length > 0) {
        const toolResultMessages: ChatMessageIn[] = [];

        for (const tc of first.tool_calls) {
          const resultado = await ejecutarTool(tc.function.name, tc.function.arguments, {
            userId: req.user.sub,
            role: req.user.role,
            archivoAdjunto,
          });

          const toolMsg = await prisma.copilotoMensaje.create({
            data: {
              userId: req.user.sub,
              role: 'tool',
              contenido: JSON.stringify(resultado),
              toolName: tc.function.name,
              toolArgs: (safeJsonParse(tc.function.arguments) ?? {}) as never,
              toolResult: resultado as never,
            },
          });
          nuevos.push(toolMsg);
          toolResultMessages.push({ role: 'tool', content: JSON.stringify(resultado), tool_call_id: tc.id });
        }

        const second = await chatCompletion([
          ...baseMessages,
          { role: 'assistant', content: first.content ?? '', tool_calls: first.tool_calls },
          ...toolResultMessages,
        ], TOOLS);

        const assistantMsg = await prisma.copilotoMensaje.create({
          data: { userId: req.user.sub, role: 'assistant', contenido: second.content ?? 'Listo.' },
        });
        nuevos.push(assistantMsg);
      } else {
        const assistantMsg = await prisma.copilotoMensaje.create({
          data: { userId: req.user.sub, role: 'assistant', contenido: first.content ?? '...' },
        });
        nuevos.push(assistantMsg);
      }
    } catch (err) {
      if (err instanceof DeepSeekError) {
        app.log.error({ status: err.status, msg: err.message, userId: req.user.sub }, '[copiloto] error DeepSeek');
        return reply.code(err.status ?? 502).send({ error: err.message, mensajes: nuevos });
      }
      app.log.error({ err, userId: req.user.sub }, '[copiloto] error inesperado');
      return reply.code(500).send({ error: 'Ocurrió un error inesperado en el copiloto.', mensajes: nuevos });
    }

    return reply.code(201).send({ mensajes: nuevos });
  });

  // DELETE /copiloto/mensajes — reinicia la conversación
  app.delete('/mensajes', { preHandler: app.authenticate }, async (req, reply) => {
    if (!(await requireCopilotoHabilitado(req, reply))) return;
    await prisma.copilotoMensaje.deleteMany({ where: { userId: req.user.sub } });
    return { ok: true };
  });
}
