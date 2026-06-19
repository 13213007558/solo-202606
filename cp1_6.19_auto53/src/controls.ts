import { DisplayMode } from './threeScene';

export interface UICallbacks {
  onGenerate: (formula: string) => void;
  onModeChange: (mode: DisplayMode) => void;
  onReset: () => void;
  onScreenshot: () => void;
  onStatsUpdate: (atoms: number, bonds: number) => void;
}

export class UIController {
  private inputEl: HTMLInputElement;
  private generateBtn: HTMLButtonElement;
  private modeBtns: NodeListOf<HTMLButtonElement>;
  private resetBtn: HTMLButtonElement;
  private screenshotBtn: HTMLButtonElement;
  private atomCountEl: HTMLElement;
  private bondCountEl: HTMLElement;
  private errorToast: HTMLElement;
  private callbacks: UICallbacks;
  private errorTimeout: number | null;

  constructor(callbacks: UICallbacks) {
    this.callbacks = callbacks;
    this.errorTimeout = null;
    this.inputEl = document.getElementById('formula-input') as HTMLInputElement;
    this.generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
    this.modeBtns = document.querySelectorAll('[data-mode]') as NodeListOf<HTMLButtonElement>;
    this.resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    this.screenshotBtn = document.getElementById('screenshot-btn') as HTMLButtonElement;
    this.atomCountEl = document.getElementById('atom-count') as HTMLElement;
    this.bondCountEl = document.getElementById('bond-count') as HTMLElement;
    this.errorToast = document.getElementById('error-toast') as HTMLElement;
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => {
        const formula = this.inputEl.value.trim();
        if (formula) this.callbacks.onGenerate(formula);
      });
    }
    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const formula = this.inputEl.value.trim();
          if (formula) this.callbacks.onGenerate(formula);
        }
      });
    }
    this.modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as DisplayMode;
        if (mode) {
          this.setActiveMode(mode);
          this.callbacks.onModeChange(mode);
        }
      });
    });
    if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.callbacks.onReset());
    if (this.screenshotBtn) this.screenshotBtn.addEventListener('click', () => this.callbacks.onScreenshot());
  }

  public showError(message: string): void {
    if (!this.errorToast) return;
    this.errorToast.textContent = message;
    this.errorToast.style.display = 'block';
    this.errorToast.style.opacity = '1';
    this.errorToast.style.transform = 'translateY(0)';
    if (this.errorTimeout !== null) window.clearTimeout(this.errorTimeout);
    this.errorTimeout = window.setTimeout(() => {
      this.errorToast.style.opacity = '0';
      this.errorToast.style.transform = 'translateY(-10px)';
      window.setTimeout(() => { if (this.errorToast) this.errorToast.style.display = 'none'; }, 300);
    }, 3000);
  }

  public updateStats(atoms: number, bonds: number): void {
    if (this.atomCountEl) this.atomCountEl.textContent = String(atoms);
    if (this.bondCountEl) this.bondCountEl.textContent = String(bonds);
    this.callbacks.onStatsUpdate(atoms, bonds);
  }

  public setActiveMode(mode: DisplayMode): void {
    this.modeBtns.forEach((btn) => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }
}
    }

    this.errorTimeout = window.setTimeout(() => {
      this.errorToast.style.opacity = '0';
      this.errorToast.style.transform = 'translateY(-10px)';
      window.setTimeout(() => {
        if (this.errorToast) {
          this.errorToast.style.display = 'none';
        }
      }, 300);
    }, 3000);
  }

  public updateStats(atoms: number, bonds: number): void {
    if (this.atomCountEl) {
      this.atomCountEl.textContent = String(atoms);
    }
    if (this.bondCountEl) {
      this.bondCountEl.textContent = String(bonds);
    }
    this.callbacks.onStatsUpdate(atoms, bonds);
  }

  public setActiveMode(mode: DisplayMode): void {
    this.modeBtns.forEach((btn) => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}
