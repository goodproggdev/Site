import { useTranslation } from 'react-i18next';

type StatItem = { value: string; label: string };

const Statistics = () => {
  const { t } = useTranslation();
  const raw = t('homeStatistics.items', { returnObjects: true });
  const items = Array.isArray(raw) ? (raw as StatItem[]) : [];

  if (!items.length) return null;

  return (
    <section className="section-y bg-indigo-600 dark:bg-indigo-900">
      <div className="mx-auto max-w-screen-xl container-padding">
        <dl className="grid gap-8 md:grid-cols-3">
          {items.map((stat, index) => (
            <div key={index} className="text-center">
              <dt className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                {stat.value}
              </dt>
              <dd className="mx-auto max-w-sm text-sm font-normal normal-case leading-relaxed text-indigo-100">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Statistics;
