export type ReadingStatus = 'unread' | 'reading' | 'read';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  status: ReadingStatus;
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
  createdAt: string;
}

export interface ReadingStats {
  booksReadThisYear: number;
  totalPages: number;
  averageRating: number;
  currentStreak: number;
}

export interface MonthlyBooks {
  [month: string]: Book[];
}
