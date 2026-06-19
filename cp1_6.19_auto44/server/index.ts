import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import challengesRouter from './routes/challenges';
import { recipes } from './data';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/api/challenges', challengesRouter);

interface SuggestionItem {
  text: string;
  type: 'recipe' | 'ingredient';
}

app.get('/api/search/suggestions', (req, res) => {
  const raw = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const q = raw.toLowerCase();
  if (!q) {
    return res.status(200).json([] as SuggestionItem[]);
  }
  const MAX = 5;
  const seen = new Set<string>();
  const results: SuggestionItem[] = [];
  for (const r of recipes) {
    if (!r.isPublic) continue;
    const name = r.name;
    if (name.toLowerCase().includes(q)) {
      const key = 'r:' + name;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ text: name, type: 'recipe' });
        if (results.length >= MAX) break;
      }
    }
  }
  if (results.length < MAX) {
    for (const r of recipes) {
      if (!r.isPublic) continue;
      for (const ing of r.ingredients) {
        const name = ing.name;
        if (name.toLowerCase().includes(q)) {
          const key = 'i:' + name;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ text: name, type: 'ingredient' });
            if (results.length >= MAX) break;
          }
        }
      }
      if (results.length >= MAX) break;
    }
  }
  res.status(200).json(results.slice(0, MAX));
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '味道社区后端服务正常运行' });
});

app.listen(PORT, () => {
  console.log(`🚀 味道社区后端服务已启动: http://localhost:${PORT}`);
});
