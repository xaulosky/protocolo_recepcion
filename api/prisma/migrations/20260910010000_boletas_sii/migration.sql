-- Boletas electrónicas del SII: CAF (rangos de folios autorizados) y el
-- documento tributario asociado a cada venta de caja.

-- CreateEnum
CREATE TYPE "TipoDte" AS ENUM ('BOLETA_AFECTA', 'BOLETA_EXENTA');

-- CreateEnum
CREATE TYPE "EstadoDte" AS ENUM ('PENDIENTE', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'ANULADA');

-- CreateTable
CREATE TABLE "Caf" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDte" NOT NULL,
    "desde" INTEGER NOT NULL,
    "hasta" INTEGER NOT NULL,
    "siguiente" INTEGER NOT NULL,
    "xml" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vencimiento" TIMESTAMP(3),
    "notas" TEXT,
    "cargadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoTributario" (
    "id" TEXT NOT NULL,
    "ventaId" TEXT NOT NULL,
    "tipo" "TipoDte" NOT NULL,
    "folio" INTEGER NOT NULL,
    "cafId" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "neto" INTEGER NOT NULL DEFAULT 0,
    "exento" INTEGER NOT NULL DEFAULT 0,
    "iva" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "estado" "EstadoDte" NOT NULL DEFAULT 'PENDIENTE',
    "xml" TEXT,
    "ted" TEXT,
    "trackId" TEXT,
    "respuestaSii" TEXT,
    "enviadoAt" TIMESTAMP(3),
    "resueltoAt" TIMESTAMP(3),
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "ultimoError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoTributario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Caf_tipo_activo_idx" ON "Caf"("tipo", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoTributario_ventaId_key" ON "DocumentoTributario"("ventaId");

-- CreateIndex
CREATE INDEX "DocumentoTributario_estado_idx" ON "DocumentoTributario"("estado");

-- CreateIndex
CREATE INDEX "DocumentoTributario_fechaEmision_idx" ON "DocumentoTributario"("fechaEmision");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoTributario_tipo_folio_key" ON "DocumentoTributario"("tipo", "folio");

-- AddForeignKey
ALTER TABLE "Caf" ADD CONSTRAINT "Caf_cargadoPorId_fkey" FOREIGN KEY ("cargadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoTributario" ADD CONSTRAINT "DocumentoTributario_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoTributario" ADD CONSTRAINT "DocumentoTributario_cafId_fkey" FOREIGN KEY ("cafId") REFERENCES "Caf"("id") ON DELETE SET NULL ON UPDATE CASCADE;
