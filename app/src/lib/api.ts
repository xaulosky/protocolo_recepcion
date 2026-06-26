/**
 * Cliente HTTP con manejo de tokens (access + refresh).
 * - Guarda los tokens en localStorage.
 * - Inyecta el access token en cada request.
 * - Ante un 401, intenta refrescar el token una vez y reintenta.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

const ACCESS_KEY = 'cialo_access';
const REFRESH_KEY = 'cialo_refresh';

let accessToken: string | null = localStorage.getItem(ACCESS_KEY);
let refreshToken: string | null = localStorage.getItem(REFRESH_KEY);

let onUnauthorized: (() => void) | null = null;
/** El AuthProvider registra aquí qué hacer cuando la sesión expira sin remedio. */
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function hasSession() {
  return Boolean(accessToken && refreshToken);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  // Evita refrescos simultáneos.
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function request(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return request(path, options, false);
    clearTokens();
    onUnauthorized?.();
  }
  return res;
}

/** Hace una request y devuelve el JSON tipado; lanza ApiError si no es 2xx. */
export async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await request(path, options);
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiJson<T>(path),
  post: <T>(path: string, body?: unknown) => apiJson<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => apiJson<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => apiJson<T>(path, { method: 'DELETE' }),
};
