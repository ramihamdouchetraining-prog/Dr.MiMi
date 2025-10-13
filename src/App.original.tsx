import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Stethoscope, BookOpen, FileText, Layers, CheckCircle, Activity, Newspaper, User, Image } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme, useMedicalEmojis } from './contexts/ThemeContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ThemeToggle } from './components/ThemeToggle'
import { LanguageSelector } from './components/LanguageSelector'
import AdvancedQuizPage from './pages/AdvancedQuizPage'
import MedicalLibraryPage from './pages/MedicalLibraryPage'
import AdminDashboard from './pages/AdminDashboard'
import CoursesPage from './pages/CoursesPage'
import SummariesPage from './pages/SummariesPage'
import ModulesPage from './pages/ModulesPage'
import CasesPage from './pages/CasesPage'
import NewsPage from './pages/NewsPage'
import ProfilePage from './pages/ProfilePage'

// Create query client for API calls
const queryClient = new QueryClient();

// Main app component for MediMimi
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// App content with theme context
function AppContent() {
  const { isFeminine } = useTheme();
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.header 
        className="shadow-sm border-b backdrop-blur-sm transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src="/attached_assets/generated_images/Dr._Mimi_medical_logo_6b7ade86.png"
                alt="Dr. Mimi Logo"
                className="w-12 h-12 rounded-full shadow-lg border-2 border-primary/20"
              />
              <motion.h1 
                className="text-xl font-display font-bold mt-1" 
                style={{ 
                  background: 'linear-gradient(135deg, #FF69B4, #FFB6C1, #DDA0DD, #F0E68C)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(255, 182, 193, 0.3))'
                }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Dr.MiMi {isFeminine && '💕'}
              </motion.h1>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <NavItem icon={Stethoscope} label={t('nav.home')} href="/" />
              <NavItem icon={BookOpen} label={t('nav.courses')} href="/courses" />
              <NavItem icon={FileText} label={t('nav.summaries')} href="/summaries" />
              <NavItem icon={Layers} label={t('nav.modules')} href="/modules" />
              <NavItem icon={CheckCircle} label={t('nav.quiz')} href="/quiz" />
              <NavItem icon={Image} label={t('nav.library')} href="/library" />
              <NavItem icon={Activity} label={t('nav.cases')} href="/cases" />
              <NavItem icon={Newspaper} label={t('nav.news')} href="/news" />
              <NavItem icon={User} label={t('nav.profile')} href="/profile" />
              <LanguageSelector />
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/summaries" element={<SummariesPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/quiz" element={<AdvancedQuizPage />} />
            <Route path="/library" element={<MedicalLibraryPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

// Navigation item component
function NavItem({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link to={href}>
      <motion.div 
        className={`flex items-center space-x-1 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          isActive ? 'font-semibold' : ''
        }`}
        style={{ 
          color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
          backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon size={20} />
        <span className="text-sm">{label}</span>
      </motion.div>
    </Link>
  )
}

// Home page
const HomePage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <motion.h1 
            className="text-6xl font-display font-bold mb-6"
            style={{ color: 'var(--color-text)' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('home.title')}
            {isFeminine && ' 💕'}
          </motion.h1>
          
          <motion.p 
            className="text-xl mb-10"
            style={{ color: 'var(--color-textSecondary)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('home.subtitle')}
          </motion.p>
          
          <motion.div 
            className="flex gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/courses">
              <button className="px-8 py-4 bg-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1">
                {t('home.start')}
              </button>
            </Link>
            <button className="px-8 py-4 border-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
              {t('home.chat')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<BookOpen size={32} />}
            title={t('feature.structured_courses')}
            description="Cours organisés par modules et années d'études"
          />
          <FeatureCard 
            icon={<FileText size={32} />}
            title={t('feature.visual_summaries')}
            description="Résumés imprimables avec schémas clairs"
          />
          <FeatureCard 
            icon={<CheckCircle size={32} />}
            title={t('feature.explained_mcqs')}
            description="Questions variées avec corrections détaillées"
          />
          <FeatureCard 
            icon={<Activity size={32} />}
            title={t('feature.clinical_cases')}
            description="Cas interactifs pour la pratique clinique"
          />
        </div>
      </section>

      {/* Popular Modules */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--color-text)' }}>
            Modules populaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModuleCard emoji={emojis.heart} title="Cardiologie" count="24 cours" />
            <ModuleCard emoji={emojis.brain} title="Neurologie" count="18 cours" />
            <ModuleCard emoji={emojis.stethoscope} title="Pneumologie" count="15 cours" />
            <ModuleCard emoji={emojis.microscope} title="Anatomie pathologique" count="21 cours" />
            <ModuleCard emoji={emojis.syringe} title="Pharmacologie" count="32 cours" />
            <ModuleCard emoji={emojis.dna} title="Génétique" count="12 cours" />
          </div>
        </div>
      </section>
    </motion.div>
  )
}

// Feature card component
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <motion.div
      className="p-6 rounded-xl shadow-lg transition-all hover:shadow-xl"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4" style={{ color: 'var(--color-primary)' }}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-textSecondary)' }}>
        {description}
      </p>
    </motion.div>
  )
}

// Module card component
const ModuleCard: React.FC<{ emoji: string; title: string; count: string }> = ({ emoji, title, count }) => {
  return (
    <motion.div
      className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
      style={{ backgroundColor: 'var(--color-surface)' }}
      whileHover={{ y: -5 }}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {count}
      </p>
    </motion.div>
  )
}


export default App