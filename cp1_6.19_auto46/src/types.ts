export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  status: '构思中' | '开发中' | '已发布' | '已归档';
  createdAt: string;
  updatedAt?: string;
}

export interface DevLog {
  id: string;
  projectId: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
  updatedAt?: string;
}
