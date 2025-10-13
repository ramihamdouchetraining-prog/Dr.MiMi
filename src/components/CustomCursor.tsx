import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [trail, setTrail] = useState<CursorPosition[]>([]);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Add to trail
      setTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY }];
        return newTrail.slice(-10); // Keep only last 10 positions
      });
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const checkPointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isPointerElement = window.getComputedStyle(target).cursor === 'pointer' ||
                               target.tagName === 'BUTTON' ||
                               target.tagName === 'A' ||
                               target.onclick !== null ||
                               target.closest('button') !== null ||
                               target.closest('a') !== null;
      setIsPointer(isPointerElement);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', checkPointer);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Hide default cursor ONLY if custom cursor is enabled and not on touch devices
    // This fixes the cursor visibility bug for non-French languages
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      document.body.style.cursor = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', checkPointer);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      // Always restore cursor on cleanup - fixes cursor visibility in language changes
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      {/* Cursor trail */}
      {trail.map((position, index) => (
        <motion.div
          key={index}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: position.x,
            top: position.y,
          }}
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `linear-gradient(135deg, #FF69B4 ${index * 10}%, #FFB6C1 ${100 - index * 10}%)`,
              opacity: 0.3 + (index * 0.05)
            }}
          />
        </motion.div>
      ))}
      
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 10,
          y: mousePosition.y - 10,
          scale: isClicked ? 0.8 : isPointer ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div 
          className="w-5 h-5 rounded-full"
          style={{
            background: isPointer 
              ? 'radial-gradient(circle, #FF69B4, #FFB6C1)'
              : 'radial-gradient(circle, rgba(255, 105, 180, 0.8), rgba(255, 182, 193, 0.4))',
            boxShadow: '0 0 20px rgba(255, 105, 180, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            transform: isPointer ? 'scale(1.2)' : 'scale(1)'
          }}
        />
        
        {/* Inner dot */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />
        
        {/* Sparkles when clicking */}
        {isClicked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-yellow-300"
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 1,
                  opacity: 1
                }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 20,
                  y: Math.sin(i * 60 * Math.PI / 180) * 20,
                  scale: 0,
                  opacity: 0
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </>
        )}
      </motion.div>
    </>
  );
};

// Optional: Enable/disable custom cursor based on device
export const useCustomCursor = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setEnabled(!isTouchDevice);
  }, []);

  return enabled;
};