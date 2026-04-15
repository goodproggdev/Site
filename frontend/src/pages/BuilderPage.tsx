import { Suspense, lazy } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CVWizard = lazy(() => import('../features/cv-builder/CVWizard'));

export default function BuilderPage() {
  const { t } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const [params] = useSearchParams();
  const raw = params.get('cvId') ?? params.get('cv');
  const initialCvId = raw ? Number.parseInt(raw, 10) : NaN;
  const cvId = Number.isFinite(initialCvId) ? initialCvId : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="heading-md dark:text-white">{t('builder.pageTitle')}</h1>
          <Link to={`/${lang}/dashboard`} className="btn-secondary text-sm">
            {t('builder.backDashboard')}
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          }
        >
          <CVWizard initialCvId={cvId} />
        </Suspense>
      </div>
    </div>
  );
}
