import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.ts';
import { channels, vapidPublicKey } from '../../lib/notify.ts';

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export async function notificationsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // GET /notifications
  app.get('/', async (req) => {
    const userId = req.user.sub;
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { notifications: items, unread };
  });

  // POST /notifications/:id/read
  app.post('/:id/read', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.notification.updateMany({ where: { id, userId: req.user.sub }, data: { readAt: new Date() } });
    return { ok: true };
  });

  // POST /notifications/read-all
  app.post('/read-all', async (req) => {
    await prisma.notification.updateMany({ where: { userId: req.user.sub, readAt: null }, data: { readAt: new Date() } });
    return { ok: true };
  });

  // GET /notifications/push/config — clave pública VAPID y canales activos
  app.get('/push/config', async () => ({ vapidPublicKey, channels }));

  // POST /notifications/push/subscribe
  app.post('/push/subscribe', async (req, reply) => {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Suscripción inválida' });
    const { endpoint, keys } = parsed.data;
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { userId: req.user.sub, p256dh: keys.p256dh, auth: keys.auth },
      create: { userId: req.user.sub, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });
    return reply.code(201).send({ ok: true });
  });

  // POST /notifications/push/unsubscribe
  app.post('/push/unsubscribe', async (req) => {
    const { endpoint } = (req.body ?? {}) as { endpoint?: string };
    if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user.sub } });
    return { ok: true };
  });
}
