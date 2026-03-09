/**
 * Custom hook per la gestione dell'autenticazione JWT.
 */
import { useState, useEffect, useCallback } from "react";
import { login as apiLogin, logout as apiLogout, isAuthenticated } from "../api/cvApi";
import type { LoginCredentials } from "../api/types";

interface UseAuthReturn {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiLogin(credentials);
      setIsLoggedIn(true);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credenziali non valide.";
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
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoggedIn, loading, error, login, logout };
}
