import { useTranslation } from 'react-i18next';
import { TextInput, Textarea } from 'flowbite-react';
import CvPublicSections, { type CvAccent, type CvPublicSectionsEditHandlers } from '../CvPublicSections';
import CvPublicExtraSections from '../CvPublicExtraSections';
import { readTemplateLists, templateListsHaveContent } from '../../utils/cvTemplateLists';

export type CvPreviewCardMode = 'static' | 'edit';

export type CvPreviewDensity = 'comfortable' | 'compact';
export type CvPreviewHeadingSize = 'sm' | 'md' | 'lg';

/** Legge densità e dimensione titolo da `nordevit_editor` (default sicuri). */
export function readCardVisualFromRaw(
  raw: Record<string, unknown> | null | undefined,
): { density: CvPreviewDensity; headingSize: CvPreviewHeadingSize } {
  const ed = (raw?.nordevit_editor as Record<string, unknown>) || {};
  const density: CvPreviewDensity = ed.density === 'compact' ? 'compact' : 'comfortable';
  const hs = String(ed.headingSize);
  const headingSize: CvPreviewHeadingSize = hs === 'sm' || hs === 'lg' ? hs : 'md';
  return { density, headingSize };
}

export function accentGradients(accent: CvAccent) {
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

function titleAccentClass(accent: CvAccent): string {
  if (accent === 'violet') return 'text-violet-600 dark:text-violet-400';
  if (accent === 'teal') return 'text-teal-600 dark:text-teal-400';
  return 'text-indigo-600 dark:text-indigo-400';
}

function nameHeadingClass(size: CvPreviewHeadingSize): string {
  if (size === 'sm') return 'text-lg lg:text-xl';
  if (size === 'lg') return 'text-2xl lg:text-3xl';
  return 'text-xl lg:text-2xl';
}

export interface CvPreviewCardProps {
  accent: CvAccent;
  /** Dati completi per le sezioni sotto (esperienza, formazione, skills). */
  rawForSections: Record<string, unknown> | null;
  /** Intestazione card (nome, titolo, sommario). */
  hero: { name: string; title: string; summary: string };
  mode: CvPreviewCardMode;
  /** Se true e `rawForSections` è null, mostra skeleton sezioni (marketing). */
  showSkeletonSections?: boolean;
  showPlaceholderSections?: boolean;
  /** Modalità edit: campi controllati sul canvas. */
  heroBinding?: {
    onNameChange: (v: string) => void;
    onTitleChange: (v: string) => void;
    onSummaryChange: (v: string) => void;
  };
  density?: CvPreviewDensity;
  headingSize?: CvPreviewHeadingSize;
  /** Classi aggiuntive sul wrapper esterno (es. max-width viewport). */
  wrapperClassName?: string;
  sectionsEditable?: boolean;
  sectionsEditHandlers?: CvPublicSectionsEditHandlers;
}

export default function CvPreviewCard({
  accent,
  rawForSections,
  hero,
  mode,
  showSkeletonSections = false,
  showPlaceholderSections = true,
  heroBinding,
  density = 'comfortable',
  headingSize = 'md',
  wrapperClassName = '',
  sectionsEditable = false,
  sectionsEditHandlers,
}: CvPreviewCardProps) {
  const { t } = useTranslation();
  const g = accentGradients(accent);
  const publicHasSections = rawForSections ? templateListsHaveContent(readTemplateLists(rawForSections)) : false;
  const headerPb = density === 'compact' ? 'pb-3 mb-3 lg:pb-4 lg:mb-4' : 'pb-4 lg:pb-6 mb-4 lg:mb-6';
  const minH = density === 'compact' ? 'min-h-[280px] lg:min-h-[360px]' : 'min-h-[350px] lg:min-h-[450px]';
  const cardPad = density === 'compact' ? 'p-4 lg:p-6' : 'p-6 lg:p-10';

  const renderHero = () => {
    if (mode === 'edit' && heroBinding) {
      return (
        <div className={`border-b border-gray-200/50 dark:border-gray-700/50 ${headerPb}`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr sm:h-12 sm:w-12 ${g.avatar}`} />
            <div className="min-w-0 flex-1 space-y-2">
              <TextInput
                aria-label={t('cvEditor.visual.heroName')}
                value={hero.name}
                onChange={(e) => heroBinding.onNameChange(e.target.value)}
                className={`font-bold text-gray-900 dark:text-white ${nameHeadingClass(headingSize)} leading-tight`}
                sizing="lg"
              />
              <TextInput
                aria-label={t('cvEditor.visual.heroTitle')}
                value={hero.title}
                onChange={(e) => heroBinding.onTitleChange(e.target.value)}
                className={`font-medium uppercase tracking-wide text-[10px] lg:text-xs ${titleAccentClass(accent)}`}
                sizing="sm"
              />
            </div>
          </div>
          <Textarea
            aria-label={t('cvEditor.visual.heroSummary')}
            rows={density === 'compact' ? 4 : 6}
            value={hero.summary}
            onChange={(e) => heroBinding.onSummaryChange(e.target.value)}
            className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 lg:text-base"
          />
        </div>
      );
    }
    return (
      <div className={`border-b border-gray-200/50 dark:border-gray-700/50 ${headerPb}`}>
        <div className="mb-4 flex items-center gap-3 lg:mb-4 lg:gap-4">
          <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr lg:h-12 lg:w-12 ${g.avatar}`} />
          <div className="min-w-0">
            <h3
              className={`font-bold leading-tight text-gray-900 dark:text-white ${nameHeadingClass(headingSize)}`}
            >
              {hero.name}
            </h3>
            <p className={`font-medium uppercase tracking-wide text-[10px] lg:text-xs ${titleAccentClass(accent)}`}>
              {hero.title}
            </p>
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-sm leading-relaxed lg:text-base">{hero.summary}</p>
        </div>
      </div>
    );
  };

  const renderSections = () => {
    if (showSkeletonSections || !rawForSections) {
      return (
        <div className="mt-8 space-y-3 lg:mt-10 lg:space-y-4">
          <div className="h-2.5 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
          <div className="h-2.5 w-5/6 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
          <div className="h-2.5 w-4/6 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
          <div className="mt-4 grid grid-cols-3 gap-3 lg:mt-6 lg:gap-4">
            <div className={`h-1.5 rounded-full ${g.bar1}`} />
            <div className={`h-1.5 rounded-full ${g.bar2}`} />
            <div className={`h-1.5 rounded-full ${g.bar3}`} />
          </div>
        </div>
      );
    }
    return (
      <>
        <CvPublicSections
          raw={rawForSections}
          accent={accent}
          showPlaceholder={showPlaceholderSections ? !publicHasSections : false}
          editable={sectionsEditable}
          editHandlers={sectionsEditHandlers}
        />
        {/* Sezioni ricche (expertise/portfolio/servizi/tariffe/statistiche/lingue):
            solo in modalita' statica (pagina pubblica + anteprima), non ancora
            editabili dall'editor visuale. */}
        {mode === 'static' ? <CvPublicExtraSections raw={rawForSections} accent={accent} /> : null}
      </>
    );
  };

  return (
    <div className={`relative group ${wrapperClassName}`}>
      <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${g.main} blur-xl opacity-20 transition duration-1000 group-hover:opacity-40`} />
      <div
        className={`glass-card relative rounded-2xl transition-shadow duration-300 lg:hover:shadow-2xl ${minH} ${cardPad}`}
      >
        {renderHero()}
        {renderSections()}
      </div>
    </div>
  );
}
