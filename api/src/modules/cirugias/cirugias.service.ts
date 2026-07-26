/**
 * Lógica de negocio del módulo de cirugías, compartida entre las rutas REST
 * humanas (`cirugias.routes.ts`) y el dispatcher de tools del Copiloto IA —
 * evita que ambos caminos diverjan (ej. que uno registre la actividad en el
 * timeline y el otro no).
 */
import type { EtapaCirugia, PresupuestoEstado, InsumoTipo, CanalComunicacion, MetodoPago } from '@prisma/client';
import { prisma } from '../../db.ts';

export interface CreateCirugiaInput {
  paciente: string;
  tipo: string;
  telefono?: string | null;
  email?: string | null;
  notas?: string | null;
  fechaCirugia?: string | null;
  professionalId?: string | null;
}

export interface UpdateCirugiaInput {
  paciente?: string;
  tipo?: string;
  telefono?: string | null;
  email?: string | null;
  notas?: string | null;
  etapa?: EtapaCirugia;
  fechaCirugia?: string | null;
  professionalId?: string | null;
}

export interface PresupuestoInput {
  monto: number;
  descuento: number;
  estado: PresupuestoEstado;
  enviadoAt?: string | null;
  notas?: string | null;
}

export interface AbonoInput {
  monto: number;
  metodo: MetodoPago;
  fecha?: string | null;
  notas?: string | null;
}

export interface InsumoInput {
  tipo: InsumoTipo;
  nombre: string;
  productId?: number | null;
  cantidad: number;
  unidad?: string | null;
}

export interface InsumoUpdateInput {
  nombre?: string;
  cantidad?: number;
  unidad?: string | null;
  listo?: boolean;
}

export interface ComunicacionInput {
  canal: CanalComunicacion;
  descripcion: string;
}

export const cirugiaIncludeListado = {
  professional:  { select: { id: true, nombreCompleto: true, especialidad: true } },
  creadoPor:     { select: { id: true, nombre: true } },
  presupuesto:   { select: { estado: true, monto: true, descuento: true } },
  abonos:        { select: { monto: true } },
  _count:        { select: { tareas: true, insumos: true } },
} as const;

