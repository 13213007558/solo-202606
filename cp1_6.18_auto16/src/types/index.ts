export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  username: string;
  avatar?: string;
  role?: string;
}

export interface LineComment {
  id: string;
  line: number;
  content: string;
  userId: string;
  createdAt: string;
  resolved?: boolean;
}

export interface ReviewFile {
  id: string;
  name: string;
  content: string;
  lineComments: LineComment[];
}

export interface UserStats {
  userId: string;
  username: string;
  taskCount: number;
  completedCount: number;
}

export interface Stats {
  tasks: TaskStats;
  priorities: PriorityStats;
  byUser: UserStats[];
  recentActivity: {
    id: string;
    type: 'task_created' | 'task_updated' | 'comment_added' | 'review_submitted';
    timestamp: string;
  }[];
}
