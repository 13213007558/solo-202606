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

interface MoveAnim {
  active: boolean;
  startTime: number;
  duration: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface ItemFlash {
  pos: Position;
  startTime: number;
  duration: number;
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
let itemFlashes: ItemFlash[] = [];
let gameState: GameState = 'playing';
let stateTimer: number = 0;

let playerMoveAnim: MoveAnim = {
  active: false,
  startTime: 0,
  duration: 150,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0
};

let playerScaleAnim: { active: boolean; startTime: number; duration: number } = {
  active: false,
  startTime: 0,
  duration: 200
};

interface EnemyMoveAnim extends MoveAnim {
  enemyIndex: number;
}
let enemyMoveAnims: EnemyMoveAnim[] = [];
const ENEMY_MOVE_DURATION = 300;

let exitPulsePhase: number = 0;
let combatShakeTime: number = 0;
let combatShakeActive: boolean = false;

const pressedKeys = new Set<string>();

function initGame(): void {
  gameMap = generateMap();
  player = new Player(gameMap.playerStart, 3);
  enemies = gameMap.enemyStartPositions.map((pos) => new Enemy(pos));
  particles = [];
  itemFlashes = [];
  enemyMoveAnims = [];
  gameState = 'playing';
  stateTimer = 0;
  combatShakeActive = false;
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

function updateItemFlashes(currentTime: number): void {
  for (let i = itemFlashes.length - 1; i >= 0; i--) {
    const flash = itemFlashes[i];
    if (currentTime - flash.startTime >= flash.duration) {
      itemFlashes.splice(i, 1);
    }
  }
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

function getPlayerRenderPos(currentTime: number): { x: number; y: number } {
  if (!playerMoveAnim.active) {
    return {
      x: player.position.x * CELL_SIZE + CELL_SIZE / 2,
      y: player.position.y * CELL_SIZE + CELL_SIZE / 2
    };
  }

  const elapsed = currentTime - playerMoveAnim.startTime;
  const t = Math.min(elapsed / playerMoveAnim.duration, 1);
  const eased = easeOutQuad(t);

  const fromPx = playerMoveAnim.fromX * CELL_SIZE + CELL_SIZE / 2;
  const fromPy = playerMoveAnim.fromY * CELL_SIZE + CELL_SIZE / 2;
  const toPx = playerMoveAnim.toX * CELL_SIZE + CELL_SIZE / 2;
  const toPy = playerMoveAnim.toY * CELL_SIZE + CELL_SIZE / 2;

  return {
    x: fromPx + (toPx - fromPx) * eased,
    y: fromPy + (toPy - fromPy) * eased
  };
}

function getEnemyRenderPos(enemy: Enemy, index: number, currentTime: number): { x: number; y: number } {
  const anim = enemyMoveAnims.find(a => a.enemyIndex === index && a.active);
  if (!anim) {
    return {
      x: enemy.position.x * CELL_SIZE + CELL_SIZE / 2,
      y: enemy.position.y * CELL_SIZE + CELL_SIZE / 2
    };
  }

  const elapsed = currentTime - anim.startTime;
  const t = Math.min(elapsed / anim.duration, 1);
  const eased = easeOutQuad(t);

  const fromPx = anim.fromX * CELL_SIZE + CELL_SIZE / 2;
  const fromPy = anim.fromY * CELL_SIZE + CELL_SIZE / 2;
  const toPx = anim.toX * CELL_SIZE + CELL_SIZE / 2;
  const toPy = anim.toY * CELL_SIZE + CELL_SIZE / 2;

  return {
    x: fromPx + (toPx - fromPx) * eased,
    y: fromPy + (toPy - fromPy) * eased
  };
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

function getCombatShakeOffset(currentTime: number): { x: number; y: number } {
  if (!combatShakeActive) return { x: 0, y: 0 };
  const elapsed = currentTime - combatShakeTime;
  if (elapsed >= 200) {
    return { x: 0, y: 0 };
  }
  const intensity = (1 - elapsed / 200) * 4;
  const shakeX = Math.sin(elapsed * 0.08) * intensity;
  const shakeY = Math.cos(elapsed * 0.1) * intensity;
  return { x: shakeX, y: shakeY };
}

function processInput(currentTime: number): void {
  if (gameState !== 'playing') return;

  for (const key of pressedKeys) {
    const dir = keyToDirection(key);
    if (dir && player.canMove(currentTime)) {
      const oldPos = { ...player.position };
      const result = player.move(dir, gameMap.grid, currentTime);
      if (result.moved) {
        playerMoveAnim = {
          active: true,
          startTime: currentTime,
          duration: 150,
          fromX: oldPos.x,
          fromY: oldPos.y,
          toX: result.position.x,
          toY: result.position.y
        };
        playerScaleAnim.active = true;
        playerScaleAnim.startTime = currentTime;
      }
      if (result.collectedItem) {
        itemFlashes.push({
          pos: { ...result.position },
          startTime: currentTime,
          duration: 200
        });
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

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const oldPos = { ...enemy.position };
    const result = enemy.update(player.position, gameMap.grid, currentTime, enemies);

    if (result.moved) {
      enemyMoveAnims.push({
        active: true,
        startTime: currentTime,
        duration: ENEMY_MOVE_DURATION,
        fromX: oldPos.x,
        fromY: oldPos.y,
        toX: result.position.x,
        toY: result.position.y,
        enemyIndex: i
      });
    }

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
    combatShakeTime = currentTime;
    combatShakeActive = true;
  }
}

function updateEnemyAnims(currentTime: number): void {
  for (let i = enemyMoveAnims.length - 1; i >= 0; i--) {
    const anim = enemyMoveAnims[i];
    if (currentTime - anim.startTime >= anim.duration) {
      enemyMoveAnims.splice(i, 1);
    }
  }
}

function checkGameState(currentTime: number): void {
  if (gameState === 'win') {
    if (currentTime - stateTimer >= 2500) {
      initGame();
    }
  } else if (gameState === 'lose') {
    if (currentTime - stateTimer >= 1500) {
      initGame();
    }
  } else if (gameState === 'combat') {
    if (currentTime - stateTimer >= 1000) {
      gameState = 'playing';
      combatShakeActive = false;
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

function drawItems(currentTime: number): void {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (gameMap.grid[y][x] === CellType.ITEM) {
        const cx = x * CELL_SIZE + CELL_SIZE / 2;
        const cy = y * CELL_SIZE + CELL_SIZE / 2;
        const pulse = Math.sin(currentTime / 300 + x + y) * 0.15 + 1;
        const radius = 12 * pulse;

        ctx.fillStyle = COLORS.item;
        ctx.shadowColor = COLORS.item;
        ctx.shadowBlur = 15 * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  for (const flash of itemFlashes) {
    const elapsed = currentTime - flash.startTime;
    const t = elapsed / flash.duration;
    const alpha = 1 - t;
    const scale = 1 + t * 1.5;

    const cx = flash.pos.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = flash.pos.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = COLORS.item;
    ctx.shadowColor = COLORS.item;
    ctx.shadowBlur = 30 * (1 - t);
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
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
  const pos = getPlayerRenderPos(currentTime);
  const shake = getCombatShakeOffset(currentTime);

  const cx = pos.x + shake.x;
  const cy = pos.y + shake.y;

  ctx.fillStyle = COLORS.player;
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 15;
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  ctx.shadowBlur = 0;
}

function drawEnemies(currentTime: number): void {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const size = CELL_SIZE * 0.65;
    const pos = getEnemyRenderPos(enemy, i, currentTime);

    ctx.fillStyle = COLORS.enemy;
    ctx.shadowColor = COLORS.enemy;
    ctx.shadowBlur = 15;
    ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
    ctx.shadowBlur = 0;

    if (enemy.state === 'chase') {
      ctx.strokeStyle = COLORS.enemy;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(currentTime / 150);
      ctx.strokeRect(
        pos.x - size / 2 - 4,
        pos.y - size / 2 - 4,
        size + 8,
        size + 8
      );
      ctx.globalAlpha = 1;
    }
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

function drawCombatVignette(currentTime: number): void {
  if (gameState !== 'combat') return;

  const elapsed = currentTime - stateTimer;
  const t = elapsed / 1000;
  const pulse = Math.abs(Math.sin(elapsed * 0.012));
  const intensity = (1 - t) * pulse;

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.65
  );
  gradient.addColorStop(0, 'rgba(231, 76, 60, 0)');
  gradient.addColorStop(1, `rgba(231, 76, 60, ${intensity * 0.8})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const borderWidth = 4 + 6 * pulse;
  ctx.strokeStyle = `rgba(231, 76, 60, ${intensity * 0.9})`;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    canvas.width - borderWidth,
    canvas.height - borderWidth
  );

  ctx.fillStyle = COLORS.combat;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = COLORS.combat;
  ctx.shadowBlur = 20 + 15 * pulse;
  ctx.globalAlpha = 0.7 + 0.3 * pulse;
  ctx.fillText('⚔ 战斗！', canvas.width / 2, canvas.height / 2);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
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
  const totalDuration = 2500;
  const flyInDuration = 500;

  let yOffset: number;
  let alpha: number;
  let scale: number;

  if (elapsed < flyInDuration) {
    const t = elapsed / flyInDuration;
    const eased = easeOutQuad(t);
    yOffset = (1 - eased) * 100;
    alpha = eased;
    scale = 0.8 + 0.2 * eased;
  } else {
    const pulseT = ((elapsed - flyInDuration) / 400) % (Math.PI * 2);
    yOffset = 0;
    alpha = 0.9 + 0.1 * Math.sin(pulseT);
    scale = 1 + 0.05 * Math.sin(pulseT);
  }

  const glowSize = 30 + 10 * Math.sin(elapsed / 200);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2 + yOffset);
  ctx.scale(scale, scale);
  ctx.fillStyle = COLORS.win;
  ctx.font = 'bold 100px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;
  ctx.shadowColor = COLORS.win;
  ctx.shadowBlur = glowSize;
  ctx.fillText('胜利！', 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function render(currentTime: number): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawItems(currentTime);
  drawExit(currentTime);
  drawParticles();
  drawPlayer(currentTime);
  drawEnemies(currentTime);
  drawCombatVignette(currentTime);
  drawLoseScreen(currentTime);
  drawWinScreen(currentTime);
}

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = lastTime ? currentTime - lastTime : 16;
  lastTime = currentTime;

  processInput(currentTime);
  updateEnemies(currentTime);
  updateEnemyAnims(currentTime);
  updateParticles(deltaTime);
  updateItemFlashes(currentTime);
  checkGameState(currentTime);
  render(currentTime);

  requestAnimationFrame(gameLoop);
}

initGame();
requestAnimationFrame(gameLoop);
