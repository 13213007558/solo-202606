export interface User {
  id: string;
  username: string;
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

export interface Position {
  x: number;
  y: number;
}
