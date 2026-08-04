import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CVStepProps } from './CVWizard';
import { normalizeListItem, type TemplateListItem } from '../../utils/cvTemplateLists';

interface CVPreviewStepProps extends Omit<CVStepProps, 'updateCVData' | 'onNext'> {}

function toListItems(items: unknown[]): TemplateListItem[] {
  return items.map((x) => normalizeListItem(x));
}

export default function CVPreviewStep({ cvData }: CVPreviewStepProps) {
  const { t } = useTranslation();

  const experienceItems = useMemo(
    () => toListItems(Array.isArray(cvData.experience) ? cvData.experience : []),
    [cvData.experience],
  );
  const educationItems = useMemo(
    () => toListItems(Array.isArray(cvData.education) ? cvData.education : []),
    [cvData.education],
  );
  const skills = useMemo(() => (cvData.skills || []).map((s) => String(s).trim()).filter(Boolean), [cvData.skills]);

  const hasExp = experienceItems.some((x) => x.period || x.title || x.subtitle);
  const hasEdu = educationItems.some((x) => x.period || x.title || x.subtitle);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('builder.steps.preview')}
      </h2>

      {/* CV Preview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
          </h1>
          <div className="flex flex-wrap gap-4 mt-3 text-gray-600 dark:text-gray-400 text-sm">
            {cvData.personalInfo.email && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {cvData.personalInfo.email}
              </span>
            )}
            {cvData.personalInfo.phone && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {cvData.personalInfo.phone}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {cvData.personalInfo.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('builder.preview.sections.profile')}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {cvData.personalInfo.summary}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('builder.preview.sections.experience')}</h2>
          {!hasExp ? (
            <p className="text-gray-500 italic">{t('builder.preview.empty.experience')}</p>
          ) : (
            <ul className="space-y-4">
              {experienceItems
                .filter((x) => x.period || x.title || x.subtitle)
                .map((row, i) => (
                  <li key={`pe-${i}`} className="border-l-2 border-indigo-500 pl-4">
                    {row.period ? <p className="text-sm text-gray-500 dark:text-gray-400">{row.period}</p> : null}
                    {row.title ? <p className="font-medium text-gray-900 dark:text-white">{row.title}</p> : null}
                    {row.subtitle ? <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{row.subtitle}</p> : null}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('builder.preview.sections.education')}</h2>
          {!hasEdu ? (
            <p className="text-gray-500 italic">{t('builder.preview.empty.education')}</p>
          ) : (
            <ul className="space-y-4">
              {educationItems
                .filter((x) => x.period || x.title || x.subtitle)
                .map((row, i) => (
                  <li key={`ed-${i}`} className="border-l-2 border-indigo-500 pl-4">
                    {row.period ? <p className="text-sm text-gray-500 dark:text-gray-400">{row.period}</p> : null}
                    {row.title ? <p className="font-medium text-gray-900 dark:text-white">{row.title}</p> : null}
                    {row.subtitle ? <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{row.subtitle}</p> : null}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('builder.preview.sections.skills')}</h2>
          {skills.length === 0 ? (
            <p className="text-gray-500 italic">{t('builder.preview.empty.skills')}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {skills.map((name) => (
                <li
                  key={name}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
