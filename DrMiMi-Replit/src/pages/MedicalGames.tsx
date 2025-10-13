import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Heart,
  Pill,
  AlertCircle,
  FlaskConical,
  Microscope,
  Trophy,
  Timer,
  Target,
  Sparkles,
  Lock,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  {
    id: 'formule_chimique',
    title: 'Formule Chimique Builder',
    titleEn: 'Chemical Formula Builder',
    titleAr: 'بناء الصيغ الكيميائية',
    description: 'Construisez les formules des médicaments',
    descriptionEn: 'Build drug formulas',
    descriptionAr: 'ابنِ صيغ الأدوية',
    icon: FlaskConical,
    color: '#A8E6CF',
    bgGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    difficulty: 'moyen',
    xpReward: 120,
    timeLimit: 240,
    unlocked: false,
    requiredLevel: 5,
    path: '/games/formule-chimique',
  },
  {
    id: 'cytologie_slider',
    title: 'Cytologie Slider Puzzle',
    titleEn: 'Cytology Slider Puzzle',
    titleAr: 'لغز شرائح الخلايا',
    description: 'Reconstituez les images de cellules',
    descriptionEn: 'Reconstruct cell images',
    descriptionAr: 'أعد بناء صور الخلايا',
    icon: Microscope,
    color: '#FFB7C5',
    bgGradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    difficulty: 'moyen',
    xpReward: 100,
    timeLimit: 150,
    unlocked: false,
    requiredLevel: 3,
    path: '/games/cytologie-slider',
  },
];

interface PlayerStats {
  totalXp: number;
  level: number;
  gamesPlayed: number;
  achievements: number;
  streak: number;
}

export function MedicalGamesPage() {
  const { isFeminine } = useTheme();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalXp: 0,
    level: 1,
    gamesPlayed: 0,
    achievements: 0,
    streak: 0,
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetchPlayerStats();
    fetchLeaderboard();
  }, []);

  const fetchPlayerStats = async () => {
    try {
      const response = await fetch('/api/games/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPlayerStats({
          totalXp: data.stats?.totalScore || 0,
          level: Math.floor((data.stats?.totalScore || 0) / 1000) + 1,
          gamesPlayed: data.stats?.totalGames || 0,
          achievements: data.achievementCount || 0,
          streak: data.streak || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/games/leaderboard?period=weekly', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleGameClick = (game: any) => {
    if (game.unlocked || playerStats.level >= (game.requiredLevel || 0)) {
      navigate(game.path);
    } else {
      setSelectedGame(game.id);
      setTimeout(() => setSelectedGame(null), 2000);
    }
  };

  const getGameTitle = (game: any) => {
    if (locale === 'en') return game.titleEn || game.title;
    if (locale === 'ar') return game.titleAr || game.title;
    return game.title;
  };

  const getGameDescription = (game: any) => {
    if (locale === 'en') return game.descriptionEn || game.description;
    if (locale === 'ar') return game.descriptionAr || game.description;
    return game.description;
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with stats */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Jeux Médicaux Éducatifs {isFeminine ? '🎮💕' : '🎮'}
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
                Apprenez en vous amusant avec nos puzzles médicaux interactifs
              </p>
            </div>
            
            <motion.button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="mt-4 md:mt-0 px-6 py-3 rounded-xl font-medium flex items-center gap-2"
              style={{
                background: 'var(--gradient-magic)',
                color: 'white',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy size={20} />
              Classement
            </motion.button>
          </div>

          {/* Player stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={<Star />}
              label="Niveau"
              value={playerStats.level}
              color="#FFD700"
            />
            <StatCard
              icon={<TrendingUp />}
              label="XP Total"
              value={`${playerStats.totalXp}`}
              color="#4ECDC4"
            />
            <StatCard
              icon={<Target />}
              label="Parties jouées"
              value={playerStats.gamesPlayed}
              color="#95E77E"
            />
            <StatCard
              icon={<Trophy />}
              label="Succès"
              value={playerStats.achievements}
              color="#FF6B6B"
            />
            <StatCard
              icon={<Timer />}
              label="Série"
              value={`${playerStats.streak} jours`}
              color="#A8E6CF"
            />
          </div>
        </motion.div>

        {/* Games grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {games.map((game, index) => {
            const isLocked = !game.unlocked && playerStats.level < (game.requiredLevel || 0);
            const Icon = game.icon;

            return (
              <motion.div
                key={game.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: isLocked ? 'rgba(128, 128, 128, 0.3)' : game.bgGradient,
                  opacity: isLocked ? 0.7 : 1,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLocked ? 0.7 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={!isLocked ? {
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                onClick={() => handleGameClick(game)}
              >
                {/* Lock overlay */}
                {isLocked && (
                  <motion.div
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedGame === game.id ? 1 : 0.5 }}
                  >
                    <div className="text-center text-white">
                      <Lock size={48} className="mx-auto mb-2" />
                      <p className="font-bold">Niveau {game.requiredLevel} requis</p>
                      {selectedGame === game.id && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm"
                        >
                          Continuez à jouer pour débloquer !
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Game content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      animate={{ rotate: isLocked ? 0 : [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Icon size={32} color="white" />
                    </motion.div>
                    
                    {!isLocked && (
                      <motion.div
                        className="flex items-center gap-1 px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      >
                        <Sparkles size={16} color="white" />
                        <span className="text-white font-medium text-sm">
                          +{game.xpReward} XP
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {getGameTitle(game)}
                  </h3>
                  
                  <p className="text-white/90 text-sm mb-4">
                    {getGameDescription(game)}
                  </p>

                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <Timer size={14} />
                      {Math.floor(game.timeLimit / 60)} min
                    </span>
                    <span className="px-2 py-1 rounded-full capitalize"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      {game.difficulty}
                    </span>
                  </div>
                </div>

                {/* New badge */}
                {game.id === 'anatomie_puzzle' && (
                  <motion.div
                    className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white font-bold text-xs"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    NOUVEAU
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Leaderboard Modal */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
            >
              <motion.div
                className="w-full max-w-md p-6 rounded-2xl"
                style={{ backgroundColor: 'var(--color-surface)' }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                  🏆 Classement Hebdomadaire
                </h2>
                
                <div className="space-y-2">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-background)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="font-bold text-lg"
                            style={{ color: index < 3 ? '#FFD700' : 'var(--color-text)' }}
                          >
                            #{index + 1}
                          </span>
                          <span style={{ color: 'var(--color-text)' }}>
                            Joueur {player.userId.slice(0, 8)}
                          </span>
                        </div>
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          {player.score} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8" style={{ color: 'var(--color-textSecondary)' }}>
                      Aucun score cette semaine. Soyez le premier !
                    </p>
                  )}
                </div>

                <motion.button
                  onClick={() => setShowLeaderboard(false)}
                  className="w-full mt-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Fermer
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Stat card component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => {
  return (
    <motion.div
      className="p-4 rounded-xl flex items-center gap-3"
      style={{ backgroundColor: 'var(--color-surface)' }}
      whileHover={{ scale: 1.05 }}
    >
      <div style={{ color }}>{icon}</div>
      <div>
        <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
          {label}
        </p>
        <p className="font-bold" style={{ color: 'var(--color-text)' }}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default MedicalGamesPage;