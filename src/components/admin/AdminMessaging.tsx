import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, MoreVertical, Phone, Video, Paperclip,
  Smile, Mic, Image, File, MapPin, User, Users, Clock,
  Check, CheckCheck, Edit, Trash2, Reply, Forward,
  Star, Pin, Archive, Settings, Plus, Hash, Lock,
  Globe, Bell, BellOff, Download, Copy, Info, Shield,
  UserPlus, LogOut, Camera, Calendar, Link2, Code,
  FileText, Music, Film, Heart, ThumbsUp, Laugh
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  content: string;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  read: boolean;
  delivered: boolean;
  attachments?: Attachment[];
  replyTo?: Message;
  reactions?: Reaction[];
  isPinned?: boolean;
  isStarred?: boolean;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'contact';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size: number;
  thumbnail?: string;
}

interface Reaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  isPinned: boolean;
  isMuted: boolean;
  isGroup: boolean;
  members?: string[];
  description?: string;
  type: 'direct' | 'group' | 'channel' | 'broadcast';
}

// Données fictives
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Dr. Sarah Martin',
    avatar: '👩‍⚕️',
    lastMessage: 'Les nouvelles ressources sont prêtes',
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
    isPinned: true,
    isMuted: false,
    isGroup: false,
    type: 'direct'
  },
  {
    id: '2',
    name: 'Équipe Contenu Médical',
    avatar: '👥',
    lastMessage: 'Réunion à 15h pour les nouveaux modules',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 5,
    isOnline: true,
    isTyping: true,
    isPinned: false,
    isMuted: false,
    isGroup: true,
    members: ['user1', 'user2', 'user3'],
    type: 'group'
  },
  {
    id: '3',
    name: 'Canal Annonces',
    avatar: '📢',
    lastMessage: 'Mise à jour importante du système',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    isOnline: true,
    isTyping: false,
    isPinned: false,
    isMuted: true,
    isGroup: true,
    type: 'channel'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'user1',
    senderName: 'Dr. Sarah Martin',
    senderAvatar: '👩‍⚕️',
    senderRole: 'Administrateur',
    content: 'Bonjour! J\'ai terminé la révision des cours de cardiologie.',
    timestamp: new Date(Date.now() - 7200000),
    read: true,
    delivered: true,
    messageType: 'text',
    status: 'read'
  },
  {
    id: '2',
    senderId: 'current',
    senderName: 'Moi',
    senderAvatar: '🧑‍⚕️',
    senderRole: 'Super Admin',
    content: 'Excellent travail! Pouvez-vous également vérifier les quiz associés?',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
    delivered: true,
    messageType: 'text',
    status: 'read'
  },
  {
    id: '3',
    senderId: 'user1',
    senderName: 'Dr. Sarah Martin',
    senderAvatar: '👩‍⚕️',
    senderRole: 'Administrateur',
    content: 'Les nouvelles ressources sont prêtes',
    timestamp: new Date(Date.now() - 300000),
    read: false,
    delivered: true,
    attachments: [
      {
        id: 'att1',
        type: 'file',
        url: '#',
        name: 'Cardiologie_Module_3.pdf',
        size: 2456789
      }
    ],
    messageType: 'file',
    status: 'delivered'
  }
];

// Composant Emoji Picker
const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👏', '💯', '🤔', '😍', '🙏', '💪'];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 grid grid-cols-6 gap-1"
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};

