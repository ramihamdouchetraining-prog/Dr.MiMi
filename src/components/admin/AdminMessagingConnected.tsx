import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, Phone, Video, Paperclip, Smile, Mic, Image,
  User, Users, Clock, Check, CheckCheck, Star, Pin, Bell, BellOff,
  Heart, ThumbsUp, Laugh, MoreVertical
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  read: boolean;
  delivered: boolean;
  reactions?: { userId: string; emoji: string }[];
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
  type: 'direct' | 'group' | 'channel';
}

export const AdminMessagingConnected: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get auth token
  const getAuthToken = () => {
    // In production, get this from your auth context or localStorage
    return localStorage.getItem('authToken') || '';
  };

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    joinConversation,
    leaveConversation,
    sendChatMessage,
    sendTyping,
    markMessageRead,
    addReaction
  } = useWebSocket({
    token: getAuthToken(),
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('✅ Connected to messaging server');
      // Join previously selected conversation
      if (selectedConversation) {
        joinConversation(selectedConversation);
      }
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from messaging server');
    }
  });

  // Handle incoming WebSocket messages
  function handleWebSocketMessage(wsMessage: any) {
    switch (wsMessage.type) {
      case 'message':
        handleNewMessage(wsMessage.conversationId, wsMessage.message);
        break;
      case 'typing':
        handleTypingIndicator(wsMessage.conversationId, wsMessage.userId, wsMessage.isTyping);
        break;
      case 'user_status':
        handleUserStatus(wsMessage.userId, wsMessage.status);
        break;
      case 'read':
        handleMessageRead(wsMessage.conversationId, wsMessage.messageId);
        break;
      case 'reaction':
        handleReaction(wsMessage.conversationId, wsMessage.messageId, wsMessage.userId, wsMessage.emoji);
        break;
      default:
        break;
    }
  }

  // Handle new message
  const handleNewMessage = (conversationId: string, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));

    // Update conversation last message
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: message.content,
          lastMessageTime: new Date(message.timestamp),
          unreadCount: conv.id !== selectedConversation ? conv.unreadCount + 1 : 0
        };
      }
      return conv;
    }));

    // Scroll to bottom
    scrollToBottom();
  };

  // Handle typing indicator
  const handleTypingIndicator = (conversationId: string, userId: string, isTyping: boolean) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, isTyping };
      }
      return conv;
    }));
  };

  // Handle user status
  const handleUserStatus = (userId: string, status: 'online' | 'offline') => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (status === 'online') {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  // Handle message read
  const handleMessageRead = (conversationId: string, messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg => {
        if (msg.id === messageId) {
          return { ...msg, read: true };
        }
        return msg;
      })
    }));
  };

  // Handle reaction
  const handleReaction = (conversationId: string, messageId: string, userId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          return { 
            ...msg, 
            reactions: [...reactions, { userId, emoji }]
          };
        }
        return msg;
      })
    }));
  };

  // Load initial conversations
  useEffect(() => {
    // Load mock data for now - replace with API call
    const mockConversations: Conversation[] = [
      {
        id: 'conv1',
        name: 'Dr. Sarah Martin',
        avatar: '👩‍⚕️',
        lastMessage: 'Les nouvelles ressources sont prêtes',
        lastMessageTime: new Date(),
        unreadCount: 2,
        isOnline: true,
        isTyping: false,
        isPinned: true,
        isMuted: false,
        isGroup: false,
        type: 'direct'
      },
      {
        id: 'conv2',
        name: 'Équipe Médicale',
        avatar: '👥',
        lastMessage: 'Réunion demain à 14h',
        lastMessageTime: new Date(),
        unreadCount: 0,
        isOnline: true,
        isTyping: false,
        isPinned: false,
        isMuted: false,
        isGroup: true,
        type: 'group'
      }
    ];
    setConversations(mockConversations);
  }, []);

  // Select conversation
  const selectConversation = (conversationId: string) => {
    // Leave previous conversation
    if (selectedConversation) {
      leaveConversation(selectedConversation);
    }

    // Join new conversation
    setSelectedConversation(conversationId);
    joinConversation(conversationId);

    // Mark messages as read
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // Send via WebSocket
    sendChatMessage(selectedConversation, messageInput);
    
    // Clear input
    setMessageInput('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(selectedConversation, false);
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!selectedConversation) return;
    
    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(selectedConversation, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(selectedConversation, false);
    }, 2000);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = messages[selectedConversation || ''] || [];

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className="w-80 bg-gray-50 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Messages</h3>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <span className="flex items-center gap-1 text-xs bg-green-500 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Connecté
                </span>
              ) : isConnecting ? (
                <span className="text-xs bg-yellow-500 px-2 py-1 rounded-full">
                  Connexion...
                </span>
              ) : (
                <span className="text-xs bg-red-500 px-2 py-1 rounded-full">
                  Déconnecté
                </span>
              )}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/20 backdrop-blur rounded-lg text-white placeholder-white/70 text-sm"
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <motion.button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors ${
                selectedConversation === conv.id ? 'bg-purple-50' : ''
              }`}
              whileHover={{ x: 2 }}
            >
              <div className="relative">
                <div className="text-2xl">{conv.avatar}</div>
                {conv.isOnline && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800">{conv.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessageTime).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conv.isTyping ? (
                      <span className="text-purple-600 italic">En train d'écrire...</span>
                    ) : (
                      conv.lastMessage
                    )}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              
              {conv.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="text-2xl">{currentConversation?.avatar}</div>
                {currentConversation?.isOnline && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{currentConversation?.name}</h3>
                <p className="text-xs text-gray-500">
                  {currentConversation?.isTyping ? (
                    <span className="text-purple-600">En train d'écrire...</span>
                  ) : currentConversation?.isOnline ? (
                    'En ligne'
                  ) : (
                    'Hors ligne'
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.senderId === 'self' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.senderId === 'self' ? 'order-2' : ''}`}>
                  {msg.senderId !== 'self' && (
                    <p className="text-xs text-gray-500 mb-1">{msg.senderName}</p>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    msg.senderId === 'self'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.senderId === 'self' && (
                      msg.read ? (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      ) : msg.delivered ? (
                        <CheckCheck className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Check className="w-3 h-3 text-gray-400" />
                      )
                    )}
                  </div>
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.reactions.map((r, i) => (
                        <span key={i} className="text-sm">
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <Image className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-2 bg-white rounded-full text-sm"
              />
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={sendMessage}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagingConnected;