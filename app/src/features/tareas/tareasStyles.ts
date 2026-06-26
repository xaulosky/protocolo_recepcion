import type { Etapa, Prioridad } from '../../lib/types';

export const PRIO_STYLE: Record<Prioridad, { bg: string; color: string }> = {
  URGENTE: { bg: '#FBF0EB', color: '#C97B4B' },
  BAJA:    { bg: '#EDF5EF', color: '#4A7A5A' },
  NORMAL:  { bg: '#F5F5F5', color: '#7A7066' },
};

export const ETAPA_STYLE: Record<Etapa, { bg: string; color: string }> = {
  PENDIENTE:  { bg: '#F0EBE4', color: '#7A7066' },
  ASIGNADO:   { bg: '#EBF3FB', color: '#3B78AF' },
  EN_PROCESO: { bg: '#FBF0EB', color: '#C97B4B' },
  REVISION:   { bg: '#F0EBF8', color: '#7A55AF' },
  CERRADO:    { bg: '#EDF5EF', color: '#4A7A5A' },
};
