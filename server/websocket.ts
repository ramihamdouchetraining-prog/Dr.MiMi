import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

// Types
interface WSClient {
  id: string;
  userId: string;
  role: string;
  ws: WebSocket;
  conversations: Set<string>;
  lastSeen: Date;
}

interface WSMessage {
  type: 'message' | 'typing' | 'read' | 'delivered' | 'status' | 'join' | 'leave' | 'reaction';
  conversationId?: string;
  message?: any;
  userId?: string;
  data?: any;
  timestamp?: Date;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();
  private conversations: Map<string, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/messaging'
    });

    this.setupWebSocket();
    console.log('🔌 WebSocket server initialized for messaging');
  }

  private setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Extract and verify token from query params
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
          ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
          ws.close(1008, 'Authentication required');
          return;
        }

        // Verify JWT token
        const decoded = await this.verifyToken(token);
        if (!decoded) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
          ws.close(1008, 'Invalid token');
          return;
        }

        // Create client
        const clientId = this.generateClientId();
        const client: WSClient = {
          id: clientId,
          userId: decoded.userId,
          role: decoded.role,
          ws,
          conversations: new Set(),
          lastSeen: new Date()
        };

        this.clients.set(clientId, client);

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          clientId,
          userId: decoded.userId,
          timestamp: new Date()
        }));

        // Notify others that user is online
        this.broadcastUserStatus(decoded.userId, 'online');

        // Setup message handlers
        this.setupClientHandlers(client);

        console.log(`✅ Client connected: ${clientId} (User: ${decoded.userId})`);

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Server error');
      }
    });
  }

  private setupClientHandlers(client: WSClient) {
    const ws = client.ws;

    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'message':
            await this.handleMessage(client, message);
            break;
          case 'typing':
            this.handleTyping(client, message);
            break;
          case 'read':
            this.handleMessageRead(client, message);
            break;
          case 'join':
            this.handleJoinConversation(client, message.conversationId!);
            break;
          case 'leave':
            this.handleLeaveConversation(client, message.conversationId!);
            break;
          case 'reaction':
            this.handleReaction(client, message);
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }

        // Update last seen
        client.lastSeen = new Date();

      } catch (error) {
        console.error('Message handling error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    // Handle ping/pong for keeping connection alive
    ws.on('ping', () => {
      ws.pong();
    });

    // Handle disconnection
    ws.on('close', () => {
      // Notify others that user is offline
      this.broadcastUserStatus(client.userId, 'offline');

      // Remove from conversations
      client.conversations.forEach(conversationId => {
        const members = this.conversations.get(conversationId);
        if (members) {
          members.delete(client.id);
          if (members.size === 0) {
            this.conversations.delete(conversationId);
          }
        }
      });

      // Remove client
      this.clients.delete(client.id);
      console.log(`❌ Client disconnected: ${client.id}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${client.id}:`, error);
    });
  }

  private async handleMessage(client: WSClient, message: WSMessage) {
    if (!message.conversationId || !message.message) {
      client.ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid message: missing conversationId or content' 
      }));
      return;
    }

    // Create message object
    const messageData = {
      id: this.generateMessageId(),
      conversationId: message.conversationId,
      senderId: client.userId,
      senderRole: client.role,
      content: message.message.content,
      timestamp: new Date(),
      status: 'delivered' as const,
      ...message.message
    };

    // Send to all members in conversation
    const members = this.conversations.get(message.conversationId);
    if (members) {
      members.forEach(memberId => {
        const memberClient = this.clients.get(memberId);
        if (memberClient) {
          memberClient.ws.send(JSON.stringify({
            type: 'message',
            conversationId: message.conversationId,
            message: messageData
          }));
        }
      });
    }

    // Also send to sender for confirmation
    client.ws.send(JSON.stringify({
      type: 'message_sent',
      messageId: messageData.id,
      status: 'delivered'
    }));
  }

  private handleTyping(client: WSClient, message: WSMessage) {
    if (!message.conversationId) return;

    const members = this.conversations.get(message.conversationId);
    if (members) {
      members.forEach(memberId => {
        if (memberId !== client.id) {
          const memberClient = this.clients.get(memberId);
          if (memberClient) {
            memberClient.ws.send(JSON.stringify({
              type: 'typing',
              conversationId: message.conversationId,
              userId: client.userId,
              isTyping: message.data?.isTyping ?? true
            }));
          }
        }
      });
    }
  }

  private handleMessageRead(client: WSClient, message: WSMessage) {
    if (!message.conversationId || !message.data?.messageId) return;

    // Broadcast read status to conversation members
    const members = this.conversations.get(message.conversationId);
    if (members) {
      members.forEach(memberId => {
        const memberClient = this.clients.get(memberId);
        if (memberClient) {
          memberClient.ws.send(JSON.stringify({
            type: 'read',
            conversationId: message.conversationId,
            messageId: message.data.messageId,
            readBy: client.userId,
            readAt: new Date()
          }));
        }
      });
    }
  }

  private handleJoinConversation(client: WSClient, conversationId: string) {
    // Add client to conversation
    client.conversations.add(conversationId);
    
    // Add to conversation members
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, new Set());
    }
    this.conversations.get(conversationId)!.add(client.id);

    // Notify client
    client.ws.send(JSON.stringify({
      type: 'joined',
      conversationId,
      members: Array.from(this.conversations.get(conversationId)!).map(id => {
        const c = this.clients.get(id);
        return c ? { userId: c.userId, role: c.role } : null;
      }).filter(Boolean)
    }));

    // Notify other members
    this.broadcastToConversation(conversationId, {
      type: 'user_joined',
      conversationId,
      userId: client.userId
    }, client.id);
  }

  private handleLeaveConversation(client: WSClient, conversationId: string) {
    // Remove from conversation
    client.conversations.delete(conversationId);
    
    const members = this.conversations.get(conversationId);
    if (members) {
      members.delete(client.id);
      if (members.size === 0) {
        this.conversations.delete(conversationId);
      }
    }

    // Notify other members
    this.broadcastToConversation(conversationId, {
      type: 'user_left',
      conversationId,
      userId: client.userId
    }, client.id);
  }

  private handleReaction(client: WSClient, message: WSMessage) {
    if (!message.conversationId || !message.data?.messageId || !message.data?.emoji) return;

    // Broadcast reaction to conversation members
    this.broadcastToConversation(message.conversationId, {
      type: 'reaction',
      conversationId: message.conversationId,
      messageId: message.data.messageId,
      userId: client.userId,
      emoji: message.data.emoji,
      timestamp: new Date()
    });
  }

  private broadcastToConversation(conversationId: string, data: any, excludeClientId?: string) {
    const members = this.conversations.get(conversationId);
    if (members) {
      members.forEach(memberId => {
        if (memberId !== excludeClientId) {
          const memberClient = this.clients.get(memberId);
          if (memberClient) {
            memberClient.ws.send(JSON.stringify(data));
          }
        }
      });
    }
  }

  private broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    // Broadcast to all clients
    this.clients.forEach(client => {
      client.ws.send(JSON.stringify({
        type: 'user_status',
        userId,
        status,
        timestamp: new Date()
      }));
    });
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'secret-key');
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  public sendMessageToUser(userId: string, message: any) {
    this.clients.forEach(client => {
      if (client.userId === userId) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public getOnlineUsers(): string[] {
    const users = new Set<string>();
    this.clients.forEach(client => {
      users.add(client.userId);
    });
    return Array.from(users);
  }

  public getConversationMembers(conversationId: string): string[] {
    const members = this.conversations.get(conversationId);
    if (!members) return [];
    
    return Array.from(members).map(clientId => {
      const client = this.clients.get(clientId);
      return client ? client.userId : null;
    }).filter(Boolean) as string[];
  }
}

export default WebSocketManager;