-- CreateTable StorageLocation
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'storage',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StorageLocation_codigo_key" ON "StorageLocation"("codigo");
CREATE INDEX "StorageLocation_activo_idx" ON "StorageLocation"("activo");
CREATE INDEX "StorageLocation_parentId_idx" ON "StorageLocation"("parentId");
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable LocationInventario
CREATE TABLE "LocationInventario" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocationInventario_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LocationInventario_locationId_itemId_key" ON "LocationInventario"("locationId", "itemId");
CREATE INDEX "LocationInventario_itemId_idx" ON "LocationInventario"("itemId");
CREATE INDEX "LocationInventario_quantity_idx" ON "LocationInventario"("quantity");
ALTER TABLE "LocationInventario" ADD CONSTRAINT "LocationInventario_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "StorageLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LocationInventario" ADD CONSTRAINT "LocationInventario_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "InventarioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable InventarioMovimiento: add location fields
ALTER TABLE "InventarioMovimiento"
  ADD COLUMN "ubicacionId" TEXT,
  ADD COLUMN "ubicacionDestinoId" TEXT;
CREATE INDEX "InventarioMovimiento_ubicacionId_idx" ON "InventarioMovimiento"("ubicacionId");
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_ubicacionId_fkey"
  FOREIGN KEY ("ubicacionId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_ubicacionDestinoId_fkey"
  FOREIGN KEY ("ubicacionDestinoId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
