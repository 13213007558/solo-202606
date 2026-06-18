import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Activity {
  id: string;
  creatorId: string;
  name: string;
  location: string;
  date: string;
  time: string;
  description: string;
  maxParticipants: number;
  participants: string[];
  status: 'open' | 'full' | 'ended';
  durationHours: number;
  badges: Badge[];
  imageUrl: string;
}

interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
  totalHours: number;
  badges: Badge[];
  joinedActivities: string[];
}

interface Notif {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const badges: Badge[] = [
  { id: 'badge-1', name: '垃圾分类先锋', icon: '♻️', description: '积极参与垃圾分类宣传活动' },
  { id: 'badge-2', name: '植树达人', icon: '🌳', description: '参与植树活动并做出贡献' },
  { id: 'badge-3', name: '社区卫士', icon: '🛡️', description: '为社区环保事业持续付出' },
];

const users: User[] = [
  {
    id: 'user-1',
    username: 'demo',
    password: 'demo123',
    avatar: '',
    totalHours: 24,
    badges: [badges[0], badges[1], badges[2]],
    joinedActivities: ['act-1', 'act-2', 'act-3'],
  },
];

