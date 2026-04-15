import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import CvPublicSections from '../components/CvPublicSections';
import { templateListsHaveContent, readTemplateLists } from '../utils/cvTemplateLists';
import { trackEvent } from '../analytics/ga4';

interface PreviewProps {
  initialData?: Record<string, unknown>;
  isPublicView?: boolean;
}

interface PreviewCardData {
  personal_info: { name: string; title: string };
  summary: string;
}

function accentGradients(accent: string) {
  if (accent === 'violet') {
    return {
      main: 'from-violet-500 to-fuchsia-600',
      avatar: 'from-violet-500 to-fuchsia-500',
      bar1: 'bg-violet-500/20',
      bar2: 'bg-fuchsia-500/20',
      bar3: 'bg-pink-500/20',
    };
  }
  if (accent === 'teal') {
    return {
      main: 'from-teal-500 to-cyan-600',
      avatar: 'from-teal-500 to-cyan-500',
      bar1: 'bg-teal-500/20',
      bar2: 'bg-cyan-500/20',
      bar3: 'bg-emerald-500/20',
    };
  }
  return {
    main: 'from-indigo-500 to-purple-600',
    avatar: 'from-indigo-500 to-purple-500',
    bar1: 'bg-indigo-500/20',
    bar2: 'bg-purple-500/20',
    bar3: 'bg-pink-500/20',
  };
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
  const accentKey =
    editorRoot?.accent === 'violet' || editorRoot?.accent === 'teal'
      ? editorRoot.accent
      : ('indigo' as const);
  const g = accentGradients(accentKey);

  const publicRaw =
    isPublicView && initialData && typeof initialData === 'object'
      ? (initialData as Record<string, unknown>)
      : null;
  const publicLists = publicRaw ? readTemplateLists(publicRaw) : null;
  const publicHasSections = publicLists ? templateListsHaveContent(publicLists) : false;

  return (
    <section id="preview" className="relative scroll-mt-24 overflow-hidden py-16 dark:bg-gray-900/50 lg:py-24">
      <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 lg:grid lg:grid-cols-2 lg:px-6">
        <div className="relative group order-2 lg:order-1">
          <div className={`absolute -inset-2 bg-gradient-to-r ${g.main} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
          <div className="glass-card relative p-6 lg:p-10 rounded-2xl min-h-[350px] lg:min-h-[450px] transition-shadow duration-300 lg:hover:shadow-2xl">
             {/* Mock CV Rendering */}
             <div className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 lg:pb-6 mb-4 lg:mb-6">
                <div className="flex items-center gap-3 lg:gap-4 mb-4">
                  <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-tr ${g.avatar}`}></div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{data.personal_info?.name}</h3>
                    <p
                      className={`font-medium tracking-wide uppercase text-[10px] lg:text-xs ${
                        accentKey === 'violet'
                          ? 'text-violet-600 dark:text-violet-400'
                          : accentKey === 'teal'
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {data.personal_info?.title}
                    </p>
                  </div>
                </div>
             </div>
             <div className="text-gray-600 dark:text-gray-300">
                <p className="leading-relaxed text-sm lg:text-base">{data.summary}</p>
             </div>
             {isPublicView && publicRaw ? (
               <CvPublicSections
                 raw={publicRaw}
                 accent={accentKey}
                 showPlaceholder={!publicHasSections}
               />
             ) : (
               <div className="mt-8 lg:mt-10 space-y-3 lg:space-y-4">
                 <div className="h-2.5 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
                 <div className="h-2.5 w-5/6 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
                 <div className="h-2.5 w-4/6 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
                 <div className="mt-4 grid grid-cols-3 gap-3 lg:mt-6 lg:gap-4">
                   <div className={`h-1.5 rounded-full ${g.bar1}`} />
                   <div className={`h-1.5 rounded-full ${g.bar2}`} />
                   <div className={`h-1.5 rounded-full ${g.bar3}`} />
                 </div>
               </div>
             )}
          </div>
        </div>
        <div className="mt-8 lg:mt-0 order-1 lg:order-2">
          <div className="inline-block px-3 py-1 mb-4 text-[10px] lg:text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
            {t('components.preview.badge')}
          </div>
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-5xl leading-tight">
            {t('components.preview.title')}<span className="text-gradient">{t('components.preview.highlight')}</span>{t('components.preview.subtitle')}
          </h2>
          {!isPublicView && (
            <div className="mb-6 lg:mb-8 p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-lg">
              <p className="font-medium text-gray-700 dark:text-gray-300 italic text-base lg:text-lg leading-relaxed">
                "{t('components.preview.quote')}"
              </p>
              <footer className="mt-2 text-xs lg:text-sm text-indigo-600 dark:text-indigo-400 font-bold">— {t('components.preview.quoteAuthor')}</footer>
            </div>
          )}
          <p className="mb-8 text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {isPublicView
              ? t('components.preview.descriptionPublic', { name: data.personal_info?.name })
              : <>{t('components.preview.descriptionPrivate')}<strong className="text-gray-900 dark:text-white">{t('components.preview.descriptionHighlight')}</strong>{" "}{t('components.preview.descriptionHighlightSuffix', 'velocissima.')}</>
            }
          </p>
          {!isPublicView && (
            <div className="flex flex-wrap gap-4">
              <a
                href={`/${lang}#price`}
                onClick={() => trackEvent('cta_pricing_click', { placement: 'preview' })}
                className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-colors duration-200 hover:bg-indigo-700 dark:shadow-none lg:px-6 lg:py-3 lg:text-base"
              >
                {t('components.preview.cta')}
                <svg className="ml-2 w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Preview;
