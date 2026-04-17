import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import CvPreviewCard, { readCardVisualFromRaw } from '../components/cv-preview/CvPreviewCard';
import type { CvAccent } from '../components/CvPublicSections';
import { trackEvent } from '../analytics/ga4';

interface PreviewProps {
  initialData?: Record<string, unknown>;
  isPublicView?: boolean;
}

interface PreviewCardData {
  personal_info: { name: string; title: string };
  summary: string;
}

const Preview: React.FC<PreviewProps> = ({ initialData, isPublicView }) => {
  const { t } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();

  const data: PreviewCardData = initialData
    ? (() => {
        const pi =
          typeof initialData.personal_info === 'object' && initialData.personal_info
            ? (initialData.personal_info as Record<string, unknown>)
            : {};
        return {
          personal_info: {
            name: String(pi.name ?? initialData.name ?? ''),
            title: String(pi.title ?? ''),
          },
          summary: String(initialData.summary ?? ''),
        };
      })()
    : {
        personal_info: {
          name: t('components.preview.defaultName', 'Il Tuo Nome'),
          title: t('components.preview.defaultTitle', 'La Tua Professione'),
        },
        summary: t(
          'components.preview.defaultSummary',
          "Dimentica l'invio di vecchi file PDF. Con la nostra piattaforma, il tuo profilo professionale è una Single Page Application moderna sul tuo dominio.",
        ),
      };

  const editorRoot =
    isPublicView && initialData && typeof initialData === 'object'
      ? (initialData as { nordevit_editor?: { accent?: string } }).nordevit_editor
      : undefined;
  const accentKey: CvAccent =
    editorRoot?.accent === 'violet' || editorRoot?.accent === 'teal' ? editorRoot.accent : 'indigo';

  const publicRaw =
    isPublicView && initialData && typeof initialData === 'object'
      ? (initialData as Record<string, unknown>)
      : null;
  const { density, headingSize } = readCardVisualFromRaw(publicRaw ?? initialData);

  return (
    <section id="preview" className="relative scroll-mt-24 overflow-hidden py-16 dark:bg-gray-900/50 lg:py-24">
      <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 lg:grid lg:grid-cols-2 lg:px-6">
        <div className="relative order-2 lg:order-1">
          <CvPreviewCard
            accent={accentKey}
            rawForSections={publicRaw}
            hero={{
              name: data.personal_info.name,
              title: data.personal_info.title,
              summary: data.summary,
            }}
            mode="static"
            showSkeletonSections={!(isPublicView && publicRaw)}
            showPlaceholderSections
            density={density}
            headingSize={headingSize}
          />
        </div>
        <div className="mt-8 lg:mt-0 order-1 lg:order-2">
          <div className="inline-block px-3 py-1 mb-4 text-[10px] lg:text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
            {t('components.preview.badge')}
          </div>
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-5xl leading-tight">
            {t('components.preview.title')}
            <span className="text-gradient">{t('components.preview.highlight')}</span>
            {t('components.preview.subtitle')}
          </h2>
          {!isPublicView && (
            <div className="mb-6 lg:mb-8 p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-lg">
              <p className="font-medium text-gray-700 dark:text-gray-300 italic text-base lg:text-lg leading-relaxed">
                "{t('components.preview.quote')}"
              </p>
              <footer className="mt-2 text-xs lg:text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                — {t('components.preview.quoteAuthor')}
              </footer>
            </div>
          )}
          <p className="mb-8 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {isPublicView ? (
              t('components.preview.descriptionPublic', { name: data.personal_info?.name })
            ) : (
              <>
                {t('components.preview.descriptionPrivate')}
                <strong className="text-gray-900 dark:text-white">{t('components.preview.descriptionHighlight')}</strong>{' '}
                {t('components.preview.descriptionHighlightSuffix', 'velocissima.')}
              </>
            )}
          </p>
          {!isPublicView && (
            <div className="flex flex-wrap gap-4">
              <a
                href={`/${lang}#price`}
                onClick={() => trackEvent('cta_pricing_click', { placement: 'preview' })}
                className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-colors duration-200 hover:bg-indigo-700 dark:shadow-none lg:px-6 lg:py-3 lg:text-base"
              >
                {t('components.preview.cta')}
                <svg className="ml-2 w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Preview;
