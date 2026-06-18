const fs = require('fs');

const filePath = '/Users/guo/Documents/solo/demo-Solo/tasks/auto27/backend/src/server/index.ts';

const content = `import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import {
  registerUser,
  loginUser,
  getGoalByUserId,
  getSkillNodesByGoalId,
  updateSkillNodePosition,
  addSkillNode,
  addDailyLog,
  getUserStats,
  getUpdatedProgressForNodes,
  User,
  Goal,
  SkillNode,
  DailyLog,
  Stats,
} from './database.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

let currentUserId: string | null = null;

app.post('/api/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user: User = registerUser(username, password);
    currentUserId = user.id;
    res.json({ user, message: '注册成功' });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user: User | null = loginUser(username, password);
  if (user) {
    currentUserId = user.id;
    res.json({ user, message: '登录成功' });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

app.get('/api/tree', (req: Request, res: Response) => {
  if (!currentUserId) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const goal: Goal | null = getGoalByUserId(currentUserId);
  if (!goal) {
    res.json({ goal: null, nodes: [] });
    return;
  }
  const nodes: SkillNode[] = getSkillNodesByGoalId(goal.id);
  res.json({ goal, nodes });
});

app.post('/api/tree/nodes', (req: Request, res: Response) => {
  if (!currentUserId) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const { title, description, x, y, parent_id } = req.body;
  const goal: Goal | null = getGoalByUserId(currentUserId);
  if (!goal) {
    res.status(400).json({ error: '用户没有目标' });
    return;
  }
  const newNode: SkillNode = addSkillNode(goal.id, title, description, x, y, parent_id || null);
  io.emit('node:added', newNode);
  res.json(newNode);
});

app.post('/api/logs', (req: Request, res: Response) => {
  if (!currentUserId) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const { skill_node_ids, duration, notes } = req.body;
  const log: DailyLog = addDailyLog(currentUserId, skill_node_ids, duration, notes);
  const updatedProgress = getUpdatedProgressForNodes(skill_node_ids);
  io.emit('progress:updated', updatedProgress);
  res.json(log);
});

app.get('/api/stats', (req: Request, res: Response) => {
  if (!currentUserId) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const stats: Stats = getUserStats(currentUserId);
  res.json(stats);
});

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);

  socket.on('node:drag', (data: { nodeId: string; x: number; y: number }) => {
    const { nodeId, x, y } = data;
    updateSkillNodePosition(nodeId, x, y);
    socket.broadcast.emit('node:moved', { nodeId, x, y });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

fs.writeFileSync(filePath, content, 'utf-8');
console.log('File written successfully:', filePath);
