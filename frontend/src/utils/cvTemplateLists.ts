/**
 * Adapter per le liste del template CV (parser Django / `originalJsonStructure`):
 * `work_experience_list`, `education_list`, `skills`.
 */

export interface TemplateListItem {
  period: string;
  title: string;
  subtitle: string;
}

export interface TemplateSkill {
  name: string;
  level: string;
}

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

/** Normalizza una voce esperienza/formazione verso period / title / subtitle. */
export function normalizeListItem(item: unknown): TemplateListItem {
  const o = asRecord(item);
  if (!o) {
    return { period: "", title: "", subtitle: "" };
  }
  const pick = (a: unknown, b: unknown) => (a != null && String(a).trim() !== "" ? a : b);
  const period = pick(
    pick(o.period, o.Period),
    pick(o.dates, pick(o.date_range, pick(o.years, o.timeframe))),
  );
  const title = pick(
    pick(o.title, o.Title),
    pick(o.degree, pick(o.role, pick(o.position, o.job_title))),
  );
  const subtitle = pick(
    pick(o.subtitle, o.Subtitle),
    pick(o.company, pick(o.Company, pick(o.institution, pick(o.employer, o.organization)))),
  );
  return {
    period: String(period ?? ""),
    title: String(title ?? ""),
    subtitle: String(subtitle ?? ""),
  };
}

/** Preferisce il primo array non vuoto tra le chiavi indicate; altrimenti il primo array trovato (anche vuoto). */
function firstArray(raw: Record<string, unknown>, keys: string[]): unknown[] {
  let firstAny: unknown[] | null = null;
  for (const k of keys) {
    const v = raw[k];
    if (!Array.isArray(v)) continue;
    if (firstAny === null) firstAny = v;
    if (v.length > 0) return v;
  }
  return firstAny ?? [];
}

export function readWorkExperienceList(raw: Record<string, unknown>): TemplateListItem[] {
  const arr = firstArray(raw, ["work_experience_list", "experience", "work_experience", "employment", "positions"]);
  return arr.map(normalizeListItem);
}

export function readEducationList(raw: Record<string, unknown>): TemplateListItem[] {
  const arr = firstArray(raw, ["education_list", "education", "studies", "degrees"]);
  return arr.map(normalizeListItem);
}

export function readSkillsList(raw: Record<string, unknown>): TemplateSkill[] {
  const skillsRaw = raw.skills;
  if (!Array.isArray(skillsRaw)) return [];
  const out: TemplateSkill[] = [];
  for (const item of skillsRaw) {
    if (typeof item === "string") {
      const name = item.trim();
      if (name) out.push({ name, level: "N/A" });
      continue;
    }
    const o = asRecord(item);
    if (o) {
      const name = String(o.name ?? "").trim();
      if (name) {
        out.push({
          name,
          level: String(o.level ?? "N/A").trim() || "N/A",
        });
      }
    }
  }
  return out;
}

export interface TemplateLists {
  work_experience_list: TemplateListItem[];
  education_list: TemplateListItem[];
  skills: TemplateSkill[];
}

export function readTemplateLists(raw: Record<string, unknown> | null | undefined): TemplateLists {
  if (!raw || typeof raw !== "object") {
    return { work_experience_list: [], education_list: [], skills: [] };
  }
  return {
    work_experience_list: readWorkExperienceList(raw),
    education_list: readEducationList(raw),
    skills: readSkillsList(raw),
  };
}

function serializeList(items: TemplateListItem[]): Array<{ period: string; title: string; subtitle: string }> {
  return items.map((i) => ({
    period: i.period.trim(),
    title: i.title.trim(),
    subtitle: i.subtitle.trim(),
  }));
}

function serializeSkills(items: TemplateSkill[]): Array<{ name: string; level: string }> {
  return items
    .filter((s) => s.name.trim())
    .map((s) => ({
      name: s.name.trim(),
      level: (s.level || "N/A").trim() || "N/A",
    }));
}

/** Applica le tre liste su `raw_json` mantenendo le altre chiavi. */
export function patchTemplateLists(
  raw: Record<string, unknown>,
  patch: TemplateLists,
): Record<string, unknown> {
  return {
    ...raw,
    work_experience_list: serializeList(patch.work_experience_list),
    education_list: serializeList(patch.education_list),
    skills: serializeSkills(patch.skills),
  };
}

/** True se c’è almeno un contenuto utile da mostrare nelle sezioni. */
export function templateListsHaveContent(lists: TemplateLists): boolean {
  const hasItem = (xs: TemplateListItem[]) =>
    xs.some((x) => x.period.trim() || x.title.trim() || x.subtitle.trim());
  return hasItem(lists.work_experience_list) || hasItem(lists.education_list) || lists.skills.length > 0;
}
