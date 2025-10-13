import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Video, VideoOff, Mic, MicOff, Screen, 
  MessageSquare, Phone, PhoneOff, Settings,
  UserPlus, Copy, Check, ChevronRight,
  Grid, Presentation, BookOpen, Brain,
  Hand, Send, MoreVertical, Eye, EyeOff,
  Headphones, Volume2, VolumeX, Monitor
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'host' | 'moderator' | 'participant';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  isRaisingHand: boolean;
}

interface Room {
  id: string;
  name: string;
  description: string;
  type: 'study' | 'lecture' | 'workshop' | 'exam';
  maxParticipants: number;
  currentParticipants: number;
  startTime: Date;
  duration: number;
  host: string;
  isPublic: boolean;
  tags: string[];
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'join' | 'leave' | 'system';
}

export const CollaborativePlatform: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Dr. Sarah Martin',
      role: 'host',
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      isSpeaking: true,
      isRaisingHand: false
    },
    {
      id: '2',
      name: 'Étudiant Ahmed',
      role: 'participant',
      isAudioEnabled: true,
      isVideoEnabled: false,
      isScreenSharing: false,
      isSpeaking: false,
      isRaisingHand: true
    },
    {
      id: '3',
      name: 'Étudiante Marie',
      role: 'participant',
      isAudioEnabled: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      isSpeaking: false,
      isRaisingHand: false
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Dr. Sarah Martin',
      message: 'Bienvenue à la session d\'anatomie ! 📚',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'message'
    },
    {
      id: '2',
      userId: 'system',
      userName: 'Système',
      message: 'Ahmed a rejoint la salle',
      timestamp: new Date(Date.now() - 3 * 60000),
      type: 'join'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [view, setView] = useState<'grid' | 'speaker' | 'presentation'>('grid');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('1');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const availableRooms: Room[] = [
    {
      id: '1',
      name: 'Session Anatomie - Système Cardiovasculaire',
      description: 'Révision complète du système cardiovasculaire avec cas cliniques',
      type: 'study',
      maxParticipants: 30,
      currentParticipants: 12,
      startTime: new Date(),
      duration: 90,
      host: 'Dr. Sarah Martin',
      isPublic: true,
      tags: ['Anatomie', 'Cardiovasculaire', 'P2']
    },
    {
      id: '2',
      name: 'Workshop Sémiologie Respiratoire',
      description: 'Atelier pratique sur l\'examen clinique respiratoire',
      type: 'workshop',
      maxParticipants: 15,
      currentParticipants: 8,
      startTime: new Date(Date.now() + 2 * 3600000),
      duration: 120,
      host: 'Prof. Jean Dupont',
      isPublic: false,
      tags: ['Sémiologie', 'Respiratoire', 'D3']
    },
    {
      id: '3',
      name: 'Préparation ECNi - Cardiologie',
      description: 'Session intensive de préparation aux ECNi',
      type: 'exam',
      maxParticipants: 50,
      currentParticipants: 42,
      startTime: new Date(Date.now() + 24 * 3600000),
      duration: 180,
      host: 'Dr. Michel Bernard',
      isPublic: true,
      tags: ['ECNi', 'Cardiologie', 'D4']
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Vous',
      message: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    const joinMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'Système',
      message: 'Vous avez rejoint la salle',
      timestamp: new Date(),
      type: 'join'
    };
    setMessages([...messages, joinMessage]);
  };

  const toggleParticipantAudio = (participantId: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, isAudioEnabled: !p.isAudioEnabled } : p
    ));
  };

  const toggleParticipantVideo = (participantId: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, isVideoEnabled: !p.isVideoEnabled } : p
    ));
  };

  // Room List View
  if (!activeRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Plateforme Collaborative 🤝
            </h1>
            <p className="text-gray-600">
              Rejoignez des salles virtuelles pour étudier ensemble
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Salles actives</p>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Étudiants en ligne</p>
                  <p className="text-2xl font-bold text-gray-800">247</p>
                </div>
                <Video className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Sessions aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                </div>
                <Presentation className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Heures d'étude</p>
                  <p className="text-2xl font-bold text-gray-800">1,234</p>
                </div>
                <Brain className="w-8 h-8 text-amber-500" />
              </div>
            </motion.div>
          </div>

          {/* Room List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className={`h-2 ${
                  room.type === 'study' ? 'bg-blue-500' :
                  room.type === 'lecture' ? 'bg-green-500' :
                  room.type === 'workshop' ? 'bg-purple-500' :
                  'bg-amber-500'
                }`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {room.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {room.description}
                      </p>
                    </div>
                    {room.isPublic ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {room.currentParticipants}/{room.maxParticipants} participants
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        room.currentParticipants < room.maxParticipants
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {room.currentParticipants < room.maxParticipants ? 'Places disponibles' : 'Complet'}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Monitor className="w-4 h-4 mr-1" />
                      Animé par {room.host}
                    </div>

                    <div className="flex items-center">
                      <Presentation className="w-4 h-4 mr-1" />
                      {format(room.startTime, 'HH:mm', { locale: fr })} - 
                      {room.duration} minutes
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room)}
                    disabled={room.currentParticipants >= room.maxParticipants}
                    className={`w-full mt-4 py-2 rounded-lg font-medium transition flex items-center justify-center ${
                      room.currentParticipants < room.maxParticipants
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {room.currentParticipants < room.maxParticipants ? (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Rejoindre la salle
                      </>
                    ) : (
                      'Salle complète'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Create Room Button */}
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition">
              <UserPlus className="w-5 h-5 inline mr-2" />
              Créer une nouvelle salle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Video Conference View
  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">{activeRoom.name}</h2>
            <p className="text-gray-400 text-sm">
              {activeRoom.currentParticipants} participants • Animé par {activeRoom.host}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode */}
            <div className="bg-gray-700 rounded-lg p-1 flex">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  view === 'grid' 
                    ? 'bg-gray-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('speaker')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  view === 'speaker' 
                    ? 'bg-gray-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('presentation')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  view === 'presentation' 
                    ? 'bg-gray-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Presentation className="w-4 h-4" />
              </button>
            </div>

            <button className="p-2 text-gray-400 hover:text-white transition">
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setActiveRoom(null)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              <PhoneOff className="w-4 h-4 inline mr-2" />
              Quitter
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-auto">
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {participants.map(participant => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-gray-800 rounded-lg overflow-hidden ${
                    participant.isSpeaking ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setSelectedParticipant(participant.id)}
                >
                  {participant.isVideoEnabled ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-4xl font-bold">
                        {participant.name.charAt(0)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <VideoOff className="w-12 h-12 text-gray-500" />
                    </div>
                  )}

                  {/* Participant Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm font-medium">
                          {participant.name}
                        </span>
                        {participant.role === 'host' && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                            Hôte
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {participant.isRaisingHand && (
                          <Hand className="w-4 h-4 text-yellow-500 animate-bounce" />
                        )}
                        {participant.isAudioEnabled ? (
                          <Mic className="w-4 h-4 text-white" />
                        ) : (
                          <MicOff className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {view === 'speaker' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-gray-800 rounded-lg mb-4">
                {/* Main Speaker */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-6xl">
                    {participants.find(p => p.id === selectedParticipant)?.name.charAt(0)}
                  </div>
                </div>
              </div>
              
              {/* Other Participants */}
              <div className="flex space-x-4 overflow-x-auto">
                {participants.filter(p => p.id !== selectedParticipant).map(participant => (
                  <div
                    key={participant.id}
                    className="w-32 h-24 bg-gray-800 rounded-lg flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500"
                    onClick={() => setSelectedParticipant(participant.id)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-2xl">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'presentation' && (
            <div className="h-full bg-gray-800 rounded-lg flex items-center justify-center">
              {isWhiteboardOpen ? (
                <canvas
                  ref={canvasRef}
                  className="bg-white rounded-lg"
                  width={800}
                  height={600}
                />
              ) : (
                <div className="text-center">
                  <Screen className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucun partage d'écran actif</p>
                  <button
                    onClick={() => setIsWhiteboardOpen(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Ouvrir le tableau blanc
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-3 rounded-full transition ${
                isAudioEnabled 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3 rounded-full transition ${
                isVideoEnabled 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition">
              <Screen className="w-5 h-5" />
            </button>

            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition">
              <Hand className="w-5 h-5" />
            </button>

            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Chat */}
      {isChatOpen && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div key={message.id}>
                {message.type === 'message' ? (
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-400">
                        {message.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(message.timestamp, 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-white text-sm">{message.message}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                      {message.message}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 p-3 bg-gray-800 text-white rounded-l-lg hover:bg-gray-700 transition"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};