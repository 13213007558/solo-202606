import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager, User, CanvasElement } from './roomManager';

const PORT = 3001;
const MAX_BROADCAST_PER_SECOND = 30;
const BROADCAST_INTERVAL = 1000 / MAX_BROADCAST_PER_SECOND;

const wss = new WebSocketServer({ port: PORT });
const roomManager = new RoomManager();

interface ClientMessage {
  type: string;
  roomId?: string;
  userId?: string;
  [key: string]: any;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  roomId: string;
  lastMessageTime: number;
}

const clients = new Map<string, ConnectedClient>();

wss.on('connection', (ws: WebSocket) => {
  let clientId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const message: ClientMessage = JSON.parse(data);
      handleMessage(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    if (clientId) {
      const client = clients.get(clientId);
      if (client) {
        roomManager.leaveRoom(client.roomId, client.userId);
        broadcastToRoom(client.roomId, {
          type: 'userLeft',
          userId: client.userId,
          users: roomManager.getUsersList(client.roomId),
        });
        clients.delete(clientId);
      }
    }
  });

  const handleMessage = (ws: WebSocket, message: ClientMessage) => {
    switch (message.type) {
      case 'createRoom':
        handleCreateRoom(ws);
        break;
      case 'joinRoom':
        clientId = handleJoinRoom(ws, message.roomId!, message.userId);
        break;
      case 'draw':
        handleDraw(message);
        break;
      case 'cursorUpdate':
        handleCursorUpdate(message);
        break;
      case 'clearCanvas':
        handleClearCanvas(message);
        break;
      case 'undo':
      case 'redo':
        handleUndoRedo(message);
        break;
      default:
        break;
    }
  };
});

const handleCreateRoom = (ws: WebSocket) => {
  const roomId = roomManager.createRoom();
  sendMessage(ws, {
    type: 'roomCreated',
    roomId,
  });
};

const handleJoinRoom = (ws: WebSocket, roomId: string, userId?: string): string => {
  const { user, room } = roomManager.joinRoom(roomId, userId);
  const clientId = `${roomId}-${user.id}`;

  clients.set(clientId, {
    ws,
    userId: user.id,
    roomId,
    lastMessageTime: 0,
  });

  sendMessage(ws, {
    type: 'joinedRoom',
    user,
    roomId,
    elements: room.elements,
    users: roomManager.getUsersList(roomId),
  });

  broadcastToRoom(roomId, {
    type: 'userJoined',
    user,
    users: roomManager.getUsersList(roomId),
  }, user.id);

  return clientId;
};

const handleDraw = (message: ClientMessage) => {
  if (!message.roomId || !message.element) return;

  const room = roomManager.getRoom(message.roomId);
  if (!room) return;

  const element = message.element as CanvasElement;
  roomManager.addElement(message.roomId, element);

  throttledBroadcast(message.roomId, {
    type: 'draw',
    element,
  });
};

const handleCursorUpdate = (message: ClientMessage) => {
  if (!message.roomId || !message.userId) return;

  roomManager.updateCursor(
    message.roomId,
    message.userId,
    message.x as number,
    message.y as number
  );

  throttledBroadcast(message.roomId, {
    type: 'cursorUpdate',
    userId: message.userId,
    x: message.x,
    y: message.y,
  }, message.userId);
};

const handleClearCanvas = (message: ClientMessage) => {
  if (!message.roomId) return;
  roomManager.clearCanvas(message.roomId);

  broadcastToRoom(message.roomId, {
    type: 'canvasCleared',
  });
};

const handleUndoRedo = (message: ClientMessage) => {
  broadcastToRoom(message.roomId!, message, message.userId);
};

const broadcastToRoom = (roomId: string, data: any, excludeUserId?: string) => {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.roomId === roomId && client.userId !== excludeUserId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  });
};

interface QueueMessage {
  data: any;
  excludeUserId?: string;
}

const broadcastQueues = new Map<string, { messages: QueueMessage[]; timer: NodeJS.Timeout | null }>();

const throttledBroadcast = (roomId: string, data: any, excludeUserId?: string) => {
  if (!broadcastQueues.has(roomId)) {
    broadcastQueues.set(roomId, { messages: [], timer: null });
  }

  const queue = broadcastQueues.get(roomId)!;
  queue.messages.push({ data, excludeUserId });

  if (!queue.timer) {
    queue.timer = setTimeout(() => {
      const messagesToSend = [...queue.messages];
      queue.messages = [];
      queue.timer = null;

      messagesToSend.forEach((msg) => {
        broadcastToRoom(roomId, msg.data, msg.excludeUserId);
      });
    }, BROADCAST_INTERVAL);
  }
};

const sendMessage = (ws: WebSocket, data: any) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

console.log(`WebSocket server running on ws://localhost:${PORT}`);
