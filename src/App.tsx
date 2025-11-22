import React, { useState, useEffect, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Sparkles, Heart, BookOpen, FileText, CheckCircle, Activity } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme, useMedicalEmojis } from './contexts/ThemeContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ModernNavbar } from './components/ModernNavbar'
import { ParticleBackground, FloatingMedicalIcons } from './components/ParticleBackground'
import { CelebrationEffect } from './components/Confetti'
import { CustomCursor, useCustomCursor } from './components/CustomCursor'
import { StudyLevelSelector } from './components/StudyLevelSelector'
import { EnhancedDrMimiAvatar, FloatingDrMimi } from './components/EnhancedDrMimiAvatar'
import { SimpleMimiButton } from './components/SimpleMimiButton'
import { FeaturedAvatarCarousel } from './components/AvatarCarousel'
import { InteractiveMimi } from './components/MimiAnimated'
import { useBackendWarming } from './hooks/useBackendWarming'
import { LoadingSpinner } from './components/LoadingSpinner'
import { SEO } from './components/SEO'

// Lazy loaded pages
const EnhancedQuizPage = React.lazy(() => import('./pages/EnhancedQuizPage'));
const MedicalLibraryPage = React.lazy(() => import('./pages/MedicalLibraryPage'));
const MimiLibrary = React.lazy(() => import('./pages/MimiLibrary'));
const ChatbotPage = React.lazy(() => import('./pages/ChatbotPage'));
const AdminDashboardOptimized = React.lazy(() => import('./pages/AdminDashboardOptimized'));
const AdminArticles = React.lazy(() => import('./pages/AdminArticles'));
const AdminLayout = React.lazy(() => import('./pages/Admin/AdminLayout'));
const AdminUsers = React.lazy(() => import('./pages/Admin/AdminUsers'));
const AdminSettings = React.lazy(() => import('./pages/Admin/AdminSettings'));
const AdminLogin = React.lazy(() => import('./pages/Admin/AdminLogin'));
const AdminCMS = React.lazy(() => import('./pages/Admin/AdminCMS'));
const OwnerLogin = React.lazy(() => import('./pages/OwnerLogin'));
const OwnerDashboard = React.lazy(() => import('./pages/OwnerDashboard'));
const OwnerChangePassword = React.lazy(() => import('./pages/OwnerChangePassword'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const SummariesPage = React.lazy(() => import('./pages/SummariesPage'));
const ModulesPage = React.lazy(() => import('./pages/ModulesPage'));
const CasesPage = React.lazy(() => import('./pages/CasesPage'));
const NewsPage = React.lazy(() => import('./pages/NewsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
// import AboutMimi from './pages/AboutMimi'
const AboutMimiDonation = React.lazy(() => import('./pages/AboutMimiDonation'));
const PaymentDZD = React.lazy(() => import('./pages/PaymentDZD'));
const AITutor = React.lazy(() => import('./components/AITutor'));
const StudentAnalyticsDashboard = React.lazy(() => import('./pages/StudentAnalyticsDashboard'));
const AdminAnalyticsDashboard = React.lazy(() => import('./pages/AdminAnalyticsDashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Import XXL Components - Lazy Load
const AdminDashboardAdvanced = React.lazy(() => import('./components/dashboard/AdminDashboardAdvanced').then(module => ({ default: module.AdminDashboardAdvanced })));
const VirtualLab3DWrapper = React.lazy(() => import('./components/VirtualLab3DWrapper').then(module => ({ default: module.VirtualLab3DWrapper })));
const CollaborativePlatform = React.lazy(() => import('./components/CollaborativePlatform').then(module => ({ default: module.CollaborativePlatform })));
const EducationalMarketplace = React.lazy(() => import('./components/marketplace/EducationalMarketplace').then(module => ({ default: module.EducationalMarketplace })));
const AdvancedGamification = React.lazy(() => import('./components/gamification/AdvancedGamification').then(module => ({ default: module.AdvancedGamification })));
const FeaturesXXLPage = React.lazy(() => import('./pages/FeaturesXXLPage'));
const ErrorBoundary = React.lazy(() => import('./components/ErrorBoundary').then(module => ({ default: module.ErrorBoundary })));

// Create query client for API calls
const queryClient = new QueryClient();

// Main app component for MediMimi XXL
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <AppContent />
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// App content with all XXL enhancements
function AppContent() {
  // Initialize backend warming to prevent 503 errors
  useBackendWarming();

  // const { isFeminine } = useTheme();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const showCustomCursor = useCustomCursor();
  const [studyLevel, setStudyLevel] = useState<string>('');
  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  // const { scrollY } = useScroll();

  // Parallax transforms
  // const parallaxY = useTransform(scrollY, [0, 1000], [0, -200]);
  // const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);


  // Show celebration on level selection
  const handleLevelSelect = (level: string) => {
    setStudyLevel(level);
    setShowLevelSelector(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  // Easter egg detector
  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newCode = [...konamiCode, e.key].slice(-10);
      setKonamiCode(newCode);

      if (newCode.join('') === konamiSequence.join('')) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        alert('🎉 Bravo! Tu as trouvé l\'Easter Egg Dr.MiMi! 💕');
        setKonamiCode([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiCode]);

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
      dir={isRTL ? 'rtl' : 'ltr'}>

      <SEO />

      {/* Custom Cursor */}
      {showCustomCursor && <CustomCursor />}

      {/* Background Effects */}
      <ParticleBackground />
      <FloatingMedicalIcons />

      {/* Celebration Effects */}
      <CelebrationEffect trigger={showConfetti} />

      {/* Advanced Dr.Mimi AI Chatbot - Bouton simple toujours visible */}
      <SimpleMimiButton />

      {/* Modern Navbar */}
      <ModernNavbar />

      {/* Main Content - no padding needed with sticky header */}
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            {/* Allow admin/owner/auth/quiz/analytics/XXL routes to bypass level selector */}
            {location.pathname.startsWith('/admin') ||
              location.pathname.startsWith('/owner') ||
              location.pathname.startsWith('/login') ||
              location.pathname.startsWith('/register') ||
              location.pathname.startsWith('/quiz') ||
              location.pathname.startsWith('/analytics') ||
              location.pathname.startsWith('/features-xxl') ||
              location.pathname.startsWith('/lab-3d') ||
              location.pathname.startsWith('/collaboration') ||
              location.pathname.startsWith('/marketplace') ||
              location.pathname.startsWith('/gamification') ? (
              <Routes location={location} key={location.pathname}>
                {/* User Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Analytics Routes */}
                <Route path="/analytics" element={<StudentAnalyticsDashboard />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardOptimized />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="articles/new" element={<AdminArticles />} />
                  <Route path="articles/:id/edit" element={<AdminArticles />} />
                  <Route path="cms" element={<AdminCMS />} />
                  <Route path="analytics" element={<AdminAnalyticsDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Owner Routes */}
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/owner/login" element={<OwnerLogin />} />
                <Route path="/owner/change-password" element={<OwnerChangePassword />} />
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />

                {/* Quiz and Games Routes */}
                <Route path="/quiz" element={<EnhancedQuizPage />} />
                {/* Games Routes - redirect to quiz with games tab */}

                {/* Routes XXL */}
                <Route path="/features-xxl" element={<ErrorBoundary componentName="Features XXL"><FeaturesXXLPage /></ErrorBoundary>} />
                <Route path="/admin/dashboard-xxl" element={<ErrorBoundary componentName="Tableau de Bord Avancé"><AdminDashboardAdvanced /></ErrorBoundary>} />
                <Route path="/lab-3d" element={<VirtualLab3DWrapper />} />
                <Route path="/collaboration" element={<ErrorBoundary componentName="Plateforme Collaborative"><CollaborativePlatform /></ErrorBoundary>} />
                <Route path="/marketplace" element={<ErrorBoundary componentName="Marketplace"><EducationalMarketplace /></ErrorBoundary>} />
                <Route path="/gamification" element={<ErrorBoundary componentName="Gamification"><AdvancedGamification /></ErrorBoundary>} />

                {/* 404 - Must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            ) : showLevelSelector ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen flex items-center justify-center"
              >
                <StudyLevelSelector onLevelSelect={handleLevelSelect} />
              </motion.div>
            ) : (
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<EnhancedHomePage studyLevel={studyLevel} />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/summaries" element={<SummariesPage />} />
                <Route path="/modules" element={<ModulesPage />} />
                <Route path="/quiz" element={<EnhancedQuizPage />} />
                <Route path="/library" element={<MedicalLibraryPage />} />
                <Route path="/mimi-library" element={<MimiLibrary />} />
                <Route path="/cases" element={<CasesPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/a-propos-de-mimi" element={<AboutMimiDonation />} />
                <Route path="/payment-dzd" element={<PaymentDZD />} />
                <Route path="/ai-tutor" element={<AITutor />} />
                <Route path="/analytics" element={<StudentAnalyticsDashboard />} />

                {/* Routes XXL */}
                <Route path="/features-xxl" element={<ErrorBoundary componentName="Features XXL"><FeaturesXXLPage /></ErrorBoundary>} />
                <Route path="/admin/dashboard-xxl" element={<ErrorBoundary componentName="Tableau de Bord Avancé"><AdminDashboardAdvanced /></ErrorBoundary>} />
                <Route path="/lab-3d" element={<VirtualLab3DWrapper />} />
                <Route path="/collaboration" element={<ErrorBoundary componentName="Plateforme Collaborative"><CollaborativePlatform /></ErrorBoundary>} />
                <Route path="/marketplace" element={<ErrorBoundary componentName="Marketplace"><EducationalMarketplace /></ErrorBoundary>} />
                <Route path="/gamification" element={<ErrorBoundary componentName="Gamification"><AdvancedGamification /></ErrorBoundary>} />

                {/* Aliases et routes manquantes */}
                <Route path="/premium" element={<FeaturesXXLPage />} />
                <Route path="/a-propos" element={<AboutMimiDonation />} />
                <Route path="/actualites" element={<NewsPage />} />

                {/* 404 - Must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  )
}

// Enhanced Home page with XXL features
const EnhancedHomePage: React.FC<{ studyLevel: string }> = ({ studyLevel }) => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t } = useLanguage();
  const { scrollY } = useScroll();

  const heroScale = useTransform(scrollY, [0, 300], [1, 1.2]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section with Parallax Background */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Hero Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            scale: heroScale,
            opacity: heroOpacity
          }}
        >
          <img
            src="/images/heroes/medical-hero.png"
            alt="Medical Hero Background"
            className="absolute inset-0 w-full h-full object-cover parallax"
            style={{
              filter: 'brightness(0.7)'
            }}
            // @ts-ignore
            fetchpriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Floating Dr.Mimi */}
            <motion.div
              className="mb-8"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <EnhancedDrMimiAvatar
                size="xl"
                mood="happy"
                showName={true}
                showMessage={true}
                animated={true}
              />
            </motion.div>

            <motion.h1
              className="text-7xl font-magic mb-6 rainbow-text text-glow"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            >
              {t('home.title')} {isFeminine && '💕'}
            </motion.h1>

            <motion.p
              className="text-2xl mb-10 font-fun text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {studyLevel && `Spécialement adapté pour ${studyLevel} ✨`}
            </motion.p>

            <motion.div
              className="flex gap-6 justify-center flex-wrap"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/courses">
                <motion.button
                  className="px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl glow-hover neu"
                  style={{
                    background: 'var(--gradient-magic)',
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring" }}
                >
                  <span className="flex items-center space-x-2">
                    <Sparkles size={24} />
                    <span>{t('home.start')}</span>
                  </span>
                </motion.button>
              </Link>

              <Link to="/features-xxl">
                <motion.button
                  className="px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl glow-hover"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring" }}
                >
                  <span className="flex items-center space-x-2">
                    <Sparkles size={24} />
                    <span>Découvrir autres fonctionnalités !</span>
                  </span>
                </motion.button>
              </Link>

              <Link to="/chatbot">
                <motion.button
                  className="px-10 py-5 text-lg font-bold rounded-2xl glass glow-hover"
                  style={{
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.5)'
                  }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center space-x-2">
                    <Heart size={24} />
                    <span>{t('home.chat')}</span>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Animated scroll indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-white text-4xl opacity-50">↓</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with 3D Cards */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen size={40} />}
            title={t('feature.structured_courses')}
            description="Cours organisés par modules et années d'études"
            delay={0}
          />
          <FeatureCard
            icon={<FileText size={40} />}
            title={t('feature.visual_summaries')}
            description="Résumés imprimables avec schémas clairs"
            delay={0.1}
          />
          <FeatureCard
            icon={<CheckCircle size={40} />}
            title={t('feature.explained_mcqs')}
            description="Questions variées avec corrections détaillées"
            delay={0.2}
          />
          <FeatureCard
            icon={<Activity size={40} />}
            title={t('feature.clinical_cases')}
            description="Cas interactifs pour la pratique clinique"
            delay={0.3}
          />
        </div>
      </section>

      {/* Avatar Carousel Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl font-magic text-center mb-12"
            style={{
              background: 'var(--gradient-magic)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Découvrez Dr. Mimi sous toutes ses facettes ✨
          </motion.h2>

          <FeaturedAvatarCarousel className="mb-12" dailyRotation={true} />

          {/* Interactive Animated Mimi */}
          <div className="flex justify-center mt-12">
            <InteractiveMimi className="cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Popular Modules with floating animations */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'url(/images/anatomy/brain-diagram.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)'
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2
            className="text-5xl font-magic text-center mb-12"
            style={{
              background: 'var(--gradient-magic)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Modules populaires pour {studyLevel || 'tous les niveaux'}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ModuleCard emoji={emojis.heart} title="Cardiologie" count="24 cours" level={studyLevel} />
            <ModuleCard emoji={emojis.brain} title="Neurologie" count="18 cours" level={studyLevel} />
            <ModuleCard emoji={emojis.stethoscope} title="Pneumologie" count="15 cours" level={studyLevel} />
            <ModuleCard emoji={emojis.microscope} title="Anatomie pathologique" count="21 cours" level={studyLevel} />
            <ModuleCard emoji={emojis.syringe} title="Pharmacologie" count="32 cours" level={studyLevel} />
            <ModuleCard emoji={emojis.dna} title="Génétique" count="12 cours" level={studyLevel} />
          </div>
        </div>
      </section>

      {/* Floating Dr.Mimi Helper */}
      <FloatingDrMimi position="right" mood="encouraging" />
    </motion.div>
  )
}

// Enhanced Feature card with glassmorphism and 3D hover
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}> = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      className="glass p-8 rounded-2xl shadow-xl card-3d glow-hover"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        y: -10,
        scale: 1.05,
        rotateY: 10,
        rotateX: 5
      }}
    >
      <motion.div
        className="mb-6"
        style={{
          color: 'var(--color-primary)',
          filter: 'drop-shadow(0 4px 8px rgba(255, 105, 180, 0.3))'
        }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold mb-3 font-fun"
        style={{
          background: 'var(--gradient-magic)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-textSecondary)' }}>
        {description}
      </p>

      {/* Floating sparkles on hover */}
      <motion.div
        className="absolute top-2 right-2"
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Sparkles size={20} className="text-yellow-400 float-animation" />
      </motion.div>
    </motion.div>
  )
}

// Enhanced Module card with level-based styling
const ModuleCard: React.FC<{
  emoji: string;
  title: string;
  count: string;
  level?: string;
}> = ({ emoji, title, count, level }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="glass p-8 rounded-2xl shadow-xl cursor-pointer card-3d"
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(255, 182, 193, 0.2), rgba(255, 105, 180, 0.2))'
          : 'rgba(255, 255, 255, 0.1)'
      }}
      whileHover={{ y: -15, scale: 1.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="text-5xl mb-4"
        animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {emoji}
      </motion.div>
      <h3 className="text-xl font-bold mb-2 font-fun" style={{ color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
        {count}
      </p>
      {level && (
        <motion.span
          className="text-xs px-3 py-1 rounded-full badge-animated"
          style={{
            background: 'var(--gradient-magic)',
            color: 'white'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {level}
        </motion.span>
      )}

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: 'var(--gradient-magic)' }}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.random() * 50 + 50}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default App