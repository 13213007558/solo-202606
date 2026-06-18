import { Router, Request, Response } from 'express';
import { dataStore, Donation } from '../models/dataStore';
import { Server as SocketIOServer } from 'socket.io';

const router = Router();

let io: SocketIOServer | null = null;

export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

router.get('/activity/:id/donations', (req: Request, res: Response) => {
  const { id } = req.params;
  const donations = dataStore.getDonations(id);
  res.json(donations);
});

router.post('/activity/:id/donate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, avatar, amount, message } = req.body;

  if (!userName || !amount || amount <= 0) {
    res.status(400).json({ error: '缺少必要参数或金额无效' });
    return;
  }

  const activity = dataStore.getActivity(id);
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }

  const donation: Donation = dataStore.addDonation({
    activityId: id,
    userName,
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
    amount: Number(amount),
    message: message || '',
  });

  if (io) {
    io.to(`activity:${id}`).emit('new-donation', donation);
  }

  const stats = dataStore.getActivityStats(id);
  res.status(201).json({ donation, stats });
});

export default router;
