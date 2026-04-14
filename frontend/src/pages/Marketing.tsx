import { Button } from 'flowbite-react';
import { useTranslation } from 'react-i18next';

const MarketingSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-900 p-8 text-white">
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-lg shadow-lg">
            <span className="text-xl font-semibold">{t('components.marketing.title')}</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">{t('components.marketing.headline')}</h2>
            <p className="mb-4">{t('components.marketing.subtitle')}</p>
            <Button gradientDuoTone="purpleToPink" size="lg">
              {t('marketing.home.cta.secondary')}
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <img src="images/demo-image.png" alt={t('components.marketing.demoAlt')} className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default MarketingSection;
