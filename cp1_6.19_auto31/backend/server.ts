import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
  totalHours: number;
  badges: Badge[];
  joinedEvents: JoinedEvent[];
  notifications: Notification[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

interface JoinedEvent {
  eventId: string;
  eventName: string;
  hours: number;
  joinedAt: string;
  eventDate: string;
}

interface Notification {
  id: string;
  type: 'badge' | 'hours' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  location: string;
  dateTime: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  creatorId: string;
  creatorName: string;
  participants: { userId: string; username: string; avatar: string; hours?: number }[];
  badges: { name: string; icon: string; description: string }[];
  status: 'upcoming' | 'ongoing' | 'ended';
  image: string;
}

const users: User[] = [
  {
    id: 'user-1',
    username: '环保达人',
    password: '123456',
    avatar: '🌿',
    totalHours: 48.5,
    badges: [
      { id: 'badge-1', name: '垃圾分类先锋', icon: '♻️', description: '参与3次以上垃圾分类宣传活动', earnedAt: '2024-01-15' },
      { id: 'badge-2', name: '植树达人', icon: '🌳', description: '累计植树超过10棵', earnedAt: '2024-02-20' },
      { id: 'badge-3', name: '街道清洁卫士', icon: '🧹', description: '参与5次以上街道清洁活动', earnedAt: '2024-03-10' },
    ],
    joinedEvents: [
      { eventId: 'event-3', eventName: '海滩清洁行动', hours: 8, joinedAt: '2026-06-28', eventDate: '2026-07-10T08:00:00' },
      { eventId: 'event-6', eventName: '环保知识进校园', hours: 6, joinedAt: '2026-06-20', eventDate: '2026-07-01T14:00:00' },
      { eventId: 'event-5', eventName: '旧物交换市集', hours: 4, joinedAt: '2026-06-22', eventDate: '2026-07-05T10:00:00' },
      { eventId: 'event-1', eventName: '春季植树活动', hours: 0, joinedAt: '2026-06-25', eventDate: '2026-07-20T09:00:00' },
      { eventId: 'event-2', eventName: '社区垃圾分类宣传', hours: 0, joinedAt: '2026-06-26', eventDate: '2026-07-25T14:00:00' },
      { eventId: 'event-4', eventName: '城市公园环保徒步', hours: 0, joinedAt: '2026-06-27', eventDate: '2026-08-05T07:30:00' },
    ],
    notifications: [],
  },
  {
    id: 'user-2',
    username: '绿色志愿者',
    password: '123456',
    avatar: '🌱',
    totalHours: 24,
    badges: [
      { id: 'badge-4', name: '环保新星', icon: '⭐', description: '首次参与环保活动', earnedAt: '2024-04-01' },
    ],
    joinedEvents: [],
    notifications: [],
  },
];

const events: Event[] = [
  {
    id: 'event-1',
    name: '春季植树活动',
    location: '城市森林公园',
    dateTime: '2026-07-20T09:00:00',
    description: '一起为城市添绿！本次活动将在森林公园种植50棵树苗，欢迎各位志愿者参与。我们会提供树苗、工具和饮用水，请穿着舒适的衣物和运动鞋。',
    maxParticipants: 30,
    currentParticipants: 25,
    creatorId: 'user-1',
    creatorName: '环保达人',
    participants: [
      { userId: 'user-1', username: '环保达人', avatar: '🌿' },
      { userId: 'user-2', username: '绿色志愿者', avatar: '🌱' },
    ],
    badges: [
      { name: '植树达人', icon: '🌳', description: '参与春季植树活动' },
    ],
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
  },
  {
    id: 'event-2',
    name: '社区垃圾分类宣传',
    location: '阳光社区活动中心',
    dateTime: '2026-07-25T14:00:00',
    description: '走进社区，向居民普及垃圾分类知识，发放宣传手册，帮助大家养成环保好习惯。',
    maxParticipants: 20,
    currentParticipants: 20,
    creatorId: 'user-1',
    creatorName: '环保达人',
    participants: [
      { userId: 'user-1', username: '环保达人', avatar: '🌿' },
    ],
    badges: [
      { name: '垃圾分类先锋', icon: '♻️', description: '参与垃圾分类宣传活动' },
    ],
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
  },
  {
    id: 'event-3',
    name: '海滩清洁行动',
    location: '金沙湾海滩',
    dateTime: '2026-07-10T08:00:00',
    description: '保护海洋环境，清理海滩垃圾。让我们一起为海洋生物创造一个干净的家园。',
    maxParticipants: 50,
    currentParticipants: 36,
    creatorId: 'user-2',
    creatorName: '绿色志愿者',
    participants: [
      { userId: 'user-1', username: '环保达人', avatar: '🌿', hours: 8 },
      { userId: 'user-2', username: '绿色志愿者', avatar: '🌱' },
    ],
    badges: [
      { name: '海洋守护者', icon: '🌊', description: '参与海滩清洁活动' },
    ],
    status: 'ended',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },
  {
    id: 'event-4',
    name: '城市公园环保徒步',
    location: '中央公园',
    dateTime: '2026-08-05T07:30:00',
    description: '边徒步边捡垃圾，在运动中践行环保理念。全程约5公里，沿途设置环保知识打卡点。',
    maxParticipants: 40,
    currentParticipants: 19,
    creatorId: 'user-1',
    creatorName: '环保达人',
    participants: [
      { userId: 'user-1', username: '环保达人', avatar: '🌿' },
    ],
    badges: [
      { name: '徒步环保者', icon: '🥾', description: '参与环保徒步活动' },
    ],
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
  },
  {
    id: 'event-5',
    name: '旧物交换市集',
    location: '文化广场',
    dateTime: '2026-07-05T10:00:00',
    description: '让闲置物品流动起来！带上你的旧书、衣物、小物件，来交换市集寻找新主人。践行循环利用，减少浪费。',
    maxParticipants: 100,
    currentParticipants: 68,
    creatorId: 'user-2',
    creatorName: '绿色志愿者',
    participants: [
      { userId: 'user-1', username: '环保达人', avatar: '🌿', hours: 4 },
    ],
    badges: [
      { name: '循环生活家', icon: '🔄', description: '参与旧物交换活动' },
    ],
    status: 'ended',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  },
  {
    id: 'event-6',
    name: '环保知识进校园',
    location: '第一小学',
    dateTime: '2026-07-01T14:00:00',
    description: '走进校园，给孩子们上一堂生动的环保课，通过游戏和互动传递环保理念。',
    maxParticipants: 15,
    currentParticipants: 9,
    creatorId: 'user-1',
    creatorName: '环保达人',
    participants: [
      { userId: 'user-1', username: '环保达人', avatar: '🌿', hours: 6 },
    ],
    badges: [
      { name: '环保园丁', icon: '📚', description: '参与环保教育活动' },
    ],
    status: 'ended',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
  },
];

app.get('/api/events', (req, res) => {
  const { status, search } = req.query;
  let filteredEvents = [...events];

  if (status && status !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.status === status);
  }

  if (search) {
    const keyword = (search as string).toLowerCase();
    filteredEvents = filteredEvents.filter(
      e => e.name.toLowerCase().includes(keyword) || e.location.toLowerCase().includes(keyword)
    );
  }

  filteredEvents.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  res.json(filteredEvents);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: '活动不存在' });
  }
  res.json(event);
});

