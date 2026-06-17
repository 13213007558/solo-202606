export const GRID_SIZE = 10;
export const CELL_SIZE = 80;

export enum CellType {
  FLOOR = 0,
  WALL = 1,
  ITEM = 2,
  EXIT = 3
}

export interface Position {
  x: number;
  y: number;
}

export interface GameMap {
  grid: CellType[][];
  playerStart: Position;
  exit: Position;
  itemPositions: Position[];
  enemyStartPositions: Position[];
}

export function generateMap(): GameMap {
  const grid: CellType[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = CellType.FLOOR;
    }
  }

  const playerStart: Position = { x: 0, y: 0 };
  const exit: Position = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };

  const wallCount = Math.floor(GRID_SIZE * GRID_SIZE * 0.15);
  placeRandomWalls(grid, wallCount, playerStart, exit);

  while (!isPathExists(grid, playerStart, exit)) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid[y][x] = CellType.FLOOR;
      }
    }
    placeRandomWalls(grid, wallCount, playerStart, exit);
  }

  const itemPositions: Position[] = [];
  const enemyStartPositions: Position[] = [];
  const occupied = new Set<string>();
  occupied.add(`${playerStart.x},${playerStart.y}`);
  occupied.add(`${exit.x},${exit.y}`);

  for (let i = 0; i < 3; i++) {
    const pos = findRandomEmptyCell(grid, occupied);
    if (pos) {
      grid[pos.y][pos.x] = CellType.ITEM;
      itemPositions.push(pos);
      occupied.add(`${pos.x},${pos.y}`);
    }
  }

  for (let i = 0; i < 2; i++) {
    const pos = findRandomEmptyCell(grid, occupied);
    if (pos) {
      enemyStartPositions.push(pos);
      occupied.add(`${pos.x},${pos.y}`);
    }
  }

  grid[exit.y][exit.x] = CellType.EXIT;

  return { grid, playerStart, exit, itemPositions, enemyStartPositions };
}

function placeRandomWalls(
  grid: CellType[][],
  count: number,
  playerStart: Position,
  exit: Position
): void {
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 10) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (
      grid[y][x] === CellType.FLOOR &&
      !(x === playerStart.x && y === playerStart.y) &&
      !(x === exit.x && y === exit.y)
    ) {
      grid[y][x] = CellType.WALL;
      placed++;
    }
    attempts++;
  }
}

function findRandomEmptyCell(
  grid: CellType[][],
  occupied: Set<string>
): Position | null {
  let attempts = 0;
  while (attempts < 200) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const key = `${x},${y}`;
    if (grid[y][x] === CellType.FLOOR && !occupied.has(key)) {
      return { x, y };
    }
    attempts++;
  }
  return null;
}

function isPathExists(
  grid: CellType[][],
  start: Position,
  end: Position
): boolean {
  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === end.x && current.y === end.y) {
      return true;
    }

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    for (const dir of dirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const key = `${nx},${ny}`;
      if (
        nx >= 0 &&
        nx < GRID_SIZE &&
        ny >= 0 &&
        ny < GRID_SIZE &&
        grid[ny][nx] !== CellType.WALL &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return false;
}

export function isWalkable(grid: CellType[][], pos: Position): boolean {
  if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
    return false;
  }
  return grid[pos.y][pos.x] !== CellType.WALL;
}
