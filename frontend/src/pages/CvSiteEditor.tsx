import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Label, Select, TextInput, Textarea } from 'flowbite-react';
import axios from 'axios';
import { getCvDetail, updateCvData } from '../api/cvApi';
import { formatAndLocalizeDrfErrors } from '../utils/apiErrorI18n';
import CvPublicSections from '../components/CvPublicSections';
import type { TemplateListItem, TemplateLists, TemplateSkill } from '../utils/cvTemplateLists';
import { readTemplateLists, patchTemplateLists } from '../utils/cvTemplateLists';

type Accent = 'indigo' | 'violet' | 'teal';

function readEditor(raw: Record<string, unknown>) {
  const ed = (raw.nordevit_editor as Record<string, unknown>) || {};
  return {
    accent: (['indigo', 'violet', 'teal'].includes(String(ed.accent)) ? ed.accent : 'indigo') as Accent,
    headline: String(ed.headline ?? ''),
    tagline: String(ed.tagline ?? ''),
    summary: String(ed.summary ?? ''),
  };
}

function mergeEditor(raw: Record<string, unknown>, patch: ReturnType<typeof readEditor>) {
  const pi = { ...(typeof raw.personal_info === 'object' && raw.personal_info ? raw.personal_info : {}) } as Record<
    string,
    unknown
  >;
  if (patch.headline) pi.name = patch.headline;
  if (patch.tagline) pi.title = patch.tagline;
  const next = {
    ...raw,
    personal_info: pi,
    summary: patch.summary || raw.summary,
    nordevit_editor: {
      accent: patch.accent,
      headline: patch.headline,
      tagline: patch.tagline,
      summary: patch.summary,
    },
  };
  return next;
}

function buildMergedPayload(raw: Record<string, unknown>, editor: ReturnType<typeof readEditor>, lists: TemplateLists) {
  return patchTemplateLists(mergeEditor(raw, editor), lists);
}

const emptyLists = (): TemplateLists => ({
  work_experience_list: [],
  education_list: [],
  skills: [],
});

