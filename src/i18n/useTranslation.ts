import { useState, useEffect } from 'react';
import { getTranslation, setLanguage as setGlobalLang, Language, TranslationKey } from './index';
// In a real app, you might use a React Context or Event Emitter to trigger re-renders on lang change

export const useTranslation = () => {
    const [lang, setLang] = useState<Language>('en');

    const t = (key: TranslationKey) => {
        return getTranslation(key);
    };

    const changeLanguage = (newLang: Language) => {
        setGlobalLang(newLang);
        setLang(newLang);
    };

    return { t, changeLanguage, currentLanguage: lang };
};
