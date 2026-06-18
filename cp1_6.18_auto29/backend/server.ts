import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  totalHours: number;
  badges: Badge[];
  joinedEvents: JoinedEvent[];
}

interface Event {
  id: string;
  name: string;
  location: string;
  dateTime: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[];
  creatorId: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  type: 'cleanup' | 'planting' | 'education' | 'other';
  image: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  awardedAt: string;
  eventId?: string;
}

interface JoinedEvent {
  eventId: string;
  eventName: string;
  hours: number;
  joinedAt: string;
  status: 'registered' | 'completed';
}

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'badge' | 'event' | 'system';
  read: boolean;
  createdAt: string;
}

const users: User[] = [
  {
    id: 'user-1',
    username: '环保志愿者小明',
    email: 'xiaoming@example.com',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    totalHours: 42.5,
    badges: [
      {
        id: 'badge-1',
        name: '垃圾分类先锋',
        icon: 'recycle',
        description: '积极参与垃圾分类宣传活动，为社区环保做出杰出贡献',
        color: '#2D6B3B',
        awardedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'badge-2',
        name: '植树达人',
        icon: 'tree-pine',
        description: '参与植树活动，种植树木超过10棵',
        color: '#539c6c',
        awardedAt: '2024-02-20T14:30:00Z',
      },
      {
        id: 'badge-3',
        name: '街道清洁卫士',
        icon: 'trash-2',
        description: '参与街道清洁活动5次以上',
        color: '#D4A76A',
        awardedAt: '2024-03-10T09:00:00Z',
      },
    ],
    joinedEvents: [
      {
        eventId: 'event-1',
        eventName: '城市公园植树活动',
        hours: 4,
        joinedAt: '2024-02-15T08:00:00Z',
        status: 'completed',
      },
      {
        eventId: 'event-2',
        eventName: '社区垃圾分类宣传周',
        hours: 6,
        joinedAt: '2024-01-10T09:00:00Z',
        status: 'completed',
      },
      {
        eventId: 'event-3',
        eventName: '滨江步道清洁行动',
        hours: 3,
        joinedAt: '2024-03-05T07:30:00Z',
        status: 'completed',
      },
    ],
  },
  {
    id: 'user-2',
    username: '绿叶守护者',
    email: 'lvyexia@example.com',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lvyexia',
    totalHours: 28,
    badges: [
      {
        id: 'badge-4',
        name: '环保新星',
        icon: 'star',
        description: '首次参与环保志愿活动',
        color: '#fbbf24',
        awardedAt: '2024-02-01T10:00:00Z',
      },
    ],
    joinedEvents: [
      {
        eventId: 'event-1',
        eventName: '城市公园植树活动',
        hours: 3,
        joinedAt: '2024-02-15T08:00:00Z',
        status: 'completed',
      },
    ],
  },
  {
    id: 'user-3',
    username: '自然爱好者',
    email: 'nature@example.com',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature',
    totalHours: 15,
    badges: [],
    joinedEvents: [],
  },
];

