import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Heart,
  Timer,
  Trophy,
  RotateCcw,
  Check,
  X,
  Info,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Organ data with positions on the body
const organs = [
  {
    id: 'heart',
    name: 'Cœur',
    nameEn: 'Heart',
    nameAr: 'قلب',
    icon: '❤️',
    image: '/images/organs/heart.png',
    correctX: 50, // percentage
    correctY: 35,
    width: 80,
    height: 100,
    info: 'Pompe le sang dans tout le corps',
  },
  {
    id: 'brain',
    name: 'Cerveau',
    nameEn: 'Brain',
    nameAr: 'دماغ',
    icon: '🧠',
    image: '/images/organs/brain.png',
    correctX: 50,
    correctY: 10,
    width: 100,
    height: 80,
    info: 'Centre de contrôle du corps',
  },
  {
    id: 'lungs',
    name: 'Poumons',
    nameEn: 'Lungs',
    nameAr: 'رئتان',
    icon: '🫁',
    image: '/images/organs/lungs.png',
    correctX: 50,
    correctY: 32,
    width: 120,
    height: 120,
    info: 'Permettent la respiration',
  },
  {
    id: 'stomach',
    name: 'Estomac',
    nameEn: 'Stomach',
    nameAr: 'معدة',
    icon: '🌮',
    image: '/images/organs/stomach.png',
    correctX: 45,
    correctY: 45,
    width: 70,
    height: 80,
    info: 'Digère les aliments',
  },
  {
    id: 'liver',
    name: 'Foie',
    nameEn: 'Liver',
    nameAr: 'كبد',
    icon: '🟫',
    image: '/images/organs/liver.png',
    correctX: 55,
    correctY: 42,
    width: 90,
    height: 70,
    info: 'Filtre le sang et produit la bile',
  },
  {
    id: 'kidneys',
    name: 'Reins',
    nameEn: 'Kidneys',
    nameAr: 'كليتان',
    icon: '🫘',
    image: '/images/organs/kidneys.png',
    correctX: 50,
    correctY: 52,
    width: 100,
    height: 60,
    info: 'Filtrent le sang et produisent l\'urine',
  },
  {
    id: 'intestines',
    name: 'Intestins',
    nameEn: 'Intestines',
    nameAr: 'أمعاء',
    icon: '🔄',
    image: '/images/organs/intestines.png',
    correctX: 50,
    correctY: 58,
    width: 100,
    height: 100,
    info: 'Absorbent les nutriments',
  },
];

