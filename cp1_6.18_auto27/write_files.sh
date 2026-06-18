#!/bin/bash

# 写入后端 database.ts
cat > /Users/guo/Documents/solo/demo-Solo/tasks/auto27/backend/src/server/database.ts << 'EOF'
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
  parent_id: string |#!/bin/bash

# 写入后端 database.ts
cat > /Users/guo/Documents/solo/demo-Solo/tasks/auto27/backend/srcid
# 写入?  cat > /Users/guo/Document: import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import pa timport { v4 as uuidv4 } from 'uuid';
;
import path from 'path';
import { fitimport { fileURLToPath } from EA