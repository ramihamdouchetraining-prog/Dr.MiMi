import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDrMimi, type AvatarPose } from './AvatarDrMimi';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface AvatarCarouselProps {
  poses?: AvatarPose[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  itemsToShow?: number;
  enableKeyboardNavigation?: boolean;
}

// All available poses
const ALL_POSES: AvatarPose[] = [
  'greeting', 'reading', 'stethoscope', 'medicine', 'idea',
  'pointing', 'writing', 'thinking', 'smiling', 'laptop',
  'pondering', 'celebration', 'teaching', 'encouragement', 'questioning'
];

// Get poses based on day of year for daily rotation
const getDailyPoses = (): AvatarPose[] => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // Rotate through poses based on day
  const startIndex = (dayOfYear * 3) % ALL_POSES.length;
  const selectedPoses: AvatarPose[] = [];
  
  for (let i = 0; i < 3; i++) {
    selectedPoses.push(ALL_POSES[(startIndex + i) % ALL_POSES.length]);
  }
  
  return selectedPoses;
};

export const AvatarCarousel: React.FC<AvatarCarouselProps> = ({
  poses = ALL_POSES,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  className = '',
  itemsToShow = 3,
  enableKeyboardNavigation = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      if (document.hidden) {
        setIsPaused(true);
      } else if (isPlaying) {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || isPaused || !isTabVisible || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(poses.length / itemsToShow));
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, isPaused, isTabVisible, poses.length, interval, itemsToShow, prefersReducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNavigation, isPlaying]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.ceil(poses.length / itemsToShow) - 1 : prev - 1
    );
  }, [poses.length, itemsToShow]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(poses.length / itemsToShow));
  }, [poses.length, itemsToShow]);

  const visiblePoses = useMemo(() => {
    const start = currentIndex * itemsToShow;
    const end = start + itemsToShow;
    return poses.slice(start, end);
  }, [currentIndex, itemsToShow, poses]);

  // Custom easing function
  const customTransition = {
    duration: prefersReducedMotion ? 0 : 1,
    ease: [0.22, 1, 0.36, 1] as const // cubic-bezier(0.22,1,0.36,1)
  };

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={`grid grid-cols-${itemsToShow} gap-6`}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
            transition={customTransition}
          >
            {visiblePoses.map((pose, index) => (
              <motion.div
                key={`${pose}-${index}`}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...customTransition,
                  delay: prefersReducedMotion ? 0 : index * 0.1
                }}
              >
                <AvatarDrMimi
                  pose={pose}
                  size="large"
                  animated={!prefersReducedMotion}
                  preload
                />
                <span className="mt-3 text-sm font-medium capitalize"
                      style={{ color: 'var(--color-textSecondary)' }}>
                  {pose}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)'
            }}
            aria-label="Previous avatars"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)'
            }}
            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)'
            }}
            aria-label="Next avatars"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(poses.length / itemsToShow) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-6' : ''
              }`}
              style={{
                backgroundColor: index === currentIndex 
                  ? 'var(--color-primary)' 
                  : 'var(--color-border)'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Featured carousel for homepage
export const FeaturedAvatarCarousel: React.FC<{
  className?: string;
  dailyRotation?: boolean;
}> = ({ className = '', dailyRotation = true }) => {
  const poses = dailyRotation ? getDailyPoses() : ALL_POSES.slice(0, 3);
  
  return (
    <AvatarCarousel
      poses={poses}
      autoPlay={true}
      interval={4000}
      showControls={false}
      showIndicators={false}
      itemsToShow={3}
      className={className}
    />
  );
};

// Full gallery for about page
export const AvatarGallery: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const [filter, setFilter] = useState<'all' | 'action' | 'emotion' | 'teaching'>('all');
  
  const filteredPoses = useMemo(() => {
    if (filter === 'all') return ALL_POSES;
    
    const filters: Record<string, AvatarPose[]> = {
      action: ['reading', 'writing', 'pointing', 'teaching', 'laptop'],
      emotion: ['smiling', 'thinking', 'pondering', 'celebration', 'encouragement'],
      teaching: ['pointing', 'teaching', 'idea', 'questioning', 'greeting']
    };
    
    return filters[filter] || ALL_POSES;
  }, [filter]);
  
  return (
    <div className={className}>
      {/* Filter buttons */}
      <div className="flex justify-center gap-2 mb-6">
        {['all', 'action', 'emotion', 'teaching'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: filter === f 
                ? 'var(--color-primary)' 
                : 'var(--color-surface)',
              color: filter === f 
                ? 'white' 
                : 'var(--color-text)'
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Avatar grid */}
      <motion.div
        layout
        className="grid grid-cols-3 md:grid-cols-5 gap-6"
      >
        <AnimatePresence>
          {filteredPoses.map((pose) => (
            <motion.div
              key={pose}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <AvatarDrMimi
                pose={pose}
                size="medium"
                animated={true}
                preload
              />
              <span className="mt-2 text-sm font-medium capitalize"
                    style={{ color: 'var(--color-textSecondary)' }}>
                {pose}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AvatarCarousel;