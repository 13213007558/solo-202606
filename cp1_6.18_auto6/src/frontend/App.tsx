import React, { useState, useEffect, useRef, useCallback } from 'react';
import ToolBar from './ToolBar';
import Canvas, { CanvasRef } from './Canvas';
import { WebSocketClient, ToolType } from './websocketClient';
import { User, CanvasElement } from '../backend/roomManager';

const MAX_HISTORY = 30;
const ACTIVE_TIMEOUT = 5000;

const App: React.FC = () => {
  const [wsConnected, setWsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState('#e94560');
  const [currentLineWidth, setCurrentLineWidth] = useState(4);
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [roomInput, setRoomInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportPreviewUrl, setExportPreviewUrl] = useState('');

  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [userActiveMap, setUserActiveMap] = useState<Map<string, number>>(new Map());

  const wsClientRef = useRef<WebSocketClient | null>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const activeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const markUserActive = useCallback((userId: string) => {
    setUserActiveMap((prev) => {
      const next = new Map(prev);
      next.set(userId, Date.now());
      return next;
    });

    const existingTimer = activeTimersRef.current.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      setUserActiveMap((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
      activeTimersRef.current.delete(userId);
    }, ACTIVE_TIMEOUT);
    activeTimersRef.current.set(userId, timer);
  }, []);

  useEffect(() => {
    wsClientRef.current = new WebSocketClient();
    wsClientRef.current.connect({
      onRoomCreated: (roomId) => {
        setCurrentRoom(roomId);
        wsClientRef.current?.joinRoom(roomId);
      },
      onJoinedRoom: (user, roomId, savedElements, usersList) => {
        setCurrentUser(user);
        setCurrentRoom(roomId);
        setCurrentColor(user.color);
        setElements(savedElements);
        setUsers(usersList);
        setShowJoinModal(false);
        setHistory([savedElements]);
        setHistoryIndex(0);
      },
      onUserJoined: (user, usersList) => {
        setUsers(usersList);
      },
      onUserLeft: (userId, usersList) => {
        setUsers(usersList);
        setUserActiveMap((prev) => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
        const timer = activeTimersRef.current.get(userId);
        if (timer) {
          clearTimeout(timer);
          activeTimersRef.current.delete(userId);
        }
      },
      onDraw: (element) => {
        markUserActive(element.userId);
        setElements((prev) => {
          let newElements: CanvasElement[];
          if (element.type === 'eraser') {
            newElements = prev.filter((el) => el.id !== element.targetId);
          } else {
            newElements = [...prev, element];
          }
          setHistory((h) => {
            const newHistory = h.slice(0, historyIndex + 1);
            newHistory.push(newElements);
            while (newHistory.length > MAX_HISTORY) {
              newHistory.shift();
            }
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
          });
          return newElements;
        });
      },
      onCursorUpdate: (userId, x, y) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, cursorX: x, cursorY: y } : u))
        );
      },
      onCanvasCleared: () => {
        setElements([]);
        setHistory([[]]);
        setHistoryIndex(0);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
    }).then(() => {
      setWsConnected(true);
    }).catch((err) => {
      console.error('Failed to connect:', err);
    });

    return () => {
      wsClientRef.current?.disconnect();
      activeTimersRef.current.forEach((timer) => clearTimeout(timer));
      activeTimersRef.current.clear();
    };
  }, [markUserActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const handleCreateRoom = () => {
    if (wsClientRef.current) {
      wsClientRef.current.createRoom();
    }
  };

  const handleJoinRoom = () => {
    if (roomInput.trim() && wsClientRef.current) {
      wsClientRef.current.joinRoom(roomInput.trim().toUpperCase());
    }
  };

  const handleDrawElement = useCallback((element: CanvasElement) => {
    if (currentUser) {
      markUserActive(currentUser.id);
    }
    setElements((prev) => {
      let newElements: CanvasElement[];
      if (element.type === 'eraser') {
        newElements = prev.filter((el) => el.id !== element.targetId);
      } else {
        newElements = [...prev, element];
      }
      setHistory((h) => {
        const newHistory = h.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        while (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
      return newElements;
    });
    if (wsClientRef.current && currentRoom) {
      wsClientRef.current.draw(currentRoom, element);
    }
  }, [currentRoom, historyIndex, currentUser, markUserActive]);

  const handleCursorUpdate = useCallback((x: number, y: number) => {
    if (wsClientRef.current && currentRoom && currentUser) {
      wsClientRef.current.updateCursor(currentRoom, currentUser.id, x, y);
    }
  }, [currentRoom, currentUser]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      if (wsClientRef.current && currentRoom && currentUser) {
        wsClientRef.current.undo(currentRoom, currentUser.id);
      }
    }
  }, [historyIndex, history, currentRoom, currentUser]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      if (wsClientRef.current && currentRoom && currentUser) {
        wsClientRef.current.redo(currentRoom, currentUser.id);
      }
    }
  }, [historyIndex, history, currentRoom, currentUser]);

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
    if (wsClientRef.current && currentRoom) {
      wsClientRef.current.clearCanvas(currentRoom);
    }
    setShowClearConfirm(false);
  };

  const handleExport = () => {
    const dataUrl = canvasRef.current?.exportPNG();
    if (dataUrl) {
      setExportPreviewUrl(dataUrl);
      setShowExportPreview(true);
    }
  };

  const confirmExport = () => {
    if (exportPreviewUrl) {
      const link = document.createElement('a');
      link.download = `whiteboard-${currentRoom}-${Date.now()}.png`;
      link.href = exportPreviewUrl;
      link.click();
    }
    setShowExportPreview(false);
    setExportPreviewUrl('');
  };

  const cancelExport = () => {
    setShowExportPreview(false);
    setExportPreviewUrl('');
  };

  const undoSteps = historyIndex;
  const redoSteps = history.length - 1 - historyIndex;

  const isUserActive = (userId: string): boolean => {
    const lastActive = userActiveMap.get(userId);
    if (!lastActive) return false;
    return Date.now() - lastActive < ACTIVE_TIMEOUT;
  };

  const toolbarHasSettings = ['pen', 'rectangle', 'circle', 'sticky'].includes(currentTool);
  const canvasTop = isMobile ? '0px' : (toolbarHasSettings ? '110px' : '64px');

  const renderUserList = () => (
    <div style={isMobile && !showUserDrawer ? { ...styles.userDrawer, ...styles.userDrawerCollapsed } : styles.userList}>
      {isMobile && (
        <button
          style={styles.userDrawerToggle}
          onClick={() => setShowUserDrawer(!showUserDrawer)}
        >
          👥 {users.length}
        </button>
      )}
      {(!isMobile || showUserDrawer) && (
        <>
          <div style={styles.userListTitle}>
            <span>在线用户</span>
            <span style={styles.userCount}>{users.length}</span>
          </div>
          <div style={styles.userListContainer}>
            {users.map((user) => (
              <div key={user.id} style={styles.userItem}>
                <div style={styles.avatarWrapper}>
                  <div
                    style={{
                      ...styles.userAvatar,
                      backgroundColor: user.color,
                    }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div
                    style={{
                      ...styles.activeDot,
                      backgroundColor: isUserActive(user.id) ? '#2ecc71' : 'transparent',
                      opacity: isUserActive(user.id) ? 1 : 0,
                      boxShadow: isUserActive(user.id) ? '0 0 6px #2ecc71' : 'none',
                    }}
                  />
                </div>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user.name}</span>
                  {user.id === currentUser?.id && (
                    <span style={styles.selfBadge}>我</span>
                  )}
                  {isUserActive(user.id) && user.id !== currentUser?.id && (
                    <span style={styles.activeBadge}>绘制中</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (showJoinModal) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <h1 style={styles.modalTitle}>协作白板</h1>
          <p style={styles.modalSubtitle}>多人实时协作，创意无限</p>
          <div style={styles.modalContent}>
            <button style={styles.primaryButton} onClick={handleCreateRoom}>
              🎨 创建新房间
            </button>
            <div style={styles.dividerText}>
              <span>或加入现有房间</span>
            </div>
            <div style={styles.joinRoomContainer}>
              <input
                type="text"
                placeholder="输入房间ID"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                style={styles.roomInput}
                maxLength={10}
              />
              <button
                style={{
                  ...styles.secondaryButton,
                  ...(!roomInput.trim() ? styles.disabledButton : {}),
                }}
                onClick={handleJoinRoom}
                disabled={!roomInput.trim()}
              >
                加入
              </button>
            </div>
          </div>
          {!wsConnected && (
            <p style={styles.connectingText}>正在连接服务器...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {!isMobile && (
        <ToolBar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          currentColor={currentColor}
          onColorChange={setCurrentColor}
          currentLineWidth={currentLineWidth}
          onLineWidthChange={setCurrentLineWidth}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onExport={handleExport}
          roomId={currentRoom}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          undoSteps={undoSteps}
          redoSteps={redoSteps}
        />
      )}

      <div style={{ ...styles.canvasContainer, top: canvasTop }}>
        <Canvas
          ref={canvasRef}
          elements={elements}
          currentTool={currentTool}
          currentColor={currentColor}
          currentLineWidth={currentLineWidth}
          userId={currentUser?.id || ''}
          onDrawElement={handleDrawElement}
          onCursorUpdate={handleCursorUpdate}
          users={users}
          roomId={currentRoom}
        />
      </div>

      {renderUserList()}

      {isMobile && (
        <div style={styles.mobileToolbar}>
          <ToolBar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            currentColor={currentColor}
            onColorChange={setCurrentColor}
            currentLineWidth={currentLineWidth}
            onLineWidthChange={setCurrentLineWidth}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onExport={handleExport}
            roomId={currentRoom}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            undoSteps={undoSteps}
            redoSteps={redoSteps}
          />
        </div>
      )}

      {showClearConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmModal}>
            <h3 style={styles.confirmTitle}>确认清空画布？</h3>
            <p style={styles.confirmText}>此操作将删除画布上的所有内容，且无法撤销。</p>
            <div style={styles.confirmButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowClearConfirm(false)}
              >
                取消
              </button>
              <button style={styles.dangerButton} onClick={confirmClear}>
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportPreview && (
        <div style={styles.modalOverlay}>
          <div style={styles.exportModal}>
            <h3 style={styles.exportTitle}>导出预览</h3>
            <div style={styles.exportPreviewContainer}>
              <img
                src={exportPreviewUrl}
                alt="导出预览"
                style={styles.exportPreviewImage}
              />
            </div>
            <p style={styles.exportInfo}>
              图片尺寸：约 {elements.length} 个元素
            </p>
            <div style={styles.confirmButtons}>
              <button
                style={styles.cancelButton}
                onClick={cancelExport}
              >
                取消
              </button>
              <button style={styles.primaryButton} onClick={confirmExport}>
                📥 确认下载
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform: translateX(-50%) scale(0.9); opacity: 0; }
          to { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 4px #2ecc71; }
          50% { box-shadow: 0 0 10px #2ecc71; }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #e94560;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(233, 69, 96, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #e94560;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(233, 69, 96, 0.4);
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  canvasContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    transition: 'top 0.2s ease',
  },
  userList: {
    position: 'fixed',
    left: '16px',
    bottom: '16px',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid rgba(233, 69, 96, 0.2)',
    minWidth: '200px',
    maxHeight: '320px',
    zIndex: 999,
  },
  userDrawer: {
    position: 'fixed',
    left: '16px',
    bottom: '80px',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid rgba(233, 69, 96, 0.2)',
    minWidth: '200px',
    maxHeight: '320px',
    zIndex: 999,
    animation: 'slideUp 0.2s ease',
  },
  userDrawerCollapsed: {
    minWidth: 'auto',
    padding: '8px',
  },
  userDrawerToggle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(15, 52, 96, 0.8)',
    color: '#ffffff',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  userListTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '13px',
    fontWeight: 500,
  },
  userCount: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
  },
  userListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    maxHeight: '260px',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
  },
  activeDot: {
    position: 'absolute',
    right: '-2px',
    bottom: '-2px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid #1a1a2e',
    transition: 'all 0.3s ease',
    animation: 'pulseGreen 1.5s infinite',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  userName: {
    color: '#ffffff',
    fontSize: '14px',
  },
  selfBadge: {
    backgroundColor: '#e94560',
    color: '#ffffff',
    fontSize: '10px',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  activeBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    color: '#2ecc71',
    fontSize: '10px',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '420px',
    width: '90%',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    animation: 'slideUp 0.3s ease',
  },
  modalTitle: {
    fontSize: '32px',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '8px',
    fontWeight: 700,
  },
  modalSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  primaryButton: {
    padding: '14px 24px',
    backgroundColor: '#e94560',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(233, 69, 96, 0.3)',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#0f3460',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  disabledButton: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  dividerText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '13px',
    position: 'relative',
  },
  joinRoomContainer: {
    display: 'flex',
    gap: '10px',
  },
  roomInput: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'rgba(15, 52, 96, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  connectingText: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
  },
  confirmModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '28px',
    maxWidth: '360px',
    width: '90%',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    animation: 'slideUp 0.2s ease',
  },
  exportModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '520px',
    width: '90%',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    animation: 'slideUp 0.2s ease',
  },
  exportTitle: {
    fontSize: '20px',
    color: '#ffffff',
    marginBottom: '16px',
    fontWeight: 600,
    textAlign: 'center',
  },
  exportPreviewContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '12px',
    maxHeight: '350px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportPreviewImage: {
    maxWidth: '100%',
    maxHeight: '340px',
    borderRadius: '4px',
    display: 'block',
  },
  exportInfo: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '16px',
    textAlign: 'center',
  },
  confirmTitle: {
    fontSize: '20px',
    color: '#ffffff',
    marginBottom: '12px',
    fontWeight: 600,
  },
  confirmText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px',
    lineHeight: 1.6,
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dangerButton: {
    padding: '10px 20px',
    backgroundColor: '#e94560',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mobileToolbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
};

export default App;
