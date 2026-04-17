import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type Language } from '../i18n';
import { useHasSessionToken } from '../hooks/useHasSessionToken';
import { LINKEDIN_COMPANY_URL } from '../config/site';

const Footer = () => {
    const { t, i18n } = useTranslation();
    const { lang: pathLang } = useParams<{ lang?: string }>();
    const isLoggedIn = useHasSessionToken();

    const lang: Language =
        pathLang && supportedLanguages.includes(pathLang as Language)
            ? (pathLang as Language)
            : i18n.language?.startsWith('en')
              ? 'en'
              : 'it';

    const homeHref = `/${lang}`;

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <Link to={homeHref} className="flex items-center cursor-pointer">
                            <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white text-indigo-600">{t('layout.footer.brand')}</span>
                        </Link>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                            {t('marketing.home.subtitle')}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">{t('layout.footer.platform')}</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                {isLoggedIn ? (
                                    <>
                                        <li className="mb-4">
                                            <Link to={`/${lang}/dashboard`} className="hover:underline cursor-pointer">
                                                {t('layout.footer.links.dashboard')}
                                            </Link>
                                        </li>
                                        <li className="mb-4">
                                            <Link to={`/${lang}/dashboard#support`} className="hover:underline cursor-pointer">
                                                {t('layout.footer.links.support')}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/${lang}/pricing`} className="hover:underline cursor-pointer">
                                                {t('layout.footer.links.pricing')}
                                            </Link>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="mb-4">
                                            <Link to={homeHref} className="hover:underline cursor-pointer">{t('layout.footer.links.home')}</Link>
                                        </li>
                                        <li>
                                            <Link to={`/${lang}/pricing`} className="hover:underline cursor-pointer">
                                                {t('layout.footer.links.pricing')}
                                            </Link>
                                        </li>
                                        <li className="mt-4">
                                            <a href={`${homeHref}#contact`} className="hover:underline cursor-pointer">{t('layout.footer.links.contact')}</a>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">{t('layout.footer.legal')}</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <Link to={`/${lang}/privacy`} className="hover:underline cursor-pointer">{t('layout.footer.links.privacy')}</Link>
                                </li>
                                <li>
                                    <Link to={`/${lang}/terms`} className="hover:underline cursor-pointer">{t('layout.footer.links.terms')}</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                        © 2024{' '}
                        <a href="https://nordevit.it/" className="font-bold hover:underline">Nordevit™</a>
                        {'. '}{t('layout.footer.rightsReserved')}
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0">
                        <a
                            href={LINKEDIN_COMPANY_URL}
                            className="text-gray-500 hover:text-indigo-600 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:focus-visible:outline-indigo-300"
                            aria-label={t('layout.footer.linkedinAria')}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.025-3.041-1.852-3.041-1.854 0-2.138 1.45-2.138 2.944v5.701h-3v-11h2.88v1.503h.04c.401-.759 1.381-1.56 2.839-1.56 3.039 0 3.601 2.001 3.601 4.603v6.457z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
