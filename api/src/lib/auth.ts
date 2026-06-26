import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Role } from '@prisma/client';
import { env } from '../env.ts';

export interface AccessPayload {
  sub: string;
  email: string;
  nombre: string;
  role: Role;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (roles: Role[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AccessPayload;
    user: AccessPayload;
  }
}

/** Plugin de autenticación: registra @fastify/jwt y expone `authenticate` y `authorize`. */
export default fp(async (app) => {
  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: env.ACCESS_TOKEN_TTL },
  });

  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'No autenticado' });
    }
  });

  app.decorate('authorize', (roles: Role[]) => async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'Sin permisos para esta acción' });
    }
  });
});
