import { User, CanvasElement } from '../backend/roomManager';

export type ToolType = 'pen' | 'rectangle' | 'circle' | 'sticky' | 'eraser' | 'pan';

export interface WebSocketEventHandlers {
  onRoomCreated?: (roomId: string) => void;
  onJoinedRoom?: (user: User, roomId: string, elements: CanvasElement[], users: User[]) => void;
  onUserJoined?: (user: User, users: User[]) => void;
  onUserLeft?: (userId: string, users: User[]) => void;
  onDraw?: (element: CanvasElement) => void;
  onCursorUpdate?: (userId: string, x: number, y: number) => void;
  onCanvasCleared?: () => void;
  onUndo?: (userId: string) => void;
  onRedo?: (userId: string) => void;
  onError?: (error: string) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: WebSocketEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private url: string;

  constructor(url?: string) {
    this.url = url || this.getDefaultUrl();
  }

  private getDefaultUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }

  public connect(handlers: WebSocketEventHandlers): Promise<void> {
    this.handlers = handlers;
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.handlers.onError?.('WebSocket连接错误');
          reject(error);
        };

        this.ws.onclose = () => {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect(this.handlers);
            }, 1000 * this.reconnectAttempts);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case 'roomCreated':
          this.handlers.onRoomCreated?.(message.roomId);
          break;
        case 'joinedRoom':
          this.handlers.onJoinedRoom?.(message.user, message.roomId, message.elements, message.users);
          break;
        case 'userJoined':
          this.handlers.onUserJoined?.(message.user, message.users);
          break;
        case 'userLeft':
          this.handlers.onUserLeft?.(message.userId, message.users);
          break;
        case 'draw':
          this.handlers.onDraw?.(message.element);
          break;
        case 'cursorUpdate':
          this.handlers.onCursorUpdate?.(message.userId, message.x, message.y);
          break;
        case 'canvasCleared':
          this.handlers.onCanvasCleared?.();
          break;
        case 'undo':
          this.handlers.onUndo?.(message.userId);
          break;
        case 'redo':
          this.handlers.onRedo?.(message.userId);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  public createRoom(): void {
    this.send({ type: 'createRoom' });
  }

  public joinRoom(roomId: string, userId?: string): void {
    this.send({ type: 'joinRoom', roomId, userId });
  }

  public draw(roomId: string, element: CanvasElement): void {
    this.send({ type: 'draw', roomId, element });
  }

  public updateCursor(roomId: string, userId: string, x: number, y: number): void {
    this.send({ type: 'cursorUpdate', roomId, userId, x, y });
  }

  public clearCanvas(roomId: string): void {
    this.send({ type: 'clearCanvas', roomId });
  }

  public undo(roomId: string, userId: string): void {
    this.send({ type: 'undo', roomId, userId });
  }

  public redo(roomId: string, userId: string): void {
    this.send({ type: 'redo', roomId, userId });
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
