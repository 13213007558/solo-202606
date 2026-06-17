import {
  generateMap,
  GRID_SIZE,
  CELL_SIZE,
  CellType,
  GameMap,
  Position
} from './map';
import { Player, Direction } from './player';
import { Enemy } from './enemy';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

type GameState = 'playing' | 'win' | 'lose' | 'combat';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;

const COLORS = {
  bg: '#1a1a2e',
  grid: '#9b59b6',
  player: '#3498db',
  enemy: '#e74c3c',
  item: '#f1c40f',
  exit: '#2ecc71',
  wall: '#4a3f5e',
  floor: '#252542',
  win: '#f1c40f',
  lose: '#e74c3c',
  combat: '#e74c3c'
};

let gameMap: GameMap;
let player: Player;
let enemies: Enemy[];
let particles: Particle[] = [];
let gameState: GameState = 'playing';
let stateTimer: number = 0;
let playerScaleAnim: { active: boolean; startTime: number; duration: number } = {
  active: false,
  startTime: 0,
  duration: 200
};
let exitPulsePhase: number = 0;
let combatFlashPhase: number = 0;

const pressedKeys = new Set<string>();

function initGame(): void {
  gameMap = generateMap();
  player = new Player(gameMap.playerStart, 3);
  enemies = gameMap.enemyStartPositions.map((pos) => new Enemy(pos));
  particles = [];
  gameState = 'playing';
  stateTimer = 0;
  updateHUD();
}

function updateHUD(): void {
  hud.textContent = `道具：${player.itemsCollected}/${player.totalItems}`;
}

function keyToDirection(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return Direction.UP;
    case 'ArrowDown':
    case 's':
    case 'S':
      return Direction.DOWN;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return Direction.LEFT;
    case 'ArrowRight':
    case 'd':
    case 'D':
      return Direction.RIGHT;
    default:
      return null;
  }
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const dir = keyToDirection(e.key);
  if (dir) {
    e.preventDefault();
    pressedKeys.add(e.key);
  }
});

document.addEventListener('keyup', (e: KeyboardEvent) => {
  pressedKeys.delete(e.key);
});

function spawnItemParticles(pos: Position): void {
  const centerX = pos.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = pos.y * CELL_SIZE + CELL_SIZE / 2;
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.3;
    const speed = 1.5 + Math.random() * 1.5;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 600,
      maxLife: 600,
      color: COLORS.item,
      size: 3 + Math.random() * 3
    });
  }
}

function updateParticles(deltaTime: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= deltaTime;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function getPlayerScale(currentTime: number): number {
  if (!playerScaleAnim.active) return 1.0;
  const elapsed = currentTime - playerScaleAnim.startTime;
  if (elapsed >= playerScaleAnim.duration) {
    playerScaleAnim.active = false;
    return 1.0;
  }
  const t = elapsed / playerScaleAnim.duration;
  return 1.0 + 0.2 * Math.sin(t * Math.PI);
}

function processInput(currentTime: number): void {
  if (gameState !== 'playing') return;

  for (const key of pressedKeys) {
    const dir = keyToDirection(key);
    if (dir && player.canMove(currentTime)) {
      const result = player.move(dir, gameMap.grid, currentTime);
      if (result.moved) {
        playerScaleAnim.active = true;
        playerScaleAnim.startTime = currentTime;
      }
      if (result.collectedItem) {
        gameMap.grid[result.position.y][result.position.x] = CellType.FLOOR;
        spawnItemParticles(result.position);
        updateHUD();
      }
      if (result.reachedExit && player.hasAllItems()) {
        gameState = 'win';
        stateTimer = currentTime;
      }
      break;
    }
  }
}

function updateEnemies(currentTime: number): void {
  if (gameState !== 'playing') return;

  let inCombat = false;
  for (const enemy of enemies) {
    const result = enemy.update(player.position, gameMap.grid, currentTime);
    if (result.adjacentToPlayer) {
      inCombat = true;
    }
    if (enemy.isOnPlayer(player.position)) {
      gameState = 'lose';
      stateTimer = currentTime;
      return;
    }
  }

  if (inCombat && gameState === 'playing') {
    gameState = 'combat';
    stateTimer = currentTime;
    combatFlashPhase = 0;
  }
}

function checkGameState(currentTime: number): void {
  if (gameState === 'win') {
    if (currentTime - stateTimer >= 2000) {
      initGame();
    }
  } else if (gameState === 'lose') {
    if (currentTime - stateTimer >= 1500) {
      initGame();
    }
  } else if (gameState === 'combat') {
    combatFlashPhase = (currentTime - stateTimer) / 1000;
    if (currentTime - stateTimer >= 1000) {
      gameState = 'playing';
    }
  }
}

function drawGrid(): void {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = gameMap.grid[y][x];
      const px = x * CELL_SIZE;
      const py = y * CELL_SIZE;

      ctx.fillStyle = cell === CellType.WALL ? COLORS.wall : COLORS.floor;
      ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }
}

