/**
 * Tipi TypeScript per i dati del CV e dell'API backend.
 */

export interface UserProfile {
  id: number | string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  plan?: "free" | "pro" | "enterprise";
  is_email_verified?: boolean;
  date_joined?: string;
}

export interface CVData {
  id: number;
  slug: string;
  language: string;
  template_slug: string;
  is_published: boolean;
  original_filename: string;
  raw_json: CVParsedData;
  created_at: string;
  updated_at: string;
}

export interface CVParsedData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  summary?: string;
  skills?: string[];
  experience?: WorkExperience[];
  education?: Education[];
  languages?: Language[];
  error?: string;
  [key: string]: unknown;
}

export interface WorkExperience {
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Education {
  degree?: string;
  institution?: string;
  year?: string;
  field?: string;
}

export interface Language {
  name: string;
  level?: string;
}

export interface Payment {
  id: number;
  stripe_payment_id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  description: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Corpo POST `/auth/registration/` (dj-rest-auth + allauth). */
export interface RegisterPayload {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

/** Risposta tipica `GET/PATCH /auth/user/` (dj-rest-auth). */
export interface RestAuthUserDetails {
  pk: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ParseCVResponse extends CVParsedData {
  error?: string;
  cv_id?: number;
  slug?: string;
  parsed_data?: CVParsedData;
}
