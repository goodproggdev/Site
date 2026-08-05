/**
 * Error tracking (Sentry) — CV_Update.md sez. 5 "Gestione Errori in Produzione".
 *
 * Inerte finche' non viene impostata la variabile d'ambiente VITE_SENTRY_DSN in
 * fase di build (nessun account Sentry creato in questa sessione: serve un DSN
 * generato dall'utente sul proprio account). Import dinamico + try/catch: se
 * "@sentry/react" non fosse disponibile o l'init fallisse per qualsiasi motivo,
 * l'app deve continuare a funzionare normalmente (stesso principio difensivo
 * gia' applicato lato backend per l'import di cv_og_image.py in questa sessione).
 */
let sentryReportError: ((error: unknown, extra?: Record<string, unknown>) => void) | null = null;

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  import('@sentry/react')
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || (import.meta.env.PROD ? 'production' : 'development'),
        tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
        sendDefaultPii: false,
      });
      sentryReportError = (error, extra) => Sentry.captureException(error, extra ? { extra } : undefined);
    })
    .catch((err) => {
      console.error('Inizializzazione Sentry fallita, continuo senza error tracking:', err);
    });
}

/** Usato da ErrorBoundary per inoltrare gli errori catturati a Sentry, se attivo. */
export function reportErrorToSentry(error: unknown, extra?: Record<string, unknown>): void {
  sentryReportError?.(error, extra);
}
