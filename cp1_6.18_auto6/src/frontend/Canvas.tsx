import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { CanvasElement, PenElement, RectangleElement, CircleElement, StickyElement, User, Point } from '../backend/roomManager';
import { ToolType } from './websocketClient';

interface CanvasProps {
  elements: CanvasElement[];
  currentTool: ToolType;
  currentColor: string;
  currentLineWidth: number;
  userId: string;
  onDrawElement: (element: CanvasElement) => void;
  onCursorUpdate: (x: number, y: number) => void;
  users: User[];
  roomId: string;
}

export interface CanvasRef {
  exportPNG: () => string;
}

interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({
  elements,
  currentTool,
  currentColor,
  currentLineWidth,
  userId,
  onDrawElement,
  onCursorUpdate,
  users,
  roomId,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);
  const [compositeBitmap, setCompositeBitmap] = useState<HTMLCanvasElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });

  const animFrameRef = useRef<number>();
  const pendingTransformRef = useRef<Transform | null>(null);

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      const canvas = canvasRef.current;
      if (!canvas) return '';

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return '';

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      ctx.save();
      ctx.translate(transform.offsetX, transform.offsetY);
      ctx.scale(transform.scale, transform.scale);

      elements.forEach((el) => drawElement(ctx, el, false));
      ctx.restore();

      return exportCanvas.toDataURL('image/png');
    },
  }));

  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - transform.offsetX) / transform.scale;
    const y = (clientY - rect.top - transform.offsetY) / transform.scale;
    return { x, y };
  }, [transform]);

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    setCursorPosition(point);
    onCursorUpdate(point.x, point.y);

    if (currentTool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.offsetX, y: e.clientY - transform.offsetY });
      setSelectedStickyId(null);
      return;
    }

    if (currentTool === 'eraser') {
      const targetEl = findElementAtPoint(point);
      if (targetEl) {
        onDrawElement({
          id: generateId(),
          type: 'eraser',
          userId,
          color: currentColor,
          createdAt: Date.now(),
          targetId: targetEl.id,
        });
        if (selectedStickyId === targetEl.id) {
          setSelectedStickyId(null);
        }
      }
      return;
    }

    if (currentTool === 'sticky') {
      const clickedSticky = findStickyAtPoint(point);
      if (clickedSticky) {
        if (selectedStickyId === clickedSticky.id) {
          setEditingStickyId(clickedSticky.id);
          setEditingText(clickedSticky.text);
          setSelectedStickyId(null);
        } else {
          setSelectedStickyId(clickedSticky.id);
        }
        return;
      }
      const newSticky: StickyElement = {
        id: generateId(),
        type: 'sticky',
        userId,
        color: currentColor,
        createdAt: Date.now(),
        position: point,
        text: '点击编辑',
      };
      onDrawElement(newSticky);
      setSelectedStickyId(newSticky.id);
      return;
    }

    if (currentTool === 'pen' || currentTool === 'rectangle' || currentTool === 'circle') {
      setSelectedStickyId(null);
    }

    setIsDrawing(true);

    if (currentTool === 'pen') {
      const newElement: PenElement = {
        id: generateId(),
        type: 'pen',
        userId,
        color: currentColor,
        createdAt: Date.now(),
        points: [point],
        lineWidth: currentLineWidth,
      };
      setCurrentElement(newElement);
    } else if (currentTool === 'rectangle') {
      const newElement: RectangleElement = {
        id: generateId(),
        type: 'rectangle',
        userId,
        color: currentColor,
        createdAt: Date.now(),
        startPoint: point,
        endPoint: point,
        lineWidth: currentLineWidth,
      };
      setCurrentElement(newElement);
    } else if (currentTool === 'circle') {
      const newElement: CircleElement = {
        id: generateId(),
        type: 'circle',
        userId,
        color: currentColor,
        createdAt: Date.now(),
        center: point,
        radius: 0,
        lineWidth: currentLineWidth,
      };
      setCurrentElement(newElement);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    setCursorPosition(point);
    onCursorUpdate(point.x, point.y);

    if (isPanning && panStart) {
      const newTransform = {
        ...transform,
        offsetX: e.clientX - panStart.x,
        offsetY: e.clientY - panStart.y,
      };
      pendingTransformRef.current = newTransform;
      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(() => {
          if (pendingTransformRef.current) {
            setTransform(pendingTransformRef.current);
            pendingTransformRef.current = null;
          }
          animFrameRef.current = undefined;
        });
      }
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (currentElement.type === 'pen') {
      setCurrentElement({
        ...currentElement,
        points: [...currentElement.points, point],
      });
    } else if (currentElement.type === 'rectangle') {
      setCurrentElement({
        ...currentElement,
        endPoint: point,
      });
    } else if (currentElement.type === 'circle') {
      const dx = point.x - currentElement.center.x;
      const dy = point.y - currentElement.center.y;
      setCurrentElement({
        ...currentElement,
        radius: Math.sqrt(dx * dx + dy * dy),
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (isDrawing && currentElement) {
      onDrawElement(currentElement);
      setIsDrawing(false);
      setCurrentElement(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedStickyId && !editingStickyId) {
        const sticky = elements.find((el) => el.id === selectedStickyId) as StickyElement | undefined;
        if (sticky) {
          setEditingStickyId(sticky.id);
          setEditingText(sticky.text);
          setSelectedStickyId(null);
        }
      }
      if (e.key === 'Escape') {
        if (editingStickyId) {
          const textarea = document.activeElement as HTMLTextAreaElement | null;
          if (textarea) {
            textarea.blur();
          }
        } else {
          setSelectedStickyId(null);
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStickyId && !editingStickyId) {
          e.preventDefault();
          onDrawElement({
            id: generateId(),
            type: 'eraser',
            userId,
            color: currentColor,
            createdAt: Date.now(),
            targetId: selectedStickyId,
          });
          setSelectedStickyId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStickyId, editingStickyId, elements, userId, currentColor]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(transform.scale + delta, 0.1), 5);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleRatio = newScale / transform.scale;
    const newOffsetX = mouseX - (mouseX - transform.offsetX) * scaleRatio;
    const newOffsetY = mouseY - (mouseY - transform.offsetY) * scaleRatio;

    const newTransform = { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
    pendingTransformRef.current = newTransform;

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(() => {
        if (pendingTransformRef.current) {
          setTransform(pendingTransformRef.current);
          pendingTransformRef.current = null;
        }
        animFrameRef.current = undefined;
      });
    }
  };

  const findElementAtPoint = (point: Point): CanvasElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (isPointInElement(point, el)) {
        return el;
      }
    }
    return null;
  };

  const findStickyAtPoint = (point: Point): StickyElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'sticky' && isPointInElement(point, el)) {
        return el;
      }
    }
    return null;
  };

  const isPointInElement = (point: Point, element: CanvasElement): boolean => {
    if (element.type === 'pen') {
      for (const p of element.points) {
        const dx = point.x - p.x;
        const dy = point.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < Math.max(element.lineWidth, 10)) {
          return true;
        }
      }
      return false;
    } else if (element.type === 'rectangle') {
      const minX = Math.min(element.startPoint.x, element.endPoint.x);
      const maxX = Math.max(element.startPoint.x, element.endPoint.x);
      const minY = Math.min(element.startPoint.y, element.endPoint.y);
      const maxY = Math.max(element.startPoint.y, element.endPoint.y);
      return point.x >= minX - 5 && point.x <= maxX + 5 && point.y >= minY - 5 && point.y <= maxY + 5;
    } else if (element.type === 'circle') {
      const dx = point.x - element.center.x;
      const dy = point.y - element.center.y;
      return Math.sqrt(dx * dx + dy * dy) <= element.radius + 5;
    } else if (element.type === 'sticky') {
      return (
        point.x >= element.position.x - 10 &&
        point.x <= element.position.x + 190 &&
        point.y >= element.position.y - 10 &&
        point.y <= element.position.y + 140
      );
    }
    return false;
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement, isSelected: boolean = false) => {
    ctx.save();
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;

    if (element.type === 'pen') {
      ctx.lineWidth = element.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (element.points.length > 0) {
        ctx.moveTo(element.points[0].x, element.points[0].y);
        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i].x, element.points[i].y);
        }
      }
      ctx.stroke();
    } else if (element.type === 'rectangle') {
      ctx.lineWidth = element.lineWidth;
      const x = Math.min(element.startPoint.x, element.endPoint.x);
      const y = Math.min(element.startPoint.y, element.endPoint.y);
      const w = Math.abs(element.endPoint.x - element.startPoint.x);
      const h = Math.abs(element.endPoint.y - element.startPoint.y);
      ctx.strokeRect(x, y, w, h);
    } else if (element.type === 'circle') {
      ctx.lineWidth = element.lineWidth;
      ctx.beginPath();
      ctx.arc(element.center.x, element.center.y, element.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (element.type === 'sticky') {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.95)';
      ctx.fillRect(element.position.x, element.position.y, 180, 130);

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(element.position.x - 4, element.position.y - 4, 188, 138);
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = element.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(element.position.x, element.position.y, 180, 130);
      ctx.fillStyle = '#333333';
      ctx.font = '14px sans-serif';
      ctx.textBaseline = 'top';
      wrapText(ctx, element.text, element.position.x + 10, element.position.y + 10, 160, 18);
    }

    ctx.restore();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
        if (currentY - y > 100) {
          ctx.fillText(line + '...', x, currentY);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  useEffect(() => {
    if (elements.length > 500 && elements.length % 100 === 0) {
      const composite = document.createElement('canvas');
      const canvas = canvasRef.current;
      if (!canvas) return;
      composite.width = canvas.width;
      composite.height = canvas.height;
      const ctx = composite.getContext('2d');
      if (!ctx) return;

      const oldestElements = elements.slice(0, 200);
      oldestElements.forEach((el) => drawElement(ctx, el, false));
      setCompositeBitmap(composite);
    }
  }, [elements.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        render();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    render();
  }, [elements, currentElement, transform, users, compositeBitmap, selectedStickyId]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);

    drawGrid(ctx);

    if (compositeBitmap) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(compositeBitmap, 0, 0);
      ctx.restore();
    }

    const elementsToRender = compositeBitmap ? elements.slice(200) : elements;
    elementsToRender.forEach((el) => {
      if (el.id !== editingStickyId) {
        drawElement(ctx, el, el.id === selectedStickyId);
      }
    });

    if (currentElement) {
      drawElement(ctx, currentElement, false);
    }

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 40;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = -transform.offsetX / transform.scale;
    const startY = -transform.offsetY / transform.scale;
    const endX = startX + canvas.width / transform.scale;
    const endY = startY + canvas.height / transform.scale;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  };

  const handleStickyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingText(e.target.value);
  };

  const handleStickyBlur = () => {
    if (editingStickyId) {
      const sticky = elements.find((el) => el.id === editingStickyId) as StickyElement | undefined;
      if (sticky) {
        onDrawElement({
          ...sticky,
          id: generateId(),
          text: editingText || '空白便签',
        });
        onDrawElement({
          id: generateId(),
          type: 'eraser',
          userId,
          color: currentColor,
          createdAt: Date.now(),
          targetId: editingStickyId,
        });
      }
      setEditingStickyId(null);
      setEditingText('');
    }
  };

  const renderEditingSticky = () => {
    if (!editingStickyId) return null;
    const sticky = elements.find((el) => el.id === editingStickyId) as StickyElement | undefined;
    if (!sticky) return null;

    const screenX = sticky.position.x * transform.scale + transform.offsetX;
    const screenY = sticky.position.y * transform.scale + transform.offsetY;

    return (
      <textarea
        autoFocus
        value={editingText}
        onChange={handleStickyTextChange}
        onBlur={handleStickyBlur}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.currentTarget.blur();
          }
        }}
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          width: 180 * transform.scale,
          height: 130 * transform.scale,
          backgroundColor: 'rgba(255, 235, 59, 0.95)',
          border: `3px solid #ffffff`,
          borderRadius: 0,
          padding: 10 * transform.scale,
          fontSize: 14 * transform.scale,
          fontFamily: 'sans-serif',
          color: '#333333',
          resize: 'none',
          outline: 'none',
          zIndex: 100,
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      />
    );
  };

  const renderSelectedHint = () => {
    if (!selectedStickyId || editingStickyId) return null;
    const sticky = elements.find((el) => el.id === selectedStickyId) as StickyElement | undefined;
    if (!sticky) return null;

    const screenX = sticky.position.x * transform.scale + transform.offsetX;
    const screenY = (sticky.position.y - 28) * transform.scale + transform.offsetY;

    return (
      <div
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          backgroundColor: 'rgba(233, 69, 96, 0.9)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          zIndex: 60,
          pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}
      >
        按 Enter 或再次点击编辑 · Delete 删除
      </div>
    );
  };

  const renderCursors = () => {
    return users
      .filter((u) => u.id !== userId)
      .map((user) => {
        const screenX = user.cursorX * transform.scale + transform.offsetX;
        const screenY = user.cursorY * transform.scale + transform.offsetY;

        return (
          <div
            key={user.id}
            style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              pointerEvents: 'none',
              zIndex: 50,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={user.color}>
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
            <div
              style={{
                position: 'absolute',
                left: 18,
                top: -5,
                backgroundColor: user.color,
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              {user.name}
            </div>
          </div>
        );
      });
  };

  const getCursorStyle = (): React.CSSProperties => {
    if (currentTool === 'pan' || isPanning) {
      return { cursor: isPanning ? 'grabbing' : 'grab' };
    }
    if (currentTool === 'eraser') {
      return { cursor: 'crosshair' };
    }
    if (currentTool === 'sticky') {
      return { cursor: 'pointer' };
    }
    return { cursor: 'crosshair' };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...getCursorStyle(),
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      {renderCursors()}
      {renderSelectedHint()}
      {renderEditingSticky()}
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
