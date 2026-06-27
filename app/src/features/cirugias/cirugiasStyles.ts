import type { EtapaCirugia, PresupuestoEstado, CanalComunicacion } from '../../lib/types';

export const ETAPA_LABEL: Record<EtapaCirugia, string> = {
  EVALUACION:          'Evaluación',
  PRESUPUESTO_ENVIADO: 'Presupuesto',
  CONFIRMADO:          'Confirmado',
  PREPARACION:         'Preparación',
  EN_EJECUCION:        'En ejecución',
  POST_OPERATORIO:     'Post-operatorio',
  CERRADO:             'Cerrado',
};

export const ETAPA_STYLE: Record<EtapaCirugia, { bg: string; color: string }> = {
  EVALUACION:          { bg: '#F5F0E8', color: '#7C6247' },
  PRESUPUESTO_ENVIADO: { bg: '#EBF3FB', color: '#2F6B9A' },
  CONFIRMADO:          { bg: '#EDF5EF', color: '#3A6A4A' },
  PREPARACION:         { bg: '#FBF5EB', color: '#C07B3A' },
  EN_EJECUCION:        { bg: '#F0EBF5', color: '#5A4A7A' },
  POST_OPERATORIO:     { bg: '#EBF5F2', color: '#2F7A5A' },
  CERRADO:             { bg: '#F0F0F0', color: '#707070' },
};

export const ETAPAS_ORDEN: EtapaCirugia[] = [
  'EVALUACION', 'PRESUPUESTO_ENVIADO', 'CONFIRMADO',
  'PREPARACION', 'EN_EJECUCION', 'POST_OPERATORIO', 'CERRADO',
];

export const PRESUPUESTO_LABEL: Record<PresupuestoEstado, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO:  'Aprobado',
  RECHAZADO: 'Rechazado',
};

export const PRESUPUESTO_STYLE: Record<PresupuestoEstado, { bg: string; color: string }> = {
  PENDIENTE: { bg: '#FBF5EB', color: '#C07B3A' },
  APROBADO:  { bg: '#EDF5EF', color: '#3A6A4A' },
  RECHAZADO: { bg: '#FBF0F0', color: '#9A3A3A' },
};

export const CANAL_LABEL: Record<CanalComunicacion, string> = {
  LLAMADA:    'Llamada',
  EMAIL:      'Email',
  WHATSAPP:   'WhatsApp',
  PRESENCIAL: 'Presencial',
  OTRO:       'Otro',
};

export const CANAL_ICON: Record<CanalComunicacion, string> = {
  LLAMADA:    'phone',
  EMAIL:      'mail',
  WHATSAPP:   'msg',
  PRESENCIAL: 'user',
  OTRO:       'info',
};
