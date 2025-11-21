import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Paperclip, Image,
  Download, Copy, RefreshCw, Settings, Maximize2, Minimize2,
  Moon, Sun, Languages, HelpCircle, History, BookOpen,
  Brain, Heart, Pill, Stethoscope, Activity, AlertTriangle,
  CheckCircle, X, ArrowLeft, Sparkles, Bot, User,
  ThumbsUp, ThumbsDown, Share2, MoreVertical, Zap
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
  attachments?: Attachment[];
  feedback?: 'positive' | 'negative';
  suggestions?: string[];
  medicalInfo?: MedicalInfo;
}

interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

interface MedicalInfo {
  category: 'anatomy' | 'pathology' | 'pharmacology' | 'clinical' | 'emergency';
  severity?: 'info' | 'warning' | 'critical';
  references?: string[];
}

// Suggestions prédéfinies
const quickSuggestions = [
  { text: "Symptômes du COVID-19", icon: AlertTriangle },
  { text: "Anatomie du cœur", icon: Heart },
  { text: "Dosage paracétamol", icon: Pill },
  { text: "Examen clinique", icon: Stethoscope },
  { text: "ECG interpretation", icon: Activity },
  { text: "Neurologie basics", icon: Brain }
];

// Messages d'accueil selon la langue
const welcomeMessages = {
  fr: "Bonjour! Je suis Dr. MiMi, votre assistante médicale virtuelle. Comment puis-je vous aider aujourd'hui?",
  en: "Hello! I'm Dr. MiMi, your virtual medical assistant. How can I help you today?",
  ar: "مرحباً! أنا الدكتورة ميمي، مساعدتك الطبية الافتراضية. كيف يمكنني مساعدتك اليوم؟"
};

export function ChatbotPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages.fr,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "Expliquez-moi l'anatomie du cœur",
        "Quels sont les symptômes de l'hypertension?",
        "Comment fonctionne le système immunitaire?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Appeler l'API Gemini réelle
  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    try {
      // Préparer le contexte de conversation
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le serveur');
      }

      // Lire le stream de réponse
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('Impossible de lire la réponse');
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
              }
            } catch (e) {
              // Ignorer les erreurs de parsing
            }
          }
        }
      }

      return fullResponse || "Je suis désolée, je n'ai pas pu traiter votre demande. Veuillez réessayer.";
    } catch (error) {
      console.error('Erreur API:', error);
      // Réponse de secours en cas d'erreur
      return `Je suis temporairement indisponible. Voici une réponse de base:

## 💫 Assistance Médicale Dr. MiMi

Je suis votre assistante médicale virtuelle. Je peux vous aider avec:

- 📚 **Concepts médicaux**: Anatomie, physiologie, pathologie
- 🩺 **Diagnostics**: Comprendre les symptômes et examens
- 💊 **Pharmacologie**: Médicaments et traitements
- 🔬 **Analyses**: Interprétation des résultats
- 🚨 **Urgences**: Conseils de premiers secours

⚠️ **Note importante**: En cas d'urgence médicale réelle, contactez immédiatement les services d'urgence (15 ou 112).

Posez-moi votre question et je ferai de mon mieux pour vous aider!`;
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Appeler l'API Gemini
    try {
      const responseContent = await fetchBotResponse(inputMessage);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'bot',
        timestamp: new Date(),
        medicalInfo: {
          category: 'anatomy',
          severity: 'info'
        }
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Gérer les suggestions
  const handleSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    sendMessage();
  };

  // Text-to-speech
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Dr. MiMi
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Assistant Médical IA • En ligne
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <History className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Container */}
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isFullscreen ? 'min-h-screen' : ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Quick Suggestions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                {quickSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestion(suggestion.text)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full whitespace-nowrap"
                  >
                    <suggestion.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {suggestion.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                      <div className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                          {message.sender === 'user' ? (
                            <User className="w-6 h-6 text-white" />
                          ) : (
                            <Sparkles className="w-6 h-6 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className={`rounded-2xl px-5 py-3 ${message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                            {message.sender === 'bot' ? (
                              <div className="prose dark:prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>

                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="mt-3 space-y-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestion(suggestion)}
                                  className="block w-full text-left px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                  <span className="text-sm text-purple-700 dark:text-purple-300">
                                    💡 {suggestion}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            {message.sender === 'bot' && (
                              <>
                                <button
                                  onClick={() => navigator.clipboard.writeText(message.content)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>

                                <button
                                  onClick={() => speakMessage(message.content)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  {isSpeaking ? (
                                    <VolumeX className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                  ) : (
                                    <Volume2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                  )}
                                </button>

                                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                                  <ThumbsUp className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>

                                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                                  <ThumbsDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-3">
                    <div className="flex items-center space-x-1">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // Gérer l'upload d'image
                    console.log(e.target.files);
                  }}
                />

                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Posez votre question médicale..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                Dr. MiMi utilise l'IA pour fournir des informations médicales éducatives.
                Ne remplace pas un avis médical professionnel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;