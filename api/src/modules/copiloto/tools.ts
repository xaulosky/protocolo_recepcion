/**
 * Definición de las tools (function-calling) del Copiloto IA + dispatcher que las
 * ejecuta. Cada tool reusa el mismo schema zod y la misma lógica de negocio
 * (services) que su ruta REST humana equivalente — nunca duplica reglas.
 *
 * Seguridad: ctx.userId/ctx.role vienen SIEMPRE del JWT verificado (nunca de lo
 * que diga el LLM). Salvo en el módulo de cirugías, ninguna tool puede eliminar
 * ni cambiar el estado de registros existentes: solo crea registros nuevos o
 * consulta datos de solo lectura.
 *
 * Cirugías es la excepción deliberada: el copiloto gestiona el ciclo completo
 * (etapa, presupuesto, abonos, insumos, comunicaciones) con los mismos permisos
 * que la UI (ADMIN/RECEPCION escriben, PROFESIONAL solo lee lo suyo) y dejando
 * la misma huella en el timeline de actividad. Lo único que NO puede hacer es
 * eliminar una cirugía completa: se lleva por cascada presupuesto, abonos,
 * insumos e historial, y eso no se puede deshacer.
 */
import { Role, type Etapa, type ReembolsoEstado, type EtapaCirugia } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';
import {
  listCirugias, getCirugiaDetalle, createCirugia, updateCirugia,
  upsertPresupuesto, addAbono, addInsumo, updateInsumo, deleteInsumo, addComunicacion,
  professionalIdDeUsuario, ETAPA_ES,
} from '../cirugias/cirugias.service.ts';
import {
  createSchema as cirugiaCreateSchema,
  updateSchema as cirugiaUpdateSchema,
  presupuestoSchema as cirugiaPresupuestoSchema,
  abonoSchema as cirugiaAbonoSchema,
  insumoCreateSchema as cirugiaInsumoSchema,
  comunicacionSchema as cirugiaComunicacionSchema,
} from '../cirugias/cirugias.routes.ts';
import { createTask } from '../tasks/tasks.service.ts';
import { createSchema as taskCreateSchema } from '../tasks/tasks.routes.ts';
import { createReembolso } from '../reembolsos/reembolsos.service.ts';
import { createSchema as reembolsoCreateSchema } from '../reembolsos/reembolsos.routes.ts';
import { createQuote } from '../quotes/quotes.service.ts';
import { createSchema as quoteCreateSchema } from '../quotes/quotes.routes.ts';
import { saveUserDocument, TIPOS as DOCUMENTO_TIPOS } from '../documentos/documentos.service.ts';
import { inviteUser } from '../users/users.service.ts';
import type { ToolDef } from './deepseek.ts';

export interface ArchivoAdjunto {
  buf: Buffer;
  filename: string;
  mime: string;
}

export interface ToolContext {
  userId: string;
  role: Role;
  archivoAdjunto?: ArchivoAdjunto | null;
}

const ETAPAS_CIRUGIA = [
  'EVALUACION', 'PRESUPUESTO_ENVIADO', 'CONFIRMADO', 'PREPARACION',
  'EN_EJECUCION', 'POST_OPERATORIO', 'CERRADO',
];

