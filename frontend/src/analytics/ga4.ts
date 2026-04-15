/**
 * Google Analytics 4 (gtag) — caricamento lazy dopo consenso cookie.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

let loadPromise: Promise<void> | null = null;

function ensureDataLayer(): void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args);
    };
  }
}

/**
 * Carica gtag.js e configura l’ID. `send_page_view: false` — le page view sono inviate esplicitamente (SPA).
 */
export function loadGa4Script(): Promise<void> {
  if (!MEASUREMENT_ID) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    ensureDataLayer();
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.onload = () => {
      window.gtag!("js", new Date());
      window.gtag!("config", MEASUREMENT_ID, { send_page_view: false });
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load gtag.js"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGa4Configured(): boolean {
  return !!MEASUREMENT_ID;
}

const CONSENT_KEY = "cookie-consent";

/** Carica GA4 solo se l’utente ha accettato i cookie analytics (`cookie-consent=accepted`). */
export async function ensureGa4ScriptForAcceptedUser(): Promise<boolean> {
  if (!MEASUREMENT_ID) return false;
  if (typeof localStorage === "undefined") return false;
  if (localStorage.getItem(CONSENT_KEY) !== "accepted") return false;
  await loadGa4Script();
  setAnalyticsConsent(true);
  return true;
}

/** Consent Mode v2 — analytics_storage. */
export function setAnalyticsConsent(granted: boolean): void {
  if (!window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function trackPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? (typeof document !== "undefined" ? document.title : undefined),
    send_to: MEASUREMENT_ID,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}