export const cirugiaIncludeDetalle = {
  professional:  { select: { id: true, nombreCompleto: true, especialidad: true } },
  creadoPor:     { select: { id: true, nombre: true } },
  presupuesto:   true,
  abonos: {
    orderBy: { fecha: 'desc' as const },
    include: { registradoPor: { select: { id: true, nombre: true } } },
  },
  insumos:       { orderBy: { createdAt: 'asc' as const } },
  comunicaciones: {
    orderBy: { createdAt: 'desc' as const },
    include: { usuario: { select: { id: true, nombre: true } } },
  },
  actividad: {
    orderBy: { createdAt: 'desc' as const },
    include: { usuario: { select: { nombre: true } } },
  },
  tareas: {
    include: {
      asignadas: { select: { id: true, nombre: true } },
      creadoPor: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

/** Reemplaza la lista de abonos por su total, para no engordar el listado. */
export function conAbonado<T extends { abonos: { monto: number }[] }>({ abonos, ...c }: T) {
  return { ...c, abonado: abonos.reduce((s, a) => s + a.monto, 0) };
}

export const ETAPA_ES: Record<string, string> = {
  EVALUACION: 'Evaluación', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
  CONFIRMADO: 'Confirmado', PREPARACION: 'Preparación',
  EN_EJECUCION: 'En ejecución', POST_OPERATORIO: 'Post-operatorio',
  CERRADO: 'Cerrado',
};

export const PRES_ES: Record<string, string> = {
  PENDIENTE: 'pendiente', APROBADO: 'aprobado', RECHAZADO: 'rechazado',
};

export const METODO_ES: Record<string, string> = {
  EFECTIVO: 'efectivo', TARJETA: 'tarjeta', TRANSFERENCIA: 'transferencia',
};

export async function logCirugiaActividad(cirugiaId: string, usuarioId: string, tipo: string, descripcion: string, datos?: object) {
  await prisma.cirugiaActividad.create({ data: { cirugiaId, usuarioId, tipo, descripcion, datos } });
}

/** Toca `updatedAt` para que la cirugía suba en el listado tras un cambio anidado. */
function tocar(cirugiaId: string) {
  return prisma.cirugia.update({ where: { id: cirugiaId }, data: {} });
}

export async function listCirugias(
  filtros: { etapa?: EtapaCirugia; q?: string; professionalId?: string },
) {
  const where = {
    ...(filtros.etapa          ? { etapa: filtros.etapa }                                            : {}),
    ...(filtros.q              ? { paciente: { contains: filtros.q, mode: 'insensitive' as const } } : {}),
    ...(filtros.professionalId ? { professionalId: filtros.professionalId }                          : {}),
  };
  const cirugias = await prisma.cirugia.findMany({
    where, include: cirugiaIncludeListado, orderBy: { updatedAt: 'desc' },
  });
  return cirugias.map(conAbonado);
}

export function getCirugiaDetalle(id: string) {
  return prisma.cirugia.findUnique({ where: { id }, include: cirugiaIncludeDetalle });
}

export async function createCirugia(input: CreateCirugiaInput, userId: string) {
  return prisma.cirugia.create({
    data: {
      ...input,
      fechaCirugia: input.fechaCirugia ? new Date(input.fechaCirugia) : null,
      creadoPorId: userId,
    },
    include: cirugiaIncludeListado,
  });
}

export async function updateCirugia(id: string, input: UpdateCirugiaInput, userId: string) {
  const anterior = await prisma.cirugia.findUnique({ where: { id }, select: { etapa: true } });
  const etapaCambio = !!(anterior && input.etapa && input.etapa !== anterior.etapa);

  const cirugia = await prisma.cirugia.update({
    where: { id },
    data: {
      ...input,
      fechaCirugia: input.fechaCirugia !== undefined
        ? (input.fechaCirugia ? new Date(input.fechaCirugia) : null)
        : undefined,
      ...(etapaCambio ? { etapaCambiadaAt: new Date() } : {}),
    },
    include: cirugiaIncludeListado,
  });

  if (etapaCambio) {
    await logCirugiaActividad(id, userId, 'ETAPA',
      `Etapa: ${ETAPA_ES[anterior!.etapa]} → ${ETAPA_ES[input.etapa!]}`,
      { de: anterior!.etapa, a: input.etapa },
    );
  }
  return cirugia;
}

export async function upsertPresupuesto(cirugiaId: string, input: PresupuestoInput, userId: string) {
  const anterior = await prisma.presupuesto.findUnique({
    where: { cirugiaId }, select: { estado: true, monto: true },
  });

  const { enviadoAt, ...rest } = input;
  const enviadoAtDate = enviadoAt ? new Date(enviadoAt) : null;

  const presupuesto = await prisma.presupuesto.upsert({
    where:  { cirugiaId },
    update: { ...rest, enviadoAt: enviadoAt !== undefined ? enviadoAtDate : undefined },
    create: { ...rest, cirugiaId, enviadoAt: enviadoAtDate },
  });
  await tocar(cirugiaId);

  const estadoCambio = !anterior || anterior.estado !== input.estado;
  const montoCambio  = !!anterior && anterior.monto !== input.monto;
  if (estadoCambio || montoCambio) {
    const partes: string[] = [];
    if (estadoCambio) partes.push(`Estado: ${PRES_ES[input.estado]}`);
    if (montoCambio) partes.push(`Monto: $${input.monto.toLocaleString('es-CL')}`);
    await logCirugiaActividad(cirugiaId, userId, 'PRESUPUESTO', `Presupuesto — ${partes.join(', ')}`,
      { estado: input.estado, monto: input.monto },
    );
  }
  return presupuesto;
}

export async function addAbono(cirugiaId: string, input: AbonoInput, userId: string) {
  const { fecha, ...rest } = input;
  const abono = await prisma.cirugiaAbono.create({
    data: { ...rest, cirugiaId, fecha: fecha ? new Date(fecha) : new Date(), registradoPorId: userId },
    include: { registradoPor: { select: { id: true, nombre: true } } },
  });
  await tocar(cirugiaId);
  await logCirugiaActividad(cirugiaId, userId, 'ABONO',
    `Abono de $${abono.monto.toLocaleString('es-CL')} (${METODO_ES[abono.metodo]})`,
    { monto: abono.monto, metodo: abono.metodo },
  );
  return abono;
}

/** Devuelve null si el abono no existe. */
export async function deleteAbono(cirugiaId: string, abonoId: string, userId: string) {
  const abono = await prisma.cirugiaAbono.findUnique({ where: { id: abonoId }, select: { monto: true } });
  if (!abono) return null;
  await prisma.cirugiaAbono.delete({ where: { id: abonoId } });
  await logCirugiaActividad(cirugiaId, userId, 'ABONO', `Abono de $${abono.monto.toLocaleString('es-CL')} eliminado`);
  return abono;
}

export async function addInsumo(cirugiaId: string, input: InsumoInput) {
  const insumo = await prisma.cirugiaInsumo.create({ data: { ...input, cirugiaId } });
  await tocar(cirugiaId);
  return insumo;
}

export async function updateInsumo(cirugiaId: string, insumoId: string, input: InsumoUpdateInput, userId: string) {
  const anterior = await prisma.cirugiaInsumo.findUnique({
    where: { id: insumoId }, select: { listo: true, nombre: true },
  });
  const insumo = await prisma.cirugiaInsumo.update({ where: { id: insumoId }, data: input });

  if (anterior && typeof input.listo === 'boolean' && input.listo !== anterior.listo) {
    await logCirugiaActividad(cirugiaId, userId, 'INSUMO',
      `${input.listo ? '✓' : '○'} "${anterior.nombre}" marcado como ${input.listo ? 'listo' : 'pendiente'}`,
    );
  }
  return insumo;
}

export function deleteInsumo(insumoId: string) {
  return prisma.cirugiaInsumo.delete({ where: { id: insumoId } });
}

export async function addComunicacion(cirugiaId: string, input: ComunicacionInput, userId: string) {
  const comunicacion = await prisma.comunicacionLog.create({
    data: { ...input, cirugiaId, usuarioId: userId },
    include: { usuario: { select: { id: true, nombre: true } } },
  });
  await tocar(cirugiaId);
  return comunicacion;
}

/** Ficha de profesional asociada al usuario (los PROFESIONAL solo ven sus cirugías). */
export async function professionalIdDeUsuario(userId: string): Promise<string | undefined> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { professionalId: true } });
  return u?.professionalId ?? undefined;
}
