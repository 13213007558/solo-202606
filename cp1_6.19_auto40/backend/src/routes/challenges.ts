import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Challenge } from '../types';

const router = Router();

let challenges: Challenge[] = [
  {
    id: uuidv4(),
    name: '30天读完3本书',
    targetBooks: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    bookIds: [],
    completedBookIds: []
  },
  {
    id: uuidv4(),
    name: '挑战1000页',
    targetBooks: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    bookIds: [],
    completedBookIds: []
  },
  {
    id: uuidv4(),
    name: '年度阅读计划',
    targetBooks: 24,
    deadline: '2026-12-31',
    createdAt: new Date().toISOString(),
    bookIds: [],
    completedBookIds: []
  }
];

router.get('/', (_req: Request, res: Response) => {
  res.json(challenges);
});

router.get('/:id', (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }
  res.json(challenge);
});

router.post('/', (req: Request, res: Response) => {
  const { name, targetBooks, deadline } = req.body;
  
  if (!name || !targetBooks || !deadline) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newChallenge: Challenge = {
    id: uuidv4(),
    name,
    targetBooks: parseInt(targetBooks),
    deadline,
    createdAt: new Date().toISOString(),
    bookIds: [],
    completedBookIds: []
  };

  challenges.push(newChallenge);
  res.status(201).json(newChallenge);
});

router.put('/:id', (req: Request, res: Response) => {
  const challengeIndex = challenges.findIndex(c => c.id === req.params.id);
  if (challengeIndex === -1) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  challenges[challengeIndex] = {
    ...challenges[challengeIndex],
    ...req.body
  };

  res.json(challenges[challengeIndex]);
});

router.post('/:id/books', (req: Request, res: Response) => {
  const { bookId } = req.body;
  const challengeIndex = challenges.findIndex(c => c.id === req.params.id);
  
  if (challengeIndex === -1) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  if (!challenges[challengeIndex].bookIds.includes(bookId)) {
    challenges[challengeIndex].bookIds.push(bookId);
  }

  res.json(challenges[challengeIndex]);
});

router.post('/:id/complete', (req: Request, res: Response) => {
  const { bookId } = req.body;
  const challengeIndex = challenges.findIndex(c => c.id === req.params.id);
  
  if (challengeIndex === -1) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  const challenge = challenges[challengeIndex];
  
  if (!challenge.bookIds.includes(bookId)) {
    challenge.bookIds.push(bookId);
  }
  
  if (!challenge.completedBookIds.includes(bookId)) {
    challenge.completedBookIds.push(bookId);
  }

  res.json(challenge);
});

router.delete('/:id', (req: Request, res: Response) => {
  const challengeIndex = challenges.findIndex(c => c.id === req.params.id);
  if (challengeIndex === -1) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  challenges.splice(challengeIndex, 1);
  res.json({ message: 'Challenge deleted successfully' });
});

export { router as challengesRouter };
