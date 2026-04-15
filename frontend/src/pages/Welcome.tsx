import UploadButton from "../components/UploadButton";
import cv from "../assets/testCV.jpg";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const Welcome = () => {
  const { t } = useTranslation();
  const { lang = "it" } = useParams<{ lang?: string }>();

  const outcomes = t("welcome.outcomes", { returnObjects: true }) as string[] | string;
  const outcomeList = Array.isArray(outcomes) ? outcomes : [];

  return (
    <section id="home" className="scroll-mt-24 relative overflow-hidden bg-gray-50 py-16 dark:bg-gray-900 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950/40" />

      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="mb-12 text-center lg:col-span-7 lg:mb-0 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-4 py-1.5 shadow-sm dark:border-indigo-800/60 dark:bg-gray-900/80">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">{t("welcome.badge")}</span>
            </div>

            <h1 className="heading-xl mb-4 dark:text-white">
              <span className="block">{t("welcome.title")}</span>
              <span className="text-gradient-subtle">{t("welcome.highlight")}</span>
              <span className="block text-gray-900 dark:text-white">{t("welcome.subtitle")}</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:mx-0">
              {t("welcome.description")}
            </p>

            {outcomeList.length > 0 ? (
              <ul className="mx-auto mb-10 max-w-xl space-y-2 text-left text-sm text-gray-700 dark:text-gray-300 lg:mx-0">
                {outcomeList.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <UploadButton buttonClassName="btn-primary btn-lg w-full sm:w-auto" buttonText={t("welcome.cta.primary")} />
              <a
                href={`/${lang}#preview`}
                className="btn-secondary btn-lg inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {t("welcome.cta.secondary")}
              </a>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 lg:text-left">
              <a href={`/${lang}#price`} className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">
                {t("welcome.cta.pricing")}
              </a>
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 dark:text-gray-400 lg:justify-start">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t("welcome.trustIndicators.setup")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t("welcome.trustIndicators.noCard")}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 blur-2xl" />
              <img
                src={cv}
                alt={t("welcome.imageAlt")}
                className="relative w-full rounded-2xl border border-gray-200/80 shadow-xl dark:border-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
