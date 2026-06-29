-- CreateTable
CREATE TABLE "InventarioItem" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "codigoBarras" TEXT,
    "descripcion" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL DEFAULT 'unidad',
    "categoria" TEXT,
    "costo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventarioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioMovimiento" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockAntes" INTEGER NOT NULL,
    "stockDespues" INTEGER NOT NULL,
    "codigoMotivo" TEXT,
    "notas" TEXT,
    "profesionalId" TEXT,
    "realizadoPorId" TEXT,
    "fechaMovimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventarioItem_sku_key" ON "InventarioItem"("sku");

-- CreateIndex
CREATE INDEX "InventarioItem_categoria_idx" ON "InventarioItem"("categoria");

-- CreateIndex
CREATE INDEX "InventarioItem_activo_idx" ON "InventarioItem"("activo");

-- CreateIndex
CREATE INDEX "InventarioItem_stock_idx" ON "InventarioItem"("stock");

-- CreateIndex
CREATE INDEX "InventarioMovimiento_itemId_fechaMovimiento_idx" ON "InventarioMovimiento"("itemId", "fechaMovimiento");

-- CreateIndex
CREATE INDEX "InventarioMovimiento_fechaMovimiento_idx" ON "InventarioMovimiento"("fechaMovimiento");

-- CreateIndex
CREATE INDEX "InventarioMovimiento_tipo_idx" ON "InventarioMovimiento"("tipo");

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventarioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
