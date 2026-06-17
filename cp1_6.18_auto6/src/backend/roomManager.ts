import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'sticky' | 'eraser';
  userId: string;
  color: string;
  createdAt: number;
}

export interface PenElement extends BaseElement {
  type: 'pen';
  points: Point[];
  lineWidth: number;
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
  startPoint: Point;
  endPoint: Point;
  lineWidth: number;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  center: Point;
  radius: number;
  lineWidth: number;
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  position: Point;
  text: string;
}

export interface EraserElement extends BaseElement {
  type: 'eraser';
  targetId: string;
}

export type CanvasElement = PenElement | RectangleElement | CircleElement | StickyElement | EraserElement;

export interface Room {
  id: string;
  users: Map<string, User>;
  elements: CanvasElement[];
  compositeBitmap: HTMLCanvasElement | null;
  lastBroadcast: number;
  pendingMessages: any[];
}

const COLORS = [
  '#e94560', '#0f3460', '#16c79a', '#f39c12', '#9b59b6',
  '#3498db', '#e74c3c', '#2ecc71', '#1abc9c', '#f1c40f'
];

const USER_NAMES = [
  '用户', '成员', '伙伴', '同学', '同事'
];

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  public createRoom(): string {
    const roomId = this.generateRoomId();
    this.rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      elements: [],
      compositeBitmap: null,
      lastBroadcast: 0,
      pendingMessages: [],
    });
    return roomId;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public joinRoom(roomId: string, userId?: string): { user: User; room: Room } {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        users: new Map(),
        elements: [],
        compositeBitmap: null,
        lastBroadcast: 0,
        pendingMessages: [],
      };
      this.rooms.set(roomId, room);
    }

    const id = userId || uuidv4();
    const color = COLORS[room.users.size % COLORS.length];
    const name = `${USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)]}${room.users.size + 1}`;

    const user: User = {
      id,
      name,
      color,
      cursorX: 0,
      cursorY: 0,
    };

    room.users.set(id, user);
    return { user, room };
  }

  public leaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(userId);
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  public addElement(roomId: string, element: CanvasElement): void {
    const room = this.rooms.get(roomId);
    if (room) {
      if (element.type === 'eraser') {
        room.elements = room.elements.filter(el => el.id !== element.targetId);
      } else {
        room.elements.push(element);
        this.optimizeElements(room);
      }
    }
  }

  public clearCanvas(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.elements = [];
      room.compositeBitmap = null;
    }
  }

  public updateCursor(roomId: string, userId: string, x: number, y: number): void {
    const room = this.rooms.get(roomId);
    const user = room?.users.get(userId);
    if (user) {
      user.cursorX = x;
      user.cursorY = y;
    }
  }

  private optimizeElements(room: Room): void {
    if (room.elements.length > 500 && room.elements.length % 100 === 0) {
      const oldestElements = room.elements.slice(0, 200);
      room.elements = room.elements.slice(200);
    }
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  public getUsersList(roomId: string): User[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }
}
