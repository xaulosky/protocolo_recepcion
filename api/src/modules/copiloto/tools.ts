/**
 * Definición de las tools (function-calling) del Copiloto IA + dispatcher que las
 * ejecuta. Cada tool reusa el mismo schema zod y la misma lógica de negocio
 * (services) que su ruta REST humana equivalente — nunca duplica reglas.
 *
 * Seguridad: ctx.userId/ctx.role vienen SIEMPRE del JWT verificado (nunca de lo
 * que diga el LLM). Ninguna tool puede eliminar ni cambiar el estado de registros
 * existentes: solo crea registros nuevos o consulta datos de solo lectura.
 */
import { Role, type Etapa, type ReembolsoEstado } from '@prisma/client';
import { prisma } from '../../db.ts';
import { notify } from '../../lib/notify.ts';
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
];

function toolError(mensaje: string) {
  return { error: mensaje };
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

      default:
        return toolError(`Herramienta desconocida: ${nombre}`);
    }
  } catch (err) {
    console.error(`[copiloto] error ejecutando tool ${nombre}`, err);
    return toolError('Ocurrió un error inesperado al ejecutar la acción.');
  }
}
