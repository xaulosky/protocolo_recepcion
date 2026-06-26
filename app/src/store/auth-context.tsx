import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, clearTokens, hasSession, setTokens, setUnauthorizedHandler } from '../lib/api';
import type { AuthUser, Role } from '../lib/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Sesión expirada irremediablemente → volver al login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  // Al montar: si hay tokens, validar con /auth/me.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!hasSession()) {
        setStatus('unauthenticated');
        return;
      }
      try {
        const { user } = await api.get<{ user: AuthUser }>('/auth/me');
        if (!active) return;
        setUser(user);
        setStatus('authenticated');
      } catch {
        if (!active) return;
        clearTokens();
        setStatus('unauthenticated');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', { email, password });
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('cialo_refresh');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      /* ignorar */
    }
    clearTokens();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const hasRole = useCallback((...roles: Role[]) => (user ? roles.includes(user.role) : false), [user]);

  const value = useMemo<AuthContextValue>(() => ({ status, user, login, logout, hasRole }), [status, user, login, logout, hasRole]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
