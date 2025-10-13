import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Star, Trophy, Heart, Brain, Sparkles } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext';
import { CelebrationEffect } from './Confetti';
import { AvatarDrMimi, AvatarDrMimiGallery, type AvatarPose } from './AvatarDrMimi';

interface StudyLevel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  unlocked: boolean;
  progress: number;
}

interface StudyLevelSelectorProps {
  onLevelSelect: (level: string) => void;
  currentLevel?: string;
}

export const StudyLevelSelector: React.FC<StudyLevelSelectorProps> = ({ onLevelSelect, currentLevel }) => {
  // const { t } = useLanguage(); // Not used
  const [selectedLevel, setSelectedLevel] = useState<string | null>(currentLevel || null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<{ text: string; visible: boolean; color: string; gradient: string }>({ 
    text: '', 
    visible: false, 
    color: '#FFB6C1',
    gradient: 'linear-gradient(135deg, #FFB6C1, #FF69B4)'
  });
  
  // Fonction pour obtenir des avatars fixes selon le jour de l'année
  const getFixedAvatars = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const setIndex = dayOfYear % 3;
    
    const avatarSets: string[][] = [
      ['greeting', 'reading', 'stethoscope'],
      ['idea', 'laptop', 'writing'],
      ['thinking', 'smiling', 'pointing']
    ];
    
    return avatarSets[setIndex];
  };
  
  const fixedAvatars = getFixedAvatars();

  const studyLevels: StudyLevel[] = [
    {
      id: 'PACES',
      name: 'PACES',
      description: 'Première année commune aux études de santé',
      icon: <Heart className="w-8 h-8" />,
      color: '#FFB6C1',
      gradient: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
      unlocked: true,
      progress: 100
    },
    {
      id: 'DFGSM2',
      name: 'DFGSM 2',
      description: 'Diplôme de Formation Générale en Sciences Médicales - 2ème année',
      icon: <Brain className="w-8 h-8" />,
      color: '#DDA0DD',
      gradient: 'linear-gradient(135deg, #DDA0DD, #BA55D3)',
      unlocked: true,
      progress: 85
    },
    {
      id: 'DFGSM3',
      name: 'DFGSM 3',
      description: 'Diplôme de Formation Générale en Sciences Médicales - 3ème année',
      icon: <GraduationCap className="w-8 h-8" />,
      color: '#98FB98',
      gradient: 'linear-gradient(135deg, #98FB98, #90EE90)',
      unlocked: true,
      progress: 70
    },
    {
      id: 'DFASM1',
      name: 'DFASM 1',
      description: 'Diplôme de Formation Approfondie en Sciences Médicales - 1ère année',
      icon: <Star className="w-8 h-8" />,
      color: '#F0E68C',
      gradient: 'linear-gradient(135deg, #F0E68C, #FFD700)',
      unlocked: true,
      progress: 60
    },
    {
      id: 'DFASM2',
      name: 'DFASM 2',
      description: 'Diplôme de Formation Approfondie en Sciences Médicales - 2ème année',
      icon: <Trophy className="w-8 h-8" />,
      color: '#87CEEB',
      gradient: 'linear-gradient(135deg, #87CEEB, #4682B4)',
      unlocked: true,
      progress: 45
    },
    {
      id: 'DFASM3',
      name: 'DFASM 3',
      description: 'Diplôme de Formation Approfondie en Sciences Médicales - 3ème année',
      icon: <Sparkles className="w-8 h-8" />,
      color: '#FFE4B5',
      gradient: 'linear-gradient(135deg, #FFE4B5, #FFA500)',
      unlocked: true,
      progress: 30
    }
  ];

  const handleLevelClick = (level: StudyLevel) => {
    if (level.unlocked) {
      setSelectedLevel(level.id);
      onLevelSelect(level.id);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 100);
      
      // Afficher un message inline au lieu d'un sticker flottant
      const messages = [
        `Excellent choix ! ${level.name} 🎯`,
        `C'est parti pour ${level.name} ! 💪`,
        `${level.name} sélectionné avec succès ! ✨`,
        `Prêt(e) pour ${level.name} ! 🚀`
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      setInlineMessage({ 
        text: randomMessage, 
        visible: true,
        color: level.color,
        gradient: level.gradient
      });
    }
  };

  // Auto-dismiss du message après 4 secondes
  useEffect(() => {
    if (inlineMessage.visible) {
      const timer = setTimeout(() => {
        setInlineMessage(prev => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [inlineMessage.visible]);

  return (
    <>
      <CelebrationEffect trigger={showCelebration} />
      
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-4 gap-6">
            {/* Affichage des 3 avatars fixes du jour */}
            {fixedAvatars.map((pose, index) => (
              <motion.div
                key={pose}
                className="avatar-transition"
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 1, // 1000ms
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1] // cubic-bezier(0.22, 1, 0.36, 1)
                }}
              >
                <AvatarDrMimi 
                  pose={pose as AvatarPose} 
                  size="medium" 
                  animated={true}
                />
              </motion.div>
            ))}
          </div>
          <h2 className="text-4xl font-magic mb-3" 
              style={{ 
                background: 'var(--gradient-magic)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            Choisis ton niveau d'étude ✨
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            Sélectionne ton année pour accéder au contenu adapté
          </p>
        </motion.div>

        {/* Message inline non-flottant - Option A préférée */}
        <AnimatePresence>
          {inlineMessage.visible && (
            <motion.div
              className="max-w-xl mx-auto mb-8"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ 
                duration: 1, // 1000ms pour l'animation de message
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <div
                className="px-6 py-4 rounded-xl shadow-lg text-center font-medium backdrop-blur-sm"
                style={{
                  background: inlineMessage.gradient,
                  color: 'white',
                  boxShadow: `0 10px 30px ${inlineMessage.color}40`,
                  willChange: 'transform, opacity',
                  contain: 'layout style paint'
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {inlineMessage.text}
                </motion.div>
                <motion.div
                  className="h-1 bg-white/30 rounded-full mt-3 overflow-hidden"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 4, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {studyLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, scale: 0.8, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 1, // 1000ms
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ scale: 1.05, rotateY: 10 }}
              className="relative"
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <div
                className={`
                  relative overflow-hidden rounded-2xl p-6 cursor-pointer
                  transition-all duration-300 card-3d
                  ${selectedLevel === level.id ? 'ring-4 ring-offset-2 glow' : ''}
                  ${level.unlocked ? 'glass hover:glow-hover' : 'opacity-50'}
                `}
                style={{
                  background: level.unlocked ? level.gradient : '#gray',
                  boxShadow: selectedLevel === level.id 
                    ? `0 10px 40px ${level.color}66`
                    : '0 4px 20px rgba(0,0,0,0.1)',
                  transform: hoveredLevel === level.id ? 'translateZ(20px)' : 'translateZ(0)'
                }}
                onClick={() => handleLevelClick(level)}
              >
                {/* Floating particles for hovered card */}
                {hoveredLevel === level.id && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-white/30"
                        initial={{ 
                          x: Math.random() * 200,
                          y: 200
                        }}
                        animate={{ 
                          y: -20,
                          x: Math.random() * 200
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Icon with animation */}
                <motion.div 
                  className="text-white mb-4"
                  animate={hoveredLevel === level.id ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {level.icon}
                </motion.div>

                {/* Level name */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {level.name}
                </h3>

                {/* Description */}
                <p className="text-white/90 text-sm mb-4">
                  {level.description}
                </p>

                {/* Progress bar */}
                <div className="relative">
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-white/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${level.progress}%` }}
                      transition={{ 
                        duration: 1, // 1000ms
                        delay: index * 0.1 + 0.5,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/80 mt-1">
                    {level.progress}% complété
                  </span>
                </div>

                {/* Lock indicator for locked levels */}
                {!level.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="text-sm">Niveau verrouillé</p>
                    </div>
                  </div>
                )}

                {/* Selected indicator */}
                {selectedLevel === level.id && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <div className="bg-white text-green-500 rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Floating badge for completed levels */}
              {level.progress === 100 && (
                <motion.div
                  className="absolute -top-2 -right-2 badge-animated"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                >
                  <div className="bg-yellow-400 text-yellow-900 rounded-full p-2 shadow-lg">
                    <Trophy className="w-5 h-5" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick navigation for selected level */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10 text-center"
            >
              <p className="text-lg mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                Niveau sélectionné: <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {studyLevels.find(l => l.id === selectedLevel)?.name}
                </span>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full text-white font-semibold shadow-lg glow-hover"
                style={{ 
                  background: 'var(--gradient-magic)',
                }}
                onClick={() => onLevelSelect(selectedLevel)}
              >
                Continuer avec ce niveau →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Showcase des avatars Dr. Mimi */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setShowAvatarGallery(!showAvatarGallery)}
            className="text-sm px-4 py-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            {showAvatarGallery ? '▲ Masquer' : '▼ Voir tous les avatars Dr. Mimi'}
          </button>
          
          <AnimatePresence>
            {showAvatarGallery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 rounded-xl"
                style={{ background: 'var(--gradient-soft)' }}
              >
                <h3 className="text-2xl font-bold mb-4"
                    style={{ 
                      background: 'var(--gradient-magic)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                  Collection complète des avatars Dr. Mimi 🎆
                </h3>
                <AvatarDrMimiGallery size="medium" animated={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};