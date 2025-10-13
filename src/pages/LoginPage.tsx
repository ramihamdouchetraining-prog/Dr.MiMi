// Page de connexion utilisateur pour Dr.MiMi
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, Loader, AlertCircle, LogIn 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMedicalEmojis } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { getApiUrl } from '../config/api';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const emojis = useMedicalEmojis();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || (language === 'en' ? 'Invalid credentials' : language === 'ar' ? 'بيانات اعتماد غير صالحة' : 'Identifiants invalides'));
        setIsLoading(false);
        return;
      }

      // Connexion réussie - recharger les données utilisateur
      if (login) {
        await login(data.user);
      }

      // Rediriger vers le profil
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      setError(language === 'en' ? 'Server error. Please try again.' : language === 'ar' ? 'خطأ في الخادم. يرجى المحاولة مرة أخرى.' : 'Erreur serveur. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full mb-4"
               style={{ backgroundColor: 'var(--color-primary-light)' }}>
            <LogIn size={40} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {language === 'en' ? 'Welcome Back!' : language === 'ar' ? 'مرحبًا بعودتك!' : 'Bon Retour !'} {emojis.stethoscope}
          </h1>
          <p style={{ color: 'var(--color-textSecondary)' }}>
            {language === 'en' 
              ? 'Sign in to continue your medical journey'
              : language === 'ar'
              ? 'قم بتسجيل الدخول لمواصلة رحلتك الطبية'
              : 'Connectez-vous pour continuer votre parcours médical'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={20} style={{ color: '#EF4444' }} />
            <span style={{ color: '#991B1B' }}>{error}</span>
          </motion.div>
        )}

        {/* Social Login Buttons */}
        <div className="mb-6">
          <SocialLoginButtons mode="login" />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Or continue with email' : language === 'ar' ? 'أو تابع بالبريد الإلكتروني' : 'Ou continuez avec email'}
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'Email Address' : language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Adresse Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-textSecondary)' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                placeholder={language === 'en' ? 'your.email@example.com' : language === 'ar' ? 'your.email@example.com' : 'votre.email@example.com'}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'Password' : language === 'ar' ? 'كلمة المرور' : 'Mot de Passe'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-textSecondary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={20} style={{ color: 'var(--color-textSecondary)' }} />
                ) : (
                  <Eye size={20} style={{ color: 'var(--color-textSecondary)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                {language === 'en' ? 'Remember me' : language === 'ar' ? 'تذكرني' : 'Se souvenir de moi'}
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              {language === 'en' ? 'Forgot password?' : language === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            {isLoading ? (
              <>
                <Loader size={20} className="animate-spin" />
                {language === 'en' ? 'Signing In...' : language === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Connexion...'}
              </>
            ) : (
              <>
                <LogIn size={20} />
                {language === 'en' ? 'Sign In' : language === 'ar' ? 'تسجيل الدخول' : 'Se Connecter'}
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center">
            <p style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Don\'t have an account?' : language === 'ar' ? 'ليس لديك حساب؟' : 'Vous n\'avez pas de compte ?'}{' '}
              <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                {language === 'en' ? 'Sign Up' : language === 'ar' ? 'سجل' : 'S\'inscrire'}
              </Link>
            </p>
          </div>

          {/* Admin Link */}
          <div className="pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Admin access?' : language === 'ar' ? 'الوصول كمسؤول؟' : 'Accès admin ?'}{' '}
              <Link to="/admin/login" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                {language === 'en' ? 'Click here' : language === 'ar' ? 'انقر هنا' : 'Cliquez ici'}
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
