import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useAnimation } from 'framer-motion';
import { MessageSquare, X, Send, Minimize2, Maximize2, Bot, User, Sparkles } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

export const MobileChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis Dr. MiMi, votre assistant médical IA 🩺. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const dragConstraints = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Position de la bulle flottante
  const bubblePosition = isMobile ? { 
    right: position.x, 
    bottom: position.y 
  } : { 
    right: 30, 
    bottom: 30 
  };

  // Animation de pulsation pour attirer l'attention
  const pulseAnimation = {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simuler une réponse du bot (en production, appeler l'API)
    setTimeout(() => {
      const botResponses = [
        'Je comprends votre question. Laissez-moi vous aider avec ça.',
        'D\'après mes connaissances médicales, voici ce que je peux vous dire...',
        'C\'est une excellente question ! Voici les informations importantes à retenir.',
        'Je vais rechercher les dernières recommandations sur ce sujet.',
        'Voulez-vous que je vous explique plus en détail ?'
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isMobile) {
      const newX = Math.max(20, Math.min(window.innerWidth - 80, position.x - info.offset.x));
      const newY = Math.max(20, Math.min(window.innerHeight - 80, position.y - info.offset.y));
      setPosition({ x: newX, y: newY });
    }
  };

  // Composant Message
  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.sender === 'user' ? 'bg-blue-500 ml-2' : 'bg-gradient-to-br from-teal-500 to-purple-500 mr-2'
        }`}>
          {message.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>
        <div className={`px-4 py-2 rounded-2xl ${
          message.sender === 'user' 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}>
          <p className="text-sm">{message.text}</p>
          <p className={`text-xs mt-1 ${
            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Bulle flottante déplaçable */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag={isMobile}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.1 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, ...pulseAnimation }}
            exit={{ scale: 0 }}
            style={bubblePosition}
            className="fixed z-[9999] cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <div className="relative">
              {/* Badge de notification */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              {/* Tooltip mobile */}
              {isMobile && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Glissez pour déplacer
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-[10000] ${
              isMobile 
                ? 'inset-0' 
                : 'bottom-4 right-4 w-96 h-[600px] max-h-[80vh]'
            } bg-white rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Dr. MiMi Assistant</h3>
                    <p className="text-xs text-white/80 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                      En ligne
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-3 overflow-x-auto">
                {['📚 Cours', '🧪 Quiz', '💊 Médicaments', '🩺 Cas cliniques'].map(action => (
                  <button
                    key={action}
                    className="px-3 py-1 bg-white/20 rounded-full text-xs whitespace-nowrap hover:bg-white/30 transition"
                    onClick={() => setInputText(action.split(' ')[1])}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ height: 'calc(100% - 180px)' }}>
                  {messages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {/* Indicateur de frappe */}
                  {isTyping && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Bot className="w-5 h-5" />
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Posez votre question médicale..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-full hover:opacity-90 transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Alimenté par IA • Réponses médicales instantanées
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};