app.post('/api/events', (req, res) => {
  const { name, location, dateTime, description, maxParticipants, creatorId, creatorName, badges } = req.body;
  
  const newEvent: Event = {
    id: uuidv4(),
    name,
    location,
    dateTime,
    description,
    maxParticipants,
    currentParticipants: 0,
    creatorId,
    creatorName,
    participants: [],
    badges: badges || [],
    status: new Date(dateTime) > new Date() ? 'upcoming' : 'ended',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
  };

  events.unshift(newEvent);
  res.status(201).json(newEvent);
});

app.post('/api/events/:id/join', (req, res) => {
  const { userId } = req.body;
  const event = events.find(e => e.id === req.params.id);
  const user = users.find(u => u.id === userId);

  if (!event || !user) {
    return res.status(404).json({ error: '活动或用户不存在' });
  }

  if (event.currentParticipants >= event.maxParticipants) {
    return res.status(400).json({ error: '活动已满员' });
  }

  if (event.participants.some(p => p.userId === userId)) {
    return res.status(400).json({ error: '已报名该活动' });
  }

  event.participants.push({ userId, username: user.username, avatar: user.avatar });
  event.currentParticipants++;

  user.joinedEvents.push({
    eventId: event.id,
    eventName: event.name,
    hours: 0,
    joinedAt: new Date().toISOString(),
    eventDate: event.dateTime,
  });

  res.json({ success: true, event });
});

app.post('/api/events/:id/award', (req, res) => {
  const { hours, badges, creatorId } = req.body;
  const event = events.find(e => e.id === req.params.id);

  if (!event) {
    return res.status(404).json({ error: '活动不存在' });
  }

  if (event.creatorId !== creatorId) {
    return res.status(403).json({ error: '只有活动创建者可以发放奖励' });
  }

  event.participants.forEach(participant => {
    const user = users.find(u => u.id === participant.userId);
    if (user) {
      user.totalHours += hours;
      participant.hours = hours;

      const joinedEvent = user.joinedEvents.find(je => je.eventId === event.id);
      if (joinedEvent) {
        joinedEvent.hours = hours;
      }

      badges.forEach((badge: { name: string; icon: string; description: string }) => {
        const newBadge: Badge = {
          id: uuidv4(),
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          earnedAt: new Date().toISOString(),
        };
        user.badges.push(newBadge);

        user.notifications.unshift({
          id: uuidv4(),
          type: 'badge',
          title: '获得新徽章！',
          message: `恭喜你获得「${badge.name}」徽章`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      });

      user.notifications.unshift({
        id: uuidv4(),
        type: 'hours',
        title: '志愿时长已发放',
        message: `「${event.name}」活动发放${hours}小时志愿时长`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  event.status = 'ended';
  res.json({ success: true });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const newUser: User = {
    id: uuidv4(),
    username,
    password,
    avatar: '🌿',
    totalHours: 0,
    badges: [],
    joinedEvents: [],
    notifications: [],
  };

  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.get('/api/users/:id/notifications', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user.notifications);
});

app.put('/api/users/:id/notifications/read', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  user.notifications.forEach(n => n.read = true);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
