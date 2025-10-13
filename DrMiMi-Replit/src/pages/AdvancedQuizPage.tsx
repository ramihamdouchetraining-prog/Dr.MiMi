import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, Clock, Trophy, Target,
  Brain, Heart, Pill, AlertCircle,
  FlaskConical, Microscope, Timer,
  Users, TrendingUp, Star, Lock,
  Gamepad2, ArrowLeft
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { QuizComponent } from '../components/QuizComponent';
import { cardiologyQuiz, neurologyQuiz, anatomyQuiz, medicalModules, getQuizByModule } from '../data/medicalContent';

// Import game components
import AnatomiePuzzle from '../components/games/AnatomiePuzzle';
import DiagnosticDetective from '../components/games/DiagnosticDetective';
import MedicamentMatch from '../components/games/MedicamentMatch';
import UrgenceChrono from '../components/games/UrgenceChrono';

// Game card data
const games = [
  {
    id: 'anatomie_puzzle',
    title: 'Anatomie Puzzle',
    titleEn: 'Anatomy Puzzle',
    titleAr: 'لغز التشريح',
    description: 'Placez correctement les organes sur le corps humain',
    descriptionEn: 'Place organs correctly on the human body',
    descriptionAr: 'ضع الأعضاء بشكل صحيح على جسم الإنسان',
    icon: Brain,
    color: '#FF6B6B',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    difficulty: 'facile',
    xpReward: 100,
    timeLimit: 180,
    unlocked: true,
    path: '/games/anatomie-puzzle',
  },
  {
    id: 'diagnostic_detective',
    title: 'Diagnostic Detective',
    titleEn: 'Diagnostic Detective',
    titleAr: 'محقق التشخيص',
    description: 'Déduisez la maladie à partir des symptômes',
    descriptionEn: 'Deduce the disease from symptoms',
    descriptionAr: 'استنتج المرض من الأعراض',
    icon: Heart,
    color: '#4ECDC4',
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    difficulty: 'moyen',
    xpReward: 150,
    timeLimit: 300,
    unlocked: true,
    path: '/games/diagnostic-detective',
  },
  {
    id: 'medicament_match',
    title: 'Médicament Match',
    titleEn: 'Medicine Match',
    titleAr: 'مطابقة الأدوية',
    description: 'Associez médicaments et indications',
    descriptionEn: 'Match medicines with indications',
    descriptionAr: 'طابق الأدوية مع دواعي الاستعمال',
    icon: Pill,
    color: '#95E77E',
    bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    difficulty: 'facile',
    xpReward: 80,
    timeLimit: 120,
    unlocked: true,
    path: '/games/medicament-match',
  },
  {
    id: 'urgence_chrono',
    title: 'Urgence Chrono',
    titleEn: 'Emergency Rush',
    titleAr: 'طوارئ السباق',
    description: 'Prenez les bonnes décisions en urgence',
    descriptionEn: 'Make the right emergency decisions',
    descriptionAr: 'اتخذ القرارات الصحيحة في حالات الطوارئ',
    icon: AlertCircle,
    color: '#FFD93D',
    bgGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    difficulty: 'difficile',
    xpReward: 200,
    timeLimit: 60,
    unlocked: true,
    path: '/games/urgence-chrono',
  },
];

