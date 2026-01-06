import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, setI18nLanguage, t, TranslationKey } from '../i18n';

interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => Promise<void>;
    t: (key: TranslationKey) => string;
    isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType>(null as any);

const STORAGE_KEY = '@app_language';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi' || savedLanguage === 'hinglish')) {
                    setLanguage(savedLanguage as Language);
                    setI18nLanguage(savedLanguage as Language);
                } else {
                    setI18nLanguage('en');
                }
            } catch (error) {
                console.error('Failed to load language', error);
                setI18nLanguage('en');
            } finally {
                setIsReady(true);
            }
        };

        loadLanguage();
    }, []);

    const changeLanguage = async (newLang: Language) => {
        setLanguage(newLang);
        setI18nLanguage(newLang);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, newLang);
        } catch (error) {
            console.error('Failed to save language', error);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, isReady }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
