import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface SignalingMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate' | 'get-peers';
  room?: string;
  from?: string;
  to?: string;
  data?: any;
}

interface Room {
  id: string;
  participants: Map<string, {
    ws: WebSocket;
    userId: string;
    userName: string;
  }>;
}

export class WebRTCSignalingServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();
  private clients: Map<WebSocket, { userId: string; roomId?: string }> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/webrtc-signaling'
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      // Extract user authentication from cookies/session
      const cookies = req.headers.cookie;
      if (!cookies || !cookies.includes('connect.sid')) {
        ws.close(1008, 'Authentication required');
        return;
      }
      
      const userId = this.generateUserId();
      this.clients.set(ws, { userId });

      console.log(`WebRTC client connected: ${userId}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as SignalingMessage;
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebRTC message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebRTC WebSocket error:', error);
      });

      // Send welcome message with user ID
      ws.send(JSON.stringify({
        type: 'welcome',
        userId
      }));
    });
  }

  private handleMessage(ws: WebSocket, message: SignalingMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case 'join':
        this.handleJoinRoom(ws, message.room!, message.data);
        break;
      
      case 'leave':
        this.handleLeaveRoom(ws);
        break;
      
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        this.handleSignaling(ws, message);
        break;
      
      case 'get-peers':
        this.handleGetPeers(ws);
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleJoinRoom(ws: WebSocket, roomId: string, userData: any) {
    const client = this.clients.get(ws);
    if (!client) return;

    // Leave current room if any
    if (client.roomId) {
      this.handleLeaveRoom(ws);
    }

    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: new Map()
      });
    }

    const room = this.rooms.get(roomId)!;
    
    // Add participant to room
    room.participants.set(client.userId, {
      ws,
      userId: client.userId,
      userName: userData?.userName || `User ${client.userId.slice(0, 6)}`
    });

    // Update client info
    client.roomId = roomId;
    this.clients.set(ws, client);

    // Notify all other participants in the room
    this.broadcastToRoom(roomId, {
      type: 'user-joined',
      userId: client.userId,
      userName: userData?.userName
    }, client.userId);

    // Send current participants list to the new user
    const participants = Array.from(room.participants.values())
      .filter(p => p.userId !== client.userId)
      .map(p => ({
        userId: p.userId,
        userName: p.userName
      }));

    ws.send(JSON.stringify({
      type: 'room-joined',
      roomId,
      participants
    }));

    console.log(`User ${client.userId} joined room ${roomId}`);
  }

  private handleLeaveRoom(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client || !client.roomId) return;

    const room = this.rooms.get(client.roomId);
    if (room) {
      room.participants.delete(client.userId);

      // Notify other participants
      this.broadcastToRoom(client.roomId, {
        type: 'user-left',
        userId: client.userId
      }, client.userId);

      // Remove room if empty
      if (room.participants.size === 0) {
        this.rooms.delete(client.roomId);
      }
    }

    // Clear room from client info
    client.roomId = undefined;
    this.clients.set(ws, client);

    console.log(`User ${client.userId} left room`);
  }

  private handleSignaling(ws: WebSocket, message: SignalingMessage) {
    const client = this.clients.get(ws);
    if (!client || !client.roomId) return;

    const room = this.rooms.get(client.roomId);
    if (!room) return;

    // Forward signaling message to target peer
    if (message.to) {
      const targetParticipant = room.participants.get(message.to);
      if (targetParticipant) {
        targetParticipant.ws.send(JSON.stringify({
          ...message,
          from: client.userId
        }));
      }
    }
  }

  private handleGetPeers(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client || !client.roomId) return;

    const room = this.rooms.get(client.roomId);
    if (!room) return;

    const peers = Array.from(room.participants.values())
      .filter(p => p.userId !== client.userId)
      .map(p => ({
        userId: p.userId,
        userName: p.userName
      }));

    ws.send(JSON.stringify({
      type: 'peers-list',
      peers
    }));
  }

  private handleDisconnect(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return;

    // Leave room if in one
    if (client.roomId) {
      this.handleLeaveRoom(ws);
    }

    // Remove from clients map
    this.clients.delete(ws);

    console.log(`WebRTC client disconnected: ${client.userId}`);
  }

  private broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);

    room.participants.forEach(participant => {
      if (participant.userId !== excludeUserId) {
        try {
          participant.ws.send(messageStr);
        } catch (error) {
          console.error(`Error sending to ${participant.userId}:`, error);
        }
      }
    });
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getRoomInfo(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      participantCount: room.participants.size,
      participants: Array.from(room.participants.values()).map(p => ({
        userId: p.userId,
        userName: p.userName
      }))
    };
  }

  public getAllRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      participantCount: room.participants.size
    }));
  }
}