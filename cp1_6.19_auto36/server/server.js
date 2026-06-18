const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4001;

const DATA_DIR = path.join(__dirname, '..', 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

app.use(cors());
app.use(express.json());

function initDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
  }
}

function readJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

initDataFiles();

app.get('/api/projects', (req, res) => {
  const projects = readJSON(PROJECTS_FILE);
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const projects = readJSON(PROJECTS_FILE);
  const newProject = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  projects.push(newProject);
  writeJSON(PROJECTS_FILE, projects);
  res.status(201).json(newProject);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readJSON(PROJECTS_FILE);
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const projects = readJSON(PROJECTS_FILE);
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects[index] = { ...projects[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(PROJECTS_FILE, projects);
  res.json(projects[index]);
});

app.delete('/api/projects/:id', (req, res) => {
  const projects = readJSON(PROJECTS_FILE);
  const logs = readJSON(LOGS_FILE);
  const filteredProjects = projects.filter((p) => p.id !== req.params.id);
  const filteredLogs = logs.filter((l) => l.projectId !== req.params.id);
  writeJSON(PROJECTS_FILE, filteredProjects);
  writeJSON(LOGS_FILE, filteredLogs);
  res.status(204).send();
});

app.get('/api/logs/:projectId', (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const projectLogs = logs
    .filter((l) => l.projectId === req.params.projectId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(projectLogs);
});

app.get('/api/logs', (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  const limit = parseInt(req.query.limit) || sortedLogs.length;
  res.json(sortedLogs.slice(0, limit));
});

app.post('/api/logs/:projectId', (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const newLog = {
    id: uuidv4(),
    projectId: req.params.projectId,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  logs.push(newLog);
  writeJSON(LOGS_FILE, logs);
  res.status(201).json(newLog);
});

app.put('/api/logs/:id', (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const index = logs.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Log not found' });
  }
  logs[index] = { ...logs[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(LOGS_FILE, logs);
  res.json(logs[index]);
});

app.delete('/api/logs/:id', (req, res) => {
  const logs = readJSON(LOGS_FILE);
  const filteredLogs = logs.filter((l) => l.id !== req.params.id);
  writeJSON(LOGS_FILE, filteredLogs);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
