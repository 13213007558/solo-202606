import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Challenge } from '../types';
import { mockChallenges } from '../data/mockData';

const router = Router();

let challenges: Challenge[] = [...mockChallenges];

router.get('/', (_req: Request, res: Response) => {
  res.json(challenges);
});

router.get('/:id', (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  res.json(challenge);
});

router.post('/', (req: Request, res: Response) => {
  const { name, targetBooks, deadline, bookIds } = req.body;

  if (!name || !targetBooks || !deadline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newChallenge: Challenge = {
    id: uuidv4(),
    name,
    targetBooks: parseInt(targetBooks),
    deadline,
    bookIds: bookIds || [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  challenges.push(newChallenge);
  res.status(201).json(newChallenge);
});

router.put('/:id', (req: Request, res: Response) => {
  const index = challenges.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { name, targetBooks, deadline, bookIds } = req.body;

  challenges[index] = {
    ...challenges[index],
    name: name || challenges[index].name,
    targetBooks: targetBooks !== undefined ? parseInt(targetBooks) : challenges[index].targetBooks,
    deadline: deadline || challenges[index].deadline,
    bookIds: bookIds !== undefined ? bookIds : challenges[index].bookIds
  };

  res.json(challenges[index]);
});

router.post('/:id/add-book', (req: Request, res: Response) => {
  const { bookId } = req.body;
  const challenge = challenges.find(c => c.id === req.params.id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  if (!bookId) {
    return res.status(400).json({ error: 'Book ID is required' });
  }

  if (!challenge.bookIds.includes(bookId)) {
    challenge.bookIds.push(bookId);
  }

  res.json(challenge);
});

router.delete('/:id', (req: Request, res: Response) => {
  const index = challenges.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  challenges.splice(index, 1);
  res.json({ message: 'Challenge deleted successfully' });
});

export default router;