export const TOOLS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'crear_tarea',
      description: 'Crea y asigna una tarea a uno o más usuarios del equipo.',
      parameters: {
        type: 'object',
        properties: {
          tipo: { type: 'string', description: 'Tipo o categoría breve de la tarea, ej. "Seguimiento", "Llamada".' },
          descripcion: { type: 'string', description: 'Descripción detallada de qué hay que hacer.' },
          paciente: { type: 'string', description: 'Nombre del paciente relacionado, si aplica.' },
          prioridad: { type: 'string', enum: ['BAJA', 'NORMAL', 'URGENTE'], description: 'Prioridad de la tarea.' },
          asignadasNombres: { type: 'array', items: { type: 'string' }, description: 'Nombres de las personas a quienes asignar la tarea.' },
          dueAt: { type: 'string', description: 'Fecha límite en formato ISO 8601 con hora, si se menciona.' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Etiquetas cortas relacionadas.' },
        },
        required: ['tipo', 'descripcion'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_reembolso',
      description: 'Registra una solicitud de reembolso de un paciente.',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string' },
          rut: { type: 'string' },
          telefono: { type: 'string' },
          email: { type: 'string' },
          fechaPago: { type: 'string', description: 'Fecha del pago original, texto libre.' },
          fechaSolicitud: { type: 'string', description: 'Fecha en que el paciente solicitó el reembolso.' },
          monto: { type: 'string', description: 'Monto a reembolsar, texto libre (ej. "$150.000").' },
          motivo: { type: 'string', description: 'Motivo del reembolso.' },
          banco: { type: 'string' },
          tipoCuenta: { type: 'string', enum: ['Corriente', 'Vista / RUT', 'Ahorro', 'Empresa'] },
          cuenta: { type: 'string', description: 'Número de cuenta.' },
          titular: { type: 'string', description: 'Nombre del titular de la cuenta, si difiere del paciente.' },
          urgente: { type: 'boolean' },
        },
        required: ['paciente', 'motivo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_presupuesto',
      description: 'Crea un presupuesto (cotización) para un paciente con ítems, precios y descuento.',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string' },
          rut: { type: 'string' },
          telefono: { type: 'string' },
          email: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nombre: { type: 'string' },
                cat: { type: 'string', description: 'Categoría del ítem, ej. "Láser", "Botox".' },
                precio: { type: 'number', description: 'Precio unitario en pesos chilenos.' },
                cantidad: { type: 'number' },
              },
              required: ['nombre', 'cat', 'precio', 'cantidad'],
            },
          },
          descuento: { type: 'number', description: 'Porcentaje de descuento, de 0 a 100.' },
          notas: { type: 'string' },
        },
        required: ['paciente', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'consultar_tareas',
      description: 'Busca tareas existentes en el sistema (solo lectura).',
      parameters: {
        type: 'object',
        properties: {
          etapa: { type: 'string', enum: ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'REVISION', 'CERRADO'] },
          q: { type: 'string', description: 'Texto de búsqueda libre (descripción, paciente o tipo).' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'consultar_reembolsos',
      description: 'Busca solicitudes de reembolso existentes (solo lectura).',
      parameters: {
        type: 'object',
        properties: {
          estado: { type: 'string', enum: ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO'] },
          q: { type: 'string', description: 'Texto de búsqueda libre (paciente o motivo).' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_catalogo',
      description: 'Busca profesionales o tratamientos del catálogo clínico (solo lectura).',
      parameters: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: ['profesionales', 'tratamientos'], description: 'Qué catálogo buscar.' },
          q: { type: 'string', description: 'Texto de búsqueda (nombre, especialidad o categoría).' },
        },
        required: ['tipo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'invitar_usuarios',
      description: 'Crea cuentas nuevas en el sistema para una o varias personas y les envía por correo una invitación con un enlace para que cada una cree su propia contraseña. Solo administradores. Crear una cuenta con rol ADMIN requiere confirmación explícita previa del usuario.',
      parameters: {
        type: 'object',
        properties: {
          usuarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nombre: { type: 'string', description: 'Nombre y apellido de la persona.' },
                email: { type: 'string', description: 'Correo electrónico (será su usuario).' },
                rol: { type: 'string', enum: ['ADMIN', 'RECEPCION', 'PROFESIONAL', 'LECTURA'], description: 'Rol en el sistema. Por defecto RECEPCION. ADMIN solo tras confirmación explícita del usuario.' },
                profesionalVinculado: { type: 'string', description: 'Nombre (o parte del nombre) del profesional de la clínica para vincular la cuenta con su ficha clínica, si corresponde. Independiente del rol.' },
              },
              required: ['nombre', 'email'],
            },
          },
        },
        required: ['usuarios'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'registrar_documento',
      description: 'Guarda el archivo adjunto de este mensaje como documento de un usuario. Requiere que el usuario haya adjuntado un archivo en este mismo mensaje.',
      parameters: {
        type: 'object',
        properties: {
          nombreUsuarioDestino: { type: 'string', description: 'Nombre (o parte del nombre) del usuario dueño del documento.' },
          tipo: { type: 'string', enum: DOCUMENTO_TIPOS as unknown as string[] },
          titulo: { type: 'string', description: 'Título descriptivo del documento.' },
          periodo: { type: 'string', description: 'Período en formato YYYY-MM, si aplica (ej. liquidaciones).' },
        },
        required: ['nombreUsuarioDestino', 'tipo', 'titulo'],
      },
    },
  },

  // ─────────────────────────── Cirugías ───────────────────────────
  // Todas identifican la cirugía por `paciente` (búsqueda parcial) o por
  // `cirugiaId` si ya se conoce de una consulta previa.
  {
    type: 'function',
    function: {
      name: 'consultar_cirugias',
      description: 'Lista las cirugías registradas, con su etapa, profesional, fecha, presupuesto y cuánto lleva abonado el paciente (solo lectura).',
      parameters: {
        type: 'object',
        properties: {
          etapa: { type: 'string', enum: ETAPAS_CIRUGIA, description: 'Filtrar por etapa del pipeline.' },
          paciente: { type: 'string', description: 'Nombre (o parte) del paciente.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'ver_cirugia',
      description: 'Muestra el detalle completo de una cirugía: datos del paciente, etapa, presupuesto, saldo pendiente, abonos, insumos, tareas, comunicaciones e historial (solo lectura).',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string', description: 'Nombre (o parte) del paciente.' },
          cirugiaId: { type: 'string', description: 'ID exacto de la cirugía, si ya lo conoces.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_cirugia',
      description: 'Registra una cirugía nueva en el pipeline (queda en etapa Evaluación).',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string', description: 'Nombre completo del paciente.' },
          tipo: { type: 'string', description: 'Tipo de cirugía, ej. "Rinoplastia", "Blefaroplastia".' },
          telefono: { type: 'string' },
          email: { type: 'string' },
          notas: { type: 'string' },
          fechaCirugia: { type: 'string', description: 'Fecha y hora de la cirugía en ISO 8601, si ya está definida.' },
          profesional: { type: 'string', description: 'Nombre (o parte) del profesional a cargo.' },
        },
        required: ['paciente', 'tipo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'actualizar_cirugia',
      description: 'Modifica una cirugía existente: mover de etapa, cambiar fecha, profesional, datos de contacto o notas. Solo se cambian los campos que indiques.',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string', description: 'Nombre (o parte) del paciente para identificar la cirugía.' },
          cirugiaId: { type: 'string', description: 'ID exacto de la cirugía, si ya lo conoces.' },
          etapa: { type: 'string', enum: ETAPAS_CIRUGIA, description: 'Nueva etapa del pipeline.' },
          nuevoPaciente: { type: 'string', description: 'Corregir el nombre del paciente.' },
          tipo: { type: 'string', description: 'Nuevo tipo de cirugía.' },
          telefono: { type: 'string' },
          email: { type: 'string' },
          notas: { type: 'string' },
          fechaCirugia: { type: 'string', description: 'Nueva fecha y hora en ISO 8601.' },
          profesional: { type: 'string', description: 'Nombre (o parte) del profesional a cargo.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'registrar_presupuesto_cirugia',
      description: 'Define o actualiza el presupuesto de una cirugía (monto, descuento y estado). Reemplaza el presupuesto anterior si ya existía.',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string' },
          cirugiaId: { type: 'string' },
          monto: { type: 'number', description: 'Valor base en pesos chilenos, sin descuento.' },
          descuento: { type: 'number', description: 'Porcentaje de descuento, de 0 a 100.' },
          estado: { type: 'string', enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO'] },
          notas: { type: 'string', description: 'Qué incluye o excluye, condiciones.' },
        },
        required: ['monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'registrar_abono_cirugia',
      description: 'Registra un pago (abono) del paciente a su cirugía y recalcula el saldo pendiente.',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string' },
          cirugiaId: { type: 'string' },
          monto: { type: 'number', description: 'Monto abonado en pesos chilenos.' },
          metodo: { type: 'string', enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] },
          fecha: { type: 'string', description: 'Fecha del pago en ISO 8601. Si se omite, se usa hoy.' },
          notas: { type: 'string', description: 'Nº de comprobante, quién pagó, etc.' },
        },
        required: ['monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'gestionar_insumos_cirugia',
      description: 'Agrega insumos o instrumental a la checklist de una cirugía, o los marca como listos o pendientes.',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string' },
          cirugiaId: { type: 'string' },
          accion: { type: 'string', enum: ['agregar', 'marcar_listo', 'marcar_pendiente', 'eliminar'], description: 'Qué hacer con el insumo.' },
          nombre: { type: 'string', description: 'Nombre del insumo. Al agregar es obligatorio; en el resto identifica cuál de la lista.' },
          tipo: { type: 'string', enum: ['INSUMO', 'INSTRUMENTAL'], description: 'Solo al agregar. Por defecto INSUMO.' },
          cantidad: { type: 'number', description: 'Solo al agregar. Por defecto 1.' },
          unidad: { type: 'string', description: 'Solo al agregar, ej. "ml", "unid".' },
        },
        required: ['accion', 'nombre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'registrar_comunicacion_cirugia',
      description: 'Deja registrado en el historial de la cirugía un contacto con el paciente (llamada, WhatsApp, email, presencial).',
      parameters: {
        type: 'object',
        properties: {
          paciente: { type: 'string' },
          cirugiaId: { type: 'string' },
          canal: { type: 'string', enum: ['LLAMADA', 'WHATSAPP', 'EMAIL', 'PRESENCIAL', 'OTRO'] },
          descripcion: { type: 'string', description: 'Qué se conversó o acordó.' },
        },
        required: ['canal', 'descripcion'],
      },
    },
  },
];

function toolError(mensaje: string) {
  return { error: mensaje };
}

/** Mismos permisos de escritura que la UI de Cirugías. */
function puedeEscribirCirugias(ctx: ToolContext): boolean {
  return ctx.role === Role.ADMIN || ctx.role === Role.RECEPCION;
}

/**
 * Ubica una cirugía por id exacto o por nombre de paciente (búsqueda parcial).
 * Si hay varias coincidencias devuelve un error que las lista, para que el
 * copiloto pregunte cuál en vez de elegir una al azar.
 */
async function resolverCirugia(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<{ id: string; paciente: string; tipo: string } | { error: string }> {
  const cirugiaId = typeof args.cirugiaId === 'string' ? args.cirugiaId.trim() : '';
  const paciente  = typeof args.paciente === 'string' ? args.paciente.trim() : '';

  // Un PROFESIONAL solo alcanza las cirugías de su propia ficha.
  const proFilter = ctx.role === Role.PROFESIONAL ? await professionalIdDeUsuario(ctx.userId) : undefined;
  const scope = proFilter ? { professionalId: proFilter } : {};

  if (cirugiaId) {
    const c = await prisma.cirugia.findFirst({
      where: { id: cirugiaId, ...scope },
      select: { id: true, paciente: true, tipo: true },
    });
    return c ?? { error: 'No encontré esa cirugía (o no tienes acceso a ella).' };
  }

  if (!paciente) return { error: 'Necesito el nombre del paciente para identificar la cirugía.' };

  const candidatos = await prisma.cirugia.findMany({
    where: { paciente: { contains: paciente, mode: 'insensitive' }, ...scope },
    select: { id: true, paciente: true, tipo: true, etapa: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });
  if (candidatos.length === 0) return { error: `No encontré ninguna cirugía de un paciente llamado "${paciente}".` };
  if (candidatos.length > 1) {
    const lista = candidatos.map((c) => `${c.paciente} — ${c.tipo} (${ETAPA_ES[c.etapa]})`).join('; ');
    return { error: `Hay varias cirugías que coinciden: ${lista}. Pregunta al usuario a cuál se refiere.` };
  }
  return candidatos[0];
}

/** Busca la ficha de un profesional por nombre parcial; error si es ambiguo. */
async function resolverProfesional(nombre: string): Promise<{ id: string } | { error: string }> {
  const candidatos = await prisma.professional.findMany({
    where: { nombreCompleto: { contains: nombre, mode: 'insensitive' } },
    select: { id: true, nombreCompleto: true },
  });
  if (candidatos.length === 0) return { error: `No encontré un profesional llamado "${nombre}".` };
  if (candidatos.length > 1) {
    return { error: `Varios profesionales coinciden: ${candidatos.map((c) => c.nombreCompleto).join(', ')}. Sé más específico.` };
  }
  return { id: candidatos[0].id };
}

export async function ejecutarTool(nombre: string, argsRaw: string, ctx: ToolContext): Promise<unknown> {
  let args: Record<string, unknown>;
  try {
    args = argsRaw ? JSON.parse(argsRaw) : {};
  } catch {
    return toolError('Los argumentos de la herramienta no son JSON válido.');
  }

  try {
    switch (nombre) {
      case 'crear_tarea': {
        const rolesConPermiso: Role[] = [Role.ADMIN, Role.RECEPCION, Role.PROFESIONAL];
        if (!rolesConPermiso.includes(ctx.role)) {
          return toolError('Tu rol no tiene permiso para crear tareas.');
        }
        const asignadasNombres = Array.isArray(args.asignadasNombres) ? (args.asignadasNombres as string[]) : [];
        let asignadasIds: string[] = [];
        if (asignadasNombres.length) {
          const users = await prisma.user.findMany({
            where: { OR: asignadasNombres.map((n) => ({ nombre: { contains: n, mode: 'insensitive' as const } })) },
            select: { id: true },
          });
          asignadasIds = users.map((u) => u.id);
        }
        const parsed = taskCreateSchema.safeParse({ ...args, asignadasIds });
        if (!parsed.success) return toolError(`Datos inválidos para crear la tarea: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
        const task = await createTask(parsed.data, ctx.userId);
        return { ok: true, tareaId: task.id, tipo: task.tipo, descripcion: task.descripcion, asignadas: task.asignadas.map((a) => a.nombre) };
      }

      case 'crear_reembolso': {
        const parsed = reembolsoCreateSchema.safeParse(args);
        if (!parsed.success) return toolError(`Datos inválidos para el reembolso: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
        const reembolso = await createReembolso(parsed.data, ctx.userId);
        return { ok: true, reembolsoId: reembolso.id, paciente: reembolso.paciente, motivo: reembolso.motivo, monto: reembolso.monto };
      }

      case 'crear_presupuesto': {
        const parsed = quoteCreateSchema.safeParse(args);
        if (!parsed.success) return toolError(`Datos inválidos para el presupuesto: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
        const quote = await createQuote(parsed.data, ctx.userId);
        return { ok: true, presupuestoId: quote.id, paciente: quote.paciente, total: quote.total };
      }

      case 'consultar_tareas': {
        const { etapa, q } = args as { etapa?: Etapa; q?: string };
        const isAdmin = ctx.role === Role.ADMIN;
        const tareas = await prisma.task.findMany({
          where: {
            ...(isAdmin ? {} : { OR: [{ asignadas: { some: { id: ctx.userId } } }, { creadoPorId: ctx.userId }] }),
            ...(etapa ? { etapa } : {}),
            ...(q ? { OR: [
              { descripcion: { contains: q, mode: 'insensitive' as const } },
              { paciente: { contains: q, mode: 'insensitive' as const } },
            ] } : {}),
          },
          select: { id: true, tipo: true, descripcion: true, paciente: true, etapa: true, prioridad: true, dueAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        return { ok: true, total: tareas.length, tareas };
      }

      case 'consultar_reembolsos': {
        const { estado, q } = args as { estado?: ReembolsoEstado; q?: string };
        const reembolsos = await prisma.solicitudReembolso.findMany({
          where: {
            ...(estado ? { estado } : {}),
            ...(q ? { OR: [
              { paciente: { contains: q, mode: 'insensitive' as const } },
              { motivo: { contains: q, mode: 'insensitive' as const } },
            ] } : {}),
          },
          select: { id: true, paciente: true, motivo: true, monto: true, estado: true, urgente: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        return { ok: true, total: reembolsos.length, reembolsos };
      }

      case 'buscar_catalogo': {
        const { tipo, q } = args as { tipo: string; q?: string };
        if (tipo === 'profesionales') {
          const profesionales = await prisma.professional.findMany({
            where: q ? { OR: [
              { nombreCompleto: { contains: q, mode: 'insensitive' as const } },
              { especialidad: { contains: q, mode: 'insensitive' as const } },
            ] } : undefined,
            select: { id: true, nombreCompleto: true, especialidad: true },
            orderBy: { nombreCompleto: 'asc' },
            take: 20,
          });
          return { ok: true, total: profesionales.length, profesionales };
        }
        if (tipo === 'tratamientos') {
          const tratamientos = await prisma.treatment.findMany({
            where: q ? { OR: [
              { nombre: { contains: q, mode: 'insensitive' as const } },
              { categoria: { contains: q, mode: 'insensitive' as const } },
            ] } : undefined,
            select: { id: true, nombre: true, categoria: true, valorDesde: true, valorHasta: true },
            orderBy: { nombre: 'asc' },
            take: 20,
          });
          return { ok: true, total: tratamientos.length, tratamientos };
        }
        return toolError('tipo debe ser "profesionales" o "tratamientos".');
      }

      case 'invitar_usuarios': {
        if (ctx.role !== Role.ADMIN) {
          return toolError('Solo un administrador puede invitar usuarios nuevos.');
        }
        const lista = Array.isArray(args.usuarios) ? (args.usuarios as { nombre?: string; email?: string; rol?: string; profesionalVinculado?: string }[]) : [];
        if (lista.length === 0) return toolError('Debes indicar al menos una persona con nombre y email.');
        if (lista.length > 20) return toolError('Máximo 20 invitaciones por vez.');

        // ADMIN permitido aquí porque el ejecutor ya es ADMIN (verificado arriba con
        // el JWT) y el system prompt exige confirmación explícita antes de usarlo.
        const ROLES_PERMITIDOS = ['ADMIN', 'RECEPCION', 'PROFESIONAL', 'LECTURA'] as const;
        const resultados = [];
        for (const u of lista) {
          const nombre = String(u.nombre ?? '').trim();
          const email = String(u.email ?? '').trim();
          if (!nombre || !/^\S+@\S+\.\S+$/.test(email)) {
            resultados.push({ ok: false, nombre, email, error: 'Nombre o email inválido' });
            continue;
          }
          const rol = ROLES_PERMITIDOS.includes(u.rol as (typeof ROLES_PERMITIDOS)[number]) ? (u.rol as Role) : Role.RECEPCION;

          // Vincular ficha clínica por nombre (mismo patrón fuzzy que registrar_documento).
          let professionalId: string | undefined;
          if (u.profesionalVinculado) {
            const candidatos = await prisma.professional.findMany({
              where: { nombreCompleto: { contains: String(u.profesionalVinculado), mode: 'insensitive' } },
              select: { id: true, nombreCompleto: true },
            });
            if (candidatos.length === 0) {
              resultados.push({ ok: false, nombre, email, error: `No encontré un profesional llamado "${u.profesionalVinculado}".` });
              continue;
            }
            if (candidatos.length > 1) {
              resultados.push({ ok: false, nombre, email, error: `Varios profesionales coinciden: ${candidatos.map((c) => c.nombreCompleto).join(', ')}. Sé más específico.` });
              continue;
            }
            professionalId = candidatos[0].id;
          }

          resultados.push(await inviteUser({ nombre, email, role: rol, professionalId }));
        }
        const creados = resultados.filter((r) => r.ok).length;
        const sinCorreo = resultados.filter((r) => r.ok && !('emailEnviado' in r && r.emailEnviado)).length;
        return { ok: true, creados, fallidos: resultados.length - creados, sinCorreo, resultados };
      }

      case 'registrar_documento': {
        if (ctx.role !== Role.ADMIN) {
          return toolError('Solo un administrador puede subir documentos de otros usuarios.');
        }
        if (!ctx.archivoAdjunto) {
          return toolError('No se adjuntó ningún archivo en este mensaje.');
        }
        const { nombreUsuarioDestino, tipo, titulo, periodo } = args as {
          nombreUsuarioDestino: string; tipo: string; titulo: string; periodo?: string;
        };
        if (!DOCUMENTO_TIPOS.includes(tipo as (typeof DOCUMENTO_TIPOS)[number])) {
          return toolError(`tipo debe ser uno de: ${DOCUMENTO_TIPOS.join(', ')}`);
        }
        const candidatos = await prisma.user.findMany({
          where: { nombre: { contains: nombreUsuarioDestino, mode: 'insensitive' } },
          select: { id: true, nombre: true },
        });
        if (candidatos.length === 0) return toolError(`No encontré ningún usuario con el nombre "${nombreUsuarioDestino}".`);
        if (candidatos.length > 1) return toolError(`Encontré varios usuarios con ese nombre: ${candidatos.map((c) => c.nombre).join(', ')}. Sé más específico.`);
        const target = candidatos[0];

        const documento = await saveUserDocument({
          userId: target.id, tipo, titulo, periodo, file: ctx.archivoAdjunto, subidoPorId: ctx.userId,
        });
        notify({
          userId: target.id,
          title: 'Nuevo documento disponible',
          body: `Se agregó "${titulo}" a tu sección Mis Documentos.`,
          data: { kind: 'documento', documentoId: documento.id },
        }).catch(() => {});
        return { ok: true, documentoId: documento.id, usuario: target.nombre, titulo };
      }

      // ───────────────────────── Cirugías ─────────────────────────

      case 'consultar_cirugias': {
        const { etapa, paciente } = args as { etapa?: EtapaCirugia; paciente?: string };
        const proFilter = ctx.role === Role.PROFESIONAL ? await professionalIdDeUsuario(ctx.userId) : undefined;
        const cirugias = await listCirugias({ etapa, q: paciente, professionalId: proFilter });
        return {
          ok: true,
          total: cirugias.length,
          cirugias: cirugias.slice(0, 20).map((c) => {
            const total = c.presupuesto ? Math.round(c.presupuesto.monto * (1 - c.presupuesto.descuento / 100)) : 0;
            return {
              id: c.id,
              paciente: c.paciente,
              tipo: c.tipo,
              etapa: ETAPA_ES[c.etapa],
              profesional: c.professional?.nombreCompleto ?? null,
              fechaCirugia: c.fechaCirugia,
              total, abonado: c.abonado, saldo: total - c.abonado,
            };
          }),
        };
      }

      case 'ver_cirugia': {
        const ref = await resolverCirugia(args, ctx);
        if ('error' in ref) return toolError(ref.error);

        const c = await getCirugiaDetalle(ref.id);
        if (!c) return toolError('No encontré esa cirugía.');

        const total = c.presupuesto ? Math.round(c.presupuesto.monto * (1 - c.presupuesto.descuento / 100)) : 0;
        const abonado = c.abonos.reduce((s, a) => s + a.monto, 0);
        return {
          ok: true,
          id: c.id,
          paciente: c.paciente, tipo: c.tipo, etapa: ETAPA_ES[c.etapa],
          telefono: c.telefono, email: c.email, notas: c.notas,
          fechaCirugia: c.fechaCirugia,
          profesional: c.professional?.nombreCompleto ?? null,
          presupuesto: c.presupuesto
            ? { monto: c.presupuesto.monto, descuento: c.presupuesto.descuento, estado: c.presupuesto.estado, total }
            : null,
          abonado, saldo: total - abonado,
          abonos: c.abonos.map((a) => ({ monto: a.monto, metodo: a.metodo, fecha: a.fecha, notas: a.notas })),
          insumos: c.insumos.map((i) => ({ nombre: i.nombre, tipo: i.tipo, cantidad: i.cantidad, unidad: i.unidad, listo: i.listo })),
          tareas: c.tareas.map((t) => ({ tipo: t.tipo, descripcion: t.descripcion, etapa: t.etapa })),
          comunicaciones: c.comunicaciones.slice(0, 10).map((m) => ({ canal: m.canal, descripcion: m.descripcion, usuario: m.usuario.nombre, fecha: m.createdAt })),
        };
      }

      case 'crear_cirugia': {
        if (!puedeEscribirCirugias(ctx)) return toolError('Tu rol no tiene permiso para gestionar cirugías.');

        let professionalId: string | null = null;
        if (typeof args.profesional === 'string' && args.profesional.trim()) {
          const pro = await resolverProfesional(args.profesional.trim());
          if ('error' in pro) return toolError(pro.error);
          professionalId = pro.id;
        }

        const parsed = cirugiaCreateSchema.safeParse({ ...args, professionalId });
        if (!parsed.success) return toolError(`Datos inválidos para la cirugía: ${parsed.error.issues.map((i) => i.message).join('; ')}`);

        const cirugia = await createCirugia(parsed.data, ctx.userId);
        return { ok: true, cirugiaId: cirugia.id, paciente: cirugia.paciente, tipo: cirugia.tipo, etapa: ETAPA_ES[cirugia.etapa] };
      }

      case 'actualizar_cirugia': {
        if (!puedeEscribirCirugias(ctx)) return toolError('Tu rol no tiene permiso para gestionar cirugías.');
        const ref = await resolverCirugia(args, ctx);
        if ('error' in ref) return toolError(ref.error);

        const cambios: Record<string, unknown> = {};
        // `nuevoPaciente` evita chocar con `paciente`, que aquí identifica la cirugía.
        if (args.nuevoPaciente) cambios.paciente = args.nuevoPaciente;
        for (const k of ['tipo', 'telefono', 'email', 'notas', 'etapa', 'fechaCirugia'] as const) {
          if (args[k] !== undefined) cambios[k] = args[k];
        }
        if (typeof args.profesional === 'string' && args.profesional.trim()) {
          const pro = await resolverProfesional(args.profesional.trim());
          if ('error' in pro) return toolError(pro.error);
          cambios.professionalId = pro.id;
        }
        if (Object.keys(cambios).length === 0) return toolError('No indicaste ningún campo que cambiar.');

        const parsed = cirugiaUpdateSchema.safeParse(cambios);
        if (!parsed.success) return toolError(`Datos inválidos: ${parsed.error.issues.map((i) => i.message).join('; ')}`);

        const cirugia = await updateCirugia(ref.id, parsed.data, ctx.userId);
        return { ok: true, cirugiaId: cirugia.id, paciente: cirugia.paciente, etapa: ETAPA_ES[cirugia.etapa], camposActualizados: Object.keys(cambios) };
      }

      case 'registrar_presupuesto_cirugia': {
        if (!puedeEscribirCirugias(ctx)) return toolError('Tu rol no tiene permiso para gestionar cirugías.');
        const ref = await resolverCirugia(args, ctx);
        if ('error' in ref) return toolError(ref.error);

        const parsed = cirugiaPresupuestoSchema.safeParse(args);
        if (!parsed.success) return toolError(`Datos inválidos para el presupuesto: ${parsed.error.issues.map((i) => i.message).join('; ')}`);

        const presupuesto = await upsertPresupuesto(ref.id, parsed.data, ctx.userId);
        const total = Math.round(presupuesto.monto * (1 - presupuesto.descuento / 100));
        return { ok: true, paciente: ref.paciente, monto: presupuesto.monto, descuento: presupuesto.descuento, total, estado: presupuesto.estado };
      }

      case 'registrar_abono_cirugia': {
        if (!puedeEscribirCirugias(ctx)) return toolError('Tu rol no tiene permiso para gestionar cirugías.');
        const ref = await resolverCirugia(args, ctx);
        if ('error' in ref) return toolError(ref.error);

        const parsed = cirugiaAbonoSchema.safeParse(args);
        if (!parsed.success) return toolError(`Datos inválidos para el abono: ${parsed.error.issues.map((i) => i.message).join('; ')}`);

        const abono = await addAbono(ref.id, parsed.data, ctx.userId);

        // Devolver el saldo al día para que el copiloto pueda informarlo.
        const c = await prisma.cirugia.findUnique({
          where: { id: ref.id },
          select: { presupuesto: { select: { monto: true, descuento: true } }, abonos: { select: { monto: true } } },
        });
        const total = c?.presupuesto ? Math.round(c.presupuesto.monto * (1 - c.presupuesto.descuento / 100)) : 0;
        const abonado = c?.abonos.reduce((s, a) => s + a.monto, 0) ?? 0;
        return { ok: true, paciente: ref.paciente, abonoRegistrado: abono.monto, metodo: abono.metodo, total, abonado, saldo: total - abonado };
      }

      case 'gestionar_insumos_cirugia': {
        if (!puedeEscribirCirugias(ctx)) return toolError('Tu rol no tiene permiso para gestionar cirugías.');
        const ref = await resolverCirugia(args, ctx);
        if ('error' in ref) return toolError(ref.error);

        const accion = String(args.accion ?? '');
        const nombreInsumo = String(args.nombre ?? '').trim();
        if (!nombreInsumo) return toolError('Necesito el nombre del insumo.');

        if (accion === 'agregar') {
          const parsed = cirugiaInsumoSchema.safeParse({
            tipo: args.tipo ?? 'INSUMO',
            nombre: nombreInsumo,
            cantidad: args.cantidad ?? 1,
            unidad: args.unidad ?? null,
          });
          if (!parsed.success) return toolError(`Datos inválidos para el insumo: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
          const insumo = await addInsumo(ref.id, parsed.data);
          return { ok: true, paciente: ref.paciente, agregado: insumo.nombre, cantidad: insumo.cantidad };
        }

        // Para el resto de acciones hay que ubicar el insumo dentro de esa cirugía.
        const encontrados = await prisma.cirugiaInsumo.findMany({
          where: { cirugiaId: ref.id, nombre: { contains: nombreInsumo, mode: 'insensitive' } },
          select: { id: true, nombre: true },
        });
        if (encontrados.length === 0) return toolError(`La cirugía de ${ref.paciente} no tiene un insumo llamado "${nombreInsumo}".`);
        if (encontrados.length > 1) return toolError(`Varios insumos coinciden: ${encontrados.map((i) => i.nombre).join(', ')}. Sé más específico.`);
        const target = encontrados[0];

        if (accion === 'eliminar') {
          await deleteInsumo(target.id);
          return { ok: true, paciente: ref.paciente, eliminado: target.nombre };
        }
        if (accion === 'marcar_listo' || accion === 'marcar_pendiente') {
          const listo = accion === 'marcar_listo';
          await updateInsumo(ref.id, target.id, { listo }, ctx.userId);
          return { ok: true, paciente: ref.paciente, insumo: target.nombre, listo };
        }
        return toolError('accion debe ser "agregar", "marcar_listo", "marcar_pendiente" o "eliminar".');
      }

      case 'registrar_comunicacion_cirugia': {
        if (!puedeEscribirCirugias(ctx)) return toolError('Tu rol no tiene permiso para gestionar cirugías.');
        const ref = await resolverCirugia(args, ctx);
        if ('error' in ref) return toolError(ref.error);

        const parsed = cirugiaComunicacionSchema.safeParse(args);
        if (!parsed.success) return toolError(`Datos inválidos: ${parsed.error.issues.map((i) => i.message).join('; ')}`);

        const com = await addComunicacion(ref.id, parsed.data, ctx.userId);
        return { ok: true, paciente: ref.paciente, canal: com.canal, descripcion: com.descripcion };
      }

      default:
        return toolError(`Herramienta desconocida: ${nombre}`);
    }
  } catch (err) {
    console.error(`[copiloto] error ejecutando tool ${nombre}`, err);
    return toolError('Ocurrió un error inesperado al ejecutar la acción.');
  }
}
