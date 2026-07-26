import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EtapaCirugia, PresupuestoEstado, InsumoTipo, CanalComunicacion, MetodoPago, Role } from '@prisma/client';
import { prisma } from '../../db.ts';
import {
  listCirugias, getCirugiaDetalle, createCirugia, updateCirugia,
  upsertPresupuesto, addAbono, deleteAbono,
  addInsumo, updateInsumo, deleteInsumo, addComunicacion,
  professionalIdDeUsuario, conAbonado,
} from './cirugias.service.ts';

export const createSchema = z.object({
  paciente:      z.string().min(1),
  tipo:          z.string().min(1),
  telefono:      z.string().optional().nullable(),
  email:         z.string().optional().nullable(),
  notas:         z.string().optional().nullable(),
  fechaCirugia:  z.string().datetime({ offset: true }).optional().nullable(),
  professionalId: z.string().optional().nullable(),
});

export const updateSchema = z.object({
  paciente:      z.string().min(1).optional(),
  tipo:          z.string().min(1).optional(),
  telefono:      z.string().optional().nullable(),
  email:         z.string().optional().nullable(),
  notas:         z.string().optional().nullable(),
  etapa:         z.nativeEnum(EtapaCirugia).optional(),
  fechaCirugia:  z.string().datetime({ offset: true }).optional().nullable(),
  professionalId: z.string().optional().nullable(),
});

export const presupuestoSchema = z.object({
  monto:     z.number().int().min(0),
  descuento: z.number().int().min(0).max(100).default(0),
  estado:    z.nativeEnum(PresupuestoEstado).default(PresupuestoEstado.PENDIENTE),
  enviadoAt: z.string().datetime({ offset: true }).optional().nullable(),
  notas:     z.string().optional().nullable(),
});

export const insumoCreateSchema = z.object({
  tipo:      z.nativeEnum(InsumoTipo),
  nombre:    z.string().min(1),
  productId: z.number().int().optional().nullable(),
  cantidad:  z.number().int().min(1).default(1),
  unidad:    z.string().optional().nullable(),
});

export const insumoUpdateSchema = z.object({
  nombre:   z.string().min(1).optional(),
  cantidad: z.number().int().min(1).optional(),
  unidad:   z.string().optional().nullable(),
  listo:    z.boolean().optional(),
});

export const comunicacionSchema = z.object({
  canal:       z.nativeEnum(CanalComunicacion),
  descripcion: z.string().min(1),
});

export const abonoSchema = z.object({
  monto:  z.number().int().min(1),
  metodo: z.nativeEnum(MetodoPago).default(MetodoPago.EFECTIVO),
  fecha:  z.string().datetime({ offset: true }).optional().nullable(),
  notas:  z.string().optional().nullable(),
});

export async function cirugiasRoutes(app: FastifyInstance) {
  const canWrite = { preHandler: app.authorize([Role.ADMIN, Role.RECEPCION]) };

  // GET /cirugias
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { etapa, q, professionalId } = req.query as { etapa?: string; q?: string; professionalId?: string };

    // Un PROFESIONAL solo ve las cirugías de su propia ficha.
    const proFilter = req.user.role === Role.PROFESIONAL
      ? await professionalIdDeUsuario(req.user.sub)
      : undefined;

    const cirugias = await listCirugias({
      etapa: etapa as EtapaCirugia | undefined,
      q,
      professionalId: proFilter ?? professionalId,
    });
    return { cirugias };
  });

  // POST /cirugias
  app.post('/', canWrite, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const cirugia = await createCirugia(parsed.data, req.user.sub);
    return reply.code(201).send({ cirugia: conAbonado(cirugia) });
  });

  // GET /cirugias/:id
  app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const cirugia = await getCirugiaDetalle(id);
    if (!cirugia) return reply.code(404).send({ error: 'Cirugía no encontrada' });

    if (req.user.role === Role.PROFESIONAL) {
      const propio = await professionalIdDeUsuario(req.user.sub);
      if (cirugia.professionalId !== propio) return reply.code(403).send({ error: 'Sin acceso' });
    }

    return { cirugia };
  });

  // PATCH /cirugias/:id
  app.patch('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const cirugia = await updateCirugia(id, parsed.data, req.user.sub);
    return { cirugia: conAbonado(cirugia) };
  });

  // DELETE /cirugias/:id
  app.delete('/:id', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.cirugia.delete({ where: { id } });
    return reply.code(204).send();
  });

  // PUT /cirugias/:id/presupuesto
  app.put('/:id/presupuesto', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = presupuestoSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const presupuesto = await upsertPresupuesto(id, parsed.data, req.user.sub);
    return { presupuesto };
  });

  // POST /cirugias/:id/abonos
  app.post('/:id/abonos', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = abonoSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', detalles: parsed.error.flatten() });

    const abono = await addAbono(id, parsed.data, req.user.sub);
    return reply.code(201).send({ abono });
  });

  // DELETE /cirugias/:id/abonos/:abonoId
  app.delete('/:id/abonos/:abonoId', canWrite, async (req, reply) => {
    const { id, abonoId } = req.params as { id: string; abonoId: string };
    const abono = await deleteAbono(id, abonoId, req.user.sub);
    if (!abono) return reply.code(404).send({ error: 'Abono no encontrado' });
    return reply.code(204).send();
  });

  // POST /cirugias/:id/insumos
  app.post('/:id/insumos', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = insumoCreateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const insumo = await addInsumo(id, parsed.data);
    return reply.code(201).send({ insumo });
  });

  // PATCH /cirugias/:id/insumos/:insumoId
  app.patch('/:id/insumos/:insumoId', canWrite, async (req, reply) => {
    const { id, insumoId } = req.params as { id: string; insumoId: string };
    const parsed = insumoUpdateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const insumo = await updateInsumo(id, insumoId, parsed.data, req.user.sub);
    return { insumo };
  });

  // DELETE /cirugias/:id/insumos/:insumoId
  app.delete('/:id/insumos/:insumoId', canWrite, async (req, reply) => {
    const { insumoId } = req.params as { id: string; insumoId: string };
    await deleteInsumo(insumoId);
    return reply.code(204).send();
  });

  // POST /cirugias/:id/comunicaciones
  app.post('/:id/comunicaciones', canWrite, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = comunicacionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });

    const comunicacion = await addComunicacion(id, parsed.data, req.user.sub);
    return reply.code(201).send({ comunicacion });
  });

  // DELETE /cirugias/:id/comunicaciones/:logId
  app.delete('/:id/comunicaciones/:logId', canWrite, async (req, reply) => {
    const { logId } = req.params as { id: string; logId: string };
    await prisma.comunicacionLog.delete({ where: { id: logId } });
    return reply.code(204).send();
  });
}
