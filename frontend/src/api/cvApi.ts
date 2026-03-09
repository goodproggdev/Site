/**
 * Layer centralizzato per le chiamate API al backend Django.
 * Tutte le fetch al backend devono passare da qui.
 */
import axios from "axios";
import type {
  AuthTokens,
  LoginCredentials,
  CVData,
  ParseCVResponse,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
          // Refresh scaduto → logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// ==============================================================================
// AUTH API
// ==============================================================================

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/token/", credentials);
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout/");
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
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
  const { data } = await api.post<ParseCVResponse>("/api/parse-cv-upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getMyCVList(): Promise<CVData[]> {
  const { data } = await api.get<CVData[]>("/api/cv/");
  return data;
}

export async function deleteCV(cvId: number): Promise<void> {
  await api.delete(`/api/cv/${cvId}/delete/`);
}

export async function getJsonData(): Promise<unknown> {
  const { data } = await api.get("/api/data/");
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
  const { data } = await api.post("/api/contact/", payload);
  return data;
}

export default api;
