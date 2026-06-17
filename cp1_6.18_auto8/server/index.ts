import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware, JWT_SECRET } from './authMiddleware';
import { User, Recipe, Comment, Ingredient, RecipeStep } from './types';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const users = new Map<string, User>();
const recipes = new Map<string, Recipe>();
const comments = new Map<string, Comment>();
const wsClients = new Map<string, WebSocket>();

const avatarUrls = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
];

const mockRecipes: Array<{
  title: string;
  coverUrl: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  totalTime: number;
}> = [
  {
    title: '番茄炒蛋',
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    ingredients: [
      { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '3个' },
      { name: '葱花', amount: '适量' },
      { name: '盐', amount: '少许' },
    ],
    steps: [
      { id: uuidv4(), title: '准备食材', description: '番茄洗净切块，鸡蛋打散备用。', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop' },
      { id: uuidv4(), title: '炒鸡蛋', description: '热锅倒油，倒入蛋液，炒至金黄色盛出。' },
      { id: uuidv4(), title: '炒番茄', description: '锅中再倒少许油，放入番茄翻炒出汁。' },
      { id: uuidv4(), title: '混合翻炒', description: '加入炒好的鸡蛋，加盐调味，撒上葱花即可。', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop' },
    ],
    totalTime: 20,
  },
  {
    title: '红烧肉',
    coverUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '2勺' },
      { name: '老抽', amount: '1勺' },
      { name: '料酒', amount: '1勺' },
    ],
    steps: [
      { id: uuidv4(), title: '处理肉块', description: '五花肉切块，冷水下锅焯水去腥。' },
      { id: uuidv4(), title: '炒糖色', description: '锅中倒油，放入冰糖小火炒出糖色。', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop' },
      { id: uuidv4(), title: '炖煮', description: '加入肉块翻炒上色，加调料和水，小火炖煮1小时。' },
      { id: uuidv4(), title: '收汁', description: '大火收汁，出锅装盘。' },
    ],
    totalTime: 90,
  },
  {
    title: '清蒸鲈鱼',
    coverUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
    ingredients: [
      { name: '鲈鱼', amount: '1条' },
      { name: '葱', amount: '2根' },
      { name: '姜', amount: '3片' },
      { name: '蒸鱼豉油', amount: '2勺' },
    ],
    steps: [
      { id: uuidv4(), title: '准备鱼', description: '鲈鱼处理干净，两面划刀，抹盐腌制。', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop' },
      { id: uuidv4(), title: '蒸制', description: '鱼身放葱姜，水开后蒸8分钟。' },
      { id: uuidv4(), title: '调味', description: '取出倒掉盘中水，淋上蒸鱼豉油，浇上热油即可。' },
    ],
    totalTime: 25,
  },
];

const initMockData = async () => {
  const mockUsers = [
    { username: '美食家小王', email: 'wang@example.com', password: '123456' },
    { username: '厨神小李', email: 'li@example.com', password: '123456' },
  ];

  for (let i = 0; i < mockUsers.length; i++) {
    const hashedPassword = await bcrypt.hash(mockUsers[i].password, 10);
    const userId = uuidv4();
    const user: User = {
      id: userId,
      username: mockUsers[i].username,
      email: mockUsers[i].email,
      password: hashedPassword,
      avatar: avatarUrls[i % avatarUrls.length],
      createdAt: Date.now(),
    };
    users.set(userId, user);

    if (i === 0) {
      mockRecipes.forEach((mockRecipe, idx) => {
        const recipeId = uuidv4();
        const recipe: Recipe = {
          id: recipeId,
          ...mockRecipe,
          authorId: userId,
          authorName: user.username,
          authorAvatar: user.avatar,
          likes: Math.floor(Math.random() * 100),
          likedBy: [],
          rating: 4 + Math.random(),
          ratingCount: Math.floor(Math.random() * 50) + 1,
          createdAt: Date.now() - idx * 86400000,
        };
        recipes.set(recipeId, recipe);

        const sampleComments: Array<Partial<Comment>> = [
          {
            content: '看起来很好吃，下次试试！',
            userId: users.values().next().value?.id || '',
            username: users.values().next().value?.username || '',
            userAvatar: users.values().next().value?.avatar || '',
          },
          {
            content: '步骤很详细，收藏了~',
            userId: users.values().next().value?.id || '',
            username: users.values().next().value?.username || '',
            userAvatar: users.values().next().value?.avatar || '',
          },
        ];

        sampleComments.forEach((c, ci) => {
          const comment: Comment = {
            id: uuidv4(),
            recipeId,
            userId: c.userId!,
            username: c.username!,
            userAvatar: c.userAvatar!,
            content: c.content!,
            parentId: null,
            createdAt: Date.now() - ci * 3600000,
          };
          comments.set(comment.id, comment);
        });
      });
    }
  }
};

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'auth' && message.userId) {
        wsClients.set(message.userId, ws);
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    wsClients.forEach((client, userId) => {
      if (client === ws) {
        wsClients.delete(userId);
      }
    });
  });
});

