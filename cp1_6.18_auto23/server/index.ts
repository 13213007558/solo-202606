import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

const DATA_DIR = path.join(__dirname, 'data');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

app.use(cors());
app.use(express.json());

interface User {
  id: string;
  username: string;
  password: string;
  theme?: string;
  createdAt: string;
}

interface Work {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  content: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  workId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

function readJSON<T>(filePath: string): T[] {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch {
    return [];
  }
}


function writeJSON<T>(filePath: string, data: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '未授权' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch {
    res.status(401).json({ message: '无效的 token' });
  }
}

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: '用户名和密码必填' });
    return;
  }
  const users = readJSON<User>(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user) {
    res.status(401).json({ message: '用户名或密码错误' });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: '用户名或密码错误' });
    return;
  }
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, username: user.username, theme: user.theme }
  });
});
app.get('/api/works', (_req: Request, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const sorted = works.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

app.post('/api/works', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { title, description, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ message: '标题和内容必填' });
    return;
  }
  const works = readJSON<Work>(WORKS_FILE);
  const now = new Date().toISOString();
  const newWork: Work = {
    id: generateId(),
    userId: req.userId!,
    username: req.username!,
    title,
    description: description || '',
    content,
    likes: [],
    createdAt: now,
    updatedAt: now
  };
  works.push(newWork);
  writeJSON(WORKS_FILE, works);
  res.status(201).json(newWork);
});
app.get('/api/works/:id', (req: Request, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const work = works.find(w => w.id === req.params.id);
  if (!work) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  res.json(work);
});
app.put('/api/works/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const index = works.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  if (works[index].userId !== req.userId) {
    res.status(403).json({ message: '无权修改此作品' });
    return;
  }
  const { title, description, content } = req.body;
  works[index] = {
    ...works[index],
    title: title || works[index].title,
    description: description !== undefined ? description : works[index].description,
    content: content || works[index].content,
    updatedAt: new Date().toISOString()
  };
  writeJSON(WORKS_FILE, works);
  res.json(works[index]);
});
app.delete('/api/works/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const index = works.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  if (works[index].userId !== req.userId) {
    res.status(403).json({ message: '无权删除此作品' });
    return;
  }
  works.splice(index, 1);
  writeJSON(WORKS_FILE, works);
  const comments = readJSON<Comment>(COMMENTS_FILE);
  const filteredComments = comments.filter(c => c.workId !== req.params.id);
  writeJSON(COMMENTS_FILE, filteredComments);
  res.json({ message: '删除成功' });
});
app.post('/api/works/:id/like', authMiddleware, (req: AuthRequest, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const index = works.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  if (!works[index].likes.includes(req.userId!)) {
    works[index].likes.push(req.userId!);
    writeJSON(WORKS_FILE, works);
  }
  res.json({ likes: works[index].likes.length, liked: true });
});
app.delete('/api/works/:id/like', authMiddleware, (req: AuthRequest, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const index = works.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  works[index].likes = works[index].likes.filter(id => id !== req.userId);
  writeJSON(WORKS_FILE, works);
  res.json({ likes: works[index].likes.length, liked: false });
});
app.get('/api/works/:id/comments', (req: Request, res: Response): void => {
  const comments = readJSON<Comment>(COMMENTS_FILE);
  const workComments = comments
    .filter(c => c.workId === req.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(workComments);
});
app.post('/api/works/:id/comments', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ message: '评论内容必填' });
    return;
  }
  const works = readJSON<Work>(WORKS_FILE);
  if (!works.find(w => w.id === req.params.id)) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  const comments = readJSON<Comment>(COMMENTS_FILE);
  const newComment: Comment = {
    id: generateId(),
    workId: req.params.id,
    userId: req.userId!,
    username: req.username!,
    content,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  writeJSON(COMMENTS_FILE, comments);
  res.status(201).json(newComment);
});
app.get('/api/user/theme', authMiddleware, (req: AuthRequest, res: Response): void => {
  const users = readJSON<User>(USERS_FILE);
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    res.status(404).json({ message: '用户不存在' });
    return;
  }
  res.json({ theme: user.theme || 'light' });
});

app.post('/api/user/theme', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { theme } = req.body;
  if (!theme) {
    res.status(400).json({ message: '主题必填' });
    return;
  }
  const users = readJSON<User>(USERS_FILE);
  const index = users.findIndex(u => u.id === req.userId);
  if (index === -1) {
    res.status(404).json({ message: '用户不存在' });
    return;
  }
  users[index].theme = theme;
  writeJSON(USERS_FILE, users);
  res.json({ theme });
});
app.get('/api/user/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  const works = readJSON<Work>(WORKS_FILE);
  const comments = readJSON<Comment>(COMMENTS_FILE);
  const userWorks = works.filter(w => w.userId === req.userId);
  const totalLikes = userWorks.reduce((sum, w) => sum + w.likes.length, 0);
  const userComments = comments.filter(c => c.userId === req.userId);
  res.json({
    worksCount: userWorks.length,
    totalLikes,
    commentsCount: userComments.length
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
