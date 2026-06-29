-- AddColumn: tags on Task
ALTER TABLE "Task" ADD COLUMN "tags" TEXT[] DEFAULT '{}';

-- CreateEnum: GiftCardEstado
CREATE TYPE "GiftCardEstado" AS ENUM ('ACTIVA', 'CANJEADA', 'ANULADA');

-- CreateEnum: ReembolsoEstado
CREATE TYPE "ReembolsoEstado" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO');

-- CreateTable: Quote
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "rut" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "descuento" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "notas" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Quote_creadoPorId_idx" ON "Quote"("creadoPorId");
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: GiftCard
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "para" TEXT NOT NULL,
    "de" TEXT,
    "monto" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "mensaje" TEXT,
    "estado" "GiftCardEstado" NOT NULL DEFAULT 'ACTIVA',
    "canjeoAt" TIMESTAMP(3),
    "notas" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GiftCard_codigo_key" ON "GiftCard"("codigo");
CREATE INDEX "GiftCard_estado_idx" ON "GiftCard"("estado");
CREATE INDEX "GiftCard_createdAt_idx" ON "GiftCard"("createdAt");
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: SolicitudReembolso
CREATE TABLE "SolicitudReembolso" (
    "id" TEXT NOT NULL,
    "paciente" TEXT NOT NULL,
    "rut" TEXT,
    "telefono" TEXT,
    "fechaPago" TEXT,
    "monto" TEXT,
    "motivo" TEXT NOT NULL,
    "banco" TEXT,
    "cuenta" TEXT,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "estado" "ReembolsoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SolicitudReembolso_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SolicitudReembolso_estado_idx" ON "SolicitudReembolso"("estado");
CREATE INDEX "SolicitudReembolso_urgente_idx" ON "SolicitudReembolso"("urgente");
CREATE INDEX "SolicitudReembolso_createdAt_idx" ON "SolicitudReembolso"("createdAt");
ALTER TABLE "SolicitudReembolso" ADD CONSTRAINT "SolicitudReembolso_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: MessageReaction
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_emoji_key" ON "MessageReaction"("messageId", "userId", "emoji");
CREATE INDEX "MessageReaction_messageId_idx" ON "MessageReaction"("messageId");
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
