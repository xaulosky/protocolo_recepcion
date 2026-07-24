-- Calendario general: eventos internos (reuniones, feriados/cierres, u otro)

CREATE TYPE "EventoCategoria" AS ENUM ('REUNION', 'FERIADO', 'OTRO');

CREATE TABLE "EventoInterno" (
    "id"          TEXT NOT NULL,
    "titulo"      TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria"   "EventoCategoria" NOT NULL DEFAULT 'OTRO',
    "fecha"       TIMESTAMP(3) NOT NULL,
    "fechaFin"    TIMESTAMP(3),
    "todoElDia"   BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventoInterno_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventoInterno_fecha_idx" ON "EventoInterno"("fecha");

ALTER TABLE "EventoInterno"
    ADD CONSTRAINT "EventoInterno_creadoPorId_fkey"
    FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
