-- Registra qué profesional realizó cada prestación vendida, para que el
-- comprobante impreso pueda mostrarlo. Se guarda además el nombre como
-- snapshot, de modo que el documento siga siendo fiel aunque cambie la ficha.

-- AlterTable
ALTER TABLE "VentaItem" ADD COLUMN     "professionalId" TEXT,
ADD COLUMN     "profesionalNombre" TEXT;

-- CreateIndex
CREATE INDEX "VentaItem_professionalId_idx" ON "VentaItem"("professionalId");

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
