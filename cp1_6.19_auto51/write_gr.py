#!/usr/bin/env python3
import os

base_dir = "/Users/guo/Documents/solo/demo-Solo/tasks/auto51/src"

# GameRenderer.ts
game_renderer = """import Phaser from \"phaser\";
import { eventBus } from \"../core/EventBus\";
import type { BallPosition, PaddlePosition } from \"../physics/BallPhysics\";
import type { GameStateData } from \"../game/GameState\";

const PLAYER_COLORS = [0x00ffff, 0xff00ff, 0x00ff00, 0xffff00];

export class GameRenderer {
  private static instance: GameRenderer;
  private scene: Phaser.Scene | null = null;
  private ball: Phaser.GameObjects.Graphics | null = null;
  private paddles: Phaser.GameObjects.Graphics[] = [];
  private scoreTexts: Phaser.GameObjects.Text[] = [];
  private fieldWidth: number = 800;
  private fieldHeight: number = 600;
  private playerCount: number = 2;
  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager | null = null;
  private wallHitEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private gameOverText: Phaser.GameObjects.Text | null = null;
  private countdownText: Phaser.GameObjects.Text | null = null;
  private countdownTimer: Phaser.Time.TimerEvent | null = null;

  private constructor() {}

  public static getInstance(): GameRenderer {
    if (!GameRenderer.instance) {
      GameRenderer.instance = new GameRenderer();
    }
    return GameRenderer.instance;
  }

  public init(scene: Phaser.Scene, playerCount: number, fieldWidth: number, fieldHeight: number): void {
    this.scene = scene;
    this.playerCount = playerCount;
    this.fieldWidth = fieldWidth;
    this.fieldHeight = fieldHeight;

    this.createBackground();
    this.createBall();
    this.createPaddles();
    this.createScoreTexts();

    this.particles = this.scene.add.particles(0, 0, \"ballTex\", {
      lifespan: 300,
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      quantity: 10,
      emitting: false
    });
    this.wallHitEmitter = this.particles.createEmitter({
      lifespan: 300,
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      quantity: 10,
      emitting: false
    });

    this.setupEventListeners();
  }

  private createBackground(): void {
    if (!this.scene) return;

    const g = this.scene.add.graphics();
    g.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a1a4e, 0x1a1a4e, 1);
    g.fillRect(0, 0, this.fieldWidth, this.fieldHeight);

    const line = this.scene.add.graphics();
    line.lineStyle(2, 0x00ffff, 0.3);
    line.beginPath();
    const cx = this.fieldWidth / 2;
    for (let y = 0; y < this.fieldHeight; y += 20) {
      line.moveTo(cx, y);
      line.lineTo(cx, y + 10);
    }
    line.strokePath();
  }

  private createBall(): void {
    if (!this.scene) return;

    const g = this.scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(0, 0, 10);
    g.generateTexture(\"ballTex\", 20, 20);
    g.destroy();

    this.ball = this.scene.add.graphics();
    this.ball.fillStyle(0xffffff, 1);
    this.ball.fillCircle(this.fieldWidth / 2, this.fieldHeight / 2, 10);
  }

  private createPaddles(): void {
    if (!this.scene) return;

    this.paddles = [];
    for (let i = 0; i < this.playerCount; i++) {
      const g = this.scene.add.graphics();
      this.paddles.push(g);
    }
  }

  private createScoreTexts(): void {
    if (!this.scene) return;

    this.scoreTexts = [];
    const y = 50;

    if (this.playerCount === 2) {
      const t1 = this.scene.add.text(this.fieldWidth / 4, y, \"0\", {
        fontSize: \"48px\",
        color: \"#00ffff\",
        fontStyle: \"bold\",
      }).setOrigin(0.5);
      const t2 = this.scene.add.text((this.fieldWidth * 3) / 4, y, \"0\", {
        fontSize: \"48px\",
        color: \"#ff00ff\",
        fontStyle: \"bold\",
      }).setOrigin(0.5);
      this.scoreTexts.push(t1, t2);
    } else {
      const colors = [\"#00ffff\", \"#ff00ff\", \"#00ff00\", \"#ffff00\"];
      for (let i = 0; i < this.playerCount; i++) {
        const t = this.scene.add.text(100 + i * 150, 30, \"P\" + (i + 1) + \": 0\", {
          fontSize: \"20px\",
          color: colors[i],
          fontStyle: \"bold\",
        });
        this.scoreTexts.push(t);
      }
    }
  }

  private setupEventListeners(): void {
    eventBus.on(\"ballPosition\", (pos: BallPosition) => {
      this.updateBall(pos);
    });

    eventBus.on(\"gameStateChange\", (state: GameStateData) => {
      this.updateScores(state.scores);
    });

    eventBus.on(\"wallHit\", (pos: { x: number; y: number }) => {
      this.spawnWallHitParticles(pos.x, pos.y);
    });
  }

  private spawnWallHitParticles(x: number, y: number): void {
    if (this.wallHitEmitter) {
      this.wallHitEmitter.explode(10, x, y);
    }
  }

  private updateBall(pos: BallPosition): void {
    if (!this.ball) return;
    this.ball.clear();
    this.ball.fillStyle(0xffffff, 1);
    this.ball.fillCircle(pos.x, pos.y, 10);
  }

  private updateScores(scores: number[]): void {
    for (let i = 0; i < scores.length && i < this.scoreTexts.length; i++) {
      const oldText = this.scoreTexts[i].text;
      const newText = this.playerCount === 2 ? scores[i].toString() : \"P\" + (i + 1) + \": \" + scores[i];
      
      if (oldText !== newText) {
        this.scoreTexts[i].setText(newText);
        this.scene!.tweens.add({
          targets: this.scoreTexts[i],
          scale: 1.2,
          duration: 100,
          yoyo: true,
          ease: \"Power2.easeInOut\"
        });
      }
    }
  }

  public updatePaddle(playerId: number, paddle: PaddlePosition): void {
    if (playerId < 0 || playerId >= this.paddles.length) return;
    const g = this.paddles[playerId];
    if (!g) return;

    g.clear();
    g.fillStyle(PLAYER_COLORS[playerId], 1);
    g.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  public showGameOver(winner: number, onComplete: () => void): void {
    if (!this.scene) return;
    
    const text = \"Player \" + (winner + 1) + \" Wins!\";
    this.gameOverText = this.scene.add.text(this.fieldWidth / 2, this.fieldHeight / 2 - 50, text, {
      fontSize: \"48px\",
      color: \"#ffffff\",
      fontStyle: \"bold\",
    }).setOrigin(0.5);

    let countdown = 3;
    this.countdownText = this.scene.add.text(this.fieldWidth / 2, this.fieldHeight / 2 + 30, \"Next round in \" + countdown, {
      fontSize: \"28px\",
      color: \"#00ffff\",
      fontStyle: \"bold\",
    }).setOrigin(0.5);

    this.countdownTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          this.countdownText!.setText(\"Next round in \" + countdown);
        } else {
          this.clearGameOverUI();
          onComplete();
        }
      },
      repeat: 2
    });
  }

  private clearGameOverUI(): void {
    if (this.gameOverText) {
      this.gameOverText.destroy();
      this.gameOverText = null;
    }
    if (this.countdownText) {
      this.countdownText.destroy();
      this.countdownText = null;
    }
    if (this.countdownTimer) {
      this.countdownTimer.destroy();
      this.countdownTimer = null;
    }
  }

  public reset(): void {
    this.clearGameOverUI();
  }

  public destroy(): void {
    this.ball = null;
    this.paddles = [];
    this.scoreTexts = [];
    this.scene = null;
  }
}

export const gameRenderer = GameRenderer.getInstance();
"""

with open(os.path.join(base_dir, "renderer/GameRenderer.ts"), "w") as f:
    f.write(game_renderer)
print("GameRenderer.ts written")

