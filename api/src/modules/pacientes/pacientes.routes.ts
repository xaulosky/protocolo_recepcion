import type { FastifyInstance } from 'fastify';
import { prisma } from '../../db.ts';

/**
 * Módulo Pacientes — vista consolidada del paciente.
 *
 * Por ahora la clínica no tiene un registro central de pacientes: los datos
 * viven dispersos en los consentimientos firmados, reembolsos, presupuestos, etc.
 * Este módulo agrupa a los pacientes a partir de los consentimientos (SignedConsent)
 * usando el RUT normalizado como clave, y expone su historial.
 *
 * A futuro: sumar citas, historial de atenciones y ficha clínica. La forma de la
 * respuesta ({ paciente, consentimientos }) está pensada para crecer con más
 * secciones sin romper el frontend.
 */

/** Normaliza un RUT para agrupar: quita puntos, guiones y espacios; K en mayúscula. */
function normalizarRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

const seleccionConsentimiento = {
  id: true, token: true, titulo: true, tratamiento: true,
  paciente: true, rut: true, profesional: true, procedimiento: true,
  telefono: true, email: true, fecha: true, estado: true,
  firmadoAt: true, createdAt: true, emailEnviadoAt: true,
  firmaManual: true, expiresAt: true,
  creadoPor: { select: { id: true, nombre: true } },
} as const;

interface PacienteAcc {
  id: string;
  rut: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  total: number;
  firmados: number;
  pendientes: number;
  anulados: number;
  ultimaActividad: Date;
}

export async function pacientesRoutes(app: FastifyInstance) {
  // GET /pacientes?q= — lista de pacientes agrupados por RUT (desde consentimientos)
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const { q } = req.query as { q?: string };

    // Ordenadas desc: la primera aparición de cada RUT es la más reciente → datos canónicos.
    const firmas = await prisma.signedConsent.findMany({
      select: {
        paciente: true, rut: true, telefono: true, email: true,
        estado: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const map = new Map<string, PacienteAcc>();
    for (const f of firmas) {
      const key = normalizarRut(f.rut);
      if (!key) continue;
      let p = map.get(key);
      if (!p) {
        p = {
          id: key, rut: f.rut, nombre: f.paciente,
          telefono: f.telefono ?? null, email: f.email ?? null,
          total: 0, firmados: 0, pendientes: 0, anulados: 0,
          ultimaActividad: f.createdAt,
        };
        map.set(key, p);
      }
      p.total++;
      if (f.estado === 'FIRMADO') p.firmados++;
      else if (f.estado === 'PENDIENTE') p.pendientes++;
      else if (f.estado === 'ANULADO') p.anulados++;
      // Completa contacto con el primer valor no vacío que aparezca (más reciente primero).
      if (!p.telefono && f.telefono) p.telefono = f.telefono;
      if (!p.email && f.email) p.email = f.email;
      if (f.createdAt > p.ultimaActividad) p.ultimaActividad = f.createdAt;
    }

    let pacientes = [...map.values()].sort(
      (a, b) => b.ultimaActividad.getTime() - a.ultimaActividad.getTime(),
    );

    if (q && q.trim()) {
      const needle = q.trim().toLowerCase();
      const needleRut = normalizarRut(q).toLowerCase();
      pacientes = pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(needle) ||
          normalizarRut(p.rut).toLowerCase().includes(needleRut),
      );
    }

    return { pacientes };
  });

  // GET /pacientes/:rut — detalle del paciente + historial de consentimientos
  app.get('/:rut', { preHandler: app.authenticate }, async (req, reply) => {
    const { rut } = req.params as { rut: string };
    const clave = normalizarRut(decodeURIComponent(rut));
    if (!clave) return reply.code(400).send({ error: 'RUT inválido' });

    const todas = await prisma.signedConsent.findMany({
      select: seleccionConsentimiento,
      orderBy: { createdAt: 'desc' },
    });
    const consentimientos = todas.filter((f) => normalizarRut(f.rut) === clave);

    if (consentimientos.length === 0) {
      return reply.code(404).send({ error: 'Paciente no encontrado' });
    }

    // Datos canónicos: el consentimiento más reciente + primer contacto no vacío.
    const reciente = consentimientos[0];
    const telefono = consentimientos.find((c) => c.telefono)?.telefono ?? null;
    const email = consentimientos.find((c) => c.email)?.email ?? null;

    return {
      paciente: {
        id: clave,
        rut: reciente.rut,
        nombre: reciente.paciente,
        telefono,
        email,
      },
      consentimientos,
    };
  });
}
