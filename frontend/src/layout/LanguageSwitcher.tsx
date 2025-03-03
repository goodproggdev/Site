import { useState } from 'react';
import { Dropdown } from 'flowbite-react';

// Definiamo un tipo per le lingue supportate
type Language = 'en' | 'it';

export default function LanguageSwitcher() {
  // Stato per memorizzare la lingua selezionata
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('it'); // Impostiamo l'italiano come default

  // Funzione per cambiare la lingua
  const changeLanguage = (language: Language) => {
    setSelectedLanguage(language); // Aggiorna lo stato con la lingua selezionata
    console.log(`Lingua cambiata in: ${language}`);
    // Qui puoi implementare la logica per cambiare la lingua (es. i18n, context, ecc.)
  };

  // Mappa per associare le lingue alle bandiere
  const languageFlags: Record<Language, string> = {
    en: '🇬🇧',
    it: '🇮🇹',
  };

  return (
    <div className="flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 ml-4">
      <Dropdown
        label={languageFlags[selectedLanguage]} // Mostra la bandiera della lingua selezionata
        inline
        arrowIcon={false}
        placement="bottom-end"
      >
        <Dropdown.Item onClick={() => changeLanguage("en")}>
          🇬🇧 English
        </Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage("it")}>
          🇮🇹 Italiano
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
}