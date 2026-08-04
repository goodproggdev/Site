/**
 * Adapter "tutto in uno" per la nuova pagina pubblica del CV a template intero
 * (vedi `pages/PublicCvTemplate.tsx`). Legge dal payload `raw_json` (arricchito
 * lato backend con `_category` / `_show_pricing`, vedi `CVPublicView`) tutti i
 * dati necessari a popolare Hero, Chi Sono, Info personali e Social — le altre
 * sezioni (esperienza/formazione/skills/expertise/portfolio/servizi/tariffe/
 * statistiche/lingue) usano gli adapter già esistenti in `cvTemplateLists.ts`
 * e `cvExtraSections.ts`.
 */

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

function str(x: unknown): string {
  return typeof x === "string" ? x.trim() : x != null ? String(x).trim() : "";
}

export interface PublicCvHero {
  name: string;
  /** Es. "Ciao, Sono un" — piccola label sopra il nome. */
  presentation: string;
  /** Es. "Backend & Integration Analyst" — sottotitolo/ruolo sotto il nome. */
  subtitle: string;
  /** Es. "Chi Sono?" — label per l'intestazione della sezione about. */
  whoAmILabel: string;
  aboutWho: string;
  aboutDetails: string;
  printResumeLabel: string;
  downloadCvLabel: string;
}

export interface PublicCvPersonalInfo {
  birthdate: string;
  workEmail: string;
  personalEmail: string;
  workNumber: string;
  instagram: string;
}

export interface PublicCvSocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  github: string;
  linkedin: string;
}

function isPlaceholder(v: string): boolean {
  // I dati di esempio per categoria usano placeholder come "#" o "DD/MM/YYYY":
  // non hanno senso mostrati come dati reali sulla pagina pubblica.
  if (!v) return true;
  if (v === "#") return true;
  if (/^[XD/]+$/i.test(v)) return true;
  return false;
}

export function readHero(raw: Record<string, unknown> | null | undefined): PublicCvHero {
  if (!raw) {
    return {
      name: "",
      presentation: "",
      subtitle: "",
      whoAmILabel: "Chi Sono?",
      aboutWho: "",
      aboutDetails: "",
      printResumeLabel: "Stampa CV",
      downloadCvLabel: "Scarica il mio CV",
    };
  }
  const pi = asRecord(raw.personal_info) ?? {};
  const about = asRecord(raw.about) ?? {};
  const name = str(pi.name) || str(raw.name);
  const subtitle = str(pi.title) || str(raw.header_mono_subtitle);
  return {
    name,
    presentation: str(raw.presentation) || "Ciao, sono",
    subtitle,
    whoAmILabel: str(raw.who_am_i) || "Chi Sono?",
    aboutWho: str(about.who),
    aboutDetails: str(about.details),
    printResumeLabel: str(raw.print_resume) || "Stampa CV",
    downloadCvLabel: str(raw.download_my_cv) || "Scarica il mio CV",
  };
}

export function readPersonalInfo(raw: Record<string, unknown> | null | undefined): PublicCvPersonalInfo {
  const pi = asRecord(raw?.personal_info) ?? {};
  const clean = (v: unknown) => {
    const s = str(v);
    return isPlaceholder(s) ? "" : s;
  };
  return {
    birthdate: clean(pi.birthdate),
    workEmail: clean(pi.work_email) || clean(raw?.email),
    personalEmail: clean(pi.personal_email),
    workNumber: clean(pi.work_number) || clean(raw?.phone_number),
    instagram: clean(pi.instagram),
  };
}

export function readSocialLinks(raw: Record<string, unknown> | null | undefined): PublicCvSocialLinks {
  const sl = asRecord(raw?.social_links) ?? {};
  const clean = (v: unknown) => {
    const s = str(v);
    return isPlaceholder(s) ? "" : s;
  };
  return {
    facebook: clean(sl.facebook),
    twitter: clean(sl.twitter),
    instagram: clean(sl.instagram),
    github: clean(sl.github),
    linkedin: clean(sl.linkedin),
  };
}

export interface PublicCvBlogPost {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export function readBlogPosts(raw: Record<string, unknown> | null | undefined): PublicCvBlogPost[] {
  const arr = Array.isArray(raw?.blog_posts) ? (raw!.blog_posts as unknown[]) : [];
  return arr
    .map((it) => {
      const o = asRecord(it);
      if (!o) return null;
      const title = str(o.title);
      if (!title) return null;
      return {
        title,
        description: str(o.description),
        image: str(o.image),
        alt: str(o.alt),
      };
    })
    .filter((x): x is PublicCvBlogPost => x !== null);
}
