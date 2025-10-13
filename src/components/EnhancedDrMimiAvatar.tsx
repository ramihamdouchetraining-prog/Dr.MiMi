import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export type MoodType = 'happy' | 'thinking' | 'encouraging' | 'celebrating' | 'winking' | 'surprised';

interface DrMimiAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  mood?: MoodType;
  showMessage?: boolean;
  message?: string;
  animated?: boolean;
}

export const EnhancedDrMimiAvatar: React.FC<DrMimiAvatarProps> = ({ 
  size = 'md', 
  className = '',
  showName = false,
  mood = 'happy',
  showMessage = false,
  message = '',
  animated = false
}) => {
  const { isFeminine } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [currentMood] = useState<MoodType>(mood);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  // Messages d'encouragement selon l'humeur
  const encouragingMessages = {
    happy: ["Bonjour! Comment puis-je t'aider? 😊", "Prêt(e) pour apprendre? 💖", "Tu vas y arriver! 🌟"],
    thinking: ["Hmm, intéressant... 🤔", "Laisse-moi réfléchir... 💭", "Analysons cela ensemble... 🧠"],
    encouraging: ["Tu es incroyable! 💪", "Continue comme ça! ✨", "Je crois en toi! 💕"],
    celebrating: ["Bravo! Tu as réussi! 🎉", "Fantastique! 🏆", "Quelle performance! 🌟"],
    winking: ["Tu as trouvé l'easter egg! 😉", "Bien joué! 😏", "Tu es malin(e)! 😜"],
    surprised: ["Oh wow! 😮", "Incroyable! 😱", "Je ne m'y attendais pas! 🤯"]
  };

  const getRandomMessage = (moodType: MoodType) => {
    const messages = encouragingMessages[moodType];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const displayMessage = message || (showMessage && getRandomMessage(currentMood));

  // Emojis selon l'humeur
  const moodEmojis = {
    happy: '😊',
    thinking: '🤔',
    encouraging: '💖',
    celebrating: '🎉',
    winking: '😉',
    surprised: '😮'
  };

  return (
    <motion.div 
      className={`relative inline-flex items-center space-x-3 ${className}`}
      animate={animated ? { y: [0, -5, 0] } : {}}
      transition={animated ? { duration: 2, repeat: Infinity } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Image */}
      <motion.div 
        className="relative"
        whileHover={animated ? { scale: 1.1, rotate: [-5, 5, -5, 0] } : { scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/images/logos/logo-hijab.png"
            alt="Dr. Mimi - Assistante médicale"
            className={`${sizeClasses[size]} rounded-full object-cover transition-all duration-300 border-2 glow-hover`}
            style={{ 
              borderColor: isFeminine ? '#ec4899' : '#0FA3B1',
              boxShadow: isFeminine 
                ? '0 4px 12px rgba(236, 72, 153, 0.3)'
                : '0 4px 12px rgba(15, 163, 177, 0.3)'
            }}
            onError={(e) => {
              // Fallback to initials if image fails
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling;
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div 
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-display font-semibold text-white transition-all duration-300`}
            style={{ 
              display: 'none',
              backgroundColor: isFeminine ? '#ec4899' : '#0FA3B1',
              background: isFeminine 
                ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
                : 'linear-gradient(135deg, #0FA3B1 0%, #1363DF 100%)'
            }}
          >
            <span className={textSizes[size]}>M</span>
          </div>
        </motion.div>

        {/* Online indicator */}
        {size !== 'sm' && (
          <motion.div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white heartbeat"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Mood emoji overlay */}
        <motion.div
          className="absolute -top-2 -right-2 text-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: isHovered ? 1 : 0, rotate: isHovered ? 0 : -180 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          {moodEmojis[currentMood]}
        </motion.div>
      </motion.div>

      {/* Message bubble */}
      <AnimatePresence>
        {displayMessage && isHovered && (
          <motion.div
            className="absolute z-50"
            style={{
              bottom: size === 'xl' ? 'auto' : '100%',
              top: size === 'xl' ? '100%' : 'auto',
              left: '50%',
              marginTop: size === 'xl' ? '10px' : 0,
              marginBottom: size === 'xl' ? 0 : '10px'
            }}
            initial={{ opacity: 0, y: size === 'xl' ? -10 : 10, scale: 0.8, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: size === 'xl' ? -10 : 10, scale: 0.8, x: '-50%' }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div 
              className="glass px-4 py-2 rounded-2xl shadow-lg whitespace-nowrap"
              style={{ 
                background: isFeminine 
                  ? 'linear-gradient(135deg, rgba(255, 182, 193, 0.95), rgba(255, 105, 180, 0.95))'
                  : 'linear-gradient(135deg, rgba(15, 163, 177, 0.95), rgba(19, 99, 223, 0.95))',
                color: 'white'
              }}
            >
              <div className="text-sm font-fun">{displayMessage}</div>
              <div 
                className="absolute w-3 h-3 rotate-45"
                style={{
                  bottom: size === 'xl' ? 'auto' : '-6px',
                  top: size === 'xl' ? '-6px' : 'auto',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  background: isFeminine ? 'rgba(255, 105, 180, 0.95)' : 'rgba(15, 163, 177, 0.95)'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name and title */}
      {showName && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`font-magic font-semibold ${textSizes[size]}`} 
                style={{ 
                  background: 'var(--gradient-magic)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
            Dr. Mimi
          </span>
          <span className={`${textSizes[size]} text-xs`} style={{ color: 'var(--color-textSecondary)' }}>
            {isFeminine ? 'Assistante médicale 💕' : 'Assistante médicale 🩺'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Floating Dr.Mimi for empty sections
export const FloatingDrMimi: React.FC<{ 
  position?: 'left' | 'right' | 'center';
  mood?: MoodType;
}> = ({ position = 'right', mood = 'encouraging' }) => {
  const positions = {
    left: 'left-10',
    right: 'right-10',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <motion.div
      className={`fixed bottom-20 ${positions[position]} z-40`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="float-animation"
      >
        <EnhancedDrMimiAvatar 
          size="xl" 
          mood={mood}
          showMessage={true}
          animated={true}
        />
      </motion.div>
    </motion.div>
  );
};

// Dr.Mimi in corner with random messages
export const CornerDrMimi: React.FC = () => {
  const messages = [
    "N'oublie pas de faire des pauses! 🌸",
    "Tu progresses bien! Continue! ⭐",
    "Besoin d'aide? Je suis là! 💕",
    "La médecine c'est fun avec moi! 🎉",
    "Révise bien pour tes examens! 📚"
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <EnhancedDrMimiAvatar 
        size="lg"
        mood="happy"
        message={currentMessage}
        showMessage={true}
        animated={true}
      />
    </motion.div>
  );
};