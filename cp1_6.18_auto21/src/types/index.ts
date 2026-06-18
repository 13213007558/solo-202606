export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ReviewStatus = 'pending' | 'approved' | 'changes-requested';
export type ReviewCommentStatus = 'approved' | 'changes-requested';

export interface User {
  id: string;
  username: string;
  avatar: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  files: ReviewFile[];
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewFile {
  name: string;
  content: string;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  userId: string;
  fileIndex: number;
  lineNumber: number;
  content: string;
  status: ReviewCommentStatus;
  createdAt: string;
}

export interface Stats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgCompletionDays: number;
  memberStats: MemberStat[];
  dailyTrend: DailyTrend[];
}

export interface MemberStat {
  userId: string;
  username: string;
  completedCount: number;
}

export interface DailyTrend {
  date: string;
  count: number;
}
