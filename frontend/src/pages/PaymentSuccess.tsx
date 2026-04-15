import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../analytics/ga4';

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const purchaseTracked = useRef(false);

  useEffect(() => {
    if (!purchaseTracked.current) {
      purchaseTracked.current = true;
      trackEvent('purchase', { source: 'stripe_checkout' });
    }
  }, []);

  useEffect(() => {
    // Auto-redirect to dashboard after 5s
    const timer = setTimeout(() => {
      navigate(`/${lang ?? 'it'}/dashboard`);
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, lang]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('payment.success.title', 'Pagamento confermato!')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('payment.success.description', 'Il tuo piano è attivo. Ora puoi caricare il tuo CV e ottenere il tuo link professionale.')}
        </p>

        <button
          onClick={() => navigate(`/${lang ?? 'it'}/dashboard`)}
          className="btn-primary btn-lg w-full sm:w-auto"
        >
          {t('payment.success.cta', 'Vai alla dashboard')}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
          {t('payment.success.autoRedirect', 'Verrai reindirizzato automaticamente in pochi secondi...')}
        </p>
      </div>
    </div>
  );
}
