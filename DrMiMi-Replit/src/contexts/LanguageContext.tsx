// Language context updated to use i18next
import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export type Language = 'fr' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t: i18nTranslate, i18n: i18nInstance } = useTranslation();
  const language = (i18nInstance.language || 'fr') as Language;
  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    i18nInstance.changeLanguage(lang);
  };

  // Wrapper for t function to provide backward compatibility
  const t = (key: string, options?: any): string => {
    return i18nTranslate(key, options);
  };

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Save to localStorage
    localStorage.setItem('dr-mimi-language', language);
    
    // Fix cursor visibility issue - ensure cursor is always visible
    // Remove any conditional cursor:none that might have been applied
    const bodyStyle = document.body.style;
    if (bodyStyle.cursor === 'none' && !document.querySelector('.custom-cursor-active')) {
      bodyStyle.cursor = 'auto';
    }
    
    // Remove any conditional pointer-events:none
    const elements = document.querySelectorAll('[style*="pointer-events: none"]');
    elements.forEach((el) => {
      if (el instanceof HTMLElement && !el.classList.contains('pointer-events-none')) {
        el.style.pointerEvents = '';
      }
    });
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};