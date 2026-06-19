import { Router, Request, Response } from 'express';
import { users, recipes, trophies, generateId } from '../data';
import type { User } from '../types';

const router = Router();

interface RegisterBody {
  username: string;
  password: string;
}

interface LoginBody {
  username: string;
  password: string;
}

router.post('/register', (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ error: '用户名已被占用' });
  }

  const newUser: User = {
    id: generateId(),
    username,
    password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    bio: '这个人很懒，还没有填写简介~',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const { password: _p, ...safe } = newUser;
  res.status(201).json(safe);
});

router.post('/login', (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const { password: _p, ...safe } = user;
  res.status(200).json(safe);
});

router.get('/:id', (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  const { password: _p, ...safe } = user;
  res.status(200).json(safe);
});

router.get('/:id/recipes', (req: Request, res: Response) => {
  const userId = req.params.id;
  const userRecipes = recipes
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.status(200).json(userRecipes);
});

router.get('/:id/trophies', (req: Request, res: Response) => {
  const userId = req.params.id;
  const userTrophies = trophies
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime());
  res.status(200).json(userTrophies);
});

export default router;
