// Theme Context for MediMimi - Support for light/dark and feminine themes
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'classique-clair' | 'sombre-pro' | 'emeraude' | 'rose-sante' | 'sepia-lecture' | 'nuit-profonde' | 'jardin-rose' | 'ocean-medical' | 'sunset-wellness' | 'ramadan-lunar';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isFeminine: boolean;
  isMagical: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme configurations - 6 thèmes personnalisés pour Dr.MiMi
const themes = {
  'classique-clair': {
    name: 'Classique Clair',
    primary: '#FFB6C1', // Rose pastel
    secondary: '#FF69B4', // Rose intense
    accent: '#F59E0B',
    neutral: '#333333',
    background: '#FFFFFF',
    surface: '#F9F9F9',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E2E8F0',
  },
  'sombre-pro': {
    name: 'Sombre Pro',
    primary: '#FFB6C1', // Rose pastel
    secondary: '#FF69B4',
    accent: '#F59E0B',
    neutral: '#E0E0E0',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    border: '#3A3A3A',
  },
  'emeraude': {
    name: 'Émeraude',
    primary: '#10B981', // Vert émeraude
    secondary: '#059669',
    accent: '#34D399',
    neutral: '#064E3B',
    background: '#F0FDF4',
    surface: '#D1FAE5',
    text: '#064E3B',
    textSecondary: '#047857',
    border: '#A7F3D0',
  },
  'rose-sante': {
    name: 'Rose Santé',
    primary: '#EC4899', // Rose vif
    secondary: '#DB2777',
    accent: '#F472B6',
    neutral: '#831843',
    background: '#FDF2F8',
    surface: '#FCE7F3',
    text: '#831843',
    textSecondary: '#9F1239',
    border: '#FBCFE8',
  },
  'sepia-lecture': {
    name: 'Sépia Lecture',
    primary: '#92400E', // Brun sépia
    secondary: '#78350F',
    accent: '#D97706',
    neutral: '#451A03',
    background: '#FEF3C7',
    surface: '#FDE68A',
    text: '#451A03',
    textSecondary: '#78350F',
    border: '#FCD34D',
  },
  'nuit-profonde': {
    name: 'Nuit Profonde',
    primary: '#60A5FA', // Bleu clair
    secondary: '#3B82F6',
    accent: '#93C5FD',
    neutral: '#F3F4F6',
    background: '#111827',
    surface: '#1F2937',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    border: '#374151',
  },
  'jardin-rose': {
    name: 'Jardin Rose',
    primary: '#F472B6', // Rose tendre
    secondary: '#EC4899', // Rose vif
    accent: '#FBBF24', // Or doux
    neutral: '#831843',
    background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FEE2E2 100%)', // Dégradé rose-pêche
    surface: '#FFFFFF',
    text: '#831843',
    textSecondary: '#BE185D',
    border: '#FBCFE8',
  },
  'ocean-medical': {
    name: 'Océan Médical',
    primary: '#0EA5E9', // Bleu océan
    secondary: '#0284C7', // Bleu profond
    accent: '#06B6D4', // Cyan
    neutral: '#075985',
    background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)', // Dégradé bleu océan
    surface: '#FFFFFF',
    text: '#075985',
    textSecondary: '#0369A1',
    border: '#7DD3FC',
  },
  'sunset-wellness': {
    name: 'Sunset Wellness',
    primary: '#FB923C', // Orange coucher de soleil
    secondary: '#F59E0B', // Ambre chaud
    accent: '#FBBF24', // Jaune doré
    neutral: '#92400E',
    background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 50%, #FCA5A5 100%)', // Dégradé sunset
    surface: '#FFFFFF',
    text: '#92400E',
    textSecondary: '#B45309',
    border: '#FED7AA',
  },
  'ramadan-lunar': {
    name: 'Ramadan Lunaire',
    primary: '#D4AF37', // Or islamique
    secondary: '#9333EA', // Violet profond
    accent: '#C084FC', // Violet clair
    neutral: '#1E1B4B', // Bleu nuit
    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C1D95 70%, #581C87 100%)', // Dégradé nuit étoilée
    surface: 'rgba(255, 255, 255, 0.05)', // Surface translucide
    text: '#F3F4F6', // Texte clair
    textSecondary: '#D4AF37', // Or pour texte secondaire
    border: '#7C3AED', // Bordure violette
  },
};

// Medical emojis and magical stickers for themes
const medicalEmojis = {
  feminine: {
    stethoscope: '🩺',
    heart: '💕', // Pink heart for feminine
    brain: '🧠',
    medicine: '💊',
    syringe: '💉',
    microscope: '🔬',
    dna: '🧬',
    bandage: '🩹',
    thermometer: '🌡️',
    pulse: '💗', // Beating heart for feminine
    sparkles: '✨',
    star: '⭐',
    magic: '🪄',
    butterfly: '🦋',
    flower: '🌸',
    crown: '👑',
    gem: '💎',
    rainbow: '🌈',
  },
  regular: {
    stethoscope: '🩺',
    heart: '❤️',
    brain: '🧠',
    medicine: '💊',
    syringe: '💉',
    microscope: '🔬',
    dna: '🧬',
    bandage: '🩹',
    thermometer: '🌡️',
    pulse: '📈',
    sparkles: '⚡',
    star: '⭐',
    magic: '🔬',
    butterfly: '🔄',
    flower: '🌿',
    crown: '🏆',
    gem: '💎',
    rainbow: '🌊',
  },
};

// Magical transition effects
export const magicalEffects = {
  confetti: ['🎉', '🎊', '✨', '🌟', '💫', '⭐'],
  hearts: ['💕', '💖', '💗', '💓', '💝', '💟'],
  medical: ['🩺', '💊', '🧬', '🔬', '🩹', '💉'],
  nature: ['🌸', '🦋', '🌿', '🌈', '🌺', '🍃'],
  magic: ['✨', '🪄', '💫', '🌟', '⭐', '🎭'],
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('classique-clair');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('medimimi-theme') as ThemeType;
    if (savedTheme && Object.keys(themes).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[theme];
    
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Add theme class to body for conditional styling
    document.body.className = `theme-${theme}`;
    
    // Save to localStorage
    localStorage.setItem('medimimi-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const themeOrder: ThemeType[] = ['classique-clair', 'sombre-pro', 'emeraude', 'rose-sante', 'sepia-lecture', 'nuit-profonde'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const isDark = theme === 'sombre-pro' || theme === 'nuit-profonde';
  const isFeminine = theme === 'rose-sante';
  const isMagical = theme === 'emeraude' || theme === 'rose-sante';

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isFeminine,
    isMagical,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to get medical emojis based on theme
export const useMedicalEmojis = () => {
  const { isFeminine } = useTheme();
  return isFeminine ? medicalEmojis.feminine : medicalEmojis.regular;
};

// Utility function to get theme-aware colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return themes[theme];
};