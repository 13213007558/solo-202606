export class UIManager {
  private infoPanel: HTMLElement | null = null
  private exhibitCard: HTMLElement | null = null
  private joystick: HTMLElement | null = null
  private joystickKnob: HTMLElement | null = null
  private joystickActive = false
  private joystickStart = { x: 0, y: 0 }
  public moveVector = { x: 0, z: 0 }

  constructor() {
    this.createInfoPanel()
    this.createExhibitCard()
    this.createJoystick()
  }

  private createInfoPanel() {
    const panel = document.createElement("div")
    panel.style.cssText = `
      position: fixed; top: 20px; left: 20px;
      padding: 20px; border-radius: 12px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white; font-size: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 100; transition: all 0.3s ease;
    `
    panel.innerHTML = `
      <div style="font-size:18px;font-weight:600;margin-bottom:8px;">星尘艺术空间</div>
      <div style="opacity:0.8;">在线访客: <span id="visitor-count">--</span> 人</div>
      <div style="opacity:0.8;">展品总数: <span id="exhibit-count">--</span> 件</div>
    `
    document.body.appendChild(panel)
    this.infoPanel = panel
  }
