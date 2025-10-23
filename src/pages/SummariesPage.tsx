// XXL Summaries Page for Dr.MiMi platform
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Star,
  Search,
  GraduationCap,
  TrendingUp,
  Award,
  Users,
  Bookmark,
  Share2,
  Lock
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/EmptyState';

interface Summary {
  id: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  content?: string;
  contentEn?: string;
  contentAr?: string;
  moduleId?: string | null;
  pdfAsset?: string | null;
  previewImages?: any; // jsonb array
  language?: string | null;
  pages?: number | null;
  price?: string | null;
  currency?: string | null;
  tags?: any; // jsonb array
  status?: string | null;
  createdBy?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

const SummariesPage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, language, isRTL } = useLanguage();
  // const { isAuthenticated, user } = useAuth();
  
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  // API State
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch summaries from API
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/summaries');
        if (!response.ok) {
          throw new Error(`Failed to fetch summaries: ${response.status}`);
        }
        
        const data = await response.json();
        setSummaries(data);
      } catch (err: any) {
        console.error('Error fetching summaries:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des résumés');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // Study levels
  const studyLevels = [
    { id: 'all', name: t('common.all') || 'Tous' },
    { id: 'Y1', name: t('level.Y1'), emoji: '🎓' },
    { id: 'Y2', name: t('level.Y2'), emoji: '📚' },
    { id: 'Y3', name: t('level.Y3'), emoji: '🔬' },
    { id: 'Y4', name: t('level.Y4'), emoji: '🏥' },
    { id: 'Y5', name: t('level.Y5'), emoji: '👨‍⚕️' },
    { id: 'Y6', name: t('level.Y6'), emoji: '🎯' },
    { id: 'Intern', name: t('level.Intern'), emoji: '⚕️' },
  ];

  // Medical modules
  const modules = [
    { id: 'all', name: t('common.all') || 'Tous', emoji: '📋' },
    { id: 'anatomy', name: t('module.anatomy'), emoji: emojis.heart },
    { id: 'cardiology', name: t('module.cardiology'), emoji: emojis.pulse },
    { id: 'neurology', name: t('module.neurology'), emoji: emojis.brain },
    { id: 'pneumology', name: t('module.pneumology'), emoji: emojis.stethoscope },
    { id: 'gastroenterology', name: t('module.gastroenterology'), emoji: emojis.medicine },
    { id: 'endocrinology', name: t('module.endocrinology'), emoji: emojis.dna },
    { id: 'nephrology', name: t('module.nephrology'), emoji: emojis.thermometer },
    { id: 'pharmacology', name: t('module.pharmacology'), emoji: emojis.syringe },
  ];

  // Sample summaries data

  // Filter summaries based on criteria
  const filteredSummaries = useMemo(() => {
    let filtered = summaries;
    
    if (selectedLevel !== 'all') {
      const tags = filtered.map(s => s.tags).filter(Boolean);
      filtered = filtered.filter(s => {
        const summaryTags = s.tags as any as string[];
        return summaryTags && summaryTags.includes(selectedLevel);
      });
    }
    
    if (selectedModule !== 'all') {
      filtered = filtered.filter(s => s.moduleId === selectedModule);
    }
    
    if (showPremiumOnly) {
      filtered = filtered.filter(s => parseFloat(s.price || '0') > 0);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => {
        const title = s.title || s.titleEn || s.titleAr || '';
        const content = s.content || s.contentEn || s.contentAr || '';
        const searchLower = searchTerm.toLowerCase();
        const tagsArray = s.tags as any as string[];
        
        return title.toLowerCase().includes(searchLower) ||
               content.toLowerCase().includes(searchLower) ||
               (tagsArray && tagsArray.some((tag: string) => tag.toLowerCase().includes(searchLower)));
      });
    }

    // Sort by recent (createdAt)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return filtered;
  }, [summaries, selectedLevel, selectedModule, showPremiumOnly, searchTerm, sortBy]);

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
            {t('nav.summaries')} {emojis.sparkles}
            {isFeminine && ' 💕'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            {language === 'en' 
              ? 'Download medical summaries with clear diagrams and schemas'
              : language === 'ar'
              ? 'حمل الملخصات الطبية مع الرسوم البيانية والمخططات الواضحة'
              : 'Téléchargez des résumés médicaux avec schémas et diagrammes clairs'}
          </p>
        </motion.div>

        {/* Study Level Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            <GraduationCap className="inline mr-2" size={20} />
            {language === 'en' ? 'Select your study level' : language === 'ar' ? 'اختر مستوى دراستك' : 'Sélectionnez votre niveau d\'étude'}
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
                {level.emoji && <span className="mr-2">{level.emoji}</span>}
                {level.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search 
                size={20} 
                className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`}
                style={{ color: 'var(--color-textSecondary)' }} 
              />
              <input
                type="text"
                placeholder={language === 'en' 
                  ? 'Search summaries, authors, tags...'
                  : language === 'ar'
                  ? 'ابحث عن الملخصات، المؤلفين، العلامات...'
                  : 'Rechercher résumés, auteurs, tags...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg border transition-colors`}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-4 py-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.emoji} {module.name}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="popular">{language === 'en' ? 'Most Popular' : language === 'ar' ? 'الأكثر شعبية' : 'Plus Populaire'}</option>
              <option value="rating">{language === 'en' ? 'Best Rated' : language === 'ar' ? 'الأعلى تقييماً' : 'Mieux Noté'}</option>
              <option value="recent">{language === 'en' ? 'Most Recent' : language === 'ar' ? 'الأحدث' : 'Plus Récent'}</option>
            </select>
          </div>

          {/* Premium Filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="premium"
              checked={showPremiumOnly}
              onChange={(e) => setShowPremiumOnly(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="premium" className="cursor-pointer" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'Show Premium Only' : language === 'ar' ? 'عرض المميز فقط' : 'Afficher Premium Uniquement'}
            </label>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<FileText size={24} />} 
            value={filteredSummaries.length}
            label={language === 'en' ? 'Available Summaries' : language === 'ar' ? 'الملخصات المتاحة' : 'Résumés Disponibles'}
            color="var(--color-primary)"
          />
          <StatCard 
            icon={<Download size={24} />} 
            value="15.2k"
            label={language === 'en' ? 'Total Downloads' : language === 'ar' ? 'إجمالي التحميلات' : 'Téléchargements Totaux'}
            color="var(--color-success)"
          />
          <StatCard 
            icon={<Users size={24} />} 
            value="3.8k"
            label={language === 'en' ? 'Active Students' : language === 'ar' ? 'الطلاب النشطون' : 'Étudiants Actifs'}
            color="var(--color-warning)"
          />
          <StatCard 
            icon={<Star size={24} />} 
            value="4.7"
            label={language === 'en' ? 'Average Rating' : language === 'ar' ? 'متوسط التقييم' : 'Note Moyenne'}
            color="var(--color-accent)"
          />
        </div>

        {/* Summaries Grid */}
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {filteredSummaries.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} isRTL={isRTL} language={language} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredSummaries.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'No summaries found' : language === 'ar' ? 'لم يتم العثور على ملخصات' : 'Aucun résumé trouvé'}
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' 
                ? 'Try adjusting your search criteria'
                : language === 'ar'
                ? 'حاول تعديل معايير البحث'
                : 'Essayez de modifier vos critères de recherche'}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{ summary: Summary; isRTL: boolean; language: string }> = ({ summary, isRTL, language }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const displayTitle = summary.title || summary.titleEn || summary.titleAr || 'Untitled Summary';
  const displayPrice = summary.price ? parseFloat(summary.price) : 0;
  const isPremium = displayPrice > 0;
  const tagsArray = (summary.tags as any as string[]) || [];
  const previewArray = (summary.previewImages as any as string[]) || [];

  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10`}>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Award size={14} />
            Premium
          </div>
        </div>
      )}

      {/* Preview Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText size={64} style={{ color: 'var(--color-primary)', opacity: 0.3 }} />
        </div>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              className="p-3 bg-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye size={20} className="text-gray-800" />
            </motion.button>
            {!isPremium && (
              <motion.button
                className="p-3 bg-primary text-white rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Download size={20} />
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags/Year Levels */}
        {tagsArray.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {tagsArray.slice(0, 4).map((tag: string, idx: number) => (
              <span 
                key={idx}
                className="px-2 py-1 text-xs rounded-full font-medium"
                style={{ 
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" style={{ color: 'var(--color-text)' }}>
          {displayTitle}
        </h3>

        {/* Language & Pages */}
        <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
          {summary.language || 'fr'} • {summary.pages || 0} pages
        </p>

        {/* Stats */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {summary.pages || 0} pages
            </span>
            {summary.pdfAsset && (
              <span className="flex items-center gap-1">
                <Download size={14} />
                PDF
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: isPremium ? 'var(--color-warning)' : 'var(--color-primary)',
              color: 'white',
            }}
          >
            {isPremium ? (
              <>
                <Lock size={16} />
                {displayPrice.toLocaleString()} {summary.currency || 'DZD'}
              </>
            ) : (
              <>
                <Download size={16} />
                {language === 'en' ? 'Free' : language === 'ar' ? 'مجاني' : 'Gratuit'}
              </>
            )}
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: isSaved ? 'var(--color-primary)' : 'var(--color-textSecondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-textSecondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Share2 size={18} />
          </button>
        </div>
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
        <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
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

export default SummariesPage;