export function AdvancedQuizPage() {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'quiz' | 'jeux'>('quiz');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'facile' | 'moyen' | 'difficile' | 'all'>('all');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  
  // Check URL params for tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'jeux') {
      setActiveTab('jeux');
    }
  }, [searchParams]);

  const availableModules = medicalModules.filter(module => module.quizCount > 0);

  const getQuizQuestions = () => {
    if (!selectedModule) return [];
    
    const questions = getQuizByModule(selectedModule);
    
    if (selectedDifficulty === 'all') {
      return questions;
    }
    
    return questions.filter(q => q.difficulty === selectedDifficulty);
  };

  const handleQuizComplete = (score: number, results: any[]) => {
    console.log('Quiz completed:', { score, results });
    // Here you would typically save the results to the database
  };

  // Render tab content based on active tab
  if (activeTab === 'jeux') {
    return (
      <motion.div
        className="min-h-screen p-8"
        style={{ backgroundColor: 'var(--color-background)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header with Tabs */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Centre d'Apprentissage Médical {emojis.brain}
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--color-textSecondary)' }}>
              Apprenez en vous amusant avec nos quiz et jeux médicaux
            </p>
            
            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
              <motion.button
                onClick={() => {
                  setActiveTab('quiz');
                  setSelectedGame(null);
                }}
                className="px-6 py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'quiz' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: activeTab === 'quiz' ? 'white' : 'var(--color-text)',
                  border: `2px solid ${activeTab === 'quiz' ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="inline-block w-5 h-5 mr-2" />
                Quiz Médicaux
              </motion.button>
              
              <motion.button
                onClick={() => setActiveTab('jeux')}
                className="px-6 py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'jeux' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: activeTab === 'jeux' ? 'white' : 'var(--color-text)',
                  border: `2px solid ${activeTab === 'jeux' ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Gamepad2 className="inline-block w-5 h-5 mr-2" />
                Jeux Médicaux
              </motion.button>
            </div>
          </motion.div>
          
          {/* Game Content */}
          {selectedGame ? (
            <div>
              {/* Back Button */}
              <motion.button
                onClick={() => setSelectedGame(null)}
                className="mb-6 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux jeux
              </motion.button>
              
              {/* Render selected game */}
              {selectedGame === 'anatomie_puzzle' && <AnatomiePuzzle />}
              {selectedGame === 'diagnostic_detective' && <DiagnosticDetective />}
              {selectedGame === 'medicament_match' && <MedicamentMatch />}
              {selectedGame === 'urgence_chrono' && <UrgenceChrono />}
            </div>
          ) : (
            /* Games Grid */
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {games.map((game, index) => {
                const Icon = game.icon;
                return (
                  <motion.div
                    key={game.id}
                    className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                    style={{
                      background: game.bgGradient,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedGame(game.id)}
                  >
                    <div className="p-8 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-12 h-12" />
                        {game.unlocked ? (
                          <Star className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">
                        {locale === 'ar' ? game.titleAr :
                         locale === 'en' ? game.titleEn :
                         game.title}
                      </h3>
                      
                      <p className="text-white/90 mb-6">
                        {locale === 'ar' ? game.descriptionAr :
                         locale === 'en' ? game.descriptionEn :
                         game.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          <span>{Math.floor(game.timeLimit / 60)} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{game.xpReward} XP</span>
                        </div>
                        <div className="px-2 py-1 bg-white/20 rounded">
                          {game.difficulty}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
  
  if (selectedModule) {
    const module = medicalModules.find(m => m.id === selectedModule);
    const questions = getQuizQuestions();
    
    return (
      <motion.div
        className="min-h-screen p-8"
        style={{ backgroundColor: 'var(--color-background)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.button
            onClick={() => setSelectedModule(null)}
            className="mb-6 px-4 py-2 rounded-lg border-2"
            style={{ 
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-background)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Retour aux modules
          </motion.button>
          
          {questions.length > 0 ? (
            <QuizComponent
              questions={questions}
              title={`Quiz ${module?.name} - ${selectedDifficulty === 'all' ? 'Tous niveaux' : selectedDifficulty}`}
              onComplete={handleQuizComplete}
            />
          ) : (
            <div className="text-center p-8">
              <p style={{ color: 'var(--color-textSecondary)' }}>
                Aucune question disponible pour ce niveau de difficulté.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Centre d'Apprentissage Médical {emojis.brain}
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--color-textSecondary)' }}>
            Apprenez en vous amusant avec nos quiz et jeux médicaux
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={() => setActiveTab('quiz')}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: activeTab === 'quiz' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeTab === 'quiz' ? 'white' : 'var(--color-text)',
                border: `2px solid ${activeTab === 'quiz' ? 'var(--color-primary)' : 'var(--color-border)'}`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="inline-block w-5 h-5 mr-2" />
              Quiz Médicaux
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('jeux')}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: activeTab === 'jeux' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeTab === 'jeux' ? 'white' : 'var(--color-text)',
                border: `2px solid ${activeTab === 'jeux' ? 'var(--color-primary)' : 'var(--color-border)'}`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Gamepad2 className="inline-block w-5 h-5 mr-2" />
              Jeux Médicaux
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <BookOpen className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {availableModules.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Modules disponibles
            </div>
          </div>
          
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Target className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {cardiologyQuiz.length + neurologyQuiz.length + anatomyQuiz.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Questions totales
            </div>
          </div>
          
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              15-30
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Minutes par quiz
            </div>
          </div>
          
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Trophy className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              3
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Niveaux de difficulté
            </div>
          </div>
        </motion.div>

        {/* Difficulty Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text)' }}>
            Niveau de difficulté :
          </h3>
          <div className="flex flex-wrap gap-3">
            {(['all', 'facile', 'moyen', 'difficile'] as const).map((difficulty) => (
              <motion.button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: selectedDifficulty === difficulty ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedDifficulty === difficulty ? 'white' : 'var(--color-text)',
                  border: `2px solid ${selectedDifficulty === difficulty ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {difficulty === 'all' ? 'Tous niveaux' : difficulty}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {availableModules.map((module, index) => {
            const questionsCount = getQuizByModule(module.id).filter(q => 
              selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
            ).length;
            
            return (
              <motion.div
                key={module.id}
                className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  borderColor: 'var(--color-primary)',
                  boxShadow: isFeminine 
                    ? '0 10px 25px -5px rgba(236, 72, 153, 0.2)'
                    : '0 10px 25px -5px rgba(15, 163, 177, 0.2)'
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedModule(module.id)}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{module.icon}</span>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {module.name}
                  </h3>
                </div>
                
                <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                  {module.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--color-textSecondary)' }}>Questions: </span>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {questionsCount}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-textSecondary)' }}>Difficulté: </span>
                    <span 
                      className="font-medium"
                      style={{ color: module.color }}
                    >
                      {module.difficulty}
                    </span>
                  </div>
                </div>
                
                <motion.div
                  className="mt-4 w-full py-2 text-center rounded-lg font-medium text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  whileHover={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Commencer le quiz {isFeminine ? '💕' : '🩺'}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AdvancedQuizPage;