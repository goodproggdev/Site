import { useTranslation } from "react-i18next";
import { Button, Label, TextInput, Textarea } from "flowbite-react";
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

export interface CvPublicSectionsEditHandlers {
  onWorkChange?: (index: number, field: keyof TemplateListItem, value: string) => void;
  onEducationChange?: (index: number, field: keyof TemplateListItem, value: string) => void;
  onSkillChange?: (index: number, name: string) => void;
  onAddWork?: () => void;
  onAddEducation?: () => void;
  onAddSkill?: () => void;
  onRemoveWork?: (index: number) => void;
  onRemoveEducation?: (index: number) => void;
  onRemoveSkill?: (index: number) => void;
}

export interface CvPublicSectionsProps {
  /** Oggetto compatibile con `raw_json` (o preview parziale con le stesse chiavi). */
  raw: Record<string, unknown>;
  accent?: CvAccent;
  /** Se false e non c’è contenuto, non renderizza nulla (utile in marketing preview). */
  showPlaceholder?: boolean;
  /** Modalità editor visivo: righe espandibili con campi. */
  editable?: boolean;
  editHandlers?: CvPublicSectionsEditHandlers;
}

function ListBlock({
  title,
  items,
  emptyLabel,
  accent,
  editable,
  onRowChange,
  onAdd,
  onRemove,
  editPeriodLabel,
  editTitleLabel,
  editSubtitleLabel,
  editRowLabel,
  addLabel,
  removeLabel,
  subtitleMultiline,
}: {
  title: string;
  items: TemplateListItem[];
  emptyLabel: string;
  accent: CvAccent;
  editable?: boolean;
  onRowChange?: (index: number, field: keyof TemplateListItem, value: string) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  editPeriodLabel: string;
  editTitleLabel: string;
  editSubtitleLabel: string;
  editRowLabel: string;
  addLabel: string;
  removeLabel: string;
  subtitleMultiline?: boolean;
}) {
  const filled = items.filter((x) => x.period.trim() || x.title.trim() || x.subtitle.trim());
  const displayItems = editable ? items : filled;

  if (!editable && filled.length === 0) {
    return (
      <div className="mt-6">
        <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
        <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  if (editable && items.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
          {onAdd ? (
            <Button type="button" size="xs" color="light" onClick={onAdd}>
              {addLabel}
            </Button>
          ) : null}
        </div>
        <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
        {editable && onAdd ? (
          <Button type="button" size="xs" color="light" onClick={onAdd}>
            {addLabel}
          </Button>
        ) : null}
      </div>
      {!editable && filled.length === 0 ? null : (
        <ul className="mt-3 space-y-4">
          {displayItems.map((row, idx) => {
            const isEmpty = !row.period.trim() && !row.title.trim() && !row.subtitle.trim();
            if (!editable && isEmpty) return null;
            if (editable && onRowChange) {
              return (
                <li key={idx} className="rounded-lg border border-gray-200 dark:border-gray-600">
                  <details className="group rounded-lg">
                    <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-gray-800 marker:content-none dark:text-gray-100 [&::-webkit-details-marker]:hidden">
                      <span className="flex min-h-[44px] items-center justify-between gap-2">
                        <span className="truncate">
                          {row.title.trim() || row.period.trim() || editRowLabel}
                        </span>
                        <span className="shrink-0 text-xs text-indigo-600 dark:text-indigo-400">{editRowLabel}</span>
                      </span>
                    </summary>
                    <div className="space-y-2 border-t border-gray-100 px-3 pb-3 pt-2 dark:border-gray-700">
                      <div>
                        <Label htmlFor={`ed-${title}-p-${idx}`} className="text-xs" value={editPeriodLabel} />
                        <TextInput
                          id={`ed-${title}-p-${idx}`}
                          sizing="sm"
                          className="mt-1"
                          value={row.period}
                          onChange={(e) => onRowChange(idx, "period", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ed-${title}-t-${idx}`} className="text-xs" value={editTitleLabel} />
                        <TextInput
                          id={`ed-${title}-t-${idx}`}
                          sizing="sm"
                          className="mt-1"
                          value={row.title}
                          onChange={(e) => onRowChange(idx, "title", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ed-${title}-s-${idx}`} className="text-xs" value={editSubtitleLabel} />
                        {subtitleMultiline ? (
                          <Textarea
                            id={`ed-${title}-s-${idx}`}
                            rows={3}
                            className="mt-1"
                            value={row.subtitle}
                            onChange={(e) => onRowChange(idx, "subtitle", e.target.value)}
                          />
                        ) : (
                          <TextInput
                            id={`ed-${title}-s-${idx}`}
                            sizing="sm"
                            className="mt-1"
                            value={row.subtitle}
                            onChange={(e) => onRowChange(idx, "subtitle", e.target.value)}
                          />
                        )}
                      </div>
                      {onRemove ? (
                        <Button type="button" size="xs" color="failure" onClick={() => onRemove(idx)}>
                          {removeLabel}
                        </Button>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            }
            return (
              <li key={idx} className="border-l-2 border-gray-200 pl-3 dark:border-gray-600">
                {row.period.trim() ? (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{row.period}</p>
                ) : null}
                {row.title.trim() ? <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.title}</p> : null}
                {row.subtitle.trim() ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{row.subtitle}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SkillsBlock({
  title,
  skills,
  emptyLabel,
  accent,
  editable,
  onSkillChange,
  onAdd,
  onRemove,
  skillNameLabel,
  editChipLabel,
  addLabel,
  removeLabel,
}: {
  title: string;
  skills: TemplateSkill[];
  emptyLabel: string;
  accent: CvAccent;
  editable?: boolean;
  onSkillChange?: (index: number, name: string) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  skillNameLabel: string;
  editChipLabel: string;
  addLabel: string;
  removeLabel: string;
}) {
  if (!editable && skills.length === 0) {
    return (
      <div className="mt-6">
        <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
        <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  if (editable && skills.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
          {onAdd ? (
            <Button type="button" size="xs" color="light" onClick={onAdd}>
              {addLabel}
            </Button>
          ) : null}
        </div>
        <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h4 className={`text-xs font-bold uppercase tracking-wide ${accentTextClass(accent)}`}>{title}</h4>
        {editable && onAdd ? (
          <Button type="button" size="xs" color="light" onClick={onAdd}>
            {addLabel}
          </Button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.map((s, idx) =>
          editable && onSkillChange ? (
            <details key={`${s.name}-${idx}`} className="group relative">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 marker:content-none dark:bg-gray-800 dark:text-gray-100 [&::-webkit-details-marker]:hidden">
                {s.name || editChipLabel}
                <span className="ml-2 text-indigo-600 dark:text-indigo-400">{editChipLabel}</span>
              </summary>
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[220px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                <Label htmlFor={`sk-ed-${idx}`} className="text-xs" value={skillNameLabel} />
                <TextInput
                  id={`sk-ed-${idx}`}
                  sizing="sm"
                  className="mt-1"
                  value={s.name}
                  onChange={(e) => onSkillChange(idx, e.target.value)}
                />
                {onRemove ? (
                  <Button type="button" size="xs" color="failure" className="mt-2" onClick={() => onRemove(idx)}>
                    {removeLabel}
                  </Button>
                ) : null}
              </div>
            </details>
          ) : (
            <span
              key={`${s.name}-${idx}`}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            >
              {s.name}
              {s.level && s.level !== "N/A" ? (
                <span className="ml-1 text-gray-500 dark:text-gray-400">· {s.level}</span>
              ) : null}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export default function CvPublicSections({
  raw,
  accent = "indigo",
  showPlaceholder = true,
  editable = false,
  editHandlers,
}: CvPublicSectionsProps) {
  const { t } = useTranslation();
  const lists: TemplateLists = readTemplateLists(raw);
  const has = templateListsHaveContent(lists);
  const h = editHandlers ?? {};

  if (!has && !showPlaceholder) {
    return (
      <div className="mt-6 text-gray-600 dark:text-gray-300 lg:mt-8">
        <ListBlock
          title={t("cvEditor.sections.workExperience")}
          items={[]}
          emptyLabel={t("cvEditor.sections.emptyWorkExperience")}
          accent={accent}
          editable={editable}
          onRowChange={h.onWorkChange}
          onAdd={h.onAddWork}
          onRemove={h.onRemoveWork}
          editPeriodLabel={t("cvEditor.lists.period")}
          editTitleLabel={t("cvEditor.lists.itemTitle")}
          editSubtitleLabel={t("cvEditor.lists.subtitle")}
          editRowLabel={t("cvEditor.visual.editRow")}
          addLabel={t("cvEditor.lists.addRow")}
          removeLabel={t("cvEditor.lists.removeRow")}
          subtitleMultiline
        />
        <ListBlock
          title={t("cvEditor.sections.education")}
          items={[]}
          emptyLabel={t("cvEditor.sections.emptyEducation")}
          accent={accent}
          editable={editable}
          onRowChange={h.onEducationChange}
          onAdd={h.onAddEducation}
          onRemove={h.onRemoveEducation}
          editPeriodLabel={t("cvEditor.lists.period")}
          editTitleLabel={t("cvEditor.lists.itemTitle")}
          editSubtitleLabel={t("cvEditor.lists.subtitle")}
          editRowLabel={t("cvEditor.visual.editRow")}
          addLabel={t("cvEditor.lists.addRow")}
          removeLabel={t("cvEditor.lists.removeRow")}
        />
        <SkillsBlock
          title={t("cvEditor.sections.skills")}
          skills={[]}
          emptyLabel={t("cvEditor.sections.emptySkills")}
          accent={accent}
          editable={editable}
          onSkillChange={h.onSkillChange}
          onAdd={h.onAddSkill}
          onRemove={h.onRemoveSkill}
          skillNameLabel={t("cvEditor.lists.skillName")}
          editChipLabel={t("cvEditor.visual.editSkill")}
          addLabel={t("cvEditor.lists.addRow")}
          removeLabel={t("cvEditor.lists.removeRow")}
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
        editable={editable}
        onRowChange={h.onWorkChange}
        onAdd={h.onAddWork}
        onRemove={h.onRemoveWork}
        editPeriodLabel={t("cvEditor.lists.period")}
        editTitleLabel={t("cvEditor.lists.itemTitle")}
        editSubtitleLabel={t("cvEditor.lists.subtitle")}
        editRowLabel={t("cvEditor.visual.editRow")}
        addLabel={t("cvEditor.lists.addRow")}
        removeLabel={t("cvEditor.lists.removeRow")}
        subtitleMultiline
      />
      <ListBlock
        title={t("cvEditor.sections.education")}
        items={lists.education_list}
        emptyLabel={t("cvEditor.sections.emptyEducation")}
        accent={accent}
        editable={editable}
        onRowChange={h.onEducationChange}
        onAdd={h.onAddEducation}
        onRemove={h.onRemoveEducation}
        editPeriodLabel={t("cvEditor.lists.period")}
        editTitleLabel={t("cvEditor.lists.itemTitle")}
        editSubtitleLabel={t("cvEditor.lists.subtitle")}
        editRowLabel={t("cvEditor.visual.editRow")}
        addLabel={t("cvEditor.lists.addRow")}
        removeLabel={t("cvEditor.lists.removeRow")}
      />
      <SkillsBlock
        title={t("cvEditor.sections.skills")}
        skills={lists.skills}
        emptyLabel={t("cvEditor.sections.emptySkills")}
        accent={accent}
        editable={editable}
        onSkillChange={h.onSkillChange}
        onAdd={h.onAddSkill}
        onRemove={h.onRemoveSkill}
        skillNameLabel={t("cvEditor.lists.skillName")}
        editChipLabel={t("cvEditor.visual.editSkill")}
        addLabel={t("cvEditor.lists.addRow")}
        removeLabel={t("cvEditor.lists.removeRow")}
      />
    </div>
  );
}
