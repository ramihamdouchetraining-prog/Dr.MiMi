import { useEffect, useRef, useState, useCallback } from 'react';

// Types
interface WSMessage {
  type: 'message' | 'typing' | 'read' | 'delivered' | 'status' | 'join' | 'leave' | 'reaction' | 'user_status' | 'connected' | 'error';
  conversationId?: string;
  message?: any;
  userId?: string;
  data?: any;
  timestamp?: Date;
}

interface WebSocketConfig {
  url?: string;
  token?: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

export const useWebSocket = ({
  url = '',
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectDelay = 3000
}: WebSocketConfig) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Generate WebSocket URL with token
  const getWebSocketUrl = useCallback(() => {
    // Get base URL from environment or current host
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.hostname === 'localhost' ? '5001' : window.location.port;
    
    const baseUrl = url || `${wsProtocol}//${host}${port ? `:${port}` : ''}`;
    const wsUrl = new URL('/ws/messaging', baseUrl);
    
    // Add token to query params
    if (token) {
      wsUrl.searchParams.set('token', token);
    }
    
    return wsUrl.toString();
  }, [url, token]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Connection opened
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        onConnect?.();
        
        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      // Message received
      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      // Connection closed
      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
        
        // Auto reconnect if enabled
        if (autoReconnect && !event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, reconnectDelay);
        }
      };

      // Connection error
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        onError?.(error);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
      onError?.(error);
    }
  }, [getWebSocketUrl, onConnect, onDisconnect, onError, onMessage, autoReconnect, reconnectDelay, isConnecting]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    return sendMessage({
      type: 'join',
      conversationId
    });
  }, [sendMessage]);

  // Leave conversation
  const leaveConversation = useCallback((conversationId: string) => {
    return sendMessage({
      type: 'leave',
      conversationId
    });
  }, [sendMessage]);

  // Send chat message
  const sendChatMessage = useCallback((conversationId: string, content: string, messageData?: any) => {
    return sendMessage({
      type: 'message',
      conversationId,
      message: {
        content,
        ...messageData
      }
    });
  }, [sendMessage]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    return sendMessage({
      type: 'typing',
      conversationId,
      data: { isTyping }
    });
  }, [sendMessage]);

  // Mark message as read
  const markMessageRead = useCallback((conversationId: string, messageId: string) => {
    return sendMessage({
      type: 'read',
      conversationId,
      data: { messageId }
    });
  }, [sendMessage]);

  // Add reaction to message
  const addReaction = useCallback((conversationId: string, messageId: string, emoji: string) => {
    return sendMessage({
      type: 'reaction',
      conversationId,
      data: { messageId, emoji }
    });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    if (token) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [token]); // Only reconnect when token changes

  // Reconnect when connection parameters change
  useEffect(() => {
    if (isConnected && token) {
      // If already connected but parameters changed, reconnect
      disconnect();
      setTimeout(connect, 100);
    }
  }, [url]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendChatMessage,
    sendTyping,
    markMessageRead,
    addReaction
  };
};

export default useWebSocket;