export default function CvSiteEditor() {
  const { t } = useTranslation();
  const { lang = 'it', cvId: cvIdParam } = useParams<{ lang?: string; cvId?: string }>();
  const navigate = useNavigate();
  const cvId = cvIdParam ? Number.parseInt(cvIdParam, 10) : NaN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const rawRef = useRef<Record<string, unknown>>({});
  const [publicSlug, setPublicSlug] = useState('');
  const [editor, setEditor] = useState(readEditor({}));
  const [lists, setLists] = useState<TemplateLists>(emptyLists);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);

  const load = useCallback(async () => {
    if (!Number.isFinite(cvId)) {
      setError(t('cvEditor.invalidId'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rec = await getCvDetail(cvId);
      const base = { ...((rec.raw_json || {}) as Record<string, unknown>) };
      const ed = readEditor(base);
      if (!ed.headline) {
        const pi = (base.personal_info as Record<string, unknown>) || {};
        ed.headline = String(pi.name ?? base.name ?? '');
        ed.tagline = String(pi.title ?? '');
        ed.summary = String(base.summary ?? pi.summary ?? '');
      }
      setPublicSlug(rec.slug || '');
      setRaw(base);
      rawRef.current = base;
      setEditor(ed);
      setLists(readTemplateLists(base));
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setError(t('cvEditor.notFound'));
      } else {
        setError(t('cvEditor.loadError'));
      }
    } finally {
      setLoading(false);
    }
  }, [cvId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const runSave = useCallback(async () => {
    if (!Number.isFinite(cvId)) return;
    const merged = buildMergedPayload(rawRef.current, editor, lists);
    setSaveStatus('saving');
    setSaveMsg('');
    try {
      await updateCvData(cvId, merged);
      rawRef.current = merged;
      setRaw(merged);
      setSaveStatus('saved');
      setSaveMsg(t('cvEditor.saved'));
      window.setTimeout(() => {
        setSaveStatus('idle');
        setSaveMsg('');
      }, 2000);
    } catch (e) {
      setSaveStatus('error');
      if (axios.isAxiosError(e) && e.response?.data) {
        setSaveMsg(formatAndLocalizeDrfErrors(e.response.data, t));
      } else {
        setSaveMsg(t('cvEditor.saveError'));
      }
    }
  }, [cvId, editor, lists, t]);

  useEffect(() => {
    if (loading || error) return;
    const h = window.setTimeout(() => void runSave(), 800);
    return () => window.clearTimeout(h);
  }, [editor, lists, loading, error, runSave]);

  const previewRaw = useMemo(() => {
    const merged = mergeEditor(raw, editor);
    return patchTemplateLists(merged, lists);
  }, [raw, editor, lists]);

  const previewData = useMemo(() => {
    const pi = { ...(typeof raw.personal_info === 'object' ? raw.personal_info : {}) } as Record<string, unknown>;
    return {
      personal_info: {
        name: editor.headline || String(pi.name ?? ''),
        title: editor.tagline || String(pi.title ?? ''),
      },
      summary: editor.summary || String(raw.summary ?? ''),
      nordevit_editor: { accent: editor.accent },
    };
  }, [raw, editor]);

  const gradient =
    editor.accent === 'violet'
      ? 'from-violet-500 to-fuchsia-600'
      : editor.accent === 'teal'
        ? 'from-teal-500 to-cyan-600'
        : 'from-indigo-500 to-purple-600';

  const updateWorkRow = (index: number, field: keyof TemplateListItem, value: string) => {
    setLists((s) => {
      const work_experience_list = s.work_experience_list.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      );
      return { ...s, work_experience_list };
    });
  };

  const updateEduRow = (index: number, field: keyof TemplateListItem, value: string) => {
    setLists((s) => {
      const education_list = s.education_list.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      return { ...s, education_list };
    });
  };

  const updateSkillRow = (index: number, field: keyof TemplateSkill, value: string) => {
    setLists((s) => {
      const skills = s.skills.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      return { ...s, skills };
    });
  };

  if (!Number.isFinite(cvId)) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 dark:bg-gray-900">
        <p className="text-center text-gray-600 dark:text-gray-400">{t('cvEditor.invalidId')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 dark:bg-gray-900">
        <p className="text-center text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
        <div className="mt-6 text-center">
          <Button color="light" onClick={() => navigate(`/${lang}/dashboard`)}>
            {t('cvEditor.backDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t('cvEditor.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cvEditor.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
              {saveStatus === 'saving' ? t('cvEditor.saving') : saveMsg}
            </span>
            <Button type="button" color="light" size="sm" onClick={() => void runSave()}>
              {t('cvEditor.saveNow')}
            </Button>
            <Link to={`/${lang}/dashboard`} className="btn-secondary text-sm">
              {t('cvEditor.backDashboard')}
            </Link>
            {publicSlug ? (
              <a href={`/u/${publicSlug}`} target="_blank" rel="noreferrer" className="btn-primary text-sm">
                {t('cvEditor.openPublic')}
              </a>
            ) : (
              <span className="inline-block rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {t('cvEditor.openPublicUnavailable')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <div
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          role="region"
          aria-label={t('cvEditor.previewRegion')}
        >
          <div className={`rounded-xl bg-gradient-to-r p-[2px] ${gradient}`}>
            <div className="rounded-[10px] bg-white p-6 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-tr ${gradient}`} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {(previewData as { personal_info?: { name?: string } }).personal_info?.name}
                  </h3>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      editor.accent === 'violet'
                        ? 'text-violet-600 dark:text-violet-400'
                        : editor.accent === 'teal'
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {(previewData as { personal_info?: { title?: string } }).personal_info?.title}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {(previewData as { summary?: string }).summary}
              </p>
              <CvPublicSections raw={previewRaw} accent={editor.accent} showPlaceholder={false} />
            </div>
          </div>
        </div>

        <div
          className="max-h-[calc(100vh-8rem)] space-y-6 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          role="region"
          aria-label={t('cvEditor.properties')}
        >
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('cvEditor.properties')}</h2>
            <div>
              <Label htmlFor="ed-accent" value={t('cvEditor.accent')} />
              <Select
                id="ed-accent"
                className="mt-1"
                value={editor.accent}
                onChange={(e) => setEditor((s) => ({ ...s, accent: e.target.value as Accent }))}
              >
                <option value="indigo">{t('cvEditor.accentIndigo')}</option>
                <option value="violet">{t('cvEditor.accentViolet')}</option>
                <option value="teal">{t('cvEditor.accentTeal')}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ed-headline" value={t('cvEditor.headline')} />
              <TextInput
                id="ed-headline"
                value={editor.headline}
                onChange={(e) => setEditor((s) => ({ ...s, headline: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ed-tagline" value={t('cvEditor.tagline')} />
              <TextInput
                id="ed-tagline"
                value={editor.tagline}
                onChange={(e) => setEditor((s) => ({ ...s, tagline: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ed-summary" value={t('cvEditor.summary')} />
              <Textarea
                id="ed-summary"
                rows={5}
                value={editor.summary}
                onChange={(e) => setEditor((s) => ({ ...s, summary: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <ListEditorSection
            idPrefix="work"
            title={t('cvEditor.lists.editWorkExperience')}
            emptyHint={t('cvEditor.sections.emptyWorkExperience')}
            rows={lists.work_experience_list}
            onAdd={() =>
              setLists((s) => ({
                ...s,
                work_experience_list: [...s.work_experience_list, { period: '', title: '', subtitle: '' }],
              }))
            }
            onRemove={(index) =>
              setLists((s) => ({
                ...s,
                work_experience_list: s.work_experience_list.filter((_, i) => i !== index),
              }))
            }
            onChangeRow={updateWorkRow}
            t={t}
          />

          <ListEditorSection
            idPrefix="edu"
            title={t('cvEditor.lists.editEducation')}
            emptyHint={t('cvEditor.sections.emptyEducation')}
            rows={lists.education_list}
            onAdd={() =>
              setLists((s) => ({
                ...s,
                education_list: [...s.education_list, { period: '', title: '', subtitle: '' }],
              }))
            }
            onRemove={(index) =>
              setLists((s) => ({
                ...s,
                education_list: s.education_list.filter((_, i) => i !== index),
              }))
            }
            onChangeRow={updateEduRow}
            t={t}
          />

          <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('cvEditor.lists.editSkills')}</h3>
              <Button
                type="button"
                size="xs"
                color="light"
                onClick={() =>
                  setLists((s) => ({
                    ...s,
                    skills: [...s.skills, { name: '', level: '' }],
                  }))
                }
              >
                {t('cvEditor.lists.addRow')}
              </Button>
            </div>
            {lists.skills.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('cvEditor.sections.emptySkills')}</p>
            ) : (
              <ul className="space-y-3">
                {lists.skills.map((row, index) => (
                  <li key={index} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`sk-name-${index}`} value={t('cvEditor.lists.skillName')} className="text-xs" />
                        <TextInput
                          id={`sk-name-${index}`}
                          sizing="sm"
                          className="mt-1"
                          value={row.name}
                          onChange={(e) => updateSkillRow(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`sk-lv-${index}`} value={t('cvEditor.lists.skillLevel')} className="text-xs" />
                        <TextInput
                          id={`sk-lv-${index}`}
                          sizing="sm"
                          className="mt-1"
                          value={row.level === 'N/A' ? '' : row.level}
                          placeholder="N/A"
                          onChange={(e) => updateSkillRow(index, 'level', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="xs"
                      color="failure"
                      className="mt-2"
                      onClick={() =>
                        setLists((s) => ({
                          ...s,
                          skills: s.skills.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      {t('cvEditor.lists.removeRow')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('cvEditor.persistNote')} {t('cvEditor.draftVsPublished')}
          </p>
        </div>
      </div>
    </div>
  );
}

function ListEditorSection({
  idPrefix,
  title,
  emptyHint,
  rows,
  onAdd,
  onRemove,
  onChangeRow,
  t,
}: {
  idPrefix: string;
  title: string;
  emptyHint: string;
  rows: TemplateListItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChangeRow: (index: number, field: keyof TemplateListItem, value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        <Button type="button" size="xs" color="light" onClick={onAdd}>
          {t('cvEditor.lists.addRow')}
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{emptyHint}</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row, index) => (
            <li key={`${idPrefix}-${index}`} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`${idPrefix}-${index}-p`} value={t('cvEditor.lists.period')} className="text-xs" />
                  <TextInput
                    id={`${idPrefix}-${index}-p`}
                    sizing="sm"
                    className="mt-1"
                    value={row.period}
                    onChange={(e) => onChangeRow(index, 'period', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${idPrefix}-${index}-t`} value={t('cvEditor.lists.itemTitle')} className="text-xs" />
                  <TextInput
                    id={`${idPrefix}-${index}-t`}
                    sizing="sm"
                    className="mt-1"
                    value={row.title}
                    onChange={(e) => onChangeRow(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${idPrefix}-${index}-s`} value={t('cvEditor.lists.subtitle')} className="text-xs" />
                  <TextInput
                    id={`${idPrefix}-${index}-s`}
                    sizing="sm"
                    className="mt-1"
                    value={row.subtitle}
                    onChange={(e) => onChangeRow(index, 'subtitle', e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" size="xs" color="failure" className="mt-2" onClick={() => onRemove(index)}>
                {t('cvEditor.lists.removeRow')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
