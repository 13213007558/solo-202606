import { Position, isWalkable, CellType } from './map';

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface MoveResult {
  position: Position;
  collectedItem: boolean;
  reachedExit: boolean;
  moved: boolean;
}

export class Player {
  public position: Position;
  public itemsCollected: number;
  public totalItems: number;
  private lastMoveTime: number;
  private readonly moveCooldown: number = 300;

  constructor(startPos: Position, totalItems: number) {
    this.position = { ...startPos };
    this.itemsCollected = 0;
    this.totalItems = totalItems;
    this.lastMoveTime = 0;
  }

  public canMove(currentTime: number): boolean {
    return currentTime - this.lastMoveTime >= this.moveCooldown;
  }

  public move(
    direction: Direction,
    grid: CellType[][],
    currentTime: number
  ): MoveResult {
    if (!this.canMove(currentTime)) {
      return {
        position: { ...this.position },
        collectedItem: false,
        reachedExit: false,
        moved: false
      };
    }

    const delta = this.directionToDelta(direction);
    const newPos: Position = {
      x: this.position.x + delta.x,
      y: this.position.y + delta.y
    };

    if (!isWalkable(grid, newPos)) {
      return {
        position: { ...this.position },
        collectedItem: false,
        reachedExit: false,
        moved: false
      };
    }

    this.position = newPos;
    this.lastMoveTime = currentTime;

    const cellType = grid[newPos.y][newPos.x];
    const collectedItem = cellType === CellType.ITEM;
    const reachedExit = cellType === CellType.EXIT;

    if (collectedItem) {
      this.itemsCollected++;
    }

    return {
      position: { ...this.position },
      collectedItem,
      reachedExit,
      moved: true
    };
  }

  public hasAllItems(): boolean {
    return this.itemsCollected >= this.totalItems;
  }

  public reset(startPos: Position): void {
    this.position = { ...startPos };
    this.itemsCollected = 0;
    this.lastMoveTime = 0;
  }

  private directionToDelta(direction: Direction): Position {
    switch (direction) {
      case Direction.UP:
        return { x: 0, y: -1 };
      case Direction.DOWN:
        return { x: 0, y: 1 };
      case Direction.LEFT:
        return { x: -1, y: 0 };
      case Direction.RIGHT:
        return { x: 1, y: 0 };
    }
  }
}
