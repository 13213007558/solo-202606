import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import challengesRouter from './routes/challenges';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/api/challenges', challengesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
