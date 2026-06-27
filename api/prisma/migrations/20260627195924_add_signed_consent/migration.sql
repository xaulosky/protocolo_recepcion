-- CreateEnum
CREATE TYPE "ConsentEstado" AS ENUM ('PENDIENTE', 'FIRMADO', 'ANULADO');

-- AlterTable
ALTER TABLE "Cirugia" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Presupuesto" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SignedConsent" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "consentId" TEXT,
    "titulo" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "paciente" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "profesional" TEXT NOT NULL,
    "procedimiento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fecha" TEXT NOT NULL,
    "estado" "ConsentEstado" NOT NULL DEFAULT 'PENDIENTE',
    "firmaImagen" TEXT,
    "firmanteNombre" TEXT,
    "fotoAuth" BOOLEAN,
    "firmadoAt" TIMESTAMP(3),
    "firmaIp" TEXT,
    "firmaUserAgent" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignedConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignedConsent_token_key" ON "SignedConsent"("token");

-- CreateIndex
CREATE INDEX "SignedConsent_estado_idx" ON "SignedConsent"("estado");

-- CreateIndex
CREATE INDEX "SignedConsent_createdAt_idx" ON "SignedConsent"("createdAt");

-- AddForeignKey
ALTER TABLE "SignedConsent" ADD CONSTRAINT "SignedConsent_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "Consent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedConsent" ADD CONSTRAINT "SignedConsent_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
