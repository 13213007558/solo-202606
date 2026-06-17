import { Position, isWalkable, CellType, GRID_SIZE } from './map';

export type EnemyState = 'patrol' | 'chase';

export class Enemy {
  public position: Position;
  public state: EnemyState;
  private lastMoveTime: number;
  private readonly chaseInterval: number = 1000;
  private readonly patrolInterval: number = 1500;
  private readonly chaseRange: number = 5;
  private readonly patrolRadius: number = 1;
  private startPos: Position;
  private patrolDirection: Position | null = null;

  constructor(startPos: Position) {
    this.position = { ...startPos };
    this.startPos = { ...startPos };
    this.state = 'patrol';
    this.lastMoveTime = 0;
  }

  public canMove(currentTime: number): boolean {
    const interval = this.state === 'chase' ? this.chaseInterval : this.patrolInterval;
    return currentTime - this.lastMoveTime >= interval;
  }

  public getMoveInterval(): number {
    return this.state === 'chase' ? this.chaseInterval : this.patrolInterval;
  }

  public update(
    playerPos: Position,
    grid: CellType[][],
    currentTime: number,
    otherEnemies: Enemy[] = []
  ): { position: Position; moved: boolean; adjacentToPlayer: boolean; stateChanged: boolean } {
    const prevState = this.state;
    const distToPlayer = this.manhattanDistance(playerPos);
    if (distToPlayer <= this.chaseRange) {
      this.state = 'chase';
    } else {
      this.state = 'patrol';
    }
    const stateChanged = prevState !== this.state;

    const adjacent = this.isAdjacent(playerPos);

    if (!this.canMove(currentTime)) {
      return {
        position: { ...this.position },
        moved: false,
        adjacentToPlayer: adjacent,
        stateChanged
      };
    }

    let nextPos: Position | null = null;

    if (this.state === 'chase') {
      nextPos = this.findChaseMove(playerPos, grid, otherEnemies);
    } else {
      nextPos = this.findPatrolMove(grid, otherEnemies, playerPos);
    }

    if (nextPos) {
      this.position = nextPos;
      this.lastMoveTime = currentTime;
      return {
        position: { ...this.position },
        moved: true,
        adjacentToPlayer: this.isAdjacent(playerPos),
        stateChanged
      };
    }

    return {
      position: { ...this.position },
      moved: false,
      adjacentToPlayer: adjacent,
      stateChanged
    };
  }

  private findChaseMove(
    playerPos: Position,
    grid: CellType[][],
    otherEnemies: Enemy[]
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
      if (this.isValidMove(newPos, grid, otherEnemies)) {
        const dist = this.manhattanDistanceTo(newPos, playerPos);
        if (dist < bestDist) {
          bestDist = dist;
          bestPos = newPos;
        }
      }
    }

    return bestPos;
  }

  private findPatrolMove(
    grid: CellType[][],
    otherEnemies: Enemy[],
    playerPos: Position
  ): Position | null {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    if (this.patrolDirection) {
      const newPos: Position = {
        x: this.position.x + this.patrolDirection.x,
        y: this.position.y + this.patrolDirection.y
      };
      if (
        this.isValidMove(newPos, grid, otherEnemies) &&
        this.isWithinPatrolRadius(newPos) &&
        !this.isRestrictedPosition(newPos, playerPos)
      ) {
        return newPos;
      }
      this.patrolDirection = null;
    }

    const shuffledDirs = [...dirs].sort(() => Math.random() - 0.5);

    for (const dir of shuffledDirs) {
      const newPos: Position = {
        x: this.position.x + dir.x,
        y: this.position.y + dir.y
      };
      if (
        this.isValidMove(newPos, grid, otherEnemies) &&
        this.isWithinPatrolRadius(newPos) &&
        !this.isRestrictedPosition(newPos, playerPos)
      ) {
        this.patrolDirection = { ...dir };
        return newPos;
      }
    }

    if (!this.patrolDirection) {
      for (const dir of shuffledDirs) {
        const newPos: Position = {
          x: this.position.x + dir.x,
          y: this.position.y + dir.y
        };
        if (this.isValidMove(newPos, grid, otherEnemies) && !this.isRestrictedPosition(newPos, playerPos)) {
          return newPos;
        }
      }
    }

    return null;
  }

  private isValidMove(
    pos: Position,
    grid: CellType[][],
    otherEnemies: Enemy[]
  ): boolean {
    if (!isWalkable(grid, pos)) return false;

    for (const other of otherEnemies) {
      if (other === this) continue;
      if (other.position.x === pos.x && other.position.y === pos.y) {
        return false;
      }
    }

    return true;
  }

  private isWithinPatrolRadius(pos: Position): boolean {
    const dx = Math.abs(pos.x - this.startPos.x);
    const dy = Math.abs(pos.y - this.startPos.y);
    return dx <= this.patrolRadius && dy <= this.patrolRadius;
  }

  private isRestrictedPosition(pos: Position, playerStart: Position): boolean {
    if (pos.x === playerStart.x && pos.y === playerStart.y) return true;
    if (pos.x === GRID_SIZE - 1 && pos.y === GRID_SIZE - 1) return true;
    return false;
  }

  private manhattanDistance(target: Position): number {
    return Math.abs(this.position.x - target.x) + Math.abs(this.position.y - target.y);
  }

  private manhattanDistanceTo(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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
    this.startPos = { ...startPos };
    this.state = 'patrol';
    this.lastMoveTime = 0;
    this.patrolDirection = null;
  }
}
