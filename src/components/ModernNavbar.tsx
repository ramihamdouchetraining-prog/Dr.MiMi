import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  FileText,
  Layers,
  CheckCircle,
  Library,
  BookMarked,
  Activity,
  Newspaper,
  User,
  Heart,
  Star,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { usePointerType } from '../hooks/usePointerType';

interface NavItem {
  icon: any;
  label: string;
  href: string;
  highlight?: boolean;
  color?: string;
}

export const ModernNavbar: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const location = useLocation();
  const hasFinePointer = usePointerType();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll for navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems: NavItem[] = [
    { icon: Home, label: t('nav.home'), href: '/', color: 'from-pink-500 to-rose-500' },
    { icon: BookOpen, label: t('nav.courses'), href: '/courses', color: 'from-purple-500 to-indigo-500' },
    { icon: FileText, label: t('nav.summaries'), href: '/summaries', color: 'from-blue-500 to-cyan-500' },
    { icon: Layers, label: t('nav.modules'), href: '/modules', color: 'from-teal-500 to-emerald-500' },
    { icon: CheckCircle, label: t('nav.quiz'), href: '/quiz', color: 'from-green-500 to-lime-500' },
    { icon: Library, label: t('nav.library'), href: '/library', color: 'from-yellow-500 to-orange-500' },
    { icon: BookMarked, label: t('nav.mimiLibrary'), href: '/mimi-library', color: 'from-orange-500 to-red-500' },
    { icon: Activity, label: t('nav.cases'), href: '/cases', color: 'from-red-500 to-pink-500' },
    { icon: Newspaper, label: t('nav.news'), href: '/news', color: 'from-violet-500 to-purple-500' },
  ];

  const specialItems: NavItem[] = [
    { icon: User, label: t('nav.profile'), href: '/profile', color: 'from-indigo-500 to-blue-500' },
    { icon: Sparkles, label: 'XXL', href: '/features-xxl', highlight: true, color: 'from-purple-500 to-pink-500' },
    { icon: Heart, label: t('nav.about'), href: '/a-propos-de-mimi', highlight: true, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <>
      {/* Magical Horizontal Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl border-b-2 border-pink-300/50 dark:border-pink-700/50'
            : 'bg-gradient-to-r from-pink-50/90 via-purple-50/90 to-blue-50/90 dark:from-gray-900/90 dark:via-purple-900/50 dark:to-blue-900/50 backdrop-blur-xl shadow-xl'
        }`}
      >
        {/* Magical Particles - Only on fine pointer devices (mouse) */}
        {hasFinePointer && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                style={{
                  left: `${(i * 12.5)}%`,
                  top: '50%',
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-full mx-auto px-2 sm:px-4">
          <div className={`flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Logo - Always LTR */}
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-2 group hover:scale-105 transition-transform duration-300 flex-shrink-0"
              dir="ltr"
            >
              <motion.div
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img
                  src="/images/avatars/smiling.png"
                  alt="Dr.MiMi"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg ring-2 ring-pink-300 dark:ring-pink-600 object-cover"
                />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              <div className="hidden sm:block">
                <div className="flex items-center">
                  {['D', 'r', '.', 'M', 'i', 'M', 'i'].map((letter, index) => (
                    <motion.span
                      key={index}
                      className="text-base sm:text-xl font-serif italic font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 8px rgba(244, 114, 182, 0.3))',
                      }}
                      animate={{
                        y: [0, -2, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.1,
                        ease: "easeInOut"
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Desktop Horizontal Navigation - Only for fine pointer (mouse) devices */}
            {hasFinePointer && (
              <div className={`hidden lg:flex flex-1 items-center gap-1 justify-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                {navItems.map((item) => (
                  <MagicalNavButton
                    key={item.href}
                    item={item}
                    isHovered={hoveredItem === item.href}
                    onHover={() => setHoveredItem(item.href)}
                    onLeave={() => setHoveredItem(null)}
                  />
                ))}
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Special Items - Fine pointer devices only */}
              {hasFinePointer && (
                <div className="hidden lg:flex items-center gap-1">
                  {specialItems.map((item) => (
                    <MagicalNavButton
                      key={item.href}
                      item={item}
                      isHovered={hoveredItem === item.href}
                      onHover={() => setHoveredItem(item.href)}
                      onLeave={() => setHoveredItem(null)}
                    />
                  ))}
                </div>
              )}

              {/* Theme & Language */}
              <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50">
                <ThemeToggle />
                <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600" />
                <LanguageSelector />
              </div>

              {/* Mobile Menu Button - Show on coarse pointer OR small screens */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`${hasFinePointer ? 'lg:hidden' : 'block'} p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all`}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Magical Bottom Border Animation */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scaleX: [0.95, 1, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${hasFinePointer ? 'lg:hidden' : 'block'}`}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: isRTL ? 400 : -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRTL ? 400 : -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-16 ${
                isRTL ? 'right-0' : 'left-0'
              } bottom-0 w-80 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 backdrop-blur-xl shadow-2xl z-40 overflow-y-auto ${hasFinePointer ? 'lg:hidden' : 'block'} ${
                isRTL ? 'border-l-4' : 'border-r-4'
              } border-pink-300 dark:border-pink-700`}
            >
              <div className="p-6 space-y-6">
                {/* Dr. MiMi Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-400/20 to-purple-400/20 border-2 border-pink-300/30 dark:border-pink-600/30"
                >
                  <img
                    src="/images/avatars/greeting.png"
                    alt="Dr. MiMi"
                    className="w-16 h-16 rounded-full shadow-xl ring-4 ring-white/50"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {language === 'en'
                        ? 'Welcome!'
                        : language === 'ar'
                        ? 'مرحباً!'
                        : 'Bienvenue!'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">
                      Dr. MiMi 💕
                    </p>
                  </div>
                </motion.div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                    {language === 'en' ? 'Navigation' : language === 'ar' ? 'التنقل' : 'Navigation'}
                  </h4>
                  {navItems.map((item, index) => (
                    <MobileNavItem key={item.href} item={item} index={index} />
                  ))}
                </div>

                {/* Special Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                    {language === 'en' ? 'More' : language === 'ar' ? 'المزيد' : 'Plus'}
                  </h4>
                  {specialItems.map((item, index) => (
                    <MobileNavItem key={item.href} item={item} index={index + navItems.length} />
                  ))}
                </div>

                {/* Sparkle Decoration */}
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Made with 💕
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

// Magical Nav Button with Hover Effects - Desktop Only
const MagicalNavButton: React.FC<{
  item: NavItem;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}> = ({ item, isHovered, onHover, onLeave }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const Icon = item.icon;

  return (
    <Link to={item.href} onMouseEnter={onHover} onMouseLeave={onLeave}>
      <motion.div
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
          isActive
            ? `bg-gradient-to-r ${item.color || 'from-pink-500 to-purple-600'} text-white shadow-lg`
            : item.highlight
            ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
        }`}
        whileHover={{ 
          scale: 1.05,
          y: -2,
        }}
        whileTap={{ scale: 0.95 }}
        animate={isActive ? {
          boxShadow: [
            '0 0 20px rgba(244, 114, 182, 0.4)',
            '0 0 40px rgba(192, 132, 252, 0.6)',
            '0 0 20px rgba(244, 114, 182, 0.4)',
          ]
        } : {}}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity },
          scale: { type: 'spring', damping: 15 }
        }}
      >
        {/* Icon */}
        <motion.div
          animate={isActive || isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'animate-pulse' : ''}`} />
        </motion.div>

        {/* Label - Always visible */}
        <span className="text-sm whitespace-nowrap">
          {item.label}
        </span>

        {/* Active Indicator */}
        {isActive && (
          <>
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl border-2 border-white/30"
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            </motion.div>
          </>
        )}

        {/* Magical Particles on Hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                className="absolute -top-2 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-2 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

// Mobile Nav Item
const MobileNavItem: React.FC<{ item: NavItem; index: number }> = ({ item, index }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const Icon = item.icon;
  const { isRTL } = useLanguage();

  return (
    <Link to={item.href}>
      <motion.div
        initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
          isActive
            ? `bg-gradient-to-r ${item.color || 'from-pink-500 to-purple-600'} text-white shadow-lg scale-105`
            : item.highlight
            ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-white hover:shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            isActive || item.highlight
              ? 'bg-white/20'
              : 'bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="flex-1">{item.label}</span>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-white"
          />
        )}
      </motion.div>
    </Link>
  );
};

export default ModernNavbar;
