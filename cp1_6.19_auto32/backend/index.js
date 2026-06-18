const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

let devices = [
  {
    id: uuidv4(),
    name: '客厅空调',
    type: 'air_conditioner',
    power: 1500,
    avgHours: 6,
    todayEnergy: 9.0,
  },
  {
    id: uuidv4(),
    name: '冰箱',
    type: 'fridge',
    power: 150,
    avgHours: 24,
    todayEnergy: 3.6,
  },
  {
    id: uuidv4(),
    name: '客厅照明',
    type: 'lighting',
    power: 60,
    avgHours: 5,
    todayEnergy: 0.3,
  },
  {
    id: uuidv4(),
    name: '洗衣机',
    type: 'washer',
    power: 500,
    avgHours: 1,
    todayEnergy: 0.5,
  },
];

let readings = [];

function generateTrendData() {
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const base = 8 + Math.random() * 6;
    trend.push({
      date: dateStr,
      energy: parseFloat(base.toFixed(1)),
    });
  }
  return trend;
}

app.get('/api/devices', (req, res) => {
  res.json(devices);
});

app.post('/api/device', (req, res) => {
  const { name, type, power, avgHours } = req.body;
  if (!name || !type || !power) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const device = {
    id: uuidv4(),
    name,
    type,
    power: Number(power),
    avgHours: Number(avgHours) || 0,
    todayEnergy: Number(((Number(power) * (Number(avgHours) || 0)) / 1000).toFixed(2)),
  };
  devices.push(device);
  res.json(device);
});

app.post('/api/reading', (req, res) => {
  const { deviceId, hours } = req.body;
  if (!deviceId || hours == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const device = devices.find((d) => d.id === deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  const energy = parseFloat(((device.power * Number(hours)) / 1000).toFixed(2));
  const reading = {
    id: uuidv4(),
    deviceId,
    hours: Number(hours),
    energy,
    timestamp: new Date().toISOString(),
  };
  readings.push(reading);
  device.todayEnergy = parseFloat((device.todayEnergy + energy).toFixed(2));
  res.json({ reading, device });
});

app.get('/api/trend', (req, res) => {
  res.json(generateTrendData());
});

const PORT = 3010;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
