import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data');
const usersFile = path.join(dataPath, 'users.json');
const worksFile = path.join(dataPath, 'works.json');

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
    weeklyLikes: number[];
  };
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

interface Performance {
  id: string;
  date: string;
  venue: string;
  ticketUrl: string;
}

interface Work {
  id: string;
  userId: string;
  title: string;
  composer: string;
  lyricist: string;
  lyrics: string;
  audioUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  likes: number;
  likedBy: string[];
  comments: Comment[];
  performances: Performance[];
  createdAt: string;
  updatedAt: string;
}

const readUsers = (): User[] => {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, 'utf-8');
  return JSON.parse(data);
};

const writeUsers = (users: User[]) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const readWorks = (): Work[] => {
  if (!fs.existsSync(worksFile)) return [];
  const data = fs.readFileSync(worksFile, 'utf-8');
  return JSON.parse(data);
};

const writeWorks = (works: Work[]) => {
  fs.writeFileSync(worksFile, JSON.stringify(works, null, 2));
};

const updateUserStats = (userId: string) => {
  const users = readUsers();
  const works = readWorks();
  const userWorks = works.filter(w => w.userId === userId && w.status === 'published');
  
  const totalLikes = userWorks.reduce((sum, w) => sum + w.likes, 0);
  const totalComments = userWorks.reduce((sum, w) => sum + w.comments.length, 0);
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].stats = {
      ...users[userIndex].stats,
      totalWorks: userWorks.length,
      totalLikes,
      totalComments,
    };
    writeUsers(users);
  }
};

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  const users = readUsers();
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const newUser: User = {
    id: uuidv4(),
    username,
    passwordHash,
    theme: 'ocean',
    stats: {
      totalWorks: 0,
      totalLikes: 0,
      totalComments: 0,
      followers: 0,
      weeklyLikes: [0, 0, 0, 0, 0, 0, 0],
    },
  };
  
  users.push(newUser);
  writeUsers(users);
  
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  res.json(userWithoutPassword);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id/theme', (req, res) => {
  const { id } = req.params;
  const { theme } = req.body;
  
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  users[userIndex].theme = theme;
  writeUsers(users);
  
  const { passwordHash: _, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.get('/api/works', (req, res) => {
  const { userId, status, tag, sortBy, page = '1', limit = '8' } = req.query;
  
  let works = readWorks();
  
  if (userId) {
    works = works.filter(w => w.userId === userId);
  }
  
  if (status) {
    works = works.filter(w => w.status === status);
  }
  
  if (tag) {
    works = works.filter(w => w.tags.includes(tag as string));
  }
  
  if (sortBy === 'time') {
    works.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'popular') {
    works.sort((a, b) => b.likes - a.likes);
  }
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  
  const paginatedWorks = works.slice(start, end);
  
  res.json({
    works: paginatedWorks,
    total: works.length,
    hasMore: end < works.length,
  });
});

app.get('/api/works/:id', (req, res) => {
  const { id } = req.params;
  const works = readWorks();
  const work = works.find(w => w.id === id);
  
  if (!work) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  res.json(work);
});

app.post('/api/works', (req, res) => {
  const { userId, title, composer, lyricist, lyrics, audioUrl, tags, status } = req.body;
  
  if (!userId || !title) {
    return res.status(400).json({ error: '用户ID和标题不能为空' });
  }
  
  const works = readWorks();
  const now = new Date().toISOString();
  
  const newWork: Work = {
    id: uuidv4(),
    userId,
    title,
    composer: composer || '',
    lyricist: lyricist || '',
    lyrics: lyrics || '',
    audioUrl: audioUrl || '',
    tags: tags || [],
    status: status || 'draft',
    likes: 0,
    likedBy: [],
    comments: [],
    performances: [],
    createdAt: now,
    updatedAt: now,
  };
  
  works.push(newWork);
  writeWorks(works);
  
  if (newWork.status === 'published') {
    updateUserStats(userId);
  }
  
  res.json(newWork);
});

app.put('/api/works/:id', (req, res) => {
  const { id } = req.params;
  const { title, composer, lyricist, lyrics, audioUrl, tags, status } = req.body;
  
  const works = readWorks();
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  const oldStatus = works[workIndex].status;
  
  works[workIndex] = {
    ...works[workIndex],
    title: title !== undefined ? title : works[workIndex].title,
    composer: composer !== undefined ? composer : works[workIndex].composer,
    lyricist: lyricist !== undefined ? lyricist : works[workIndex].lyricist,
    lyrics: lyrics !== undefined ? lyrics : works[workIndex].lyrics,
    audioUrl: audioUrl !== undefined ? audioUrl : works[workIndex].audioUrl,
    tags: tags !== undefined ? tags : works[workIndex].tags,
    status: status !== undefined ? status : works[workIndex].status,
    updatedAt: new Date().toISOString(),
  };
  
  writeWorks(works);
  
  if (oldStatus !== 'published' && works[workIndex].status === 'published') {
    updateUserStats(works[workIndex].userId);
  }
  
  res.json(works[workIndex]);
});

app.delete('/api/works/:id', (req, res) => {
  const { id } = req.params;
  const works = readWorks();
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  const userId = works[workIndex].userId;
  works.splice(workIndex, 1);
  writeWorks(works);
  
  updateUserStats(userId);
  
  res.json({ message: '删除成功' });
});

app.post('/api/works/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  const works = readWorks();
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  const work = works[workIndex];
  
  if (work.likedBy.includes(userId)) {
    work.likedBy = work.likedBy.filter(uid => uid !== userId);
    work.likes--;
  } else {
    work.likedBy.push(userId);
    work.likes++;
  }
  
  writeWorks(works);
  updateUserStats(work.userId);
  
  res.json({ likes: work.likes, liked: work.likedBy.includes(userId) });
});

