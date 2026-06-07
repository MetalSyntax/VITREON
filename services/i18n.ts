import { useState, useEffect, useCallback } from 'react';
import { en } from './locales/en';
import { es } from './locales/es';
import { pt } from './locales/pt';

export type Language = 'en' | 'es' | 'pt';

const translations = { en, es, pt } as const;

export type TranslationKeys = keyof typeof en;

export const useI18n = () => {
    const [lang, setLang] = useState<Language>(() => {
        const saved = localStorage.getItem('vitreon_lang');
        return (saved as Language) || 'en';
    });

    useEffect(() => {
        localStorage.setItem('vitreon_lang', lang);
    }, [lang]);

    const t = useCallback((key: TranslationKeys): string => {
        return translations[lang][key] || translations.en[key] || key;
    }, [lang]);

    const getCategoryName = useCallback((categoryId?: string, currentName?: string): string => {
        if (!categoryId) return currentName || '';
        const isDefault = Object.values(translations).some(loc => loc[categoryId as TranslationKeys] === currentName) || categoryId === currentName;
        return isDefault ? (translations[lang][categoryId as TranslationKeys] || translations.en[categoryId as TranslationKeys] || currentName || categoryId) : (currentName || categoryId);
    }, [lang]);

    return { t, lang, setLang, getCategoryName };
};
