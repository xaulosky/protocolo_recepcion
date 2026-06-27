-- CreateEnum
CREATE TYPE "EtapaCirugia" AS ENUM ('EVALUACION', 'PRESUPUESTO_ENVIADO', 'CONFIRMADO', 'PREPARACION', 'EN_EJECUCION', 'POST_OPERATORIO', 'CERRADO');
CREATE TYPE "PresupuestoEstado" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');
CREATE TYPE "InsumoTipo" AS ENUM ('INSUMO', 'INSTRUMENTAL');
CREATE TYPE "CanalComunicacion" AS ENUM ('LLAMADA', 'EMAIL', 'WHATSAPP', 'PRESENCIAL', 'OTRO');

-- CreateTable Cirugia
CREATE TABLE "Cirugia" (
    "id" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "etapa" "EtapaCirugia" NOT NULL DEFAULT 'EVALUACION',
    "notas" TEXT,
    "fechaCirugia" TIMESTAMP(3),
    "professionalId" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cirugia_pkey" PRIMARY KEY ("id")
);

-- CreateTable Presupuesto
CREATE TABLE "Presupuesto" (
    "id" TEXT NOT NULL,
    "cirugiaId" TEXT NOT NULL,
    "monto" INTEGER NOT NULL DEFAULT 0,
    "descuento" INTEGER NOT NULL DEFAULT 0,
    "estado" "PresupuestoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "enviadoAt" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable CirugiaInsumo
CREATE TABLE "CirugiaInsumo" (
    "id" TEXT NOT NULL,
    "cirugiaId" TEXT NOT NULL,
    "tipo" "InsumoTipo" NOT NULL DEFAULT 'INSUMO',
    "nombre" TEXT NOT NULL,
    "productId" INTEGER,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "unidad" TEXT,
    "listo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CirugiaInsumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable ComunicacionLog
CREATE TABLE "ComunicacionLog" (
    "id" TEXT NOT NULL,
    "cirugiaId" TEXT NOT NULL,
    "canal" "CanalComunicacion" NOT NULL DEFAULT 'LLAMADA',
    "descripcion" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComunicacionLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable Task — agregar cirugiaId opcional
ALTER TABLE "Task" ADD COLUMN "cirugiaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Presupuesto_cirugiaId_key" ON "Presupuesto"("cirugiaId");
CREATE INDEX "Cirugia_etapa_idx" ON "Cirugia"("etapa");
CREATE INDEX "Cirugia_professionalId_idx" ON "Cirugia"("professionalId");
CREATE INDEX "CirugiaInsumo_cirugiaId_idx" ON "CirugiaInsumo"("cirugiaId");
CREATE INDEX "ComunicacionLog_cirugiaId_idx" ON "ComunicacionLog"("cirugiaId");
CREATE INDEX "Task_cirugiaId_idx" ON "Task"("cirugiaId");

-- AddForeignKey
ALTER TABLE "Cirugia" ADD CONSTRAINT "Cirugia_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Cirugia" ADD CONSTRAINT "Cirugia_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_cirugiaId_fkey" FOREIGN KEY ("cirugiaId") REFERENCES "Cirugia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CirugiaInsumo" ADD CONSTRAINT "CirugiaInsumo_cirugiaId_fkey" FOREIGN KEY ("cirugiaId") REFERENCES "Cirugia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CirugiaInsumo" ADD CONSTRAINT "CirugiaInsumo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ComunicacionLog" ADD CONSTRAINT "ComunicacionLog_cirugiaId_fkey" FOREIGN KEY ("cirugiaId") REFERENCES "Cirugia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComunicacionLog" ADD CONSTRAINT "ComunicacionLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_cirugiaId_fkey" FOREIGN KEY ("cirugiaId") REFERENCES "Cirugia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
