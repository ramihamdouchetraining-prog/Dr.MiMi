// Advanced Theme Toggle Component with magical themes
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Heart, Sparkles, Droplets, BookOpen, Flower, Waves, Sunset, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { useTheme, magicalEffects, ThemeType } from '../contexts/ThemeContext';
import { Portal } from './Portal';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isMagical } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  // Floating UI configuration
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
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

  const themes: Array<{ 
    key: ThemeType;
    icon: React.ElementType;
    label: string;
    color: string;
    emoji: string;
  }> = [
    { 
      key: 'classique-clair', 
      icon: Sun, 
      label: 'Classique Clair', 
      color: '#FFB6C1',
      emoji: '☀️'
    },
    { 
      key: 'sombre-pro', 
      icon: Moon, 
      label: 'Sombre Pro', 
      color: '#60A5FA',
      emoji: '🌙'
    },
    { 
      key: 'emeraude', 
      icon: Droplets, 
      label: 'Émeraude', 
      color: '#10B981',
      emoji: '💚'
    },
    { 
      key: 'rose-sante', 
      icon: Heart, 
      label: 'Rose Santé', 
      color: '#EC4899',
      emoji: '💕'
    },
    { 
      key: 'sepia-lecture', 
      icon: BookOpen, 
      label: 'Sépia Lecture', 
      color: '#92400E',
      emoji: '📚'
    },
    { 
      key: 'nuit-profonde', 
      icon: Sparkles, 
      label: 'Nuit Profonde', 
      color: '#3B82F6',
      emoji: '🌃'
    },
    { 
      key: 'jardin-rose', 
      icon: Flower, 
      label: 'Jardin Rose', 
      color: '#F472B6',
      emoji: '🌸'
    },
    { 
      key: 'ocean-medical', 
      icon: Waves, 
      label: 'Océan Médical', 
      color: '#0EA5E9',
      emoji: '🌊'
    },
    { 
      key: 'sunset-wellness', 
      icon: Sunset, 
      label: 'Sunset Wellness', 
      color: '#FB923C',
      emoji: '🌅'
    },
    { 
      key: 'ramadan-lunar', 
      icon: Star, 
      label: 'Ramadan Lunaire', 
      color: '#D4AF37',
      emoji: '🌙'
    },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[0];
  const currentThemeIndex = themes.findIndex(t => t.key === theme);

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
          setFocusIndex((prev) => (prev + 1) % themes.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + themes.length) % themes.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selectedTheme = themes[focusIndex];
          if (selectedTheme) {
            handleThemeChange(selectedTheme.key);
            setIsOpen(false);
            buttonRef.current?.focus();
          }
          break;
        case 'Tab':
          if (e.shiftKey) {
            e.preventDefault();
            setFocusIndex((prev) => (prev - 1 + themes.length) % themes.length);
          } else {
            e.preventDefault();
            setFocusIndex((prev) => (prev + 1) % themes.length);
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
  }, [isOpen, focusIndex, themes]);

  // Set focus index to current theme when opening
  useEffect(() => {
    if (isOpen) {
      setFocusIndex(currentThemeIndex >= 0 ? currentThemeIndex : 0);
    }
  }, [isOpen, currentThemeIndex]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    
    // Add magical effect when changing to magical themes
    if (['emeraude', 'rose-sante'].includes(newTheme)) {
      createMagicalEffect();
    }
  };

  const createMagicalEffect = () => {
    const effects = magicalEffects.magic;
    const container = document.body;
    
    for (let i = 0; i < 12; i++) {
      const effect = document.createElement('div');
      effect.textContent = effects[Math.floor(Math.random() * effects.length)];
      effect.style.position = 'fixed';
      effect.style.left = Math.random() * window.innerWidth + 'px';
      effect.style.top = Math.random() * window.innerHeight + 'px';
      effect.style.fontSize = '24px';
      effect.style.pointerEvents = 'none';
      effect.style.zIndex = 'var(--z-toast)';
      effect.style.animation = 'magicalFloat 3s ease-out forwards';
      
      container.appendChild(effect);
      
      setTimeout(() => {
        container.removeChild(effect);
      }, 3000);
    }
  };

  return (
    <>
      {/* Main toggle button */}
      <motion.button
        ref={(el) => {
          if (el) {
            (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
            refs.setReference(el);
          }
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: currentTheme.color,
          borderColor: currentTheme.color,
          zIndex: 'var(--z-header)',
          '--tw-ring-color': currentTheme.color,
        } as React.CSSProperties}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Thème actuel: ${currentTheme.label}. Cliquez pour changer`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="theme-selector-dropdown"
      >
        <span className="text-lg">{currentTheme.emoji}</span>
      </motion.button>

      {/* Theme selector dropdown with Portal */}
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
                id="theme-selector-dropdown"
                role="listbox"
                aria-label="Sélecteur de thème"
                className="min-w-48 rounded-xl shadow-2xl border backdrop-blur-lg"
                style={{ 
                  ...floatingStyles,
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 'var(--z-dropdown)'
                }}
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Choisir un thème {isMagical && '✨'}
                  </div>
                  
                  {themes.map(({ key, icon: Icon, label, color, emoji }, index) => (
                    <motion.button
                      key={key}
                      role="option"
                      aria-selected={theme === key}
                      onClick={() => {
                        handleThemeChange(key);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setFocusIndex(index)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${theme === key 
                          ? 'text-white shadow-md font-semibold' 
                          : 'hover:bg-opacity-10'
                        }
                        ${focusIndex === index ? 'ring-2 ring-offset-1' : ''}
                      `}
                      style={{
                        backgroundColor: theme === key ? color : focusIndex === index ? `${color}20` : 'transparent',
                        color: theme === key ? 'white' : 'var(--color-text)',
                        '--tw-ring-color': color,
                        '--tw-ring-offset-color': 'var(--color-surface)',
                      } as React.CSSProperties}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{emoji}</span>
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left text-sm">{label}</span>
                      {theme === key && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
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