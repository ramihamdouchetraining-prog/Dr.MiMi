import { useEffect, useRef, useState, useCallback } from 'react';

interface SignalingMessage {
  type: string;
  from?: string;
  to?: string;
  data?: any;
  userId?: string;
  userName?: string;
  roomId?: string;
  participants?: Array<{ userId: string; userName: string }>;
  peers?: Array<{ userId: string; userName: string }>;
}

interface UseWebRTCSignalingOptions {
  serverUrl?: string;
  onMessage?: (message: SignalingMessage) => void;
  onConnected?: (userId: string) => void;
  onDisconnected?: () => void;
  onUserJoined?: (userId: string, userName: string) => void;
  onUserLeft?: (userId: string) => void;
  onRoomJoined?: (roomId: string, participants: Array<{ userId: string; userName: string }>) => void;
}

export const useWebRTCSignaling = (options: UseWebRTCSignalingOptions = {}) => {
  const {
    serverUrl = `ws://${window.location.hostname}:5001/webrtc-signaling`,
    onMessage,
    onConnected,
    onDisconnected,
    onUserJoined,
    onUserLeft,
    onRoomJoined
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Array<{ userId: string; userName: string }>>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(serverUrl);

      wsRef.current.onopen = () => {
        console.log('WebRTC signaling connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as SignalingMessage;
          
          switch (message.type) {
            case 'welcome':
              if (message.userId) {
                setUserId(message.userId);
                onConnected?.(message.userId);
              }
              break;
            
            case 'room-joined':
              if (message.roomId && message.participants) {
                setCurrentRoom(message.roomId);
                setParticipants(message.participants);
                onRoomJoined?.(message.roomId, message.participants);
              }
              break;
            
            case 'user-joined':
              if (message.userId && message.userName) {
                setParticipants(prev => [...prev, { 
                  userId: message.userId!, 
                  userName: message.userName! 
                }]);
                onUserJoined?.(message.userId, message.userName);
              }
              break;
            
            case 'user-left':
              if (message.userId) {
                setParticipants(prev => prev.filter(p => p.userId !== message.userId));
                onUserLeft?.(message.userId);
              }
              break;
            
            case 'peers-list':
              if (message.peers) {
                setParticipants(message.peers);
              }
              break;
            
            default:
              onMessage?.(message);
          }
        } catch (error) {
          console.error('Error parsing WebRTC signaling message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebRTC signaling error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebRTC signaling disconnected');
        setIsConnected(false);
        setUserId(null);
        setCurrentRoom(null);
        setParticipants([]);
        onDisconnected?.();
        
        // Attempt to reconnect
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('Failed to connect to WebRTC signaling server:', error);
    }
  }, [serverUrl, onConnected, onDisconnected, onMessage, onRoomJoined, onUserJoined, onUserLeft]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: SignalingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebRTC signaling not connected');
    }
  }, []);

  const joinRoom = useCallback((roomId: string, userName: string) => {
    sendMessage({
      type: 'join',
      room: roomId,
      data: { userName }
    });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    sendMessage({ type: 'leave' });
    setCurrentRoom(null);
    setParticipants([]);
  }, [sendMessage]);

  const sendOffer = useCallback((to: string, offer: RTCSessionDescriptionInit) => {
    sendMessage({
      type: 'offer',
      to,
      data: offer
    });
  }, [sendMessage]);

  const sendAnswer = useCallback((to: string, answer: RTCSessionDescriptionInit) => {
    sendMessage({
      type: 'answer',
      to,
      data: answer
    });
  }, [sendMessage]);

  const sendIceCandidate = useCallback((to: string, candidate: RTCIceCandidateInit) => {
    sendMessage({
      type: 'ice-candidate',
      to,
      data: candidate
    });
  }, [sendMessage]);

  const getPeers = useCallback(() => {
    sendMessage({ type: 'get-peers' });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    userId,
    currentRoom,
    participants,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    getPeers,
    sendMessage
  };
};