-- Perfil personal del usuario + documentos personales (contratos, anexos, liquidaciones)

-- AlterTable: campos de perfil en User
ALTER TABLE "User"
  ADD COLUMN "telefono"        TEXT,
  ADD COLUMN "fechaNacimiento" TEXT;

-- CreateTable: UserDocument
CREATE TABLE "UserDocument" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "tipo"        TEXT NOT NULL,
    "titulo"      TEXT NOT NULL,
    "filename"    TEXT NOT NULL,
    "path"        TEXT NOT NULL,
    "mime"        TEXT NOT NULL,
    "size"        INTEGER NOT NULL,
    "periodo"     TEXT,
    "notas"       TEXT,
    "subidoPorId" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserDocument_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserDocument"
    ADD CONSTRAINT "UserDocument_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserDocument"
    ADD CONSTRAINT "UserDocument_subidoPorId_fkey"
    FOREIGN KEY ("subidoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "UserDocument_userId_idx" ON "UserDocument"("userId");
