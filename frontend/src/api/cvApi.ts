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
	  RestAuthUserDetails,
} from "./types";

const API_BASE =
	  import.meta.env.VITE_API_BASE_URL ||
	  import.meta.env.VITE_API_URL ||
	  "http://localhost:8000";
const API_V1_PREFIX = "/api/v1";

function notifyAuthTokensChanged() {
		if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("auth-token-changed"));
		}
}

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
										          if (typeof data.refresh === "string" && data.refresh.length > 0) {
													              localStorage.setItem("refresh_token", data.refresh);
												  }
										          originalRequest.headers.Authorization = `Bearer ${data.access}`;
										          notifyAuthTokensChanged();
										          return api(originalRequest);
									} catch {
										          // Refresh scaduto → logout e home coerente con `/:lang` (nessuna route `/login`)
							          localStorage.removeItem("access_token");
										          localStorage.removeItem("refresh_token");
										          notifyAuthTokensChanged();
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
	  notifyAuthTokensChanged();
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
				        notifyAuthTokensChanged();
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
	  const refresh = localStorage.getItem("refresh_token");
	  try {
		      if (refresh) {
				        await api.post("/auth/logout/", { refresh });
			  } else {
				        await api.post("/auth/logout/");
			  }
	  } finally {
		      localStorage.removeItem("access_token");
		      localStorage.removeItem("refresh_token");
		      notifyAuthTokensChanged();
	  }
}

/** Conferma email (dj-rest-auth): POST body `{ key }` dal link ricevuto per email. */
export async function verifyEmail(
	  key: string,
	): Promise<{ verified: true } | { verified: false; drfData: unknown | null }> {
	  try {
		      await api.post("/auth/registration/verify-email/", { key });
		      return { verified: true };
	  } catch (e) {
		      if (axios.isAxiosError(e)) {
				        return { verified: false, drfData: e.response?.data ?? null };
			  }
		      return { verified: false, drfData: null };
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

export async function getUserDetails(): Promise<RestAuthUserDetails> {
	  const { data } = await api.get<RestAuthUserDetails>("/auth/user/");
	  return data;
}

export async function patchUserDetails(
	  body: Partial<Pick<RestAuthUserDetails, "first_name" | "last_name">>,
	): Promise<RestAuthUserDetails> {
	  const { data } = await api.patch<RestAuthUserDetails>("/auth/user/", body);
	  return data;
}

export async function changePassword(payload: {
	  old_password: string;
	  new_password1: string;
	  new_password2: string;
}): Promise<void> {
	  await api.post("/auth/password/change/", payload);
}

// ==============================================================================
// CV API
// ==============================================================================

export type UploadParseCvResult = ParseCVResponse & { cv_id?: number; slug?: string };

/**
 * Upload multipart: non impostare Content-Type manualmente (manca il boundary).
 * L'istanza Axios ha default `application/json`: va rimosso per FormData così il browser aggiunge `multipart/form-data; boundary=...`.
 */
export async function uploadAndParseCV(
	  file: File,
	  category?: string,
	  targetPositions?: string,
	): Promise<UploadParseCvResult> {
	  const formData = new FormData();
	  formData.append("cv_file", file);
	  // Vanno inviati insieme al file nella stessa richiesta: `generate_category_sections`
  // gira in modo sincrono dentro `parse_cv_from_file` (vedi CVData.objects.create in
  // parse_cv_upload_view) e non esiste un endpoint per rigenerare questi contenuti a
  // posteriori su un CV già creato (CVUpdateView.post aggiorna solo `raw_json`).
  if (category) {
	      formData.append("category", category);
  }
	  if (targetPositions && targetPositions.trim()) {
		      formData.append("target_positions", targetPositions.trim());
	  }
	  const { data } = await api.post<Record<string, unknown>>(`${API_V1_PREFIX}/parse-cv-upload/`, formData, {
		      transformRequest: [
				        (body, headers) => {
							        if (body instanceof FormData) {
										          const h = headers as unknown as Record<string, string | undefined>;
										          delete h["Content-Type"];
										          delete h["content-type"];
									}
							        return body;
						},
				      ],
	  });

  const parsed = data.parsed_data;
	  if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
		      const inner = parsed as Record<string, unknown>;
		      const cvIdRaw = data.cv_id;
		      const cvId =
				        typeof cvIdRaw === "number"
		          ? cvIdRaw
				          : typeof cvIdRaw === "string"
		            ? Number.parseInt(cvIdRaw, 10)
				            : NaN;
		      return {
				        ...(inner as unknown as ParseCVResponse),
				        cv_id: Number.isFinite(cvId) ? cvId : undefined,
				        slug: typeof data.slug === "string" ? data.slug : undefined,
			  };
	  }

  return data as unknown as UploadParseCvResult;
}

export async function getMyCVList(): Promise<CVData[]> {
	  const { data } = await api.get<CVData[]>(`${API_V1_PREFIX}/cv/`);
	  return data;
}

export async function deleteCV(cvId: number): Promise<void> {
	  await api.delete(`${API_V1_PREFIX}/cv/${cvId}/delete/`);
}

/** Segna un job match come salvato (o altro stato consentito dal backend). */
export async function updateJobMatchStatus(matchId: string, status: "viewed" | "saved" | "applied" | "dismissed"): Promise<void> {
	  await api.post(`${API_V1_PREFIX}/jobs/matches/${matchId}/status/`, { status });
}

export async function getCvDetail(cvId: number): Promise<CVData> {
	  const { data } = await api.get<CVData>(`${API_V1_PREFIX}/cv/${cvId}/`);
	  return data;
}

/** Bozza vuota per wizard senza upload (compilazione manuale). */
export async function createCvDraft(): Promise<CVData> {
	  const { data } = await api.post<CVData>(`${API_V1_PREFIX}/cv/draft/`, {});
	  return data;
}

export async function updateCvData(cvId: number, cv_data: Record<string, unknown>): Promise<void> {
	  await api.post(`${API_V1_PREFIX}/cv/update/${cvId}/`, { cv_data });
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

export type CheckoutSessionResponse = {
	  url?: string;
	  session_id?: string;
	  error?: string;
};

export type CreateCheckoutOptions = {
	  cv_id?: number;
	  feature?: string;
	  plan_type?: string;
	  checkout_mode?: "payment" | "subscription";
	  lang?: string;
};

export async function createCheckoutSession(
	  priceId: string,
	  options?: CreateCheckoutOptions,
	): Promise<{ url: string; session_id?: string }> {
	  try {
		      const { data } = await api.post<CheckoutSessionResponse>(
				        `${API_V1_PREFIX}/stripe/create-checkout/`,
				  {
					          price_id: priceId,
					          ...(options?.cv_id != null ? { cv_id: options.cv_id } : {}),
					          ...(options?.feature ? { feature: options.feature } : {}),
					          ...(options?.plan_type ? { plan_type: options.plan_type } : {}),
					          ...(options?.checkout_mode ? { checkout_mode: options.checkout_mode } : {}),
					          ...(options?.lang ? { lang: options.lang } : {}),
				  },
				      );
		      if (typeof data.error === "string") {
				        throw new Error(data.error);
			  }
		      if (typeof data.url !== "string" || !data.url) {
				        throw new Error("Checkout response missing redirect URL");
			  }
		      return { url: data.url, session_id: data.session_id };
	  } catch (e) {
		      if (
				        axios.isAxiosError(e) &&
				        e.response?.data &&
				        typeof (e.response.data as { error?: string }).error === "string"
				      ) {
				        throw new Error((e.response.data as { error: string }).error);
			  }
		      throw e;
	  }
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
