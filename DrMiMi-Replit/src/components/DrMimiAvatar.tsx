// Dr. Mimi Avatar Component - Young female doctor with hijab
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface DrMimiAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

export const DrMimiAvatar: React.FC<DrMimiAvatarProps> = ({ 
  size = 'md', 
  className = '',
  showName = false 
}) => {
  const { isFeminine } = useTheme();

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

  // Fallback avatar with initials if image not available
  const FallbackAvatar = () => (
    <div className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center font-display font-semibold text-white transition-all duration-300`}
         style={{ 
           backgroundColor: isFeminine ? '#ec4899' : '#0FA3B1',
           background: isFeminine 
             ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
             : 'linear-gradient(135deg, #0FA3B1 0%, #1363DF 100%)'
         }}>
      <span className={textSizes[size]}>M</span>
    </div>
  );

  // Dr. Mimi avatar image
  const DrMimiImage = () => (
    <img 
      src="/images/logos/logo-hijab.png"
      alt="Dr. Mimi - Assistante médicale"
      className={`${sizeClasses[size]} ${className} rounded-full object-cover transition-all duration-300 border-2`}
      style={{ 
        borderColor: isFeminine ? '#ec4899' : '#0FA3B1',
        boxShadow: isFeminine 
          ? '0 4px 12px rgba(236, 72, 153, 0.3)'
          : '0 4px 12px rgba(15, 163, 177, 0.3)'
      }}
      onError={(e) => {
        // If image fails to load, show fallback
        e.currentTarget.style.display = 'none';
        const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
        if (nextSibling) {
          nextSibling.style.display = 'flex';
        }
      }}
    />
  );

  return (
    <div className="flex items-center space-x-3">
      {/* Avatar Image */}
      <div className="relative">
        {/* Try to load Dr. Mimi image first, fallback to styled initials */}
        <DrMimiImage />
        <div style={{ display: 'none' }}>
          <FallbackAvatar />
        </div>
        
        {/* Online indicator for chat contexts */}
        {size !== 'sm' && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Name and title */}
      {showName && (
        <div className="flex flex-col">
          <span className={`font-display font-semibold ${textSizes[size]} text-neutral`}>
            Dr. Mimi
          </span>
          <span className={`${textSizes[size]} text-gray-500 text-xs`}>
            {isFeminine ? 'Assistante médicale 💕' : 'Assistante médicale 🩺'}
          </span>
        </div>
      )}
    </div>
  );
};

// Animated version for special contexts
export const AnimatedDrMimiAvatar: React.FC<DrMimiAvatarProps> = (props) => {
  return (
    <div className="animate-pulse">
      <DrMimiAvatar {...props} />
    </div>
  );
};