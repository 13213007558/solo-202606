import express, { Request, Response } from 'express';
import cors from 'cors';
import booksRouter from './routes/books';
import challengesRouter from './routes/challenges';
import { ReadingStats, MonthlyBooks } from './types';
import { mockBooks } from './data/mockData';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/challenges', challengesRouter);

app.get('/api/stats', (_req: Request, res: Response) => {
  const currentYear = new Date().getFullYear();
  const readBooks = mockBooks.filter(book => 
    book.status === 'read' && 
    book.endDate && 
    new Date(book.endDate).getFullYear() === currentYear
  );

  const totalPages = readBooks.reduce((sum, book) => sum + book.totalPages, 0);
  const totalRating = readBooks.reduce((sum, book) => sum + (book.rating || 0), 0);
  const averageRating = readBooks.length > 0 ? totalRating / readBooks.length : 0;

  const currentStreak = calculateStreak(mockBooks);

  const stats: ReadingStats = {
    booksReadThisYear: readBooks.length,
    totalPages,
    averageRating: parseFloat(averageRating.toFixed(1)),
    currentStreak
  };

  res.json(stats);
});

app.get('/api/stats/monthly', (_req: Request, res: Response) => {
  const currentYear = new Date().getFullYear();
  const monthlyBooks: MonthlyBooks = {};

  for (let i = 1; i <= 12; i++) {
    const monthKey = `${currentYear}-${String(i).padStart(2, '0')}`;
    monthlyBooks[monthKey] = [];
  }

  mockBooks.forEach(book => {
    if (book.status === 'read' && book.endDate) {
      const date = new Date(book.endDate);
      if (date.getFullYear() === currentYear) {
        const monthKey = `${currentYear}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyBooks[monthKey]) {
          monthlyBooks[monthKey] = [];
        }
        monthlyBooks[monthKey].push(book);
      }
    }
  });

  res.json(monthlyBooks);
});

function calculateStreak(books: typeof mockBooks): number {
  const today = new Date();
  const readDates: Date[] = [];

  books.forEach(book => {
    if (book.status === 'read' && book.endDate) {
      readDates.push(new Date(book.endDate));
    }
    if (book.status === 'reading' && book.startDate) {
      readDates.push(new Date(book.startDate));
    }
  });

  if (readDates.length === 0) return 0;

  readDates.sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasActivity = readDates.some(d => 
      d.toISOString().split('T')[0] === dateStr
    );

    if (hasActivity) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak > 0) {
      break;
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  return streak;
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Reading shelf API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
