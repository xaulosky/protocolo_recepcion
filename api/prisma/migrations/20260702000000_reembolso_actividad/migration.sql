-- CreateTable: ReembolsoActividad (auditoría de cambios en solicitudes de reembolso)
CREATE TABLE "ReembolsoActividad" (
    "id"          TEXT NOT NULL,
    "reembolsoId" TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "tipo"        TEXT NOT NULL,
    "detalle"     TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReembolsoActividad_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ReembolsoActividad"
    ADD CONSTRAINT "ReembolsoActividad_reembolsoId_fkey"
    FOREIGN KEY ("reembolsoId") REFERENCES "SolicitudReembolso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReembolsoActividad"
    ADD CONSTRAINT "ReembolsoActividad_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ReembolsoActividad_reembolsoId_idx" ON "ReembolsoActividad"("reembolsoId");
