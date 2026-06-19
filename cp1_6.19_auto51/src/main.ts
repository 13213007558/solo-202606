import Phaser from "phaser";
import { eventBus } from "./core/EventBus";
import { inputManager } from "./input/InputManager";
import { ballPhysics } from "./physics/BallPhysics";
import { gameState } from "./game/GameState";
import { gameRenderer } from "./renderer/GameRenderer";

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const PADDLE_SPEED = 500;

class AudioManager {
  private audioContext: AudioContext | null = null;

  public init(): void {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public playTone(freq: number, dur: number, vol: number = 0.3): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + dur);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + dur);
  }

  public playPaddleHit(): void {
    this.playTone(440, 0.1, 0.2);
  }

  public playWallHit(): void {
    this.playTone(330, 0.08, 0.15);
  }

  public playScore(): void {
    this.playTone(523, 0.15, 0.25);
    setTimeout(() => this.playTone(659, 0.15, 0.25), 100);
  }

  public playWin(): void {
    this.playTone(523, 0.2, 0.3);
    setTimeout(() => this.playTone(659, 0.2, 0.3), 150);
    setTimeout(() => this.playTone(784, 0.3, 0.3), 300);
  }
}

const audioManager = new AudioManager();

class TitleScene extends Phaser.Scene {
  private selectedPlayers: number = 2;

  constructor() {
    super("TitleScene");
  }

  public create(): void {
    audioManager.init();
    const cx = FIELD_WIDTH / 2;
    const cy = FIELD_HEIGHT / 2;

    this.add.text(cx, cy - 150, "PARTY PONG", {
      fontSize: "64px",
      color: "#00ffff",
      fontStyle: "bold",
    }).setOrigin(0.5);
  }

    this.add.text(cx, cy - 50, "Select Players:", {
      fontSize: "24px",
      color: "#ffffff",
    }).setOrigin(0.5);

    const buttons: Phaser.GameObjects.Text[] = [];
    for (let i = 2; i <= 4; i++) {
      const btn = this.add.text(cx + (i - 3) * 120, cy + 20, i + "P", {
        fontSize: "20px",
        color: "#888888",
        backgroundColor: "#222222",
        padding: { x: 15, y: 10 },
      }).setOrigin(0.5).setInteractive();
      buttons.push(btn);

      btn.on("pointerdown", () => {
        this.selectedPlayers = i;
        this.updateButtons(buttons);
      });
    }
    this.updateButtons(buttons);

    const startBtn = this.add.text(cx, cy + 100, "START", {
      fontSize: "28px",
      color: "#00ff00",
      backgroundColor: "#113311",
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5).setInteractive();

    startBtn.on("pointerdown", () => {
      this.scene.start("GameScene", { playerCount: this.selectedPlayers });
    });
  }

  private updateButtons(buttons: Phaser.GameObjects.Text[]): void {
    for (let i = 0; i < buttons.length; i++) {
      const count = i + 2;
      if (count === this.selectedPlayers) {
        buttons[i].setColor("#00ff00");
        buttons[i].setBackgroundColor("#114411");
      } else {
        buttons[i].setColor("#888888");
        buttons[i].setBackgroundColor("#222222");
      }
    }
  }
}

class GameScene extends Phaser.Scene {
  private playerCount: number = 2;
  private paddleY: number[] = [];
  private paddleMoving: boolean[][] = [];
  private isPaused: boolean = false;

  constructor() {
    super("GameScene");
  }

  public init(data: any): void {
    this.playerCount = data.playerCount || 2;
  }

  public create(): void {
    gameState.init(this.playerCount);
    ballPhysics.init(this.playerCount, FIELD_WIDTH, FIELD_HEIGHT);
    gameRenderer.init(this, this.playerCount, FIELD_WIDTH, FIELD_HEIGHT);

    this.paddleY = [];
    this.paddleMoving = [];
    const paddles = ballPhysics.getPaddles();
    for (let i = 0; i < this.playerCount; i++) {
      this.paddleY.push(paddles[i].y);
      this.paddleMoving.push([false, false]);
    }

    inputManager.init(this.playerCount);
    this.setupEventListeners();

    gameState.startGame();
    ballPhysics.start();
  }

  private setupEventListeners(): void {
    eventBus.on("input", (data: any) => {
      this.handleInput(data.playerId, data.action);
    });

    eventBus.on("score", (data: any) => {
      gameState.addScore(data.playerId);
      audioManager.playScore();
    });

    eventBus.on("paddleHit", () => {
      audioManager.playPaddleHit();
    });

    eventBus.on("wallHit", () => {
      audioManager.playWallHit();
    });

    eventBus.on("gameStateChange", (state: any) => {
      if (state.gameStatus === "gameOver" && state.winner !== null) {
        ballPhysics.stop();
        this.isPaused = true;
        audioManager.playWin();
        gameRenderer.showGameOver(state.winner, () => {
          this.resetGame();
        });
      }
    });
    });
  }

  private handleInput(playerId: number, action: string): void {
    if (this.isPaused) return;
    if (playerId < 0 || playerId >= this.playerCount) return;

    if (action === "moveUp") {
      this.paddleMoving[playerId][0] = true;
    } else if (action === "stopUp") {
      this.paddleMoving[playerId][0] = false;
    } else if (action === "moveDown") {
      this.paddleMoving[playerId][1] = true;
    } else if (action === "stopDown") {
      this.paddleMoving[playerId][1] = false;
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isPaused) return;
    if (gameState.getGameStatus() !== "playing") return;

    const dt = delta / 1000;
    const paddles = ballPhysics.getPaddles();

    for (let i = 0; i < this.playerCount; i++) {
      if (this.playerCount === 2 || i < 2) {
        let dy = 0;
        if (this.paddleMoving[i][0]) dy -= PADDLE_SPEED * dt;
        if (this.paddleMoving[i][1]) dy += PADDLE_SPEED * dt;

        this.paddleY[i] += dy;
        this.paddleY[i] = Math.max(0, Math.min(FIELD_HEIGHT - paddles[i].height, this.paddleY[i]));

        ballPhysics.setPaddlePosition(i, paddles[i].x, this.paddleY[i]);
        gameRenderer.updatePaddle(i, ballPhysics.getPaddlePosition(i)!);
      }
    }

    ballPhysics.update(delta);
  }

  private resetGame(): void {
    gameState.init(this.playerCount);
    ballPhysics.resetBall();
    gameRenderer.reset();
    this.isPaused = false;
    gameState.startGame();
    ballPhysics.start();
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,
  scene: [TitleScene, GameScene],
  backgroundColor: "#0a0a2e",
  parent: "game-container",
};

new Phaser.Game(config);
