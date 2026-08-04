/**
 * Adapter per le sezioni "ricche" del template CV (expertise, portfolio, servizi,
 * tariffe, statistiche, lingue) che il backend puo' popolare con contenuti reali
 * (estratti dal CV) o "a template" per categoria professionale (vedi
 * `backend/api/services/cv_category_content.py`).
 *
 * Queste sezioni erano gia' previste nella struttura JSON del parser
 * (`originalJsonStructure` in demo_resume_parser.py) ma non venivano mai lette
 * dal frontend: qui le esponiamo in forma tipizzata, pronte per il rendering.
 */

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

function asArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}

export interface ExpertiseItem {
  name: string;
  iconClass: string;
  subtitle: string;
}

export interface LanguageItem {
  name: string;
  level: string;
}

export interface StatisticItem {
  icon: string;
  iconClass: string;
  count: string | number;
  label: string;
}

export interface PortfolioItem {
  title: string;
  subtitle: string;
  image: string;
  alt: string;
}

export interface ServiceItem {
  icon: string;
  iconClass: string;
  title: string;
  description: string;
}

export interface PricingPack {
  title: string;
  cost: string;
  project: string;
  storage: string;
  domain: string;
  users: string;
  specialClass: string;
}

export function readExpertiseList(raw: Record<string, unknown>): ExpertiseItem[] {
  return asArray(raw.expertise_list)
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const name = String(o.name ?? "").trim();
      if (!name) return null;
      return {
        name,
        iconClass: String(o.icon_class ?? "").trim(),
        subtitle: String(o.subtitle ?? "").trim(),
      };
    })
    .filter((x): x is ExpertiseItem => x !== null);
}

export function readLanguagesList(raw: Record<string, unknown>): LanguageItem[] {
  return asArray(raw.languages)
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const name = String(o.name ?? "").trim();
      if (!name) return null;
      return { name, level: String(o.level ?? "").trim() };
    })
    .filter((x): x is LanguageItem => x !== null);
}

export function readStatistics(raw: Record<string, unknown>): StatisticItem[] {
  return asArray(raw.statistics)
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const label = String(o.label ?? "").trim();
      const count = o.count;
      if (!label || count === undefined || count === null || count === "") return null;
      return {
        icon: String(o.icon ?? "").trim(),
        iconClass: String(o.icon_class ?? "").trim(),
        count: typeof count === "number" ? count : String(count),
        label,
      };
    })
    .filter((x): x is StatisticItem => x !== null);
}

export function readPortfolioItems(raw: Record<string, unknown>): PortfolioItem[] {
  return asArray(raw.portfolio_items)
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const title = String(o.title ?? "").trim();
      const subtitle = String(o.subtitle ?? "").trim();
      if (!title && !subtitle) return null;
      return {
        title,
        subtitle,
        image: String(o.image ?? "").trim(),
        alt: String(o.alt ?? "").trim(),
      };
    })
    .filter((x): x is PortfolioItem => x !== null);
}

export function readServices(raw: Record<string, unknown>): ServiceItem[] {
  return asArray(raw.services)
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const title = String(o.title ?? "").trim();
      if (!title) return null;
      return {
        icon: String(o.icon ?? "").trim(),
        iconClass: String(o.icon_class ?? "").trim(),
        title,
        description: String(o.description ?? "").trim(),
      };
    })
    .filter((x): x is ServiceItem => x !== null);
}

export function readPricingPacks(raw: Record<string, unknown>): PricingPack[] {
  return asArray(raw.pricing_packs)
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const title = String(o.title ?? "").trim();
      if (!title) return null;
      return {
        title,
        cost: String(o.cost ?? "").trim(),
        project: String(o.project ?? "").trim(),
        storage: String(o.storage ?? "").trim(),
        domain: String(o.domain ?? "").trim(),
        users: String(o.users ?? "").trim(),
        specialClass: String(o.special_class ?? "").trim(),
      };
    })
    .filter((x): x is PricingPack => x !== null);
}

/**
 * Categoria professionale del CV. Presente solo nel payload della pagina
 * pubblica (`CVPublicView`, chiave `_category`); assente altrove (es. editor).
 */
export function readCvCategory(raw: Record<string, unknown> | null | undefined): string {
  if (!raw) return "";
  return String(raw._category ?? "").trim();
}

/**
 * Indica se, per questo CV, vanno mostrate le sezioni Servizi/Tariffe.
 * La chiave `_show_services_pricing` è presente solo nel payload pubblico:
 * se assente (es. contesto editor) non applichiamo alcuna restrizione,
 * lasciando che sia solo la presenza dei dati a decidere.
 */
export function readShowServicesPricing(raw: Record<string, unknown> | null | undefined): boolean {
  if (!raw || !("_show_services_pricing" in raw)) return true;
  return raw._show_services_pricing !== false;
}

export interface ExtraSections {
  expertise: ExpertiseItem[];
  languages: LanguageItem[];
  statistics: StatisticItem[];
  portfolio: PortfolioItem[];
  services: ServiceItem[];
  pricingPacks: PricingPack[];
}

export function readExtraSections(raw: Record<string, unknown> | null | undefined): ExtraSections {
  if (!raw || typeof raw !== "object") {
    return { expertise: [], languages: [], statistics: [], portfolio: [], services: [], pricingPacks: [] };
  }
  return {
    expertise: readExpertiseList(raw),
    languages: readLanguagesList(raw),
    statistics: readStatistics(raw),
    portfolio: readPortfolioItems(raw),
    services: readServices(raw),
    pricingPacks: readPricingPacks(raw),
  };
}
