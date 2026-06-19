import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, recipes, trophies } from '../data.js';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: '请填写用户名、邮箱和密码' });
  if (users.some(u => u.email === email)) return res.status(400).json({ error: '该邮箱已被注册' });
  if (users.some(u => u.username === username)) return res.status(400).json({ error: '该用户名已被使用' });
  const newUser = { id: uuidv4(), username, email, password, avatar: '👤', bio: '这个人很懒，还没有写简介~', createdAt: new Date().toISOString() };
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: '请填写邮箱和密码' });
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: '邮箱或密码错误' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

router.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

router.get('/:id/recipes', (req: Request, res: Response) => {
  const userRecipes = recipes.filter(r => r.authorId === req.params.id);
  userRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userRecipes);
});

router.get('/:id/trophies', (req: Request, res: Response) => {
  const userTrophies = trophies
    .filter(t => t.userId === req.params.id)
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  res.json(userTrophies);
});

export default router;
