import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Label, Select, TextInput, Textarea } from 'flowbite-react';
import axios from 'axios';
import { getCvDetail, updateCvData } from '../api/cvApi';
import { formatAndLocalizeDrfErrors } from '../utils/apiErrorI18n';
import CvPreviewCard, {
  readCardVisualFromRaw,
  type CvPreviewDensity,
  type CvPreviewHeadingSize,
} from '../components/cv-preview/CvPreviewCard';
import type { CvPublicSectionsEditHandlers } from '../components/CvPublicSections';
import type { TemplateListItem } from '../utils/cvTemplateLists';
import { normalizeListItem } from '../utils/cvTemplateLists';
import type { WizardCvState } from '../utils/cvRawJsonMap';
import { mergeWizardIntoRawJson, rawJsonToWizardCvData } from '../utils/cvRawJsonMap';

type Accent = 'indigo' | 'violet' | 'teal';

type EditorTab = 'personal' | 'experience' | 'education' | 'skills';

type CardVisual = { density: CvPreviewDensity; headingSize: CvPreviewHeadingSize };

function readAccent(raw: Record<string, unknown>): Accent {
  const ed = (raw.nordevit_editor as Record<string, unknown>) || {};
  return (['indigo', 'violet', 'teal'].includes(String(ed.accent)) ? ed.accent : 'indigo') as Accent;
}

/** Unisce wizard + accent e mantiene `nordevit_editor` allineato (retrocompatibilità con dati già salvati). */
function buildMergedPayload(
  raw: Record<string, unknown>,
  wizard: WizardCvState,
  accent: Accent,
  visual: CardVisual,
): Record<string, unknown> {
  const merged = mergeWizardIntoRawJson({ ...raw }, wizard);
  const pi = (merged.personal_info as Record<string, unknown>) || {};
  const name = String(pi.name ?? '');
  const jobTitle = String(pi.title ?? '');
  const summary = String(merged.summary ?? '');
  const prevEd =
    typeof merged.nordevit_editor === 'object' && merged.nordevit_editor
      ? { ...(merged.nordevit_editor as Record<string, unknown>) }
      : {};
  return {
    ...merged,
    nordevit_editor: {
      ...prevEd,
      accent,
      density: visual.density,
      headingSize: visual.headingSize,
      headline: name,
      tagline: jobTitle,
      summary,
    },
  };
}

