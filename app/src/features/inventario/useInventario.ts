import { useState, useCallback } from 'react';
import { api } from '../../lib/api';
import type {
  InventarioItem, InventarioItemDetail, InventarioDashboard, MovimientoTipo, StorageLocation,
} from '../../lib/types';

export interface MovimientoInput {
  tipo: MovimientoTipo;
  cantidad: number;
  codigoMotivo?: string | null;
  notas?: string | null;
  profesionalId?: string | null;
  ubicacionId?: string | null;
  ubicacionDestinoId?: string | null;
}

export interface ItemInput {
  nombre: string;
  sku?: string | null;
  codigoBarras?: string | null;
  descripcion?: string | null;
  stock?: number;
  stockMinimo?: number;
  unidad?: string;
  categoria?: string | null;
  costo?: number;
  notas?: string | null;
}

export interface LocationInput {
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  tipo?: string;
  parentId?: string | null;
}

export function useInventario() {
  const [items,       setItems]       = useState<InventarioItem[]>([]);
  const [dashboard,   setDashboard]   = useState<InventarioDashboard | null>(null);
  const [categorias,  setCategorias]  = useState<string[]>([]);
  const [ubicaciones, setUbicaciones] = useState<StorageLocation[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const loadItems = useCallback(async (params: {
    q?: string; categoria?: string; bajoStock?: boolean; inactivos?: boolean; ubicacionId?: string;
  } = {}) => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if (params.q)           qs.set('q', params.q);
      if (params.categoria)   qs.set('categoria', params.categoria);
      if (params.bajoStock)   qs.set('bajoStock', 'true');
      if (params.inactivos)   qs.set('inactivos', 'true');
      if (params.ubicacionId) qs.set('ubicacionId', params.ubicacionId);
      const data = await api.get<{ items: InventarioItem[] }>(`/inventario?${qs}`);
      setItems(data.items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.get<{ dashboard: InventarioDashboard }>('/inventario/dashboard');
      setDashboard(data.dashboard);
    } catch { /* silent */ }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await api.get<{ categorias: string[] }>('/inventario/categorias');
      setCategorias(data.categorias);
    } catch { /* silent */ }
  }, []);

  const loadUbicaciones = useCallback(async () => {
    try {
      const data = await api.get<{ locations: StorageLocation[] }>('/inventario/ubicaciones');
      setUbicaciones(data.locations);
    } catch { /* silent */ }
  }, []);

  const getItem = useCallback(async (id: string): Promise<InventarioItemDetail> => {
    const data = await api.get<{ item: InventarioItemDetail }>(`/inventario/${id}`);
    return data.item;
  }, []);

  const createItem = useCallback(async (input: ItemInput): Promise<InventarioItem> => {
    const data = await api.post<{ item: InventarioItem }>('/inventario', input);
    setItems(prev => [...prev, data.item].sort((a, b) =>
      (a.categoria ?? '').localeCompare(b.categoria ?? '') || a.nombre.localeCompare(b.nombre)
    ));
    return data.item;
  }, []);

  const updateItem = useCallback(async (id: string, input: Partial<ItemInput>): Promise<InventarioItem> => {
    const data = await api.patch<{ item: InventarioItem }>(`/inventario/${id}`, input);
    setItems(prev => prev.map(i => i.id === id ? data.item : i));
    return data.item;
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    await api.del(`/inventario/${id}`);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const registrarMovimiento = useCallback(async (itemId: string, input: MovimientoInput) => {
    const data = await api.post<{ movimiento: { stockDespues: number } }>(`/inventario/${itemId}/movimiento`, input);
    if (input.tipo !== 'TRASLADO') {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, stock: data.movimiento.stockDespues } : i));
    }
    return data.movimiento;
  }, []);

  const createUbicacion = useCallback(async (input: LocationInput): Promise<StorageLocation> => {
    const data = await api.post<{ location: StorageLocation }>('/inventario/ubicaciones', input);
    setUbicaciones(prev => [...prev, data.location].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return data.location;
  }, []);

  const updateUbicacion = useCallback(async (id: string, input: Partial<LocationInput>): Promise<StorageLocation> => {
    const data = await api.patch<{ location: StorageLocation }>(`/inventario/ubicaciones/${id}`, input);
    setUbicaciones(prev => prev.map(u => u.id === id ? data.location : u));
    return data.location;
  }, []);

  const deleteUbicacion = useCallback(async (id: string): Promise<void> => {
    await api.del(`/inventario/ubicaciones/${id}`);
    setUbicaciones(prev => prev.filter(u => u.id !== id));
  }, []);

  return {
    items, dashboard, categorias, ubicaciones, loading, error,
    loadItems, loadDashboard, loadCategorias, loadUbicaciones,
    getItem, createItem, updateItem, deleteItem, registrarMovimiento,
    createUbicacion, updateUbicacion, deleteUbicacion,
  };
}
