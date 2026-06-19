import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(cors());

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    return { exhibitions: [], bookings: [], admin: { username: 'admin', password: 'admin123' } };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  if (!data) return { exhibitions: [], bookings: [], admin: { username: 'admin', password: 'admin123' } };
  return JSON.parse(data);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/exhibitions', (req, res) => {
  const db = readDb();
  res.json(db.exhibitions || []);
});

app.get('/api/exhibitions/:id', (req, res) => {
  const db = readDb();
  const exhibition = (db.exhibitions || []).find(e => e.id === req.params.id);
  if (!exhibition) return res.status(404).json({ message: '展览不存在' });
  res.json(exhibition);
});

app.post('/api/exhibitions', (req, res) => {
  const { name, startDate, endDate, capacity, description, coverImage, images } = req.body;
  if (!name || !startDate || !endDate || !capacity) {
    return res.status(400).json({ message: '缺少必填字段' });
  }
  const db = readDb();
  const dailyBookings = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dailyBookings[dateStr] = { booked: 0, seats: [] };
  }
  const exhibition = {
    id: uuidv4(),
    name,
    startDate,
    endDate,
    capacity: Number(capacity),
    description: description || '',
    coverImage: coverImage || '',
    images: images || [],
    dailyBookings
  };
  db.exhibitions = db.exhibitions || [];
  db.exhibitions.push(exhibition);
  writeDb(db);
  res.status(201).json(exhibition);
});

app.put('/api/exhibitions/:id', (req, res) => {
  const db = readDb();
  const idx = (db.exhibitions || []).findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: '展览不存在' });
  const { name, startDate, endDate, capacity, description, coverImage, images } = req.body;
  db.exhibitions[idx] = {
    ...db.exhibitions[idx],
    name: name || db.exhibitions[idx].name,
    startDate: startDate || db.exhibitions[idx].startDate,
    endDate: endDate || db.exhibitions[idx].endDate,
    capacity: capacity !== undefined ? Number(capacity) : db.exhibitions[idx].capacity,
    description: description !== undefined ? description : db.exhibitions[idx].description,
    coverImage: coverImage !== undefined ? coverImage : db.exhibitions[idx].coverImage,
    images: images !== undefined ? images : db.exhibitions[idx].images
  };
  writeDb(db);
  res.json(db.exhibitions[idx]);
});

app.post('/api/bookings', (req, res) => {
  const { exhibitionId, name, phone, date, count } = req.body;
  if (!exhibitionId || !name || !phone || !date || !count) {
    return res.status(400).json({ message: '缺少必填字段' });
  }
  const countNum = Number(count);
  if (countNum < 1 || countNum > 3) {
    return res.status(400).json({ message: '每人最多预约3张票' });
  }
  const db = readDb();
  const exhibition = (db.exhibitions || []).find(e => e.id === exhibitionId);
  if (!exhibition) return res.status(404).json({ message: '展览不存在' });
  const daily = exhibition.dailyBookings?.[date];
  if (!daily) return res.status(400).json({ message: '该日期无展览' });
  const remaining = exhibition.capacity - daily.booked;
  if (remaining < countNum) {
    return res.status(400).json({ message: '该日期剩余票数不足，仅剩 ' + remaining + ' 张' });
  }
  const seatNumbers = [];
  for (let i = 0; i < countNum; i++) {
    const seatIdx = daily.booked + i + 1;
    const row = String.fromCharCode(65 + Math.floor((seatIdx - 1) / 100));
    const seatNum = String(seatIdx % 100 || 100).padStart(3, '0');
    seatNumbers.push(row + '-' + seatNum);
  }
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const booking = {
    id: uuidv4(),
    exhibitionId,
    exhibitionName: exhibition.name,
    name,
    phone,
    date,
    count: countNum,
    seatNumbers,
    verifyCode,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  daily.booked += countNum;
  daily.seats.push(...seatNumbers);
  db.bookings = db.bookings || [];
  db.bookings.push(booking);
  writeDb(db);
  res.status(201).json(booking);
});

app.get('/api/bookings', (req, res) => {
  const db = readDb();
  res.json(db.bookings || []);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: '无效的状态值' });
  }
  const db = readDb();
  const idx = (db.bookings || []).findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: '预约不存在' });
  const booking = db.bookings[idx];
  if (booking.status !== status) {
    if (status === 'cancelled') {
      const exhibition = (db.exhibitions || []).find(e => e.id === booking.exhibitionId);
      if (exhibition && exhibition.dailyBookings?.[booking.date]) {
        exhibition.dailyBookings[booking.date].booked = Math.max(0, exhibition.dailyBookings[booking.date].booked - booking.count);
        exhibition.dailyBookings[booking.date].seats = exhibition.dailyBookings[booking.date].seats.filter(s => !booking.seatNumbers.includes(s));
      }
    }
    booking.status = status;
  }
  writeDb(db);
  res.json(booking);
});

app.get('/api/stats', (req, res) => {
  const db = readDb();
  const bookings = db.bookings || [];
  const exhibitions = db.exhibitions || [];
  const totalBookings = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.count, 0);
  const remainingTickets = {};
  exhibitions.forEach(ex => {
    remainingTickets[ex.id] = { name: ex.name, dates: {} };
    if (ex.dailyBookings) {
      Object.keys(ex.dailyBookings).forEach(date => {
        remainingTickets[ex.id].dates[date] = ex.capacity - ex.dailyBookings[date].booked;
      });
    }
  });
  res.json({ totalBookings, remainingTickets, bookings });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  const admin = db.admin || { username: 'admin', password: 'admin123' };
  if (username === admin.username && password === admin.password) {
    res.json({ success: true, message: '登录成功' });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
