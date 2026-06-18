import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
}

interface AuctionItem {
  id: string;
  name: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  endTime: number;
  images: string[];
  status: 'pending' | 'active' | 'ended';
  creatorId: string;
  creatorName: string;
  createdAt: number;
}

interface Bid {
  id: string;
  itemId: string;
  userId: string;
  username: string;
  avatar: string;
  amount: number;
  timestamp: number;
}

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users: Map<string, User> = new Map();
const usernameMap: Map<string, string> = new Map();
const items: Map<string, AuctionItem> = new Map();
const bids: Map<string, Bid[]> = new Map();
const favorites: Map<string, Set<string>> = new Map();

function getAvatarForUser(username: string): string {
  const colors = ['D69E2E', '38B2AC', '805AD5', 'F56565', '48BB78'];
  const idx = username.charCodeAt(0) % colors.length;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=${colors[idx]}`;
}

function seedMockData() {
  const mockUsers = [
    { username: 'alice', password: '123456' },
    { username: 'bob', password: '123456' },
    { username: 'charlie', password: '123456' },
  ];

  mockUsers.forEach(({ username, password }) => {
    const userId = uuidv4();
    users.set(userId, {
      id: userId,
      username,
      password,
      avatar: getAvatarForUser(username),
    });
    usernameMap.set(username, userId);
    favorites.set(userId, new Set());
  });

  const now = Date.now();
  const mockItems = [
    {
      name: '古董青花瓷瓶',
      description: '清朝乾隆年间青花瓷瓶，保存完好，釉色温润，是收藏佳品。',
      startPrice: 5000,
      images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'],
      endTime: now + 3600 * 1000 * 2,
      creatorName: 'alice',
    },
    {
      name: '限量版机械腕表',
      description: '瑞士知名品牌限量版机械腕表，全球仅发行500枚。',
      startPrice: 28000,
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800'],
      endTime: now + 3600 * 1000 * 5,
      creatorName: 'bob',
    },
    {
      name: '名家书法真迹',
      description: '当代著名书法家作品，毛笔行书，内容为《兰亭集序》节选。',
      startPrice: 15000,
      images: ['https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800'],
      endTime: now + 3600 * 1000 * 1,
      creatorName: 'charlie',
    },
    {
      name: '珍稀邮票收藏集',
      description: '包含清末民初珍稀邮票共38枚，均经权威鉴定。',
      startPrice: 8000,
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
      endTime: now + 3600 * 1000 * 8,
      creatorName: 'alice',
    },
    {
      name: '复古胶片相机',
      description: '1960年代德国产徕卡M3旁轴相机，搭配原厂50mm Summicron镜头。',
      startPrice: 12000,
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
      endTime: now + 3600 * 1000 * 3,
      creatorName: 'bob',
    },
    {
      name: '和田玉籽料把件',
      description: '新疆和田玉籽料，玉质细腻温润，油性十足。',
      startPrice: 20000,
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'],
      endTime: now + 3600 * 1000 * 6,
      creatorName: 'charlie',
    },
  ];

  mockItems.forEach((item, index) => {
    const creatorId = usernameMap.get(item.creatorName)!;
    const creator = users.get(creatorId)!;
    const itemId = uuidv4();
    const auctionItem: AuctionItem = {
      id: itemId,
      name: item.name,
      description: item.description,
      startPrice: item.startPrice,
      currentPrice: item.startPrice,
      endTime: item.endTime,
      images: item.images,
      status: 'active',
      creatorId,
      creatorName: creator.username,
      createdAt: now - index * 60000,
    };
    items.set(itemId, auctionItem);
    bids.set(itemId, []);
    const bidderNames = ['alice', 'bob', 'charlie'].filter(n => n !== item.creatorName);
    bidderNames.forEach((bidderName, i) => {
      const bidderId = usernameMap.get(bidderName)!;
      const bidder = users.get(bidderId)!;
      const bidAmount = item.startPrice + (i + 1) * Math.floor(item.startPrice * 0.05);
      const bid: Bid = {
        id: uuidv4(),
        itemId,
        userId: bidderId,
        username: bidder.username,
        avatar: bidder.avatar,
        amount: bidAmount,
        timestamp: now - (bidderNames.length - i) * 300000,
      };
      bids.get(itemId)!.push(bid);
      auctionItem.currentPrice = bidAmount;
    });
  });
}

seedMockData();

app.post('/api/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  if (username.length < 3) return res.status(400).json({ error: '用户名至少3个字符' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少6个字符' });
  if (usernameMap.has(username)) return res.status(400).json({ error: '用户名已存在' });
  const userId = uuidv4();
  const user: User = {
    id: userId,
    username,
    password,
    avatar: getAvatarForUser(username),
  };
  users.set(userId, user);
  usernameMap.set(username, userId);
  favorites.set(userId, new Set());
  res.json({ success: true, user: { id: userId, username, avatar: user.avatar } });
});

app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  const userId = usernameMap.get(username);
  if (!userId) return res.status(401).json({ error: '用户名或密码错误' });
  const user = users.get(userId)!;
  if (user.password !== password) return res.status(401).json({ error: '用户名或密码错误' });
  res.json({ success: true, user: { id: userId, username, avatar: user.avatar } });
});

app.get('/api/items', (req: Request, res: Response) => {
  const status = req.query.status as string;
  let itemList = Array.from(items.values());
  if (status === 'active') {
    itemList = itemList.filter(item => item.status === 'active' && item.endTime > Date.now());
  } else if (status === 'pending') {
    itemList = itemList.filter(item => item.status === 'pending');
  } else if (status === 'ended') {
    itemList = itemList.filter(item => item.status === 'ended' || item.endTime <= Date.now());
  }
  itemList.sort((a, b) => b.createdAt - a.createdAt);
  res.json({ items: itemList.map(item => ({ id: item.id, name: item.name, description: item.description, startPrice: item.startPrice, currentPrice: item.currentPrice, endTime: item.endTime, images: item.images, status: item.status, creatorName: item.creatorName, createdAt: item.createdAt })) });
});

app.get('/api/items/:id', (req: Request, res: Response) => {
  const item = items.get(req.params.id);
  if (!item) return res.status(404).json({ error: '拍卖品不存在' });
  const itemBids = bids.get(item.id) || [];
  const sortedBids = [...itemBids].sort((a, b) => b.timestamp - a.timestamp);
  res.json({
    item: { id: item.id, name: item.name, description: item.description, startPrice: item.startPrice, currentPrice: item.currentPrice, endTime: item.endTime, images: item.images, status: item.status, creatorName: item.creatorName, createdAt: item.createdAt },
    bids: sortedBids,
  });
});


app.post('/api/items', (req: Request, res: Response) => {
  const { name, description, startPrice, endTime, images, userId } = req.body;
  if (!name || !description || !startPrice || !endTime || !userId) {
    return res.status(400).json({ error: 'missing fields' });
  }
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'user not found' });
  const imageList = images && images.length > 0 ? images : [];
  const itemId = uuidv4();
  const item: AuctionItem = {
    id: itemId,
    name,
    description,
    startPrice: Number(startPrice),
    currentPrice: Number(startPrice),
    endTime: new Date(endTime).getTime(),
    images: imageList,
    status: 'pending',
    creatorId: userId,
    creatorName: user.username,
    createdAt: Date.now(),
  };
  items.set(itemId, item);
  bids.set(itemId, []);
  res.json({ success: true, item });
});
