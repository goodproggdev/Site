import type { CVData as ApiCVRecord } from "../api/types";
import { normalizeListItem, readSkillsList, readWorkExperienceList, readEducationList } from "./cvTemplateLists";

/** Stato wizard (stesso shape di `CVWizard` senza import ciclico). */
export interface WizardCvState {
  personalInfo: Record<string, string>;
  experience: unknown[];
  education: unknown[];
  skills: string[];
  uploadedFile?: File | null;
  parsedData?: Record<string, unknown> | null;
  cvId?: number | null;
}

/** Converte raw_json del backend nel modello locale del wizard. */
export function rawJsonToWizardCvData(raw: Record<string, unknown> | null | undefined): Partial<WizardCvState> {
  if (!raw || typeof raw !== "object") {
    return { personalInfo: {}, experience: [], education: [], skills: [], parsedData: {} };
  }
  const pi = (raw.personal_info as Record<string, unknown>) || {};
  const fullName = String(pi.name ?? raw.name ?? "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = String(pi.first_name ?? pi.firstName ?? parts[0] ?? "");
  const lastName = String(
    pi.last_name ?? pi.lastName ?? (parts.length > 1 ? parts.slice(1).join(" ") : ""),
  );
  const about = (raw.about as Record<string, unknown>) || {};
  const aboutText = [String(about.who ?? "").trim(), String(about.details ?? "").trim()]
    .filter(Boolean)
    .join("\n\n")
    .trim();
  const summaryText = String(raw.summary ?? pi.summary ?? pi.bio ?? aboutText ?? "").trim();

  const skillsFromTemplate = readSkillsList(raw);
  const skills = skillsFromTemplate.map((s) => s.name);

  const experienceItems = readWorkExperienceList(raw);
  const educationItems = readEducationList(raw);

  return {
    personalInfo: {
      firstName,
      lastName,
      email: String(pi.work_email ?? pi.personal_email ?? pi.email ?? raw.email ?? ""),
      phone: String(pi.work_number ?? pi.phone ?? raw.phone ?? ""),
      bio: summaryText,
      summary: summaryText,
    },
    experience: experienceItems as unknown[],
    education: educationItems as unknown[],
    skills,
    parsedData: { ...raw },
  };
}

/** Unisce le modifiche del wizard nel raw_json esistente (mantiene chiavi extra). */
export function mergeWizardIntoRawJson(
  base: Record<string, unknown>,
  cv: WizardCvState,
): Record<string, unknown> {
  const pi = { ...(typeof base.personal_info === "object" && base.personal_info ? base.personal_info : {}) } as Record<
    string,
    unknown
  >;
  const { firstName, lastName, email, phone, bio, summary } = cv.personalInfo;
  const bioText = String(bio ?? summary ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || String(pi.name ?? "");
  pi.first_name = firstName;
  pi.last_name = lastName;
  pi.name = name;
  pi.email = email;
  pi.phone = phone;
  if (email) {
    pi.work_email = email;
    pi.personal_email = email;
  }
  if (phone) {
    pi.work_number = phone;
  }
  if (bioText) pi.summary = bioText;

  // Usa sempre gli array del wizard (anche vuoti) così “svuota tutto” non ripristina il base.
  const workExperienceList = Array.isArray(cv.experience)
    ? cv.experience.map((x) => normalizeListItem(x)).filter((i) => i.period || i.title || i.subtitle)
    : readWorkExperienceList(base);
  const educationList = Array.isArray(cv.education)
    ? cv.education.map((x) => normalizeListItem(x)).filter((i) => i.period || i.title || i.subtitle)
    : readEducationList(base);
  const skillsPayload = Array.isArray(cv.skills)
    ? cv.skills
        .map((n) => ({ name: String(n).trim(), level: "N/A" as const }))
        .filter((s) => s.name)
    : readSkillsList(base);

  return {
    ...base,
    personal_info: pi,
    name,
    email: email || base.email,
    phone: phone || base.phone,
    summary: bioText || base.summary,
    work_experience_list: workExperienceList,
    education_list: educationList,
    skills: skillsPayload,
  };
}

export function apiCvRecordToWizard(cv: ApiCVRecord, prev: WizardCvState): WizardCvState {
  const raw = (cv.raw_json || {}) as Record<string, unknown>;
  const partial = rawJsonToWizardCvData(raw);
  return {
    ...prev,
    ...partial,
    personalInfo: { ...prev.personalInfo, ...partial.personalInfo },
    experience: (partial.experience as unknown[]) ?? prev.experience,
    education: (partial.education as unknown[]) ?? prev.education,
    skills: partial.skills ?? prev.skills,
    cvId: cv.id,
    parsedData: raw,
  };
}
