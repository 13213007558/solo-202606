import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let energyData = [
  { id: uuidv4(), date: '2024-01-01', consumption: 12.5, solar: 8.2, cost: 15.6 },
  { id: uuidv4(), date: '2024-01-02', consumption: 14.3, solar: 7.8, cost: 18.2 },
  { id: uuidv4(), date: '2024-01-03', consumption: 11.2, solar: 9.5, cost: 13.8 },
  { id: uuidv4(), date: '2024-01-04', consumption: 15.7, solar: 6.3, cost: 20.1 },
  { id: uuidv4(), date: '2024-01-05', consumption: 13.1, solar: 8.9, cost: 16.4 },
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Energy Dashboard API is running' });
});

app.get('/api/energy', (req, res) => {
  res.json(energyData);
});

app.get('/api/energy/:id', (req, res) => {
  const record = energyData.find(d => d.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.json(record);
});

app.post('/api/energy', (req, res) => {
  const { date, consumption, solar, cost } = req.body;
  if (!date || consumption === undefined || solar === undefined || cost === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newRecord = { id: uuidv4(), date, consumption, solar, cost };
  energyData.push(newRecord);
  res.status(201).json(newRecord);
});

app.put('/api/energy/:id', (req, res) => {
  const index = energyData.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  energyData[index] = { ...energyData[index], ...req.body, id: energyData[index].id };
  res.json(energyData[index]);
});

app.delete('/api/energy/:id', (req, res) => {
  const index = energyData.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  const deleted = energyData.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log('Energy Dashboard API running on port ' + PORT);
});
