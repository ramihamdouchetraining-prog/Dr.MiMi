import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, Users,
  MessageSquare, Settings, Grid, List, Calendar, Clock, Plus,
  X, ChevronDown, ChevronUp, MoreVertical, Copy, Share2, Lock,
  Unlock, UserPlus, UserMinus, Hand, PresentationIcon, Record,
  StopCircle, Download, Upload, FileText, Image, Code, Link2,
  Smile, Send, Pin, Star, Bell, BellOff, Shield, Camera,
  ScreenShare, ScreenShareOff, Headphones, Volume2, VolumeX,
  Wifi, WifiOff, Eye, EyeOff, AlertTriangle, CheckCircle,
  Award, Trophy, BookOpen, Brain, Heart, Sparkles, Zap,
  Layout, Maximize2, Minimize2, ArrowLeft, Home, Hash,
  Globe, Folder, File, Music, Film, Palette, Bot, Gamepad2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Types
interface Room {
  id: string;
  name: string;
  type: 'meeting' | 'classroom' | 'study-group' | 'event';
  description: string;
  host: User;
  participants: User[];
  maxParticipants: number;
  isPublic: boolean;
  isRecording: boolean;
  startTime?: Date;
  endTime?: Date;
  tags: string[];
  features: RoomFeature[];
  status: 'waiting' | 'active' | 'ended';
  thumbnail?: string;
  password?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'host' | 'moderator' | 'participant' | 'viewer';
  isMuted: boolean;
  isVideoOn: boolean;
  isPresenting: boolean;
  isHandRaised: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  specialization?: string;
}

interface RoomFeature {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
}

interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'announcement';
  reactions?: string[];
  isPinned?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'video';
  icon: any;
  unreadCount?: number;
  isPrivate: boolean;
  members?: User[];
}

// Données fictives
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Cours Cardiologie - Live',
    type: 'classroom',
    description: 'Session interactive sur les pathologies cardiaques',
    host: {
      id: '1',
      name: 'Dr. Sarah Martin',
      avatar: '👩‍⚕️',
      role: 'host',
      isMuted: false,
      isVideoOn: true,
      isPresenting: true,
      isHandRaised: false,
      status: 'online',
      specialization: 'Cardiologie'
    },
    participants: [
      {
        id: '2',
        name: 'Ahmed B.',
        avatar: '👨‍🎓',
        role: 'participant',
        isMuted: true,
        isVideoOn: false,
        isPresenting: false,
        isHandRaised: false,
        status: 'online'
      },
      {
        id: '3',
        name: 'Fatima Z.',
        avatar: '👩‍🎓',
        role: 'participant',
        isMuted: true,
        isVideoOn: true,
        isPresenting: false,
        isHandRaised: true,
        status: 'online'
      }
    ],
    maxParticipants: 50,
    isPublic: true,
    isRecording: true,
    tags: ['Cardiologie', 'Live', 'Interactif'],
    features: [
      { id: '1', name: 'Partage d\'écran', icon: Monitor, enabled: true },
      { id: '2', name: 'Chat', icon: MessageSquare, enabled: true },
      { id: '3', name: 'Tableau blanc', icon: PresentationIcon, enabled: true },
      { id: '4', name: 'Quiz en direct', icon: Brain, enabled: true },
      { id: '5', name: 'Breakout rooms', icon: Users, enabled: false }
    ],
    status: 'active',
    startTime: new Date(Date.now() - 1800000)
  },
  {
    id: '2',
    name: 'Groupe d\'étude - Anatomie',
    type: 'study-group',
    description: 'Révision collaborative pour l\'examen',
    host: {
      id: '4',
      name: 'Karim M.',
      avatar: '👨‍🎓',
      role: 'host',
      isMuted: false,
      isVideoOn: true,
      isPresenting: false,
      isHandRaised: false,
      status: 'online'
    },
    participants: [],
    maxParticipants: 10,
    isPublic: false,
    isRecording: false,
    tags: ['Anatomie', 'Révision', 'Petit groupe'],
    features: [
      { id: '1', name: 'Partage d\'écran', icon: Monitor, enabled: true },
      { id: '2', name: 'Chat', icon: MessageSquare, enabled: true },
      { id: '3', name: 'Notes partagées', icon: FileText, enabled: true }
    ],
    status: 'waiting',
    password: '1234'
  }
];

const channels: Channel[] = [
  { id: '1', name: 'général', type: 'text', icon: Hash, unreadCount: 3, isPrivate: false },
  { id: '2', name: 'cardiologie', type: 'text', icon: Heart, unreadCount: 0, isPrivate: false },
  { id: '3', name: 'neurologie', type: 'text', icon: Brain, unreadCount: 1, isPrivate: false },
  { id: '4', name: 'Voice Chat', type: 'voice', icon: Headphones, isPrivate: false },
  { id: '5', name: 'Salle d\'étude 1', type: 'video', icon: Video, isPrivate: false },
  { id: '6', name: 'admin-only', type: 'text', icon: Shield, isPrivate: true }
];

