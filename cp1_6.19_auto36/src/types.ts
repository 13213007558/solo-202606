export type ProjectStatus = 'ideation' | 'development' | 'published' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogEntry {
  id: string;
  projectId: string;
  date: string;
  title: string;
  content: string;
  mood: '😊' | '😐' | '😢' | '🚀' | '💡';
  createdAt?: string;
  updatedAt?: string;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  ideation: '构思中',
  development: '开发中',
  published: '已发布',
  archived: '已归档',
};

export const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  ideation: { bg: '#94A3B8', text: '#FFFFFF' },
  development: { bg: '#3B82F6', text: '#FFFFFF' },
  published: { bg: '#10B981', text: '#FFFFFF' },
  archived: { bg: '#F59E0B', text: '#FFFFFF' },
};

export const STATUS_GRADIENTS: Record<ProjectStatus, string> = {
  ideation: 'linear-gradient(90deg, #CBD5E1 0%, #94A3B8 100%)',
  development: 'linear-gradient(90deg, #93C5FD 0%, #3B82F6 100%)',
  published: 'linear-gradient(90deg, #6EE7B7 0%, #10B981 100%)',
  archived: 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 100%)',
};

export const TECH_COLORS: Record<string, string> = {
  React: '#61DAFB',
  'Node.js': '#339933',
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Vue: '#4FC08D',
  Angular: '#DD0031',
  'Next.js': '#000000',
  Tailwind: '#06B6D4',
  Express: '#000000',
  MongoDB: '#47A248',
  PostgreSQL: '#4169E1',
  Docker: '#2496ED',
  AWS: '#FF9900',
  Vite: '#646CFF',
};

export const MOOD_OPTIONS = ['😊', '😐', '😢', '🚀', '💡'] as const;

export const MOOD_COLORS: Record<string, string> = {
  '😊': '#10B981',
  '😐': '#64748B',
  '😢': '#EF4444',
  '🚀': '#3B82F6',
  '💡': '#F59E0B',
};
