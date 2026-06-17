import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type Priority = 'urgent' | 'high' | 'medium' | 'low';
type ReviewStatus = 'pending' | 'approved' | 'changes_requested';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
}

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface Review {
  id: string;
  taskId: string;
  authorId: string;
  status: ReviewStatus;
  description: string;
  files: ReviewFile[];
  createdAt: string;
  updatedAt: string;
}

interface ReviewFile {
  id: string;
  name: string;
  content: string;
  lineComments: LineComment[];
}

interface LineComment {
  id: string;
  fileId: string;
  line: number;
  content: string;
  userId: string;
  createdAt: string;
  resolved?: boolean;
}

const users = new Map<string, User>();
const tasks = new Map<string, Task>();
const comments = new Map<string, Comment>();
const reviews = new Map<string, Review>();

const user1Id = uuidv4();
const user2Id = uuidv4();
const user3Id = uuidv4();

users.set(user1Id, {
  id: user1Id,
  username: 'alice',
  email: 'alice@example.com',
  password: 'password123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  role: 'developer',
});

users.set(user2Id, {
  id: user2Id,
  username: 'bob',
  email: 'bob@example.com',
  password: 'password123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  role: 'designer',
});

users.set(user3Id, {
  id: user3Id,
  username: 'charlie',
  email: 'charlie@example.com',
  password: 'password123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
  role: 'manager',
});

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

const task1Id = uuidv4();
const task2Id = uuidv4();
const task3Id = uuidv4();
const task4Id = uuidv4();
const task5Id = uuidv4();

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' });
    return;
  }
  const existing = [...users.values()].find(
    (u) => u.username === username || u.email === email
  );
  if (existing) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }
  const id = uuidv4();
  const user: User = { id, username, email, password, role: 'developer' };
  users.set(id, user);
  const { password: _, ...safe } = user;
  res.status(201).json({ user: safe, token: `dummy-token-${id}` });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  const user = [...users.values()].find(
    (u) => u.email === email && u.password === password
  );
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const { password: _, ...safe } = user;
  res.json({ user: safe, token: `dummy-token-${user.id}` });
});

app.get('/api/users', (_req: Request, res: Response) => {
  const safe = [...users.values()].map(({ password: _, ...u }) => u);
  res.json(safe);
});

  const task = tasks.get(taskId);
  if (task) {
    task.status = 'review';
    task.updatedAt = nowIso;
  }
  res.status(201).json(review);
});

app.get('/api/reviews/:id', (req: Request, res: Response) => {
  const review = reviews.get(req.params.id);
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  res.json(review);
});

app.put('/api/reviews/:id/status', (req: Request, res: Response) => {
  const review = reviews.get(req.params.id);
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  const { status } = req.body;
  if (!status || !['approved', 'changes_requested'].includes(status)) {
    res.status(400).json({ error: 'Valid status required (approved, changes_requested)' });
    return;
  }
  review.status = status;
  review.updatedAt = new Date().toISOString();

  const task = tasks.get(review.taskId);
  if (task) {
    task.status = 'review';
    task.updatedAt = new Date().toISOString();
  }

  res.json(review);
});

app.get('/api/stats', (_req: Request, res: Response) => {
  const allTasks = [...tasks.values()];
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === 'done').length;

  const nowDate = new Date();
  const overdue = allTasks.filter(
    (t) =>
      t.status !== 'done' &&
      t.dueDate &&
      new Date(t.dueDate) < nowDate
  ).length;

  const completedTasks = allTasks.filter(
    (t) => t.status === 'done' && t.completedAt && t.createdAt
  );
  const avgCompletionDays =
    completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => {
          const days =
            (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) /
            86400000;
          return sum + days;
        }, 0) / completedTasks.length
      : 0;

  res.json({
    total,
    completed,
    overdue,
    avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
    byUser,
    dailyTrend,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

