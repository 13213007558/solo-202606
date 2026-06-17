import React, { useState, useEffect } from 'react';
import { ToolType } from './websocketClient';

interface ToolBarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  currentLineWidth: number;
  onLineWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  roomId: string;
  canUndo: boolean;
  canRedo: boolean;
  undoSteps: number;
  redoSteps: number;
}

const COLORS = [
  '#e94560', '#0f3460', '#16c79a', '#f39c12', '#9b59b6',
  '#3498db', '#e74c3c', '#2ecc71', '#1abc9c', '#f1c40f',
  '#ffffff', '#000000', '#95a5a6', '#34495e', '#ecf0f1'
];

const TOOLS_WITH_COLOR: ToolType[] = ['pen', 'rectangle', 'circle', 'sticky'];
const TOOLS_WITH_LINEWIDTH: ToolType[] = ['pen', 'rectangle', 'circle'];

const ToolBar: React.FC<ToolBarProps> = ({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  currentLineWidth,
  onLineWidthChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  roomId,
  canUndo,
  canRedo,
  undoSteps,
  redoSteps,
}) => {
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    const shouldShow = TOOLS_WITH_COLOR.includes(currentTool) || TOOLS_WITH_LINEWIDTH.includes(currentTool);
    setShowSettings(shouldShow);
  }, [currentTool]);

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: 'pen', icon: '✏️', label: '画笔' },
    { type: 'rectangle', icon: '⬜', label: '矩形' },
    { type: 'circle', icon: '⭕', label: '圆形' },
    { type: 'sticky', icon: '📝', label: '便签' },
    { type: 'eraser', icon: '🧹', label: '橡皮擦' },
    { type: 'pan', icon: '✋', label: '平移' },
  ];

  return (
    <div style={styles.toolbarWrapper}>
      <div style={styles.toolbar}>
        <div style={styles.toolsContainer}>
          {tools.map((tool) => (
            <button
              key={tool.type}
              style={{
                ...styles.toolButton,
                ...(currentTool === tool.type ? styles.activeToolButton : {}),
              }}
              onClick={() => onToolChange(tool.type)}
              title={tool.label}
            >
              <span style={styles.toolIcon}>{tool.icon}</span>
            </button>
          ))}
        </div>

        <div style={styles.divider} />

        <div style={styles.historyContainer}>
          <button
            style={{ ...styles.toolButton, ...(!canUndo ? styles.disabledButton : {}), ...styles.historyButton }}
            onClick={onUndo}
            disabled={!canUndo}
            title={`撤销 (${undoSteps}步可回退)`}
          >
            <span style={styles.toolIcon}>↩️</span>
            {undoSteps > 0 && <span style={styles.stepBadge}>{undoSteps}</span>}
          </button>
          <button
            style={{ ...styles.toolButton, ...(!canRedo ? styles.disabledButton : {}), ...styles.historyButton }}
            onClick={onRedo}
            disabled={!canRedo}
            title={`重做 (${redoSteps}步可前进)`}
          >
            <span style={styles.toolIcon}>↪️</span>
            {redoSteps > 0 && <span style={styles.stepBadge}>{redoSteps}</span>}
          </button>
        </div>

        <div style={styles.divider} />

        <button
          style={styles.toolButton}
          onClick={onClear}
          title="清空画布"
        >
          <span style={styles.toolIcon}>🗑️</span>
        </button>
        <button
          style={styles.toolButton}
          onClick={onExport}
          title="导出PNG"
        >
          <span style={styles.toolIcon}>📥</span>
        </button>

        <div style={styles.roomInfo}>
          <span style={styles.roomLabel}>房间:</span>
          <span style={styles.roomId}>{roomId}</span>
        </div>
      </div>

      {showSettings && (
        <div style={styles.settingsPanel}>
          <div style={styles.settingsInner}>
            {TOOLS_WITH_COLOR.includes(currentTool) && (
              <div style={styles.settingSection}>
                <span style={styles.settingLabel}>颜色</span>
                <div style={styles.colorPreview}
                  onClick={(e) => e.stopPropagation()}
                >
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      style={{
                        ...styles.colorOption,
                        backgroundColor: color,
                        ...(currentColor === color ? styles.colorOptionActive : {}),
                      }}
                      onClick={() => onColorChange(color)}
                    />
                  ))}
                  <div style={styles.colorInputWrapper}>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => onColorChange(e.target.value)}
                      style={styles.colorInput}
                    />
                  </div>
                </div>
              </div>
            )}

            {TOOLS_WITH_LINEWIDTH.includes(currentTool) && (
              <div style={styles.settingSection}>
                <span style={styles.settingLabel}>粗细</span>
                <div style={styles.lineWidthPreview}>
                  <div style={{
                    width: Math.min(currentLineWidth, 30),
                    height: Math.min(currentLineWidth, 30),
                    backgroundColor: currentColor,
                    borderRadius: '50%',
                    flexShrink: 0,
                  }} />
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={currentLineWidth}
                    onChange={(e) => onLineWidthChange(Number(e.target.value))}
                    style={styles.slider}
                  />
                  <span style={styles.lineWidthValue}>{currentLineWidth}px</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  toolbarWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(233, 69, 96, 0.3)',
    width: '100%',
  },
  toolsContainer: {
    display: 'flex',
    gap: '6px',
  },
  toolButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(15, 52, 96, 0.6)',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    outline: 'none',
    position: 'relative',
  },
  activeToolButton: {
    backgroundColor: '#e94560',
    boxShadow: '0 4px 12px rgba(233, 69, 96, 0.4)',
    transform: 'translateY(-1px)',
  },
  disabledButton: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  toolIcon: {
    fontSize: '18px',
  },
  historyButton: {
    position: 'relative',
  },
  stepBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#0f3460',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '1px solid rgba(233, 69, 96, 0.5)',
  },
  historyContainer: {
    display: 'flex',
    gap: '6px',
  },
  divider: {
    width: '1px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px',
  },
  roomInfo: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    backgroundColor: 'rgba(15, 52, 96, 0.6)',
    borderRadius: '8px',
  },
  roomLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
  },
  roomId: {
    color: '#e94560',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '1px',
  },
  settingsPanel: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(233, 69, 96, 0.2)',
    borderLeft: '1px solid rgba(233, 69, 96, 0.2)',
    borderRight: '1px solid rgba(233, 69, 96, 0.2)',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
    padding: '10px 20px',
    animation: 'slideDown 0.2s ease',
  },
  settingsInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  settingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  settingLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  colorPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
    padding: 0,
  },
  colorOptionActive: {
    borderColor: '#ffffff',
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  colorInputWrapper: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorInput: {
    width: '40px',
    height: '40px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    padding: 0,
  },
  lineWidthPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  slider: {
    width: '150px',
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: 'rgba(15, 52, 96, 0.8)',
    outline: 'none',
  },
  lineWidthValue: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '13px',
    fontWeight: 500,
    minWidth: '40px',
    textAlign: 'right',
  },
};

export default ToolBar;
