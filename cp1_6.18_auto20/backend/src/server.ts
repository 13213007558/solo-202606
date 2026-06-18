import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { eventsRouter } from './routes/events';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.set('io', io);

app.use('/api/events', eventsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:event', (eventId: string) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on('leave:event', (eventId: string) => {
    socket.leave(eventId);
    console.log(`Socket ${socket.id} left event ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
