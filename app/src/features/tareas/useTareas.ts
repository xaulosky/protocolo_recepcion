import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Etapa, Prioridad, Task } from '../../lib/types';

export const ETAPAS: Etapa[] = ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'REVISION', 'CERRADO'];

export const ETAPA_LABEL: Record<Etapa, string> = {
  PENDIENTE: 'Pendiente',
  ASIGNADO: 'Asignado',
  EN_PROCESO: 'En proceso',
  REVISION: 'Revisión',
  CERRADO: 'Cerrado',
};

export const PRIORIDAD_LABEL: Record<Prioridad, string> = { BAJA: 'baja', NORMAL: 'normal', URGENTE: 'urgente' };

export const NEXT: Record<Etapa, Etapa> = {
  PENDIENTE: 'ASIGNADO',
  ASIGNADO: 'EN_PROCESO',
  EN_PROCESO: 'REVISION',
  REVISION: 'CERRADO',
  CERRADO: 'CERRADO',
};

export interface AssignableUser { id: string; nombre: string; role: string }

export interface NewTarea {
  tipo: string;
  descripcion: string;
  paciente?: string;
  prioridad: Prioridad;
  asignadasIds?: string[];
}

export interface UpdateTarea {
  tipo?: string;
  descripcion?: string;
  paciente?: string | null;
  prioridad?: Prioridad;
  etapa?: Etapa;
  asignadasIds?: string[];
  dueAt?: string | null;
}

export function useTareas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, u] = await Promise.all([
        api.get<{ tasks: Task[] }>('/tasks'),
        api.get<{ users: AssignableUser[] }>('/users/assignable'),
      ]);
      setTasks(t.tasks);
      setUsers(u.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const crear = useCallback(async (input: NewTarea) => {
    const { task } = await api.post<{ task: Task }>('/tasks', input);
    setTasks((cur) => [...cur, task]);
  }, []);

  const mover = useCallback(async (id: string, etapaDestino: Etapa) => {
    const { task } = await api.patch<{ task: Task }>(`/tasks/${id}`, { etapa: etapaDestino });
    setTasks((cur) => cur.map((t) => (t.id === id ? task : t)));
  }, []);

  const actualizar = useCallback(async (id: string, data: UpdateTarea): Promise<Task> => {
    const { task } = await api.patch<{ task: Task }>(`/tasks/${id}`, data);
    setTasks((cur) => cur.map((t) => (t.id === id ? task : t)));
    return task;
  }, []);

  const getTask = useCallback(async (id: string): Promise<Task> => {
    const { task } = await api.get<{ task: Task }>(`/tasks/${id}`);
    return task;
  }, []);

  const eliminar = useCallback(async (id: string) => {
    await api.del(`/tasks/${id}`);
    setTasks((cur) => cur.filter((t) => t.id !== id));
  }, []);

  return { tasks, users, loading, error, crear, mover, actualizar, getTask, eliminar, reload: load };
}
