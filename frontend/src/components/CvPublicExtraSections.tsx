import { useTranslation } from "react-i18next";
import {
  readExtraSections,
  readCvCategory,
  readShowServicesPricing,
} from "../utils/cvExtraSections";
import type { CvAccent } from "./CvPublicSections";

function accentTextClass(accent: CvAccent): string {
  if (accent === "violet") return "text-violet-600 dark:text-violet-400";
  if (accent === "teal") return "text-teal-600 dark:text-teal-400";
  return "text-indigo-600 dark:text-indigo-400";
}

function SectionHeading({ title, accent }: { title: string; accent: CvAccent }) {
  return <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>;
}

export interface CvPublicExtraSectionsProps {
  /** Payload compatibile con `raw_json` (eventualmente con `_category` / `_show_services_pricing`, vedi CVPublicView). */
  raw: Record<string, unknown> | null | undefined;
  accent?: CvAccent;
}

/**
 * Sezioni "ricche" della pagina CV pubblica: Competenze chiave, Portfolio,
 * Servizi, Tariffe, Statistiche, Lingue. A differenza delle sezioni base
 * (esperienza/formazione/competenze in `CvPublicSections`), queste vengono
 * mostrate solo se ci sono davvero dati da mostrare — e, per Servizi/Tariffe,
 * solo se compatibili con la categoria professionale del CV (vedi
 * `readShowServicesPricing`, popolato lato backend in base a categoria +
 * scelta esplicita dell'utente).
 */
export default function CvPublicExtraSections({ raw, accent = "indigo" }: CvPublicExtraSectionsProps) {
  const { t } = useTranslation();
  if (!raw) return null;

  const sections = readExtraSections(raw);
  const category = readCvCategory(raw);
  const showServicesPricing = readShowServicesPricing(raw);

  const hasExpertise = sections.expertise.length > 0;
  const hasLanguages = sections.languages.length > 0;
  const hasStatistics = sections.statistics.length > 0;
  const hasPortfolio = sections.portfolio.length > 0;
  const hasServices = showServicesPricing && sections.services.length > 0;
  const hasPricing = showServicesPricing && sections.pricingPacks.length > 0;

  if (!hasExpertise && !hasLanguages && !hasStatistics && !hasPortfolio && !hasServices && !hasPricing) {
    return null;
  }

  return (
    <div className="mt-6 text-gray-600 dark:text-gray-300 lg:mt-8" data-cv-category={category || undefined}>
      {hasExpertise ? (
        <div className="mt-6">
          <SectionHeading title={t("cvEditor.sections.expertise")} accent={accent} />
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sections.expertise.map((item, idx) => (
              <li key={`${item.name}-${idx}`} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                {item.subtitle ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasStatistics ? (
        <div className="mt-6">
          <SectionHeading title={t("cvEditor.sections.statistics")} accent={accent} />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sections.statistics.map((stat, idx) => (
              <div key={`${stat.label}-${idx}`} className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800">
                <p className={`text-lg font-bold ${accentTextClass(accent)}`}>{stat.count}</p>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasLanguages ? (
        <div className="mt-6">
          <SectionHeading title={t("cvEditor.sections.languages")} accent={accent} />
          <div className="mt-3 flex flex-wrap gap-2">
            {sections.languages.map((lang, idx) => (
              <span
                key={`${lang.name}-${idx}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100"
              >
                {lang.name}
                {lang.level ? <span className="ml-1 text-gray-500 dark:text-gray-400">· {lang.level}</span> : null}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {hasPortfolio ? (
        <div className="mt-6">
          <SectionHeading title={t("cvEditor.sections.portfolio")} accent={accent} />
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sections.portfolio.map((item, idx) => (
              <li key={`${item.title}-${idx}`} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                {item.title ? <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p> : null}
                {item.subtitle ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasServices ? (
        <div className="mt-6">
          <SectionHeading title={t("cvEditor.sections.services")} accent={accent} />
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sections.services.map((item, idx) => (
              <li key={`${item.title}-${idx}`} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasPricing ? (
        <div className="mt-6">
          <SectionHeading title={t("cvEditor.sections.pricing")} accent={accent} />
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {sections.pricingPacks.map((pack, idx) => (
              <li
                key={`${pack.title}-${idx}`}
                className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{pack.title}</p>
                {pack.cost ? (
                  <p className={`mt-1 text-sm font-bold ${accentTextClass(accent)}`}>{pack.cost}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
