/** URL pagina LinkedIn aziendale (footer). Default: home LinkedIn. */
export const LINKEDIN_COMPANY_URL =
  (import.meta.env.VITE_LINKEDIN_COMPANY_URL as string | undefined)?.trim() || "https://www.linkedin.com/";

/** Titolo documento quando si esce dalla pagina CV pubblica. */
export const DEFAULT_DOCUMENT_TITLE =
  (import.meta.env.VITE_DEFAULT_DOCUMENT_TITLE as string | undefined)?.trim() || "Nordevit";

export function publicCvAbsoluteUrl(slug: string): string {
  if (typeof window === "undefined") {
    return `/u/${slug}`;
  }
  return `${window.location.origin}/u/${slug}`;
}

/** Profilo LinkedIn (utente loggato) — modifica contatti / siti web. */
export const LINKEDIN_PROFILE_CONTACT_EDIT =
  "https://www.linkedin.com/in/me/edit/forms/contact-info/";
