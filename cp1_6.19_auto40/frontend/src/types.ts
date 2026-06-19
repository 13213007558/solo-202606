export type ReadingStatus = 'unread' | 'reading' | 'finished';

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
  currentPage?: number;
}

export interface Challenge {
  id: string;
  name: string;
  targetBooks: number;
  deadline: string;
  createdAt: string;
  bookIds: string[];
  completedBookIds: string[];
}

export interface UserStats {
  booksThisYear: number;
  totalPages: number;
  averageRating: number;
  streakDays: number;
  monthlyBooks: { [key: string]: Book[] };
}
