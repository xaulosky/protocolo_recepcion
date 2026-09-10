-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "claveReservo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "rut" TEXT,
    "rutNorm" TEXT,
    "ficha" TEXT,
    "idPaciente" TEXT,
    "servicio" TEXT NOT NULL,
    "comentario" TEXT,
    "profesional" TEXT NOT NULL,
    "box" TEXT,
    "contacto" TEXT,
    "estado" TEXT NOT NULL,
    "estadoPago" TEXT NOT NULL,
    "atendido" BOOLEAN NOT NULL DEFAULT false,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "sincronizadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglaConsentimiento" (
    "id" TEXT NOT NULL,
    "patron" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "diasAnticipacion" INTEGER NOT NULL DEFAULT 3,
    "autoEnviar" BOOLEAN NOT NULL DEFAULT false,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReglaConsentimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cita_claveReservo_key" ON "Cita"("claveReservo");

-- CreateIndex
CREATE INDEX "Cita_fecha_vigente_idx" ON "Cita"("fecha", "vigente");

-- CreateIndex
CREATE INDEX "Cita_rutNorm_idx" ON "Cita"("rutNorm");

-- CreateIndex
CREATE INDEX "Cita_profesional_idx" ON "Cita"("profesional");

-- CreateIndex
CREATE INDEX "ReglaConsentimiento_activo_idx" ON "ReglaConsentimiento"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "ReglaConsentimiento_patron_consentId_key" ON "ReglaConsentimiento"("patron", "consentId");

-- AddForeignKey
ALTER TABLE "ReglaConsentimiento" ADD CONSTRAINT "ReglaConsentimiento_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "Consent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReglaConsentimiento" ADD CONSTRAINT "ReglaConsentimiento_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
