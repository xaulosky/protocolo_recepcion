import { z } from 'zod';

// Carga .env (Node 20.12+). En producción las variables vienen del entorno (pm2/systemd).
try {
  process.loadEnvFile();
} catch {
  /* .env opcional */
}

const schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),

  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('Cialo Hub <no-reply@cialo.cl>'),

  VAPID_PUBLIC_KEY: z.string().default(''),
  VAPID_PRIVATE_KEY: z.string().default(''),
  VAPID_SUBJECT: z.string().default('mailto:contacto@cialo.cl'),

  SEED_ADMIN_EMAIL: z.string().default('admin@cialo.cl'),
  SEED_ADMIN_PASSWORD: z.string().default('admin1234'),
});

export const env = schema.parse(process.env);
export type Env = typeof env;

/** Orígenes CORS permitidos (coma-separados en CORS_ORIGIN). */
export const corsOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