app.post('/api/works/:id/comments', (req, res) => {
  const { id } = req.params;
  const { userId, username, content, parentId } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }
  
  const works = readWorks();
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  const newComment: Comment = {
    id: uuidv4(),
    userId,
    username,
    content,
    createdAt: new Date().toISOString(),
    replies: [],
  };
  
  if (parentId) {
    const parentComment = works[workIndex].comments.find(c => c.id === parentId);
    if (parentComment && parentComment.replies.length < 5) {
      parentComment.replies.push(newComment);
    } else {
      return res.status(400).json({ error: '回复层数过多或父评论不存在' });
    }
  } else {
    works[workIndex].comments.unshift(newComment);
  }
  
  writeWorks(works);
  updateUserStats(works[workIndex].userId);
  
  res.json(newComment);
});

app.post('/api/works/:id/performances', (req, res) => {
  const { id } = req.params;
  const { date, venue, ticketUrl } = req.body;
  
  if (!date || !venue) {
    return res.status(400).json({ error: '日期和地点不能为空' });
  }
  
  const works = readWorks();
  const workIndex = works.findIndex(w => w.id === id);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  const newPerformance: Performance = {
    id: uuidv4(),
    date,
    venue,
    ticketUrl: ticketUrl || '',
  };
  
  works[workIndex].performances.push(newPerformance);
  works[workIndex].performances.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  writeWorks(works);
  
  res.json(newPerformance);
});

app.delete('/api/works/:workId/performances/:perfId', (req, res) => {
  const { workId, perfId } = req.params;
  
  const works = readWorks();
  const workIndex = works.findIndex(w => w.id === workId);
  
  if (workIndex === -1) {
    return res.status(404).json({ error: '作品不存在' });
  }
  
  works[workIndex].performances = works[workIndex].performances.filter(
    p => p.id !== perfId
  );
  
  writeWorks(works);
  
  res.json({ message: '删除成功' });
});

app.get('/api/users/:id/performances', (req, res) => {
  const { id } = req.params;
  const works = readWorks();
  const userWorks = works.filter(w => w.userId === id);
  
  const allPerformances: (Performance & { workId: string; workTitle: string })[] = [];
  
  userWorks.forEach(work => {
    work.performances.forEach(perf => {
      allPerformances.push({
        ...perf,
        workId: work.id,
        workTitle: work.title,
      });
    });
  });
  
  allPerformances.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  res.json(allPerformances);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
