export type ToolType = 'pen' | 'eraser' | 'text' | 'sticky';

export interface Point {
  x: number;
  y: number;
}

export interface PathData {
  id: string;
  type: 'path';
  points: Point[];
  color: string;
  width: number;
  userId: string;
  timestamp: number;
}

export interface TextData {
  id: string;
  type: 'text';
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  userId: string;
  timestamp: number;
}

export interface StickyData {
  id: string;
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  bgColor: string;
  userId: string;
  timestamp: number;
}

export type DrawElement = PathData | TextData | StickyData;

export interface CameraState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface CanvasCallbacks {
  onDrawRecord: (element: DrawElement) => void;
  onClear: () => void;
  onViewChange?: (camera: CameraState) => void;
}

const STICKY_COLORS = [
  '#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5',
  '#ede9fe', '#fee2e2', '#ffedd5', '#e0f2fe'
];

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;

  private elements: Map<string, DrawElement> = new Map();
  private camera: CameraState = { offsetX: 0, offsetY: 0, scale: 1 };

  private isDrawing = false;
  private currentPath: Point[] = [];
  private currentTool: ToolType = 'pen';
  private currentColor = '#6366f1';
  private currentWidth = 4;
  private userId: string;

  private panning = false;
  private lastPanPoint: Point = { x: 0, y: 0 };

  private callbacks: CanvasCallbacks;
  private animationFrameId: number | null = null;
  private needsRender = true;

  private dpr = 1;
  private textInput: HTMLTextAreaElement | null = null;
  private noisePattern: CanvasPattern | null = null;
  private noiseCanvas: HTMLCanvasElement | null = null;
  private gridVisible = true;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement, userId: string, callbacks: CanvasCallbacks) {
    this.canvas = canvas;
    this.container = container;
    this.userId = userId;
    this.callbacks = callbacks;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
    this.ctx = ctx;

    this.dpr = window.devicePixelRatio || 1;
    this.generateNoiseTexture();
    this.resize();
    this.bindEvents();
    this.startRenderLoop();
  }

  private generateNoiseTexture(): void {
    const size = 128;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = size;
    noiseCanvas.height = size;
    const nctx = noiseCanvas.getContext('2d');
    if (!nctx) return;

    const imageData = nctx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10;
      data[i] = Math.max(0, Math.min(255, 22 + noise));
      data[i + 1] = Math.max(0, Math.min(255, 22 + noise));
      data[i + 2] = Math.max(0, Math.min(255, 29 + noise));
      data[i + 3] = 255;
    }
    nctx.putImageData(imageData, 0, 0);

    this.noiseCanvas = noiseCanvas;
    this.noisePattern = this.ctx.createPattern(noiseCanvas, 'repeat');
  }

  private resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.noiseCanvas) {
      this.noisePattern = this.ctx.createPattern(this.noiseCanvas, 'repeat');
    }
    this.needsRender = true;
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousedown', this.onPointerDown);
    this.canvas.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('mouseup', this.onPointerUp);
    window.addEventListener('mousemove', this.onWindowPointerMove);

    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });

    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  private getWorldPos(clientX: number, clientY: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return {
      x: (screenX - this.camera.offsetX) / this.camera.scale,
      y: (screenY - this.camera.offsetY) / this.camera.scale
    };
  }

  private onPointerDown = (e: MouseEvent): void => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      this.startPan(e.clientX, e.clientY);
      return;
    }
    this.handlePointerDown(e.clientX, e.clientY);
  };

  private onPointerMove = (e: MouseEvent): void => {
    if (this.panning) return;
    this.handlePointerMove(e.clientX, e.clientY);
  };

  private onWindowPointerMove = (e: MouseEvent): void => {
    if (this.panning) {
      this.handlePanMove(e.clientX, e.clientY);
    }
  };

  private onPointerUp = (): void => {
    if (this.panning) {
      this.panning = false;
      return;
    }
    this.handlePointerUp();
  };

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 2) {
      return;
    }
    const touch = e.touches[0];
    if (e.touches.length === 1 && e.touches[0].clientX) {
      if (e.touches.length > 2) return;
    }
    this.handlePointerDown(touch.clientX, touch.clientY);
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    this.handlePointerMove(touch.clientX, touch.clientY);
  };

  private onTouchEnd = (): void => {
    this.handlePointerUp();
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? 1.1 : 1 / 1.1;
    const newScale = Math.max(0.1, Math.min(5, this.camera.scale * zoomFactor));
    const scaleChange = newScale / this.camera.scale;

    this.camera.offsetX = mouseX - (mouseX - this.camera.offsetX) * scaleChange;
    this.camera.offsetY = mouseY - (mouseY - this.camera.offsetY) * scaleChange;
    this.camera.scale = newScale;

    if (this.callbacks.onViewChange) {
      this.callbacks.onViewChange({ ...this.camera });
    }
    this.needsRender = true;
  };

  private startPan(x: number, y: number): void {
    this.panning = true;
    this.lastPanPoint = { x, y };
    this.canvas.style.cursor = 'grabbing';
  }

  private handlePanMove(x: number, y: number): void {
    const dx = x - this.lastPanPoint.x;
    const dy = y - this.lastPanPoint.y;
    this.camera.offsetX += dx;
    this.camera.offsetY += dy;
    this.lastPanPoint = { x, y };

    if (this.callbacks.onViewChange) {
      this.callbacks.onViewChange({ ...this.camera });
    }
    this.needsRender = true;
  }

  private handlePointerDown(clientX: number, clientY: number): void {
    const pos = this.getWorldPos(clientX, clientY);

    if (this.currentTool === 'pen') {
      this.isDrawing = true;
      this.currentPath = [pos];
    } else if (this.currentTool === 'eraser') {
      this.isDrawing = true;
      this.eraseAt(pos);
    } else if (this.currentTool === 'text') {
      this.createTextInput(pos);
    } else if (this.currentTool === 'sticky') {
      this.createSticky(pos);
    }
  }

  private handlePointerMove(clientX: number, clientY: number): void {
    const pos = this.getWorldPos(clientX, clientY);

    if (this.isDrawing) {
      if (this.currentTool === 'pen') {
        this.currentPath.push(pos);
        this.needsRender = true;
      } else if (this.currentTool === 'eraser') {
        this.eraseAt(pos);
      }
    }
  }

  private handlePointerUp(): void {
    if (!this.isDrawing) return;

    if (this.currentTool === 'pen' && this.currentPath.length > 1) {
      const smoothed = this.bezierInterpolate(this.currentPath);
      const pathData: PathData = {
        id: this.generateId(),
        type: 'path',
        points: smoothed,
        color: this.currentColor,
        width: this.currentWidth,
        userId: this.userId,
        timestamp: Date.now()
      };
      this.elements.set(pathData.id, pathData);
      this.callbacks.onDrawRecord(pathData);
    }

    this.isDrawing = false;
    this.currentPath = [];
    this.needsRender = true;
  }

  private bezierInterpolate(points: Point[]): Point[] {
    if (points.length < 3) return points.slice();

    const result: Point[] = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const steps = 4;
      for (let t = 1; t <= steps; t++) {
        const tt = t / steps;
        const tt2 = tt * tt;
        const tt3 = tt2 * tt;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * tt +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * tt +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3
        );

        result.push({ x, y });
      }
    }
    result.push(points[points.length - 1]);
    return result;
  }

  private eraseAt(pos: Point): void {
    const eraseRadius = Math.max(15, this.currentWidth * 3);
    const eraseRadiusSq = eraseRadius * eraseRadius;
    let changed = false;

    for (const [id, el] of this.elements) {
      if (el.type === 'path') {
        for (const p of el.points) {
          const dx = p.x - pos.x;
          const dy = p.y - pos.y;
          if (dx * dx + dy * dy < eraseRadiusSq) {
            this.elements.delete(id);
            changed = true;
            break;
          }
        }
      } else if (el.type === 'text' || el.type === 'sticky') {
        const dx = el.x - pos.x;
        const dy = el.y - pos.y;
        if (dx * dx + dy * dy < eraseRadiusSq + 1000) {
          this.elements.delete(id);
          changed = true;
        }
      }
    }

    if (changed) {
      this.needsRender = true;
      this.callbacks.onClear();
    }
  }

  private createTextInput(pos: Point): void {
    if (this.textInput) {
      this.textInput.remove();
      this.textInput = null;
    }

    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = (pos.x * this.camera.scale + this.camera.offsetX + this.canvas.getBoundingClientRect().left) + 'px';
    textarea.style.top = (pos.y * this.camera.scale + this.camera.offsetY + this.canvas.getBoundingClientRect().top) + 'px';
    textarea.style.background = 'transparent';
    textarea.style.color = this.currentColor;
    textarea.style.border = `1px dashed ${this.currentColor}`;
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '4px 8px';
    textarea.style.fontSize = (16 * this.camera.scale) + 'px';
    textarea.style.fontFamily = 'inherit';
    textarea.style.outline = 'none';
    textarea.style.minWidth = '120px';
    textarea.style.minHeight = '30px';
    textarea.style.zIndex = '150';
    textarea.style.resize = 'both';
    textarea.placeholder = '输入文字...';
    document.body.appendChild(textarea);
    textarea.focus();

    this.textInput = textarea;

    const finish = () => {
      const content = textarea.value.trim();
      if (content) {
        const textData: TextData = {
          id: this.generateId(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          content,
          color: this.currentColor,
          fontSize: 16,
          userId: this.userId,
          timestamp: Date.now()
        };
        this.elements.set(textData.id, textData);
        this.callbacks.onDrawRecord(textData);
        this.needsRender = true;
      }
      textarea.remove();
      if (this.textInput === textarea) this.textInput = null;
    };

    textarea.addEventListener('blur', finish);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finish();
      } else if (e.key === 'Escape') {
        textarea.value = '';
        finish();
      }
    });
  }

  private createSticky(pos: Point): void {
    const color = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
    const sticky: StickyData = {
      id: this.generateId(),
      type: 'sticky',
      x: pos.x,
      y: pos.y,
      width: 180,
      height: 180,
      content: '',
      bgColor: color,
      userId: this.userId,
      timestamp: Date.now()
    };

    this.elements.set(sticky.id, sticky);
    this.callbacks.onDrawRecord(sticky);
    this.needsRender = true;

    this.editStickyContent(sticky);
  }

  private editStickyContent(sticky: StickyData): void {
    if (this.textInput) {
      this.textInput.remove();
      this.textInput = null;
    }

    const rect = this.canvas.getBoundingClientRect();
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = (sticky.x * this.camera.scale + this.camera.offsetX + rect.left + 10 * this.camera.scale) + 'px';
    textarea.style.top = (sticky.y * this.camera.scale + this.camera.offsetY + rect.top + 10 * this.camera.scale) + 'px';
    textarea.style.width = ((sticky.width - 20) * this.camera.scale) + 'px';
    textarea.style.height = ((sticky.height - 20) * this.camera.scale) + 'px';
    textarea.style.background = sticky.bgColor;
    textarea.style.color = '#1f2937';
    textarea.style.border = 'none';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '8px';
    textarea.style.fontSize = (14 * this.camera.scale) + 'px';
    textarea.style.fontFamily = 'inherit';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '150';
    textarea.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    textarea.placeholder = '写点什么...';
    document.body.appendChild(textarea);
    textarea.focus();

    this.textInput = textarea;

    const finish = () => {
      const content = textarea.value;
      if (this.elements.has(sticky.id)) {
        const updated = { ...sticky, content };
        this.elements.set(sticky.id, updated);
        this.callbacks.onDrawRecord(updated);
        this.needsRender = true;
      }
      textarea.remove();
      if (this.textInput === textarea) this.textInput = null;
    };

    textarea.addEventListener('blur', finish);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        finish();
      }
    });
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.needsRender) {
        this.render();
        this.needsRender = false;
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private render(): void {
    const { ctx } = this;
    const rect = this.container.getBoundingClientRect();

    if (this.noisePattern) {
      ctx.fillStyle = this.noisePattern;
    } else {
      ctx.fillStyle = '#16161d';
    }
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#0a0a0e';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.restore();

    ctx.save();
    ctx.translate(this.camera.offsetX, this.camera.offsetY);
    ctx.scale(this.camera.scale, this.camera.scale);

    this.renderGrid(ctx);

    const sortedElements = Array.from(this.elements.values()).sort((a, b) => a.timestamp - b.timestamp);
    for (const el of sortedElements) {
      this.renderElement(ctx, el);
    }

    if (this.isDrawing && this.currentTool === 'pen' && this.currentPath.length > 1) {
      this.renderPath(ctx, this.currentPath, this.currentColor, this.currentWidth);
    }

    ctx.restore();
  }

  private renderGrid(ctx: CanvasRenderingContext2D): void {
    if (!this.gridVisible) return;

    const spacing = 50;
    const scale = this.camera.scale;
    if (scale < 0.3) return;

    const rect = this.container.getBoundingClientRect();
    const startX = -this.camera.offsetX / scale;
    const startY = -this.camera.offsetY / scale;
    const endX = startX + rect.width / scale;
    const endY = startY + rect.height / scale;

    const alignedStartX = Math.floor(startX / spacing) * spacing;
    const alignedStartY = Math.floor(startY / spacing) * spacing;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let x = alignedStartX; x <= endX; x += spacing) {
      for (let y = alignedStartY; y <= endY; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderElement(ctx: CanvasRenderingContext2D, el: DrawElement): void {
    if (el.type === 'path') {
      this.renderPath(ctx, el.points, el.color, el.width);
    } else if (el.type === 'text') {
      this.renderText(ctx, el);
    } else if (el.type === 'sticky') {
      this.renderSticky(ctx, el);
    }
  }

  private renderPath(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number): void {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  private renderText(ctx: CanvasRenderingContext2D, text: TextData): void {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textBaseline = 'top';

    const lines = text.content.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, text.x, text.y + i * text.fontSize * 1.3);
    });
  }

  private renderSticky(ctx: CanvasRenderingContext2D, sticky: StickyData): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = sticky.bgColor;
    ctx.beginPath();
    ctx.roundRect(sticky.x, sticky.y, sticky.width, sticky.height, 6);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    const gradient = ctx.createLinearGradient(sticky.x, sticky.y, sticky.x, sticky.y + 30);
    gradient.addColorStop(0, 'rgba(0,0,0,0.08)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(sticky.x, sticky.y, sticky.width, 30);

    ctx.fillStyle = '#1f2937';
    ctx.font = `14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textBaseline = 'top';

    if (sticky.content) {
      const lines = sticky.content.split('\n');
      const padding = 12;
      lines.forEach((line, i) => {
        const y = sticky.y + padding + i * 20;
        if (y < sticky.y + sticky.height - padding) {
          ctx.fillText(line, sticky.x + padding, y);
        }
      });
    } else {
      ctx.fillStyle = 'rgba(31, 41, 55, 0.4)';
      ctx.fillText('双击编辑...', sticky.x + 12, sticky.y + 12);
    }

    ctx.restore();
  }

  addRemoteElement(element: DrawElement): void {
    this.elements.set(element.id, element);
    this.needsRender = true;
  }

  removeElement(id: string): void {
    if (this.elements.delete(id)) {
      this.needsRender = true;
    }
  }

  clearAll(): void {
    this.elements.clear();
    this.needsRender = true;
  }

  getElements(): DrawElement[] {
    return Array.from(this.elements.values());
  }

  setTool(tool: ToolType): void {
    this.currentTool = tool;
    if (tool === 'eraser') {
      this.canvas.style.cursor = 'cell';
    } else if (tool === 'text') {
      this.canvas.style.cursor = 'text';
    } else if (tool === 'sticky') {
      this.canvas.style.cursor = 'copy';
    } else {
      this.canvas.style.cursor = 'crosshair';
    }
  }

  setColor(color: string): void {
    this.currentColor = color;
  }

  setBrushWidth(width: number): void {
    this.currentWidth = width;
  }

  setGridVisible(visible: boolean): void {
    this.gridVisible = visible;
    this.needsRender = true;
  }

  isGridVisible(): boolean {
    return this.gridVisible;
  }

  getCamera(): CameraState {
    return { ...this.camera };
  }

  setCamera(camera: CameraState): void {
    this.camera = { ...camera };
    this.needsRender = true;
  }

  private generateId(): string {
    return `${this.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.textInput) {
      this.textInput.remove();
    }
  }
}
