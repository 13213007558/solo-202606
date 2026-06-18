import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  initDb,
  createUser,
  getUserByUsername,
  getGoalsByUserId,
  createGoal,
  getSkillNodesByGoalId,
  createSkillNode,
  updateSkillNodePosition,
  getSkillNodeById,
  createDailyLog,
  getDailyLogsByUserId,
  getStats,
} from './database.js';

initDb();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }
  const existing = getUserByUsername(username);
  if (existing) {
    res.status(409).json({ error: '用户名已存在' });
    return;
  }
  const user = createUser(username, password);
  if (!user) {
    res.status(500).json({ error: '注册失败' });
    return;
  }
  res.json({ userId: user.id, username: user.username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }
  const user = getUserByUsername(username);
  if (!user || user.password !== password) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }
  res.json({ userId: user.id, username: user.username });
});

app.get('/api/goals', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: '缺少userId' });
    return;
  }
  const goals = getGoalsByUserId(userId);
  res.json({ goals });
});

app.post('/api/goals', (req, res) => {
  const { userId, title } = req.body;
  if (!userId || !title) {
    res.status(400).json({ error: '缺少参数' });
    return;
  }
  const goal = createGoal(userId, title);
  res.json(goal);
});

app.get('/api/tree', (req, res) => {
  const goalId = req.query.goalId as string;
  if (!goalId) {
    res.status(400).json({ error: '缺少goalId' });
    return;
  }
  const nodes = getSkillNodesByGoalId(goalId);
  res.json({ nodes });
});

app.post('/api/tree', (req, res) => {
  const { goalId, title, parentId, x, y } = req.body;
  if (!goalId || !title) {
    res.status(400).json({ error: '缺少参数' });
    return;
  }
  const node = createSkillNode(goalId, title, parentId || null, x ?? 200, y ?? 200);
  res.json(node);
});

app.put('/api/tree/:id', (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const existing = getSkillNodeById(id);
  if (!existing) {
    res.status(404).json({ error: '节点不存在' });
    return;
  }
  updateSkillNodePosition(id, x ?? existing.x, y ?? existing.y);
  const updated = getSkillNodeById(id);
  res.json(updated);
});

app.post('/api/logs', (req, res) => {
  const { userId, date, nodeIds, durationMinutes, notes } = req.body;
  if (!userId || !date || !nodeIds || !durationMinutes) {
    res.status(400).json({ error: '缺少参数' });
    return;
  }
  const log = createDailyLog(userId, date, nodeIds, durationMinutes, notes || '');
  const goalId = req.query.goalId as string;
  const nodes = goalId ? getSkillNodesByGoalId(goalId) : [];
  const stats = getStats(userId);
  res.json({ log, nodes, stats });
});

app.get('/api/logs', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: '缺少userId' });
    return;
  }
  const logs = getDailyLogsByUserId(userId);
  res.json({ logs });
});

app.get('/api/stats', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: '缺少userId' });
    return;
  }
  const stats = getStats(userId);
  res.json(stats);
});

io.on('connection', (socket) => {
  socket.on('node:move', (data: { nodeId: string; x: number; y: number }) => {
    const { nodeId, x, y } = data;
    updateSkillNodePosition(nodeId, x, y);
    socket.broadcast.emit('node:moved', data);
  });

  socket.on('disconnect', () => {});
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
