import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../db.ts';
import { agenda, iso, type CitaReservo } from '../../lib/reservo.ts';
import { sendMail } from '../../lib/notify.ts';
import { consentimientoEmail } from '../../lib/emails.ts';
import { env } from '../../env.ts';

/**
 * Sincronización de la agenda de Reservo y aplicación del protocolo de
 * consentimientos.
 *
 * El flujo son dos pasos deliberadamente separados:
 *   1. `sincronizarAgenda` — copia la agenda tal cual, sin efectos secundarios.
 *   2. `aplicarProtocolo`  — mira las citas ya guardadas y decide qué
 *      consentimientos faltan.
 *
 * Separarlos permite correr el sync seguido sin riesgo de mandar correos, y
 * revisar en la base qué haría el protocolo antes de dejarlo actuar solo.
 */

/** Identidad estable de una cita, ya que Reservo no expone un id propio. */
function claveDeCita(c: CitaReservo): string {
  const partes = [c.fecha, c.hora, c.idPaciente ?? c.rut ?? c.paciente, c.profesional, c.servicio];
  return createHash('sha1').update(partes.join('|')).digest('hex');
}

/** RUT sin puntos ni guion, K en mayúscula — misma normalización que el módulo de pacientes. */
function normalizarRut(rut: string | null | undefined): string | null {
  if (!rut) return null;
  const limpio = rut.replace(/[.\-\s]/g, '').toUpperCase();
  return limpio || null;
}

