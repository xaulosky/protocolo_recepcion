import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type {
  Cirugia, CirugiaListItem, EtapaCirugia,
  InsumoTipo, CanalComunicacion, PresupuestoEstado,
} from '../../lib/types';

export interface NuevaCirugia {
  paciente: string;
  tipo: string;
  telefono?: string | null;
  email?: string | null;
  notas?: string | null;
  fechaCirugia?: string | null;
  professionalId?: string | null;
}

export function useCirugias() {
  const [cirugias, setCirugias] = useState<CirugiaListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async (params?: { etapa?: EtapaCirugia; q?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params?.etapa) qs.set('etapa', params.etapa);
      if (params?.q)     qs.set('q', params.q);
      const { cirugias: data } = await api.get<{ cirugias: CirugiaListItem[] }>(
        `/cirugias${qs.toString() ? `?${qs}` : ''}`,
      );
      setCirugias(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar cirugías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const crear = useCallback(async (input: NuevaCirugia): Promise<CirugiaListItem> => {
    const { cirugia } = await api.post<{ cirugia: CirugiaListItem }>('/cirugias', input);
    setCirugias((cur) => [cirugia, ...cur]);
    return cirugia;
  }, []);

  const actualizar = useCallback(async (id: string, data: Partial<NuevaCirugia & { etapa: EtapaCirugia }>): Promise<CirugiaListItem> => {
    const { cirugia } = await api.patch<{ cirugia: CirugiaListItem }>(`/cirugias/${id}`, data);
    setCirugias((cur) => cur.map((c) => (c.id === id ? cirugia : c)));
    return cirugia;
  }, []);

  const eliminar = useCallback(async (id: string) => {
    await api.del(`/cirugias/${id}`);
    setCirugias((cur) => cur.filter((c) => c.id !== id));
  }, []);

  const getDetalle = useCallback(async (id: string): Promise<Cirugia> => {
    const { cirugia } = await api.get<{ cirugia: Cirugia }>(`/cirugias/${id}`);
    return cirugia;
  }, []);

  const upsertPresupuesto = useCallback(async (
    id: string,
    data: { monto: number; descuento: number; estado: PresupuestoEstado; enviadoAt?: string | null; notas?: string | null },
  ) => {
    const { presupuesto } = await api.put<{ presupuesto: unknown }>(`/cirugias/${id}/presupuesto`, data);
    return presupuesto;
  }, []);

  const agregarInsumo = useCallback(async (
    id: string,
    data: { tipo: InsumoTipo; nombre: string; productId?: number | null; cantidad: number; unidad?: string | null },
  ) => {
    const { insumo } = await api.post<{ insumo: unknown }>(`/cirugias/${id}/insumos`, data);
    return insumo;
  }, []);

  const toggleInsumo = useCallback(async (cirugiaId: string, insumoId: string, listo: boolean) => {
    await api.patch(`/cirugias/${cirugiaId}/insumos/${insumoId}`, { listo });
  }, []);

  const eliminarInsumo = useCallback(async (cirugiaId: string, insumoId: string) => {
    await api.del(`/cirugias/${cirugiaId}/insumos/${insumoId}`);
  }, []);

  const agregarComunicacion = useCallback(async (
    id: string,
    data: { canal: CanalComunicacion; descripcion: string },
  ) => {
    const { comunicacion } = await api.post<{ comunicacion: unknown }>(`/cirugias/${id}/comunicaciones`, data);
    return comunicacion;
  }, []);

  const eliminarComunicacion = useCallback(async (cirugiaId: string, logId: string) => {
    await api.del(`/cirugias/${cirugiaId}/comunicaciones/${logId}`);
  }, []);

  return {
    cirugias, loading, error,
    load, crear, actualizar, eliminar, getDetalle,
    upsertPresupuesto,
    agregarInsumo, toggleInsumo, eliminarInsumo,
    agregarComunicacion, eliminarComunicacion,
  };
}
