import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Book, ReadingStatus } from '../types';
import { mockBooks } from '../data/mockData';

const router = Router();

let books: Book[] = [...mockBooks];

router.get('/', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let filteredBooks = [...books];

  if (status && status !== 'all') {
    filteredBooks = filteredBooks.filter(book => book.status === status);
  }

  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    filteredBooks = filteredBooks.filter(
      book => book.title.toLowerCase().includes(searchLower) ||
              book.author.toLowerCase().includes(searchLower)
    );
  }

  res.json(filteredBooks);
});

router.get('/:id', (req: Request, res: Response) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

router.post('/', (req: Request, res: Response) => {
  const { title, author, coverUrl, totalPages, status, startDate, endDate, rating } = req.body;

  if (!title || !author || !totalPages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newBook: Book = {
    id: uuidv4(),
    title,
    author,
    coverUrl: coverUrl || '',
    totalPages: parseInt(totalPages),
    status: (status as ReadingStatus) || 'unread',
    startDate,
    endDate,
    rating: rating ? parseInt(rating) : undefined
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

router.put('/:id', (req: Request, res: Response) => {
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author, coverUrl, totalPages, status, startDate, endDate, rating } = req.body;

  books[index] = {
    ...books[index],
    title: title || books[index].title,
    author: author || books[index].author,
    coverUrl: coverUrl !== undefined ? coverUrl : books[index].coverUrl,
    totalPages: totalPages !== undefined ? parseInt(totalPages) : books[index].totalPages,
    status: (status as ReadingStatus) || books[index].status,
    startDate: startDate !== undefined ? startDate : books[index].startDate,
    endDate: endDate !== undefined ? endDate : books[index].endDate,
    rating: rating !== undefined ? parseInt(rating) : books[index].rating
  };

  res.json(books[index]);
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { status, startDate, endDate } = req.body;
  const validStatuses: ReadingStatus[] = ['unread', 'reading', 'read'];

  if (!status || !validStatuses.includes(status as ReadingStatus)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: unread, reading, read' });
  }

  const newStatus = status as ReadingStatus;
  const today = new Date().toISOString().split('T')[0];

  let updatedStartDate = startDate;
  let updatedEndDate = endDate;

  if (newStatus === 'reading' && !books[index].startDate && !updatedStartDate) {
    updatedStartDate = today;
  }

  if (newStatus === 'unread') {
    updatedStartDate = undefined;
    updatedEndDate = undefined;
  }

  if (newStatus === 'read') {
    if (!books[index].startDate && !updatedStartDate) {
      updatedStartDate = today;
    } else if (!updatedStartDate) {
      updatedStartDate = books[index].startDate;
    }
    if (!updatedEndDate) {
      updatedEndDate = today;
    }
  }

  books[index] = {
    ...books[index],
    status: newStatus,
    startDate: updatedStartDate !== undefined ? updatedStartDate : (newStatus === 'unread' ? undefined : books[index].startDate),
    endDate: updatedEndDate !== undefined ? updatedEndDate : (newStatus === 'read' ? updatedEndDate : undefined)
  };

  res.json({
    message: 'Status updated successfully',
    book: books[index]
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books.splice(index, 1);
  res.json({ message: 'Book deleted successfully' });
});

export default router;
