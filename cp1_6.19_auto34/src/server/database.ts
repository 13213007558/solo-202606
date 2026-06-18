import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/learning.db');

let db: Database.Database;

export interface User {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface SkillNode {
  id: string;
  goal_id: string;
  title: string;
  x: number;
  y: number;
  progress: number;
  parent_id: string | null;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  node_ids: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export function initDb(): void {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS skill_nodes (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      title TEXT NOT NULL,
      x REAL DEFAULT 0,
      y REAL DEFAULT 0,
      progress REAL DEFAULT 0,
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals(id),
      FOREIGN KEY (parent_id) REFERENCES skill_nodes(id)
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      node_ids TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export function createUser(username: string, password: string): User | null {
  try {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)');
    stmt.run(id, username, password);
    return getUserById(id);
  } catch {
    return null;
  }
}

export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

export function getUserById(id: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return (stmt.get(id) as User | undefined) ?? null;
}

export function createGoal(userId: string, title: string): Goal {
  const id = uuidv4();
  const stmt = db.prepare('INSERT INTO goals (id, user_id, title) VALUES (?, ?, ?)');
  stmt.run(id, userId, title);
  return { id, user_id: userId, title, created_at: new Date().toISOString() };
}

export function getGoalsByUserId(userId: string): Goal[] {
  const stmt = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Goal[];
}

export function createSkillNode(
  goalId: string,
  title: string,
  parentId: string | null,
  x: number,
  y: number
): SkillNode {
  const id = uuidv4();
  const stmt = db.prepare(
    'INSERT INTO skill_nodes (id, goal_id, title, x, y, progress, parent_id) VALUES (?, ?, ?, ?, ?, 0, ?)'
  );
  stmt.run(id, goalId, title, x, y, parentId);
  return { id, goal_id: goalId, title, x, y, progress: 0, parent_id: parentId, created_at: new Date().toISOString() };
}

export function getSkillNodesByGoalId(goalId: string): SkillNode[] {
  const stmt = db.prepare('SELECT * FROM skill_nodes WHERE goal_id = ? ORDER BY created_at');
  return stmt.all(goalId) as SkillNode[];
}

export function updateSkillNodePosition(id: string, x: number, y: number): void {
  const stmt = db.prepare('UPDATE skill_nodes SET x = ?, y = ? WHERE id = ?');
  stmt.run(x, y, id);
}

export function updateSkillNodeProgress(id: string, progress: number): void {
  const clamped = Math.min(100, Math.max(0, progress));
  const stmt = db.prepare('UPDATE skill_nodes SET progress = ? WHERE id = ?');
  stmt.run(clamped, id);
}

export function createDailyLog(
  userId: string,
  date: string,
  nodeIds: string[],
  durationMinutes: number,
  notes: string
): DailyLog {
  const id = uuidv4();
  const nodeIdsJson = JSON.stringify(nodeIds);
  const stmt = db.prepare(
    'INSERT INTO daily_logs (id, user_id, date, node_ids, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, userId, date, nodeIdsJson, durationMinutes, notes);

  const minutesPerNode = durationMinutes / nodeIds.length;
  for (const nodeId of nodeIds) {
    const nodeStmt = db.prepare('SELECT progress FROM skill_nodes WHERE id = ?');
    const row = nodeStmt.get(nodeId) as { progress: number } | undefined;
    if (row) {
      const increment = (minutesPerNode / 600) * 100;
      const newProgress = Math.min(100, row.progress + increment);
      updateSkillNodeProgress(nodeId, newProgress);
    }
  }

  return {
    id,
    user_id: userId,
    date,
    node_ids: nodeIdsJson,
    duration_minutes: durationMinutes,
    notes,
    created_at: new Date().toISOString(),
  };
}

export function getDailyLogsByUserId(userId: string): DailyLog[] {
  const stmt = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC');
  return stmt.all(userId) as DailyLog[];
}

export function getStats(userId: string): {
  streak: number;
  totalMinutes: number;
  completedNodes: number;
  totalNodes: number;
} {
  const logs = db.prepare('SELECT date FROM daily_logs WHERE user_id = ? ORDER BY date DESC').all(userId) as {
    date: string;
  }[];

  let streak = 0;
  if (logs.length > 0) {
    const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (Math.abs(diff - 1) < 0.01) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  const totalResult = db
    .prepare('SELECT SUM(duration_minutes) as total FROM daily_logs WHERE user_id = ?')
    .get(userId) as { total: number | null };
  const totalMinutes = totalResult.total || 0;

  const goals = getGoalsByUserId(userId);
  let completedNodes = 0;
  let totalNodes = 0;
  for (const goal of goals) {
    const nodes = getSkillNodesByGoalId(goal.id);
    totalNodes += nodes.length;
    completedNodes += nodes.filter((n) => n.progress >= 100).length;
  }

  return { streak, totalMinutes, completedNodes, totalNodes };
}

export function getSkillNodeById(id: string): SkillNode | undefined {
  const stmt = db.prepare('SELECT * FROM skill_nodes WHERE id = ?');
  return stmt.get(id) as SkillNode | undefined;
}
