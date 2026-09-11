-- Ventas importadas desde otros sistemas (Reservo): origen, id externo para
-- no duplicar reintentos, referencia y datos crudos para auditar.
ALTER TABLE "Venta" ADD COLUMN "origen" TEXT,
ADD COLUMN "idExterno" TEXT,
ADD COLUMN "referenciaExterna" TEXT,
ADD COLUMN "datosExternos" JSONB;

CREATE UNIQUE INDEX "Venta_idExterno_key" ON "Venta"("idExterno");

-- Exento explícito en ítems importados; null conserva la regla de siempre.
ALTER TABLE "VentaItem" ADD COLUMN "exento" BOOLEAN;
