import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Target, Zap, Crown, Shield, Sword,
  Star, TrendingUp, Users, Award, Gift, Lock,
  Unlock, ChevronUp, ChevronDown, Timer, Flame,
  Heart, Diamond, Gem, Coins, Map, Flag,
  BarChart3, Activity, BookOpen, Brain, Sparkles,
  Swords, UserPlus, Share2, MessageCircle, ThumbsUp
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  level: number;
  maxLevel: number;
  xpRequired: number;
  currentXp: number;
  unlocked: boolean;
  prerequisites: string[];
  category: 'anatomy' | 'physiology' | 'pathology' | 'pharmacology' | 'clinical';
}

interface League {
  id: string;
  name: string;
  icon: React.ElementType;
  minRating: number;
  maxRating: number;
  color: string;
  rewards: string[];
  playerCount: number;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  prize: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  xpReward: number;
  coinReward: number;
}

interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  rating: number;
  league: string;
  rank: number;
  coins: number;
  gems: number;
  streak: number;
  totalPoints: number;
}

export const AdvancedGamification: React.FC = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 42,
    xp: 8750,
    xpToNextLevel: 10000,
    rating: 2450,
    league: 'diamond',
    rank: 127,
    coins: 15420,
    gems: 234,
    streak: 15,
    totalPoints: 45680
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'leagues' | 'tournaments' | 'achievements'>('overview');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('anatomy');

  // Skill Tree Data
  const skillNodes: SkillNode[] = [
    {
      id: 'anatomy-basics',
      name: 'Anatomie de Base',
      description: 'Maîtrisez les fondamentaux de l\'anatomie humaine',
      icon: Heart,
      level: 3,
      maxLevel: 5,
      xpRequired: 1000,
      currentXp: 750,
      unlocked: true,
      prerequisites: [],
      category: 'anatomy'
    },
    {
      id: 'cardiovascular',
      name: 'Système Cardiovasculaire',
      description: 'Expertise approfondie du cœur et des vaisseaux',
      icon: Activity,
      level: 2,
      maxLevel: 5,
      xpRequired: 1500,
      currentXp: 500,
      unlocked: true,
      prerequisites: ['anatomy-basics'],
      category: 'anatomy'
    },
    {
      id: 'nervous-system',
      name: 'Système Nerveux',
      description: 'Compréhension complète du cerveau et des nerfs',
      icon: Brain,
      level: 1,
      maxLevel: 5,
      xpRequired: 2000,
      currentXp: 200,
      unlocked: false,
      prerequisites: ['anatomy-basics'],
      category: 'anatomy'
    }
  ];

  // Leagues Data
  const leagues: League[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      icon: Shield,
      minRating: 0,
      maxRating: 1000,
      color: 'bg-amber-600',
      rewards: ['100 pièces/semaine', 'Badge Bronze'],
      playerCount: 15420
    },
    {
      id: 'silver',
      name: 'Argent',
      icon: Medal,
      minRating: 1000,
      maxRating: 1500,
      color: 'bg-gray-400',
      rewards: ['250 pièces/semaine', 'Badge Argent', 'Bonus XP +10%'],
      playerCount: 8932
    },
    {
      id: 'gold',
      name: 'Or',
      icon: Crown,
      minRating: 1500,
      maxRating: 2000,
      color: 'bg-yellow-500',
      rewards: ['500 pièces/semaine', 'Badge Or', 'Bonus XP +25%'],
      playerCount: 3456
    },
    {
      id: 'diamond',
      name: 'Diamant',
      icon: Diamond,
      minRating: 2000,
      maxRating: 2500,
      color: 'bg-blue-500',
      rewards: ['1000 pièces/semaine', 'Badge Diamant', 'Bonus XP +50%', 'Contenu exclusif'],
      playerCount: 892
    },
    {
      id: 'master',
      name: 'Maître',
      icon: Trophy,
      minRating: 2500,
      maxRating: 9999,
      color: 'bg-purple-600',
      rewards: ['2500 pièces/semaine', 'Badge Maître', 'Bonus XP +100%', 'Titre spécial', 'NFT exclusif'],
      playerCount: 127
    }
  ];

  // Tournaments Data
  const tournaments: Tournament[] = [
    {
      id: '1',
      name: 'Championnat ECNi',
      description: 'Le plus grand tournoi mensuel pour les futurs médecins',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-07'),
      prize: '50,000 DZD + 1 an Premium',
      participants: 234,
      maxParticipants: 500,
      entryFee: 500,
      status: 'upcoming'
    },
    {
      id: '2',
      name: 'Sprint Anatomie',
      description: 'Quiz rapide sur l\'anatomie humaine',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      prize: '10,000 DZD',
      participants: 156,
      maxParticipants: 200,
      entryFee: 100,
      status: 'active'
    }
  ];

  // Achievements Data
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Première Victoire',
      description: 'Gagnez votre premier quiz',
      icon: Trophy,
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      xpReward: 100,
      coinReward: 50
    },
    {
      id: '2',
      name: 'Streak de Feu',
      description: 'Maintenez une série de 30 jours',
      icon: Flame,
      rarity: 'rare',
      progress: 15,
      maxProgress: 30,
      unlocked: false,
      xpReward: 500,
      coinReward: 250
    },
    {
      id: '3',
      name: 'Maître Anatomiste',
      description: 'Complétez tous les modules d\'anatomie',
      icon: Brain,
      rarity: 'epic',
      progress: 3,
      maxProgress: 10,
      unlocked: false,
      xpReward: 1000,
      coinReward: 500
    },
    {
      id: '4',
      name: 'Légende Médicale',
      description: 'Atteignez le niveau 100',
      icon: Crown,
      rarity: 'legendary',
      progress: 42,
      maxProgress: 100,
      unlocked: false,
      xpReward: 5000,
      coinReward: 2500
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100';
      case 'rare': return 'text-blue-500 bg-blue-100';
      case 'epic': return 'text-purple-500 bg-purple-100';
      case 'legendary': return 'text-amber-500 bg-amber-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const currentLeague = leagues.find(l => l.id === playerStats.league);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Centre de Gamification Dr.MiMi 🎮
              </h1>
              <p className="text-gray-300">
                Progressez, débloquez des récompenses et dominez les classements !
              </p>
            </div>

            {/* Player Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Niveau</p>
                <p className="text-2xl font-bold text-white">{playerStats.level}</p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm">Ligue</p>
                <div className="flex items-center justify-center mt-1">
                  {currentLeague && (
                    <>
                      <currentLeague.icon className="w-5 h-5 text-blue-400 mr-1" />
                      <p className="text-lg font-bold text-white">{currentLeague.name}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm">Série</p>
                <div className="flex items-center justify-center mt-1">
                  <Flame className="w-5 h-5 text-orange-500 mr-1" />
                  <p className="text-lg font-bold text-white">{playerStats.streak} jours</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-yellow-500/20 px-3 py-2 rounded-lg">
                  <Coins className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-white font-bold">{playerStats.coins.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center bg-purple-500/20 px-3 py-2 rounded-lg">
                  <Gem className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-white font-bold">{playerStats.gems}</span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>XP: {playerStats.xp.toLocaleString()}</span>
              <span>Niveau {playerStats.level + 1}: {playerStats.xpToNextLevel.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(playerStats.xp / playerStats.xpToNextLevel) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'skills', label: 'Arbre de compétences', icon: Brain },
              { id: 'leagues', label: 'Ligues', icon: Trophy },
              { id: 'tournaments', label: 'Tournois', icon: Swords },
              { id: 'achievements', label: 'Succès', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  selectedTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Quests */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Quêtes Quotidiennes
              </h2>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">Complétez 3 quiz</span>
                    <span className="text-yellow-400 text-sm font-bold">+100 XP</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '66%' }} />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">2/3</span>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">Étudiez 30 minutes</span>
                    <span className="text-yellow-400 text-sm font-bold">+150 XP</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '40%' }} />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">12/30 min</span>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">Gagnez un duel</span>
                    <span className="text-yellow-400 text-sm font-bold">+200 XP</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '0%' }} />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">0/1</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition">
                Réclamer les récompenses
              </button>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Classement Hebdomadaire
              </h2>

              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Sarah M.', points: 8920, change: 'up' },
                  { rank: 2, name: 'Ahmed B.', points: 8750, change: 'up' },
                  { rank: 3, name: 'Marie L.', points: 8600, change: 'down' },
                  { rank: 127, name: 'Vous', points: playerStats.totalPoints, change: 'up', isPlayer: true }
                ].map(player => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      player.isPlayer ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg font-bold ${
                        player.rank === 1 ? 'text-yellow-500' :
                        player.rank === 2 ? 'text-gray-400' :
                        player.rank === 3 ? 'text-amber-600' :
                        'text-white'
                      }`}>
                        #{player.rank}
                      </span>
                      <span className="text-white">{player.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold">{player.points.toLocaleString()}</span>
                      {player.change === 'up' ? (
                        <ChevronUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition">
                Voir le classement complet
              </button>
            </div>

            {/* Next Tournament */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Swords className="w-5 h-5 mr-2" />
                Prochain Tournoi
              </h2>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">
                  {tournaments[0].name}
                </h3>
                <p className="text-gray-300 text-sm">
                  {tournaments[0].description}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Début dans:</span>
                  <span className="text-white font-bold">
                    {differenceInDays(tournaments[0].startDate, new Date())} jours
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Prix:</span>
                  <span className="text-yellow-400 font-bold">{tournaments[0].prize}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Participants:</span>
                  <span className="text-white">
                    {tournaments[0].participants}/{tournaments[0].maxParticipants}
                  </span>
                </div>
              </div>

              <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-bold hover:opacity-90 transition">
                S'inscrire ({tournaments[0].entryFee} pièces)
              </button>
            </div>
          </div>
        )}

        {/* Skills Tree Tab */}
        {selectedTab === 'skills' && (
          <div>
            {/* Category Selector */}
            <div className="flex space-x-2 mb-6">
              {['anatomy', 'physiology', 'pathology', 'pharmacology', 'clinical'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedSkillCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                    selectedSkillCategory === category
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {category === 'anatomy' ? 'Anatomie' :
                   category === 'physiology' ? 'Physiologie' :
                   category === 'pathology' ? 'Pathologie' :
                   category === 'pharmacology' ? 'Pharmacologie' :
                   'Clinique'}
                </button>
              ))}
            </div>

            {/* Skill Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillNodes.filter(node => node.category === selectedSkillCategory).map(node => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 ${
                    node.unlocked 
                      ? 'border-blue-500/50 hover:border-blue-500' 
                      : 'border-gray-600/50 opacity-75'
                  } transition cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      node.unlocked ? 'bg-blue-500/20' : 'bg-gray-700/50'
                    }`}>
                      <node.icon className={`w-6 h-6 ${
                        node.unlocked ? 'text-blue-400' : 'text-gray-500'
                      }`} />
                    </div>
                    {node.unlocked ? (
                      <Unlock className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  <h3 className="text-white font-bold mb-2">{node.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{node.description}</p>

                  {/* Level Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Niveau {node.level}/{node.maxLevel}</span>
                      <span className="text-blue-400">{node.currentXp}/{node.xpRequired} XP</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(node.currentXp / node.xpRequired) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stars for levels */}
                  <div className="flex space-x-1">
                    {Array.from({ length: node.maxLevel }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < node.level 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  {!node.unlocked && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400">
                        Prérequis: {node.prerequisites.join(', ')}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Leagues Tab */}
        {selectedTab === 'leagues' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {leagues.map((league, idx) => (
              <motion.div
                key={league.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 ${
                  league.id === playerStats.league 
                    ? 'ring-2 ring-blue-500 bg-blue-500/10' 
                    : ''
                }`}
              >
                <div className={`w-16 h-16 ${league.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <league.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {league.name}
                </h3>

                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm">Rating requis</p>
                  <p className="text-white font-bold">
                    {league.minRating} - {league.maxRating}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-400 text-xs">Récompenses:</p>
                  {league.rewards.map(reward => (
                    <div key={reward} className="flex items-start">
                      <Sparkles className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-white text-xs">{reward}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-700 text-center">
                  <p className="text-gray-400 text-xs">
                    {league.playerCount.toLocaleString()} joueurs
                  </p>
                </div>

                {league.id === playerStats.league && (
                  <div className="mt-4 px-3 py-1 bg-blue-500/20 rounded-lg text-center">
                    <span className="text-blue-400 text-sm font-bold">Votre ligue</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Tournaments Tab */}
        {selectedTab === 'tournaments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournaments.map((tournament, idx) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 ${
                  tournament.status === 'active' 
                    ? 'border-2 border-green-500/50' 
                    : ''
                }`}
              >
                {tournament.status === 'active' && (
                  <div className="flex items-center justify-center mb-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full flex items-center">
                      <Activity className="w-4 h-4 mr-2 animate-pulse" />
                      EN COURS
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">
                  {tournament.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {tournament.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">Dates</p>
                    <p className="text-white text-sm">
                      {format(tournament.startDate, 'dd MMM', { locale: fr })} - 
                      {format(tournament.endDate, 'dd MMM', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Prix</p>
                    <p className="text-yellow-400 font-bold text-sm">{tournament.prize}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Participants</p>
                    <p className="text-white text-sm">
                      {tournament.participants}/{tournament.maxParticipants}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Frais d'entrée</p>
                    <p className="text-white text-sm">{tournament.entryFee} pièces</p>
                  </div>
                </div>

                <button className={`w-full py-2 rounded-lg font-bold transition ${
                  tournament.status === 'active'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : tournament.status === 'upcoming'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}>
                  {tournament.status === 'active' ? 'Rejoindre maintenant' :
                   tournament.status === 'upcoming' ? 'S\'inscrire' :
                   'Terminé'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 ${
                  achievement.unlocked 
                    ? 'border-2 border-green-500/50' 
                    : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                    <achievement.icon className="w-6 h-6" />
                  </div>
                  {achievement.unlocked && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <h3 className="text-white font-bold mb-2">{achievement.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{achievement.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-white text-sm">+{achievement.xpReward} XP</span>
                    </div>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-white text-sm">+{achievement.coinReward}</span>
                    </div>
                  </div>
                </div>

                {/* Rarity Badge */}
                <div className="mt-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold capitalize ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};