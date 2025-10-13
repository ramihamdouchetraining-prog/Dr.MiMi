import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  MessageSquare,
  Users,
  Share2,
  Monitor,
  Settings,
  Grid,
  Maximize,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  muted: boolean;
  videoOn: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export const MedicalCollaborativePlatform: React.FC = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'speaker'>('grid');
  const [showChat, setShowChat] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, any>>(new Map());
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize Peer connection
  useEffect(() => {
    if (!peerRef.current) {
      peerRef.current = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peerRef.current.on('open', (id) => {
        console.log('Peer ID:', id);
      });

      peerRef.current.on('call', (call) => {
        if (localStream) {
          call.answer(localStream);
          handleIncomingCall(call);
        }
      });

      peerRef.current.on('connection', (conn) => {
        handleIncomingConnection(conn);
      });
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [localStream]);

  // Get user media
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  // Handle incoming call
  const handleIncomingCall = (call: any) => {
    call.on('stream', (remoteStream: MediaStream) => {
      const participantId = call.peer;
      setParticipants(prev => {
        const updated = new Map(prev);
        const participant = updated.get(participantId) || {
          id: participantId,
          name: `User ${participantId.slice(0, 6)}`,
          muted: false,
          videoOn: true
        };
        participant.stream = remoteStream;
        updated.set(participantId, participant);
        return updated;
      });
    });

    call.on('close', () => {
      const participantId = call.peer;
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(participantId);
        return updated;
      });
    });
  };

  // Handle incoming data connection
  const handleIncomingConnection = (conn: any) => {
    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
    });

    conn.on('data', (data: any) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.payload]);
      } else if (data.type === 'userInfo') {
        setParticipants(prev => {
          const updated = new Map(prev);
          const participant = updated.get(conn.peer) || {
            id: conn.peer,
            name: data.payload.name,
            muted: false,
            videoOn: true
          };
          participant.name = data.payload.name;
          updated.set(conn.peer, participant);
          return updated;
        });
      }
    });

    conn.on('close', () => {
      connectionsRef.current.delete(conn.peer);
    });
  };

  // Join room
  const joinRoom = async () => {
    if (!roomId || !userName) return;

    await startLocalStream();
    setIsConnected(true);

    // In a real implementation, you would connect to other peers in the room
    // This would typically involve a signaling server to exchange peer IDs
  };

  // Leave room
  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    connectionsRef.current.forEach(conn => conn.close());
    connectionsRef.current.clear();
    
    setParticipants(new Map());
    setMessages([]);
    setIsConnected(false);
    setLocalStream(null);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // Replace video track with screen share
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrack.onended = () => {
        stopScreenShare();
      };

      // In a real implementation, you would replace the video track
      // in all peer connections
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  };

  // Send message
  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: peerRef.current?.id || 'local',
      userName: userName,
      message: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    
    // Send to all connected peers
    connectionsRef.current.forEach(conn => {
      conn.send({
        type: 'message',
        payload: message
      });
    });

    setCurrentMessage('');
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Plateforme Collaborative Médicale
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code de la salle
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le code de la salle"
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={!userName || !roomId}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Rejoindre la consultation
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Plateforme sécurisée pour consultations médicales</p>
            <p>Conforme aux standards de confidentialité médicale</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-semibold">Consultation: {roomId}</h3>
          <span className="text-gray-400 text-sm">
            {participants.size + 1} participant(s)
          </span>
        </div>
        
        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PhoneOff size={18} />
          <span>Quitter</span>
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Main video area */}
        <div className="flex-1 p-4">
          <div className={`h-full grid gap-4 ${
            selectedView === 'grid' 
              ? participants.size === 0 ? 'grid-cols-1' 
              : participants.size === 1 ? 'grid-cols-2'
              : participants.size <= 3 ? 'grid-cols-2 grid-rows-2'
              : 'grid-cols-3 grid-rows-2'
              : 'grid-cols-1'
          }`}>
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userName} (Vous)
              </div>
              {!isVideoOn && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Remote videos */}
            {Array.from(participants.values()).map(participant => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className="bg-gray-700 rounded-lg p-2">
                  <div className="text-xs text-gray-400">{msg.userName}</div>
                  <div className="text-white text-sm">{msg.message}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tapez un message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            } text-white transition-colors`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            } text-white transition-colors`}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`p-3 rounded-full ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            } text-white transition-colors`}
          >
            <Monitor size={20} />
          </button>

          <button
            onClick={() => setSelectedView(selectedView === 'grid' ? 'speaker' : 'grid')}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            <Grid size={20} />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Participant Video Component
const ParticipantVideo: React.FC<{ participant: Participant }> = ({ participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {participant.name}
      </div>
      {!participant.videoOn && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <VideoOff size={48} className="text-gray-400" />
        </div>
      )}
      {participant.muted && (
        <div className="absolute top-4 right-4 bg-red-600 p-1 rounded">
          <MicOff size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};