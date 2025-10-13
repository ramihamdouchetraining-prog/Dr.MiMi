import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export type MimiState = 'idle' | 'wave' | 'blink' | 'talk' | 'celebrate';

interface MimiAnimatedProps {
  state?: MimiState;
  loop?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  autoPlay?: boolean;
  pauseWhenHidden?: boolean;
}

// Size configurations
const SIZES = {
  small: { width: 100, height: 100 },
  medium: { width: 150, height: 150 },
  large: { width: 200, height: 200 }
};

export const MimiAnimated: React.FC<MimiAnimatedProps> = ({
  state = 'idle',
  loop = false,
  size = 'medium',
  className = '',
  autoPlay = true,
  pauseWhenHidden = true
}) => {
  const [currentState, setCurrentState] = useState<MimiState>(state);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle visibility change
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseWhenHidden]);

  // Update state when prop changes
  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  // Animation variants
  const variants = {
    idle: {
      y: prefersReducedMotion ? 0 : [0, -5, 0],
      transition: {
        duration: 2,
        repeat: loop ? Infinity : 0,
        ease: "easeInOut"
      }
    },
    wave: {
      rotate: prefersReducedMotion ? 0 : [0, -15, 15, -15, 0],
      x: prefersReducedMotion ? 0 : [0, -10, 10, -10, 0],
      transition: {
        duration: 1,
        repeat: loop ? Infinity : 0,
        repeatDelay: 2
      }
    },
    blink: {
      opacity: prefersReducedMotion ? 1 : [1, 1, 0.1, 1, 1],
      transition: {
        duration: 0.3,
        repeat: loop ? Infinity : 0,
        repeatDelay: 3,
        times: [0, 0.4, 0.5, 0.6, 1]
      }
    },
    talk: {
      scale: prefersReducedMotion ? 1 : [1, 1.05, 1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: loop ? Infinity : 0
      }
    },
    celebrate: {
      y: prefersReducedMotion ? 0 : [0, -30, 0],
      rotate: prefersReducedMotion ? 0 : [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.8,
        repeat: loop ? Infinity : 0,
        repeatDelay: 1
      }
    }
  };

  const { width, height } = SIZES[size];

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={{ width, height }}
    >
      <AnimatePresence>
        {isVisible && autoPlay && (
          <motion.div
            className="w-full h-full"
            animate={currentState}
            variants={variants}
          >
            {/* SVG Character */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="url(#gradient)"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB6C1" />
                  <stop offset="100%" stopColor="#FF69B4" />
                </linearGradient>
                <linearGradient id="hijabGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFC0CB" />
                  <stop offset="100%" stopColor="#FFB6C1" />
                </linearGradient>
              </defs>
              
              {/* Hijab */}
              <motion.path
                d="M 100 40 Q 60 50 50 80 L 50 120 Q 60 140 80 145 Q 100 150 120 145 Q 140 140 150 120 L 150 80 Q 140 50 100 40"
                fill="url(#hijabGradient)"
                stroke="#FF69B4"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              
              {/* Face */}
              <motion.ellipse
                cx="100"
                cy="90"
                rx="35"
                ry="40"
                fill="#FDBCB4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              />
              
              {/* Eyes */}
              {currentState === 'blink' ? (
                <motion.g
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 1, 0, 1, 1] }}
                  transition={{
                    duration: 0.3,
                    repeat: loop ? Infinity : 0,
                    repeatDelay: 3,
                    times: [0, 0.4, 0.5, 0.6, 1]
                  }}
                >
                  <circle cx="88" cy="85" r="3" fill="#333" />
                  <circle cx="112" cy="85" r="3" fill="#333" />
                </motion.g>
              ) : (
                <>
                  <circle cx="88" cy="85" r="3" fill="#333" />
                  <circle cx="112" cy="85" r="3" fill="#333" />
                </>
              )}
              
              {/* Smile */}
              <motion.path
                d={currentState === 'celebrate' 
                  ? "M 85 100 Q 100 115 115 100"  // Big smile
                  : "M 88 100 Q 100 108 112 100"  // Normal smile
                }
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3 }}
              />
              
              {/* Stethoscope (optional) */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <path
                  d="M 70 130 Q 60 140 60 150 L 60 160"
                  fill="none"
                  stroke="#333"
                  strokeWidth="3"
                />
                <circle cx="60" cy="165" r="5" fill="#333" />
                <path
                  d="M 130 130 Q 140 140 140 150 L 140 160"
                  fill="none"
                  stroke="#333"
                  strokeWidth="3"
                />
                <circle cx="140" cy="165" r="5" fill="#333" />
              </motion.g>
              
              {/* Waving hand (only visible when waving) */}
              {currentState === 'wave' && (
                <motion.g
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ 
                    opacity: 1,
                    rotate: [-20, 20, -20, 20, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: loop ? Infinity : 0,
                    repeatDelay: 1
                  }}
                  style={{ transformOrigin: '150px 100px' }}
                >
                  <ellipse cx="150" cy="100" rx="15" ry="20" fill="#FDBCB4" />
                  <line x1="135" y1="100" x2="150" y2="100" stroke="#FDBCB4" strokeWidth="8" />
                </motion.g>
              )}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute -bottom-2 -right-2 px-2 py-1 text-xs rounded-full shadow-md"
          style={{
            background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
            color: 'white',
            fontSize: '10px'
          }}
        >
          {currentState}
        </div>
      )}
    </div>
  );
};

// Interactive animated Mimi that responds to user actions
export const InteractiveMimi: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const [state, setState] = useState<MimiState>('idle');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cycle through animations periodically
    const states: MimiState[] = ['idle', 'blink', 'wave', 'talk', 'celebrate'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (!isHovered) {
        currentIndex = (currentIndex + 1) % states.length;
        setState(states[currentIndex]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <motion.div
      className={className}
      onMouseEnter={() => {
        setIsHovered(true);
        setState('wave');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setState('idle');
      }}
      onClick={() => setState('celebrate')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MimiAnimated
        state={state}
        loop={true}
        size="large"
        pauseWhenHidden={true}
      />
      <p className="text-center mt-2 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {isHovered ? 'Clique-moi! 🎉' : 'Passe ta souris ici! ✨'}
      </p>
    </motion.div>
  );
};

export default MimiAnimated;