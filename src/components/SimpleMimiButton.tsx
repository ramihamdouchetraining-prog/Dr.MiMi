import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { AdvancedChatbot } from './AdvancedChatbot';

export const SimpleMimiButton: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <>
      {/* Bouton flottant Dr. MiMi - TOUJOURS VISIBLE */}
      <motion.button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          bottom: '24px',
          right: '24px'
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <img 
          src="/images/avatars/smiling.png"
          alt="Dr. MiMi"
          className="w-12 h-12 object-cover rounded-full"
          onError={(e) => {
            // Si l'image ne charge pas, utiliser une icône de secours
            e.currentTarget.style.display = 'none';
          }}
        />
        <MessageCircle 
          className="w-8 h-8 text-white absolute"
          style={{ display: 'none' }}
        />
        <motion.div
          className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chatbot complet si ouvert */}
      {showChatbot && (
        <div style={{ position: 'fixed', zIndex: 10000 }}>
          <AdvancedChatbot />
        </div>
      )}
    </>
  );
};