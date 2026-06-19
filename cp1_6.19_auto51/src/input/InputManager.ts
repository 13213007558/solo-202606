import { eventBus } from "../core/EventBus";

export type PlayerAction = "moveUp" | "moveDown" | "stopUp" | "stopDown";

export interface InputEvent {
  playerId: number;
  action: PlayerAction;
}

interface KeyMapping {
  up: string;
  down: string;
}

const PLAYER_KEYS: KeyMapping[] = [
  { up: "KeyW", down: "KeyS" },
  { up: "ArrowUp", down: "ArrowDown" },
  { up: "KeyO", down: "KeyL" },
  { up: "Digit8", down: "Digit2" },
];

export class InputManager {
  private static instance: InputManager;
  private keysPressed: Set<string> = new Set();
  private playerCount: number = 2;
  private isListening: boolean = false;

  private constructor() {}

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }


  public init(playerCount: number): void {
    this.setPlayerCount(playerCount);
    this.startListening();
  }
  public setPlayerCount(count: number): void {
    if (count < 2 || count > 4) {
      throw new Error("Player count must be between 2 and 4");
    }
    this.playerCount = count;
  }

  public startListening(): void {
    if (this.isListening) return;
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.isListening = true;
  }

  public stopListening(): void {
    if (!this.isListening) return;
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.isListening = false;
    this.keysPressed.clear();
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.keysPressed.has(e.code)) return;
    this.keysPressed.add(e.code);
    this.emitAction(e.code, true);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (!this.keysPressed.has(e.code)) return;
    this.keysPressed.delete(e.code);
    this.emitAction(e.code, false);
  };

  private emitAction(keyCode: string, isPressed: boolean): void {
    for (let playerId = 0; playerId < this.playerCount; playerId++) {
      const mapping = PLAYER_KEYS[playerId];
      if (keyCode === mapping.up) {
        const action: PlayerAction = isPressed ? "moveUp" : "stopUp";
        eventBus.emit("input", { playerId, action } as InputEvent);
        return;
      }
      if (keyCode === mapping.down) {
        const action: PlayerAction = isPressed ? "moveDown" : "stopDown";
        eventBus.emit("input", { playerId, action } as InputEvent);
        return;
      }
    }
  }

  public isKeyPressed(playerId: number, direction: "up" | "down"): boolean {
    if (playerId < 0 || playerId >= this.playerCount) return false;
    const mapping = PLAYER_KEYS[playerId];
    const keyCode = direction === "up" ? mapping.up : mapping.down;
    return this.keysPressed.has(keyCode);
  }

  public destroy(): void {
    this.stopListening();
  }
}

export const inputManager = InputManager.getInstance();
