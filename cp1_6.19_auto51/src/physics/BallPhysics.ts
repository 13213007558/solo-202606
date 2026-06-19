import { eventBus } from "../core/EventBus";

export interface BallPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PaddlePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScoreEvent {
  playerId: number;
  scores: number[];
}

export class BallPhysics {
  private static instance: BallPhysics;
  private ball: BallPosition = { x: 0, y: 0, vx: 0, vy: 0 };
  private paddles: PaddlePosition[] = [];
  private playerCount: number = 2;
  private fieldWidth: number = 800;
  private fieldHeight: number = 600;
  private ballRadius: number = 10;
  private baseSpeed: number = 400;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): BallPhysics {
    if (!BallPhysics.instance) {
      BallPhysics.instance = new BallPhysics();
    }
    return BallPhysics.instance;
  }

  public resetBall(): void {
    this.ball.x = this.fieldWidth / 2;
    this.ball.y = this.fieldHeight / 2;
  }
