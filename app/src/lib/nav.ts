import type { IconName } from './icons';

export type ViewId =
  | 'dashboard' | 'tareas' | 'chat'
  | 'protocolos' | 'guiones' | 'pagos' | 'suspensiones'
  | 'pacientes' | 'tratamientos' | 'profesionales' | 'consultas' | 'boxes' | 'cirugias'
  | 'inventario'
  | 'productos' | 'presupuestos' | 'giftcards' | 'consentimientos'
  | 'faq' | 'reembolso' | 'reportes'
  | 'honorarios' | 'usuarios' | 'admin';

export interface NavItem { id: ViewId; label: string; icon: IconName; }
export interface NavSection { section: string; items: NavItem[]; }

export const NAV: NavSection[] = [
  { section: 'Principal', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'tareas', label: 'Tareas', icon: 'tasks' },
    { id: 'chat', label: 'Chat interno', icon: 'msg' },
  ]},
  { section: 'Protocolos', items: [
    { id: 'protocolos', label: 'Protocolos Base', icon: 'book' },
    { id: 'guiones', label: 'Guiones Técnicos', icon: 'msg' },
    { id: 'pagos', label: 'Pagos & Citas', icon: 'credit' },
    { id: 'suspensiones', label: 'Suspensiones', icon: 'xc' },
  ]},
  { section: 'Clínica', items: [
    { id: 'pacientes', label: 'Pacientes', icon: 'user' },
    { id: 'tratamientos', label: 'Tratamientos', icon: 'act' },
    { id: 'profesionales', label: 'Profesionales', icon: 'users' },
    { id: 'consultas', label: 'Consultas', icon: 'clip' },
    { id: 'boxes', label: 'Boxes & Pabellón', icon: 'grid' },
    { id: 'cirugias', label: 'Cirugías', icon: 'doc' },
    { id: 'inventario', label: 'Inventario', icon: 'box' },
  ]},
  { section: 'Comercial', items: [
    { id: 'productos', label: 'Productos', icon: 'pkg' },
    { id: 'presupuestos', label: 'Presupuestos', icon: 'file' },
    { id: 'giftcards', label: 'Gift Cards', icon: 'gift' },
    { id: 'consentimientos', label: 'Documentos', icon: 'pen' },
  ]},
  { section: 'Soporte', items: [
    { id: 'faq', label: 'Preguntas Frecuentes', icon: 'help' },
    { id: 'reembolso', label: 'Solicitud de Reembolso', icon: 'ref' },
    { id: 'reportes', label: 'Reportes', icon: 'chart' },
  ]},
  { section: 'Administración', items: [
    { id: 'honorarios', label: 'Honorarios', icon: 'credit' },
    { id: 'usuarios', label: 'Usuarios', icon: 'shield' },
    { id: 'admin', label: 'Panel Admin', icon: 'key' },
  ]},
];

export const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  tareas: 'Tareas',
  chat: 'Chat interno',
  protocolos: 'Protocolos Base',
  guiones: 'Guiones Técnicos',
  pagos: 'Pagos & Citas',
  suspensiones: 'Políticas de Suspensión',
  pacientes: 'Pacientes',
  tratamientos: 'Tratamientos',
  profesionales: 'Profesionales',
  consultas: 'Consultas & Evaluaciones',
  boxes: 'Boxes & Pabellón',
  cirugias: 'Cirugías',
  inventario: 'Inventario',
  productos: 'Productos',
  presupuestos: 'Presupuestos',
  giftcards: 'Gift Cards',
  consentimientos: 'Documentos Clínicos',
  faq: 'Preguntas Frecuentes',
  reembolso: 'Solicitud de Reembolso',
  reportes: 'Reportes & Análisis',
  honorarios: 'Honorarios a Profesionales',
  usuarios: 'Gestión de Usuarios',
  admin: 'Panel de Administración',
};
