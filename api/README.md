# Cialo Hub — API

Backend de Cialo Hub: **Fastify + Prisma + PostgreSQL + Zod**, con autenticación JWT (access + refresh), roles, y notificaciones in-app + email + push.

## Requisitos
- Node 20.12+ (probado en 24)
- PostgreSQL 16 (en dev se levanta con Docker desde la raíz del repo)

## Puesta en marcha (desarrollo)

```bash
# 1. Levantar Postgres (desde la raíz del repo)
docker compose up -d            # expone Postgres en localhost:5433

# 2. Configurar variables
cd api
cp .env.example .env            # ya viene apuntando a localhost:5433

# 3. Instalar y preparar la BD
npm install
npm run prisma:migrate          # crea las tablas
npm run db:seed                 # migra la data clínica + crea usuarios

# 4. Correr el servidor
npm run dev                     # http://localhost:4000
```

### Usuarios sembrados (seed)
- **Admin**: `admin@cialo.cl` / `admin1234`
- **Recepción**: `valentina@cialo.cl`, `camila@cialo.cl`, `daniela@cialo.cl` / `recepcion123`

(cámbialos en producción)

## Scripts
- `npm run dev` — servidor con recarga (tsx watch)
- `npm run build` — compila a `dist/` (entry: `dist/server.js`)
- `npm start` — corre el build de producción
- `npm run prisma:migrate` — crea/aplica migraciones
- `npm run prisma:studio` — GUI para ver/editar la BD
- `npm run db:seed` — re-siembra la data (idempotente)
- `npm run db:reset` — borra y recrea la BD desde cero

## Endpoints

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | Login → access + refresh |
| POST | `/auth/refresh` | público | Rota el refresh token |
| POST | `/auth/logout` | público | Revoca el refresh token |
| GET | `/auth/me` | auth | Usuario actual |
| GET/POST/PATCH/DELETE | `/users` | ADMIN | Gestión de usuarios |
| GET | `/data/*` | auth | Data clínica (treatments, professionals, products, consultations, boxes, consents, faq, protocols, scripts, payment-policies, internal-protocols, stats) |
| GET/POST/PATCH/DELETE | `/tasks` | auth / edición | Kanban de tareas |
| GET | `/notifications` | auth | Notificaciones del usuario |
| POST | `/notifications/:id/read`, `/read-all` | auth | Marcar leídas |
| GET | `/notifications/push/config` | auth | Clave VAPID + canales activos |
| POST | `/notifications/push/subscribe` | auth | Registrar suscripción push |

## Roles
`ADMIN` · `RECEPCION` · `PROFESIONAL` · `LECTURA`

## Notificaciones
- **In-app**: siempre (tabla `Notification`).
- **Email**: se activa si hay `SMTP_HOST` configurado.
- **Push**: se activa si hay `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`. Generar con `npx web-push generate-vapid-keys`.

## Despliegue (VPS)
1. `npm ci && npm run build`
2. Variables de entorno reales (`DATABASE_URL` al Postgres del VPS, secrets JWT aleatorios, SMTP, VAPID).
3. `npx prisma migrate deploy` y `npm run db:seed` (una vez).
4. Correr con pm2: `pm2 start dist/server.js --name cialo-api`.
5. Nginx como reverse proxy → puerto 4000.
