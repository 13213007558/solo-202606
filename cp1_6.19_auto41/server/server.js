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

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, '..', 'data');
const projectsFile = path.join(dataDir, 'projects.json');
const logsFile = path.join(dataDir, 'logs.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(projectsFile)) {
    fs.writeFileSync(projectsFile, '[]', 'utf-8');
  }
  if (!fs.existsSync(logsFile)) {
    fs.writeFileSync(logsFile, '[]', 'utf-8');
  }
}

ensureDataDir();

function readJSON(filepath) {
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Projects API
app.get('/api/projects', (req, res) => {
  const projects = readJSON(projectsFile);
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const projects = readJSON(projectsFile);
  const newProject = {
    id: uuidv4(),
    name: req.body.name || '',
    description: req.body.description || '',
    techStack: req.body.techStack || [],
    githubUrl: req.body.githubUrl || '',
    status: req.body.status || '构思中',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(newProject);
  writeJSON(projectsFile, projects);
  res.status(201).json(newProject);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readJSON(projectsFile);
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const projects = readJSON(projectsFile);
  const idx = projects.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  projects[idx] = {
    ...projects[idx],
    ...req.body,
    id: projects[idx].id,
    createdAt: projects[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(projectsFile, projects);
  res.json(projects[idx]);
});

app.delete('/api/projects/:id', (req, res) => {
  let projects = readJSON(projectsFile);
  const idx = projects.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  const deleted = projects.splice(idx, 1)[0];
  writeJSON(projectsFile, projects);

  let logs = readJSON(logsFile);
  logs = logs.filter((l) => l.projectId !== req.params.id);
  writeJSON(logsFile, logs);

  res.json(deleted);
});

// Logs API
app.get('/api/logs', (req, res) => {
  const logs = readJSON(logsFile);
  const sorted = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

app.get('/api/logs/:projectId', (req, res) => {
  const logs = readJSON(logsFile);
  const projectLogs = logs
    .filter((l) => l.projectId === req.params.projectId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(projectLogs);
});

app.post('/api/logs/:projectId', (req, res) => {
  const logs = readJSON(logsFile);
  const newLog = {
    id: uuidv4(),
    projectId: req.params.projectId,
    date: req.body.date || new Date().toISOString().split('T')[0],
    title: req.body.title || '',
    content: req.body.content || '',
    mood: req.body.mood || '😐',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  logs.push(newLog);
  writeJSON(logsFile, logs);
  res.status(201).json(newLog);
});

app.put('/api/logs/:id', (req, res) => {
  const logs = readJSON(logsFile);
  const idx = logs.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Log not found' });
  logs[idx] = {
    ...logs[idx],
    ...req.body,
    id: logs[idx].id,
    projectId: logs[idx].projectId,
    createdAt: logs[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(logsFile, logs);
  res.json(logs[idx]);
});

app.delete('/api/logs/:id', (req, res) => {
  let logs = readJSON(logsFile);
  const idx = logs.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Log not found' });
  const deleted = logs.splice(idx, 1)[0];
  writeJSON(logsFile, logs);
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