/** Minúsculas y sin tildes, para comparar servicios con los patrones de las reglas. */
export function normalizarTexto(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

/** Fecha YYYY-MM-DD → Date a medianoche local. */
function aFecha(f: string): Date {
  return new Date(`${f}T00:00:00`);
}

/** Date → DD/MM/AAAA, el formato que muestra el documento. */
function formatearFecha(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${m}/${d.getFullYear()}`;
}

export interface ResultadoSync {
  desde: string;
  hasta: string;
  recibidas: number;
  nuevas: number;
  actualizadas: number;
  archivadas: number;
}

/**
 * Trae la agenda de Reservo para el rango y la refleja en la tabla `Cita`.
 *
 * Idempotente: correrlo dos veces seguidas no duplica nada. Las citas que ya no
 * aparecen en la agenda de un día sincronizado se marcan `vigente = false` en
 * vez de borrarse, para no perder rastro de lo que hubo.
 */
export async function sincronizarAgenda(desde: string, hasta: string): Promise<ResultadoSync> {
  const citas = await agenda(desde, hasta);

  let nuevas = 0;
  let actualizadas = 0;
  const clavesPorDia = new Map<string, Set<string>>();

  for (const c of citas) {
    const clave = claveDeCita(c);
    const dia = c.fecha;
    if (!clavesPorDia.has(dia)) clavesPorDia.set(dia, new Set());
    clavesPorDia.get(dia)!.add(clave);

    const datos = {
      fecha:       aFecha(c.fecha),
      hora:        c.hora ?? '',
      paciente:    c.paciente ?? '',
      rut:         c.rut ?? null,
      rutNorm:     normalizarRut(c.rut),
      ficha:       c.ficha ?? null,
      idPaciente:  c.idPaciente ?? null,
      servicio:    c.servicio ?? '',
      comentario:  c.comentario ?? null,
      profesional: c.profesional ?? '',
      box:         c.box ?? null,
      contacto:    c.contacto ?? null,
      estado:      c.estado ?? '',
      estadoPago:  c.estadoPago ?? '',
      atendido:    Boolean(c.atendido),
      pagado:      Boolean(c.pagado),
      vigente:     true,
      sincronizadoAt: new Date(),
    };

    const previa = await prisma.cita.findUnique({
      where: { claveReservo: clave },
      select: { id: true },
    });

    if (previa) {
      await prisma.cita.update({ where: { claveReservo: clave }, data: datos });
      actualizadas++;
    } else {
      await prisma.cita.create({ data: { claveReservo: clave, ...datos } });
      nuevas++;
    }
  }

  // Archivar lo que desapareció de la agenda, día por día. Sólo tocamos días
  // que efectivamente vinieron en la respuesta: si Reservo falla y devuelve
  // vacío, no queremos archivar la agenda completa.
  let archivadas = 0;
  for (const [dia, claves] of clavesPorDia) {
    const r = await prisma.cita.updateMany({
      where: {
        fecha: aFecha(dia),
        vigente: true,
        claveReservo: { notIn: [...claves] },
      },
      data: { vigente: false },
    });
    archivadas += r.count;
  }

  return { desde, hasta, recibidas: citas.length, nuevas, actualizadas, archivadas };
}

export interface CitaSinConsentimiento {
  citaId: string;
  fecha: Date;
  hora: string;
  paciente: string;
  rut: string | null;
  contacto: string | null;
  servicio: string;
  profesional: string;
  consentId: string;
  consentTitulo: string;
  autoEnviar: boolean;
}

/**
 * Cruza las citas próximas con las reglas y devuelve las que necesitan un
 * consentimiento que todavía no existe.
 *
 * No escribe nada: sirve como panel para recepción ("estas citas van sin
 * consentimiento") y como insumo de `aplicarProtocolo`.
 */
export async function citasSinConsentimiento(diasAdelante = 14): Promise<CitaSinConsentimiento[]> {
  const hoy = aFecha(iso(new Date()));
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + diasAdelante);

  const [citas, reglas] = await Promise.all([
    prisma.cita.findMany({
      where: {
        vigente: true,
        fecha: { gte: hoy, lte: limite },
        // Una cita suspendida, borrada o a la que no llegó el paciente no
        // necesita consentimiento.
        estado: { notIn: ['Suspendió', 'Eliminado', 'No llegó'] },
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    }),
    prisma.reglaConsentimiento.findMany({
      where: { activo: true },
      include: { consent: { select: { id: true, title: true } } },
    }),
  ]);

  if (reglas.length === 0 || citas.length === 0) return [];

  // Un solo barrido de consentimientos vivos, indexado por RUT + plantilla:
  // evita una consulta por cita.
  const vivos = await prisma.signedConsent.findMany({
    where: { estado: { in: ['PENDIENTE', 'FIRMADO'] } },
    select: { rut: true, consentId: true },
  });
  const yaEmitidos = new Set(
    vivos
      .filter((v) => v.consentId)
      .map((v) => `${normalizarRut(v.rut)}::${v.consentId}`),
  );

  const pendientes: CitaSinConsentimiento[] = [];

  for (const cita of citas) {
    if (!cita.rutNorm) continue; // sin RUT no podemos cruzar ni emitir el documento

    const servicio = normalizarTexto(cita.servicio);
    const diasFaltantes = Math.round((cita.fecha.getTime() - hoy.getTime()) / 86_400_000);

    for (const regla of reglas) {
      if (!servicio.includes(normalizarTexto(regla.patron))) continue;
      // Fuera de la ventana de anticipación todavía no corresponde prepararlo.
      if (diasFaltantes > regla.diasAnticipacion) continue;
      if (yaEmitidos.has(`${cita.rutNorm}::${regla.consentId}`)) continue;

      pendientes.push({
        citaId:        cita.id,
        fecha:         cita.fecha,
        hora:          cita.hora,
        paciente:      cita.paciente,
        rut:           cita.rut,
        contacto:      cita.contacto,
        servicio:      cita.servicio,
        profesional:   cita.profesional,
        consentId:     regla.consentId,
        consentTitulo: regla.consent.title,
        autoEnviar:    regla.autoEnviar,
      });
    }
  }

  return pendientes;
}

/** Token secreto del enlace público — mismo formato que el módulo de consentimientos. */
function nuevoToken() {
  return randomBytes(24).toString('base64url');
}

function enlaceFirma(token: string) {
  return `${env.APP_URL.replace(/\/$/, '')}/firma/${token}`;
}

export interface ResultadoProtocolo {
  evaluadas: number;
  creados: number;
  enviados: number;
  omitidos: number;
}

/**
 * Crea los consentimientos que faltan para las citas próximas.
 *
 * Por defecto (`enviarCorreos = false`) deja el consentimiento en PENDIENTE sin
 * mandar nada: recepción lo revisa y lo envía desde la pantalla de Documentos.
 * El correo automático exige DOS condiciones — que la regla lo autorice
 * (`autoEnviar`) y que quien llama lo pida explícitamente.
 */
export async function aplicarProtocolo(opciones?: {
  diasAdelante?: number;
  enviarCorreos?: boolean;
  usuarioId?: string;
}): Promise<ResultadoProtocolo> {
  const { diasAdelante = 14, enviarCorreos = false, usuarioId } = opciones ?? {};
  const pendientes = await citasSinConsentimiento(diasAdelante);

  let creados = 0;
  let enviados = 0;
  let omitidos = 0;

  for (const p of pendientes) {
    const [plantilla, cita] = await Promise.all([
      prisma.consent.findUnique({ where: { id: p.consentId } }),
      prisma.cita.findUnique({ where: { id: p.citaId } }),
    ]);

    if (!plantilla || !cita) {
      omitidos++;
      continue;
    }

    const token = nuevoToken();
    // El enlace muere el día después de la cita: no tiene sentido firmar un
    // consentimiento para un procedimiento que ya ocurrió.
    const vence = new Date(cita.fecha);
    vence.setDate(vence.getDate() + 1);

    await prisma.signedConsent.create({
      data: {
        token,
        consentId:   plantilla.id,
        titulo:      plantilla.title,
        tratamiento: plantilla.treatment,
        snapshot: {
          introduction:       plantilla.introduction,
          beneficios:         plantilla.beneficios,
          efectosSecundarios: plantilla.efectosSecundarios,
          contraindicaciones: plantilla.contraindicaciones,
          cuidados:           plantilla.cuidados,
        },
        paciente:      cita.paciente,
        rut:           cita.rut ?? '',
        profesional:   cita.profesional,
        procedimiento: cita.servicio,
        telefono:      cita.contacto,
        fecha:         formatearFecha(cita.fecha),
        expiresAt:     vence,
        creadoPorId:   usuarioId ?? null,
      },
    });
    creados++;

    // Reservo entrega teléfono, no correo: hasta que exista un email confiable
    // del paciente, el envío automático no tiene destinatario y queda para que
    // recepción lo despache por WhatsApp desde la pantalla.
    if (enviarCorreos && p.autoEnviar) {
      const destino = correoDe(cita.contacto);
      if (!destino) {
        omitidos++;
        continue;
      }
      const tpl = consentimientoEmail({
        paciente:    cita.paciente,
        tratamiento: plantilla.treatment,
        profesional: cita.profesional,
        fecha:       formatearFecha(cita.fecha),
        enlace:      enlaceFirma(token),
      });
      if (await sendMail({ to: destino, ...tpl })) enviados++;
    }
  }

  return { evaluadas: pendientes.length, creados, enviados, omitidos };
}

/** El campo `contacto` de Reservo es un teléfono; sólo sirve si trae un correo. */
function correoDe(contacto: string | null): string | null {
  if (!contacto) return null;
  const m = contacto.match(/[^\s<>()]+@[^\s<>()]+\.[a-z]{2,}/i);
  return m ? m[0] : null;
}
