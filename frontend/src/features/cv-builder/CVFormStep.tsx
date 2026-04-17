import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';
import type { CVStepProps } from './CVWizard';
import { shouldShowPdfNoTextLayerWarning } from './cvExtractionWarnings';
import { normalizeListItem, type TemplateListItem } from '../../utils/cvTemplateLists';

interface CVFormStepProps extends CVStepProps {}

function toListItems(items: unknown[]): TemplateListItem[] {
  return items.map((x) => normalizeListItem(x));
}

export default function CVFormStep({ cvData, updateCVData }: CVFormStepProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');

  const updatePersonalInfo = (field: string, value: string) => {
    updateCVData({
      personalInfo: { ...cvData.personalInfo, [field]: value },
    });
  };

  const experienceItems = useMemo(
    () => toListItems(Array.isArray(cvData.experience) ? cvData.experience : []),
    [cvData.experience],
  );
  const educationItems = useMemo(
    () => toListItems(Array.isArray(cvData.education) ? cvData.education : []),
    [cvData.education],
  );

  const patchExperience = useCallback(
    (index: number, field: keyof TemplateListItem, value: string) => {
      const list = toListItems(Array.isArray(cvData.experience) ? cvData.experience : []);
      const next = { ...list[index], [field]: value };
      list[index] = next;
      updateCVData({ experience: list as unknown[] });
    },
    [cvData.experience, updateCVData],
  );

  const addExperience = useCallback(() => {
    const list = toListItems(Array.isArray(cvData.experience) ? cvData.experience : []);
    list.push({ period: '', title: '', subtitle: '' });
    updateCVData({ experience: list as unknown[] });
  }, [cvData.experience, updateCVData]);

  const removeExperience = useCallback(
    (index: number) => {
      const list = toListItems(Array.isArray(cvData.experience) ? cvData.experience : []);
      list.splice(index, 1);
      updateCVData({ experience: list as unknown[] });
    },
    [cvData.experience, updateCVData],
  );

  const patchEducation = useCallback(
    (index: number, field: keyof TemplateListItem, value: string) => {
      const list = toListItems(Array.isArray(cvData.education) ? cvData.education : []);
      list[index] = { ...list[index], [field]: value };
      updateCVData({ education: list as unknown[] });
    },
    [cvData.education, updateCVData],
  );

  const addEducation = useCallback(() => {
    const list = toListItems(Array.isArray(cvData.education) ? cvData.education : []);
    list.push({ period: '', title: '', subtitle: '' });
    updateCVData({ education: list as unknown[] });
  }, [cvData.education, updateCVData]);

  const removeEducation = useCallback(
    (index: number) => {
      const list = toListItems(Array.isArray(cvData.education) ? cvData.education : []);
      list.splice(index, 1);
      updateCVData({ education: list as unknown[] });
    },
    [cvData.education, updateCVData],
  );

  const addSkill = useCallback(() => {
    updateCVData({ skills: [...(cvData.skills || []), ''] });
  }, [cvData.skills, updateCVData]);

  const setSkill = useCallback(
    (index: number, value: string) => {
      const s = [...(cvData.skills || [])];
      s[index] = value;
      updateCVData({ skills: s });
    },
    [cvData.skills, updateCVData],
  );

  const removeSkill = useCallback(
    (index: number) => {
      updateCVData({ skills: (cvData.skills || []).filter((_, i) => i !== index) });
    },
    [cvData.skills, updateCVData],
  );

  const showPdfTextWarning = shouldShowPdfNoTextLayerWarning(cvData);
  const raw = cvData.parsedData;
  const extractionEn = raw && typeof raw === 'object' ? String((raw as Record<string, unknown>).extraction_status_en ?? '') : '';
  const extractionIt = raw && typeof raw === 'object' ? String((raw as Record<string, unknown>).extraction_status_it ?? '') : '';
  const showExtractionFailedBanner = extractionEn === 'Failed' && extractionIt === 'Failed';

  const headingKey =
    activeTab === 'personal'
      ? 'builder.form.personalInfo'
      : activeTab === 'experience'
        ? 'builder.form.experience'
        : activeTab === 'education'
          ? 'builder.form.education'
          : 'builder.form.skills';

  return (
    <div>
      {showExtractionFailedBanner && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <p className="font-medium">{t('builder.form.extractionBothFailed')}</p>
        </div>
      )}
      {showPdfTextWarning && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <p className="font-medium">{t('builder.upload.extractionWarningPdfNoText')}</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">{t('builder.upload.extractionWarningPdfNoTextHint')}</p>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t(headingKey)}</h2>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['personal', 'experience', 'education', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {t(`builder.form.${tab === 'personal' ? 'personalInfo' : tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" value={t('builder.form.labels.firstName')} />
              <TextInput
                id="firstName"
                value={cvData.personalInfo.firstName || ''}
                onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                placeholder={t('builder.form.placeholders.firstName')}
              />
            </div>
            <div>
              <Label htmlFor="lastName" value={t('builder.form.labels.lastName')} />
              <TextInput
                id="lastName"
                value={cvData.personalInfo.lastName || ''}
                onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                placeholder={t('builder.form.placeholders.lastName')}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" value={t('builder.form.labels.email')} />
            <TextInput
              id="email"
              type="email"
              value={cvData.personalInfo.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder={t('builder.form.placeholders.email')}
            />
          </div>
          <div>
            <Label htmlFor="phone" value={t('builder.form.labels.phone')} />
            <TextInput
              id="phone"
              value={cvData.personalInfo.phone || ''}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder={t('builder.form.placeholders.phone')}
            />
          </div>
          <div>
            <Label htmlFor="summary" value={t('builder.form.labels.summary')} />
            <Textarea
              id="summary"
              rows={4}
              value={cvData.personalInfo.summary || ''}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder={t('builder.form.placeholders.summary')}
            />
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="space-y-4">
          {experienceItems.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('builder.form.list.emptyHint')}</p>
          ) : null}
          {experienceItems.map((row, index) => (
            <div
              key={`exp-${index}`}
              className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/40"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <Label value={t('builder.form.list.period')} />
                  <TextInput
                    value={row.period}
                    onChange={(e) => patchExperience(index, 'period', e.target.value)}
                    placeholder={t('builder.form.placeholders.period')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label value={t('builder.form.list.jobTitle')} />
                  <TextInput
                    value={row.title}
                    onChange={(e) => patchExperience(index, 'title', e.target.value)}
                    placeholder={t('builder.form.placeholders.jobTitle')}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label value={t('builder.form.list.companyNotes')} />
                <Textarea
                  rows={2}
                  value={row.subtitle}
                  onChange={(e) => patchExperience(index, 'subtitle', e.target.value)}
                  placeholder={t('builder.form.placeholders.companyNotes')}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" color="failure" size="xs" outline onClick={() => removeExperience(index)}>
                  {t('builder.form.remove')}
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" color="indigo" size="sm" onClick={addExperience}>
            {t('builder.form.add')}
          </Button>
        </div>
      )}

      {activeTab === 'education' && (
        <div className="space-y-4">
          {educationItems.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('builder.form.list.emptyHint')}</p>
          ) : null}
          {educationItems.map((row, index) => (
            <div
              key={`edu-${index}`}
              className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/40"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <Label value={t('builder.form.list.period')} />
                  <TextInput
                    value={row.period}
                    onChange={(e) => patchEducation(index, 'period', e.target.value)}
                    placeholder={t('builder.form.placeholders.period')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label value={t('builder.form.list.degree')} />
                  <TextInput
                    value={row.title}
                    onChange={(e) => patchEducation(index, 'title', e.target.value)}
                    placeholder={t('builder.form.placeholders.degree')}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label value={t('builder.form.list.school')} />
                <TextInput
                  value={row.subtitle}
                  onChange={(e) => patchEducation(index, 'subtitle', e.target.value)}
                  placeholder={t('builder.form.placeholders.school')}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" color="failure" size="xs" outline onClick={() => removeEducation(index)}>
                  {t('builder.form.remove')}
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" color="indigo" size="sm" onClick={addEducation}>
            {t('builder.form.add')}
          </Button>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          {(cvData.skills || []).length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('builder.form.list.emptyHint')}</p>
          ) : null}
          {(cvData.skills || []).map((skill, index) => (
            <div key={`sk-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="grow">
                <Label value={t('builder.form.list.skillName')} />
                <TextInput
                  value={skill}
                  onChange={(e) => setSkill(index, e.target.value)}
                  placeholder={t('builder.form.placeholders.skillName')}
                />
              </div>
              <Button type="button" color="failure" size="sm" outline onClick={() => removeSkill(index)}>
                {t('builder.form.remove')}
              </Button>
            </div>
          ))}
          <Button type="button" color="indigo" size="sm" onClick={addSkill}>
            {t('builder.form.add')}
          </Button>
        </div>
      )}
    </div>
  );
}
