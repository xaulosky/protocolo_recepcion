-- Trazabilidad legal del consentimiento informado:
--   * representante legal (Ley 20.584: menores e incapacidad)
--   * responsable y respaldo de la firma en papel
--   * anulación con autor, fecha y motivo

-- CreateEnum
CREATE TYPE "FirmanteRelacion" AS ENUM ('TITULAR', 'MADRE', 'PADRE', 'TUTOR', 'APODERADO', 'OTRO');

-- AlterTable
ALTER TABLE "SignedConsent" ADD COLUMN     "firmanteRelacion" "FirmanteRelacion" NOT NULL DEFAULT 'TITULAR',
ADD COLUMN     "firmanteRut" TEXT,
ADD COLUMN     "firmaManualPorId" TEXT,
ADD COLUMN     "firmaManualObs" TEXT,
ADD COLUMN     "respaldoPath" TEXT,
ADD COLUMN     "respaldoMime" TEXT,
ADD COLUMN     "respaldoSize" INTEGER,
ADD COLUMN     "anuladoPorId" TEXT,
ADD COLUMN     "anuladoAt" TIMESTAMP(3),
ADD COLUMN     "motivoAnulacion" TEXT;

-- AddForeignKey
ALTER TABLE "SignedConsent" ADD CONSTRAINT "SignedConsent_firmaManualPorId_fkey" FOREIGN KEY ("firmaManualPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedConsent" ADD CONSTRAINT "SignedConsent_anuladoPorId_fkey" FOREIGN KEY ("anuladoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