function drawItems(): void {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (gameMap.grid[y][x] === CellType.ITEM) {
        const cx = x * CELL_SIZE + CELL_SIZE / 2;
        const cy = y * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillStyle = COLORS.item;
        ctx.shadowColor = COLORS.item;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

function drawExit(currentTime: number): void {
  const exit = gameMap.exit;
  const px = exit.x * CELL_SIZE;
  const py = exit.y * CELL_SIZE;
  const padding = 6;

  exitPulsePhase = (currentTime / 400) % (Math.PI * 2);
  const pulseAlpha = 0.4 + 0.4 * Math.abs(Math.sin(exitPulsePhase));
  const borderWidth = 3 + 2 * Math.abs(Math.sin(exitPulsePhase));

  if (player.hasAllItems()) {
    ctx.fillStyle = `rgba(46, 204, 113, ${pulseAlpha})`;
    ctx.fillRect(px + padding, py + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2);
  }

  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = borderWidth;
  ctx.shadowColor = COLORS.exit;
  ctx.shadowBlur = player.hasAllItems() ? 20 : 8;
  ctx.strokeRect(
    px + padding + borderWidth / 2,
    py + padding + borderWidth / 2,
    CELL_SIZE - padding * 2 - borderWidth,
    CELL_SIZE - padding * 2 - borderWidth
  );
  ctx.shadowBlur = 0;
}

function drawPlayer(currentTime: number): void {
  const scale = getPlayerScale(currentTime);
  const size = CELL_SIZE * 0.65 * scale;
  const cx = player.position.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = player.position.y * CELL_SIZE + CELL_SIZE / 2;

  ctx.fillStyle = COLORS.player;
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 15;
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  ctx.shadowBlur = 0;
}

function drawEnemies(): void {
  for (const enemy of enemies) {
    const size = CELL_SIZE * 0.65;
    const cx = enemy.position.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = enemy.position.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillStyle = COLORS.enemy;
    ctx.shadowColor = COLORS.enemy;
    ctx.shadowBlur = 15;
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    ctx.shadowBlur = 0;
  }
}

function drawParticles(): void {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCombatFlash(currentTime: number): void {
  if (gameState !== 'combat') return;
  const flash = Math.sin((currentTime - stateTimer) * 0.02) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(231, 76, 60, ${flash * 0.4})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = COLORS.combat;
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = flash;
  ctx.fillText('⚔ 战斗！', canvas.width / 2, canvas.height / 2);
  ctx.globalAlpha = 1;
}

function drawLoseScreen(currentTime: number): void {
  if (gameState !== 'lose') return;
  const flashSpeed = 0.015;
  const t = (currentTime - stateTimer) * flashSpeed;
  const alpha = 0.3 + 0.5 * (Math.abs(Math.sin(t)));

  ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = COLORS.lose;
  ctx.shadowBlur = 20;
  ctx.fillText('失败！', canvas.width / 2, canvas.height / 2);
  ctx.shadowBlur = 0;
}

function drawWinScreen(currentTime: number): void {
  if (gameState !== 'win') return;
  const elapsed = currentTime - stateTimer;
  const duration = 2000;
  const progress = Math.min(elapsed / duration, 1);

  const scale = progress < 0.5 ? progress * 2 : 1;
  const alpha = Math.min(progress * 1.5, 1);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = COLORS.win;
  ctx.font = 'bold 100px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;
  ctx.shadowColor = COLORS.win;
  ctx.shadowBlur = 30;
  ctx.fillText('胜利！', 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function render(currentTime: number): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawItems();
  drawExit(currentTime);
  drawParticles();
  drawPlayer(currentTime);
  drawEnemies();
  drawCombatFlash(currentTime);
  drawLoseScreen(currentTime);
  drawWinScreen(currentTime);
}

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = lastTime ? currentTime - lastTime : 16;
  lastTime = currentTime;

  processInput(currentTime);
  updateEnemies(currentTime);
  updateParticles(deltaTime);
  checkGameState(currentTime);
  render(currentTime);

  requestAnimationFrame(gameLoop);
}

initGame();
requestAnimationFrame(gameLoop);