const sendNotification = (userId: string, payload: object) => {
  const client = wsClients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
};

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    for (const user of users.values()) {
      if (user.email === email) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
      if (user.username === username) {
        return res.status(400).json({ error: '用户名已存在' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const user: User = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrls[Math.floor(Math.random() * avatarUrls.length)],
      createdAt: Date.now(),
    };

    users.set(userId, user);

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    let foundUser: User | undefined;
    for (const user of users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign(
      { userId: foundUser.id, username: foundUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

app.get('/api/recipes', (_req: Request, res: Response) => {
  const recipeList = Array.from(recipes.values()).sort((a, b) => {
    const scoreA = a.likes * 2 + a.rating * 10 + (Date.now() - a.createdAt) / 86400000;
    const scoreB = b.likes * 2 + b.rating * 10 + (Date.now() - b.createdAt) / 86400000;
    return scoreB - scoreA;
  });

  res.json(recipeList);
});

app.get('/api/recipes/:id', (req: Request, res: Response) => {
  const recipe = recipes.get(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: '食谱不存在' });
  }
  res.json(recipe);
});

app.post('/api/recipes', authMiddleware, (req: Request, res: Response) => {
  try {
    const { title, coverUrl, ingredients, steps, totalTime } = req.body;
    const user = req.user!;

    if (!title || !coverUrl || !ingredients || !steps) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    const author = users.get(user.userId);
    if (!author) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const recipeId = uuidv4();
    const recipe: Recipe = {
      id: recipeId,
      title,
      coverUrl,
      authorId: user.userId,
      authorName: author.username,
      authorAvatar: author.avatar,
      ingredients,
      steps: steps.map((s: Omit<RecipeStep, 'id'>) => ({ ...s, id: uuidv4() })),
      totalTime: totalTime || 30,
      likes: 0,
      likedBy: [],
      rating: 0,
      ratingCount: 0,
      createdAt: Date.now(),
    };

    recipes.set(recipeId, recipe);
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: '创建食谱失败' });
  }
});

app.post('/api/recipes/:id/like', authMiddleware, (req: Request, res: Response) => {
  const recipe = recipes.get(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: '食谱不存在' });
  }

  const userId = req.user!.userId;
  const hasLiked = recipe.likedBy.includes(userId);

  if (hasLiked) {
    recipe.likedBy = recipe.likedBy.filter((id) => id !== userId);
    recipe.likes -= 1;
  } else {
    recipe.likedBy.push(userId);
    recipe.likes += 1;
  }

  recipes.set(recipe.id, recipe);
  res.json({ likes: recipe.likes, liked: !hasLiked });
});

app.get('/api/recipes/:id/comments', (req: Request, res: Response) => {
  const recipeId = req.params.id;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 20;

  const recipeComments = Array.from(comments.values())
    .filter((c) => c.recipeId === recipeId)
    .sort((a, b) => a.createdAt - b.createdAt);

  const startIndex = (page - 1) * pageSize;
  const paginatedComments = recipeComments.slice(startIndex, startIndex + pageSize);

  res.json({
    comments: paginatedComments,
    total: recipeComments.length,
    page,
    pageSize,
    hasMore: startIndex + pageSize < recipeComments.length,
  });
});

app.post('/api/recipes/:id/comments', authMiddleware, (req: Request, res: Response) => {
  try {
    const recipeId = req.params.id;
    const { content, parentId, replyToId, replyToUsername } = req.body;
    const user = req.user!;

    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const recipe = recipes.get(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: '食谱不存在' });
    }

    const author = users.get(user.userId);
    if (!author) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const comment: Comment = {
      id: uuidv4(),
      recipeId,
      userId: user.userId,
      username: author.username,
      userAvatar: author.avatar,
      content,
      parentId: parentId || null,
      replyToId,
      replyToUsername,
      createdAt: Date.now(),
    };

    comments.set(comment.id, comment);

    if (recipe.authorId !== user.userId) {
      sendNotification(recipe.authorId, {
        type: 'new_comment',
        recipeId,
        recipeTitle: recipe.title,
        comment,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: '评论失败' });
  }
});

app.delete('/api/comments/:id', authMiddleware, (req: Request, res: Response) => {
  const comment = comments.get(req.params.id);
  if (!comment) {
    return res.status(404).json({ error: '评论不存在' });
  }

  if (comment.userId !== req.user!.userId) {
    return res.status(403).json({ error: '无权限删除' });
  }

  comments.delete(req.params.id);
  res.json({ success: true });
});

const PORT = 3001;

initMockData().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
