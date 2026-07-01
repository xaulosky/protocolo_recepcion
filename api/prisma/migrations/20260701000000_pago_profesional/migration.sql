-- CreateEnum
CREATE TYPE "PagoEstado" AS ENUM ('PAGADO', 'PENDIENTE_PAGO', 'PENDIENTE_FACTURA', 'PENDIENTE_BOLETA');

-- CreateTable
CREATE TABLE "PagoProfesional" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "monto" INTEGER NOT NULL DEFAULT 0,
    "estado" "PagoEstado" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "fechaPago" TIMESTAMP(3),
    "notas" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoProfesional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PagoProfesional_professionalId_idx" ON "PagoProfesional"("professionalId");

-- CreateIndex
CREATE INDEX "PagoProfesional_periodo_idx" ON "PagoProfesional"("periodo");

-- CreateIndex
CREATE INDEX "PagoProfesional_estado_idx" ON "PagoProfesional"("estado");

-- AddForeignKey
ALTER TABLE "PagoProfesional" ADD CONSTRAINT "PagoProfesional_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoProfesional" ADD CONSTRAINT "PagoProfesional_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
