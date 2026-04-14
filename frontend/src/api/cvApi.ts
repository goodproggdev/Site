/**
 * Layer centralizzato per le chiamate API al backend Django.
 * Tutte le fetch al backend devono passare da qui.
 */
import axios from "axios";
import { redirectToLocalizedHome } from "../utils/localizedPath";
import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  CVData,
  ParseCVResponse,
} from "./types";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";
const API_V1_PREFIX = "/api/v1";

// Istanza Axios con baseURL
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ─── Interceptor: inietta il JWT in ogni richiesta ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor: rinnova token scaduto ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post<AuthTokens>(
            `${API_BASE}/auth/token/refresh/`,
            { refresh },
          );
          localStorage.setItem("access_token", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          // Refresh scaduto → logout e home coerente con `/:lang` (nessuna route `/login`)
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          redirectToLocalizedHome();
        }
      }
    }
    return Promise.reject(error);
  },
);

// ==============================================================================
// AUTH API
// ==============================================================================

export async function login(
  credentials: LoginCredentials,
  options?: { signal?: AbortSignal },
): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/token/", credentials, {
    signal: options?.signal,
  });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
}

export type RegisterResult =
  | { ok: true; authenticated: true; tokens: AuthTokens }
  | { ok: true; authenticated: false }
  | { ok: false; data: unknown };

/** Registrazione utente: stesso client Axios del resto dell’app (cookie, base URL, errori). */
export async function register(
  payload: RegisterPayload,
  options?: { signal?: AbortSignal },
): Promise<RegisterResult> {
  try {
    const { data } = await api.post<Record<string, unknown>>("/auth/registration/", payload, {
      signal: options?.signal,
    });
    if (typeof data.access === "string") {
      const tokens: AuthTokens = {
        access: data.access,
        refresh: typeof data.refresh === "string" ? data.refresh : "",
      };
      localStorage.setItem("access_token", tokens.access);
      if (tokens.refresh) localStorage.setItem("refresh_token", tokens.refresh);
      return { ok: true, authenticated: true, tokens };
    }
    return { ok: true, authenticated: false };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data !== undefined) {
      return { ok: false, data: e.response.data };
    }
    throw e;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout/");
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

/** Conferma email (dj-rest-auth): POST body `{ key }` dal link ricevuto per email. */
export async function verifyEmail(key: string): Promise<{ verified: boolean; error?: string }> {
  try {
    await api.post("/auth/registration/verify-email/", { key });
    return { verified: true };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      const d = e.response.data as Record<string, unknown>;
      const msg =
        typeof d.detail === "string"
          ? d.detail
          : Array.isArray(d.non_field_errors)
            ? String(d.non_field_errors[0])
            : "Verifica non riuscita.";
      return { verified: false, error: msg };
    }
    return { verified: false, error: "Verifica non riuscita." };
  }
}

/** Reinvia email di verifica (richiede l'indirizzo registrato). */
export async function sendVerificationEmail(email: string): Promise<void> {
  await api.post("/auth/registration/resend-email/", { email });
}

/** Richiesta reset password (dj-rest-auth / allauth). */
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/auth/password/reset/", { email });
}

/** Conferma reset con uid e token dall’email. */
export async function confirmPasswordReset(payload: {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}): Promise<void> {
  await api.post("/auth/password/reset/confirm/", payload);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}

// ==============================================================================
// CV API
// ==============================================================================

export async function uploadAndParseCV(file: File): Promise<ParseCVResponse> {
  const formData = new FormData();
  formData.append("cv_file", file);
  const { data } = await api.post<ParseCVResponse>(`${API_V1_PREFIX}/parse-cv-upload/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getMyCVList(): Promise<CVData[]> {
  const { data } = await api.get<CVData[]>(`${API_V1_PREFIX}/cv/`);
  return data;
}

export async function deleteCV(cvId: number): Promise<void> {
  await api.delete(`${API_V1_PREFIX}/cv/${cvId}/delete/`);
}

export async function getJsonData(): Promise<unknown> {
  const { data } = await api.get("/api/legacy/data/");
  return data;
}

// ==============================================================================
// CONTACT API
// ==============================================================================

export async function sendContactForm(payload: {
  email: string;
  subject: string;
  message: string;
}): Promise<{ status: string }> {
  const { data } = await api.post(`${API_V1_PREFIX}/contact/`, payload);
  return data;
}

// ==============================================================================
// STRIPE API
// ==============================================================================

export async function createCheckoutSession(priceId: string): Promise<{ url: string }> {
  const { data } = await api.post<{ url: string }>(`${API_V1_PREFIX}/stripe/create-checkout/`, {
    price_id: priceId,
  });
  return data;
}

// ==============================================================================
// CV LINK POLICY API
// ==============================================================================

export async function updateCVLinkPolicy(
  cvId: number,
  visibility: "public_with_expiry" | "private_tokenized",
  expiryMonths: number,
): Promise<{ visibility: string; access_token: string | null; expires_at: string | null }> {
  const { data } = await api.put(`${API_V1_PREFIX}/cv/${cvId}/link-policy/`, {
    visibility,
    expiry_months: expiryMonths,
  });
  return data;
}

// ==============================================================================
// ENTITLEMENTS API
// ==============================================================================

export interface Entitlement {
  feature: string;
  is_active: boolean;
  expires_at: string | null;
}

export async function listEntitlements(): Promise<Entitlement[]> {
  const { data } = await api.get<Entitlement[]>(`${API_V1_PREFIX}/entitlements/`);
  return data;
}

export default api;
