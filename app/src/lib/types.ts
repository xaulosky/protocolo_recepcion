// Tipos de las entidades que devuelve la API (espejo de los modelos Prisma).

export type Role = 'ADMIN' | 'RECEPCION' | 'PROFESIONAL' | 'LECTURA';

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
  createdAt: string;
  activities?: TaskActivity[];
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
  roles: Role[];
  titulo: string;
  members: ChatUser[];
  ultimoMensaje: { contenido: string; createdAt: string; autorNombre: string } | null;
  unread: number;
  updatedAt: string;
}
