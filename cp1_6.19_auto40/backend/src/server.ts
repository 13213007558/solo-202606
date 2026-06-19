import express, { Request, Response } from 'express';
import cors from 'cors';
import { booksRouter, books } from './routes/books';
import { challengesRouter } from './routes/challenges';
import { UserStats, Book } from './types';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/challenges', challengesRouter);

app.get('/api/stats', (_req: Request, res: Response) => {
  const currentYear = new Date().getFullYear();
  const finishedBooks = books.filter(b => b.status === 'finished');
  
  const booksThisYear = finishedBooks.filter(b => {
    if (!b.endDate) return false;
    return new Date(b.endDate).getFullYear() === currentYear;
  });

  const totalPages = booksThisYear.reduce((sum, book) => sum + book.totalPages, 0);
  
  const ratedBooks = booksThisYear.filter(b => b.rating !== undefined);
  const averageRating = ratedBooks.length > 0
    ? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length
    : 0;

  const monthlyBooks: { [key: string]: Book[] } = {};
  booksThisYear.forEach(book => {
    if (book.endDate) {
      const month = new Date(book.endDate).toISOString().slice(0, 7);
      if (!monthlyBooks[month]) {
        monthlyBooks[month] = [];
      }
      monthlyBooks[month].push(book);
    }
  });

  let streakDays = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedEndDates = finishedBooks
    .filter(b => b.endDate)
    .map(b => new Date(b.endDate!))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedEndDates.length > 0) {
    let checkDate = new Date(today);
    while (true) {
      const found = sortedEndDates.some(d => {
        const dNormalized = new Date(d);
        dNormalized.setHours(0, 0, 0, 0);
        return dNormalized.getTime() === checkDate.getTime();
      });
      
      if (found || streakDays === 0) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      
      if (streakDays > 365) break;
    }
  }

  const stats: UserStats = {
    booksThisYear: booksThisYear.length,
    totalPages,
    averageRating: Math.round(averageRating * 10) / 10,
    streakDays,
    monthlyBooks
  };

  res.json(stats);
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
