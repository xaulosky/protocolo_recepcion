-- Copiloto IA: flag de acceso por usuario + historial de mensajes (1:1 usuario<->asistente)

ALTER TABLE "User" ADD COLUMN "copilotoHabilitado" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "CopilotoMensaje" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "role"       TEXT NOT NULL,
    "contenido"  TEXT NOT NULL,
    "toolName"   TEXT,
    "toolArgs"   JSONB,
    "toolResult" JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CopilotoMensaje_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CopilotoMensaje"
    ADD CONSTRAINT "CopilotoMensaje_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "CopilotoMensaje_userId_createdAt_idx" ON "CopilotoMensaje"("userId", "createdAt");
