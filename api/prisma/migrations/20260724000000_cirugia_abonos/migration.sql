-- CreateTable
CREATE TABLE "CirugiaAbono" (
    "id" TEXT NOT NULL,
    "cirugiaId" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "metodo" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CirugiaAbono_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CirugiaAbono_cirugiaId_idx" ON "CirugiaAbono"("cirugiaId");

-- AddForeignKey
ALTER TABLE "CirugiaAbono" ADD CONSTRAINT "CirugiaAbono_cirugiaId_fkey" FOREIGN KEY ("cirugiaId") REFERENCES "Cirugia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirugiaAbono" ADD CONSTRAINT "CirugiaAbono_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
