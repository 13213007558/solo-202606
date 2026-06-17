import { CanvasEngine } from './canvasEngine';
import { SyncManager } from './syncManager';
import { ToolbarUI } from './toolbarUI';
import { UserPanel } from './userPanel';
const generateUserId = () => {
    let id = localStorage.getItem('wb_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('wb_user_id', id);
    }
    return id;
};
const getRoomId = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) {
        return params.get('room');
    }
    const room = 'room_' + (location.hash.slice(1) || 'default');
    return room;
};
const userId = generateUserId();
const roomId = getRoomId();
const canvas = document.getElementById('whiteboard');
const container = document.getElementById('canvas-container');
let canvasEngine;
let syncManager;
let toolbarUI;
let userPanel;
let lastViewSendTime = 0;
const VIEW_SEND_THROTTLE = 50;
toolbarUI = new ToolbarUI({
    onColorChange: (color) => {
        canvasEngine?.setColor(color);
    },
    onBrushSizeChange: (size) => {
        canvasEngine?.setBrushWidth(size);
    },
    onToolChange: (tool) => {
        canvasEngine?.setTool(tool);
    },
    onClearAll: () => {
        canvasEngine?.clearAll();
        syncManager?.sendClear();
    },
    onToggleGrid: (visible) => {
        canvasEngine?.setGridVisible(visible);
    }
});
userPanel = new UserPanel();
canvasEngine = new CanvasEngine(canvas, container, userId, {
    onDrawRecord: (element) => {
        syncManager?.sendDraw(element);
    },
    onClear: () => {
    },
    onViewChange: (camera) => {
        const now = Date.now();
        if (now - lastViewSendTime > VIEW_SEND_THROTTLE) {
            lastViewSendTime = now;
            syncManager?.sendViewChange(camera);
        }
    }
});
syncManager = new SyncManager(userId, roomId, {
    onRemoteDraw: (element) => {
        canvasEngine.addRemoteElement(element);
    },
    onRemoteClear: () => {
        canvasEngine.clearAll();
    },
    onUserJoin: (user) => {
        userPanel.addUser(user);
    },
    onUserLeave: (uid) => {
        userPanel.removeUser(uid);
    },
    onUserList: (users) => {
        userPanel.setUsers(users);
    },
    onRemoteView: (uid, camera) => {
    },
    onStatusChange: (status) => {
        userPanel.setStatus(status);
    },
    onRequestFullSync: () => {
        return canvasEngine.getElements();
    }
});
canvas.addEventListener('pointerdown', (e) => {
    if (e.button === 0 && toolbarUI.getTool() === 'pen') {
        ToolbarUI.createPointerFeedback(e.clientX, e.clientY, toolbarUI.getColor());
    }
});
const init = async () => {
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
