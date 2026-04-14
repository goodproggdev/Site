import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CookieConsent: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl animate-slide-up">
            <div className="container mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        {t('components.cookieConsent.text')}{' '}
                        <a href="/privacy" className="text-indigo-600 hover:underline font-medium">{t('components.cookieConsent.privacyLink')}</a>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2"
                    >
                        {t('components.cookieConsent.reject')}
                    </button>
                    <button 
                        onClick={handleAccept}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                        {t('components.cookieConsent.accept')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
