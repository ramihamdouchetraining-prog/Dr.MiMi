import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, Brain, Stethoscope, Lightbulb, Volume2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MimiAnimated from './MimiAnimated';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  relatedTopics?: string[];
}

type TutorMode = 'tutor' | 'socratic' | 'exam' | 'clinical' | 'mnemonics';

export default function AITutor() {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TutorMode>('tutor');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [level, setLevel] = useState('dfgsm');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modes = [
    { value: 'tutor', label: 'Tuteur', icon: BookOpen, color: 'from-blue-500 to-cyan-500', emoji: '📚' },
    { value: 'socratic', label: 'Socratique', icon: Brain, color: 'from-purple-500 to-pink-500', emoji: '🧠' },
    { value: 'exam', label: 'Examen', icon: Stethoscope, color: 'from-red-500 to-orange-500', emoji: '📝' },
    { value: 'clinical', label: 'Clinique', icon: Stethoscope, color: 'from-green-500 to-teal-500', emoji: '🏥' },
    { value: 'mnemonics', label: 'Mnémotechnique', icon: Lightbulb, color: 'from-yellow-500 to-amber-500', emoji: '💡' },
  ];

  const levels = [
    { value: 'paces', label: 'PACES' },
    { value: 'dfgsm', label: 'DFGSM' },
    { value: 'dfasm', label: 'DFASM' },
    { value: 'residanat', label: 'Résidanat' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const askAI = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          question,
          context: {
            topic: selectedTopic,
            level,
            previousMessages: messages.slice(-4).map(m => ({
              role: m.role,
              content: m.content
            }))
          },
          language: i18n.language
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.answer,
          timestamp: new Date(),
          suggestions: data.data.suggestions,
          relatedTopics: data.data.relatedTopics
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('❌ AI Tutor Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Désolée, une erreur s'est produite : ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askAI(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    askAI(suggestion);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const giveFeedback = async (messageId: string, rating: 'up' | 'down') => {
    try {
      await fetch('/api/ai-tutor/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionId: messageId,
          rating: rating === 'up' ? 5 : 1
        })
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const currentMode = modes.find(m => m.value === mode)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <MimiAnimated state="talk" size="large" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🧠 Dr.MiMi AI Tutor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Ton assistante d'apprentissage intelligent
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {modes.map((m) => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(m.value as TutorMode)}
                className={`
                  px-4 py-2 rounded-full flex items-center gap-2 transition-all
                  ${mode === m.value
                    ? `bg-gradient-to-r ${m.color} text-white shadow-lg`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="font-medium">{m.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Context Controls */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            >
              {levels.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Sujet (optionnel)"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            />
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Pose-moi n'importe quelle question médicale !
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Mode actuel : <span className="font-bold text-purple-600">{currentMode.label} {currentMode.emoji}</span>
                </p>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div className={`inline-block max-w-[80%] ${message.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} rounded-2xl p-4 shadow-lg`}>
                    <div className="prose dark:prose-invert max-w-none">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">{line}</p>
                      ))}
                    </div>

                    {message.role === 'assistant' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        <button
                          onClick={() => speakText(message.content)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                          title="Écouter"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                          title="Copier"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => giveFeedback(message.id, 'up')}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                          title="Utile"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => giveFeedback(message.id, 'down')}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                          title="Pas utile"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">💡 Suggestions :</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs px-3 py-1 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-500"
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Dr.MiMi réfléchit...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pose ta question en mode ${currentMode.label}...`}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              <Send className="w-5 h-5" />
              Envoyer
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
