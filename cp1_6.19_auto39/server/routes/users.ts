import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, recipes, trophies } from '../data';
import type { User } from '../types';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({ error: '用户名已存在' });
  }

  const newUser: User = {
    id: uuidv4(),
    username,
    password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: '这个人很懒，什么都没写~',
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

router.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

router.get('/:id/recipes', (req: Request, res: Response) => {
  const userRecipes = recipes.filter(r => r.userId === req.params.id);
  res.json(userRecipes);
});

router.get('/:id/trophies', (req: Request, res: Response) => {
  const userTrophies = trophies
    .filter(t => t.userId === req.params.id)
    .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime());
  res.json(userTrophies);
});

export default router;
