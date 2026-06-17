import React, { useState } from 'react';
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
}

const COLORS = [
  '#e94560', '#0f3460', '#16c79a', '#f39c12', '#9b59b6',
  '#3498db', '#e74c3c', '#2ecc71', '#1abc9c', '#f1c40f',
  '#ffffff', '#000000', '#95a5a6', '#34495e', '#ecf0f1'
];

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
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLineWidth, setShowLineWidth] = useState(false);

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: 'pen', icon: '✏️', label: '画笔' },
    { type: 'rectangle', icon: '⬜', label: '矩形' },
    { type: 'circle', icon: '⭕', label: '圆形' },
    { type: 'sticky', icon: '📝', label: '便签' },
    { type: 'eraser', icon: '🧹', label: '橡皮擦' },
    { type: 'pan', icon: '✋', label: '平移' },
  ];

  return (
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

      <div style={styles.popoverContainer}>
        <button
          style={{
            ...styles.toolButton,
            ...styles.colorButton,
            backgroundColor: currentColor,
          }}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowLineWidth(false);
          }}
          title="选择颜色"
        />
        {showColorPicker && (
          <div style={styles.popover}>
            <div style={styles.colorGrid}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  style={{
                    ...styles.colorOption,
                    backgroundColor: color,
                    ...(currentColor === color ? styles.colorOptionActive : {}),
                  }}
                  onClick={() => {
                    onColorChange(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div style={styles.customColorContainer}>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                style={styles.colorInput}
              />
            </div>
          </div>
        )}
      </div>

      <div style={styles.popoverContainer}>
        <button
          style={styles.toolButton}
          onClick={() => {
            setShowLineWidth(!showLineWidth);
            setShowColorPicker(false);
          }}
          title="画笔粗细"
        >
          <div
            style={{
              width: currentLineWidth,
              height: currentLineWidth,
              backgroundColor: currentColor,
              borderRadius: '50%',
            }}
          />
        </button>
        {showLineWidth && (
          <div style={styles.popover}>
            <div style={styles.lineWidthContainer}>
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

      <div style={styles.divider} />

      <button
        style={{ ...styles.toolButton, ...(!canUndo ? styles.disabledButton : {}) }}
        onClick={onUndo}
        disabled={!canUndo}
        title="撤销"
      >
        <span style={styles.toolIcon}>↩️</span>
      </button>
      <button
        style={{ ...styles.toolButton, ...(!canRedo ? styles.disabledButton : {}) }}
        onClick={onRedo}
        disabled={!canRedo}
        title="重做"
      >
        <span style={styles.toolIcon}>↪️</span>
      </button>

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
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(233, 69, 96, 0.3)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
  colorButton: {
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  divider: {
    width: '1px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px',
  },
  popoverContainer: {
    position: 'relative',
  },
  popover: {
    position: 'absolute',
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%) scale(1)',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 1001,
    animation: 'popIn 0.15s ease',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },
  colorOption: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    padding: 0,
  },
  colorOptionActive: {
    borderColor: '#ffffff',
    transform: 'scale(1.1)',
  },
  customColorContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  colorInput: {
    width: '100%',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  lineWidthContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    minWidth: '150px',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: 'rgba(15, 52, 96, 0.8)',
    outline: 'none',
  },
  lineWidthValue: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
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
};

export default ToolBar;
