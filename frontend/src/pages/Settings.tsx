import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { listEntitlements, type Entitlement } from '../api/cvApi';
import AccountPanel from '../features/settings/AccountPanel';

type SettingsTab = 'account' | 'privacy' | 'billing' | 'language';

const VALID_TABS: SettingsTab[] = ['account', 'privacy', 'billing', 'language'];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<SettingsTab>('account');
  const [linkVisibility, setLinkVisibility] = useState<'publicWithExpiry' | 'privateTokenized'>('publicWithExpiry');
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [accessToken, setAccessToken] = useState('cv-token-xyz123');
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('tab');
    if (q && VALID_TABS.includes(q as SettingsTab)) {
      setTab(q as SettingsTab);
    }
  }, [searchParams]);

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
    const link =
      linkVisibility === 'publicWithExpiry'
        ? `${window.location.origin}/cv/public/${accessToken}`
        : `${window.location.origin}/cv/private/${accessToken}`;
    void navigator.clipboard.writeText(link);
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'account', label: t('settings.tabs.account') },
    { id: 'privacy', label: t('settings.tabs.privacy') },
    { id: 'billing', label: t('settings.tabs.billing') },
    { id: 'language', label: t('settings.tabs.language') },
  ];

  const tabBtn = (id: SettingsTab) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
      tab === id
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-md mb-6 dark:text-white">{t('settings.title')}</h1>

        <div
          className="mb-8 flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-700"
          role="tablist"
          aria-label={t('settings.title')}
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tabBtn(id)}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'account' && (
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('settings.tabs.account')}
              </h2>
              <AccountPanel />
            </div>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('settings.privacy.title')}</h2>

              <div className="space-y-6">
                <div>
                  <label className="form-label">{t('settings.privacy.visibility.label')}</label>
                  <div className="mt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setLinkVisibility('publicWithExpiry')}
                      className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
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
                      type="button"
                      onClick={() => setLinkVisibility('privateTokenized')}
                      className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
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

                {linkVisibility === 'publicWithExpiry' && (
                  <div>
                    <label htmlFor="expiry" className="form-label">
                      {t('settings.privacy.expiry.label')}
                    </label>
                    <select
                      id="expiry"
                      value={expiryMonths}
                      onChange={(e) => setExpiryMonths(Number(e.target.value))}
                      className="select-base mt-2"
                    >
                      <option value={3}>
                        3 {t('settings.privacy.expiry.months')}
                      </option>
                      <option value={6}>
                        6 {t('settings.privacy.expiry.months')}
                      </option>
                      <option value={12}>
                        12 {t('settings.privacy.expiry.months')}
                      </option>
                      <option value={24}>
                        24 {t('settings.privacy.expiry.months')}
                      </option>
                    </select>
                  </div>
                )}

                {linkVisibility === 'privateTokenized' && (
                  <div>
                    <label className="form-label">{t('settings.privacy.token.label')}</label>
                    <div className="mt-2 flex gap-2">
                      <code className="flex-1 break-all rounded-lg bg-gray-100 p-3 font-mono text-sm dark:bg-gray-800">
                        {accessToken}
                      </code>
                      <button type="button" onClick={handleRegenerateToken} className="btn-secondary">
                        {t('settings.privacy.token.regenerate')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button type="button" onClick={handleCopyLink} className="btn-secondary flex-1">
                    {t('settings.privacy.token.copyLink')}
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t('settings.privacy.revoke.confirm'))) {
                        /* Revoke logic */
                      }
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    {t('settings.privacy.revoke.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('settings.billing.title')}</h2>

              {billingLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm">{t('common.loading')}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.billing.currentPlan')}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isPro
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {isPro ? t('settings.billing.planPro') : t('settings.billing.planFree')}
                    </span>
                  </div>

                  {entitlements.length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('settings.billing.activeFeatures')}
                      </p>
                      <ul className="space-y-2">
                        {entitlements
                          .filter((e) => e.is_active)
                          .map((e, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-800"
                            >
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {t(`settings.billing.features.${e.feature}`, e.feature)}
                              </span>
                              {e.expires_at && (
                                <span className="text-xs text-gray-500">
                                  {t('settings.billing.expiresOn')}{' '}
                                  {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                                    new Date(e.expires_at),
                                  )}
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{t('settings.billing.noActive')}</p>
                    </div>
                  )}

                  {!isPro ? (
                    <div className={entitlements.length > 0 ? 'mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30' : 'mt-4 text-center'}>
                      {entitlements.length > 0 ? (
                        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                          {t('settings.billing.upgradeHint')}
                        </p>
                      ) : null}
                      <Link to={`/${lang}/pricing`} className="btn-primary text-sm inline-flex">
                        {t('settings.billing.upgrade')}
                      </Link>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'language' && (
          <div className="card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('settings.language.title')}</h2>
              <div>
                <label htmlFor="language" className="form-label">
                  {t('settings.language.select')}
                </label>
                <select
                  id="language"
                  value={i18n.language?.startsWith('en') ? 'en' : 'it'}
                  onChange={(e) => void i18n.changeLanguage(e.target.value)}
                  className="select-base mt-2"
                >
                  <option value="it">{t('common.italian')}</option>
                  <option value="en">{t('common.english')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
