-- Tabla join para la relación muchos-a-muchos Task ↔ User (asignados)
CREATE TABLE "_TareaAsignadas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TareaAsignadas_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TareaAsignadas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrar datos existentes: asignadaId → join table
INSERT INTO "_TareaAsignadas" ("A", "B")
SELECT "id", "asignadaId"
FROM "Task"
WHERE "asignadaId" IS NOT NULL;

-- Índices que Prisma espera para M2M implícita
CREATE UNIQUE INDEX "_TareaAsignadas_AB_unique" ON "_TareaAsignadas"("A", "B");
CREATE INDEX "_TareaAsignadas_B_index" ON "_TareaAsignadas"("B");

-- Eliminar columna y el índice antiguo
DROP INDEX IF EXISTS "Task_asignadaId_idx";
ALTER TABLE "Task" DROP COLUMN "asignadaId";
