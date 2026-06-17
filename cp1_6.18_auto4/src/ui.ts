export type MoleculeChangeCallback = (id: string) => void;
export type LabelToggleCallback = (visible: boolean) => void;

export class UIController {
  private moleculeSelect: HTMLSelectElement;
  private labelToggle: HTMLInputElement;
  private popup: HTMLElement;
  private popupSymbol: HTMLElement;
  private popupIndex: HTMLElement;
  private popupCoords: HTMLElement;
  private popupArrow: HTMLElement;
  private onMoleculeChange: MoleculeChangeCallback | null = null;
  private onLabelToggle: LabelToggleCallback | null = null;
  private fadeTimeout: number | null = null;

  constructor() {
    this.moleculeSelect = document.getElementById('molecule-select') as HTMLSelectElement;
    this.labelToggle = document.getElementById('label-toggle') as HTMLInputElement;
    this.popup = document.getElementById('atom-info-popup')!;
    this.popupSymbol = document.getElementById('popup-symbol')!;
    this.popupIndex = document.getElementById('popup-index')!;
    this.popupCoords = document.getElementById('popup-coords')!;
    this.popupArrow = document.getElementById('popup-arrow')!;

    this.moleculeSelect.addEventListener('change', () => {
      this.onMoleculeChange?.(this.moleculeSelect.value);
    });

    this.labelToggle.addEventListener('change', () => {
      this.onLabelToggle?.(this.labelToggle.checked);
    });
  }

  setMoleculeChangeCallback(cb: MoleculeChangeCallback): void {
    this.onMoleculeChange = cb;
  }

  setLabelToggleCallback(cb: LabelToggleCallback): void {
    this.onLabelToggle = cb;
  }

  showAtomInfo(element: string, index: number, x: number, y: number, z: number, screenX: number, screenY: number): void {
    this.popupSymbol.textContent = element;
    this.popupIndex.textContent = `序号: #${index}`;
    this.popupCoords.textContent = `坐标: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`;

    const popupWidth = 180;
    const popupHeight = 120;
    const arrowSize = 10;
    const margin = 16;

    const spaceRight = window.innerWidth - screenX;
    const spaceLeft = screenX;
    const spaceTop = screenY;
    const spaceBottom = window.innerHeight - screenY;

    let px: number;
    let arrowPositionClass = '';
    let arrowLeft: number;
    let arrowTop: number;

    if (spaceRight > popupWidth + margin + arrowSize || spaceRight >= spaceLeft) {
      px = Math.min(screenX + margin, window.innerWidth - popupWidth - 4);
      arrowPositionClass = 'arrow-left';
      arrowLeft = -arrowSize;
      arrowTop = Math.min(Math.max(20, spaceBottom - popupHeight / 2), popupHeight - 30);
    } else {
      px = Math.max(screenX - popupWidth - margin, 4);
      arrowPositionClass = 'arrow-right';
      arrowLeft = popupWidth;
      arrowTop = Math.min(Math.max(20, spaceBottom - popupHeight / 2), popupHeight - 30);
    }

    let py: number;
    py = Math.min(Math.max(screenY - popupHeight / 2, 8), window.innerHeight - popupHeight - 8);

    if (arrowPositionClass === 'arrow-left' || arrowPositionClass === 'arrow-right') {
      arrowTop = Math.min(Math.max(screenY - py - 8, 20), popupHeight - 24);
    }

    this.popup.classList.remove('arrow-left', 'arrow-right', 'arrow-top', 'arrow-bottom');
    this.popup.classList.add(arrowPositionClass);

    this.popupArrow.style.left = '';
    this.popupArrow.style.right = '';
    this.popupArrow.style.top = `${arrowTop}px`;

    this.popup.style.left = `${px}px`;
    this.popup.style.top = `${py}px`;

    this.popup.classList.remove('visible');
    if (this.fadeTimeout) {
      window.clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    this.popup.style.opacity = '0';
    this.popup.style.transform = 'scale(0.92)';
    void (this.popup.offsetWidth);
    this.popup.style.opacity = '';
    this.popup.style.transform = '';
    this.popup.classList.add('visible');
  }

  hideAtomInfo(): void {
    if (this.fadeTimeout) {
      window.clearTimeout(this.fadeTimeout);
    }
    this.popup.classList.remove('visible');
  }

  getCurrentMoleculeId(): string {
    return this.moleculeSelect.value;
  }

  isLabelVisible(): boolean {
    return this.labelToggle.checked;
  }
}
