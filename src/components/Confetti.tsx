import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  duration: number;
}

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#FF69B4', '#FFB6C1', '#DDA0DD', '#F0E68C', '#98FB98', '#87CEEB', '#FFD700'];
      const newPieces: ConfettiPiece[] = [];

      for (let i = 0; i < 100; i++) {
        newPieces.push({
          id: Date.now() + i,
          x: Math.random() * window.innerWidth,
          y: -20,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          scale: Math.random() * 0.5 + 0.5,
          duration: Math.random() * 2 + 3
        });
      }

      setPieces(newPieces);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          className="fixed pointer-events-none z-50"
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: 0,
            scale: 0
          }}
          animate={{
            x: piece.x + (Math.random() - 0.5) * 200,
            y: window.innerHeight + 20,
            rotate: piece.rotation * 3,
            scale: piece.scale
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: piece.duration,
            ease: "easeOut"
          }}
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </AnimatePresence>
  );
};

// Success celebration with sound and confetti
export const CelebrationEffect: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messages = [
    "Fantastique! 🎉",
    "Excellent travail! ⭐",
    "Tu es incroyable! 🌟",
    "Parfait! 🏆",
    "Génial! 🎊",
    "Super choix! ✨"
  ];

  useEffect(() => {
    if (trigger) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessageText(randomMessage);
      setShowMessage(true);

      // Optional: Play celebration sound
      try {
        const audio = new Audio('data:audio/wav;base64,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');
        audio.volume = 0.3;
        audio.play().catch(() => { });
      } catch (e) {
        // Ignore audio errors
      }

      // Auto-dismiss after 3.5 seconds
      const timer = setTimeout(() => setShowMessage(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <>
      <Confetti trigger={trigger} />
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
            style={{ zIndex: 'var(--z-toast)' }}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            role="status"
            aria-live="polite"
          >
            <div className="px-6 py-3 rounded-full shadow-2xl backdrop-blur-md bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold text-lg flex items-center gap-2">
              <span>{messageText}</span>
              <motion.div
                className="h-0.5 w-16 bg-white/50 rounded-full overflow-hidden"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};