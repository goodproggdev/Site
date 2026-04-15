/**
 * Imposta title e meta tag per la pagina CV pubblica (/u/:slug).
 * Crawler che eseguono JS possono leggere questi valori dopo il fetch.
 */

const IDS = {
  desc: "cv-public-meta-description",
  ogTitle: "cv-public-meta-og-title",
  ogDesc: "cv-public-meta-og-description",
  ogUrl: "cv-public-meta-og-url",
  twTitle: "cv-public-meta-tw-title",
  twDesc: "cv-public-meta-tw-description",
  canonical: "cv-public-link-canonical",
} as const;

function upsertMeta(selector: "name" | "property", key: string, content: string, id: string) {
  let el = document.getElementById(id) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.id = id;
    el.setAttribute(selector, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.getElementById(IDS.canonical) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.id = IDS.canonical;
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeById(id: string) {
  document.getElementById(id)?.remove();
}

export function applyPublicCvMeta(opts: { title: string; description: string; pageUrl: string }) {
  document.title = opts.title;

  const desc = opts.description.slice(0, 320);
  upsertMeta("name", "description", desc, IDS.desc);
  upsertMeta("property", "og:title", opts.title, IDS.ogTitle);
  upsertMeta("property", "og:description", desc, IDS.ogDesc);
  upsertMeta("property", "og:url", opts.pageUrl, IDS.ogUrl);
  upsertMeta("name", "twitter:title", opts.title, IDS.twTitle);
  upsertMeta("name", "twitter:description", desc, IDS.twDesc);
  upsertCanonical(opts.pageUrl);
}

export function clearPublicCvMeta(fallbackTitle: string) {
  document.title = fallbackTitle;
  for (const id of Object.values(IDS)) {
    removeById(id);
  }
}

export function pickCvMetaFromPayload(data: Record<string, unknown>, slug: string) {
  const name = typeof data.name === "string" && data.name.trim() ? data.name.trim() : slug.replace(/-/g, " ");
  let description = "";
  if (typeof data.presentation === "string" && data.presentation.trim()) {
    description = data.presentation.trim();
  } else if (data.about && typeof data.about === "object" && data.about !== null) {
    const who = (data.about as { who?: string }).who;
    const details = (data.about as { details?: string }).details;
    description = [who, details].filter(Boolean).join(" ").trim();
  }
  if (!description) {
    description = name;
  }
  return { name, description: description.slice(0, 300) };
}