// Composant principal
export function AdminMessaging() {
  const { isFeminine } = useTheme();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim() && !replyingTo) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: 'Moi',
      senderAvatar: '🧑‍⚕️',
      senderRole: 'Super Admin',
      content: newMessage,
      timestamp: new Date(),
      read: false,
      delivered: false,
      messageType: 'text',
      status: 'sending',
      replyTo: replyingTo || undefined
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setReplyingTo(null);

    // Simuler l'envoi
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id 
          ? { ...m, status: 'delivered', delivered: true }
          : m
      ));
    }, 1000);
  };

  // Formater le temps
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
      {/* Sidebar conversations */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <motion.button
              key={conv.id}
              whileHover={{ x: 2 }}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedConversation?.id === conv.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
            >
              <div className="relative">
                <div className="text-2xl">{conv.avatar}</div>
                {conv.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {conv.name}
                    </span>
                    {conv.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                    {conv.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conv.isTyping ? (
                      <span className="italic">est en train d'écrire...</span>
                    ) : (
                      conv.lastMessage
                    )}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Nouveau chat */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle conversation
          </button>
        </div>
      </div>

      {/* Zone de chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header du chat */}
          <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="text-2xl">{selectedConversation.avatar}</div>
                {selectedConversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {selectedConversation.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedConversation.isOnline ? 'En ligne' : 'Hors ligne'}
                  {selectedConversation.isTyping && ' • Est en train d\'écrire...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.senderId === 'current' ? 'order-2' : ''}`}>
                  {/* Reply To */}
                  {message.replyTo && (
                    <div className="mb-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-purple-500">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {message.replyTo.senderName}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {message.replyTo.content}
                      </p>
                    </div>
                  )}
                  
                  <div className={`flex items-end space-x-2 ${message.senderId === 'current' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.senderId !== 'current' && (
                      <div className="text-2xl mb-1">{message.senderAvatar}</div>
                    )}
                    
                    <div>
                      {message.senderId !== 'current' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {message.senderName} • {message.senderRole}
                        </p>
                      )}
                      
                      <div
                        className={`relative group px-4 py-2 rounded-2xl ${
                          message.senderId === 'current'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2">
                            {message.attachments.map((att) => (
                              <div key={att.id} className="flex items-center space-x-2 p-2 bg-white/10 dark:bg-black/10 rounded-lg">
                                <FileText className="w-5 h-5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{att.name}</p>
                                  <p className="text-xs opacity-70">{formatFileSize(att.size)}</p>
                                </div>
                                <button className="p-1 hover:bg-white/20 dark:hover:bg-black/20 rounded">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="break-words">{message.content}</p>
                        
                        {/* Time & Status */}
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderId === 'current' && (
                            <span>
                              {message.status === 'read' ? (
                                <CheckCheck className="w-4 h-4 text-blue-400" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : message.status === 'sent' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="absolute -top-8 right-0 hidden group-hover:flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
                          <button
                            onClick={() => setReplyingTo(message)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                            <Forward className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                            <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          {message.senderId === 'current' && (
                            <>
                              <button
                                onClick={() => setEditingMessage(message.id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Reply indicator */}
            {replyingTo && (
              <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Répondre à {replyingTo.senderName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {replyingTo.content}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="w-full px-4 py-2 pr-24 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      // Gérer l'upload de fichiers
                      console.log(e.target.files);
                    }}
                  />
                </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <EmojiPicker onSelect={(emoji) => {
                    setNewMessage(newMessage + emoji);
                    setShowEmojiPicker(false);
                  }} />
                )}
                
                {/* Attach Menu */}
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 w-48"
                  >
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <File className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm">Document</span>
                    </button>
                    <button className="w-full p-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm">Image</span>
                    </button>
                    <button className="w-full p-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm">Caméra</span>
                    </button>
                    <button className="w-full p-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm">Localisation</span>
                    </button>
                    <button className="w-full p-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm">Contact</span>
                    </button>
                  </motion.div>
                )}
              </div>
              
              {/* Boutons d'envoi */}
              {newMessage.trim() ? (
                <button
                  onClick={sendMessage}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sélectionnez une conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choisissez une conversation dans la liste ou créez-en une nouvelle
            </p>
          </div>
        </div>
      )}

      {/* Panneau d'informations */}
      <AnimatePresence>
        {showInfo && selectedConversation && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{selectedConversation.avatar}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedConversation.name}
                </h3>
                {selectedConversation.isGroup && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.members?.length} membres
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Notifications</span>
                </button>
                
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Pin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Messages épinglés</span>
                </button>
                
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Médias partagés</span>
                </button>
                
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <File className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Fichiers partagés</span>
                </button>
                
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Liens partagés</span>
                </button>
              </div>
              
              {selectedConversation.isGroup && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Membres
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2">
                      <div className="text-2xl">👨‍⚕️</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Dr. Ahmed K.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2">
                      <div className="text-2xl">👩‍⚕️</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Dr. Sarah M.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Membre</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full p-3 flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Quitter la conversation</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Import manquant
import { X } from 'lucide-react';

export default AdminMessaging;