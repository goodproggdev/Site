import { useTranslation } from 'react-i18next';

const Feature = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('components.features.items.fast.title'),
      description: t('components.features.items.fast.description'),
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t('components.features.items.design.title'),
      description: t('components.features.items.design.description'),
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: t('components.features.items.subdomain.title'),
      description: t('components.features.items.subdomain.description'),
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
    }
  ];

  return (
    <section id="services" className="scroll-mt-24 section-y bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl container-padding">
        {/* Header */}
        <div className="max-w-2xl mb-12 lg:mb-16">
          <span className="inline-block mb-4 text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            {t('components.features.badge')}
          </span>
          <h2 className="heading-md mb-4 dark:text-white">
            {t('components.features.title')}<span className="text-gradient-subtle">{t('components.features.highlight')}</span>
          </h2>
          <p className="text-body text-lg">
            {t('components.features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-6 lg:p-8 group hover:-translate-y-1 transition-transform duration-200"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold dark:text-white">
                {feature.title}
              </h3>
              <p className="text-body-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
