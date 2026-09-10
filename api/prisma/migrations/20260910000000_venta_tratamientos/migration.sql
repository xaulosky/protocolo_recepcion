-- Permite vender tratamientos en caja: un VentaItem puede apuntar a un
-- Treatment en lugar de a un producto. No mueve stock.

-- AlterTable
ALTER TABLE "VentaItem" ADD COLUMN     "treatmentId" TEXT;

-- CreateIndex
CREATE INDEX "VentaItem_treatmentId_idx" ON "VentaItem"("treatmentId");

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
