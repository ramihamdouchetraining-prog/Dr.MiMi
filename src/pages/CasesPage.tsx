// XXL Clinical Cases Page for Dr.MiMi platform
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  Award,
  Play,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, ErrorState } from '../components/EmptyState';
import { apiFetch } from '../config/api';

interface ClinicalCase {
  id: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  presentation: string;
  presentationEn?: string;
  presentationAr?: string;
  history?: string;
  historyEn?: string;
  historyAr?: string;
  exam?: string;
  examEn?: string;
  examAr?: string;
  investigations?: string;
  investigationsEn?: string;
  investigationsAr?: string;
  management?: string;
  managementEn?: string;
  managementAr?: string;
  moduleId: string;
  difficulty: string;
  status: string;
  createdBy?: string;
  createdAt?: string;
}

const CasesPage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFetch('/api/cases');
        const data = await response.json();
        setCases(data);
      } catch (err: any) {
        console.error('Error fetching cases:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des cas cliniques');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Study levels
  const studyLevels = [
    { id: 'all', name: language === 'en' ? 'All Levels' : language === 'ar' ? 'جميع المستويات' : 'Tous Niveaux', emoji: '📚' },
    { id: 'Y3', name: t('level.Y3'), emoji: '🔬' },
    { id: 'Y4', name: t('level.Y4'), emoji: '🏥' },
    { id: 'Y5', name: t('level.Y5'), emoji: '👨‍⚕️' },
    { id: 'Y6', name: t('level.Y6'), emoji: '🎯' },
    { id: 'Intern', name: t('level.Intern'), emoji: '⚕️' },
  ];

  // Difficulties
  const difficulties = [
    { id: 'all', name: language === 'en' ? 'All' : language === 'ar' ? 'الكل' : 'Tous', color: 'var(--color-text)' },
    { id: 'Easy', name: language === 'en' ? 'Easy' : language === 'ar' ? 'سهل' : 'Facile', color: '#10B981' },
    { id: 'Medium', name: language === 'en' ? 'Medium' : language === 'ar' ? 'متوسط' : 'Moyen', color: '#F59E0B' },
    { id: 'Hard', name: language === 'en' ? 'Hard' : language === 'ar' ? 'صعب' : 'Difficile', color: '#EF4444' },
  ];

  // Medical modules
  const modules = [
    { id: 'all', name: language === 'en' ? 'All Specialties' : language === 'ar' ? 'جميع التخصصات' : 'Toutes Spécialités' },
    { id: 'cardiology', name: t('module.cardiology') },
    { id: 'neurology', name: t('module.neurology') },
    { id: 'pneumology', name: t('module.pneumology') },
    { id: 'gastroenterology', name: t('module.gastroenterology') },
    { id: 'endocrinology', name: t('module.endocrinology') },
    { id: 'nephrology', name: t('module.nephrology') },
  ];

  // Get case title based on language
  const getCaseTitle = (clinicalCase: ClinicalCase) => {
    if (language === 'ar') return clinicalCase.titleAr || clinicalCase.title;
    if (language === 'en') return clinicalCase.titleEn || clinicalCase.title;
    return clinicalCase.title;
  };

  // Get case description based on language
  const getCaseDescription = (clinicalCase: ClinicalCase) => {
    if (language === 'ar') return clinicalCase.descriptionAr || clinicalCase.description;
    if (language === 'en') return clinicalCase.descriptionEn || clinicalCase.description;
    return clinicalCase.description;
  };

  // Filter cases
  const filteredCases = useMemo(() => {
    let filtered = cases;

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    }

    if (selectedModule !== 'all') {
      filtered = filtered.filter(c => c.moduleId === selectedModule);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        (c.titleEn && c.titleEn.toLowerCase().includes(term)) ||
        (c.titleAr && c.titleAr.includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.presentation && c.presentation.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [cases, selectedDifficulty, selectedModule, searchTerm]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
        <ErrorState 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('nav.cases')} {emojis.stethoscope}
            {isFeminine && ' 💕'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            {language === 'en'
              ? 'Practice with real clinical scenarios and improve your diagnostic skills'
              : language === 'ar'
              ? 'تدرب على السيناريوهات السريرية الحقيقية وحسن مهاراتك التشخيصية'
              : 'Pratiquez avec des scénarios cliniques réels et améliorez vos compétences diagnostiques'}
          </p>
        </motion.div>

        {/* Study Level Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            <GraduationCap className="inline mr-2" size={20} />
            {language === 'en' ? 'Your Clinical Level' : language === 'ar' ? 'مستواك السريري' : 'Votre Niveau Clinique'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {studyLevels.map((level) => (
              <motion.button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedLevel === level.id ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: selectedLevel === level.id
                    ? 'var(--color-primary)'
                    : 'var(--color-surface)',
                  color: selectedLevel === level.id
                    ? 'white'
                    : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{level.emoji}</span>
                {level.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder={language === 'en'
              ? 'Search cases, symptoms...'
              : language === 'ar'
              ? 'ابحث عن الحالات، الأعراض...'
              : 'Rechercher cas, symptômes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {modules.map(module => (
              <option key={module.id} value={module.id}>{module.name}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {difficulties.map(diff => (
              <option key={diff.id} value={diff.id}>{diff.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="popular">{language === 'en' ? 'Most Popular' : language === 'ar' ? 'الأكثر شعبية' : 'Plus Populaire'}</option>
            <option value="rating">{language === 'en' ? 'Best Rated' : language === 'ar' ? 'الأعلى تقييماً' : 'Mieux Noté'}</option>
            <option value="difficulty">{language === 'en' ? 'By Difficulty' : language === 'ar' ? 'حسب الصعوبة' : 'Par Difficulté'}</option>
            <option value="completion">{language === 'en' ? 'Success Rate' : language === 'ar' ? 'معدل النجاح' : 'Taux de Réussite'}</option>
          </select>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Activity size={24} />}
            value={filteredCases.length}
            label={language === 'en' ? 'Available Cases' : language === 'ar' ? 'الحالات المتاحة' : 'Cas Disponibles'}
            color="var(--color-primary)"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            value="76%"
            label={language === 'en' ? 'Average Success' : language === 'ar' ? 'متوسط النجاح' : 'Succès Moyen'}
            color="var(--color-success)"
          />
          <StatCard
            icon={<Clock size={24} />}
            value="32m"
            label={language === 'en' ? 'Average Time' : language === 'ar' ? 'الوقت المتوسط' : 'Temps Moyen'}
            color="var(--color-warning)"
          />
          <StatCard
            icon={<Award size={24} />}
            value="850"
            label={language === 'en' ? 'Total Points' : language === 'ar' ? 'إجمالي النقاط' : 'Points Totaux'}
            color="var(--color-accent)"
          />
        </div>

        {/* Cases Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCases.map((clinicalCase) => (
              <CaseCard
                key={clinicalCase.id}
                clinicalCase={clinicalCase}
                getCaseTitle={getCaseTitle}
                getCaseDescription={getCaseDescription}
                language={language}
              />
            ))}
          </div>
        </AnimatePresence>

        {/* No Results */}
        {filteredCases.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'No cases found' : language === 'ar' ? 'لم يتم العثور على حالات' : 'Aucun cas trouvé'}
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en'
                ? 'Try adjusting your filters'
                : language === 'ar'
                ? 'حاول تعديل الفلاتر'
                : 'Essayez de modifier vos filtres'}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Case Card Component
const CaseCard: React.FC<{
  clinicalCase: ClinicalCase;
  getCaseTitle: (c: ClinicalCase) => string;
  getCaseDescription: (c: ClinicalCase) => string;
  language: string;
}> = ({ clinicalCase, getCaseTitle, getCaseDescription, language }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return 'var(--color-text)';
    }
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-lg cursor-pointer"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      layout
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Difficulty Badge */}
            <div className="flex gap-2 mb-2">
              <span
                className="px-2 py-1 text-xs rounded-full font-medium text-white"
                style={{ backgroundColor: getDifficultyColor(clinicalCase.difficulty) }}
              >
                {clinicalCase.difficulty}
              </span>
              <span
                className="px-2 py-1 text-xs rounded-full font-medium"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-textSecondary)',
                }}
              >
                {clinicalCase.moduleId}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: 'var(--color-text)' }}>
              {getCaseTitle(clinicalCase)}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--color-textSecondary)' }}>
          {getCaseDescription(clinicalCase)}
        </p>

        {/* Presentation Preview */}
        {clinicalCase.presentation && (
          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-background)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'Presentation:' : language === 'ar' ? 'العرض:' : 'Présentation:'}
            </p>
            <p className="text-sm line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'ar' ? (clinicalCase.presentationAr || clinicalCase.presentation)
                : language === 'en' ? (clinicalCase.presentationEn || clinicalCase.presentation)
                : clinicalCase.presentation}
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          <Play size={18} />
          {language === 'en' ? 'Start Case' : language === 'ar' ? 'بدء الحالة' : 'Commencer'}
        </button>
      </div>
    </motion.div>
  );
};

// Statistics Card Component
const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color: string }> = ({
  icon,
  value,
  label,
  color
}) => {
  return (
    <motion.div
      className="p-4 rounded-xl shadow-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ color }}>{icon}</div>
        <BarChart3 size={16} style={{ color: 'var(--color-success)' }} />
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {label}
      </div>
    </motion.div>
  );
};

export default CasesPage;