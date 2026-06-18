export class UIManager {
  private infoPanel: HTMLElement | null = null
  private visitorCountEl: HTMLElement | null = null
  private exhibitCountEl: HTMLElement | null = null
  private exhibitCard: HTMLElement | null = null
  private cardTitleEl: HTMLElement | null = null
  private cardAuthorEl: HTMLElement | null = null
  private cardSizeEl: HTMLElement | null = null
  private cardDescEl: HTMLElement | null = null
  private joystick: HTMLElement | null = null
  private joystickKnob: HTMLElement | null = null
  private joystickActive = false
  private joystickStart = { x: 0, y: 0 }
  public moveVector = { x: 0, z: 0 }
  private breathingEl: HTMLElement | null = null

  constructor() {
    this.loadStyles()
    this.createInfoPanel()
    this.createExhibitCard()
    this.createJoystick()
    this.startBreathing()
  }

  private loadStyles() {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "/styles.css"
    document.head.appendChild(link)
  }

  private createInfoPanel() {
    const panel = document.createElement("div")
    panel.className = "v-info-panel"
    const title = document.createElement("div")
    title.className = "v-info-title"
    title.textContent = "艺术展厅"
    const visitors = document.createElement("div")
    visitors.className = "v-info-text"
    visitors.innerHTML = "在线访客：<span id='v-count'>--</span> 人"
    const exhibits = document.createElement("div")
    exhibits.className = "v-info-text"
    exhibits.innerHTML = "展品总数：<span id='e-count'>--</span> 件"
    panel.appendChild(title)
    panel.appendChild(visitors)
    panel.appendChild(exhibits)
    document.body.appendChild(panel)
    this.infoPanel = panel
    this.visitorCountEl = document.getElementById("v-count")
    this.exhibitCountEl = document.getElementById("e-count")
    this.breathingEl = panel
  }

  private createExhibitCard() {
    const card = document.createElement("div")
    card.className = "v-exhibit-card"
    const closeBtn = document.createElement("button")
    closeBtn.className = "v-close-btn"
    closeBtn.textContent = "×"
    closeBtn.onclick = () => this.hideExhibitCard()
    const title = document.createElement("h3")
    title.className = "v-card-title"
    const author = document.createElement("p")
    author.className = "v-card-author"
    const size = document.createElement("p")
    size.className = "v-card-size"
    const desc = document.createElement("p")
    desc.className = "v-card-desc"
    card.appendChild(closeBtn)
    card.appendChild(title)
    card.appendChild(author)
    card.appendChild(size)
    card.appendChild(desc)
    document.body.appendChild(card)
    this.exhibitCard = card
    this.cardTitleEl = title
    this.cardAuthorEl = author
    this.cardSizeEl = size
    this.cardDescEl = desc
  }

  showExhibitCard(exhibit: any) {
    if (this.cardTitleEl) this.cardTitleEl.textContent = exhibit.title
    if (this.cardAuthorEl) this.cardAuthorEl.textContent = "作者：" + exhibit.author
    if (this.cardSizeEl) this.cardSizeEl.textContent = "尺寸：" + exhibit.size
    if (this.cardDescEl) this.cardDescEl.textContent = exhibit.description
    this.exhibitCard?.classList.add("show")
  }

  hideExhibitCard() {
    this.exhibitCard?.classList.remove("show")
  }

  private createJoystick() {
    const isMobile = /Mobile|Android|iOS/.test(navigator.userAgent)
    if (!isMobile) return
    const joystick = document.createElement("div")
    joystick.className = "v-joystick"
    joystick.style.display = "block"
    const knob = document.createElement("div")
    knob.className = "v-joystick-knob"
    joystick.appendChild(knob)
    document.body.appendChild(joystick)
    this.joystick = joystick
    this.joystickKnob = knob
    joystick.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.joystickActive = true
      const t = e.touches[0]
      const rect = joystick.getBoundingClientRect()
      this.joystickStart = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })
    joystick.addEventListener("touchmove", (e) => {
      e.preventDefault()
      if (!this.joystickActive || !this.joystickKnob) return
      const t = e.touches[0]
      let dx = t.clientX - this.joystickStart.x
      let dy = t.clientY - this.joystickStart.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const max = 35
      if (dist > max) { dx = dx / dist * max; dy = dy / dist * max }
      this.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
      this.moveVector.x = dx / max
      this.moveVector.z = dy / max
    })
    joystick.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.joystickActive = false
      this.moveVector.x = 0
      this.moveVector.z = 0
      if (this.joystickKnob) {
        this.joystickKnob.style.transform = "translate(-50%, -50%)"
      }
    })
  }

  updateVisitorCount(count: number) {
    if (this.visitorCountEl) this.visitorCountEl.textContent = String(count)
  }

  updateExhibitCount(count: number) {
    if (this.exhibitCountEl) this.exhibitCountEl.textContent = String(count)
  }

  private startBreathing() {
    let t = 0
    const animate = () => {
      t += 0.02
      const opacity = 0.5 + Math.sin(t) * 0.3
      if (this.breathingEl) {
        this.breathingEl.style.boxShadow = `0 0 ${20 + Math.sin(t) * 10}px rgba(255, 200, 100, ${opacity})`
      }
      requestAnimationFrame(animate)
    }
    animate()
  }
}
