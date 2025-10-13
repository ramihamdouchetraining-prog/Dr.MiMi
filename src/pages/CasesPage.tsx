// XXL Clinical Cases Page for Dr.MiMi platform
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  Award,
  Star,
  ChevronRight,
  User,
  Lock,
  Play,
  BookOpen,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  TrendingUp,
  BarChart3,
  MessageCircle,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface ClinicalCase {
  id: string;
  title: string;
  titleEn: string;
  titleAr: string;
  module: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  yearLevels: string[];
  duration: number; // minutes
  points: number;
  attempts: number;
  successRate: number;
  rating: number;
  isPremium: boolean;
  isCompleted: boolean;
  tags: string[];
  author: string;
  description: string;
  descriptionEn: string;
  descriptionAr: string;
  objectives: string[];
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  views: number;
  likes: number;
  comments: number;
}

const CasesPage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

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

  // Sample clinical cases
  const clinicalCases: ClinicalCase[] = [
    {
      id: '1',
      title: 'Douleur Thoracique Aiguë chez un Homme de 55 ans',
      titleEn: 'Acute Chest Pain in a 55-Year-Old Man',
      titleAr: 'ألم صدري حاد عند رجل عمره 55 عامًا',
      module: 'cardiology',
      difficulty: 'Medium',
      yearLevels: ['Y4', 'Y5'],
      duration: 30,
      points: 150,
      attempts: 892,
      successRate: 72,
      rating: 4.7,
      isPremium: false,
      isCompleted: false,
      tags: ['ECG', 'Infarctus', 'Urgence'],
      author: 'Dr. Pierre Martin',
      description: 'Patient se présentant aux urgences avec douleur thoracique rétrosternale irradiant vers le bras gauche',
      descriptionEn: 'Patient presenting to ER with retrosternal chest pain radiating to left arm',
      descriptionAr: 'مريض يحضر إلى الطوارئ مع ألم صدري خلف القص يشع إلى الذراع الأيسر',
      objectives: ['Diagnostic différentiel', 'Interprétation ECG', 'Prise en charge urgente'],
      patientAge: 55,
      patientGender: 'M',
      chiefComplaint: 'Douleur thoracique',
      views: 3456,
      likes: 234,
      comments: 45
    },
    {
      id: '2',
      title: 'Céphalées Récurrentes chez une Femme de 28 ans',
      titleEn: 'Recurrent Headaches in a 28-Year-Old Woman',
      titleAr: 'صداع متكرر عند امرأة عمرها 28 عامًا',
      module: 'neurology',
      difficulty: 'Easy',
      yearLevels: ['Y3', 'Y4'],
      duration: 20,
      points: 100,
      attempts: 1234,
      successRate: 85,
      rating: 4.8,
      isPremium: false,
      isCompleted: true,
      tags: ['Migraine', 'Neurologie', 'Diagnostic'],
      author: 'Dr. Sophie Dubois',
      description: 'Jeune femme consultant pour céphalées pulsatiles unilatérales avec photophobie',
      descriptionEn: 'Young woman consulting for unilateral pulsating headaches with photophobia',
      descriptionAr: 'امرأة شابة تستشير لصداع نابض أحادي الجانب مع رهاب الضوء',
      objectives: ['Critères diagnostiques', 'Traitement de crise', 'Prévention'],
      patientAge: 28,
      patientGender: 'F',
      chiefComplaint: 'Céphalées',
      views: 5678,
      likes: 456,
      comments: 78
    },
    {
      id: '3',
      title: 'Dyspnée Progressive chez un Fumeur de 65 ans',
      titleEn: 'Progressive Dyspnea in a 65-Year-Old Smoker',
      titleAr: 'ضيق تنفس تدريجي عند مدخن عمره 65 عامًا',
      module: 'pneumology',
      difficulty: 'Hard',
      yearLevels: ['Y5', 'Y6'],
      duration: 45,
      points: 200,
      attempts: 567,
      successRate: 58,
      rating: 4.5,
      isPremium: true,
      isCompleted: false,
      tags: ['BPCO', 'Tabagisme', 'Spirométrie'],
      author: 'Prof. Ahmed Benali',
      description: 'Patient fumeur présentant une dyspnée d\'effort progressive avec toux chronique productive',
      descriptionEn: 'Smoking patient with progressive exertional dyspnea and chronic productive cough',
      descriptionAr: 'مريض مدخن يعاني من ضيق تنفس جهدي تدريجي مع سعال مزمن منتج',
      objectives: ['Évaluation fonctionnelle', 'Classification GOLD', 'Thérapeutique'],
      patientAge: 65,
      patientGender: 'M',
      chiefComplaint: 'Dyspnée',
      views: 2345,
      likes: 178,
      comments: 34
    },
    {
      id: '4',
      title: 'Douleur Abdominale et Ictère chez une Femme de 42 ans',
      titleEn: 'Abdominal Pain and Jaundice in a 42-Year-Old Woman',
      titleAr: 'ألم بطني ويرقان عند امرأة عمرها 42 عامًا',
      module: 'gastroenterology',
      difficulty: 'Medium',
      yearLevels: ['Y4', 'Y5', 'Y6'],
      duration: 35,
      points: 175,
      attempts: 678,
      successRate: 68,
      rating: 4.6,
      isPremium: false,
      isCompleted: false,
      tags: ['Lithiase', 'Cholécystite', 'Urgence'],
      author: 'Dr. Marie Laurent',
      description: 'Patiente présentant des douleurs de l\'hypochondre droit avec ictère et fièvre',
      descriptionEn: 'Patient with right upper quadrant pain, jaundice and fever',
      descriptionAr: 'مريضة تعاني من آلام في الربع العلوي الأيمن مع يرقان وحمى',
      objectives: ['Diagnostic biologique', 'Imagerie', 'Prise en charge'],
      patientAge: 42,
      patientGender: 'F',
      chiefComplaint: 'Douleur abdominale',
      views: 3890,
      likes: 290,
      comments: 52
    }
  ];

  // Filter cases
  const filteredCases = useMemo(() => {
    let filtered = clinicalCases;

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(c => c.yearLevels.includes(selectedLevel));
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    }

    if (selectedModule !== 'all') {
      filtered = filtered.filter(c => c.module === selectedModule);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.titleEn.toLowerCase().includes(term) ||
        c.titleAr.includes(term) ||
        c.chiefComplaint.toLowerCase().includes(term) ||
        c.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'difficulty') {
      const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      filtered.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
    } else if (sortBy === 'completion') {
      filtered.sort((a, b) => b.successRate - a.successRate);
    }

    return filtered;
  }, [selectedLevel, selectedDifficulty, selectedModule, searchTerm, sortBy]);

  // Get case title based on language
  const getCaseTitle = (clinicalCase: ClinicalCase) => {
    if (language === 'en') return clinicalCase.titleEn;
    if (language === 'ar') return clinicalCase.titleAr;
    return clinicalCase.title;
  };

  const getCaseDescription = (clinicalCase: ClinicalCase) => {
    if (language === 'en') return clinicalCase.descriptionEn;
    if (language === 'ar') return clinicalCase.descriptionAr;
    return clinicalCase.description;
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
                isRTL={isRTL}
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
  isRTL: boolean;
}> = ({ clinicalCase, getCaseTitle, getCaseDescription, language, isRTL }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return 'var(--color-text)';
    }
  };

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
      layout
    >
      {/* Premium Badge */}
      {clinicalCase.isPremium && (
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Award size={14} />
            Premium
          </div>
        </div>
      )}

      {/* Completion Badge */}
      {clinicalCase.isCompleted && (
        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
          <div className="bg-green-500 text-white p-2 rounded-full">
            <CheckCircle size={20} />
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Year Levels and Difficulty */}
            <div className="flex gap-2 mb-2">
              {clinicalCase.yearLevels.map(level => (
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
              <span
                className="px-2 py-1 text-xs rounded-full font-medium text-white"
                style={{ backgroundColor: getDifficultyColor(clinicalCase.difficulty) }}
              >
                {clinicalCase.difficulty}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: 'var(--color-text)' }}>
              {getCaseTitle(clinicalCase)}
            </h3>

            {/* Author */}
            <p className="text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-textSecondary)' }}>
              <User size={14} />
              {clinicalCase.author}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="flex items-center gap-4 text-sm">
            <span style={{ color: 'var(--color-text)' }}>
              <AlertCircle size={16} className="inline mr-1" />
              {clinicalCase.patientAge} {language === 'en' ? 'years' : language === 'ar' ? 'سنة' : 'ans'}, {clinicalCase.patientGender}
            </span>
            <span style={{ color: 'var(--color-primary)' }}>
              {clinicalCase.chiefComplaint}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
          {getCaseDescription(clinicalCase)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {clinicalCase.tags.map(tag => (
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
        <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
          <div className="text-center">
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {clinicalCase.duration}m
            </div>
            <div style={{ color: 'var(--color-textSecondary)' }}>
              <Clock size={14} className="inline" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {clinicalCase.points}
            </div>
            <div style={{ color: 'var(--color-textSecondary)' }}>
              {language === 'en' ? 'pts' : language === 'ar' ? 'نقطة' : 'pts'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {clinicalCase.successRate}%
            </div>
            <div style={{ color: 'var(--color-textSecondary)' }}>
              <CheckCircle size={14} className="inline" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {clinicalCase.rating}
            </div>
            <div style={{ color: 'var(--color-textSecondary)' }}>
              <Star size={14} className="inline" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {clinicalCase.views}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp size={14} />
              {clinicalCase.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {clinicalCase.comments}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            clinicalCase.isPremium && !clinicalCase.isCompleted ? 'opacity-80' : ''
          }`}
          style={{
            backgroundColor: clinicalCase.isCompleted
              ? 'var(--color-success)'
              : clinicalCase.isPremium
              ? 'var(--color-warning)'
              : 'var(--color-primary)',
            color: 'white',
          }}
        >
          {clinicalCase.isCompleted ? (
            <>
              <CheckCircle size={18} />
              {language === 'en' ? 'Review' : language === 'ar' ? 'مراجعة' : 'Réviser'}
            </>
          ) : clinicalCase.isPremium ? (
            <>
              <Lock size={18} />
              {language === 'en' ? 'Unlock' : language === 'ar' ? 'فتح' : 'Débloquer'}
            </>
          ) : (
            <>
              <Play size={18} />
              {language === 'en' ? 'Start Case' : language === 'ar' ? 'بدء الحالة' : 'Commencer'}
            </>
          )}
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