// Composant principal
export function ModernCollaborativePlatform() {
  const { isDarkMode } = useTheme();
  const { t, locale } = useLanguage();
  const [activeView, setActiveView] = useState<'lobby' | 'room'>('lobby');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomSettings, setRoomSettings] = useState({
    name: '',
    description: '',
    type: 'meeting' as Room['type'],
    maxParticipants: 10,
    isPublic: true,
    password: '',
    features: [] as string[]
  });
  const videoGridRef = useRef<HTMLDivElement>(null);

  // Créer une nouvelle salle
  const createRoom = () => {
    if (!roomSettings.name) return;

    const newRoom: Room = {
      id: Date.now().toString(),
      name: roomSettings.name,
      type: roomSettings.type,
      description: roomSettings.description,
      host: {
        id: 'current',
        name: 'Vous',
        avatar: '👤',
        role: 'host',
        isMuted: false,
        isVideoOn: true,
        isPresenting: false,
        isHandRaised: false,
        status: 'online'
      },
      participants: [],
      maxParticipants: roomSettings.maxParticipants,
      isPublic: roomSettings.isPublic,
      isRecording: false,
      tags: [],
      features: [
        { id: '1', name: 'Partage d\'écran', icon: Monitor, enabled: true },
        { id: '2', name: 'Chat', icon: MessageSquare, enabled: true },
        { id: '3', name: 'Tableau blanc', icon: PresentationIcon, enabled: true }
      ],
      status: 'waiting',
      password: roomSettings.password
    };

    mockRooms.unshift(newRoom);
    setSelectedRoom(newRoom);
    setActiveView('room');
    setIsCreatingRoom(false);
    setRoomSettings({
      name: '',
      description: '',
      type: 'meeting',
      maxParticipants: 10,
      isPublic: true,
      password: '',
      features: []
    });
  };

  // Rejoindre une salle
  const joinRoom = (room: Room) => {
    setSelectedRoom(room);
    setActiveView('room');
  };

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: {
        id: 'current',
        name: 'Vous',
        avatar: '👤',
        role: 'participant',
        isMuted: false,
        isVideoOn: true,
        isPresenting: false,
        isHandRaised: false,
        status: 'online'
      },
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {activeView === 'lobby' ? (
        // Vue Lobby
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Centre de Collaboration Médicale
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Apprenez ensemble, partagez vos connaissances, réussissez ensemble
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreatingRoom(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Créer une Salle
              </motion.button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockRooms.reduce((acc, room) => acc + room.participants.length, 0) + mockRooms.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En ligne</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockRooms.filter(r => r.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Salles actives</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockRooms.filter(r => r.type === 'classroom').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cours en direct</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sessions aujourd'hui</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-4 mb-6">
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium">
              Toutes
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
              Cours
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
              Groupes d'étude
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
              Événements
            </button>
          </div>

          {/* Liste des salles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => joinRoom(room)}
              >
                {/* Thumbnail */}
                <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                  {room.status === 'active' && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span>LIVE</span>
                    </div>
                  )}
                  
                  {room.isRecording && (
                    <div className="absolute top-3 left-3 flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                      <Record className="w-3 h-3" />
                      <span>REC</span>
                    </div>
                  )}
                  
                  {!room.isPublic && (
                    <div className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-lg">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    {room.type === 'classroom' ? (
                      <BookOpen className="w-16 h-16 text-white/50" />
                    ) : room.type === 'study-group' ? (
                      <Users className="w-16 h-16 text-white/50" />
                    ) : (
                      <Video className="w-16 h-16 text-white/50" />
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {room.description}
                  </p>
                  
                  {/* Host info */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="text-xl">{room.host.avatar}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {room.host.name}
                      </p>
                      {room.host.specialization && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {room.host.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {room.participants.length}/{room.maxParticipants}
                      </span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        joinRoom(room);
                      }}
                    >
                      Rejoindre
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        // Vue Salle
        <div className="h-screen flex flex-col bg-gray-900">
          {/* Header de la salle */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveView('lobby')}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedRoom?.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedRoom?.participants.length} participants
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isRecording && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-red-600 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">REC</span>
                  </div>
                )}
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {isRecording ? <StopCircle className="w-5 h-5" /> : <Record className="w-5 h-5" />}
                </button>
                
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
                
                <button
                  onClick={() => setActiveView('lobby')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Quitter
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex">
            {/* Sidebar gauche - Channels */}
            <div className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold mb-3">Canaux</h3>
                <div className="space-y-1">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        selectedChannel?.id === channel.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <channel.icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{channel.name}</span>
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {channel.unreadCount}
                        </span>
                      )}
                      {channel.isPrivate && <Lock className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Fonctionnalités */}
              <div className="p-4 flex-1">
                <h3 className="text-white font-semibold mb-3">Outils</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    <PresentationIcon className="w-4 h-4" />
                    <span>Tableau blanc</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    <Brain className="w-4 h-4" />
                    <span>Quiz en direct</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Notes partagées</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    <Folder className="w-4 h-4" />
                    <span>Fichiers</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Zone vidéo principale */}
            <div className="flex-1 flex flex-col">
              {/* Grille vidéo */}
              <div ref={videoGridRef} className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Video du host */}
                  <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl">{selectedRoom?.host.avatar}</div>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      {selectedRoom?.host.isPresenting && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                          Présente
                        </span>
                      )}
                      <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                        {selectedRoom?.host.name}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      {!selectedRoom?.host.isMuted && (
                        <div className="p-2 bg-black/50 rounded-full">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Videos des participants */}
                  {selectedRoom?.participants.map((participant) => (
                    <div key={participant.id} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {participant.isVideoOn ? (
                          <div className="text-6xl">{participant.avatar}</div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-2xl">{participant.avatar}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                          {participant.name}
                        </span>
                      </div>
                      {participant.isHandRaised && (
                        <div className="absolute top-3 right-3 p-2 bg-yellow-500 rounded-full">
                          <Hand className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                        {participant.isMuted ? (
                          <div className="p-2 bg-red-600 rounded-full">
                            <MicOff className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="p-2 bg-black/50 rounded-full">
                            <Mic className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Ma vidéo */}
                  <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isVideoOn ? (
                        <div className="text-6xl">👤</div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Vous
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      {isMuted ? (
                        <div className="p-2 bg-red-600 rounded-full">
                          <MicOff className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="p-2 bg-black/50 rounded-full">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contrôles */}
              <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-all ${
                      isMuted 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                  </button>
                  
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-4 rounded-full transition-all ${
                      !isVideoOn 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
                  </button>
                  
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-4 rounded-full transition-all ${
                      isScreenSharing 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isScreenSharing ? <ScreenShareOff className="w-6 h-6 text-white" /> : <ScreenShare className="w-6 h-6 text-white" />}
                  </button>
                  
                  <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                    <Hand className="w-6 h-6 text-white" />
                  </button>
                  
                  <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                    <MoreVertical className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar droite - Chat & Participants */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => {
                    setShowChat(true);
                    setShowParticipants(false);
                  }}
                  className={`flex-1 px-4 py-3 font-medium transition-colors ${
                    showChat 
                      ? 'text-white bg-gray-700' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => {
                    setShowChat(false);
                    setShowParticipants(true);
                  }}
                  className={`flex-1 px-4 py-3 font-medium transition-colors ${
                    showParticipants 
                      ? 'text-white bg-gray-700' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Participants ({selectedRoom?.participants.length})
                </button>
              </div>
              
              {/* Content */}
              {showChat ? (
                <div className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="flex items-start space-x-2">
                          <div className="text-xl">{message.sender.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white text-sm">
                                {message.sender.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Tapez un message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-2">
                    {/* Host */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{selectedRoom?.host.avatar}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">
                              {selectedRoom?.host.name}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                              Hôte
                            </span>
                          </div>
                          {selectedRoom?.host.specialization && (
                            <p className="text-xs text-gray-400">
                              {selectedRoom.host.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedRoom?.host.isMuted ? (
                          <MicOff className="w-4 h-4 text-red-500" />
                        ) : (
                          <Mic className="w-4 h-4 text-green-500" />
                        )}
                        {selectedRoom?.host.isVideoOn ? (
                          <Video className="w-4 h-4 text-green-500" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* Participants */}
                    {selectedRoom?.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{participant.avatar}</div>
                          <div>
                            <span className="font-medium text-white">
                              {participant.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.isHandRaised && (
                            <Hand className="w-4 h-4 text-yellow-500" />
                          )}
                          {participant.isMuted ? (
                            <MicOff className="w-4 h-4 text-red-500" />
                          ) : (
                            <Mic className="w-4 h-4 text-green-500" />
                          )}
                          {participant.isVideoOn ? (
                            <Video className="w-4 h-4 text-green-500" />
                          ) : (
                            <VideoOff className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de salle */}
      <AnimatePresence>
        {isCreatingRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Créer une nouvelle salle
                </h3>
                <button
                  onClick={() => setIsCreatingRoom(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de la salle
                  </label>
                  <input
                    type="text"
                    value={roomSettings.name}
                    onChange={(e) => setRoomSettings({ ...roomSettings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Révision Anatomie"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={roomSettings.description}
                    onChange={(e) => setRoomSettings({ ...roomSettings, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Décrivez l'objectif de cette salle..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de salle
                  </label>
                  <select
                    value={roomSettings.type}
                    onChange={(e) => setRoomSettings({ ...roomSettings, type: e.target.value as Room['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="meeting">Réunion</option>
                    <option value="classroom">Cours</option>
                    <option value="study-group">Groupe d'étude</option>
                    <option value="event">Événement</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre max de participants
                  </label>
                  <input
                    type="number"
                    value={roomSettings.maxParticipants}
                    onChange={(e) => setRoomSettings({ ...roomSettings, maxParticipants: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    min="2"
                    max="100"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={roomSettings.isPublic}
                      onChange={(e) => setRoomSettings({ ...roomSettings, isPublic: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Salle publique
                    </span>
                  </label>
                </div>
                
                {!roomSettings.isPublic && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={roomSettings.password}
                      onChange={(e) => setRoomSettings({ ...roomSettings, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Optionnel"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreatingRoom(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createRoom}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Créer la salle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ModernCollaborativePlatform;