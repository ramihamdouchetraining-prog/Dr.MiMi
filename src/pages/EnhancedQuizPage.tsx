import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, Clock, Trophy, Target, Brain, Heart, Pill, AlertCircle,
  FlaskConical, Microscope, Timer, Users, TrendingUp, Star, Lock,
  Gamepad2, ArrowLeft, ChevronRight, Zap, Award, Shield, Flame,
  Download, Share2, Filter, Search, Play, Pause, Volume2, VolumeX,
  CheckCircle, XCircle, RotateCw, PlusCircle, MinusCircle, Settings
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { QuizComponent } from '../components/QuizComponent';
import { medicalModules, getQuizByModule } from '../data/medicalContent';

// Import game components
import AnatomiePuzzle from '../components/games/AnatomiePuzzle';
import DiagnosticDetective from '../components/games/DiagnosticDetective';
import MedicamentMatch from '../components/games/MedicamentMatch';
import UrgenceChrono from '../components/games/UrgenceChrono';

// Enhanced Quiz Types
const quizTypes = [
  { id: 'qcm', name: 'QCM Classique', icon: CheckCircle, color: 'from-blue-500 to-cyan-500', description: 'Questions à choix multiples traditionnelles' },
  { id: 'cas-clinique', name: 'Cas Cliniques', icon: Heart, color: 'from-red-500 to-pink-500', description: 'Résolvez des cas médicaux réalistes' },
  { id: 'image', name: 'Quiz Images', icon: Microscope, color: 'from-purple-500 to-indigo-500', description: 'Identifiez structures et pathologies' },
  { id: 'flashcards', name: 'Flashcards', icon: Zap, color: 'from-yellow-500 to-orange-500', description: 'Révision rapide avec cartes' },
  { id: 'vrai-faux', name: 'Vrai ou Faux', icon: Target, color: 'from-green-500 to-teal-500', description: 'Testez vos connaissances rapidement' },
  { id: 'progression', name: 'Quiz Progressif', icon: TrendingUp, color: 'from-indigo-500 to-purple-500', description: 'Difficulté adaptative selon vos réponses' }
];

// Enhanced Games
const enhancedGames = [
  {
    id: 'anatomie_puzzle_3d',
    title: 'Puzzle Anatomique 3D',
    description: 'Assemblez le corps humain en 3D avec rotation et zoom',
    icon: Brain,
    color: 'from-purple-600 to-pink-600',
    difficulty: 'moyen',
    xpReward: 150,
    timeLimit: 300,
    players: '1-4',
    unlocked: true,
    new: true
  },
  {
    id: 'chirurgie_simulator',
    title: 'Simulateur de Chirurgie',
    description: 'Pratiquez des procédures chirurgicales virtuelles',
    icon: FlaskConical,
    color: 'from-red-500 to-orange-500',
    difficulty: 'expert',
    xpReward: 300,
    timeLimit: 600,
    players: '1',
    unlocked: true,
    premium: true
  },
  {
    id: 'battle_royale_medical',
    title: 'Battle Royale Médical',
    description: 'Affrontez d\'autres étudiants en temps réel',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-500',
    difficulty: 'tous',
    xpReward: 500,
    timeLimit: null,
    players: '2-100',
    unlocked: true,
    hot: true
  },
  {
    id: 'escape_room_hopital',
    title: 'Escape Room Hôpital',
    description: 'Échappez-vous en résolvant des énigmes médicales',
    icon: Lock,
    color: 'from-gray-600 to-gray-800',
    difficulty: 'difficile',
    xpReward: 250,
    timeLimit: 1800,
    players: '1-6',
    unlocked: true
  },
  {
    id: 'pharmacologie_tower_defense',
    title: 'Défense Pharmacologique',
    description: 'Défendez l\'organisme avec les bons médicaments',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    difficulty: 'moyen',
    xpReward: 200,
    timeLimit: null,
    players: '1',
    unlocked: true
  },
  {
    id: 'memory_medical',
    title: 'Memory Médical',
    description: 'Trouvez les paires d\'organes et de fonctions',
    icon: Brain,
    color: 'from-blue-500 to-indigo-500',
    difficulty: 'facile',
    xpReward: 100,
    timeLimit: 180,
    players: '1-2',
    unlocked: true
  }
];

