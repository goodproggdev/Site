/**
 * Custom hook per la gestione dell'autenticazione JWT.
 */
import { useState, useEffect, useCallback } from "react";
import i18n from "../i18n";
import { login as apiLogin, logout as apiLogout, isAuthenticated } from "../api/cvApi";
import type { LoginCredentials, UserProfile } from "../api/types";

interface UseAuthReturn {
  isLoggedIn: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Helper to decode JWT and extract user info
function getUserFromToken(): UserProfile | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    return {
      id: payload.user_id || payload.id,
      email: payload.email,
      name: payload.name || payload.first_name || payload.email?.split('@')[0],
      plan: payload.plan || 'free',
    };
  } catch {
    return null;
  }
}

export function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState<UserProfile | null>(getUserFromToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setIsLoggedIn(isAuthenticated());
      setUser(getUserFromToken());
    };
    sync();
    window.addEventListener("auth-token-changed", sync);
    return () => window.removeEventListener("auth-token-changed", sync);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiLogin(credentials);
      setIsLoggedIn(true);
      setUser(getUserFromToken());
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : i18n.t("auth.apiErrors.invalidLogin");
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoggedIn, user, loading, error, login, logout };
}
