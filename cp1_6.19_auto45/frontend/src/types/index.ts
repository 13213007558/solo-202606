export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  status: 'unread' | 'reading' | 'read';
  startDate?: string;
  endDate?: string;
  rating?: number;
}

export interface Challenge {
  id: string;
  name: string;
  targetBooks: number;
  deadline: string;
  bookIds: string[];
  isPreset: boolean;
}
