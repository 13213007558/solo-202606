import { Position, isWalkable, CellType } from './map';

export class Enemy {
  public position: Position;
  private lastMoveTime: number;
  private readonly moveInterval: number = 2000;

  constructor(startPos: Position) {
    this.position = { ...startPos };
    this.lastMoveTime = 0;
  }

  public canMove(currentTime: number): boolean {
    return currentTime - this.lastMoveTime >= this.moveInterval;
  }

  public update(
    playerPos: Position,
    grid: CellType[][],
    currentTime: number
  ): { position: Position; moved: boolean; adjacentToPlayer: boolean } {
    const adjacent = this.isAdjacent(playerPos);

    if (!this.canMove(currentTime)) {
      return {
        position: { ...this.position },
        moved: false,
        adjacentToPlayer: adjacent
      };
    }

    const bestMove = this.findBestMove(playerPos, grid);
    if (bestMove) {
      this.position = bestMove;
      this.lastMoveTime = currentTime;
      return {
        position: { ...this.position },
        moved: true,
        adjacentToPlayer: this.isAdjacent(playerPos)
      };
    }

    return {
      position: { ...this.position },
      moved: false,
      adjacentToPlayer: adjacent
    };
  }

  private findBestMove(
    playerPos: Position,
    grid: CellType[][]
  ): Position | null {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    let bestPos: Position | null = null;
    let bestDist = Infinity;

    for (const dir of dirs) {
      const newPos: Position = {
        x: this.position.x + dir.x,
        y: this.position.y + dir.y
      };
      if (isWalkable(grid, newPos)) {
        const dist =
          Math.abs(newPos.x - playerPos.x) + Math.abs(newPos.y - playerPos.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestPos = newPos;
        }
      }
    }

    return bestPos;
  }

  private isAdjacent(playerPos: Position): boolean {
    const dx = Math.abs(this.position.x - playerPos.x);
    const dy = Math.abs(this.position.y - playerPos.y);
    return dx + dy === 1;
  }

  public isOnPlayer(playerPos: Position): boolean {
    return (
      this.position.x === playerPos.x && this.position.y === playerPos.y
    );
  }

  public reset(startPos: Position): void {
    this.position = { ...startPos };
    this.lastMoveTime = 0;
  }
}
