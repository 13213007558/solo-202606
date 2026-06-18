import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3002;
const DB_PATH = './db.json';

app.use(cors());
app.use(express.json());

const readDB = () => {
  const data = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const getStatus = (startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  if (today < start) return 'upcoming';
  if (today > end) return 'ended';
  return 'ongoing';
};

const getDateBookings = (bookings, exhibitionId, date) => {
  return bookings
    .filter(b => b.exhibitionId === exhibitionId && b.date === date && b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.count, 0);
};

const getRemainingTickets = (exhibition, bookings) => {
  const start = new Date(exhibition.startDate);
  const end = new Date(exhibition.endDate);
  let minRemaining = exhibition.capacity;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const booked = getDateBookings(bookings, exhibition.id, dateStr);
    const remaining = exhibition.capacity - booked;
    if (remaining < minRemaining) minRemaining = remaining;
  }
  return Math.max(0, minRemaining);
};

const generateSeatNumber = (count) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seats = [];
  for (let i = 0; i < count; i++) {
    const row = rows[Math.floor(Math.random() * rows.length)];
    const num = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
    seats.push(`${row}${num}`);
  }
  return seats.join(', ');
};

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

app.get('/api/exhibitions', (req, res) => {
  const db = readDB();
  const exhibitions = db.exhibitions.map(exh => ({
    ...exh,
    status: getStatus(exh.startDate, exh.endDate),
    remainingTickets: getRemainingTickets(exh, db.bookings),
  }));
  res.json(exhibitions);
});

app.get('/api/exhibitions/:id', (req, res) => {
  const db = readDB();
  const exhibition = db.exhibitions.find(e => e.id === req.params.id);
  if (!exhibition) {
    return res.status(404).json({ error: '展览不存在' });
  }
  const start = new Date(exhibition.startDate);
  const end = new Date(exhibition.endDate);
  const dateStats = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const booked = getDateBookings(db.bookings, exhibition.id, dateStr);
    dateStats.push({
      date: dateStr,
      remaining: exhibition.capacity - booked,
      capacity: exhibition.capacity,
    });
  }
  res.json({
    ...exhibition,
    status: getStatus(exhibition.startDate, exhibition.endDate),
    dateStats,
  });
});

app.post('/api/exhibitions', (req, res) => {
  const db = readDB();
  const newExhibition = {
    id: `exh-${uuidv4().slice(0, 8)}`,
    ...req.body,
  };
  db.exhibitions.push(newExhibition);
  writeDB(db);
  res.status(201).json(newExhibition);
});

app.put('/api/exhibitions/:id', (req, res) => {
  const db = readDB();
  const idx = db.exhibitions.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: '展览不存在' });
  }
  db.exhibitions[idx] = { ...db.exhibitions[idx], ...req.body };
  writeDB(db);
  res.json(db.exhibitions[idx]);
});

app.post('/api/bookings', (req, res) => {
  const db = readDB();
  const { exhibitionId, name, phone, date, count } = req.body;
  const exhibition = db.exhibitions.find(e => e.id === exhibitionId);
  if (!exhibition) {
    return res.status(404).json({ error: '展览不存在' });
  }
  const booked = getDateBookings(db.bookings, exhibitionId, date);
  if (booked + count > exhibition.capacity) {
    return res.status(400).json({ error: '该日期余票不足' });
  }
  const newBooking = {
    id: `booking-${uuidv4().slice(0, 8)}`,
    exhibitionId,
    name,
    phone,
    date,
    count,
    status: 'pending',
    verificationCode: generateCode(),
    seatNumber: generateSeatNumber(count),
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(newBooking);
  writeDB(db);
  res.status(201).json(newBooking);
});

app.get('/api/bookings/:id', (req, res) => {
  const db = readDB();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: '预约不存在' });
  }
  const exhibition = db.exhibitions.find(e => e.id === booking.exhibitionId);
  res.json({ ...booking, exhibitionName: exhibition?.name, exhibitionImage: exhibition?.coverImage });
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const db = readDB();
  const idx = db.bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: '预约不存在' });
  }
  db.bookings[idx].status = req.body.status;
  writeDB(db);
  res.json(db.bookings[idx]);
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  const activeBookings = db.bookings.filter(b => b.status !== 'cancelled');
  const totalBookings = activeBookings.reduce((sum, b) => sum + b.count, 0);
  
  const exhibitionStats = db.exhibitions.map(exh => {
    const exhBookings = activeBookings.filter(b => b.exhibitionId === exh.id);
    const totalVisitors = exhBookings.reduce((sum, b) => sum + b.count, 0);
    
    const start = new Date(exh.startDate);
    const end = new Date(exh.endDate);
    const dateStats = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const booked = getDateBookings(db.bookings, exh.id, dateStr);
      dateStats.push({
        date: dateStr,
        remaining: exh.capacity - booked,
        booked,
        capacity: exh.capacity,
      });
    }
    
    return {
      id: exh.id,
      name: exh.name,
      capacity: exh.capacity,
      totalVisitors,
      dateStats,
      status: getStatus(exh.startDate, exh.endDate),
    };
  });

  const bookingList = db.bookings.map(b => {
    const exh = db.exhibitions.find(e => e.id === b.exhibitionId);
    return {
      ...b,
      exhibitionName: exh?.name,
    };
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.json({
    totalBookings,
    totalExhibitions: db.exhibitions.length,
    exhibitionStats,
    bookingList,
  });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    museumName: user.museumName,
  });
});

app.post('/api/auth/register', (req, res) => {
  const db = readDB();
  const { username, password, museumName } = req.body;
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  const newUser = {
    id: `user-${uuidv4().slice(0, 8)}`,
    username,
    password,
    role: 'admin',
    museumName,
  };
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    museumName: newUser.museumName,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
