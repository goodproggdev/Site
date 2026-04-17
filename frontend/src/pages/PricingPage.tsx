import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Pricing from './Pricing';

/**
 * Pagina prezzi dedicata: accessibile anche da utenti autenticati (a differenza di Home,
 * che reindirizza alla dashboard e impediva il checkout da "Attiva il piano Pro").
 */
export default function PricingPage() {
  const { lang = 'it' } = useParams<{ lang: string }>();
  const { t } = useTranslation();

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-screen-xl container-padding pt-6 pb-2">
        <Link
          to={`/${lang}/dashboard`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← {t('dashboard.title')}
        </Link>
      </div>
      <Pricing />
    </div>
  );
}
