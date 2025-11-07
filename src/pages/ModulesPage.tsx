// XXL Modules Page for Dr.MiMi platform
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  GraduationCap,
  Target
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, ErrorState } from '../components/EmptyState';
import { apiFetch } from '../config/api';

interface Module {
  id: string;
  name: string;
  nameEn?: string | null;
  nameAr?: string | null;
  icon?: string | null;
  category: 'Preclinical' | 'Clinical' | 'PublicHealth';
  bodySystems?: any; // jsonb
  description?: string | null;
  createdAt?: Date | string | null;
}

const ModulesPage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // API State
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFetch('/api/modules');
        const data = await response.json();
        setModules(data);
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Study levels
  const studyLevels = [
    { id: 'all', name: language === 'en' ? 'All' : language === 'ar' ? 'الكل' : 'Tous', emoji: '📚' },
    { id: 'Y1', name: t('level.Y1'), emoji: '🎓' },
    { id: 'Y2', name: t('level.Y2'), emoji: '📖' },
    { id: 'Y3', name: t('level.Y3'), emoji: '🔬' },
    { id: 'Y4', name: t('level.Y4'), emoji: '🏥' },
    { id: 'Y5', name: t('level.Y5'), emoji: '👨‍⚕️' },
    { id: 'Y6', name: t('level.Y6'), emoji: '🎯' },
    { id: 'Intern', name: t('level.Intern'), emoji: '⚕️' },
  ];

  // Categories
  const categories = [
    { id: 'all', name: language === 'en' ? 'All Categories' : language === 'ar' ? 'جميع الفئات' : 'Toutes les Catégories' },
    { id: 'Preclinical', name: language === 'en' ? 'Preclinical' : language === 'ar' ? 'ما قبل السريري' : 'Préclinique' },
    { id: 'Clinical', name: language === 'en' ? 'Clinical' : language === 'ar' ? 'سريري' : 'Clinique' },
    { id: 'PublicHealth', name: language === 'en' ? 'Public Health' : language === 'ar' ? 'الصحة العامة' : 'Santé Publique' },
  ];

  // Filter modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(term) ||
        (m.nameEn && m.nameEn.toLowerCase().includes(term)) ||
        (m.nameAr && m.nameAr.includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [modules, selectedCategory, selectedLevel, searchTerm]);

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

  const getModuleName = (module: Module) => {
    if (language === 'ar') return module.nameAr || module.name;
    if (language === 'en') return module.nameEn || module.name;
    return module.name;
  };

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
            {t('nav.modules')} {emojis.microscope}
            {isFeminine && ' 💕'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            {language === 'en'
              ? 'Explore medical modules organized by specialty and year level'
              : language === 'ar'
              ? 'استكشف الوحدات الطبية المنظمة حسب التخصص والمستوى الدراسي'
              : 'Explorez les modules médicaux organisés par spécialité et niveau d\'étude'}
          </p>
        </motion.div>

        {/* Study Level Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            <GraduationCap className="inline mr-2" size={20} />
            {language === 'en' ? 'Your Study Level' : language === 'ar' ? 'مستوى دراستك' : 'Votre Niveau d\'Étude'}
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
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder={language === 'en' 
              ? 'Search modules...'
              : language === 'ar'
              ? 'البحث عن الوحدات...'
              : 'Rechercher des modules...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Stats Summary */}
          <div className="flex items-center justify-center gap-4 px-4 py-3 rounded-lg"
               style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text)' }}>
              <strong>{filteredModules.length}</strong> {language === 'en' ? 'Modules' : language === 'ar' ? 'وحدات' : 'Modules'}
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        {isAuthenticated && (
          <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              <Target className="inline mr-2" size={20} />
              {language === 'en' ? 'Your Progress' : language === 'ar' ? 'تقدمك' : 'Votre Progression'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ProgressStat 
                label={language === 'en' ? 'Modules Started' : language === 'ar' ? 'الوحدات المبدوءة' : 'Modules Commencés'}
                value="8/12"
                percentage={67}
              />
              <ProgressStat 
                label={language === 'en' ? 'Courses Completed' : language === 'ar' ? 'الدروس المكتملة' : 'Cours Complétés'}
                value="45/180"
                percentage={25}
              />
              <ProgressStat 
                label={language === 'en' ? 'Quizzes Passed' : language === 'ar' ? 'الاختبارات المجتازة' : 'Quiz Réussis'}
                value="23/65"
                percentage={35}
              />
              <ProgressStat 
                label={language === 'en' ? 'Average Score' : language === 'ar' ? 'المعدل' : 'Score Moyen'}
                value="82%"
                percentage={82}
              />
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard key={module.id} module={module} getModuleName={getModuleName} language={language} isRTL={isRTL} />
          ))}
        </div>

        {/* No Results */}
        {filteredModules.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {language === 'en' ? 'No modules found' : language === 'ar' ? 'لم يتم العثور على وحدات' : 'Aucun module trouvé'}
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

// Module Card Component
const ModuleCard: React.FC<{ 
  module: Module; 
  getModuleName: (module: Module) => string;
  language: string;
  isRTL: boolean;
}> = ({ module, getModuleName, language }) => {
  const categoryColors = {
    Preclinical: { bg: '#DBEAFE', text: '#1E40AF' },
    Clinical: { bg: '#FEE2E2', text: '#991B1B' },
    PublicHealth: { bg: '#D1FAE5', text: '#065F46' }
  };

  const categoryColor = categoryColors[module.category] || categoryColors.Clinical;

  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-lg cursor-pointer"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      layout
    >
      {/* Header */}
      <div 
        className="h-32 p-4 flex flex-col justify-between"
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="flex justify-between items-start">
          <div className="text-4xl">{module.icon || '📚'}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {getModuleName(module)}
        </h3>
        
        <span 
          className="inline-block px-3 py-1 text-xs rounded-full mb-3 font-medium"
          style={{ 
            backgroundColor: categoryColor.bg,
            color: categoryColor.text
          }}
        >
          {module.category}
        </span>

        {module.description && (
          <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--color-textSecondary)' }}>
            {module.description}
          </p>
        )}

        {/* Body Systems */}
        {module.bodySystems && Array.isArray(module.bodySystems) && module.bodySystems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Systems:' : language === 'ar' ? 'الأنظمة:' : 'Systèmes:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {module.bodySystems.slice(0, 3).map((system: any, idx: number) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)'
                  }}
                >
                  {typeof system === 'string' ? system : system.name || ''}
                </span>
              ))}
              {module.bodySystems.length > 3 && (
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textSecondary)'
                  }}
                >
                  +{module.bodySystems.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            <ChevronRight size={16} />
            {language === 'en' ? 'Explore' : language === 'ar' ? 'استكشف' : 'Explorer'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Progress Stat Component
const ProgressStat: React.FC<{ label: string; value: string; percentage: number }> = ({ label, value, percentage }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ModulesPage;