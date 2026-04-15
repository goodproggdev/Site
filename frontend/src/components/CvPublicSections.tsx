import { useTranslation } from "react-i18next";
import type { TemplateListItem, TemplateLists, TemplateSkill } from "../utils/cvTemplateLists";
import { readTemplateLists, templateListsHaveContent } from "../utils/cvTemplateLists";

export type CvAccent = "indigo" | "violet" | "teal";

function accentTextClass(accent: CvAccent): string {
  if (accent === "violet") return "text-violet-600 dark:text-violet-400";
  if (accent === "teal") return "text-teal-600 dark:text-teal-400";
  return "text-indigo-600 dark:text-indigo-400";
}

function accentBarClass(accent: CvAccent, i: number): string {
  if (accent === "violet") return ["bg-violet-500/25", "bg-fuchsia-500/25", "bg-pink-500/25"][i] ?? "bg-violet-500/25";
  if (accent === "teal") return ["bg-teal-500/25", "bg-cyan-500/25", "bg-emerald-500/25"][i] ?? "bg-teal-500/25";
  return ["bg-indigo-500/25", "bg-purple-500/25", "bg-pink-500/25"][i] ?? "bg-indigo-500/25";
}

export interface CvPublicSectionsProps {
  /** Oggetto compatibile con `raw_json` (o preview parziale con le stesse chiavi). */
  raw: Record<string, unknown>;
  accent?: CvAccent;
  /** Se false e non c’è contenuto, non renderizza nulla (utile in marketing preview). */
  showPlaceholder?: boolean;
}

function ListBlock({
  title,
  items,
  emptyLabel,
  accent,
}: {
  title: string;
  items: TemplateListItem[];
  emptyLabel: string;
  accent: CvAccent;
}) {
  const filled = items.filter((x) => x.period.trim() || x.title.trim() || x.subtitle.trim());
  if (filled.length === 0) {
    return (
      <div className="mt-6">
        <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
        <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="mt-6">
      <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
      <ul className="mt-3 space-y-4">
        {filled.map((row, idx) => (
          <li key={idx} className="border-l-2 border-gray-200 pl-3 dark:border-gray-600">
            {row.period.trim() ? (
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{row.period}</p>
            ) : null}
            {row.title.trim() ? <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.title}</p> : null}
            {row.subtitle.trim() ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">{row.subtitle}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillsBlock({
  title,
  skills,
  emptyLabel,
  accent,
}: {
  title: string;
  skills: TemplateSkill[];
  emptyLabel: string;
  accent: CvAccent;
}) {
  if (skills.length === 0) {
    return (
      <div className="mt-6">
        <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
        <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="mt-6">
      <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.map((s, idx) => (
          <span
            key={`${s.name}-${idx}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          >
            {s.name}
            {s.level && s.level !== "N/A" ? (
              <span className="ml-1 text-gray-500 dark:text-gray-400">· {s.level}</span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CvPublicSections({ raw, accent = "indigo", showPlaceholder = true }: CvPublicSectionsProps) {
  const { t } = useTranslation();
  const lists: TemplateLists = readTemplateLists(raw);
  const has = templateListsHaveContent(lists);

  if (!has && !showPlaceholder) {
    return (
      <div className="mt-6 text-gray-600 dark:text-gray-300 lg:mt-8">
        <ListBlock
          title={t("cvEditor.sections.workExperience")}
          items={[]}
          emptyLabel={t("cvEditor.sections.emptyWorkExperience")}
          accent={accent}
        />
        <ListBlock
          title={t("cvEditor.sections.education")}
          items={[]}
          emptyLabel={t("cvEditor.sections.emptyEducation")}
          accent={accent}
        />
        <SkillsBlock
          title={t("cvEditor.sections.skills")}
          skills={[]}
          emptyLabel={t("cvEditor.sections.emptySkills")}
          accent={accent}
        />
      </div>
    );
  }

  if (!has && showPlaceholder) {
    return (
      <div className="mt-8 space-y-3 lg:mt-10 lg:space-y-4">
        <div className="h-2.5 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
        <div className="h-2.5 w-5/6 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
        <div className="h-2.5 w-4/6 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
        <div className="mt-4 grid grid-cols-3 gap-3 lg:mt-6 lg:gap-4">
          <div className={`h-1.5 rounded-full ${accentBarClass(accent, 0)}`} />
          <div className={`h-1.5 rounded-full ${accentBarClass(accent, 1)}`} />
          <div className={`h-1.5 rounded-full ${accentBarClass(accent, 2)}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 text-gray-600 dark:text-gray-300 lg:mt-8">
      <ListBlock
        title={t("cvEditor.sections.workExperience")}
        items={lists.work_experience_list}
        emptyLabel={t("cvEditor.sections.emptyWorkExperience")}
        accent={accent}
      />
      <ListBlock
        title={t("cvEditor.sections.education")}
        items={lists.education_list}
        emptyLabel={t("cvEditor.sections.emptyEducation")}
        accent={accent}
      />
      <SkillsBlock
        title={t("cvEditor.sections.skills")}
        skills={lists.skills}
        emptyLabel={t("cvEditor.sections.emptySkills")}
        accent={accent}
      />
    </div>
  );
}
