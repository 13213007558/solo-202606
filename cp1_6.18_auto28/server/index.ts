import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface User {
  id: string;
  username: string;
  passwordHash: string;
  theme: string;
  stats: {
    totalWorks: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
    dailyLikes: { date: string; count: number }[];
  };
  createdAt: string;
}

interface Work {
  id: string;
  userId: string;
  title: string;
  lyricist: string;
  composer: string;
  lyrics: string;
  audioUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  workId: string;
  userId: string;
  username: string;
  content: string;
  parentId: string | null;
  createdAt: string;
}

interface Performance {
  id: string;
  workId: string;
  title: string;
  date: string;
  location: string;
  ticketUrl: string;
  createdAt: string;
}

interface LikeRecord {
  id: string;
  workId: string;
  userId: string;
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

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

const usersFile = path.join(dataDir, 'users.json');
const worksFile = path.join(dataDir, 'works.json');
const commentsFile = path.join(dataDir, 'comments.json');
const performancesFile = path.join(dataDir, 'performances.json');
const likesFile = path.join(dataDir, 'likes.json');

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  const users = readJSON<User>(usersFile);
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  const newUser: User = {
    id: uuidv4(),
    username,
    passwordHash: simpleHash(password),
    theme: 'night-purple',
    stats: {
      totalWorks: 0,
      totalLikes: 0,
      totalComments: 0,
      followers: Math.floor(Math.random() * 50),
      dailyLikes: [],
    },
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  writeJSON(usersFile, users);
  
  const { passwordHash: _hash, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  const users = readJSON<User>(usersFile);
  const user = users.find(u => u.username === username && u.passwordHash === simpleHash(password));
  
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  const { passwordHash: _hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const users = readJSON<User>(usersFile);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const { passwordHash: _hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id/theme', (req: Request, res: Response) => {
  const { id } = req.params;
  const { theme } = req.body;
  
  if (!theme) {
    return res.status(400).json({ error: '主题不能为空' });
  }
  
  const users = readJSON<User>(usersFile);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  users[userIndex].theme = theme;
  writeJSON(usersFile, users);
  
  const { passwordHash: _hash, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

app.get('/api/users/:id/stats', (req: Request, res: Response) => {
  const { id } = req.params;
  const users = readJSON<User>(usersFile);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const works = readJSON<Work>(worksFile).filter(w => w.userId === id && w.status === 'published');
  const comments = readJSON<Comment>(commentsFile).filter(c => {
    const work = works.find(w => w.id === c.workId);
    return work !== undefined;
  });
  const totalLikes = works.reduce((sum, w) => sum + w.likes, 0);
  
  const today = new Date();
  const dailyLikes = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyLikes.push({
      date: dateStr,
      count: Math.floor(Math.random() * 20) + 5,
    });
  }
  
  res.json({
    totalWorks: works.length,
    totalLikes,
    totalComments: comments.length,
    followers: user.stats.followers,
    dailyLikes,
  });
});

app.get('/api/works', (req: Request, res: Response) => {
  const { userId, status, tag, sortBy, page = '1', limit = '8' } = req.query;
  
  let works = readJSON<Work>(worksFile);
  
  if (userId) {
    works = works.filter(w => w.userId === userId);
  }
  
  if (status) {
    works = works.filter(w => w.status === status);
  }
  
  if (tag) {
    works = works.filter(w => w.tags.includes(tag as string));
  }
  
  if (sortBy === 'newest') {
    works.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'popular') {
    works.sort((a, b) => b.likes - a.likes);
  }
  
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const start = (pageNum - 1) * limitNum;
  const paginatedWorks = works.slice(start, start + limitNum);
  
  res.json({
    works: paginatedWorks,
    total: works.length,
    hasMore: start + limitNum < works.length,
  });
});

app.get('/api/works/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const works = readJSON<Work>(worksFile);
  const work = works.find(w => w.id === id);
  
  if (!work) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  res.json(work);
});

app.post('/api/works', (req: Request, res: Response) => {
  const { userId, title, lyricist, composer, lyrics, audioUrl, tags, status } = req.body;
  
  if (!userId || !title) {
    return res.status(400).json({ error: '用户ID和标题不能为空' });
  }
  
  const works = readJSON<Work>(worksFile);
  
  const newWork: Work = {
    id: uuidv4(),
    userId,
    title,
    lyricist: lyricist || '',
    composer: composer || '',
    lyrics: lyrics || '',
    audioUrl: audioUrl || '',
    tags: tags || [],
    status: status || 'draft',
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  works.push(newWork);
  writeJSON(worksFile, works);
  
  res.status(201).json(newWork);
});

app.put('/api/works/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, lyricist, composer, lyrics, audioUrl, tags, status } = req.body;
  
  const works = readJSON<Work>(worksFile);
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  works[workIndex] = {
    ...works[workIndex],
    title: title !== undefined ? title : works[workIndex].title,
    lyricist: lyricist !== undefined ? lyricist : works[workIndex].lyricist,
    composer: composer !== undefined ? composer : works[workIndex].composer,
    lyrics: lyrics !== undefined ? lyrics : works[workIndex].lyrics,
    audioUrl: audioUrl !== undefined ? audioUrl : works[workIndex].audioUrl,
    tags: tags !== undefined ? tags : works[workIndex].tags,
    status: status !== undefined ? status : works[workIndex].status,
    updatedAt: new Date().toISOString(),
  };
  
  writeJSON(worksFile, works);
  res.json(works[workIndex]);
});

app.delete('/api/works/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const works = readJSON<Work>(worksFile);
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  works.splice(workIndex, 1);
  writeJSON(worksFile, works);
  
  res.json({ success: true });
});

app.post('/api/works/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '用户ID不能为空' });
  }
  
  const works = readJSON<Work>(worksFile);
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  const likes = readJSON<LikeRecord>(likesFile);
  const existingLike = likes.find(l => l.workId === id && l.userId === userId);
  
  let liked: boolean;
  
  if (existingLike) {
    const likeIndex = likes.findIndex(l => l.id === existingLike.id);
    likes.splice(likeIndex, 1);
    works[workIndex].likes = Math.max(0, works[workIndex].likes - 1);
    liked = false;
  } else {
    likes.push({
      id: uuidv4(),
      workId: id,
      userId,
      createdAt: new Date().toISOString(),
    });
    works[workIndex].likes += 1;
    liked = true;
  }
  
  writeJSON(worksFile, works);
  writeJSON(likesFile, likes);
  
  res.json({ likes: works[workIndex].likes, liked });
});

app.get('/api/works/:id/liked', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '用户ID不能为空' });
  }
  
  const likes = readJSON<LikeRecord>(likesFile);
  const liked = likes.some(l => l.workId === id && l.userId === userId);
  
  res.json({ liked });
});

