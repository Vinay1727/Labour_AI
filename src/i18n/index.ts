import en from './en.json';
import hi from './hi.json';
import hinglish from './hinglish.json';

export type Language = 'en' | 'hi' | 'hinglish';

const translations: Record<Language, any> = {
    en,
    hi,
    hinglish,
};

export type TranslationKey = keyof typeof en;

let currentLang: Language = 'en';

export const setI18nLanguage = (lang: Language) => {
    currentLang = lang;
};

export const t = (key: TranslationKey): string => {
    return translations[currentLang][key] || key;
};
