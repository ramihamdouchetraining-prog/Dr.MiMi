// XXL Magical Visual Effects Components for MediMimi
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

// Enhanced Floating Particles with Medical Icons
export const EnhancedFloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    emoji: string;
    duration: number;
  }>>([]);

  const medicalEmojis = ['💊', '💉', '🩺', '❤️', '🧬', '🔬', '🦴', '🧠', '🫀', '🩹', '✨', '⭐', '💖', '🌸', '🦋', '🌈'];

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 25 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        emoji: medicalEmojis[Math.floor(Math.random() * medicalEmojis.length)],
        duration: Math.random() * 20 + 15
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-4xl"
          initial={{ 
            x: `${particle.x}vw`, 
            y: '100vh',
            scale: 0,
            rotate: 0 
          }}
          animate={{ 
            y: '-10vh',
            scale: [0, 1, 1, 0],
            rotate: [0, 360, 720],
            x: [
              `${particle.x}vw`,
              `${particle.x + Math.sin(particle.x) * 10}vw`,
              `${particle.x - Math.sin(particle.x) * 10}vw`,
              `${particle.x}vw`
            ]
          }}
          transition={{ 
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ fontSize: `${particle.size}px` }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Glow Button Component
export const GlowButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'magical';
}> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: 'bg-gradient-to-r from-pink-400 to-purple-400',
    secondary: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    magical: 'bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300'
  };

  return (
    <motion.button
      className={`relative px-6 py-3 rounded-full font-bold text-white overflow-hidden ${variants[variant]} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)`,
                filter: 'blur(20px)'
              }}
            />
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0 }}
              animate={{ scale: 2 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(255,105,180,0.5) 0%, transparent 50%)',
                filter: 'blur(30px)'
              }}
            />
          </>
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
      
      {/* Animated glow effect */}
      <motion.div
        className="absolute -inset-2 rounded-full opacity-75"
        animate={{
          boxShadow: [
            '0 0 20px rgba(255,105,180,0.5)',
            '0 0 40px rgba(255,105,180,0.8)',
            '0 0 20px rgba(255,105,180,0.5)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
};

// 3D Card Component
export const Card3D: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angleX = ((e.clientY - centerY) / rect.height) * -15;
    const angleY = ((e.clientX - centerX) / rect.width) * 15;
    
    setRotateX(angleX);
    setRotateY(angleY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative preserve-3d ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02, z: 50 }}
    >
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl"
           style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
      
      {/* 3D Shadow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl"
        style={{ transform: 'translateZ(-20px)' }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};

// Enhanced Cursor Trail
export const CursorTrail: React.FC = () => {
  const [trail, setTrail] = useState<Array<{
    id: number;
    x: number;
    y: number;
    timestamp: number;
  }>>([]);
  const { isFeminine } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      setTrail(prev => [...prev.slice(-10), newPoint]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setTrail(prev => prev.filter(point => Date.now() - point.timestamp < 500));
    }, 50);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute"
          initial={{ 
            x: point.x - 8, 
            y: point.y - 8,
            scale: 1,
            opacity: 0.8 
          }}
          animate={{ 
            scale: 0,
            opacity: 0 
          }}
          transition={{ duration: 0.5 }}
          style={{
            background: isFeminine 
              ? `radial-gradient(circle, rgba(255,105,180,${0.8 - index * 0.05}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(59,130,246,${0.8 - index * 0.05}) 0%, transparent 70%)`,
            width: 16 - index,
            height: 16 - index,
            borderRadius: '50%',
            filter: 'blur(1px)'
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              boxShadow: [
                '0 0 10px rgba(255,105,180,0.5)',
                '0 0 20px rgba(255,105,180,0.3)',
                '0 0 10px rgba(255,105,180,0.5)'
              ]
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Magical Page Transition
export const MagicalPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 1.1, rotateY: 15 }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 20
      }}
    >
      <motion.div
        initial={{ filter: 'blur(10px)' }}
        animate={{ filter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Success Animation with Confetti and Sound
export const SuccessAnimation: React.FC<{ show: boolean; message?: string }> = ({ show, message = "Bravo! 🎉" }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const colors = ['#FF69B4', '#FFB6C1', '#DDA0DD', '#F0E68C', '#87CEEB', '#98FB98'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);

      // Play sound if available
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }

      // Clear particles after animation
      setTimeout(() => setParticles([]), 3000);
    }
  }, [show]);

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/success.mp3" type="audio/mpeg" />
      </audio>
      
      <AnimatePresence>
        {show && (
          <>
            {/* Confetti particles */}
            <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-3 h-3"
                  initial={{ 
                    x: '50vw', 
                    y: '50vh',
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: `${particle.x}vw`,
                    y: [50, -10],
                    scale: [0, 1.5, 0],
                    rotate: [0, 360, 720]
                  }}
                  transition={{
                    duration: 2,
                    delay: particle.delay,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }}
                  style={{
                    background: particle.color,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0%'
                  }}
                />
              ))}
            </div>

            {/* Success message */}
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full shadow-2xl">
                <motion.h2 
                  className="text-3xl font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  {message}
                </motion.h2>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Sparkle Effect for Important Elements
export const SparkleEffect: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ 
  children, 
  active = true 
}) => {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const sparkle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2
      };
      
      setSparkles(prev => [...prev.slice(-5), sparkle]);
      
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
      }, 1000);
    }, 300);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative inline-block">
      {children}
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          initial={{ 
            left: `${sparkle.x}%`, 
            top: `${sparkle.y}%`,
            scale: 0,
            opacity: 1
          }}
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 1 }}
        >
          <svg
            width={sparkle.size * 2}
            height={sparkle.size * 2}
            viewBox="0 0 10 10"
            fill="currentColor"
            className="text-yellow-300"
          >
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default {
  EnhancedFloatingParticles,
  GlowButton,
  Card3D,
  CursorTrail,
  MagicalPageTransition,
  SuccessAnimation,
  SparkleEffect
};