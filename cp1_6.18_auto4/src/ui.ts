export type MoleculeChangeCallback = (id: string) => void;
export type LabelToggleCallback = (visible: boolean) => void;

export class UIController {
  private moleculeSelect: HTMLSelectElement;
  private labelToggle: HTMLInputElement;
  private popup: HTMLElement;
  private popupSymbol: HTMLElement;
  private popupIndex: HTMLElement;
  private popupCoords: HTMLElement;
  private onMoleculeChange: MoleculeChangeCallback | null = null;
  private onLabelToggle: LabelToggleCallback | null = null;

  constructor() {
    this.moleculeSelect = document.getElementById('molecule-select') as HTMLSelectElement;
    this.labelToggle = document.getElementById('label-toggle') as HTMLInputElement;
    this.popup = document.getElementById('atom-info-popup')!;
    this.popupSymbol = document.getElementById('popup-symbol')!;
    this.popupIndex = document.getElementById('popup-index')!;
    this.popupCoords = document.getElementById('popup-coords')!;

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

    const px = Math.min(screenX + 16, window.innerWidth - 180);
    const py = Math.min(screenY - 20, window.innerHeight - 100);
    this.popup.style.left = `${px}px`;
    this.popup.style.top = `${py}px`;
    this.popup.classList.add('visible');
  }

  hideAtomInfo(): void {
    this.popup.classList.remove('visible');
  }

  getCurrentMoleculeId(): string {
    return this.moleculeSelect.value;
  }

  isLabelVisible(): boolean {
    return this.labelToggle.checked;
  }
}
