-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECEPCION', 'PROFESIONAL', 'LECTURA');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TAREA_ASIGNADA', 'TAREA_ACTUALIZADA', 'REEMBOLSO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "Etapa" AS ENUM ('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'REVISION', 'CERRADO');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'NORMAL', 'URGENTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPCION',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "professionalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SISTEMA',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "paciente" TEXT,
    "etapa" "Etapa" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "Prioridad" NOT NULL DEFAULT 'NORMAL',
    "asignadaId" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "profesional" TEXT,
    "especialidad" TEXT,
    "valorDesde" INTEGER,
    "valorHasta" INTEGER,
    "duracion" TEXT,
    "sesiones" TEXT,
    "protocolo" TEXT,
    "requiereEvaluacion" BOOLEAN NOT NULL DEFAULT false,
    "indicaciones" TEXT[],
    "contraindicaciones" TEXT[],
    "preTratamiento" TEXT[],
    "postTratamiento" TEXT[],
    "extra" JSONB,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "rut" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "disponibilidad" JSONB,
    "prestaciones" JSONB,
    "extra" JSONB,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentProfessional" (
    "treatmentId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,

    CONSTRAINT "TreatmentProfessional_pkey" PRIMARY KEY ("treatmentId","professionalId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT,
    "description" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "categoria" TEXT,
    "emoji" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "duracion" TEXT,
    "reembolsable" BOOLEAN NOT NULL DEFAULT false,
    "profesionales" JSONB,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "alias" TEXT,
    "tipo" TEXT,
    "descripcion" TEXT,
    "usosPrincipales" TEXT[],
    "equipamiento" JSONB,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "beneficios" TEXT[],
    "efectosSecundarios" TEXT[],
    "contraindicaciones" TEXT[],
    "cuidados" TEXT[],
    "extra" JSONB,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "nota" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPolicy" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PaymentPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalProtocol" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sections" JSONB NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InternalProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "Task_etapa_idx" ON "Task"("etapa");

-- CreateIndex
CREATE INDEX "Task_asignadaId_idx" ON "Task"("asignadaId");

-- CreateIndex
CREATE INDEX "Treatment_categoria_idx" ON "Treatment"("categoria");

-- CreateIndex
CREATE INDEX "Professional_especialidad_idx" ON "Professional"("especialidad");

-- CreateIndex
CREATE INDEX "TreatmentProfessional_professionalId_idx" ON "TreatmentProfessional"("professionalId");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- CreateIndex
CREATE INDEX "FaqItem_categoria_idx" ON "FaqItem"("categoria");

-- CreateIndex
CREATE INDEX "Protocol_numero_idx" ON "Protocol"("numero");

-- CreateIndex
CREATE INDEX "Script_categoria_idx" ON "Script"("categoria");

-- CreateIndex
CREATE INDEX "PaymentPolicy_tipo_idx" ON "PaymentPolicy"("tipo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_asignadaId_fkey" FOREIGN KEY ("asignadaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentProfessional" ADD CONSTRAINT "TreatmentProfessional_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentProfessional" ADD CONSTRAINT "TreatmentProfessional_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
