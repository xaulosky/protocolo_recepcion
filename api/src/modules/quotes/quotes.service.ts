/**
 * Lógica de negocio de creación de presupuestos, compartida entre la ruta REST
 * humana (POST /quotes) y el dispatcher de tools del Copiloto IA.
 */
import type { Prisma } from '@prisma/client';
import { prisma as db } from '../../db.ts';

export interface QuoteItemInput {
  nombre: string;
  cat: string;
  precio: number;
  cantidad: number;
}

export interface CreateQuoteInput {
  paciente: string;
  rut?: string | null;
  telefono?: string | null;
  email?: string | null;
  items: QuoteItemInput[];
  descuento?: number;
  notas?: string | null;
}

export async function createQuote(body: CreateQuoteInput, creadoPorId: string) {
  const descuento = body.descuento ?? 0;
  const subtotal = body.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
  const total = Math.round(subtotal * (1 - descuento / 100));
  return db.quote.create({
    data: {
      ...body,
      descuento,
      items: body.items as unknown as Prisma.InputJsonValue,
      subtotal,
      total,
      creadoPorId,
    },
    include: { creadoPor: { select: { id: true, nombre: true } } },
  });
}
