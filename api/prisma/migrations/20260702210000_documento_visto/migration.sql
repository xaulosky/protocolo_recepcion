-- Acuse de recibo: primera descarga/vista del documento por su dueño
ALTER TABLE "UserDocument" ADD COLUMN "vistoAt" TIMESTAMP(3);
