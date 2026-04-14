import UploadButton from "../components/UploadButton";
import cv from "../assets/testCV.jpg";
import { useTranslation } from "react-i18next";

const Welcome = () => {
  const { t } = useTranslation();

  return (
    <section id="home" className="scroll-mt-24 relative overflow-hidden bg-gray-50 dark:bg-gray-900 py-16 lg:py-24">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-gray-800/50 dark:via-gray-900 dark:to-gray-800/50 pointer-events-none" />

      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left mb-12 lg:mb-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-4 py-1.5 mb-6">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {t('welcome.badge')}
              </span>
            </div>

            {/* Heading */}
            <h1 className="heading-xl mb-6 dark:text-white">
              {t('welcome.title')}<span className="text-gradient-subtle">{t('welcome.highlight')}</span>,
              <br className="hidden sm:block" /> {t('welcome.subtitle')}
            </h1>

            {/* Description */}
            <p className="text-body max-w-2xl mx-auto lg:mx-0 mb-8 text-lg">
              {t('welcome.description')}
            </p>

            {/* CTA Buttons - Using new design system */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#price"
                className="btn-primary btn-lg"
              >
                {t('welcome.cta.primary')}
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>

              <UploadButton
                buttonClassName="btn-secondary btn-lg"
                buttonText={t('welcome.cta.secondary')}
              />
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('welcome.trustIndicators.setup')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('welcome.trustIndicators.noCard')}</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              {/* Decorative gradient behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

              <img
                src={cv}
                alt="CV Digitale Example"
                className="relative rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
