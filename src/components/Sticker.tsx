import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface StickerProps {
  message: string;
  emoji?: string;
  visible: boolean;
  onClose: () => void;
  autoCloseDelay?: number; // en millisecondes
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  color?: string;
  gradient?: string;
}

// Gestionnaire de stickers singleton pour s'assurer qu'un seul sticker est visible à la fois
class StickerManager {
  private static instance: StickerManager;
  private currentSticker: (() => void) | null = null;

  private constructor() {}

  static getInstance(): StickerManager {
    if (!StickerManager.instance) {
      StickerManager.instance = new StickerManager();
    }
    return StickerManager.instance;
  }

  registerSticker(closeFunction: () => void) {
    // Fermer le sticker précédent s'il existe
    if (this.currentSticker) {
      this.currentSticker();
    }
    this.currentSticker = closeFunction;
  }

  unregisterSticker(closeFunction: () => void) {
    if (this.currentSticker === closeFunction) {
      this.currentSticker = null;
    }
  }
}

export const Sticker: React.FC<StickerProps> = ({
  message,
  emoji = '✨',
  visible,
  onClose,
  autoCloseDelay = 3500, // 3.5 secondes par défaut
  position = 'top-right',
  color = '#FFB6C1',
  gradient = 'linear-gradient(135deg, #FFB6C1, #FF69B4)'
}) => {
  const location = useLocation();
  const stickerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intersectionObserverRef = useRef<IntersectionObserver>();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [isInView, setIsInView] = useState(true);
  const manager = StickerManager.getInstance();

  // Fonction pour fermer le sticker avec nettoyage
  const closeSticker = useCallback(() => {
    manager.unregisterSticker(closeSticker);
    onClose();
  }, [onClose]);

  // Effet pour gérer l'auto-dismiss après 4 secondes
  useEffect(() => {
    if (visible) {
      // Enregistrer ce sticker et fermer tout sticker précédent
      manager.registerSticker(closeSticker);
      
      // Auto-dismiss après le délai spécifié
      timeoutRef.current = setTimeout(() => {
        closeSticker();
      }, autoCloseDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, autoCloseDelay, closeSticker]);

  // Effet pour fermer sur changement de route
  useEffect(() => {
    if (visible) {
      closeSticker();
    }
  }, [location.pathname, closeSticker]);

  // Effet pour gérer l'IntersectionObserver
  useEffect(() => {
    if (!visible || !stickerRef.current) return;

    // Créer l'observer pour détecter quand le sticker sort de la vue
    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (!entry.isIntersecting) {
            closeSticker();
          }
        });
      },
      {
        threshold: 0.1 // Fermer si moins de 10% du sticker est visible
      }
    );

    intersectionObserverRef.current.observe(stickerRef.current);

    return () => {
      if (intersectionObserverRef.current && stickerRef.current) {
        intersectionObserverRef.current.unobserve(stickerRef.current);
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [visible, closeSticker]);

  // Effet pour gérer le scroll avec throttle
  useEffect(() => {
    if (!visible) return;

    const handleScroll = () => {
      // Throttle le handler de scroll
      if (scrollTimeoutRef.current) return;
      
      scrollTimeoutRef.current = setTimeout(() => {
        scrollTimeoutRef.current = undefined;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [visible]);

  // Nettoyer tous les listeners et timers sur unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      manager.unregisterSticker(closeSticker);
    };
  }, [closeSticker]);

  // Déterminer la position du sticker
  const getPositionStyles = () => {
    const base = 'fixed z-50';
    switch (position) {
      case 'top-left':
        return `${base} top-4 left-4`;
      case 'top-right':
        return `${base} top-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      case 'bottom-right':
        return `${base} bottom-4 right-4`;
      case 'center':
        return `${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`;
      default:
        return `${base} top-4 right-4`;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`sticker-${message}`}
          ref={stickerRef}
          className={`${getPositionStyles()} pointer-events-auto`}
          initial={{ 
            opacity: 0,
            scale: 0.8,
            rotate: -10,
            // Utiliser transform pour les animations GPU-friendly
            transform: 'translateZ(0)'
          }}
          animate={{ 
            opacity: isInView ? 1 : 0.8,
            scale: 1,
            rotate: 0,
            transform: 'translateZ(0)'
          }}
          exit={{ 
            opacity: 0,
            scale: 0.8,
            rotate: 10,
            transform: 'translateZ(0)',
            transition: { duration: 0.2 }
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          style={{
            // Force l'accélération GPU
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        >
          <div
            className="relative px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm"
            style={{
              background: gradient,
              boxShadow: `0 10px 40px ${color}66`,
              minWidth: '200px',
              maxWidth: '320px'
            }}
          >
            {/* Bouton de fermeture */}
            <button
              onClick={closeSticker}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>

            {/* Contenu du sticker */}
            <div className="flex items-center gap-3">
              <motion.span
                className="text-3xl"
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                  ease: "easeInOut"
                }}
              >
                {emoji}
              </motion.span>
              <p className="text-white font-medium text-sm leading-tight">
                {message}
              </p>
            </div>

            {/* Barre de progression pour l'auto-dismiss */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: autoCloseDelay / 1000,
                ease: 'linear'
              }}
              style={{
                transformOrigin: 'left',
                transform: 'translateZ(0)'
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook personnalisé pour utiliser facilement le sticker
export const useSticker = () => {
  const [stickerState, setStickerState] = useState<{
    visible: boolean;
    message: string;
    emoji?: string;
    position?: StickerProps['position'];
    color?: string;
    gradient?: string;
  }>({
    visible: false,
    message: ''
  });

  const showSticker = useCallback((
    message: string,
    options?: {
      emoji?: string;
      position?: StickerProps['position'];
      color?: string;
      gradient?: string;
      duration?: number;
    }
  ) => {
    setStickerState({
      visible: true,
      message,
      emoji: options?.emoji,
      position: options?.position,
      color: options?.color,
      gradient: options?.gradient
    });
  }, []);

  const hideSticker = useCallback(() => {
    setStickerState(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    stickerState,
    showSticker,
    hideSticker
  };
};