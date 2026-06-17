import { CanvasEngine, DrawElement, CameraState, ToolType } from './canvasEngine';
import { SyncManager, UserInfo, ConnectionStatus } from './syncManager';
import { ToolbarUI } from './toolbarUI';
import { UserPanel } from './userPanel';

const generateUserId = (): string => {
  let id = localStorage.getItem('wb_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('wb_user_id', id);
  }
  return id;
};

const getRoomId = (): string => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('room')) {
    return params.get('room')!;
  }
  const room = 'room_' + (location.hash.slice(1) || 'default');
  return room;
};

const userId = generateUserId();
const roomId = getRoomId();

const canvas = document.getElementById('whiteboard') as HTMLCanvasElement;
const container = document.getElementById('canvas-container') as HTMLElement;

let canvasEngine: CanvasEngine;
let syncManager: SyncManager;
let toolbarUI: ToolbarUI;
let userPanel: UserPanel;

let lastViewSendTime = 0;
const VIEW_SEND_THROTTLE = 50;

toolbarUI = new ToolbarUI({
  onColorChange: (color: string) => {
    canvasEngine?.setColor(color);
  },
  onBrushSizeChange: (size: number) => {
    canvasEngine?.setBrushWidth(size);
  },
  onToolChange: (tool: ToolType) => {
    canvasEngine?.setTool(tool);
  },
  onClearAll: () => {
    canvasEngine?.clearAll();
    syncManager?.sendClear();
  },
  onToggleGrid: (visible: boolean) => {
    canvasEngine?.setGridVisible(visible);
  }
});

userPanel = new UserPanel();

canvasEngine = new CanvasEngine(canvas, container, userId, {
  onDrawRecord: (element: DrawElement) => {
    syncManager?.sendDraw(element);
  },
  onClear: () => {
  },
  onViewChange: (camera: CameraState) => {
    const now = Date.now();
    if (now - lastViewSendTime > VIEW_SEND_THROTTLE) {
      lastViewSendTime = now;
      syncManager?.sendViewChange(camera);
    }
  }
});

syncManager = new SyncManager(userId, roomId, {
  onRemoteDraw: (element: DrawElement) => {
    canvasEngine.addRemoteElement(element);
  },
  onRemoteClear: () => {
    canvasEngine.clearAll();
  },
  onUserJoin: (user: UserInfo) => {
    userPanel.addUser(user);
  },
  onUserLeave: (uid: string) => {
    userPanel.removeUser(uid);
  },
  onUserList: (users: UserInfo[]) => {
    userPanel.setUsers(users);
  },
  onRemoteView: (uid: string, camera: CameraState) => {
  },
  onStatusChange: (status: ConnectionStatus) => {
    userPanel.setStatus(status);
  },
  onRequestFullSync: (): DrawElement[] => {
    return canvasEngine.getElements();
  }
});

canvas.addEventListener('pointerdown', (e) => {
  if (e.button === 0 && toolbarUI.getTool() === 'pen') {
    ToolbarUI.createPointerFeedback(e.clientX, e.clientY, toolbarUI.getColor());
  }
});

const init = async (): Promise<void> => {
  toolbarUI.setColor('#6366f1');
  toolbarUI.setBrushSize(4);
  toolbarUI.setTool('pen');

  userPanel.setStatus('reconnecting');

  await syncManager.connect();

  console.log(`[App] 协作白板已启动`);
  console.log(`[App] 用户ID: ${userId}`);
  console.log(`[App] 房间ID: ${roomId}`);
  console.log(`[App] 提示: 打开多个标签页或窗口即可体验多人协作`);
};

init().catch((err) => {
  console.error('[App] 初始化失败:', err);
  userPanel.setStatus('disconnected');
});

window.addEventListener('beforeunload', () => {
  syncManager.disconnect();
  canvasEngine.destroy();
});
