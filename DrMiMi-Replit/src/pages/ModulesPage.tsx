// XXL Modules Page for Dr.MiMi platform
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Heart,
  Activity,
  Stethoscope,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Lock,
  Unlock,
  GraduationCap,
  Target,
  Shield
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface Module {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  category: 'Preclinical' | 'Clinical' | 'PublicHealth';
  yearLevels: string[];
  courses: number;
  summaries: number;
  quizzes: number;
  cases: number;
  progress: number;
  isLocked: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  students: number;
  rating: number;
  color: string;
  description: string;
  bodySystems: string[];
}

const ModulesPage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Medical modules data
  const modules: Module[] = [
    {
      id: 'anatomy',
      name: 'Anatomie',
      nameEn: 'Anatomy',
      nameAr: 'التشريح',
      icon: emojis.heart,
      category: 'Preclinical',
      yearLevels: ['Y1', 'Y2'],
      courses: 45,
      summaries: 23,
      quizzes: 15,
      cases: 8,
      progress: 65,
      isLocked: false,
      difficulty: 'Medium',
      students: 1234,
      rating: 4.7,
      color: '#EF4444',
      description: language === 'en' 
        ? 'Study of human body structure and organization'
        : language === 'ar'
        ? 'دراسة بنية وتنظيم جسم الإنسان'
        : "Étude de la structure et de l'organisation du corps humain",
      bodySystems: ['Musculosquelettique', 'Cardiovasculaire', 'Nerveux']
    },
    {
      id: 'cardiology',
      name: 'Cardiologie',
      nameEn: 'Cardiology',
      nameAr: 'أمراض القلب',
      icon: emojis.pulse,
      category: 'Clinical',
      yearLevels: ['Y3', 'Y4', 'Y5'],
      courses: 38,
      summaries: 19,
      quizzes: 22,
      cases: 15,
      progress: 45,
      isLocked: false,
      difficulty: 'Hard',
      students: 892,
      rating: 4.8,
      color: '#EC4899',
      description: language === 'en'
        ? 'Study of heart diseases and cardiovascular system'
        : language === 'ar'
        ? 'دراسة أمراض القلب والجهاز القلبي الوعائي'
        : 'Étude des maladies cardiaques et du système cardiovasculaire',
      bodySystems: ['Cardiovasculaire', 'Vasculaire']
    },
    {
      id: 'neurology',
      name: 'Neurologie',
      nameEn: 'Neurology',
      nameAr: 'طب الأعصاب',
      icon: emojis.brain,
      category: 'Clinical',
      yearLevels: ['Y4', 'Y5', 'Y6'],
      courses: 42,
      summaries: 26,
      quizzes: 18,
      cases: 20,
      progress: 30,
      isLocked: false,
      difficulty: 'Hard',
      students: 756,
      rating: 4.9,
      color: '#8B5CF6',
      description: language === 'en'
        ? 'Study of nervous system disorders'
        : language === 'ar'
        ? 'دراسة اضطرابات الجهاز العصبي'
        : 'Étude des troubles du système nerveux',
      bodySystems: ['Nerveux central', 'Nerveux périphérique']
    },
    {
      id: 'pharmacology',
      name: 'Pharmacologie',
      nameEn: 'Pharmacology',
      nameAr: 'علم الأدوية',
      icon: emojis.syringe,
      category: 'Preclinical',
      yearLevels: ['Y2', 'Y3', 'Y4'],
      courses: 55,
      summaries: 32,
      quizzes: 28,
      cases: 10,
      progress: 80,
      isLocked: false,
      difficulty: 'Medium',
      students: 1567,
      rating: 4.6,
      color: '#10B981',
      description: language === 'en'
        ? 'Study of drugs and their effects on the body'
        : language === 'ar'
        ? 'دراسة الأدوية وتأثيراتها على الجسم'
        : 'Étude des médicaments et leurs effets sur le corps',
      bodySystems: ['Tous les systèmes']
    },
    {
      id: 'genetics',
      name: 'Génétique',
      nameEn: 'Genetics',
      nameAr: 'علم الوراثة',
      icon: emojis.dna,
      category: 'Preclinical',
      yearLevels: ['Y2', 'Y3'],
      courses: 28,
      summaries: 15,
      quizzes: 12,
      cases: 6,
      progress: 20,
      isLocked: true,
      difficulty: 'Hard',
      students: 432,
      rating: 4.5,
      color: '#F59E0B',
      description: language === 'en'
        ? 'Study of heredity and genetic variation'
        : language === 'ar'
        ? 'دراسة الوراثة والتنوع الجيني'
        : "Étude de l'hérédité et de la variation génétique",
      bodySystems: ['Génétique moléculaire', 'Génétique clinique']
    },
    {
      id: 'pneumology',
      name: 'Pneumologie',
      nameEn: 'Pneumology',
      nameAr: 'أمراض الرئة',
      icon: emojis.stethoscope,
      category: 'Clinical',
      yearLevels: ['Y4', 'Y5'],
      courses: 32,
      summaries: 18,
      quizzes: 14,
      cases: 12,
      progress: 55,
      isLocked: false,
      difficulty: 'Medium',
      students: 678,
      rating: 4.7,
      color: '#06B6D4',
      description: language === 'en'
        ? 'Study of respiratory system diseases'
        : language === 'ar'
        ? 'دراسة أمراض الجهاز التنفسي'
        : 'Étude des maladies du système respiratoire',
      bodySystems: ['Respiratoire']
    }
  ];

  // Filter modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(m => m.yearLevels.includes(selectedLevel));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.nameEn.toLowerCase().includes(term) ||
        m.nameAr.includes(term) ||
        m.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [selectedCategory, selectedLevel, searchTerm]);

  // Get module name based on language
  const getModuleName = (module: Module) => {
    if (language === 'en') return module.nameEn;
    if (language === 'ar') return module.nameAr;
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
}> = ({ module, getModuleName, language, isRTL }) => {
  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      layout
    >
      {/* Lock Overlay */}
      {module.isLocked && (
        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <Lock size={48} className="mx-auto mb-2" />
            <p className="font-semibold">
              {language === 'en' ? 'Premium Module' : language === 'ar' ? 'وحدة مميزة' : 'Module Premium'}
            </p>
          </div>
        </div>
      )}

      {/* Header with gradient */}
      <div 
        className="h-32 p-4 flex flex-col justify-between"
        style={{ 
          background: `linear-gradient(135deg, ${module.color}88 0%, ${module.color}44 100%)` 
        }}
      >
        <div className="flex justify-between items-start">
          <div className="text-4xl">{module.icon}</div>
          <div className={`flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full`}>
            <Star size={14} fill="gold" className="text-yellow-500" />
            <span className="text-sm font-semibold text-gray-800">{module.rating}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {module.yearLevels.map(level => (
            <span 
              key={level} 
              className="text-xs px-2 py-1 bg-white/80 rounded-full font-medium text-gray-800"
            >
              {level}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          {getModuleName(module)}
        </h3>
        
        <span className={`inline-block px-2 py-1 text-xs rounded-full mb-3`}
              style={{ 
                backgroundColor: module.category === 'Preclinical' 
                  ? '#DBEAFE' 
                  : module.category === 'Clinical'
                  ? '#FEE2E2'
                  : '#D1FAE5',
                color: module.category === 'Preclinical' 
                  ? '#1E40AF' 
                  : module.category === 'Clinical'
                  ? '#991B1B'
                  : '#065F46'
              }}>
          {module.category}
        </span>

        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
          {module.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {module.courses}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Courses' : language === 'ar' ? 'دروس' : 'Cours'}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {module.quizzes}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Quizzes' : language === 'ar' ? 'اختبارات' : 'Quiz'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'Progress' : language === 'ar' ? 'التقدم' : 'Progression'}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
              {module.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${module.progress}%`,
                backgroundColor: module.color
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            <Users size={14} />
            <span>{module.students}</span>
          </div>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              module.isLocked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
            disabled={module.isLocked}
          >
            {module.isLocked ? <Lock size={16} /> : <ChevronRight size={16} />}
            {language === 'en' ? 'Start' : language === 'ar' ? 'ابدأ' : 'Commencer'}
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