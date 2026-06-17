import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'store.json');

app.use(cors());
app.use(express.json());

interface FoodDetail {
  name: string;
  portion: '小份' | '中份' | '大份';
}

interface Activity {
  id: string;
  petId: string;
  type: '饮食' | '运动' | '医疗' | '健康检查';
  note: string;
  timestamp: string;
  food?: FoodDetail;
  archived: boolean;
}

interface Pet {
  id: string;
  name: string;
  breed: string;
  avatar: string;
  weight: number;
}

interface Store {
  pets: Pet[];
  activities: Activity[];
}

function loadData(): Store {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    pets: [
      { id: 'pet-1', name: '旺财', breed: '金毛寻回犬', avatar: '', weight: 28.5 },
      { id: 'pet-2', name: '咪咪', breed: '英短蓝猫', avatar: '', weight: 4.2 },
      { id: 'pet-3', name: '豆豆', breed: '柯基犬', avatar: '', weight: 12.0 },
    ],
    activities: [
      { id: 'act-1', petId: 'pet-1', type: '饮食', note: '吃了狗粮', timestamp: new Date(Date.now() - 3600000).toISOString(), food: { name: '皇家狗粮', portion: '中份' }, archived: false },
      { id: 'act-2', petId: 'pet-1', type: '运动', note: '公园散步', timestamp: new Date(Date.now() - 7200000).toISOString(), archived: false },
      { id: 'act-3', petId: 'pet-2', type: '健康检查', note: '年度体检', timestamp: new Date(Date.now() - 86400000).toISOString(), archived: false },
      { id: 'act-4', petId: 'pet-1', type: '医疗', note: '驱虫', timestamp: new Date(Date.now() - 172800000).toISOString(), archived: false },
      { id: 'act-5', petId: 'pet-3', type: '饮食', note: '下午加餐', timestamp: new Date(Date.now() - 5400000).toISOString(), food: { name: '鸡胸肉', portion: '小份' }, archived: false },
      { id: 'act-6', petId: 'pet-2', type: '运动', note: '逗猫棒玩耍', timestamp: new Date(Date.now() - 10800000).toISOString(), archived: false },
    ],
  };
}

function saveData(store: Store) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

let store = loadData();

app.get('/api/pets', (_req, res) => {
  const petSummaries = store.pets.map((pet) => {
    const petActivities = store.activities.filter((a) => a.petId === pet.id && !a.archived);
    const lastActivity = petActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return {
      ...pet,
      lastActivityTime: lastActivity ? lastActivity.timestamp : null,
      activityCount: petActivities.length,
    };
  });
  res.json(petSummaries);
});

app.get('/api/pets/:id', (req, res) => {
  const pet = store.pets.find((p) => p.id === req.params.id);
  if (!pet) {
    res.status(404).json({ error: 'Pet not found' });
    return;
  }
  const petActivities = store.activities
    .filter((a) => a.petId === pet.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ ...pet, activities: petActivities });
});

app.post('/api/activities', (req, res) => {
  const { petId, type, note, timestamp, food } = req.body;
  if (!petId || !type) {
    res.status(400).json({ error: 'petId and type are required' });
    return;
  }
  const pet = store.pets.find((p) => p.id === petId);
  if (!pet) {
    res.status(404).json({ error: 'Pet not found' });
    return;
  }
  const activity: Activity = {
    id: uuidv4(),
    petId,
    type,
    note: note || '',
    timestamp: timestamp || new Date().toISOString(),
    food: type === '饮食' ? food : undefined,
    archived: false,
  };
  store.activities.unshift(activity);
  saveData(store);
  res.status(201).json(activity);
});

app.patch('/api/activities/:id', (req, res) => {
  const { archived } = req.body;
  const activity = store.activities.find((a) => a.id === req.params.id);
  if (!activity) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  activity.archived = archived;
  saveData(store);
  res.json(activity);
});

app.delete('/api/activities/:id', (req, res) => {
  const index = store.activities.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  store.activities.splice(index, 1);
  saveData(store);
  res.status(204).end();
});

app.get('/api/trends', (req, res) => {
  const { petId, days = '7' } = req.query;
  const numDays = parseInt(days as string, 10);
  const now = new Date();
  const startDate = new Date(now.getTime() - numDays * 86400000);

  const pet = store.pets.find((p) => p.id === petId);
  if (!pet) {
    res.status(404).json({ error: 'Pet not found' });
    return;
  }

  const trends = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(dateStr).getTime();
    const dayEnd = dayStart + 86400000;

    const dayActivities = store.activities.filter((a) => {
      const t = new Date(a.timestamp).getTime();
      return a.petId === petId && t >= dayStart && t < dayEnd;
    });

    const exerciseMinutes = dayActivities
      .filter((a) => a.type === '运动')
      .reduce((sum) => sum + Math.round(20 + Math.random() * 25), 0);

    const foodAmount = dayActivities.filter((a) => a.type === '饮食').length;

    trends.push({
      date: dateStr,
      weight: Math.round((pet.weight + (Math.random() - 0.5) * 0.6) * 10) / 10,
      exerciseMinutes,
      foodAmount,
    });
  }

  res.json(trends);
});

app.listen(PORT, () => {
  console.log(`🐾 Pet Tracker server running on http://localhost:${PORT}`);
});
