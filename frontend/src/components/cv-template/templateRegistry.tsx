import type { ComponentType } from "react";
import PublicCvTemplateDefault from "./PublicCvTemplateDefault";

export interface PublicCvTemplateProps {
  raw: Record<string, unknown>;
}

/**
 * Registro dei template disponibili per la pagina pubblica del CV, selezionato
 * tramite `CVData.template_slug` (esposto nel payload pubblico come
 * `_template_slug`). Oggi esiste un solo template completo ("default"); questo
 * registro è pensato per aggiungerne altri in futuro senza toccare
 * `PublicCV.tsx` — basta registrare qui il nuovo componente.
 */
const TEMPLATES: Record<string, ComponentType<PublicCvTemplateProps>> = {
  default: PublicCvTemplateDefault,
};

export function getPublicCvTemplate(templateSlug: string | null | undefined): ComponentType<PublicCvTemplateProps> {
  if (templateSlug && TEMPLATES[templateSlug]) return TEMPLATES[templateSlug];
  return TEMPLATES.default;
}
