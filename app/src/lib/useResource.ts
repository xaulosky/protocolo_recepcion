import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Caché en memoria por ruta: evita refetch al navegar entre secciones.
const cache = new Map<string, unknown>();

export function clearResourceCache(path?: string) {
  if (path) cache.delete(path);
  else cache.clear();
}

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Carga `path` desde la API una vez y lo cachea. */
export function useResource<T>(path: string): ResourceState<T> {
  const [data, setData] = useState<T | null>(() => (cache.has(path) ? (cache.get(path) as T) : null));
  const [loading, setLoading] = useState(!cache.has(path));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<T>(path);
      cache.set(path, res);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (cache.has(path)) {
      setData(cache.get(path) as T);
      setLoading(false);
    } else {
      void load();
    }
  }, [path, load]);

  return { data, loading, error, reload: load };
}
