import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD'
];

const generateColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const normalizeHex = (value: string): string => {
  let hex = value.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  hex = hex.toUpperCase();
  return hex;
};

const isValidHex = (value: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(normalizeHex(value));
};

function ColorEditor() {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [showModal, setShowModal] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [author, setAuthor] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleColorPickerClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value.toUpperCase();
    setColors(newColors);
  };

  const handleHexInput = (index: number, value: string) => {
    if (value.length <= 7) {
      const newColors = [...colors];
      newColors[index] = value;
      setColors(newColors);
    }
  };

  const handleHexBlur = (index: number) => {
    const hex = colors[index];
    if (isValidHex(hex)) {
      const newColors = [...colors];
      newColors[index] = normalizeHex(hex);
      setColors(newColors);
    }
  };

  const addColor = () => {
    if (colors.length < 12) {
      setColors([...colors, generateColor()]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 6) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newColors = [...colors];
    const draggedItem = newColors[dragIndex];
    newColors.splice(dragIndex, 1);
    newColors.splice(index, 0, draggedItem);
    setColors(newColors);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const openSaveModal = () => {
    setErrors([]);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setPaletteName('');
      setAuthor('');
      setErrors([]);
    }
  };

  const handleSave = useCallback(async () => {
    const validationErrors: string[] = [];

    if (!paletteName || paletteName.length < 2 || paletteName.length > 30) {
      validationErrors.push('方案名称长度必须在2-30字符之间');
    }
    if (!author.trim()) {
      validationErrors.push('作者昵称不能为空');
    }

    const normalizedColors = colors.map(c => {
      if (isValidHex(c)) return normalizeHex(c);
      return c;
    });

    const invalidColors = normalizedColors.filter(c => !isValidHex(c));
    if (invalidColors.length > 0) {
      validationErrors.push(`${invalidColors.length}个颜色格式不正确`);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      const response = await axios.post('/api/palettes', {
        name: paletteName.trim(),
        author: author.trim(),
        colors: normalizedColors
      });

      setShowModal(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/palette/${response.data.id}`);
      }, 1200);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors(['保存失败，请稍后重试']);
      }
    } finally {
      setSaving(false);
    }
  }, [paletteName, author, colors, navigate]);

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1 className="editor-title">配色方案编辑器</h1>
        <p className="editor-subtitle">
          拖拽排序 · 支持 {colors.length}/12 种颜色
        </p>
      </div>

      <div className="editor-toolbar">
        <button
          className="btn btn-secondary"
          onClick={addColor}
          disabled={colors.length >= 12}
        >
          + 添加颜色
        </button>
        <button
          className="btn btn-primary"
          onClick={openSaveModal}
        >
          保存方案
        </button>
      </div>

      <div className="color-picker-grid">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`color-picker-item ${dragIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="color-picker-top">
              <div
                className="color-swatch"
                style={{ backgroundColor: isValidHex(color) ? color : '#333' }}
                onClick={() => handleColorPickerClick(index)}
                title="点击选择颜色"
              >
                <input
                  type="color"
                  ref={(el) => { fileInputRefs.current[index] = el; }}
                  value={isValidHex(color) ? normalizeHex(color) : '#000000'}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="native-color-input"
                />
              </div>
              {colors.length > 6 && (
                <button
                  className="remove-color-btn"
                  onClick={() => removeColor(index)}
                  title="删除颜色"
                >
                  ×
                </button>
              )}
            </div>
            <input
              type="text"
              className={`hex-input ${!isValidHex(color) && color.length > 1 ? 'invalid' : ''}`}
              value={color}
              onChange={(e) => handleHexInput(index, e.target.value)}
              onBlur={() => handleHexBlur(index)}
              placeholder="#FFFFFF"
              maxLength={7}
            />
          </div>
        ))}
      </div>

      <div className="preview-section">
        <h3 className="preview-title">实时预览</h3>
        <div className="preview-bar-card">
          <div className="preview-bar">
            {colors.map((color, index) => (
              <div
                key={index}
                className="preview-color-segment"
                style={{
                  backgroundColor: isValidHex(color) ? color : '#333333'
                }}
              >
                <span className="preview-color-label">
                  {isValidHex(color) ? normalizeHex(color) : '???'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>保存配色方案</h2>
              <button className="modal-close" onClick={closeModal} disabled={saving}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {errors.length > 0 && (
                <div className="error-box">
                  {errors.map((err, i) => (
                    <p key={i} className="error-text">{err}</p>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">方案名称（2-30字符）</label>
                <input
                  type="text"
                  className="form-input"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  placeholder="例如：日落黄昏"
                  maxLength={30}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">作者昵称</label>
                <input
                  type="text"
                  className="form-input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="请输入昵称"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">配色预览</label>
                <div className="modal-preview">
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      className="modal-preview-swatch"
                      style={{ backgroundColor: isValidHex(c) ? c : '#333' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={saving}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '保存中...' : '确认保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-toast">
          <span className="success-icon">✓</span>
          保存成功！即将跳转到详情页...
        </div>
      )}
    </div>
  );
}

export default ColorEditor;