app.get('/api/works/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const comments = readJSON<Comment>(commentsFile)
    .filter(c => c.workId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(comments);
});

app.post('/api/works/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, username, content, parentId } = req.body;
  
  if (!userId || !username || !content) {
    return res.status(400).json({ error: '用户ID、用户名和评论内容不能为空' });
  }
  
  const comments = readJSON<Comment>(commentsFile);
  
  const newComment: Comment = {
    id: uuidv4(),
    workId: id,
    userId,
    username,
    content,
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
  };
  
  comments.push(newComment);
  writeJSON(commentsFile, comments);
  
  res.status(201).json(newComment);
});

app.get('/api/works/:id/performances', (req: Request, res: Response) => {
  const { id } = req.params;
  const performances = readJSON<Performance>(performancesFile)
    .filter(p => p.workId === id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  res.json(performances);
});

app.post('/api/works/:id/performances', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, date, location, ticketUrl } = req.body;
  
  if (!title || !date) {
    return res.status(400).json({ error: '演出标题和日期不能为空' });
  }
  
  const performances = readJSON<Performance>(performancesFile);
  
  const newPerformance: Performance = {
    id: uuidv4(),
    workId: id,
    title,
    date,
    location: location || '',
    ticketUrl: ticketUrl || '',
    createdAt: new Date().toISOString(),
  };
  
  performances.push(newPerformance);
  writeJSON(performancesFile, performances);
  
  res.status(201).json(newPerformance);
});

app.delete('/api/performances/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const performances = readJSON<Performance>(performancesFile);
  const perfIndex = performances.findIndex(p => p.id === id);
  
  if (perfIndex === -1) {
    return res.status(404).json({ error: '演出不存在' });
  }
  
  performances.splice(perfIndex, 1);
  writeJSON(performancesFile, performances);
  
  res.json({ success: true });
});

app.get('/api/performances', (req: Request, res: Response) => {
  const { userId } = req.query;
  
  let performances = readJSON<Performance>(performancesFile);
  
  if (userId) {
    const works = readJSON<Work>(worksFile).filter(w => w.userId === userId);
    const workIds = works.map(w => w.id);
    performances = performances.filter(p => workIds.includes(p.workId));
  }
  
  performances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  res.json(performances);
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
