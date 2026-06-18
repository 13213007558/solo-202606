import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import activityRoutes from './routes/activity';
import donationRoutes, { setSocketIO } from './routes/donation';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

app.use('/api', activityRoutes);
app.use('/api', donationRoutes);

setSocketIO(io);

io.on('connection', (socket) => {
  socket.on('join-activity', (activityId: string) => {
    socket.join(`activity:${activityId}`);
  });

  socket.on('leave-activity', (activityId: string) => {
    socket.leave(`activity:${activityId}`);
  });
});

const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