const events: Event[] = [
  {
    id: 'event-1',
    name: '城市公园植树活动',
    location: '朝阳公园北门',
    dateTime: '2025-07-20T09:00:00',
    description: '一年一度的夏季植树活动，我们将在朝阳公园种植50棵树苗，为城市增添绿色。活动包括挖坑、栽树、浇水等环节，适合各年龄段参与。提供手套、工具和饮用水。',
    maxParticipants: 30,
    currentParticipants: 25,
    participants: ['user-1', 'user-2'],
    creatorId: 'user-1',
    status: 'upcoming',
    type: 'planting',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
  },
  {
    id: 'event-2',
    name: '社区垃圾分类宣传周',
    location: '阳光社区活动中心',
    dateTime: '2025-07-15T14:00:00',
    description: '为期一周的垃圾分类宣传活动，志愿者将在社区内进行垃圾分类知识普及，指导居民正确分类投放。每日轮班制，可灵活选择参与时间。',
    maxParticipants: 20,
    currentParticipants: 20,
    participants: ['user-1'],
    creatorId: 'user-1',
    status: 'upcoming',
    type: 'education',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=400&fit=crop',
  },
  {
    id: 'event-3',
    name: '滨江步道清洁行动',
    location: '滨江步道南段',
    dateTime: '2025-07-10T07:30:00',
    description: '清晨的滨江步道清洁活动，一边呼吸新鲜空气，一边为美丽江景出一份力。主要清理步道上的垃圾、落叶和杂物。活动后提供免费早餐。',
    maxParticipants: 50,
    currentParticipants: 35,
    participants: ['user-1'],
    creatorId: 'user-2',
    status: 'upcoming',
    type: 'cleanup',
    image: 'https://images.unsplash.com/photo-1605600659803-1df0d6a2b55d?w=800&h=400&fit=crop',
  },
  {
    id: 'event-4',
    name: '旧物交换市集',
    location: '文化广场',
    dateTime: '2025-06-25T10:00:00',
    description: '以物换物的环保市集，让闲置物品焕发新生。志愿者负责场地布置、秩序维护和环保理念宣传。欢迎携带家中闲置物品参与交换。',
    maxParticipants: 40,
    currentParticipants: 18,
    participants: [],
    creatorId: 'user-2',
    status: 'ended',
    type: 'other',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
  },
  {
    id: 'event-5',
    name: '校园环保讲座',
    location: '第一中学报告厅',
    dateTime: '2025-08-05T15:00:00',
    description: '面向中学生的环保知识讲座，主题为"气候变化与我们的责任"。需要志愿者协助会场布置、签到引导和互动环节。',
    maxParticipants: 15,
    currentParticipants: 8,
    participants: [],
    creatorId: 'user-1',
    status: 'upcoming',
    type: 'education',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop',
  },
  {
    id: 'event-6',
    name: '山林徒步净山活动',
    location: '西山森林公园',
    dateTime: '2025-07-28T08:00:00',
    description: '结合徒步与环保的净山活动，沿途清理山林垃圾。全程约8公里，中等强度，建议有一定体力基础者参加。提供登山杖和垃圾袋。',
    maxParticipants: 25,
    currentParticipants: 12,
    participants: [],
    creatorId: 'user-2',
    status: 'upcoming',
    type: 'cleanup',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
  },
];

const notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    message: '恭喜你获得了「植树达人」徽章！',
    type: 'badge',
    read: false,
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    message: '你报名的「滨江步道清洁行动」还有3天就要开始了',
    type: 'event',
    read: true,
    createdAt: '2024-03-02T09:00:00Z',
  },
];

app.get('/api/events', (req: Request, res: Response) => {
  const { type, status } = req.query;
  
  let filteredEvents = [...events];
  
  if (type && type !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.type === type);
  }
  
  if (status && status !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.status === status);
  }
  
  filteredEvents.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  
  res.json(filteredEvents);
});

app.get('/api/events/:id', (req: Request, res: Response) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    res.status(404).json({ message: '活动不存在' });
    return;
  }
  
  const participantsWithDetails = event.participants.map(pid => {
    const user = users.find(u => u.id === pid);
    return {
      id: pid,
      username: user?.username || '未知用户',
      avatar: user?.avatar || '',
    };
  });
  
  res.json({ ...event, participantsDetails: participantsWithDetails });
});

app.post('/api/events', (req: Request, res: Response) => {
  const { name, location, dateTime, description, maxParticipants, type, creatorId, image } = req.body;
  
  const newEvent: Event = {
    id: uuidv4(),
    name,
    location,
    dateTime,
    description,
    maxParticipants: Number(maxParticipants),
    currentParticipants: 0,
    participants: [],
    creatorId,
    status: 'upcoming',
    type,
    image: image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
  };
  
  events.push(newEvent);
  res.status(201).json(newEvent);
});

