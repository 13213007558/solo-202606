import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function getDateString(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function generateRandomFluctuation(baseValue) {
  const fluctuation = (Math.random() * 0.4 - 0.2) * baseValue;
  return Math.max(0, baseValue + fluctuation);
}

let devices = [];
let readings = [];
let lastMeterReadings = {};

function initDevices() {
  const initialDevices = [
    { name: '客厅空调', type: '空调', power: 1500, dailyHours: 4 },
    { name: '冰箱', type: '冰箱', power: 200, dailyHours: 24 },
    { name: '客厅照明', type: '照明', power: 60, dailyHours: 5 },
    { name: '洗衣机', type: '洗衣机', power: 500, dailyHours: 1 }
  ];

  devices = initialDevices.map(d => ({
    id: uuidv4(),
    name: d.name,
    type: d.type,
    power: d.power,
    dailyHours: d.dailyHours,
    todayEnergy: 0
  }));

  for (let i = 6; i >= 0; i--) {
    const dateStr = getDateString(i);
    devices.forEach(device => {
      const fluctuatedHours = generateRandomFluctuation(device.dailyHours);
      const energy = (device.power * fluctuatedHours) / 1000;
      readings.push({
        id: uuidv4(),
        deviceId: device.id,
        date: dateStr,
        hours: parseFloat(fluctuatedHours.toFixed(2)),
        energy: parseFloat(energy.toFixed(4)),
        meterReading: null
      });

      if (i === 0) {
        device.todayEnergy = parseFloat(energy.toFixed(4));
      }
    });
  }

  devices.forEach(device => {
    lastMeterReadings[device.id] = null;
  });
}

function calculateDailyEnergy(dateStr) {
  const dayReadings = readings.filter(r => r.date === dateStr);
  const total = dayReadings.reduce((sum, r) => sum + r.energy, 0);
  return parseFloat(total.toFixed(4));
}

function getWeeklyEnergy() {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    total += calculateDailyEnergy(getDateString(i));
  }
  return parseFloat(total.toFixed(4));
}

function getPreviousWeeklyEnergy() {
  let total = 0;
  for (let i = 7; i < 14; i++) {
    const dateStr = getDateString(i);
    const simulatedEnergy = devices.reduce((sum, d) => {
      const fluctuatedHours = generateRandomFluctuation(d.dailyHours);
      return sum + (d.power * fluctuatedHours) / 1000;
    }, 0);
    total += simulatedEnergy;
  }
  return parseFloat(total.toFixed(4));
}

function getMonthlyEnergy() {
  let total = 0;
  for (let i = 0; i < 30; i++) {
    const dateStr = getDateString(i);
    const dayReadings = readings.filter(r => r.date === dateStr);
    if (dayReadings.length > 0) {
      total += calculateDailyEnergy(dateStr);
    } else {
      const simulatedEnergy = devices.reduce((sum, d) => {
        const fluctuatedHours = generateRandomFluctuation(d.dailyHours);
        return sum + (d.power * fluctuatedHours) / 1000;
      }, 0);
      total += simulatedEnergy;
    }
  }
  return parseFloat(total.toFixed(4));
}

function getPreviousMonthlyEnergy() {
  let total = 0;
  for (let i = 30; i < 60; i++) {
    const simulatedEnergy = devices.reduce((sum, d) => {
      const fluctuatedHours = generateRandomFluctuation(d.dailyHours);
      return sum + (d.power * fluctuatedHours) / 1000;
    }, 0);
    total += simulatedEnergy;
  }
  return parseFloat(total.toFixed(4));
}

function calculateCompare(current, previous) {
  if (previous === 0) return 0;
  const diff = ((current - previous) / previous) * 100;
  return parseFloat(diff.toFixed(1));
}

initDevices();

app.get('/api/devices', (req, res) => {
  res.json(devices);
});

