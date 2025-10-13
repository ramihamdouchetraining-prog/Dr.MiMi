// XXL Summaries Page for Dr.MiMi platform
import React, { useState, useMemo } from 'react';
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

interface Summary {
  id: string;
  title: string;
  module: string;
  author: string;
  pages: number;
  downloads: number;
  rating: number;
  price: number;
  currency: string;
  isPremium: boolean;
  yearLevels: string[];
  language: string;
  tags: string[];
  previewImages: string[];
  lastUpdated: string;
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
  const summaries: Summary[] = [
    {
      id: '1',
      title: language === 'en' ? 'Complete Cardiac Anatomy' : language === 'ar' ? 'التشريح القلبي الكامل' : 'Anatomie Cardiaque Complète',
      module: 'cardiology',
      author: 'Dr. Sarah Martin',
      pages: 45,
      downloads: 1234,
      rating: 4.8,
      price: 0,
      currency: 'DZD',
      isPremium: false,
      yearLevels: ['Y2', 'Y3'],
      language: language,
      tags: ['Coeur', 'Vaisseaux', 'ECG'],
      previewImages: ['/images/anatomy/heart-diagram.png'],
      lastUpdated: '2024-03-15'
    },
    {
      id: '2',
      title: language === 'en' ? 'Neurological Examination Guide' : language === 'ar' ? 'دليل الفحص العصبي' : 'Guide d\'Examen Neurologique',
      module: 'neurology',
      author: 'Prof. Jean Dubois',
      pages: 62,
      downloads: 892,
      rating: 4.9,
      price: 500,
      currency: 'DZD',
      isPremium: true,
      yearLevels: ['Y4', 'Y5'],
      language: language,
      tags: ['Neurologie', 'Examen', 'Diagnostic'],
      previewImages: ['/images/anatomy/brain-diagram.png'],
      lastUpdated: '2024-03-10'
    },
    {
      id: '3',
      title: language === 'en' ? 'Pharmacology Essentials' : language === 'ar' ? 'أساسيات علم الأدوية' : 'Essentiels de Pharmacologie',
      module: 'pharmacology',
      author: 'Dr. Ahmed Benali',
      pages: 78,
      downloads: 2156,
      rating: 4.7,
      price: 0,
      currency: 'DZD',
      isPremium: false,
      yearLevels: ['Y3', 'Y4', 'Y5'],
      language: language,
      tags: ['Médicaments', 'Doses', 'Interactions'],
      previewImages: ['/images/anatomy/heart-diagram.png'],
      lastUpdated: '2024-03-20'
    },
  ];

  // Filter summaries based on criteria
  const filteredSummaries = useMemo(() => {
    let filtered = summaries;
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(s => s.yearLevels.includes(selectedLevel));
    }
    
    if (selectedModule !== 'all') {
      filtered = filtered.filter(s => s.module === selectedModule);
    }
    
    if (showPremiumOnly) {
      filtered = filtered.filter(s => s.isPremium);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }
    
    return filtered;
  }, [selectedLevel, selectedModule, showPremiumOnly, searchTerm, sortBy]);

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
      {summary.isPremium && (
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
            {!summary.isPremium && (
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
        {/* Year Levels */}
        <div className="flex gap-1 mb-2">
          {summary.yearLevels.map(level => (
            <span 
              key={level}
              className="px-2 py-1 text-xs rounded-full font-medium"
              style={{ 
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              {level}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" style={{ color: 'var(--color-text)' }}>
          {summary.title}
        </h3>

        {/* Author */}
        <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
          {summary.author}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {summary.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-lg"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-textSecondary)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {summary.pages} pages
            </span>
            <span className="flex items-center gap-1">
              <Download size={14} />
              {summary.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} fill="currentColor" />
              {summary.rating}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: summary.isPremium ? 'var(--color-warning)' : 'var(--color-primary)',
              color: 'white',
            }}
          >
            {summary.isPremium ? (
              <>
                <Lock size={16} />
                {summary.price} {summary.currency}
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