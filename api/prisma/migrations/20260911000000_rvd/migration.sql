-- Resumen de Ventas Diarias (ex RCOF): un registro por envio al SII.
CREATE TABLE "EnvioRvd" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "secuencia" INTEGER NOT NULL,
    "trackId" TEXT,
    "estado" TEXT NOT NULL,
    "detalle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvioRvd_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EnvioRvd_fecha_secuencia_key" ON "EnvioRvd"("fecha", "secuencia");
CREATE INDEX "EnvioRvd_fecha_idx" ON "EnvioRvd"("fecha");
