
"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cpc_preferred_language') as Language;
      const activeLang = (saved && (saved === 'en' || saved === 'si' || saved === 'ta')) ? saved : 'en';
      setLanguageState(activeLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = activeLang;
        document.documentElement.setAttribute('data-lang', activeLang);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('cpc_preferred_language', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
        document.documentElement.setAttribute('data-lang', newLang);
      }
    } catch {
      // Ignore
    }
  }, []);

  const t = useCallback((key: TranslationKey, replacements?: { [key: string]: string | number }) => {
    const currentDict = (translations[language] || translations.en) as Record<string, string>;
    let text = currentDict[key as string] || (translations.en as Record<string, string>)[key as string] || (key as string);
    if (replacements && typeof text === 'string') {
      Object.keys(replacements).forEach(rKey => {
        text = text.replace(`{${rKey}}`, String(replacements[rKey]));
      });
    }
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
