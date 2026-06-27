import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import { sendPush } from '../../lib/notify.ts';

const memberSelect = { id: true, nombre: true, role: true } as const;

const sendSchema = z.object({ contenido: z.string().trim().min(1).max(4000) });
const dmSchema = z.object({ userId: z.string().min(1) });
const groupSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  memberIds: z.array(z.string()).min(1),
});
const channelSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  roles: z.array(z.nativeEnum(Role)).min(1),
});

/** Clave canónica de un DM: ids ordenados → garantiza una sola conversación por par. */
function dmKeyFor(a: string, b: string) {
  return [a, b].sort().join(':');
}

export async function chatRoutes(app: FastifyInstance) {
  // Todo el chat requiere sesión.
  app.addHook('preHandler', app.authenticate);

  async function membership(conversationId: string, userId: string) {
    return prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
  }

  /** Cuenta mensajes no leídos del usuario en una conversación. */
  function unreadCount(conversationId: string, userId: string, lastReadAt: Date | null) {
    return prisma.message.count({
      where: {
        conversationId,
        autorId: { not: userId },
        ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
      },
    });
  }

  // GET /chat/users — usuarios para iniciar un DM (excluye cuentas compartidas/estación,
  // ej. "Recepción", a las que se escribe por el canal en vez de como DM individual).
  app.get('/users', async (req) => {
    const users = await prisma.user.findMany({
      where: { activo: true, id: { not: req.user.sub }, ocultarEnDM: false },
      select: memberSelect,
      orderBy: { nombre: 'asc' },
    });
    return { users };
  });

  // GET /chat/conversations — mis conversaciones con último mensaje y no leídos
  app.get('/conversations', async (req) => {
    const userId = req.user.sub;
    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: { include: { user: { select: memberSelect } } },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { autor: { select: { nombre: true } } },
            },
          },
        },
      },
    });

    const conversations = await Promise.all(
      memberships.map(async (m) => {
        const c = m.conversation;
        const unread = await unreadCount(c.id, userId, m.lastReadAt);
        const otros = c.members.map((cm) => cm.user).filter((u) => u.id !== userId);
        const titulo = c.esGrupo ? c.nombre ?? 'Grupo' : otros[0]?.nombre ?? 'Usuario';
        const last = c.messages[0];
        return {
          id: c.id,
          esGrupo: c.esGrupo,
          roles: c.roles,
          titulo,
          members: c.members.map((cm) => cm.user),
          ultimoMensaje: last
            ? { contenido: last.contenido, createdAt: last.createdAt, autorNombre: last.autor.nombre }
            : null,
          unread,
          updatedAt: c.updatedAt,
        };
      }),
    );

    conversations.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    return { conversations };
  });

  // GET /chat/unread — total de no leídos (para el badge flotante)
  app.get('/unread', async (req) => {
    const userId = req.user.sub;
    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });
    const counts = await Promise.all(
      memberships.map((m) => unreadCount(m.conversationId, userId, m.lastReadAt)),
    );
    return { unread: counts.reduce((a, b) => a + b, 0) };
  });

  // POST /chat/conversations/dm — abrir (o crear) DM con otro usuario
  app.post('/conversations/dm', async (req, reply) => {
    const parsed = dmSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });
    const me = req.user.sub;
    const other = parsed.data.userId;
    if (other === me) return reply.code(400).send({ error: 'No puedes chatear contigo mismo' });

    const otherUser = await prisma.user.findUnique({ where: { id: other }, select: { id: true } });
    if (!otherUser) return reply.code(404).send({ error: 'Usuario no encontrado' });

    const key = dmKeyFor(me, other);
    let conv = await prisma.conversation.findUnique({ where: { dmKey: key } });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          esGrupo: false,
          dmKey: key,
          members: { create: [{ userId: me }, { userId: other }] },
        },
      });
    }
    return reply.code(201).send({ conversationId: conv.id });
  });

  // POST /chat/conversations/group — crear grupo
  app.post('/conversations/group', async (req, reply) => {
    const parsed = groupSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });
    const me = req.user.sub;
    const ids = Array.from(new Set([me, ...parsed.data.memberIds]));
    if (ids.length < 2) return reply.code(400).send({ error: 'Un grupo necesita al menos 2 personas' });

    const conv = await prisma.conversation.create({
      data: {
        esGrupo: true,
        nombre: parsed.data.nombre,
        members: { create: ids.map((userId) => ({ userId })) },
      },
    });
    return reply.code(201).send({ conversationId: conv.id });
  });

  // POST /chat/conversations/channel — crear canal por rol (solo admin)
  // Miembros = todos los usuarios activos con esos roles. Ej: "Recepción".
  app.post('/conversations/channel', { preHandler: app.authorize([Role.ADMIN]) }, async (req, reply) => {
    const parsed = channelSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });
    const roles = Array.from(new Set(parsed.data.roles));
    const miembros = await prisma.user.findMany({
      where: { activo: true, role: { in: roles } },
      select: { id: true },
    });
    const conv = await prisma.conversation.create({
      data: {
        esGrupo: true,
        roles,
        nombre: parsed.data.nombre,
        members: { create: miembros.map((u) => ({ userId: u.id })) },
      },
    });
    return reply.code(201).send({ conversationId: conv.id });
  });

  // GET /chat/conversations/:id/messages?after=<iso> — mensajes (after = polling incremental)
  app.get('/conversations/:id/messages', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { after } = req.query as { after?: string };
    const mem = await membership(id, req.user.sub);
    if (!mem) return reply.code(403).send({ error: 'Sin acceso a esta conversación' });

    const messages = await prisma.message.findMany({
      where: { conversationId: id, ...(after ? { createdAt: { gt: new Date(after) } } : {}) },
      orderBy: { createdAt: 'asc' },
      take: after ? undefined : 200,
      include: { autor: { select: memberSelect } },
    });
    return { messages };
  });

  // POST /chat/conversations/:id/messages — enviar
  app.post('/conversations/:id/messages', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Mensaje vacío' });
    const mem = await membership(id, req.user.sub);
    if (!mem) return reply.code(403).send({ error: 'Sin acceso a esta conversación' });

    const message = await prisma.message.create({
      data: { conversationId: id, autorId: req.user.sub, contenido: parsed.data.contenido },
      include: { autor: { select: memberSelect } },
    });
    // Tocar updatedAt (para ordenar) y marcar leído para el autor.
    const now = new Date();
    const conv = await prisma.conversation.update({
      where: { id }, data: { updatedAt: now },
      select: { esGrupo: true, nombre: true, roles: true },
    });
    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId: id, userId: req.user.sub } },
      data: { lastReadAt: now },
    });

    // Push a los demás miembros (no al autor). El título indica de dónde viene.
    const otros = await prisma.conversationMember.findMany({
      where: { conversationId: id, userId: { not: req.user.sub } },
      select: { userId: true },
    });
    const esCanalOGrupo = conv.esGrupo || conv.roles.length > 0;
    const title = esCanalOGrupo && conv.nombre
      ? `${conv.nombre} · ${message.autor.nombre}`
      : message.autor.nombre;
    const body = parsed.data.contenido.slice(0, 140);
    await Promise.all(
      otros.map((m) =>
        sendPush(m.userId, { title, body, data: { url: '/mensajeria', conversationId: id } }),
      ),
    );

    return reply.code(201).send({ message });
  });

  // POST /chat/conversations/:id/read — marcar como leída
  app.post('/conversations/:id/read', async (req, reply) => {
    const { id } = req.params as { id: string };
    const mem = await membership(id, req.user.sub);
    if (!mem) return reply.code(403).send({ error: 'Sin acceso a esta conversación' });
    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId: id, userId: req.user.sub } },
      data: { lastReadAt: new Date() },
    });
    return { ok: true };
  });
}
