export interface Course {
  id: string;
  name: string;
  date: string;
  studentCount: number;
  feedbackStatus: 'pending' | 'submitted';
  submittedAt?: string;
}

export interface StudentHighlight {
  id: string;
  tag: string;
  description: string;
}

export interface Feedback {
  id: string;
  courseId: string;
  rating: number;
  summary: string;
  highlights: StudentHighlight[];
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  submittedCount: number;
  averageRating: number;
  lastFeedbackTime: string | null;
}

export const TAGS = [
  '积极参与',
  '技术扎实',
  '进步明显',
  '思维活跃',
  '团队协作',
  '创意突出',
];
