import type { Prisma, TipoDte } from '@prisma/client';

/**
 * Asignación de folios desde el CAF vigente.
 *
 * Un folio repetido es un problema tributario, no un bug cualquiera: el SII
 * rechaza el documento y la clínica queda con dos boletas con el mismo número.
 * Por eso la reserva se hace con un único UPDATE ... RETURNING, que en Postgres
 * bloquea la fila y resuelve la concurrencia dentro del motor. Dos ventas
 * simultáneas no pueden llevarse el mismo folio ni con la caja en dos equipos.
 */

export class FolioError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
    this.name = 'FolioError';
  }
}

export interface FolioAsignado {
  cafId: string;
  folio: number;
}

/**
 * Reserva el siguiente folio del CAF activo para ese tipo de documento.
 *
 * Debe llamarse DENTRO de la transacción de la venta: si la venta falla, el
 * folio se libera con el rollback y no queda un hueco en la numeración.
 * Devuelve null si no hay CAF disponible, para que quien llame decida si eso
 * bloquea la venta o sólo deja la boleta pendiente.
 */
export async function reservarFolio(
  tx: Prisma.TransactionClient,
  tipo: TipoDte,
): Promise<FolioAsignado | null> {
  // `siguiente <= hasta` en el WHERE evita pasarse del rango autorizado.
  // El folio devuelto es el valor previo al incremento.
  const filas = await tx.$queryRaw<Array<{ id: string; folio: number }>>`
    UPDATE "Caf"
       SET "siguiente" = "siguiente" + 1,
           "updatedAt" = NOW()
     WHERE "id" = (
       SELECT "id" FROM "Caf"
        WHERE "tipo" = ${tipo}::"TipoDte"
          AND "activo" = true
          AND "siguiente" <= "hasta"
          AND ("vencimiento" IS NULL OR "vencimiento" > NOW())
        ORDER BY "desde" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
     )
    RETURNING "id", "siguiente" - 1 AS "folio"
  `;

  const fila = filas[0];
  if (!fila) return null;

  return { cafId: fila.id, folio: Number(fila.folio) };
}

/** Folios que quedan disponibles por tipo, para avisar antes de quedarse sin. */
export async function foliosDisponibles(
  tx: Prisma.TransactionClient,
  tipo: TipoDte,
): Promise<number> {
  const cafs = await tx.caf.findMany({
    where: {
      tipo,
      activo: true,
      OR: [{ vencimiento: null }, { vencimiento: { gt: new Date() } }],
    },
    select: { desde: true, hasta: true, siguiente: true },
  });

  return cafs.reduce((total, c) => total + Math.max(0, c.hasta - c.siguiente + 1), 0);
}
