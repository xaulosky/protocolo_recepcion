-- AlterTable: agregar email, tipoCuenta, titular, fechaSolicitud a SolicitudReembolso
ALTER TABLE "SolicitudReembolso"
  ADD COLUMN "email"          TEXT,
  ADD COLUMN "tipoCuenta"     TEXT,
  ADD COLUMN "titular"        TEXT,
  ADD COLUMN "fechaSolicitud" TEXT;
