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
  indicaciones: string[];
  contraindicaciones: string[];
  preTratamiento: string[];
  postTratamiento: string[];
}

/** Un servicio puede venir como texto simple o como objeto con detalle. */
export interface ProfesionalServicio {
  nombre?: string;
  duracion?: string;
  valor?: string;
  descripcion?: string;
  equipo?: string;
  insumos?: string;
  notas?: string;
  espacio?: string;
  [key: string]: unknown;
}

export interface Professional {
  id: string;
  nombreCompleto: string;
  especialidad: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  disponibilidad: { dias?: string[]; horario?: string; frecuencia?: string } | null;
  prestaciones: { servicios?: (string | ProfesionalServicio)[]; duracionPromedio?: string } | null;
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

// ── Consentimientos enviados a firma digital ──

export type ConsentEstado = 'PENDIENTE' | 'FIRMADO' | 'ANULADO';

export interface SignedConsent {
  id: string;
  token: string;
  titulo: string;
  tratamiento: string;
  paciente: string;
  rut: string;
  profesional: string;
  procedimiento: string;
  telefono?: string | null;
  email?: string | null;
  fecha: string;
  estado: ConsentEstado;
  firmadoAt?: string | null;
  createdAt: string;
  emailEnviadoAt?: string | null;
  firmaManual?: boolean;
  expiresAt?: string | null;
  creadoPor?: { id: string; nombre: string } | null;
}

/** Snapshot del contenido del consentimiento que ve y firma el paciente. */
export interface ConsentSnapshot {
  introduction: string;
  beneficios: string[];
  efectosSecundarios: string[];
  contraindicaciones: string[];
  cuidados: string[];
}

/** Detalle completo de un envío (incluye snapshot y datos de la firma). */
export interface SignedConsentDetail extends SignedConsent {
  consentId?: string | null;
  snapshot: ConsentSnapshot;
  firmaImagen?: string | null;
  firmanteNombre?: string | null;
  fotoAuth?: boolean | null;
  firmaIp?: string | null;
  firmaUserAgent?: string | null;
}

// ── Pacientes (vista consolidada, agrupada por RUT desde consentimientos) ──

export interface PacienteResumen {
  id: string;        // RUT normalizado (clave de agrupación y de la URL de detalle)
  rut: string;       // RUT tal como se registró
  nombre: string;
  telefono: string | null;
  email: string | null;
  total: number;
  firmados: number;
  pendientes: number;
  anulados: number;
  ultimaActividad: string;
}

export interface PacienteDetalle {
  paciente: {
    id: string;
    rut: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
  };
  consentimientos: SignedConsent[];
}

/** Vista pública (paciente) cargada desde /firma/:token. */
export interface FirmaPublicData {
  titulo: string;
  tratamiento: string;
  snapshot: ConsentSnapshot;
  paciente: string;
  rut: string;
  profesional: string;
  procedimiento: string;
  fecha: string;
  estado: ConsentEstado;
  firmadoAt?: string | null;
  firmanteNombre?: string | null;
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
export type GiftCardEstado = 'ACTIVA' | 'CANJEADA' | 'ANULADA';
export type ReembolsoEstado = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface TaskUserRef { id: string; nombre: string }

export interface TaskActivity {
  id: string;
  tipo: string;
  detalle: string | null;
  user: TaskUserRef;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  contenido: string;
  done: boolean;
  orden: number;
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
  tags: string[];
  asignadas: TaskUserRef[];
  creadoPor: TaskUserRef | null;
  cirugiaId: string | null;
  createdAt: string;
  activities?: TaskActivity[];
  checklist?: TaskChecklistItem[];
}

// ── Comercial ──

export interface QuoteItem { nombre: string; cat: string; precio: number; cantidad: number }

export interface Quote {
  id: string;
  paciente: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  items: QuoteItem[];
  subtotal: number;
  descuento: number;
  total: number;
  notas: string | null;
  creadoPor: TaskUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCard {
  id: string;
  para: string;
  de: string | null;
  monto: number;
  codigo: string;
  mensaje: string | null;
  estado: GiftCardEstado;
  canjeoAt: string | null;
  notas: string | null;
  creadoPor: TaskUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface SolicitudReembolso {
  id: string;
  paciente: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  fechaPago: string | null;
  fechaSolicitud: string | null;
  monto: string | null;
  motivo: string;
  banco: string | null;
  tipoCuenta: string | null;
  cuenta: string | null;
  titular: string | null;
  urgente: boolean;
  estado: ReembolsoEstado;
  notas: string | null;
  creadoPor: TaskUserRef | null;
  createdAt: string;
  updatedAt: string;
}

// ── Honorarios a profesionales ──

export type PagoEstado = 'PAGADO' | 'PENDIENTE_PAGO' | 'PENDIENTE_FACTURA' | 'PENDIENTE_BOLETA';

export interface PagoProfesional {
  id: string;
  professionalId: string;
  professional: { id: string; nombreCompleto: string; especialidad: string } | null;
  periodo: string;       // mes al que pertenece, "YYYY-MM"
  monto: number;         // CLP
  estado: PagoEstado;
  fechaPago: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HonorariosResumen {
  count: number;
  total: number;
  PAGADO: number;
  PENDIENTE_PAGO: number;
  PENDIENTE_FACTURA: number;
  PENDIENTE_BOLETA: number;
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
  etapaCambiadaAt: string | null;
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

// ── Inventario ──

export type MovimientoTipo = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRASLADO';

export interface StorageLocation {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  tipo: string;
  activo: boolean;
  parentId: string | null;
  parent: { id: string; nombre: string; codigo: string } | null;
  children?: { id: string; nombre: string; codigo: string; activo: boolean }[];
  _count?: { locationInventario: number };
  createdAt: string;
  updatedAt: string;
}

export interface LocationInventario {
  id: string;
  locationId: string;
  itemId: string;
  quantity: number;
  stockMinimo: number | null;
  location: { id: string; nombre: string; codigo: string };
}

export interface InventarioItem {
  id: string;
  nombre: string;
  sku: string | null;
  codigoBarras: string | null;
  descripcion: string | null;
  stock: number;
  stockMinimo: number;
  unidad: string;
  categoria: string | null;
  costo: number;
  activo: boolean;
  notas: string | null;
  creadoPor: TaskUserRef | null;
  locationInventario?: LocationInventario[];
  createdAt: string;
  updatedAt: string;
}

export interface InventarioMovimiento {
  id: string;
  itemId: string;
  tipo: MovimientoTipo;
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  codigoMotivo: string | null;
  notas: string | null;
  profesional: { id: string; nombreCompleto: string } | null;
  realizadoPor: TaskUserRef | null;
  ubicacion: { id: string; nombre: string; codigo: string } | null;
  ubicacionDestino: { id: string; nombre: string; codigo: string } | null;
  fechaMovimiento: string;
  createdAt: string;
}

export interface InventarioItemDetail extends InventarioItem {
  movimientos: InventarioMovimiento[];
  locationInventario: LocationInventario[];
}

export interface InventarioDashboard {
  totalItems: number;
  bajoStock: number;
  sinStock: number;
  valorTotal: number;
  totalUbicaciones: number;
  ultimosMovimientos: (InventarioMovimiento & { item: { nombre: string; unidad: string } })[];
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

export interface MessageReaction { id: string; emoji: string; userId: string }

export interface ChatMessageParent {
  id: string;
  contenido: string;
  autor: { nombre: string };
}

export interface ChatMessage {
  id: string;
  contenido: string;
  createdAt: string;
  editedAt?: string | null;
  parentId?: string | null;
  parent?: ChatMessageParent | null;
  autor: ChatUser;
  reactions?: MessageReaction[];
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
