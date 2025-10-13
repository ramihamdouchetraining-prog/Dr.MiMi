import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Import translation resources
import frTranslation from './locales/fr/translation.json';
import enTranslation from './locales/en/translation.json';
import arTranslation from './locales/ar/translation.json';

const resources = {
  fr: {
    translation: frTranslation
  },
  en: {
    translation: enTranslation
  },
  ar: {
    translation: arTranslation
  }
};

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('dr-mimi-language') || 'fr', // Default to French
    fallbackLng: 'fr', // Fallback to French
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'dr-mimi-language'
    },

    interpolation: {
      escapeValue: false // React already escapes values
    },

    react: {
      useSuspense: false
    }
  });

// Listen for language changes to update document direction and lang
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Store in localStorage
  localStorage.setItem('dr-mimi-language', lng);
  
  // Fix cursor visibility issue - ensure cursor is always visible
  document.body.style.cursor = 'auto';
  
  // Remove any pointer-events:none that might be applied conditionally
  const elements = document.querySelectorAll('[style*="pointer-events"]');
  elements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.pointerEvents = '';
    }
  });
});

export default i18n;