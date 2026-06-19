import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const readDB = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};

const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const generateSeatNumber = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const row = rows[Math.floor(Math.random() * rows.length)];
  const num = String(Math.floor(Math.random() * 30) + 1).padStart(2, '0');
  return `${row}-${num}`;
};

const generateVerificationCode = (exhibitionName, date) => {
  const prefix = exhibitionName.substring(0, 3).toUpperCase();
  const dateStr = date.replace(/-/g, '');
  const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}${dateStr}${suffix}`;
};

const getDailyBookings = (exhibitionId, bookings) => {
  return bookings
    .filter(b => b.exhibitionId === exhibitionId && b.status !== 'cancelled')
    .reduce((acc, booking) => {
      if (!acc[booking.date]) {
        acc[booking.date] = 0;
      }
      acc[booking.date] += booking.tickets;
      return acc;
    }, {});
};

app.get('/api/exhibitions', (req, res) => {
  const db = readDB();
  const today = new Date().toISOString().split('T')[0];
  
  const exhibitions = db.exhibitions.map(exh => {
    const dailyBookings = getDailyBookings(exh.id, db.bookings);
    const totalBooked = Object.values(dailyBookings).reduce((a, b) => a + b, 0);
    const totalCapacity = exh.capacity * getDatesBetween(exh.startDate, exh.endDate).length;
    const remaining = totalCapacity - totalBooked;
    
    let status = 'upcoming';
    if (today >= exh.startDate && today <= exh.endDate) {
      status = 'ongoing';
    } else if (today > exh.endDate) {
      status = 'ended';
    }
    
    return {
      ...exh,
      remainingTickets: remaining,
      totalCapacity,
      status
    };
  });
  
  res.json(exhibitions);
});

app.get('/api/exhibitions/:id', (req, res) => {
  const db = readDB();
  const exhibition = db.exhibitions.find(e => e.id === req.params.id);
  
  if (!exhibition) {
    return res.status(404).json({ error: '展览不存在' });
  }
  
  const today = new Date().toISOString().split('T')[0];
  const dailyBookings = getDailyBookings(exhibition.id, db.bookings);
  const dates = getDatesBetween(exhibition.startDate, exhibition.endDate);
  
  const dailyRemaining = dates.map(date => ({
    date,
    remaining: Math.max(0, exhibition.capacity - (dailyBookings[date] || 0)),
    isFull: (dailyBookings[date] || 0) >= exhibition.capacity
  }));
  
  let status = 'upcoming';
  if (today >= exhibition.startDate && today <= exhibition.endDate) {
    status = 'ongoing';
  } else if (today > exhibition.endDate) {
    status = 'ended';
  }
  
  res.json({
    ...exhibition,
    status,
    dailyRemaining
  });
});

app.post('/api/exhibitions', (req, res) => {
  const db = readDB();
  const { name, startDate, endDate, capacity, description, coverImage, images } = req.body;
  
  const newExhibition = {
    id: `exh-${uuidv4().substring(0, 8)}`,
    name,
    startDate,
    endDate,
    capacity: parseInt(capacity),
    description,
    coverImage,
    images: images || [coverImage],
    createdAt: new Date().toISOString()
  };
  
  db.exhibitions.push(newExhibition);
  writeDB(db);
  
  res.status(201).json(newExhibition);
});

app.put('/api/exhibitions/:id', (req, res) => {
  const db = readDB();
  const index = db.exhibitions.findIndex(e => e.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: '展览不存在' });
  }
  
  db.exhibitions[index] = {
    ...db.exhibitions[index],
    ...req.body,
    capacity: req.body.capacity ? parseInt(req.body.capacity) : db.exhibitions[index].capacity
  };
  
  writeDB(db);
  res.json(db.exhibitions[index]);
});

app.post('/api/bookings', (req, res) => {
  const db = readDB();
  const { exhibitionId, name, phone, date, tickets } = req.body;
  
  const exhibition = db.exhibitions.find(e => e.id === exhibitionId);
  if (!exhibition) {
    return res.status(404).json({ error: '展览不存在' });
  }
  
  if (tickets < 1 || tickets > 3) {
    return res.status(400).json({ error: '每人限购1-3张票' });
  }
  
  const dailyBookings = getDailyBookings(exhibitionId, db.bookings);
  const booked = dailyBookings[date] || 0;
  
  if (booked + tickets > exhibition.capacity) {
    return res.status(400).json({ error: '该日期剩余票数不足' });
  }
  
  const seatNumbers = [];
  for (let i = 0; i < tickets; i++) {
    seatNumbers.push(generateSeatNumber());
  }
  
  const newBooking = {
    id: `book-${uuidv4().substring(0, 8)}`,
    exhibitionId,
    name,
    phone,
    date,
    tickets: parseInt(tickets),
    seatNumbers,
    verificationCode: generateVerificationCode(exhibition.name, date),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  db.bookings.push(newBooking);
  writeDB(db);
  
  res.status(201).json({
    ...newBooking,
    exhibition
  });
});

app.get('/api/bookings', (req, res) => {
  const db = readDB();
  
  const bookings = db.bookings.map(booking => {
    const exhibition = db.exhibitions.find(e => e.id === booking.exhibitionId);
    return {
      ...booking,
      exhibitionName: exhibition ? exhibition.name : '未知展览'
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(bookings);
});

app.put('/api/bookings/:id/status', (req, res) => {
  const db = readDB();
  const { status } = req.body;
  
  const index = db.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '预约不存在' });
  }
  
  db.bookings[index].status = status;
  writeDB(db);
  
  res.json(db.bookings[index]);
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  
  const totalBookings = db.bookings.filter(b => b.status !== 'cancelled').length;
  const totalVisitors = db.bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.tickets, 0);
  
  const exhibitionStats = db.exhibitions.map(exh => {
    const dates = getDatesBetween(exh.startDate, exh.endDate);
    const dailyBookings = getDailyBookings(exh.id, db.bookings);
    
    const dailyData = dates.map(date => ({
      date,
      remaining: Math.max(0, exh.capacity - (dailyBookings[date] || 0)),
      booked: dailyBookings[date] || 0,
      capacity: exh.capacity
    }));
    
    const totalBooked = Object.values(dailyBookings).reduce((a, b) => a + b, 0);
    
    return {
      id: exh.id,
      name: exh.name,
      capacity: exh.capacity,
      totalBooked,
      dailyData
    };
  });
  
  res.json({
    totalBookings,
    totalVisitors,
    exhibitionStats
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
    role: user.role
  });
});

app.post('/api/auth/register', (req, res) => {
  const db = readDB();
  const { username, password } = req.body;
  
  const existing = db.users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  const newUser = {
    id: `user-${uuidv4().substring(0, 8)}`,
    username,
    password,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  writeDB(db);
  
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
