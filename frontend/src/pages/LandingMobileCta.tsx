import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Barra CTA fissa su mobile solo sulla home localizzata (/, /it, /en).
 */
const LandingMobileCta = () => {
  const { t } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const { pathname } = useLocation();

  const isLangHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  if (!isLangHome) return null;

  const openUpload = () => {
    window.dispatchEvent(new CustomEvent('open-landing-upload'));
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="pointer-events-auto mx-auto max-w-lg">
        <button
          type="button"
          onClick={openUpload}
          className="btn-primary btn-lg w-full shadow-lg shadow-indigo-900/20"
        >
          {t('landing.mobileCta')}
        </button>
      </div>
    </div>
  );
};

export default LandingMobileCta;
