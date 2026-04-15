import { useTranslation } from 'react-i18next';

type StatItem = { value: string; label: string };

/**
 * Prova sociale immediata sotto la hero: metriche + micro-quote (LinkedIn-first).
 */
const TrustStrip = () => {
  const { t } = useTranslation();
  const raw = t('homeStatistics.items', { returnObjects: true });
  const items = Array.isArray(raw) ? (raw as StatItem[]) : [];

  if (!items.length) return null;

  return (
    <section
      id="trust"
      className="scroll-mt-24 border-y border-gray-200 bg-white py-10 dark:border-gray-800 dark:bg-gray-950"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-screen-xl container-padding">
        <h2
          id="trust-heading"
          className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
        >
          {t('landing.trustStrip.eyebrow')}
        </h2>
        <dl className="grid gap-8 sm:grid-cols-3">
          {items.map((stat, index) => (
            <div key={index} className="text-center sm:text-left">
              <dt className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{stat.label}</dd>
            </div>
          ))}
        </dl>
        <figure className="mx-auto mt-10 max-w-2xl border-l-4 border-indigo-500 pl-4 text-left">
          <blockquote className="text-base font-medium text-gray-800 dark:text-gray-200">
            &ldquo;{t('landing.trustStrip.quote')}&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('landing.trustStrip.author')}
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default TrustStrip;
