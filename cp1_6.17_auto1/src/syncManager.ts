import { DrawElement, CameraState } from './canvasEngine';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface UserInfo {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface SyncCallbacks {
  onRemoteDraw: (element: DrawElement) => void;
  onRemoteClear: () => void;
  onUserJoin: (user: UserInfo) => void;
  onUserLeave: (userId: string) => void;
  onUserList: (users: UserInfo[]) => void;
  onRemoteView: (userId: string, camera: CameraState) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onRequestFullSync: () => DrawElement[];
}

type SyncMode = 'socket' | 'local' | 'offline';

const STORAGE_KEY = 'whiteboard_sync_v1';
const USER_STORAGE_KEY = 'whiteboard_users_v1';

export class SyncManager {
  private userId: string;
  private roomId: string;
  private callbacks: SyncCallbacks;
  private socket: any = null;
  private mode: SyncMode = 'offline';
  private broadcastChannel: BroadcastChannel | null = null;
  private userStorageTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;
  private status: ConnectionStatus = 'disconnected';

  private static readonly USER_COLORS = [
    '#ef4444', '#f59e0b', '#eab308', '#84cc16',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  constructor(userId: string, roomId: string, callbacks: SyncCallbacks) {
    this.userId = userId;
    this.roomId = roomId;
    this.callbacks = callbacks;
  }

  async connect(): Promise<void> {
    this.setStatus('reconnecting');

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.initLocalMode();
      }

      try {
        await this.initSocketMode();
      } catch (err) {
        console.warn('[Sync] Socket.io 连接失败，回退到本地模式');
      }

      if (this.mode === 'offline' && this.broadcastChannel) {
        this.mode = 'local';
        this.setStatus('connected');
        this.announceLocalUser();
      }
    } catch (err) {
      console.error('[Sync] 连接失败:', err);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private async initSocketMode(): Promise<void> {
    try {
      const ioModule = await import('socket.io-client');
      const io = ioModule.default || ioModule.io;

      const wsUrl = this.getWsUrl();
      if (!wsUrl) {
        throw new Error('未配置 WebSocket 地址');
      }

      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 5000,
        query: {
          roomId: this.roomId,
          userId: this.userId,
          userData: JSON.stringify(this.getCurrentUser())
        }
      });

      this.socket.on('connect', () => {
        this.mode = 'socket';
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.socket.emit('join-room', { roomId: this.roomId });
      });

      this.socket.on('disconnect', (reason: string) => {
        if (reason === 'io client disconnect') return;
        this.setStatus('disconnected');
        this.scheduleReconnect();
      });

      this.socket.on('connect_error', () => {
        this.setStatus('disconnected');
      });

      this.socket.on('draw', (data: { element: DrawElement }) => {
        this.callbacks.onRemoteDraw(data.element);
      });

      this.socket.on('clear', () => {
        this.callbacks.onRemoteClear();
      });

      this.socket.on('user-join', (data: { user: UserInfo }) => {
        this.callbacks.onUserJoin(data.user);
      });

      this.socket.on('user-leave', (data: { userId: string }) => {
        this.callbacks.onUserLeave(data.userId);
      });

      this.socket.on('user-list', (data: { users: UserInfo[] }) => {
        this.callbacks.onUserList(data.users);
      });

      this.socket.on('view-change', (data: { userId: string; camera: CameraState }) => {
        this.callbacks.onRemoteView(data.userId, data.camera);
      });

      this.socket.on('request-sync', (data: { targetUserId: string }) => {
        if (data.targetUserId === this.userId) {
          const elements = this.callbacks.onRequestFullSync();
          elements.forEach((el, i) => {
            setTimeout(() => this.socket.emit('draw', { element: el, roomId: this.roomId }), i * 10);
          });
        }
      });

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('连接超时')), 5000);
        this.socket.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        this.socket.once('connect_error', (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    } catch (err) {
      throw err;
    }
  }

  private getWsUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ws')) {
      return params.get('ws');
    }
    if (localStorage.getItem('ws_url')) {
      return localStorage.getItem('ws_url');
    }
    return null;
  }

  private initLocalMode(): void {
    try {
      this.broadcastChannel = new BroadcastChannel(`${STORAGE_KEY}_${this.roomId}`);

      this.broadcastChannel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || msg.userId === this.userId) return;

        switch (msg.type) {
          case 'draw':
            this.callbacks.onRemoteDraw(msg.element);
            break;
          case 'clear':
            this.callbacks.onRemoteClear();
            break;
          case 'user-join':
            this.callbacks.onUserJoin(msg.user);
            this.broadcastChannel?.postMessage({
              type: 'user-present',
              userId: this.userId,
              user: this.getCurrentUser()
            });
            break;
          case 'user-leave':
            this.callbacks.onUserLeave(msg.userId);
            break;
          case 'user-present':
            this.callbacks.onUserJoin(msg.user);
            break;
          case 'view-change':
            this.callbacks.onRemoteView(msg.userId, msg.camera);
            break;
        }
      };

      this.startUserHeartbeat();

      window.addEventListener('beforeunload', () => {
        this.broadcastChannel?.postMessage({
          type: 'user-leave',
          userId: this.userId
        });
      });
    } catch (err) {
      console.warn('[Sync] BroadcastChannel 初始化失败:', err);
    }
  }

  private startUserHeartbeat(): void {
    const key = `${USER_STORAGE_KEY}_${this.roomId}`;

    const updateUsers = () => {
      try {
        const raw = localStorage.getItem(key);
        const stored: Record<string, { user: UserInfo; lastSeen: number }> = raw ? JSON.parse(raw) : {};

        const now = Date.now();
        stored[this.userId] = {
          user: this.getCurrentUser(),
          lastSeen: now
        };

        const active: UserInfo[] = [];
        for (const [id, entry] of Object.entries(stored)) {
          if (now - entry.lastSeen < 15000) {
            active.push(entry.user);
          } else {
            delete stored[id];
            if (id !== this.userId) {
              this.callbacks.onUserLeave(id);
            }
          }
        }

        localStorage.setItem(key, JSON.stringify(stored));
        this.callbacks.onUserList(active);
      } catch (e) {
      }
    };

    updateUsers();
    this.userStorageTimer = window.setInterval(updateUsers, 5000);
  }

  private announceLocalUser(): void {
    const user = this.getCurrentUser();
    this.broadcastChannel?.postMessage({
      type: 'user-join',
      userId: this.userId,
      user
    });

    setTimeout(() => {
      const key = `${USER_STORAGE_KEY}_${this.roomId}`;
      try {
        const raw = localStorage.getItem(key);
        const stored: Record<string, { user: UserInfo; lastSeen: number }> = raw ? JSON.parse(raw) : {};
        const users: UserInfo[] = [];
        for (const entry of Object.values(stored)) {
          if (Date.now() - entry.lastSeen < 15000) {
            users.push(entry.user);
          }
        }
        if (users.length > 0) {
          this.callbacks.onUserList(users);
        } else {
          this.callbacks.onUserList([user]);
        }
      } catch (e) {
        this.callbacks.onUserList([user]);
      }
    }, 300);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.mode === 'local') return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[Sync] 达到最大重连次数');
      return;
    }

    this.setStatus('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.initSocketMode().catch(() => {
        this.scheduleReconnect();
      });
    }, delay);
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.callbacks.onStatusChange(status);
    }
  }

  sendDraw(element: DrawElement): void {
    if (this.mode === 'socket' && this.socket) {
      this.socket.emit('draw', { element, roomId: this.roomId });
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'draw',
        userId: this.userId,
        element
      });
    }
  }

  sendClear(): void {
    if (this.mode === 'socket' && this.socket) {
      this.socket.emit('clear', { roomId: this.roomId });
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'clear',
        userId: this.userId
      });
    }
  }

  sendViewChange(camera: CameraState): void {
    if (this.mode === 'socket' && this.socket) {
      this.socket.emit('view-change', { camera, roomId: this.roomId });
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'view-change',
        userId: this.userId,
        camera
      });
    }
  }

  getCurrentUser(): UserInfo {
    const saved = localStorage.getItem(`wb_user_${this.userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
      }
    }

    const color = SyncManager.USER_COLORS[Math.floor(Math.random() * SyncManager.USER_COLORS.length)];
    const names = ['小明', '小红', '阿强', '小美', '大壮', '小雅', '老王', '阿珍'];
    const name = names[Math.floor(Math.random() * names.length)];

    const user: UserInfo = {
      id: this.userId,
      name,
      color
    };

    try {
      localStorage.setItem(`wb_user_${this.userId}`, JSON.stringify(user));
    } catch (e) {
    }

    return user;
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'user-leave',
        userId: this.userId
      });
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.userStorageTimer) {
      clearInterval(this.userStorageTimer);
      this.userStorageTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.mode = 'offline';
    this.setStatus('disconnected');
  }
}
