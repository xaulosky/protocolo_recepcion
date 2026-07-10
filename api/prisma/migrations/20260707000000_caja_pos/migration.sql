-- Caja / Punto de venta: turnos con apertura/cierre, ventas con folio y
-- descuento de stock real vía vínculo Product ↔ InventarioItem.

-- CreateEnum
CREATE TYPE "TurnoEstado" AS ENUM ('ABIERTO', 'CERRADO');
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- AlterTable: vínculo opcional 1:1 Product → InventarioItem
ALTER TABLE "Product" ADD COLUMN "inventarioItemId" TEXT;
CREATE UNIQUE INDEX "Product_inventarioItemId_key" ON "Product"("inventarioItemId");
ALTER TABLE "Product"
    ADD CONSTRAINT "Product_inventarioItemId_fkey"
    FOREIGN KEY ("inventarioItemId") REFERENCES "InventarioItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Turno
CREATE TABLE "Turno" (
    "id"            TEXT NOT NULL,
    "estado"        "TurnoEstado" NOT NULL DEFAULT 'ABIERTO',
    "montoInicial"  INTEGER NOT NULL DEFAULT 0,
    "aperturaNotas" TEXT,
    "abiertoPorId"  TEXT NOT NULL,
    "abiertoAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoContado"  INTEGER,
    "montoEsperado" INTEGER,
    "diferencia"    INTEGER,
    "cierreNotas"   TEXT,
    "cerradoPorId"  TEXT,
    "cerradoAt"     TIMESTAMP(3),
    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Turno"
    ADD CONSTRAINT "Turno_abiertoPorId_fkey"
    FOREIGN KEY ("abiertoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Turno"
    ADD CONSTRAINT "Turno_cerradoPorId_fkey"
    FOREIGN KEY ("cerradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Turno_estado_idx" ON "Turno"("estado");
CREATE INDEX "Turno_abiertoAt_idx" ON "Turno"("abiertoAt");

-- Defensa extra contra doble apertura concurrente: índice único parcial —
-- Postgres garantiza que solo puede existir UNA fila con estado ABIERTO.
CREATE UNIQUE INDEX "Turno_unico_abierto" ON "Turno"("estado") WHERE "estado" = 'ABIERTO';

-- CreateTable: Venta (numero SERIAL = folio correlativo del comprobante)
CREATE TABLE "Venta" (
    "id"              TEXT NOT NULL,
    "numero"          SERIAL NOT NULL,
    "turnoId"         TEXT NOT NULL,
    "cliente"         TEXT,
    "metodoPago"      "MetodoPago" NOT NULL,
    "subtotal"        INTEGER NOT NULL,
    "descuento"       INTEGER NOT NULL DEFAULT 0,
    "total"           INTEGER NOT NULL,
    "notas"           TEXT,
    "vendedorId"      TEXT NOT NULL,
    "anuladaAt"       TIMESTAMP(3),
    "anuladaPorId"    TEXT,
    "motivoAnulacion" TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Venta_numero_key" ON "Venta"("numero");
CREATE INDEX "Venta_turnoId_idx" ON "Venta"("turnoId");
CREATE INDEX "Venta_vendedorId_idx" ON "Venta"("vendedorId");
CREATE INDEX "Venta_createdAt_idx" ON "Venta"("createdAt");
CREATE INDEX "Venta_anuladaAt_idx" ON "Venta"("anuladaAt");

ALTER TABLE "Venta"
    ADD CONSTRAINT "Venta_turnoId_fkey"
    FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Venta"
    ADD CONSTRAINT "Venta_vendedorId_fkey"
    FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Venta"
    ADD CONSTRAINT "Venta_anuladaPorId_fkey"
    FOREIGN KEY ("anuladaPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: VentaItem
CREATE TABLE "VentaItem" (
    "id"               TEXT NOT NULL,
    "ventaId"          TEXT NOT NULL,
    "productId"        INTEGER,
    "inventarioItemId" TEXT,
    "nombre"           TEXT NOT NULL,
    "precioUnitario"   INTEGER NOT NULL,
    "cantidad"         INTEGER NOT NULL,
    CONSTRAINT "VentaItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VentaItem_ventaId_idx" ON "VentaItem"("ventaId");
CREATE INDEX "VentaItem_productId_idx" ON "VentaItem"("productId");
CREATE INDEX "VentaItem_inventarioItemId_idx" ON "VentaItem"("inventarioItemId");

ALTER TABLE "VentaItem"
    ADD CONSTRAINT "VentaItem_ventaId_fkey"
    FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VentaItem"
    ADD CONSTRAINT "VentaItem_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VentaItem"
    ADD CONSTRAINT "VentaItem_inventarioItemId_fkey"
    FOREIGN KEY ("inventarioItemId") REFERENCES "InventarioItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: trazabilidad venta → movimiento de inventario
ALTER TABLE "InventarioMovimiento" ADD COLUMN "ventaItemId" TEXT;
CREATE INDEX "InventarioMovimiento_ventaItemId_idx" ON "InventarioMovimiento"("ventaItemId");
ALTER TABLE "InventarioMovimiento"
    ADD CONSTRAINT "InventarioMovimiento_ventaItemId_fkey"
    FOREIGN KEY ("ventaItemId") REFERENCES "VentaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
