import { Router, Request, Response } from 'express';
import dataStore from '../models/dataStore';

const router = Router();

router.get('/activity/:id/donations', (req: Request, res: Response) => {
  const { id } = req.params;
  const activity = dataStore.getActivity(id);

  if (!activity) {
    return res.status(404).json({ error: '活动不存在' });
  }

  const donations = dataStore.getDonations(id);
  res.json(donations);
});

router.post('/activity/:id/donate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, avatar, amount, message } = req.body;

  if (!userName || !amount) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  const donation = dataStore.addDonation(id, {
    userName,
    avatar: avatar || '',
    amount: Number(amount),
    message: message || '',
  });

  if (!donation) {
    return res.status(404).json({ error: '活动不存在' });
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('newDonation', {
      activityId: id,
      donation,
    });
  }

  res.status(201).json(donation);
});

export default router;
