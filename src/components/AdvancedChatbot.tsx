import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Paperclip, Moon, Sun,
  FileText, Image as ImageIcon, File, Trash2,
  Minimize2, Maximize2, Loader2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

interface Attachment {
  filename: string; // Server filename
  originalName: string; // Display name
  type: 'image' | 'pdf' | 'text' | 'doc';
  url?: string;
  content?: string;
}

type ChatLanguage = 'ar' | 'en' | 'fr';
type ChatTheme = 'light' | 'dark';

export const AdvancedChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatTheme, setChatTheme] = useState<ChatTheme>('light');
  const [language, setLanguage] = useState<ChatLanguage>('fr');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const greetings = {
    ar: 'السلام عليكم ورحمة الله وبركاته 🌙',
    en: 'Assalamou Alykoum wa Rahmatullahi wa Barakatuh 🌙',
    fr: 'Assalamou Alykoum wa Rahmatullahi wa Barakatuh 🌙'
  };

  const welcomeMessages = {
    ar: 'أنا الدكتورة ميمي، مساعدتك الطبية الرقمية. كيف يمكنني مساعدتك اليوم؟ 💕',
    en: "I'm Dr. MiMi, your digital medical assistant. How can I help you today? 💕",
    fr: 'Je suis Dr. MiMi, ton assistante médicale digitale. Comment puis-je t\'aider aujourd\'hui ? 💕'
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `${greetings[language]}\n\n${welcomeMessages[language]}\n\n*Je ne remplace jamais un vrai médecin ou un vrai professeur.*`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        setAttachments(prev => [...prev, {
          filename: data.filename, // Server filename for deletion
          originalName: data.originalName, // Display name
          type: data.type,
          url: data.url,
          content: data.content
        }]);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];

    // Delete file from server
    try {
      await fetch(`/api/chat/upload/${attachment.filename}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Remove from local state
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })).concat({ role: 'user', content: inputValue }),
          language
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);

                // Handle errors from backend
                if (parsed.error) {
                  assistantContent = `❌ Erreur: ${parsed.error}`;
                  setMessages(prev => prev.map(m =>
                    m.id === assistantMessage.id
                      ? { ...m, content: assistantContent }
                      : m
                  ));
                  break;
                }

                // Only append if content exists
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessages(prev => prev.map(m =>
                    m.id === assistantMessage.id
                      ? { ...m, content: assistantContent }
                      : m
                  ));
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatTheme = () => {
    setChatTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const languageOptions = [
    { code: 'ar' as ChatLanguage, label: 'العربية', flag: '🇸🇦' },
    { code: 'en' as ChatLanguage, label: 'English', flag: '🇬🇧' },
    { code: 'fr' as ChatLanguage, label: 'Français', flag: '🇫🇷' }
  ];

  const bgColor = chatTheme === 'light' ? '#FFFFFF' : '#1E293B';
  const textColor = chatTheme === 'light' ? '#0B132B' : '#F1F5F9';
  const borderColor = chatTheme === 'light' ? '#E2E8F0' : '#334155';

  return (
    <>
      {/* Floating Avatar Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full p-0 overflow-hidden shadow-2xl"
          style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #9333EA 100%)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <img
            src="/images/logos/logo-hijab.png"
            alt="Dr. MiMi"
            className="w-full h-full object-cover"
          />
          <motion.div
            className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{
              bottom: isMinimized ? 'auto' : '20px',
              top: isMinimized ? '20px' : 'auto',
              right: '20px',
              width: isMinimized ? '350px' : '450px',
              height: isMinimized ? '60px' : '650px',
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`
            }}
            initial={{ scale: 0, opacity: 0, x: 100, y: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0, x: 100, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #9333EA 100%)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/images/logos/logo-hijab.png"
                  alt="Dr. MiMi"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <div>
                  <h3 className="font-bold text-lg">Dr. MiMi</h3>
                  <p className="text-xs opacity-90">Assistante Médicale IA</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as ChatLanguage)}
                  className="px-2 py-1 rounded bg-white/20 text-white text-sm border-none outline-none"
                  style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code} style={{ color: '#000' }}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>

                {/* Theme Toggle */}
                <button
                  onClick={toggleChatTheme}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {chatTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{
                    backgroundColor: chatTheme === 'light' ? '#F8FAFC' : '#0F172A',
                    direction: language === 'ar' ? 'rtl' : 'ltr'
                  }}
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : chatTheme === 'light'
                              ? 'bg-white text-gray-800 shadow-sm'
                              : 'bg-slate-700 text-gray-100'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((att, idx) => (
                              <div key={idx} className="text-xs opacity-75 flex items-center gap-1">
                                <File size={12} />
                                {att.originalName || att.filename}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : language, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`rounded-2xl p-3 ${chatTheme === 'light' ? 'bg-white' : 'bg-slate-700'
                        }`}>
                        <Loader2 className="animate-spin" size={20} style={{ color: textColor }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div
                    className="px-4 py-2 border-t"
                    style={{ borderColor, backgroundColor: bgColor }}
                  >
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: chatTheme === 'light' ? '#F1F5F9' : '#334155',
                            color: textColor
                          }}
                        >
                          {att.type === 'image' && <ImageIcon size={14} />}
                          {att.type === 'text' && <FileText size={14} />}
                          {att.type === 'pdf' && <File size={14} />}
                          <span className="truncate max-w-[100px]">{att.originalName}</span>
                          <button onClick={() => removeAttachment(idx)} className="hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div
                  className="p-4 border-t"
                  style={{ borderColor, backgroundColor: bgColor }}
                >
                  <div
                    className="flex items-end gap-2 p-2 rounded-xl"
                    style={{
                      backgroundColor: chatTheme === 'light' ? '#F1F5F9' : '#1E293B',
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                      style={{ color: textColor }}
                    >
                      <Paperclip size={20} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="hidden"
                    />
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={language === 'ar' ? 'اكتب رسالتك...' : language === 'en' ? 'Type your message...' : 'Écris ton message...'}
                      className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2"
                      style={{
                        color: textColor,
                        direction: language === 'ar' ? 'rtl' : 'ltr'
                      }}
                      rows={1}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #9333EA 100%)',
                        color: 'white'
                      }}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="text-xs mt-2 opacity-60" style={{ color: textColor }}>
                    {language === 'ar'
                      ? 'أنا لا أحل محل الطبيب الحقيقي 🩺'
                      : language === 'en'
                        ? 'I do not replace a real doctor 🩺'
                        : 'Je ne remplace pas un vrai médecin 🩺'}
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
