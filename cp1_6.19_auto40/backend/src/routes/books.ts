import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Book, ReadingStatus } from '../types';

const router = Router();

let books: Book[] = [
  {
    id: uuidv4(),
    title: '三体',
    author: '刘慈欣',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sci-fi%20book%20cover%20three%20body%20problem%20space&image_size=square',
    totalPages: 302,
    status: 'finished',
    startDate: '2025-01-15',
    endDate: '2025-02-10',
    rating: 5,
    currentPage: 302
  },
  {
    id: uuidv4(),
    title: '活着',
    author: '余华',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=literary%20book%20cover%20to%20live%20chinese%20countryside&image_size=square',
    totalPages: 191,
    status: 'reading',
    startDate: '2025-06-01',
    currentPage: 120
  },
  {
    id: uuidv4(),
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20realism%20book%20cover%20one%20hundred%20years%20of%20solitude&image_size=square',
    totalPages: 360,
    status: 'unread',
    currentPage: 0
  },
  {
    id: uuidv4(),
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=history%20book%20cover%20sapiens%20human%20evolution&image_size=square',
    totalPages: 440,
    status: 'finished',
    startDate: '2025-03-01',
    endDate: '2025-04-15',
    rating: 4,
    currentPage: 440
  },
  {
    id: uuidv4(),
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=the%20little%20prince%20book%20cover%20stars%20planet&image_size=square',
    totalPages: 96,
    status: 'finished',
    startDate: '2025-05-01',
    endDate: '2025-05-05',
    rating: 5,
    currentPage: 96
  },
  {
    id: uuidv4(),
    title: '原则',
    author: '瑞·达利欧',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20book%20cover%20principles%20leadership&image_size=square',
    totalPages: 560,
    status: 'unread',
    currentPage: 0
  },
  {
    id: uuidv4(),
    title: '被讨厌的勇气',
    author: '岸见一郎',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=philosophy%20book%20cover%20courage%20to%20be%20disliked&image_size=square',
    totalPages: 288,
    status: 'reading',
    startDate: '2025-06-10',
    currentPage: 150
  },
  {
    id: uuidv4(),
    title: '围城',
    author: '钱钟书',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20literature%20book%20cover%20fortress%20besieged&image_size=square',
    totalPages: 359,
    status: 'finished',
    startDate: '2025-02-15',
    endDate: '2025-03-20',
    rating: 4,
    currentPage: 359
  }
];

router.get('/', (_req: Request, res: Response) => {
  res.json(books);
});

router.get('/:id', (req: Request, res: Response) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book);
});

router.post('/', (req: Request, res: Response) => {
  const { title, author, coverUrl, totalPages, status, startDate, endDate, rating } = req.body;
  
  if (!title || !author || !totalPages) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newBook: Book = {
    id: uuidv4(),
    title,
    author,
    coverUrl: coverUrl || '',
    totalPages: parseInt(totalPages),
    status: (status as ReadingStatus) || 'unread',
    currentPage: 0,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(rating && { rating: parseInt(rating) })
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

router.put('/:id', (req: Request, res: Response) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const updatedBook: Book = {
    ...books[bookIndex],
    ...req.body
  };

  books[bookIndex] = updatedBook;
  res.json(updatedBook);
});

router.delete('/:id', (req: Request, res: Response) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  books.splice(bookIndex, 1);
  res.json({ message: 'Book deleted successfully' });
});

export { router as booksRouter, books };