// Composant principal amélioré
export function EnhancedQuizPage() {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // États
  const [activeTab, setActiveTab] = useState<'quiz' | 'jeux'>('quiz');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedQuizType, setSelectedQuizType] = useState<string>('qcm');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 245,
    averageScore: 78,
    streak: 12,
    rank: 'Expert',
    xp: 12450,
    level: 23
  });

  // Vérifier les paramètres URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'jeux') {
      setActiveTab('jeux');
    }
  }, [searchParams]);

  const availableModules = medicalModules.filter(module => module.quizCount > 0);

  // Filtrer les jeux
  const filteredGames = enhancedGames.filter(game => {
    if (searchTerm) {
      return game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             game.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (selectedDifficulty !== 'all') {
      return game.difficulty === selectedDifficulty || game.difficulty === 'tous';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header amélioré */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Centre d'Apprentissage Interactif
              </h1>
            </div>
            
            {/* Statistiques rapides */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">{userStats.rank}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">{userStats.streak} jours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">Niveau {userStats.level}</span>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium">
                {userStats.xp.toLocaleString()} XP
              </div>
            </div>
            
            {/* Contrôles */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation par onglets améliorée */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`relative px-6 py-4 font-medium transition-all ${
                  activeTab === 'quiz'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Quiz & Évaluations</span>
                  <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    {availableModules.length} modules
                  </span>
                </div>
                {activeTab === 'quiz' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={false}
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('jeux')}
                className={`relative px-6 py-4 font-medium transition-all ${
                  activeTab === 'jeux'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5" />
                  <span>Jeux Éducatifs</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full animate-pulse">
                    NOUVEAU
                  </span>
                </div>
                {activeTab === 'jeux' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={false}
                  />
                )}
              </button>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder={activeTab === 'quiz' ? 'Rechercher un quiz...' : 'Rechercher un jeu...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'quiz' ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filtres et statistiques */}
              <div className="mb-8 flex flex-col lg:flex-row gap-6">
                {/* Carte de progression */}
                <div className="lg:w-1/3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl"
                  >
                    <h3 className="text-xl font-bold mb-4">Votre Progression</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Quiz complétés</span>
                          <span>{userStats.totalQuizzes}/500</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-2">
                          <div className="bg-white rounded-full h-2" style={{ width: `${(userStats.totalQuizzes/500)*100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score moyen</span>
                          <span>{userStats.averageScore}%</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-2">
                          <div className="bg-green-400 rounded-full h-2" style={{ width: `${userStats.averageScore}%` }} />
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/20">
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                          Voir statistiques détaillées
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Sélection de type de quiz */}
                <div className="lg:w-2/3">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Types de Quiz</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedQuizType(type.id)}
                        className={`relative p-4 rounded-xl transition-all ${
                          selectedQuizType === type.id
                            ? 'bg-gradient-to-br ' + type.color + ' text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 hover:shadow-md'
                        }`}
                      >
                        <type.icon className={`w-8 h-8 mb-2 ${
                          selectedQuizType === type.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        <h4 className={`font-semibold ${
                          selectedQuizType === type.id ? 'text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          {type.name}
                        </h4>
                        <p className={`text-xs mt-1 ${
                          selectedQuizType === type.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {type.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Filtres de difficulté */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulté:</span>
                  <div className="flex space-x-2">
                    {['all', 'facile', 'moyen', 'difficile', 'expert'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedDifficulty === level
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {level === 'all' ? 'Tous' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                  <PlusCircle className="w-4 h-4 inline mr-2" />
                  Créer un Quiz
                </button>
              </div>
              
              {/* Liste des modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableModules.map((module) => (
                  <motion.div
                    key={module.id}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <module.icon className="w-10 h-10 text-gray-700 dark:text-gray-300" />
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                            {module.quizCount} quiz
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {module.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {module.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < module.difficulty 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="jeux"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Section Jeux améliorée */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">🎮 Défi du Jour</h2>
                      <p className="text-white/90">
                        Complétez le défi quotidien pour gagner des récompenses bonus!
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">500 XP</div>
                      <div className="text-sm">+ Badge Exclusif</div>
                    </div>
                  </div>
                  <button className="mt-4 px-6 py-3 bg-white text-orange-500 rounded-lg font-bold hover:bg-orange-50 transition-colors">
                    Commencer le Défi
                  </button>
                </div>
              </div>
              
              {/* Catégories de jeux */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Jeux Disponibles
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
                      Solo
                    </button>
                    <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                      Multijoueur
                    </button>
                    <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
                      Coopératif
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Grille de jeux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.03 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedGame(game.id)}
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      {game.new && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                          NOUVEAU
                        </span>
                      )}
                      {game.hot && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                          HOT 🔥
                        </span>
                      )}
                      {game.premium && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs rounded-full font-bold">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    
                    {/* Header avec gradient */}
                    <div className={`h-32 bg-gradient-to-br ${game.color} p-6 flex items-center justify-center`}>
                      <game.icon className="w-16 h-16 text-white" />
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {game.description}
                      </p>
                      
                      {/* Infos du jeu */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <Users className="w-4 h-4 mr-1" />
                            {game.players}
                          </span>
                          {game.timeLimit && (
                            <span className="flex items-center text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {Math.floor(game.timeLimit / 60)}min
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          game.difficulty === 'facile' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          game.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          game.difficulty === 'difficile' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          game.difficulty === 'expert' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {game.difficulty}
                        </span>
                      </div>
                      
                      {/* Récompenses */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            +{game.xpReward} XP
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Lancer le jeu
                          }}
                        >
                          <Play className="w-4 h-4 inline mr-1" />
                          Jouer
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Classement */}
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    🏆 Classement Hebdomadaire
                  </h3>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    Voir tout →
                  </button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Sarah B.', xp: 3450, avatar: '👩‍⚕️', medal: '🥇' },
                    { rank: 2, name: 'Ahmed R.', xp: 3200, avatar: '👨‍⚕️', medal: '🥈' },
                    { rank: 3, name: 'Fatima Z.', xp: 2980, avatar: '👩‍⚕️', medal: '🥉' },
                    { rank: 4, name: 'Vous', xp: 2750, avatar: '😊', medal: '', highlight: true },
                    { rank: 5, name: 'Karim M.', xp: 2600, avatar: '👨‍⚕️', medal: '' },
                  ].map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.highlight 
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700' 
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{player.medal || player.rank}</div>
                        <div className="text-2xl">{player.avatar}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {player.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {player.xp.toLocaleString()} XP
                          </div>
                        </div>
                      </div>
                      {player.highlight && (
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          C'est vous!
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default EnhancedQuizPage;