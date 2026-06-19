import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import challengesRouter from './routes/challenges';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/api/challenges', challengesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '味道社区后端服务正常运行' });
});

app.listen(PORT, () => {
  console.log(`🚀 味道社区后端服务已启动: http://localhost:${PORT}`);
});
