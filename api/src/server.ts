import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env, corsOrigins } from './env.ts';
import authPlugin from './lib/auth.ts';
import { authRoutes } from './modules/auth/auth.routes.ts';
import { usersRoutes } from './modules/users/users.routes.ts';
import { dataRoutes } from './modules/data/data.routes.ts';
import { tasksRoutes } from './modules/tasks/tasks.routes.ts';
import { notificationsRoutes } from './modules/notifications/notifications.routes.ts';
import { chatRoutes } from './modules/chat/chat.routes.ts';

const app = Fastify({
  logger: { transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined },
});

await app.register(cors, { origin: corsOrigins, credentials: true });
await app.register(authPlugin);

app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

await app.register(authRoutes, { prefix: '/auth' });
await app.register(usersRoutes, { prefix: '/users' });
await app.register(dataRoutes, { prefix: '/data' });
await app.register(tasksRoutes, { prefix: '/tasks' });
await app.register(notificationsRoutes, { prefix: '/notifications' });
await app.register(chatRoutes, { prefix: '/chat' });

try {
  // En producción la API vive detrás de nginx: solo localhost. En dev, accesible en la red.
  const host = env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';
  await app.listen({ port: env.PORT, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
