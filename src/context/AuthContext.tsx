import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser, LoginResponse } from '@/types/auth';
import { changeAccessPassword, fetchCurrentAccess, loginAccess, logoutAccess } from '@/services/api';
import { AUTH_EXPIRED_EVENT, clearAccessToken, getAccessToken, setAccessToken } from '@/lib/authStorage';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setStatus('checking');
    try {
      const response = await fetchCurrentAccess();
      setUser(response.user);
      setStatus('authenticated');
    } catch {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleExpired = () => clearSession();
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginAccess(username.trim(), password);
    setAccessToken(response.access_token);
    setUser(response.user);
    setStatus('authenticated');
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) await logoutAccess();
    } catch {
      // O encerramento local da sessão deve ocorrer mesmo se a fonte de autenticação estiver indisponível.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await changeAccessPassword(currentPassword, newPassword);
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    login,
    logout,
    changePassword,
    refresh,
  }), [status, user, login, logout, changePassword, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
