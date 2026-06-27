-- CreateTable
CREATE TABLE "CirugiaActividad" (
    "id" TEXT NOT NULL,
    "cirugiaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "datos" JSONB,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CirugiaActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CirugiaActividad_cirugiaId_idx" ON "CirugiaActividad"("cirugiaId");

-- AddForeignKey
ALTER TABLE "CirugiaActividad" ADD CONSTRAINT "CirugiaActividad_cirugiaId_fkey"
    FOREIGN KEY ("cirugiaId") REFERENCES "Cirugia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirugiaActividad" ADD CONSTRAINT "CirugiaActividad_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
