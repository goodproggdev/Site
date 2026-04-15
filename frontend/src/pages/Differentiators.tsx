import { useTranslation } from 'react-i18next';
import cv from '../assets/testCV.jpg';

/**
 * Sezione unificata "perché noi" + punti di forza (ex About + Feature), con anchor #about e #services per la navbar.
 */
const Differentiators = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('components.features.items.fast.title'),
      description: t('components.features.items.fast.description'),
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: t('components.features.items.design.title'),
      description: t('components.features.items.design.description'),
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
      title: t('components.features.items.subdomain.title'),
      description: t('components.features.items.subdomain.description'),
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      <section id="about" className="scroll-mt-24 section-y border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-screen-xl container-padding">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wide text-indigo-600">
                {t('landing.differentiators.aboutEyebrow')}
              </span>
              <h2 className="heading-md mb-6 dark:text-white">
                {t('about.title')}
                <span className="text-gradient-subtle">{t('about.highlight')}</span>
              </h2>
              <p className="text-body mb-6 text-lg">{t('about.subtitle')}</p>
              <blockquote className="border-l-4 border-indigo-500 py-2 pl-4">
                <p className="font-medium text-gray-900 dark:text-white">{t('marketing.home.features.items.2.description')}</p>
              </blockquote>
            </div>
            <div className="order-1 flex justify-center lg:order-2">
              <div className="relative max-w-md">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl" />
                <img
                  src={cv}
                  alt={t('landing.differentiators.imageAlt')}
                  className="relative w-full rounded-xl border border-gray-200 shadow-lg dark:border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 section-y bg-gray-50 dark:bg-gray-950/80">
        <div className="mx-auto max-w-screen-xl container-padding">
          <div className="mb-12 max-w-2xl lg:mb-16">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {t('components.features.badge')}
            </span>
            <h2 className="heading-md mb-4 dark:text-white">
              {t('components.features.title')}
              <span className="text-gradient-subtle">{t('components.features.highlight')}</span>
            </h2>
            <p className="text-body text-lg">{t('components.features.subtitle')}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 transition-shadow duration-200 hover:shadow-md lg:p-8">
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>{feature.icon}</div>
                <h3 className="mb-3 text-lg font-semibold dark:text-white">{feature.title}</h3>
                <p className="text-body-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Differentiators;
