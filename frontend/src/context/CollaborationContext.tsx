import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

interface Cursor {
  userId: string;
  x: number;
  y: number;
  user: User;
}

interface CollaborationState {
  isConnected: boolean;
  activeUsers: User[];
  cursors: Cursor[];
  pageContent: unknown;
  isOwner: boolean;
}

interface CollaborationContextType {
  state: CollaborationState;
  connect: (pageId: string) => void;
  disconnect: () => void;
  updateCursor: (x: number, y: number) => void;
  updateContent: (content: unknown) => void;
  sendMessage: (message: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

const WEBSOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    activeUsers: [],
    cursors: [],
    pageContent: null,
    isOwner: false
  });

  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);

  const connect = useCallback((pageId: string) => {
    if (!user) return;

    // Cerrar conexión existente si existe
    if (socket) {
      socket.disconnect();
    }

    setCurrentPageId(pageId);
    
    // Crear conexión Socket.IO
    const newSocket = io(WEBSOCKET_URL, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🔗 Conectado al servidor de colaboración');
      setState(prev => ({ ...prev, isConnected: true }));
      setReconnectAttempts(0);

      // Unirse a la página
      newSocket.emit('join_page', {
        pageId,
        user: {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          avatar: '', // El tipo User de AuthContext no tiene avatar
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado del servidor de colaboración:', reason);
      setState(prev => ({ ...prev, isConnected: false }));

      // Intentar reconectar si no fue un cierre intencional
      if (reason !== 'io client disconnect' && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          // Usar una referencia estable para evitar bucles
          const reconnectSocket = io(WEBSOCKET_URL, {
            path: '/ws',
            transports: ['websocket', 'polling'],
            autoConnect: true,
          });
          setSocket(reconnectSocket);
        }, Math.pow(2, reconnectAttempts) * 1000); // Backoff exponencial
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.IO:', error);
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // Configurar event listeners para los mensajes del servidor
    newSocket.on('users_update', (data) => {
      handleSocketMessage({ type: 'users_update', data });
    });

    newSocket.on('cursor_update', (data) => {
      handleSocketMessage({ type: 'cursor_update', data });
    });

    newSocket.on('cursor_remove', (data) => {
      handleSocketMessage({ type: 'cursor_remove', data });
    });

    newSocket.on('user_left', (data) => {
      handleSocketMessage({ type: 'user_left', data });
    });

    newSocket.on('content_update', (data) => {
      handleSocketMessage({ type: 'content_update', data });
    });

    newSocket.on('new_message', (data) => {
      handleSocketMessage({ type: 'new_message', data });
    });

    newSocket.on('error', (data) => {
      handleSocketMessage({ type: 'error', data });
    });

    setSocket(newSocket);
  }, [user, reconnectAttempts, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.emit('leave_page', { pageId: currentPageId });
      socket.disconnect();
      setSocket(null);
    }
    setCurrentPageId(null);
    setState({
      isConnected: false,
      activeUsers: [],
      cursors: [],
      pageContent: null,
      isOwner: false
    });
  }, [socket, currentPageId]);

  const handleSocketMessage = useCallback((message: any) => {
    // Validar que el mensaje tenga la estructura esperada
    if (!message || typeof message !== 'object' || !message.type) {
      console.warn('Mensaje WebSocket inválido:', message);
      return;
    }

    switch (message.type) {
      case 'users_update':
        if (message.data && Array.isArray(message.data.users)) {
          setState(prev => ({
            ...prev,
            activeUsers: message.data.users,
            isOwner: message.data.ownerId === user?.id
          }));
        }
        break;

      case 'cursor_update':
        if (message.data && message.data.userId && typeof message.data.x === 'number' && typeof message.data.y === 'number') {
          setState(prev => ({
            ...prev,
            cursors: prev.cursors.filter(c => c.userId !== message.data.userId).concat({
              userId: message.data.userId,
              x: message.data.x,
              y: message.data.y,
              user: message.data.user
            })
          }));
        }
        break;

      case 'cursor_remove':
        if (message.data && message.data.userId) {
          setState(prev => ({
            ...prev,
            cursors: prev.cursors.filter(c => c.userId !== message.data.userId)
          }));
        }
        break;

      case 'content_update':
        setState(prev => ({
          ...prev,
          pageContent: message.data.content
        }));
        break;

      case 'user_left':
        if (message.data && message.data.userId) {
          setState(prev => ({
            ...prev,
            activeUsers: prev.activeUsers.filter(u => u.id !== message.data.userId),
            cursors: prev.cursors.filter(c => c.userId !== message.data.userId)
          }));
        }
        break;

      case 'error':
        console.error('Error del servidor:', message.data?.message || 'Error desconocido');
        break;

      default:
        console.log('Mensaje no reconocido:', message);
    }
  }, [user]);

  const updateCursor = useCallback((x: number, y: number) => {
    if (socket && socket.connected && currentPageId && user) {
      socket.emit('cursor_update', {
        pageId: currentPageId,
        x,
        y,
        user: {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          avatar: '',
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }
      });
    }
  }, [socket, currentPageId, user]);

  const updateContent = useCallback((content: unknown) => {
    if (socket && socket.connected && currentPageId && user) {
      socket.emit('content_update', {
        pageId: currentPageId,
        content,
        user: {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          avatar: '',
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }
      });
    }
  }, [socket, currentPageId, user]);

  const sendMessage = useCallback((message: string) => {
    if (socket && socket.connected && currentPageId && user) {
      socket.emit('send_message', {
        pageId: currentPageId,
        message,
        user: {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          avatar: '',
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }
      });
    }
  }, [socket, currentPageId, user]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [socket]);

  const contextValue: CollaborationContextType = {
    state,
    connect,
    disconnect,
    updateCursor,
    updateContent,
    sendMessage
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export default CollaborationContext;