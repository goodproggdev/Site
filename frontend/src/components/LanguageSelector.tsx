import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supportedLanguages, type Language, languageNames } from '../i18n';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = (lang || i18n.language || 'it') as Language;

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === currentLang) return;

    // Extract the path after the language prefix
    const pathParts = location.pathname.split('/');
    const currentLangIndex = pathParts[1];
    const isLangInPath = supportedLanguages.includes(currentLangIndex as Language);

    let newPath: string;
    if (isLangInPath) {
      // Replace language in path
      pathParts[1] = newLang;
      newPath = pathParts.join('/');
    } else {
      // Add language prefix
      newPath = `/${newLang}${location.pathname}`;
    }

    i18n.changeLanguage(newLang);
    navigate(newPath + location.search + location.hash);
  };

  return (
    <div className="relative">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        className="select-base py-2 pl-3 pr-8 text-sm min-w-[100px]"
        aria-label={t('settings.language.select')}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;