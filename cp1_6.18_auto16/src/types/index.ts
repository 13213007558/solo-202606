export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export interface User { id: string; username: string; avatar?: string; role?: string; }
export interface Task { id: string; title: string; description: string; status: TaskStatus; priority: Priority; assigneeId: string | null; assigneeName?: string; creatorId: string; dueDate: string | null; createdAt: string; updatedAt: string; completedAt: string | null; }
export interface Comment { id: string; taskId: string; userId: string; username: string; avatar?: string; content: string; mentions: string[]; createdAt: string; }
export interface LineComment { id: string; line: number; content: string; userId: string; username: string; createdAt: string; resolved?: boolean; }
export interface ReviewFile { id: string; name: string; content: string; lineComments: LineComment[]; }
export interface Review { id: string; taskId: string; title: string; authorId: string; authorName: string; files: ReviewFile[]; status: 'pending' | 'approved' | 'changes_requested'; createdAt: string; }
export interface TaskStats { total: number; completed: number; overdue: number; avgCompletionDays: number; }
export interface PriorityStats { urgent: number; high: number; medium: number; low: number; }
export interface UserStats { userId: string; username: string; taskCount: number; completedCount: number; }
export interface DailyTaskCount { date: string; count: number; }
export interface Stats { tasks: TaskStats; priorities: PriorityStats; byUser: UserStats[]; dailyTrend: DailyTaskCount[]; }
