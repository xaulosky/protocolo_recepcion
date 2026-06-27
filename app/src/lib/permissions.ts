import type { AuthUser, Role } from './types';
import type { ViewId } from './nav';

/** Todas las secciones que se pueden conceder como permiso (excluye 'usuarios', que es solo-admin). */
export const PERMISSION_VIEWS: ViewId[] = [
  'dashboard', 'tareas', 'chat',
  'protocolos', 'guiones', 'pagos', 'suspensiones',
  'tratamientos', 'profesionales', 'consultas', 'boxes', 'cirugias',
  'productos', 'presupuestos', 'giftcards', 'consentimientos',
  'faq', 'reembolso',
];

/** Permisos por defecto según el rol cuando el usuario no tiene permisos personalizados. */
const ROLE_DEFAULTS: Record<Role, ViewId[]> = {
  // El admin ve todo (incluye 'usuarios', que se añade aparte).
  ADMIN: [...PERMISSION_VIEWS],
  // Recepción y profesional: todo el contenido salvo administración.
  RECEPCION: [...PERMISSION_VIEWS],
  PROFESIONAL: [...PERMISSION_VIEWS],
  // Solo lectura: secciones de referencia, sin tareas.
  LECTURA: PERMISSION_VIEWS.filter((v) => v !== 'tareas'),
  // Estación Box: solo mensajería.
  BOX: ['chat'],
};

/** Conjunto efectivo de secciones que el usuario puede ver. */
export function allowedViews(user: AuthUser | null): Set<ViewId> {
  if (!user) return new Set();
  if (user.role === 'ADMIN') return new Set<ViewId>([...PERMISSION_VIEWS, 'usuarios']);
  const base = user.permisos && user.permisos.length > 0
    ? (user.permisos as ViewId[]).filter((v) => PERMISSION_VIEWS.includes(v))
    : ROLE_DEFAULTS[user.role];
  return new Set(base);
}

export function canView(user: AuthUser | null, view: ViewId): boolean {
  return allowedViews(user).has(view);
}

/** Permisos por defecto de un rol (para precargar el editor de usuarios). */
export function defaultPermisos(role: Role): ViewId[] {
  return [...ROLE_DEFAULTS[role]];
}
