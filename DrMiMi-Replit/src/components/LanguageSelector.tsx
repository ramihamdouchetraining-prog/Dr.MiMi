// Language selector component for Dr.MiMi platform
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { Portal } from './Portal';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Floating UI configuration with RTL support
  const { refs, floatingStyles } = useFloating({
    placement: isRTL ? 'bottom-start' : 'bottom-end',
    strategy: 'fixed',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: setIsOpen
  });

  const languages = [
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];
  const currentLanguageIndex = languages.findIndex(l => l.code === language);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % languages.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + languages.length) % languages.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selectedLanguage = languages[focusIndex];
          if (selectedLanguage) {
            setLanguage(selectedLanguage.code);
            setIsOpen(false);
            buttonRef.current?.focus();
          }
          break;
        case 'Tab':
          if (e.shiftKey) {
            e.preventDefault();
            setFocusIndex((prev) => (prev - 1 + languages.length) % languages.length);
          } else {
            e.preventDefault();
            setFocusIndex((prev) => (prev + 1) % languages.length);
          }
          break;
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    // Close on route change
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isOpen, focusIndex, languages, setLanguage]);

  // Set focus index to current language when opening
  useEffect(() => {
    if (isOpen) {
      setFocusIndex(currentLanguageIndex >= 0 ? currentLanguageIndex : 0);
    }
  }, [isOpen, currentLanguageIndex]);

  // Persist language selection to localStorage
  useEffect(() => {
    localStorage.setItem('dr-mimi-language', language);
  }, [language]);

  return (
    <>
      <motion.button
        ref={(el) => {
          if (el) {
            (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
            refs.setReference(el);
          }
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          zIndex: 'var(--z-header)',
          '--tw-ring-color': 'var(--color-primary)',
        } as React.CSSProperties}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Langue actuelle: ${currentLanguage.name}. Cliquez pour changer`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-selector-dropdown"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <span className="text-sm hidden sm:inline">{currentLanguage.name}</span>
      </motion.button>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Click outside overlay */}
              <div 
                className="fixed inset-0" 
                style={{ zIndex: 'calc(var(--z-dropdown) - 1)' }}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />

              {/* Dropdown menu */}
              <motion.div
                ref={refs.setFloating}
                id="language-selector-dropdown"
                role="listbox"
                aria-label="Sélecteur de langue"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="w-48 rounded-xl shadow-2xl border backdrop-blur-lg"
                style={{
                  ...floatingStyles,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  zIndex: 'var(--z-dropdown)',
                  direction: isRTL ? 'rtl' : 'ltr',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" 
                       style={{ color: 'var(--color-textSecondary)' }}>
                    {language === 'fr' ? 'Choisir la langue' : 
                     language === 'en' ? 'Choose language' : 
                     'اختر اللغة'}
                  </div>
                  
                  {languages.map((lang, index) => (
                    <motion.button
                      key={lang.code}
                      role="option"
                      aria-selected={language === lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setFocusIndex(index)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${language === lang.code ? 'font-semibold shadow-sm' : ''}
                        ${focusIndex === index ? 'ring-2 ring-offset-1' : ''}
                      `}
                      style={{
                        backgroundColor: 
                          language === lang.code 
                            ? 'var(--color-primary-light)' 
                            : focusIndex === index 
                              ? 'var(--color-primary-light)' 
                              : 'transparent',
                        color: 
                          language === lang.code 
                            ? 'var(--color-primary)'
                            : 'var(--color-text)',
                        '--tw-ring-color': 'var(--color-primary)',
                        '--tw-ring-offset-color': 'var(--color-surface)',
                      } as React.CSSProperties}
                      whileHover={{ x: isRTL ? -2 : 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="flex-1 text-sm text-left">{lang.name}</span>
                      {language === lang.code && (
                        <motion.svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </motion.svg>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};