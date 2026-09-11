import { z } from 'zod';

// Carga .env (Node 20.12+). En producción las variables vienen del entorno (pm2/systemd).
try {
  process.loadEnvFile();
} catch {
  /* .env opcional */
}

/**
 * Booleano de variable de entorno. NO usar z.coerce.boolean(): aplica Boolean()
 * sobre el string, y Boolean('false') es true — activaria justo lo que se
 * intenta apagar.
 */
const boolEnv = (porDefecto: boolean) =>
  z
    .string()
    .default(porDefecto ? 'true' : 'false')
    .transform((v) => ['1', 'true', 'yes', 'si', 'sí'].includes(v.trim().toLowerCase()));

const schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // URL pública del frontend (para armar enlaces en los correos).
  APP_URL: z.string().default('http://localhost:5173'),

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

  // Integración con reservo-api (agenda). En el VPS ambas apps son vecinas, así
  // que apunta al loopback y los datos de pacientes nunca salen del servidor.
  // Vacío = integración apagada; el módulo de citas queda inerte.
  RESERVO_API_URL: z.string().default(''),
  RESERVO_API_KEY: z.string().default(''),
  // Opcional: sólo si esta instancia consulta una cuenta de reservo.cl distinta
  // a la configurada en el .env de reservo-api.
  RESERVO_USER: z.string().default(''),
  RESERVO_PASS: z.string().default(''),
  // Minutos entre sincronizaciones automáticas. 0 = sólo sync manual.
  RESERVO_SYNC_INTERVAL_MIN: z.coerce.number().default(0),

  // Boletas electronicas (SII). Apagado por defecto: mientras no haya CAF ni
  // certificado, la caja funciona igual y no se emite ningun documento.
  BOLETAS_HABILITADAS: boolEnv(false),
  // Convencion al consumidor final: los precios mostrados ya traen el IVA.
  PRECIOS_INCLUYEN_IVA: boolEnv(true),
  // Ambiente del SII: 'certificacion' mientras se valida, 'produccion' despues.
  SII_AMBIENTE: z.enum(['certificacion', 'produccion']).default('certificacion'),

  // Datos del emisor que exige el encabezado del DTE. Se sacan de "Mi SII";
  // no se hardcodean porque el ambiente de certificacion y el de produccion
  // pueden diferir y porque cambian si la empresa se traslada.
  SII_RUT_EMISOR: z.string().default(''),        // 78155814-1
  SII_RAZON_SOCIAL: z.string().default(''),      // CENTRO MEDICO CIALO SPA
  SII_GIRO: z.string().default(''),              // giro registrado, sin abreviar
  SII_ACTECO: z.string().default(''),            // codigo de actividad economica
  SII_DIR_ORIGEN: z.string().default(''),        // direccion de la casa matriz
  SII_CMNA_ORIGEN: z.string().default(''),       // comuna de la casa matriz (max 20)
  SII_CIUDAD_ORIGEN: z.string().default(''),     // ciudad de la casa matriz (max 20)
  SII_NOMBRE_SOFTWARE: z.string().default('ADMINISTRACION.CIALO.CL'),
  // Sitio donde el cliente consulta su boleta. Va impreso bajo el timbre y el
  // SII verifica que exista antes de autorizar por resolucion.
  SII_URL_CONSULTA: z.string().default('https://administracion.cialo.cl/boleta'),

  // Certificado digital de firma (.pfx/.p12). Vive FUERA del repositorio: la
  // ruta se configura por entorno y el archivo nunca se versiona.
  SII_CERT_PATH: z.string().default(''),
  SII_CERT_PASS: z.string().default(''),

  // Resolucion del SII que autoriza a emitir, para la caratula del sobre y
  // del RCOF. En certificacion el numero es 0 y la fecha es la de la
  // autorizacion; en produccion son los de la resolucion definitiva.
  SII_FCH_RESOL: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default('2026-09-10'),
  SII_NRO_RESOL: z.coerce.number().int().min(0).default(0),

  // Durante la certificacion cada documento debe referenciar su caso del set
  // (<CodRef>SET, <RazonRef>CASO-N). En produccion esa referencia no va.
  SII_SET_PRUEBAS: boolEnv(false),

  // Folio de la notificacion con que el SII pide el libro de boletas. El
  // esquema lo exige aunque la Resolucion 74 de 2020 eliminara el libro.
  SII_FOLIO_NOTIFICACION: z.coerce.number().int().positive().default(1),

  // Copiloto IA (chat con function-calling sobre DeepSeek, API compatible con OpenAI).
  DEEPSEEK_API_KEY: z.string().default(''),
  DEEPSEEK_MODEL: z.string().default('deepseek-v4-flash'),
});

export const env = schema.parse(process.env);
export type Env = typeof env;

/** Orígenes CORS permitidos (coma-separados en CORS_ORIGIN). */
export const corsOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
