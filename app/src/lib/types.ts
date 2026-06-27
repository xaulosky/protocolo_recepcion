// Tipos de las entidades que devuelve la API (espejo de los modelos Prisma).

export type Role = 'ADMIN' | 'RECEPCION' | 'PROFESIONAL' | 'LECTURA' | 'BOX';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  permisos: string[];
  professionalId: string | null;
}

/** Usuario completo para la gestión de admin. */
export interface ManagedUser {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  activo: boolean;
  permisos: string[];
  ocultarEnDM: boolean;
  professionalId: string | null;
  createdAt: string;
}

export interface Treatment {
  id: string;
  categoria: string;
  subcategoria: string | null;
  nombre: string;
  descripcion: string;
  profesional: string | null;
  especialidad: string | null;
  valorDesde: number | null;
  valorHasta: number | null;
  duracion: string | null;
  sesiones: string | null;
  protocolo: string | null;
  requiereEvaluacion: boolean;
}

export interface Professional {
  id: string;
  nombreCompleto: string;
  especialidad: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  disponibilidad: { dias?: string[]; horario?: string; frecuencia?: string } | null;
  prestaciones: { servicios?: string[]; duracionPromedio?: string } | null;
}

export interface Product {
  id: number;
  brand: string;
  name: string;
  price: number;
  category: string | null;
  description: string | null;
}

export interface Consultation {
  id: string;
  categoria: string | null;
  emoji: string | null;
  nombre: string;
  descripcion: string;
  valor: string;
  duracion: string | null;
  reembolsable: boolean;
  profesionales: { nombre: string; especialidad?: string; disponibilidad?: string }[] | null;
}

export interface Box {
  id: number;
  nombre: string;
  alias: string | null;
  tipo: string | null;
  descripcion: string | null;
  usosPrincipales: string[];
  equipamiento: { nombre: string; tipo?: string; descripcion?: string }[] | null;
}

export interface Consent {
  id: string;
  title: string;
  treatment: string;
  introduction: string;
  beneficios: string[];
  efectosSecundarios: string[];
  contraindicaciones: string[];
  cuidados: string[];
}

export interface FaqItem {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
  tags: string[];
}

export interface Protocol {
  id: string;
  numero: number;
  titulo: string;
  contenido: string;
}

export interface Script {
  id: string;
  categoria: string;
  titulo: string;
  contenido: string;
  nota: string | null;
  orden: number;
}

export interface PaymentPolicy {
  id: string;
  titulo: string;
  contenido: string;
  tipo: string;
  orden: number;
}

export type Etapa = 'PENDIENTE' | 'ASIGNADO' | 'EN_PROCESO' | 'REVISION' | 'CERRADO';
export type Prioridad = 'BAJA' | 'NORMAL' | 'URGENTE';

export interface TaskUserRef { id: string; nombre: string }

export interface TaskActivity {
  id: string;
  tipo: string;
  detalle: string | null;
  user: TaskUserRef;
  createdAt: string;
}

export interface Task {
  id: string;
  tipo: string;
  descripcion: string;
  paciente: string | null;
  etapa: Etapa;
  prioridad: Prioridad;
  dueAt: string | null;
  asignada: TaskUserRef | null;
  creadoPor: TaskUserRef | null;
  cirugiaId: string | null;
  createdAt: string;
  activities?: TaskActivity[];
}

// ── Cirugías / Procedimientos ──

export type EtapaCirugia =
  | 'EVALUACION' | 'PRESUPUESTO_ENVIADO' | 'CONFIRMADO'
  | 'PREPARACION' | 'EN_EJECUCION' | 'POST_OPERATORIO' | 'CERRADO';

export type PresupuestoEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
export type InsumoTipo        = 'INSUMO' | 'INSTRUMENTAL';
export type CanalComunicacion = 'LLAMADA' | 'EMAIL' | 'WHATSAPP' | 'PRESENCIAL' | 'OTRO';

export interface CirugiaPresupuesto {
  id: string;
  monto: number;
  descuento: number;
  estado: PresupuestoEstado;
  enviadoAt: string | null;
  notas: string | null;
}

export interface CirugiaInsumo {
  id: string;
  tipo: InsumoTipo;
  nombre: string;
  productId: number | null;
  cantidad: number;
  unidad: string | null;
  listo: boolean;
  createdAt: string;
}

export interface ComunicacionLog {
  id: string;
  canal: CanalComunicacion;
  descripcion: string;
  usuario: TaskUserRef;
  createdAt: string;
}

export interface CirugiaActividad {
  id: string;
  tipo: string;
  descripcion: string;
  datos?: Record<string, unknown> | null;
  usuario: { nombre: string };
  createdAt: string;
}

export interface CirugiaListItem {
  id: string;
  paciente: string;
  tipo: string;
  etapa: EtapaCirugia;
  telefono: string | null;
  email: string | null;
  fechaCirugia: string | null;
  professional: { id: string; nombreCompleto: string; especialidad: string } | null;
  creadoPor: TaskUserRef | null;
  presupuesto: { estado: PresupuestoEstado; monto: number; descuento: number } | null;
  _count: { tareas: number; insumos: number };
  createdAt: string;
  updatedAt: string;
}

export interface Cirugia extends Omit<CirugiaListItem, 'presupuesto' | '_count'> {
  notas: string | null;
  presupuesto: CirugiaPresupuesto | null;
  insumos: CirugiaInsumo[];
  comunicaciones: ComunicacionLog[];
  actividad: CirugiaActividad[];
  tareas: Task[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

// ── Chat interno ──

export interface ChatUser {
  id: string;
  nombre: string;
  role: Role;
}

export interface ChatMessage {
  id: string;
  contenido: string;
  createdAt: string;
  autor: ChatUser;
}

export interface Conversation {
  id: string;
  esGrupo: boolean;
  esBuzon: boolean; // buzón de estación Box ↔ equipo de Recepción
  roles: Role[];
  titulo: string;
  members: ChatUser[];
  ultimoMensaje: { contenido: string; createdAt: string; autorNombre: string } | null;
  unread: number;
  updatedAt: string;
}