app.post('/api/events/:id/join', (req: Request, res: Response) => {
  const { userId } = req.body;
  const event = events.find(e => e.id === req.params.id);
  
  if (!event) {
    res.status(404).json({ message: '活动不存在' });
    return;
  }
  
  if (event.currentParticipants >= event.maxParticipants) {
    res.status(400).json({ message: '活动已满员' });
    return;
  }
  
  if (event.participants.includes(userId)) {
    res.status(400).json({ message: '您已报名该活动' });
    return;
  }
  
  if (event.status === 'ended') {
    res.status(400).json({ message: '活动已结束' });
    return;
  }
  
  event.participants.push(userId);
  event.currentParticipants += 1;
  
  const user = users.find(u => u.id === userId);
  if (user) {
    const joinedEvent: JoinedEvent = {
      eventId: event.id,
      eventName: event.name,
      hours: 0,
      joinedAt: new Date().toISOString(),
      status: 'registered',
    };
    user.joinedEvents.unshift(joinedEvent);
    
    const notification: Notification = {
      id: uuidv4(),
      userId,
      message: `您已成功报名「${event.name}」活动`,
      type: 'event',
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(notification);
  }
  
  res.json({ message: '报名成功', event });
});

app.post('/api/events/:id/awards', (req: Request, res: Response) => {
  const { participantIds, hours, badgeName, badgeIcon, badgeDescription } = req.body;
  const eventId = req.params.id;
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    res.status(404).json({ message: '活动不存在' });
    return;
  }
  
  const results: { userId: string; success: boolean; message: string }[] = [];
  
  for (const userId of participantIds) {
    const user = users.find(u => u.id === userId);
    if (!user) {
      results.push({ userId, success: false, message: '用户不存在' });
      continue;
    }
    
    user.totalHours += Number(hours);
    
    const joinedEvent = user.joinedEvents.find(je => je.eventId === eventId);
    if (joinedEvent) {
      joinedEvent.hours = Number(hours);
      joinedEvent.status = 'completed';
    }
    
    const hoursNotification: Notification = {
      id: uuidv4(),
      userId,
      message: `你获得了${hours}小时志愿时长`,
      type: 'event',
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(hoursNotification);
    
    if (badgeName && badgeIcon) {
      const badge: Badge = {
        id: uuidv4(),
        name: badgeName,
        icon: badgeIcon,
        description: badgeDescription || `在「${event.name}」活动中表现优秀`,
        color: '#2D6B3B',
        awardedAt: new Date().toISOString(),
        eventId,
      };
      user.badges.push(badge);
      
      const badgeNotification: Notification = {
        id: uuidv4(),
        userId,
        message: `你获得了「${badgeName}」徽章`,
        type: 'badge',
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.push(badgeNotification);
    }
    
    results.push({ userId, success: true, message: '发放成功' });
  }
  
  res.json({ message: '发放完成', results });
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ message: '用户不存在' });
    return;
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.post('/api/users/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    res.status(401).json({ message: '邮箱或密码错误' });
    return;
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: '登录成功', user: userWithoutPassword });
});

app.post('/api/users/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    res.status(400).json({ message: '该邮箱已被注册' });
    return;
  }
  
  const newUser: User = {
    id: uuidv4(),
    username,
    email,
    password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    totalHours: 0,
    badges: [],
    joinedEvents: [],
  };
  
  users.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: '注册成功', user: userWithoutPassword });
});

app.get('/api/users/:id/notifications', (req: Request, res: Response) => {
  const userNotifications = notifications
    .filter(n => n.userId === req.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(userNotifications);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notification = notifications.find(n => n.id === req.params.id);
  if (!notification) {
    res.status(404).json({ message: '通知不存在' });
    return;
  }
  
  notification.read = true;
  res.json({ message: '已标记为已读' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
