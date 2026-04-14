import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import it from './locales/it.json';
import en from './locales/en.json';

const resources = {
  it: { translation: it },
  en: { translation: en },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    debug: import.meta.env.DEV,
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default i18n;

export type Language = 'it' | 'en';

export const supportedLanguages: Language[] = ['it', 'en'];

export const languageNames: Record<Language, string> = {
  it: 'Italiano',
  en: 'English',
};
