import { useState, useCallback } from 'react';
import type {
  InventarioItem, InventarioItemDetail, InventarioDashboard, MovimientoTipo,
} from '../../lib/types';

const API = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts?.headers ?? {}) } });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? `Error ${res.status}`);
  return body as T;
}

export interface MovimientoInput {
  tipo: MovimientoTipo;
  cantidad: number;
  codigoMotivo?: string | null;
  notas?: string | null;
  profesionalId?: string | null;
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

export function useInventario() {
  const [items, setItems]       = useState<InventarioItem[]>([]);
  const [dashboard, setDashboard] = useState<InventarioDashboard | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const loadItems = useCallback(async (params: { q?: string; categoria?: string; bajoStock?: boolean; inactivos?: boolean } = {}) => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if (params.q) qs.set('q', params.q);
      if (params.categoria) qs.set('categoria', params.categoria);
      if (params.bajoStock) qs.set('bajoStock', 'true');
      if (params.inactivos) qs.set('inactivos', 'true');
      const data = await apiFetch<{ items: InventarioItem[] }>(`/inventario?${qs}`);
      setItems(data.items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await apiFetch<{ dashboard: InventarioDashboard }>('/inventario/dashboard');
      setDashboard(data.dashboard);
    } catch { /* silent */ }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await apiFetch<{ categorias: string[] }>('/inventario/categorias');
      setCategorias(data.categorias);
    } catch { /* silent */ }
  }, []);

  const getItem = useCallback(async (id: string): Promise<InventarioItemDetail> => {
    const data = await apiFetch<{ item: InventarioItemDetail }>(`/inventario/${id}`);
    return data.item;
  }, []);

  const createItem = useCallback(async (input: ItemInput): Promise<InventarioItem> => {
    const data = await apiFetch<{ item: InventarioItem }>('/inventario', {
      method: 'POST', body: JSON.stringify(input),
    });
    setItems(prev => [...prev, data.item].sort((a, b) =>
      (a.categoria ?? '').localeCompare(b.categoria ?? '') || a.nombre.localeCompare(b.nombre)
    ));
    return data.item;
  }, []);

  const updateItem = useCallback(async (id: string, input: Partial<ItemInput>): Promise<InventarioItem> => {
    const data = await apiFetch<{ item: InventarioItem }>(`/inventario/${id}`, {
      method: 'PATCH', body: JSON.stringify(input),
    });
    setItems(prev => prev.map(i => i.id === id ? data.item : i));
    return data.item;
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    await apiFetch(`/inventario/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const registrarMovimiento = useCallback(async (itemId: string, input: MovimientoInput) => {
    const data = await apiFetch<{ movimiento: unknown }>(`/inventario/${itemId}/movimiento`, {
      method: 'POST', body: JSON.stringify(input),
    });
    // Refresh the item's stock in the list
    const updated = await apiFetch<{ item: InventarioItem }>(`/inventario/${itemId}`);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, stock: updated.item.stock } : i));
    return data.movimiento;
  }, []);

  return {
    items, dashboard, categorias, loading, error,
    loadItems, loadDashboard, loadCategorias, getItem,
    createItem, updateItem, deleteItem, registrarMovimiento,
  };
}
