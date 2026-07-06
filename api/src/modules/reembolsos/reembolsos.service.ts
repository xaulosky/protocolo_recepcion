/**
 * Lógica de negocio de creación de solicitudes de reembolso, compartida entre la
 * ruta REST humana (POST /reembolsos) y el dispatcher de tools del Copiloto IA.
 */
import { prisma as db } from '../../db.ts';

export interface CreateReembolsoInput {
  paciente: string;
  rut?: string | null;
  telefono?: string | null;
  email?: string | null;
  fechaPago?: string | null;
  fechaSolicitud?: string | null;
  monto?: string | null;
  motivo: string;
  banco?: string | null;
  tipoCuenta?: string | null;
  cuenta?: string | null;
  titular?: string | null;
  urgente?: boolean;
}

export async function createReembolso(body: CreateReembolsoInput, creadoPorId: string) {
  const reembolso = await db.solicitudReembolso.create({
    data: { ...body, creadoPorId },
    include: { creadoPor: { select: { id: true, nombre: true } } },
  });

  await db.reembolsoActividad.create({
    data: { reembolsoId: reembolso.id, userId: creadoPorId, tipo: 'CREACION' },
  }).catch(() => {});

  // Crear tarea con todos los datos del reembolso
  const detalles = [
    `Paciente: ${body.paciente}`,
    body.rut            ? `RUT: ${body.rut}`                          : null,
    body.telefono       ? `Teléfono: ${body.telefono}`                : null,
    body.email          ? `Correo: ${body.email}`                     : null,
    body.fechaSolicitud ? `Fecha solicitud: ${body.fechaSolicitud}`   : null,
    body.fechaPago      ? `Fecha de pago: ${body.fechaPago}`          : null,
    body.monto          ? `Monto: ${body.monto}`                      : null,
    `Motivo: ${body.motivo}`,
    body.banco          ? `Banco: ${body.banco}`                      : null,
    body.tipoCuenta     ? `Tipo cuenta: ${body.tipoCuenta}`           : null,
    body.cuenta         ? `N° cuenta: ${body.cuenta}`                 : null,
    body.titular        ? `Titular: ${body.titular}`                  : null,
    body.urgente        ? `URGENTE`                                   : null,
  ].filter(Boolean).join('\n');

  try {
    await db.task.create({
      data: {
        tipo: 'Reembolso',
        descripcion: detalles,
        paciente: body.paciente,
        prioridad: body.urgente ? 'URGENTE' : 'NORMAL',
        tags: ['reembolso'],
        creadoPorId,
      },
    });
  } catch (err) {
    console.error('[reembolsos.service] No se pudo crear la tarea para el reembolso', err);
  }

  return reembolso;
}
