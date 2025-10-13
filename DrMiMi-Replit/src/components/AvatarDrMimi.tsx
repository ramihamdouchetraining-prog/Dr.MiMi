import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types des poses disponibles
export type AvatarPose = 'reading' | 'stethoscope' | 'medicine' | 'idea' | 'pointing' | 'greeting' | 'writing' | 'thinking' | 'smiling' | 'laptop' | 'pondering' | 'celebration' | 'teaching' | 'encouragement' | 'questioning';
export type AvatarSize = 'small' | 'medium' | 'large';

interface AvatarDrMimiProps {
  pose: AvatarPose;
  size?: AvatarSize;
  animated?: boolean;
  alt?: string;
  className?: string;
  preload?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Mapping des poses vers les chemins d'images (all media in /public for GitHub/Netlify)
const AVATAR_PATHS: Record<AvatarPose, string> = {
  reading: '/images/avatars/reading.png',
  stethoscope: '/images/avatars/stethoscope.png',
  medicine: '/images/avatars/medicine.png',
  idea: '/images/avatars/idea.png',
  pointing: '/images/avatars/pointing.png',
  greeting: '/images/avatars/greeting.png',
  writing: '/images/avatars/writing.png',
  thinking: '/images/avatars/thinking.png',
  smiling: '/images/avatars/smiling.png',
  laptop: '/images/avatars/laptop.png',
  pondering: '/images/avatars/pondering.png',
  celebration: '/images/avatars/celebration.png',
  teaching: '/images/avatars/teaching.png',
  encouragement: '/images/avatars/encouragement.png',
  questioning: '/images/avatars/questioning.png'
};

// Descriptions alternatives pour chaque pose
const AVATAR_ALT_TEXTS: Record<AvatarPose, string> = {
  reading: 'Dr. Mimi en train de lire un livre médical',
  stethoscope: 'Dr. Mimi avec un stéthoscope',
  medicine: 'Dr. Mimi tenant une boîte de médicaments',
  idea: 'Dr. Mimi ayant une idée brillante',
  pointing: 'Dr. Mimi pointant vers un tableau',
  greeting: 'Dr. Mimi faisant un salut amical',
  writing: 'Dr. Mimi écrivant sur une tablette',
  thinking: 'Dr. Mimi en réflexion profonde',
  smiling: 'Dr. Mimi avec un sourire bienveillant',
  laptop: 'Dr. Mimi en consultation télémédecine',
  pondering: 'Dr. Mimi réfléchissant profondément',
  celebration: 'Dr. Mimi célébrant une réussite',
  teaching: 'Dr. Mimi en train d\'enseigner',
  encouragement: 'Dr. Mimi encourageant les étudiants',
  questioning: 'Dr. Mimi posant une question'
};

// Tailles en pixels
const AVATAR_SIZES: Record<AvatarSize, number> = {
  small: 64,
  medium: 128,
  large: 256
};

// Animations disponibles
const ANIMATIONS = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  rotate: {
    rotate: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  glow: {
    filter: [
      'drop-shadow(0 0 10px rgba(255, 182, 193, 0.5))',
      'drop-shadow(0 0 20px rgba(255, 182, 193, 0.8))',
      'drop-shadow(0 0 10px rgba(255, 182, 193, 0.5))'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Gestionnaire de préchargement
class AvatarPreloader {
  private static instance: AvatarPreloader;
  private preloadedImages: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  static getInstance(): AvatarPreloader {
    if (!AvatarPreloader.instance) {
      AvatarPreloader.instance = new AvatarPreloader();
    }
    return AvatarPreloader.instance;
  }

  preloadImage(src: string): Promise<void> {
    // Si déjà préchargé, retourner immédiatement
    if (this.preloadedImages.has(src)) {
      return Promise.resolve();
    }

    // Si en cours de chargement, retourner la promesse existante
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Créer une nouvelle promesse de chargement
    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.set(src, img);
        this.loadingPromises.delete(src);
        resolve();
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  preloadCriticalPoses(poses: AvatarPose[] = ['greeting', 'reading', 'stethoscope']): void {
    poses.forEach(pose => {
      this.preloadImage(AVATAR_PATHS[pose]);
    });
  }

  getPreloadedImage(src: string): HTMLImageElement | null {
    return this.preloadedImages.get(src) || null;
  }
}

// Composant principal
export const AvatarDrMimi: React.FC<AvatarDrMimiProps> = ({
  pose,
  size = 'medium',
  animated = false,
  alt,
  className = '',
  preload = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const preloader = useMemo(() => AvatarPreloader.getInstance(), []);

  const imageSrc = AVATAR_PATHS[pose];
  const imageAlt = alt || AVATAR_ALT_TEXTS[pose];
  const sizeInPx = AVATAR_SIZES[size];

  // Précharger l'image si demandé
  useEffect(() => {
    if (preload) {
      preloader.preloadImage(imageSrc).catch(console.error);
    }
  }, [imageSrc, preload, preloader]);

  // Lazy loading avec IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Gérer le chargement de l'image
  useEffect(() => {
    if (!isVisible) return;

    // Vérifier si l'image est déjà préchargée
    const preloadedImg = preloader.getPreloadedImage(imageSrc);
    if (preloadedImg) {
      setIsLoaded(true);
      onLoad?.();
      return;
    }

    // Charger l'image
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
      onError?.();
    };
    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, imageSrc, preloader, onLoad, onError]);

  // Sélectionner une animation aléatoire ou spécifique selon la pose
  const getAnimation = () => {
    if (!animated) return {};
    
    // Animations spécifiques selon la pose
    const poseAnimations: Record<AvatarPose, keyof typeof ANIMATIONS> = {
      greeting: 'bounce',
      idea: 'glow',
      reading: 'pulse',
      stethoscope: 'rotate',
      medicine: 'pulse',
      pointing: 'bounce',
      writing: 'pulse',
      thinking: 'pulse',
      smiling: 'bounce',
      laptop: 'pulse',
      pondering: 'pulse',
      celebration: 'bounce',
      teaching: 'bounce',
      encouragement: 'glow',
      questioning: 'pulse'
    };

    return ANIMATIONS[poseAnimations[pose]];
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={{
        width: sizeInPx,
        height: sizeInPx
      }}
    >
      <AnimatePresence>
        {!isLoaded && isVisible && !hasError && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
              borderRadius: '50%'
            }}
          >
            {/* Skeleton loader avec animation */}
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-1/2 h-1/2"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                className="w-full h-full"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
              borderRadius: '50%'
            }}
          >
            {/* Image d'erreur avec emoji Dr. Mimi */}
            <div className="text-center">
              <span className="text-4xl">👩‍⚕️</span>
              <p className="text-xs text-white mt-1">Dr. Mimi</p>
            </div>
          </motion.div>
        )}

        {isVisible && !hasError && (
          <motion.img
            key={`image-${pose}`}
            ref={imgRef}
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover rounded-full shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isLoaded ? 1 : 0,
              scale: isLoaded ? 1 : 0.8,
              ...getAnimation()
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3, type: "spring" }
            }}
            style={{
              display: isLoaded ? 'block' : 'none'
            }}
            draggable={false}
          />
        )}
      </AnimatePresence>

      {/* Badge indicateur de pose (optionnel pour debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute -bottom-2 -right-2 px-2 py-1 text-xs rounded-full shadow-md"
          style={{
            background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
            color: 'white',
            fontSize: '10px'
          }}
        >
          {pose}
        </div>
      )}
    </div>
  );
};

// Hook personnalisé pour précharger des avatars
export const useAvatarPreload = (poses: AvatarPose[] = ['greeting', 'reading']) => {
  const preloader = useMemo(() => AvatarPreloader.getInstance(), []);

  useEffect(() => {
    preloader.preloadCriticalPoses(poses);
  }, [poses, preloader]);

  return preloader;
};

// Composant de galerie d'avatars (utile pour tester)
export const AvatarDrMimiGallery: React.FC<{ size?: AvatarSize; animated?: boolean }> = ({
  size = 'small',
  animated = true
}) => {
  const poses: AvatarPose[] = ['reading', 'stethoscope', 'medicine', 'idea', 'pointing', 'greeting', 'writing', 'thinking', 'smiling', 'laptop', 'pondering', 'celebration', 'teaching', 'encouragement', 'questioning'];

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {poses.map((pose) => (
        <div key={pose} className="flex flex-col items-center">
          <AvatarDrMimi
            pose={pose}
            size={size}
            animated={animated}
            preload
          />
          <span className="text-xs mt-2 text-gray-600">{pose}</span>
        </div>
      ))}
    </div>
  );
};

// Export par défaut
export default AvatarDrMimi;