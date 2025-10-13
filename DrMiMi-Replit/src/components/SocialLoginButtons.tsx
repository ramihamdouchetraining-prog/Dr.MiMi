// Social Login Buttons Component for Dr.MiMi
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ mode = 'login' }) => {
  const { language, isRTL } = useLanguage();

  const handleGoogleLogin = () => {
    // Rediriger vers l'endpoint OAuth de Replit (supporte Google, GitHub, X, Apple)
    window.location.href = '/api/login';
  };

  const handleFacebookLogin = () => {
    alert(
      language === 'en'
        ? 'Facebook login is coming soon! Please use email or Google for now.'
        : language === 'ar'
        ? 'تسجيل الدخول عبر Facebook قادم قريباً! يرجى استخدام البريد الإلكتروني أو Google في الوقت الحالي.'
        : 'Connexion Facebook bientôt disponible ! Utilisez l\'email ou Google pour le moment.'
    );
  };

  const handleOutlookLogin = () => {
    alert(
      language === 'en'
        ? 'Outlook login is coming soon! Please use email or Google for now.'
        : language === 'ar'
        ? 'تسجيل الدخول عبر Outlook قادم قريباً! يرجى استخدام البريد الإلكتروني أو Google في الوقت الحالي.'
        : 'Connexion Outlook bientôt disponible ! Utilisez l\'email ou Google pour le moment.'
    );
  };

  const buttonText = mode === 'login'
    ? {
        google: language === 'en' ? 'Sign in with Google' : language === 'ar' ? 'الدخول عبر Google' : 'Se connecter avec Google',
        facebook: language === 'en' ? 'Sign in with Facebook' : language === 'ar' ? 'الدخول عبر Facebook' : 'Se connecter avec Facebook',
        outlook: language === 'en' ? 'Sign in with Outlook' : language === 'ar' ? 'الدخول عبر Outlook' : 'Se connecter avec Outlook',
      }
    : {
        google: language === 'en' ? 'Sign up with Google' : language === 'ar' ? 'التسجيل عبر Google' : 'S\'inscrire avec Google',
        facebook: language === 'en' ? 'Sign up with Facebook' : language === 'ar' ? 'التسجيل عبر Facebook' : 'S\'inscrire avec Facebook',
        outlook: language === 'en' ? 'Sign up with Outlook' : language === 'ar' ? 'التسجيل عبر Outlook' : 'S\'inscrire avec Outlook',
      };

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Google Button (Active) */}
      <motion.button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 font-medium transition-all hover:shadow-lg"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: '#EA4335',
          color: 'var(--color-text)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#4285F4"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#34A853"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{buttonText.google}</span>
      </motion.button>

      {/* Facebook Button (Coming Soon) */}
      <motion.button
        type="button"
        onClick={handleFacebookLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 font-medium transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: '#1877F2',
          color: 'var(--color-text)',
          opacity: 0.7,
        }}
        whileHover={{ scale: 1.02, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>
          {buttonText.facebook}
          <span className="text-xs ml-2">
            ({language === 'en' ? 'Soon' : language === 'ar' ? 'قريباً' : 'Bientôt'})
          </span>
        </span>
      </motion.button>

      {/* Outlook Button (Coming Soon) */}
      <motion.button
        type="button"
        onClick={handleOutlookLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 font-medium transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: '#0078D4',
          color: 'var(--color-text)',
          opacity: 0.7,
        }}
        whileHover={{ scale: 1.02, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0078D4">
          <path d="M24 7.875v8.25A3.375 3.375 0 0 1 20.625 19.5h-6.75v-5.625h2.25V12h-2.25V9.75c0-.621.504-1.125 1.125-1.125H16.5V6.75h-1.5a2.625 2.625 0 0 0-2.625 2.625V12h-1.875v1.875h1.875v5.625H3.375A3.375 3.375 0 0 1 0 16.125V7.875A3.375 3.375 0 0 1 3.375 4.5h17.25A3.375 3.375 0 0 1 24 7.875z" />
        </svg>
        <span>
          {buttonText.outlook}
          <span className="text-xs ml-2">
            ({language === 'en' ? 'Soon' : language === 'ar' ? 'قريباً' : 'Bientôt'})
          </span>
        </span>
      </motion.button>
    </div>
  );
};

export default SocialLoginButtons;
