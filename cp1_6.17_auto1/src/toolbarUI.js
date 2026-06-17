export class ToolbarUI {
    toolbar;
    colorPicker;
    colorPresets;
    brushSize;
    brushPreviewDot;
    penBtn;
    eraserBtn;
    textBtn;
    stickyBtn;
    clearBtn;
    gridBtn;
    toggleBtn;
    currentColor = '#6366f1';
    currentBrushSize = 4;
    currentTool = 'pen';
    isCollapsed = false;
    callbacks;
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.toolbar = document.getElementById('toolbar');
        this.colorPicker = document.getElementById('color-picker');
        this.colorPresets = document.getElementById('color-presets');
        this.brushSize = document.getElementById('brush-size');
        this.brushPreviewDot = document.getElementById('brush-preview-dot');
        this.penBtn = document.getElementById('pen-btn');
        this.eraserBtn = document.getElementById('eraser-btn');
        this.textBtn = document.getElementById('text-btn');
        this.stickyBtn = document.getElementById('sticky-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.gridBtn = document.getElementById('grid-btn');
        this.toggleBtn = document.getElementById('toggle-btn');
        this.updateBrushPreview();
        this.bindEvents();
    }
    bindEvents() {
        this.colorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            this.setColor(color, true);
            this.flashFeedback(this.colorPicker);
        });
        this.colorPresets.querySelectorAll('.color-preset').forEach((el) => {
            const preset = el;
            preset.addEventListener('click', () => {
                const color = preset.dataset.color || '#6366f1';
                this.setColor(color, true);
                this.flashFeedback(preset);
            });
        });
        this.brushSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value, 10);
            this.setBrushSize(size, true);
        });
        this.penBtn.addEventListener('click', () => {
            this.setTool('pen');
            this.vibrateBtn(this.penBtn);
        });
        this.eraserBtn.addEventListener('click', () => {
            this.setTool('eraser');
            this.vibrateBtn(this.eraserBtn);
        });
        this.textBtn.addEventListener('click', () => {
            this.setTool('text');
            this.vibrateBtn(this.textBtn);
        });
        this.stickyBtn.addEventListener('click', () => {
            this.setTool('sticky');
            this.vibrateBtn(this.stickyBtn);
        });
        this.clearBtn.addEventListener('click', () => {
            if (confirm('确定要清除画布上的所有内容吗？')) {
                this.callbacks.onClearAll();
                this.vibrateBtn(this.clearBtn);
            }
        });
        this.gridBtn.addEventListener('click', () => {
            const willShow = !this.gridBtn.classList.contains('active');
            this.gridBtn.classList.toggle('active', willShow);
            this.callbacks.onToggleGrid(willShow);
            this.vibrateBtn(this.gridBtn);
        });
        this.toggleBtn.addEventListener('click', () => {
            this.toggleCollapse();
            this.vibrateBtn(this.toggleBtn);
        });
        document.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
                return;
            switch (e.key.toLowerCase()) {
                case 'p':
                    this.setTool('pen');
                    break;
                case 'e':
                    this.setTool('eraser');
                    break;
                case 't':
                    this.setTool('text');
                    break;
                case 's':
                    this.setTool('sticky');
                    break;
                case 'g':
                    this.gridBtn.click();
                    break;
                case '[':
                    this.setBrushSize(Math.max(1, this.currentBrushSize - 2), true);
                    this.brushSize.value = String(this.currentBrushSize);
                    break;
                case ']':
                    this.setBrushSize(Math.min(50, this.currentBrushSize + 2), true);
                    this.brushSize.value = String(this.currentBrushSize);
                    break;
            }
        });
    }
    setColor(color, emit = false) {
        this.currentColor = color;
        this.colorPicker.value = color;
        this.colorPresets.querySelectorAll('.color-preset').forEach((el) => {
            const preset = el;
            if (preset.dataset.color === color) {
                preset.classList.add('active');
            }
            else {
                preset.classList.remove('active');
            }
        });
        this.brushPreviewDot.style.background = color;
        if (emit) {
            this.callbacks.onColorChange(color);
        }
    }
    setBrushSize(size, emit = false) {
        this.currentBrushSize = size;
        this.brushSize.value = String(size);
        this.updateBrushPreview();
        if (emit) {
            this.callbacks.onBrushSizeChange(size);
        }
    }
    updateBrushPreview() {
        const size = Math.min(24, Math.max(4, this.currentBrushSize));
        this.brushPreviewDot.style.width = size + 'px';
        this.brushPreviewDot.style.height = size + 'px';
        this.brushPreviewDot.style.background = this.currentColor;
    }
    setTool(tool) {
        this.currentTool = tool;
        this.penBtn.classList.toggle('active', tool === 'pen');
        this.eraserBtn.classList.toggle('active', tool === 'eraser');
        this.textBtn.classList.toggle('active', tool === 'text');
        this.stickyBtn.classList.toggle('active', tool === 'sticky');
        this.callbacks.onToolChange(tool);
    }
    getTool() {
        return this.currentTool;
    }
    getColor() {
        return this.currentColor;
    }
    getBrushSize() {
        return this.currentBrushSize;
    }
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.toolbar.classList.toggle('collapsed', this.isCollapsed);
        const svg = this.toggleBtn.querySelector('svg polyline');
        if (this.isCollapsed) {
            svg?.setAttribute('points', '18 15 12 9 6 15');
            this.toggleBtn.title = '展开工具栏';
        }
        else {
            svg?.setAttribute('points', '6 9 12 15 18 9');
            this.toggleBtn.title = '收起工具栏';
        }
    }
    flashFeedback(element) {
        element.classList.add('toolbar-feedback');
        setTimeout(() => element.classList.remove('toolbar-feedback'), 250);
    }
    vibrateBtn(btn) {
        btn.classList.add('btn-vibrate');
        setTimeout(() => btn.classList.remove('btn-vibrate'), 150);
    }
    static createPointerFeedback(x, y, color) {
        const flash = document.createElement('div');
        flash.className = 'feedback-flash';
        flash.style.left = x + 'px';
        flash.style.top = y + 'px';
        flash.style.width = '20px';
        flash.style.height = '20px';
        flash.style.background = color;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
    static showNotification(message, type = 'join') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}