app.post('/api/device', (req, res) => {
  const { name, type, power, dailyHours } = req.body;
  if (!name || !type || power === undefined || dailyHours === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, type, power, dailyHours' });
  }
  if (typeof power !== 'number' || power < 0) {
    return res.status(400).json({ error: 'power must be a non-negative number' });
  }
  if (typeof dailyHours !== 'number' || dailyHours < 0 || dailyHours > 24) {
    return res.status(400).json({ error: 'dailyHours must be between 0 and 24' });
  }

  const newDevice = {
    id: uuidv4(),
    name,
    type,
    power,
    dailyHours,
    todayEnergy: 0
  };
  devices.push(newDevice);
  lastMeterReadings[newDevice.id] = null;

  for (let i = 6; i >= 0; i--) {
    const dateStr = getDateString(i);
    const fluctuatedHours = generateRandomFluctuation(newDevice.dailyHours);
    const energy = (newDevice.power * fluctuatedHours) / 1000;
    readings.push({
      id: uuidv4(),
      deviceId: newDevice.id,
      date: dateStr,
      hours: parseFloat(fluctuatedHours.toFixed(2)),
      energy: parseFloat(energy.toFixed(4)),
      meterReading: null
    });

    if (i === 0) {
      newDevice.todayEnergy = parseFloat(energy.toFixed(4));
    }
  }

  res.status(201).json(newDevice);
});

app.post('/api/reading', (req, res) => {
  const { deviceId, hours, meterReading } = req.body;
  if (!deviceId || hours === undefined) {
    return res.status(400).json({ error: 'Missing required fields: deviceId, hours' });
  }

  const device = devices.find(d => d.id === deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  let energy;
  const lastReading = lastMeterReadings[deviceId];

  if (meterReading !== undefined && meterReading !== null) {
    if (typeof meterReading !== 'number') {
      return res.status(400).json({ error: 'meterReading must be a number' });
    }
    if (lastReading !== null && meterReading < lastReading) {
      return res.status(400).json({ error: 'meterReading cannot be less than last reading' });
    }

    const diff = lastReading !== null ? meterReading - lastReading : (device.power * hours) / 1000;
    energy = parseFloat(diff.toFixed(4));
    lastMeterReadings[deviceId] = meterReading;
  } else {
    if (typeof hours !== 'number' || hours < 0) {
      return res.status(400).json({ error: 'hours must be a non-negative number' });
    }
    energy = parseFloat(((device.power * hours) / 1000).toFixed(4));
  }

  const todayStr = getDateString(0);
  const existingReadingIndex = readings.findIndex(
    r => r.deviceId === deviceId && r.date === todayStr
  );

  const newReading = {
    id: uuidv4(),
    deviceId,
    date: todayStr,
    hours: parseFloat(hours.toFixed(2)),
    energy,
    meterReading: meterReading !== undefined ? meterReading : null
  };

  if (existingReadingIndex >= 0) {
    readings[existingReadingIndex] = newReading;
  } else {
    readings.push(newReading);
  }

  const todayReadings = readings.filter(r => r.deviceId === deviceId && r.date === todayStr);
  const todayTotalEnergy = todayReadings.reduce((sum, r) => sum + r.energy, 0);
  device.todayEnergy = parseFloat(todayTotalEnergy.toFixed(4));

  res.status(201).json(newReading);
});

app.get('/api/trend', (req, res) => {
  const trend = [];
  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  for (let i = 6; i >= 0; i--) {
    const dateStr = getDateString(i);
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const energy = calculateDailyEnergy(dateStr);

    trend.push({
      date: dateStr,
      label: i === 0 ? '今天' : weekLabels[dayOfWeek],
      energy
    });
  }

  const today = calculateDailyEnergy(getDateString(0));
  const yesterday = calculateDailyEnergy(getDateString(1));
  const week = getWeeklyEnergy();
  const prevWeek = getPreviousWeeklyEnergy();
  const month = getMonthlyEnergy();
  const prevMonth = getPreviousMonthlyEnergy();

  const overview = {
    today,
    week,
    month,
    todayCompare: calculateCompare(today, yesterday),
    weekCompare: calculateCompare(week, prevWeek),
    monthCompare: calculateCompare(month, prevMonth)
  };

  res.json({ trend, overview });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Energy Monitor API is running' });
});

app.listen(PORT, () => {
  console.log('Energy Monitor API running on port ' + PORT);
});
