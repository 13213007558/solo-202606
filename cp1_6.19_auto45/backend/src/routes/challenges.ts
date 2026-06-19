import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

interface Challenge {
  id: string;
  name: string;
  targetBooks: number;
  deadline: string;
  bookIds: string[];
  isPreset: boolean;
}

const challenges: Challenge[] = [
  {
    id: uuidv4(),
    name: "30天3本书",
    targetBooks: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    bookIds: [],
    isPreset: true
  },
  {
    id: uuidv4(),
    name: "挑战1000页",
    targetBooks: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    bookIds: [],
    isPreset: true
  },
  {
    id: uuidv4(),
    name: "年度50本",
    targetBooks: 50,
    deadline: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
    bookIds: [],
    isPreset: true
  }
];

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(challenges);
});

router.get("/:id", (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  res.json(challenge);
});

router.post("/", (req: Request, res: Response) => {
  const { name, targetBooks, deadline } = req.body;
  
  if (!name || !targetBooks || !deadline) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newChallenge: Challenge = {
    id: uuidv4(),
    name,
    targetBooks,
    deadline,
    bookIds: [],
    isPreset: false
  };

  challenges.push(newChallenge);
  res.status(201).json(newChallenge);
});

router.post("/:id/books", (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const { bookId } = req.body;
  if (!bookId) {
    res.status(400).json({ error: "Missing bookId" });
    return;
  }

  if (challenge.bookIds.includes(bookId)) {
    res.status(400).json({ error: "Book already in challenge" });
    return;
  }

  challenge.bookIds.push(bookId);
  res.json(challenge);
});

router.delete("/:id/books/:bookId", (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const bookIndex = challenge.bookIds.indexOf(req.params.bookId);
  if (bookIndex === -1) {
    res.status(404).json({ error: "Book not found in challenge" });
    return;
  }

  challenge.bookIds.splice(bookIndex, 1);
  res.json(challenge);
});

router.delete("/:id", (req: Request, res: Response) => {
  const challengeIndex = challenges.findIndex(c => c.id === req.params.id);
  if (challengeIndex === -1) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const deletedChallenge = challenges.splice(challengeIndex, 1)[0];
  res.json(deletedChallenge);
});

export default router;
export { challenges, Challenge };
