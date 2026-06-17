import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

interface UseWebSocketReturn {
  sendMessage: (event: string, data: unknown) => void;
  onMessage: <T = unknown>(event: string, callback: (data: T) => void) => () => void;
  socket: Socket;
}

export function useWebSocket(): UseWebSocketReturn {
  const socket = useRef<Socket>(getSocket());

  useEffect(() => {
    const currentSocket = socket.current;

    const onConnect = () => {
      console.log('[WebSocket] Connected');
    };

    const onDisconnect = () => {
      console.log('[WebSocket] Disconnected');
    };

    const onError = (error: Error) => {
      console.error('[WebSocket] Error:', error);
    };

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);
    currentSocket.on('connect_error', onError);

    return () => {
      currentSocket.off('connect', onConnect);
      currentSocket.off('disconnect', onDisconnect);
      currentSocket.off('connect_error', onError);
    };
  }, []);

  const sendMessage = useCallback((event: string, data: unknown) => {
    if (socket.current.connected) {
      socket.current.emit(event, data);
    } else {
      console.warn('[WebSocket] Socket not connected, queuing message:', event);
      socket.current.once('connect', () => {
        socket.current.emit(event, data);
      });
    }
  }, []);

  const onMessage = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    const handler = (data: T) => callback(data);
    socket.current.on(event, handler);

    return () => {
      socket.current.off(event, handler);
    };
  }, []);

  return {
    sendMessage,
    onMessage,
    socket: socket.current,
  };
}
