import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import challengesRouter from './routes/challenges.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/api/challenges', challengesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '味道社区 API 服务正常运行' });
});

app.listen(PORT, () => {
  console.log(\`🍳 味道社区后端服务已启动: http://localhost:\${PORT}\`);
});
