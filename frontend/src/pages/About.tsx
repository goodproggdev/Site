import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="scroll-mt-24 section-y bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl container-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <span className="inline-block mb-4 text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              Expertly Crafted
            </span>
            
            <h2 className="heading-md mb-6 dark:text-white">
              {t('about.title')}<span className="text-gradient-subtle">{t('about.highlight')}</span>
            </h2>
            
            <p className="text-body mb-6">
              {t('about.subtitle')}
            </p>
            
            <blockquote className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-gray-900 dark:text-white font-medium">
                {t('marketing.home.features.items.2.description')}
              </p>
            </blockquote>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl" />
              <img 
                className="relative rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md lg:rotate-2 hover:rotate-0 transition-transform duration-500" 
                src="/src/assets/testCV.jpg" 
                alt="CV Professionale Example" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
