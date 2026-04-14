import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { listEntitlements, type Entitlement } from '../api/cvApi';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const [linkVisibility, setLinkVisibility] = useState<'publicWithExpiry' | 'privateTokenized'>('publicWithExpiry');
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [accessToken, setAccessToken] = useState('cv-token-xyz123');
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);

  useEffect(() => {
    listEntitlements()
      .then(setEntitlements)
      .catch(() => setEntitlements([]))
      .finally(() => setBillingLoading(false));
  }, []);

  const isPro = entitlements.some(
    (e) => e.is_active && e.feature === 'cv_publish' && (!e.expires_at || new Date(e.expires_at) > new Date()),
  );

  const handleRegenerateToken = () => {
    setAccessToken(`cv-token-${Math.random().toString(36).substring(2, 15)}`);
  };

  const handleCopyLink = () => {
    const link = linkVisibility === 'publicWithExpiry'
      ? `${window.location.origin}/cv/public/${accessToken}`
      : `${window.location.origin}/cv/private/${accessToken}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-md mb-8 dark:text-white">
          {t('settings.title')}
        </h1>

        {/* Privacy & CV Link Settings */}
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('settings.privacy.title')}
            </h2>

            <div className="space-y-6">
              {/* Visibility Toggle */}
              <div>
                <label className="form-label">{t('settings.privacy.visibility.label')}</label>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => setLinkVisibility('publicWithExpiry')}
                    className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${
                      linkVisibility === 'publicWithExpiry'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {t('settings.privacy.visibility.publicWithExpiry')}
                    </div>
                  </button>
                  <button
                    onClick={() => setLinkVisibility('privateTokenized')}
                    className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${
                      linkVisibility === 'privateTokenized'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {t('settings.privacy.visibility.privateTokenized')}
                    </div>
                  </button>
                </div>
              </div>

              {/* Expiry Settings */}
              {linkVisibility === 'publicWithExpiry' && (
                <div>
                  <label htmlFor="expiry" className="form-label">{t('settings.privacy.expiry.label')}</label>
                  <select
                    id="expiry"
                    value={expiryMonths}
                    onChange={(e) => setExpiryMonths(Number(e.target.value))}
                    className="select-base mt-2"
                  >
                    <option value={3}>3 {t('settings.privacy.expiry.months')}</option>
                    <option value={6}>6 {t('settings.privacy.expiry.months')}</option>
                    <option value={12}>12 {t('settings.privacy.expiry.months')}</option>
                    <option value={24}>24 {t('settings.privacy.expiry.months')}</option>
                  </select>
                </div>
              )}

              {/* Token Management */}
              {linkVisibility === 'privateTokenized' && (
                <div>
                  <label className="form-label">{t('settings.privacy.token.label')}</label>
                  <div className="flex gap-2 mt-2">
                    <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono break-all">
                      {accessToken}
                    </code>
                    <button onClick={handleRegenerateToken} className="btn-secondary">
                      {t('settings.privacy.token.regenerate')}
                    </button>
                  </div>
                </div>
              )}

              {/* Copy Link */}
              <div className="flex gap-2">
                <button onClick={handleCopyLink} className="btn-secondary flex-1">
                  {t('settings.privacy.token.copyLink')}
                </button>
              </div>

              {/* Revoke Access */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => {
                    if (confirm(t('settings.privacy.revoke.confirm'))) {
                      // Revoke logic here
                    }
                  }}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  {t('settings.privacy.revoke.button')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="card mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('settings.billing.title')}
            </h2>

            {billingLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">{t('common.loading')}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.billing.currentPlan')}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPro ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {isPro ? t('settings.billing.planPro') : t('settings.billing.planFree')}
                  </span>
                </div>

                {entitlements.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.billing.activeFeatures')}</p>
                    <ul className="space-y-2">
                      {entitlements.filter(e => e.is_active).map((e, i) => (
                        <li key={i} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t(`settings.billing.features.${e.feature}`, e.feature)}
                          </span>
                          {e.expires_at && (
                            <span className="text-xs text-gray-500">
                              {t('settings.billing.expiresOn')} {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(e.expires_at))}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('settings.billing.noActive')}</p>
                    <Link to={`/${lang}/pricing`} className="btn-primary text-sm">
                      {t('settings.billing.upgrade')}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Language Settings */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('settings.language.title')}
            </h2>
            <div>
              <label htmlFor="language" className="form-label">{t('settings.language.select')}</label>
              <select
                id="language"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="select-base mt-2"
              >
                <option value="it">{t('common.italian')}</option>
                <option value="en">{t('common.english')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}