interface DraggableOrganProps {
  organ: any;
  onDrop: (organ: any, x: number, y: number) => void;
  isPlaced: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DraggableOrgan: React.FC<DraggableOrganProps> = ({ organ, onDrop, isPlaced, containerRef }) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <motion.div
      className="absolute cursor-move select-none"
      style={{
        width: organ.width,
        height: organ.height,
        touchAction: 'none',
      }}
      drag={!isPlaced}
      dragControls={dragControls}
      dragElastic={0.1}
      dragConstraints={containerRef}
      whileDrag={{ 
        scale: 1.15, 
        zIndex: 1000,
        opacity: 0.9,
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = ((info.point.x - rect.left) / rect.width) * 100;
          const y = ((info.point.y - rect.top) / rect.height) * 100;
          onDrop(organ, x, y);
        }
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: isPlaced ? 1.1 : 1,
        rotate: 0,
        filter: isPlaced 
          ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6)) brightness(1.1)' 
          : isDragging 
          ? 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.5))' 
          : 'none',
      }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
    >
      <div
        className="w-full h-full rounded-xl flex flex-col items-center justify-center p-2 overflow-hidden"
        style={{
          background: isPlaced
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
            : isDragging
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
          border: isPlaced 
            ? '2px solid rgba(16, 185, 129, 0.8)'
            : isDragging
            ? '2px solid rgba(139, 92, 246, 0.8)'
            : '2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: isDragging
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : isPlaced
            ? '0 8px 20px rgba(16, 185, 129, 0.3)'
            : '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {!imageError && organ.image ? (
          <img 
            src={organ.image} 
            alt={organ.name}
            className="w-[60px] h-[60px] object-contain mb-1"
            onError={() => setImageError(true)}
            style={{
              filter: isPlaced ? 'none' : 'saturate(0.9)',
            }}
          />
        ) : (
          <div className="text-2xl md:text-3xl mb-1">{organ.icon}</div>
        )}
        <p className="text-xs md:text-sm font-semibold text-center"
           style={{
             color: isPlaced 
               ? 'var(--color-primary)' 
               : isDragging 
               ? '#8B5CF6' 
               : 'var(--color-text)',
             textShadow: isPlaced ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
           }}>
          {organ.name}
        </p>
        {isPlaced && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1"
          >
            <Check size={16} className="text-green-500" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export function AnatomiePuzzle() {
  const { isFeminine } = useTheme();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [placedOrgans, setPlacedOrgans] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [organPositions, setOrganPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setPlacedOrgans(new Set());
    setScore(0);
    setTimeElapsed(0);
    setOrganPositions(new Map());
    
    // Shuffle initial positions for organs
    const positions = new Map();
    organs.forEach((organ, index) => {
      positions.set(organ.id, {
        x: 10 + (index % 4) * 20,
        y: 70 + Math.floor(index / 4) * 15,
      });
    });
    setOrganPositions(positions);
  };

  const handleOrganDrop = (organ: any, x: number, y: number) => {
    const tolerance = 10; // percentage tolerance for correct placement
    
    const isCorrect = 
      Math.abs(x - organ.correctX) < tolerance &&
      Math.abs(y - organ.correctY) < tolerance;
    
    if (isCorrect && !placedOrgans.has(organ.id)) {
      setPlacedOrgans(new Set([...placedOrgans, organ.id]));
      setScore((prev) => prev + 100);
      
      if (soundEnabled) {
        playSuccessSound();
      }
      
      // Update position to correct position
      setOrganPositions((prev) => {
        const newPositions = new Map(prev);
        newPositions.set(organ.id, { x: organ.correctX, y: organ.correctY });
        return newPositions;
      });
      
      // Check if game is completed
      if (placedOrgans.size + 1 === organs.length) {
        completeGame();
      }
    } else if (!placedOrgans.has(organ.id)) {
      // Wrong placement
      if (soundEnabled) {
        playErrorSound();
      }
      
      // Update position
      setOrganPositions((prev) => {
        const newPositions = new Map(prev);
        newPositions.set(organ.id, { x, y });
        return newPositions;
      });
    }
  };

  const completeGame = async () => {
    setGameState('completed');
    
    const finalScore = score + Math.max(0, 500 - timeElapsed * 2);
    setScore(finalScore);
    
    // Save score to backend
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gameType: 'anatomie_puzzle',
          score: finalScore,
          timeSpent: timeElapsed,
          difficulty: 'facile',
          level: currentLevel,
          accuracy: (placedOrgans.size / organs.length) * 100,
        }),
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const playSuccessSound = () => {
    // Play success sound effect
    const audio = new Audio('data:audio/wav;base64,UklGRkQFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoFAACAAAAA');
    audio.play();
  };

  const playErrorSound = () => {
    // Play error sound effect
    const audio = new Audio('data:audio/wav;base64,UklGRkQFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoFAACA');
    audio.play();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8 relative"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/games')}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            <ChevronRight size={20} className="rotate-180" />
            Retour
          </button>
          
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>
            
            <div className="px-4 py-2 rounded-lg font-medium"
                 style={{
                   backgroundColor: 'var(--color-surface)',
                   color: 'var(--color-text)',
                 }}>
              <Timer size={16} className="inline mr-2" />
              {formatTime(timeElapsed)}
            </div>
            
            <div className="px-4 py-2 rounded-lg font-medium"
                 style={{
                   backgroundColor: 'var(--color-primary)',
                   color: 'white',
                 }}>
              <Trophy size={16} className="inline mr-2" />
              {score} pts
            </div>
          </div>
        </motion.div>

        {/* Game states */}
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Brain size={80} className="mx-auto mb-6" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Anatomie Puzzle {isFeminine ? '🧬💕' : '🧬'}
              </h1>
              <p className="text-lg mb-8" style={{ color: 'var(--color-textSecondary)' }}>
                Placez les organes correctement sur le corps humain
              </p>
              
              <div className="max-w-md mx-auto mb-8 text-left">
                <h3 className="font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                  Comment jouer :
                </h3>
                <ul className="space-y-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Faites glisser chaque organe vers sa position correcte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Un placement correct fait briller l'organe en vert</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Terminez rapidement pour un meilleur score</span>
                  </li>
                </ul>
              </div>
              
              <motion.button
                onClick={startGame}
                className="px-8 py-4 text-lg font-bold rounded-xl text-white"
                style={{
                  background: 'var(--gradient-magic)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Commencer le jeu
              </motion.button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              ref={containerRef}
              className="relative mx-auto rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                height: '600px',
                maxWidth: '400px',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Body silhouette background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'url(/images/anatomy/body-silhouette.png)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              {/* Drop zones indicators */}
              {showHint && organs.map((organ) => (
                !placedOrgans.has(organ.id) && (
                  <motion.div
                    key={`hint-${organ.id}`}
                    className="absolute rounded-xl"
                    style={{
                      left: `${organ.correctX - organ.width / 200}%`,
                      top: `${organ.correctY - organ.height / 200}%`,
                      width: organ.width,
                      height: organ.height,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 0.6,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: 'easeOut',
                    }}
                  >
                    <motion.div
                      className="w-full h-full rounded-xl border-2 border-dashed flex items-center justify-center"
                      style={{
                        borderColor: 'var(--color-primary)',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                      }}
                      animate={{
                        borderColor: ['rgba(59, 130, 246, 0.6)', 'rgba(139, 92, 246, 0.6)', 'rgba(59, 130, 246, 0.6)'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <span className="text-xs font-medium opacity-60" style={{ color: 'var(--color-text)' }}>
                        {organ.name}
                      </span>
                    </motion.div>
                  </motion.div>
                )
              ))}
              
              {/* Draggable organs */}
              {organs.map((organ) => {
                const position = organPositions.get(organ.id) || { x: 50, y: 50 };
                return (
                  <motion.div
                    key={organ.id}
                    style={{
                      position: 'absolute',
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <DraggableOrgan
                      organ={organ}
                      onDrop={handleOrganDrop}
                      isPlaced={placedOrgans.has(organ.id)}
                      containerRef={containerRef}
                    />
                  </motion.div>
                );
              })}
              
              {/* Progress indicator */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Progression
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {placedOrgans.size}/{organs.length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden"
                     style={{ backgroundColor: 'var(--color-background)' }}>
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(placedOrgans.size / organs.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              {/* Hint button */}
              <motion.button
                onClick={() => setShowHint(!showHint)}
                className="absolute bottom-4 right-4 px-4 py-2 rounded-lg font-medium text-white"
                style={{
                  backgroundColor: showHint ? 'var(--color-primary)' : 'rgba(0,0,0,0.5)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Info size={16} className="inline mr-1" />
                Indice (-50 pts)
              </motion.button>
            </motion.div>
          )}

          {gameState === 'completed' && (
            <motion.div
              key="completed"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Trophy size={80} className="mx-auto mb-6 text-yellow-500" />
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Félicitations ! {isFeminine ? '🎉💕' : '🎉'}
              </h1>
              <p className="text-lg mb-8" style={{ color: 'var(--color-textSecondary)' }}>
                Vous avez complété le puzzle anatomique !
              </p>
              
              <div className="max-w-md mx-auto mb-8 p-6 rounded-xl"
                   style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      Score final
                    </p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      Temps
                    </p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {formatTime(timeElapsed)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                    Organes placés
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {organs.map((organ) => (
                      <span key={organ.id} className="text-2xl">
                        {organ.icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={20} />
                  Rejouer
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/games')}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Autres jeux
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AnatomiePuzzle;