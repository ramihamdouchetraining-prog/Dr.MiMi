import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  User,
  Circle,
  Smile,
  Paperclip,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  type: 'direct' | 'group';
}

interface ChatProps {
  currentUserId: string;
  currentUserRole: string;
  isOpen: boolean;
  onClose: () => void;
  position?: 'modal' | 'sidebar' | 'floating';
}

const Chat: React.FC<ChatProps> = ({ 
  currentUserId, 
  currentUserRole, 
  isOpen, 
  onClose, 
  position = 'floating' 
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjCOyNG8eDMGJ2z1//LghF4pBCN8sMLfkEwKDVuv5/OuYi4A');
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/chat`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // Authenticate WebSocket connection
      wsRef.current?.send(JSON.stringify({
        type: 'auth',
        userId: currentUserId
      }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          // Add new message to cache
          queryClient.setQueryData<Message[]>(
            ['messages', data.message.conversationId],
            (oldMessages) => [...(oldMessages || []), data.message]
          );
          
          // Play notification sound
          if (soundEnabled && data.message.senderId !== currentUserId) {
            audioRef.current?.play().catch(() => {});
          }
          
          // Refresh conversations list
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          break;
          
        case 'typing_status':
          if (data.isTyping) {
            setTypingUsers(prev => new Set(prev).add(data.userId));
          } else {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }
          break;
          
        case 'message_read':
          queryClient.setQueryData<Message[]>(
            ['messages', selectedConversation?.id],
            (oldMessages) => oldMessages?.map(msg => 
              msg.id === data.messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
            )
          );
          break;
          
        case 'user_status':
          queryClient.invalidateQueries({ queryKey: ['online-users'] });
          break;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [isOpen, currentUserId, selectedConversation, soundEnabled, queryClient]);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/chat/conversations', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    enabled: isOpen
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/chat/messages/${selectedConversation.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation
  });

  // Fetch online users
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['online-users'],
    queryFn: async () => {
      const response = await fetch('/api/chat/online-users', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch online users');
      return response.json();
    },
    enabled: isOpen,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: selectedConversation?.id,
          receiverId: selectedConversation?.participants[0]?.id,
          content
        })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (newMessage) => {
      // Optimistic update
      queryClient.setQueryData<Message[]>(
        ['messages', selectedConversation?.id],
        (oldMessages) => [...(oldMessages || []), newMessage]
      );
      
      // Send via WebSocket
      wsRef.current?.send(JSON.stringify({
        type: 'message',
        conversationId: selectedConversation?.id,
        receiverId: selectedConversation?.participants[0]?.id,
        content: newMessage.content
      }));
      
      setMessageInput('');
      scrollToBottom();
    }
  });

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    if (messageIds.length === 0) return;
    
    wsRef.current?.send(JSON.stringify({
      type: 'read',
      messageIds
    }));
    
    fetch(`/api/chat/messages/${messageIds[0]}/read`, {
      method: 'PUT',
      credentials: 'include'
    });
  }, []);

  // Handle typing
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      wsRef.current?.send(JSON.stringify({
        type: 'typing',
        conversationId: selectedConversation?.id,
        isTyping: true
      }));
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsRef.current?.send(JSON.stringify({
        type: 'typing',
        conversationId: selectedConversation?.id,
        isTyping: false
      }));
    }, 2000);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages
        .filter(msg => !msg.isRead && msg.senderId !== currentUserId)
        .map(msg => msg.id);
      
      markAsRead(unreadMessages);
    }
  }, [selectedConversation, messages, currentUserId, markAsRead]);

  // Format timestamp
  const formatTimestamp = (date: string) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Hier ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'dd/MM HH:mm');
    }
  };

  // Format last seen
  const formatLastSeen = (date?: string) => {
    if (!date) return 'Jamais vu';
    return `Vu ${formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })}`;
  };

  // Filtered conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const participantNames = conv.participants
      .map(p => `${p.firstName} ${p.lastName}`.toLowerCase())
      .join(' ');
    
    return participantNames.includes(searchQuery.toLowerCase()) ||
           conv.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get total unread count
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const chatContent = (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
              >
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">Chargement...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Aucune conversation</div>
          ) : (
            filteredConversations.map((conv) => {
              const otherParticipant = conv.participants[0];
              const isSelected = selectedConversation?.id === conv.id;
              const isOnline = onlineUsers.some(u => u.id === otherParticipant?.id && u.isOnline);
              
              return (
                <motion.button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                      {otherParticipant?.profileImageUrl ? (
                        <img 
                          src={otherParticipant.profileImageUrl} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{otherParticipant?.firstName?.[0]}{otherParticipant?.lastName?.[0]}</span>
                      )}
                    </div>
                    {isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {otherParticipant?.firstName} {otherParticipant?.lastName}
                      </h3>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.lastMessagePreview || 'Commencer une conversation'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Online Users */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">En ligne</h3>
          <div className="flex gap-2 overflow-x-auto">
            {onlineUsers
              .filter(u => u.id !== currentUserId && u.isOnline)
              .map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    // Start new conversation or select existing
                    const existingConv = conversations.find(c => 
                      c.participants.some(p => p.id === user.id)
                    );
                    
                    if (existingConv) {
                      setSelectedConversation(existingConv);
                    } else {
                      // Create new conversation
                      const newConv: Conversation = {
                        id: `temp-${Date.now()}`,
                        participants: [user as Participant],
                        unreadCount: 0,
                        type: 'direct'
                      };
                      setSelectedConversation(newConv);
                    }
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={`${user.firstName} ${user.lastName}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                      )}
                    </div>
                    <Circle className="absolute bottom-0 right-0 w-2.5 h-2.5 text-green-500 fill-current" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[60px]">
                    {user.firstName}
                  </span>
                </button>
              ))
            }
          </div>
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.participants[0]?.profileImageUrl ? (
                    <img 
                      src={selectedConversation.participants[0].profileImageUrl} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {selectedConversation.participants[0]?.firstName?.[0]}
                      {selectedConversation.participants[0]?.lastName?.[0]}
                    </span>
                  )}
                </div>
                {onlineUsers.some(u => u.id === selectedConversation.participants[0]?.id && u.isOnline) && (
                  <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {selectedConversation.participants[0]?.firstName} {selectedConversation.participants[0]?.lastName}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.participants[0]?.role === 'owner' && 'Owner'}
                  {selectedConversation.participants[0]?.role === 'admin' && 'Administrateur'}
                  {selectedConversation.participants[0]?.role === 'editor' && 'Éditeur'}
                  {onlineUsers.some(u => u.id === selectedConversation.participants[0]?.id && u.isOnline) 
                    ? ' • En ligne' 
                    : ` • ${formatLastSeen(selectedConversation.participants[0]?.lastSeenAt)}`}
                </p>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="text-center text-gray-500">Chargement des messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Commencez une conversation</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}
                    >
                      {!isOwn && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {message.sender?.profileImageUrl ? (
                            <img 
                              src={message.sender.profileImageUrl} 
                              alt="" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span>{message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}</span>
                          )}
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div className="w-8" />}
                      
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn 
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white'
                          }`}
                        >
                          <p 
                            className="text-sm whitespace-pre-wrap break-words" 
                            dir="auto"
                            style={{ 
                              wordWrap: 'break-word', 
                              unicodeBidi: 'plaintext' 
                            }}
                          >
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.createdAt)}
                          </span>
                          {isOwn && (
                            <>
                              {message.isRead ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3 text-gray-400" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500">est en train d'écrire</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (messageInput.trim()) {
                  sendMessageMutation.mutate(messageInput);
                }
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                dir="auto"
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordWrap: 'break-word', 
                  unicodeBidi: 'plaintext' 
                }}
              />
              
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                type="submit"
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sélectionnez une conversation
            </h3>
            <p className="text-gray-500">
              Ou démarrez une nouvelle discussion avec un administrateur en ligne
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Render based on position
  if (position === 'floating') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-4 w-[800px] h-[600px] z-50"
          >
            <div className="relative h-full">
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              {chatContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  if (position === 'modal') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-[10%] z-50"
            >
              <div className="relative h-full">
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                {chatContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
  
  // Sidebar position
  return isOpen ? (
    <div className="h-full">
      {chatContent}
    </div>
  ) : null;
};

export default Chat;