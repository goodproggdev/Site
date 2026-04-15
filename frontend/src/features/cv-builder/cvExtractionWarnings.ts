import type { CVData } from './CVWizard';

/** True se il backend ha segnalato PDF senza layer testo e l’anagrafica è ancora vuota. */
export function shouldShowPdfNoTextLayerWarning(cvData: CVData): boolean {
  const raw = cvData.parsedData;
  if (!raw || typeof raw !== 'object') return false;
  const meta = raw.nordevit_extraction as { warnings?: unknown } | undefined;
  const warnings = meta?.warnings;
  if (!Array.isArray(warnings) || !warnings.includes('pdf_no_text_layer')) return false;
  const p = cvData.personalInfo || {};
  const hasPersonal =
    String(p.firstName ?? '').trim() !== '' ||
    String(p.lastName ?? '').trim() !== '' ||
    String(p.email ?? '').trim() !== '';
  return !hasPersonal;
}