function wizardFromRaw(base: Record<string, unknown>, cvId: number): WizardCvState {
  const partial = rawJsonToWizardCvData(base);
  const pi = (base.personal_info as Record<string, unknown>) || {};
  const titleFromRaw = String(partial.personalInfo?.title ?? pi.title ?? '');
  return {
    personalInfo: {
      ...partial.personalInfo,
      title: titleFromRaw,
    },
    experience: (partial.experience as unknown[]) ?? [],
    education: (partial.education as unknown[]) ?? [],
    skills: partial.skills ?? [],
    cvId,
    parsedData: base,
  };
}

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
  const [wizard, setWizard] = useState<WizardCvState>({
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    cvId: null,
    parsedData: null,
  });
  const [accent, setAccent] = useState<Accent>('indigo');
  const [density, setDensity] = useState<CvPreviewDensity>('comfortable');
  const [headingSize, setHeadingSize] = useState<CvPreviewHeadingSize>('md');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
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
      setPublicSlug(rec.slug || '');
      setRaw(base);
      rawRef.current = base;
      setWizard(wizardFromRaw(base, cvId));
      setAccent(readAccent(base));
      const vis = readCardVisualFromRaw(base);
      setDensity(vis.density);
      setHeadingSize(vis.headingSize);
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
    const merged = buildMergedPayload(rawRef.current, wizard, accent, { density, headingSize });
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
  }, [cvId, wizard, accent, density, headingSize, t]);

  useEffect(() => {
    if (loading || error) return;
    const h = window.setTimeout(() => void runSave(), 800);
    return () => window.clearTimeout(h);
  }, [wizard, accent, density, headingSize, loading, error, runSave]);

  const cardVisual = useMemo(() => ({ density, headingSize }), [density, headingSize]);
  const previewMerged = useMemo(
    () => buildMergedPayload(raw, wizard, accent, cardVisual),
    [raw, wizard, accent, cardVisual],
  );

  const editorCanvasRaw = useMemo(() => {
    const merged = mergeWizardIntoRawJson({ ...raw }, wizard);
    const work = (Array.isArray(wizard.experience) ? wizard.experience : []).map((x) => normalizeListItem(x));
    const edu = (Array.isArray(wizard.education) ? wizard.education : []).map((x) => normalizeListItem(x));
    const skills = (wizard.skills || []).map((n) => ({ name: String(n), level: 'N/A' as const }));
    const pi = (merged.personal_info as Record<string, unknown>) || {};
    const name = String(pi.name ?? '');
    const jobTitle = String(pi.title ?? '');
    const summary = String(merged.summary ?? '');
    const prevEd =
      typeof merged.nordevit_editor === 'object' && merged.nordevit_editor
        ? { ...(merged.nordevit_editor as Record<string, unknown>) }
        : {};
    return {
      ...merged,
      work_experience_list: work,
      education_list: edu,
      skills,
      nordevit_editor: {
        ...prevEd,
        accent,
        density,
        headingSize,
        headline: name,
        tagline: jobTitle,
        summary,
      },
    };
  }, [raw, wizard, accent, density, headingSize]);

  const hero = useMemo(() => {
    const pi = (previewMerged.personal_info as Record<string, unknown>) || {};
    return {
      name: String(pi.name ?? ''),
      title: String(pi.title ?? ''),
      summary: String(previewMerged.summary ?? ''),
    };
  }, [previewMerged]);

  const experienceItems = useMemo(
    () => (Array.isArray(wizard.experience) ? wizard.experience : []).map((x) => normalizeListItem(x)),
    [wizard.experience],
  );

  const educationItems = useMemo(
    () => (Array.isArray(wizard.education) ? wizard.education : []).map((x) => normalizeListItem(x)),
    [wizard.education],
  );

  const patchPersonal = (field: string, value: string) => {
    setWizard((w) => ({
      ...w,
      personalInfo: { ...w.personalInfo, [field]: value },
    }));
  };

  const setExperienceItems = (items: TemplateListItem[]) => {
    setWizard((w) => ({ ...w, experience: items as unknown[] }));
  };

  const setEducationItems = (items: TemplateListItem[]) => {
    setWizard((w) => ({ ...w, education: items as unknown[] }));
  };

  const updateWorkRow = useCallback((index: number, field: keyof TemplateListItem, value: string) => {
    setWizard((w) => {
      const items = (Array.isArray(w.experience) ? w.experience : []).map((x) => normalizeListItem(x));
      const next = items.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      return { ...w, experience: next as unknown[] };
    });
  }, []);

  const updateEduRow = useCallback((index: number, field: keyof TemplateListItem, value: string) => {
    setWizard((w) => {
      const items = (Array.isArray(w.education) ? w.education : []).map((x) => normalizeListItem(x));
      const next = items.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      return { ...w, education: next as unknown[] };
    });
  }, []);

  const applyFullName = (full: string) => {
    const trimmed = full.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ');
    setWizard((w) => ({
      ...w,
      personalInfo: { ...w.personalInfo, firstName, lastName },
    }));
  };

  const sectionsEditHandlers: CvPublicSectionsEditHandlers = useMemo(
    () => ({
      onWorkChange: updateWorkRow,
      onEducationChange: updateEduRow,
      onSkillChange: (index, name) => {
        setWizard((w) => {
          const next = [...(w.skills || [])];
          next[index] = name;
          return { ...w, skills: next };
        });
      },
      onAddWork: () => setExperienceItems([...experienceItems, { period: '', title: '', subtitle: '' }]),
      onAddEducation: () => setEducationItems([...educationItems, { period: '', title: '', subtitle: '' }]),
      onAddSkill: () => setWizard((w) => ({ ...w, skills: [...(w.skills || []), ''] })),
      onRemoveWork: (index) => setExperienceItems(experienceItems.filter((_, i) => i !== index)),
      onRemoveEducation: (index) => setEducationItems(educationItems.filter((_, i) => i !== index)),
      onRemoveSkill: (index) =>
        setWizard((w) => ({
          ...w,
          skills: (w.skills || []).filter((_, i) => i !== index),
        })),
    }),
    [experienceItems, educationItems, updateWorkRow, updateEduRow],
  );

  const tabBtn = (tab: EditorTab, labelKey: string) => (
    <button
      key={tab}
      type="button"
      role="tab"
      id={`cv-editor-tab-${tab}`}
      aria-selected={activeTab === tab}
      aria-controls={`cv-editor-panel-${tab}`}
      tabIndex={activeTab === tab ? 0 : -1}
      onClick={() => setActiveTab(tab)}
      className={`shrink-0 snap-start rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
        activeTab === tab
          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      {t(labelKey)}
    </button>
  );

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
            <Button
              type="button"
              color="light"
              size="sm"
              aria-expanded={drawerOpen}
              aria-controls="cv-editor-properties-panel"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? t('cvEditor.visual.hideProperties') : t('cvEditor.visual.showProperties')}
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

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div
          className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
          role="toolbar"
          aria-label={t('cvEditor.visual.toolbarAria')}
        >
          <div className="flex min-w-32 flex-1 flex-col gap-1 sm:min-w-40 sm:flex-none">
            <Label htmlFor="ed-toolbar-accent" value={t('cvEditor.accent')} className="text-xs" />
            <Select
              id="ed-toolbar-accent"
              sizing="sm"
              value={accent}
              onChange={(e) => setAccent(e.target.value as Accent)}
            >
              <option value="indigo">{t('cvEditor.accentIndigo')}</option>
              <option value="violet">{t('cvEditor.accentViolet')}</option>
              <option value="teal">{t('cvEditor.accentTeal')}</option>
            </Select>
          </div>
          <div className="flex min-w-32 flex-1 flex-col gap-1 sm:min-w-40 sm:flex-none">
            <Label htmlFor="ed-toolbar-density" value={t('cvEditor.visual.density')} className="text-xs" />
            <Select
              id="ed-toolbar-density"
              sizing="sm"
              value={density}
              onChange={(e) => setDensity(e.target.value as CvPreviewDensity)}
            >
              <option value="comfortable">{t('cvEditor.visual.densityComfortable')}</option>
              <option value="compact">{t('cvEditor.visual.densityCompact')}</option>
            </Select>
          </div>
          <div className="flex min-w-32 flex-1 flex-col gap-1 sm:min-w-40 sm:flex-none">
            <Label htmlFor="ed-toolbar-heading" value={t('cvEditor.visual.headingSize')} className="text-xs" />
            <Select
              id="ed-toolbar-heading"
              sizing="sm"
              value={headingSize}
              onChange={(e) => setHeadingSize(e.target.value as CvPreviewHeadingSize)}
            >
              <option value="sm">{t('cvEditor.visual.headingSm')}</option>
              <option value="md">{t('cvEditor.visual.headingMd')}</option>
              <option value="lg">{t('cvEditor.visual.headingLg')}</option>
            </Select>
          </div>
          <div className="flex flex-wrap items-end gap-2 border-l border-gray-200 pl-3 dark:border-gray-600">
            <span className="pb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('cvEditor.visual.viewport')}
            </span>
            <Button
              type="button"
              size="xs"
              color={previewViewport === 'mobile' ? 'dark' : 'light'}
              onClick={() => setPreviewViewport('mobile')}
            >
              {t('cvEditor.visual.viewportMobile')}
            </Button>
            <Button
              type="button"
              size="xs"
              color={previewViewport === 'desktop' ? 'dark' : 'light'}
              onClick={() => setPreviewViewport('desktop')}
            >
              {t('cvEditor.visual.viewportDesktop')}
            </Button>
          </div>
        </div>

        {drawerOpen ? (
          <button
            type="button"
            aria-label={t('cvEditor.visual.closeDrawerOverlay')}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        ) : null}

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
          <div
            className={`relative z-10 min-w-0 flex-1 ${previewViewport === 'mobile' ? 'mx-auto max-w-[420px]' : ''}`}
            role="region"
            aria-label={t('cvEditor.previewRegion')}
          >
            <CvPreviewCard
              accent={accent}
              rawForSections={editorCanvasRaw}
              hero={hero}
              mode="edit"
              showSkeletonSections={false}
              showPlaceholderSections={false}
              density={density}
              headingSize={headingSize}
              heroBinding={{
                onNameChange: applyFullName,
                onTitleChange: (v) => patchPersonal('title', v),
                onSummaryChange: (v) => patchPersonal('summary', v),
              }}
              sectionsEditable
              sectionsEditHandlers={sectionsEditHandlers}
            />
          </div>

          <div
            id="cv-editor-properties-panel"
            className={[
              'z-40 flex max-h-[min(100dvh,100vh)] w-full max-w-md shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
              'max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:max-h-screen max-lg:rounded-none max-lg:border-l max-lg:shadow-xl',
              drawerOpen ? 'max-lg:flex' : 'max-lg:hidden',
              drawerOpen ? 'lg:flex' : 'lg:hidden',
            ].join(' ')}
            role="region"
            aria-label={t('cvEditor.properties')}
          >
          <div className="shrink-0 border-b border-gray-200 px-6 pb-3 pt-6 dark:border-gray-700">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('cvEditor.properties')}</h2>
              <Button
                type="button"
                color="light"
                size="xs"
                className="lg:hidden"
                onClick={() => setDrawerOpen(false)}
              >
                {t('cvEditor.visual.closeDrawer')}
              </Button>
            </div>
          </div>

          <div className="shrink-0 border-b border-gray-200 bg-white px-2 pt-2 dark:border-gray-700 dark:bg-gray-800 lg:px-6">
            <div
              role="tablist"
              aria-label={t('cvEditor.tabsAriaLabel')}
              className="-mx-1 flex max-w-full flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2 pt-1 [scrollbar-width:thin] touch-pan-x snap-x snap-mandatory"
            >
              {tabBtn('personal', 'builder.form.personalInfo')}
              {tabBtn('experience', 'builder.form.experience')}
              {tabBtn('education', 'builder.form.education')}
              {tabBtn('skills', 'builder.form.skills')}
            </div>
            <p className="pb-2 text-center text-xs text-gray-500 dark:text-gray-400 lg:hidden">{t('cvEditor.tabsScrollHint')}</p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div
              className="space-y-4"
              role="tabpanel"
              id="cv-editor-panel-personal"
              aria-labelledby="cv-editor-tab-personal"
              hidden={activeTab !== 'personal'}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ed-fn" value={t('builder.form.labels.firstName')} />
                  <TextInput
                    id="ed-fn"
                    className="mt-1"
                    value={wizard.personalInfo.firstName || ''}
                    onChange={(e) => patchPersonal('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ed-ln" value={t('builder.form.labels.lastName')} />
                  <TextInput
                    id="ed-ln"
                    className="mt-1"
                    value={wizard.personalInfo.lastName || ''}
                    onChange={(e) => patchPersonal('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ed-title" value={t('cvEditor.tagline')} />
                <TextInput
                  id="ed-title"
                  className="mt-1"
                  value={wizard.personalInfo.title || ''}
                  onChange={(e) => patchPersonal('title', e.target.value)}
                  placeholder={t('cvEditor.tagline')}
                />
              </div>
              <div>
                <Label htmlFor="ed-email" value={t('builder.form.labels.email')} />
                <TextInput
                  id="ed-email"
                  type="email"
                  className="mt-1"
                  value={wizard.personalInfo.email || ''}
                  onChange={(e) => patchPersonal('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ed-phone" value={t('builder.form.labels.phone')} />
                <TextInput
                  id="ed-phone"
                  className="mt-1"
                  value={wizard.personalInfo.phone || ''}
                  onChange={(e) => patchPersonal('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ed-summary" value={t('builder.form.labels.summary')} />
                <Textarea
                  id="ed-summary"
                  rows={5}
                  className="mt-1"
                  value={wizard.personalInfo.summary || ''}
                  onChange={(e) => patchPersonal('summary', e.target.value)}
                />
              </div>
            </div>

            <div
              role="tabpanel"
              id="cv-editor-panel-experience"
              aria-labelledby="cv-editor-tab-experience"
              hidden={activeTab !== 'experience'}
            >
            <ListEditorSection
              idPrefix="work"
              title={t('cvEditor.lists.editWorkExperience')}
              emptyHint={t('cvEditor.sections.emptyWorkExperience')}
              rows={experienceItems}
              subtitleMultiline
              onAdd={() => setExperienceItems([...experienceItems, { period: '', title: '', subtitle: '' }])}
              onRemove={(index) => setExperienceItems(experienceItems.filter((_, i) => i !== index))}
              onChangeRow={updateWorkRow}
              t={t}
            />
            </div>

            <div
              role="tabpanel"
              id="cv-editor-panel-education"
              aria-labelledby="cv-editor-tab-education"
              hidden={activeTab !== 'education'}
            >
            <ListEditorSection
              idPrefix="edu"
              title={t('cvEditor.lists.editEducation')}
              emptyHint={t('cvEditor.sections.emptyEducation')}
              rows={educationItems}
              onAdd={() => setEducationItems([...educationItems, { period: '', title: '', subtitle: '' }])}
              onRemove={(index) => setEducationItems(educationItems.filter((_, i) => i !== index))}
              onChangeRow={updateEduRow}
              t={t}
            />
            </div>

            <div
              className="space-y-3"
              role="tabpanel"
              id="cv-editor-panel-skills"
              aria-labelledby="cv-editor-tab-skills"
              hidden={activeTab !== 'skills'}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('cvEditor.lists.editSkills')}</h3>
                <Button
                  type="button"
                  size="xs"
                  color="light"
                  onClick={() => setWizard((w) => ({ ...w, skills: [...(w.skills || []), ''] }))}
                >
                  {t('cvEditor.lists.addRow')}
                </Button>
              </div>
              {(wizard.skills || []).length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('cvEditor.sections.emptySkills')}</p>
              ) : (
                <ul className="space-y-3">
                  {(wizard.skills || []).map((skill, index) => (
                    <li key={`sk-${index}`} className="flex flex-wrap items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`sk-${index}`} value={t('cvEditor.lists.skillName')} className="text-xs" />
                        <TextInput
                          id={`sk-${index}`}
                          className="mt-1"
                          value={skill}
                          onChange={(e) => {
                            const next = [...(wizard.skills || [])];
                            next[index] = e.target.value;
                            setWizard((w) => ({ ...w, skills: next }));
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        size="xs"
                        color="failure"
                        onClick={() =>
                          setWizard((w) => ({
                            ...w,
                            skills: (w.skills || []).filter((_, i) => i !== index),
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
    </div>
    </div>
  );
}

function ListEditorSection({
  idPrefix,
  title,
  emptyHint,
  rows,
  subtitleMultiline,
  onAdd,
  onRemove,
  onChangeRow,
  t,
}: {
  idPrefix: string;
  title: string;
  emptyHint: string;
  rows: TemplateListItem[];
  subtitleMultiline?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChangeRow: (index: number, field: keyof TemplateListItem, value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3">
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
                  {subtitleMultiline ? (
                    <Textarea
                      id={`${idPrefix}-${index}-s`}
                      rows={3}
                      className="mt-1"
                      value={row.subtitle}
                      onChange={(e) => onChangeRow(index, 'subtitle', e.target.value)}
                    />
                  ) : (
                    <TextInput
                      id={`${idPrefix}-${index}-s`}
                      sizing="sm"
                      className="mt-1"
                      value={row.subtitle}
                      onChange={(e) => onChangeRow(index, 'subtitle', e.target.value)}
                    />
                  )}
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
