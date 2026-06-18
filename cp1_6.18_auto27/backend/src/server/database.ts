import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'learning.db'));
db.pragma('journal_mode = WAL');

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
  description: string;
  created_at: string;
}

export interface SkillNode {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  progress: number;
  parent_id: string | null;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  skill_node_ids: string;
  duration: number;
  notes: string;
  log_date: string;
  created_at: string;
}

export interface Stats {
  streakDays: number;
  totalMinutes: number;
  completedNodes: number;
  totalNodes: number;
}


function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function initDatabase2(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS skill_nodes (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      x REAL NOT NULL DEFAULT 0,
      y REAL NOT NULL DEFAULT 0,
      progress INTEGER NOT NULL DEFAULT 0,
      parent_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id),
      FOREIGN KEY (parent_id) REFERENCES skill_nodes(id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_node_ids TEXT NOT NULL,
      duration INTEGER NOT NULL,
      notes TEXT,
      log_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
