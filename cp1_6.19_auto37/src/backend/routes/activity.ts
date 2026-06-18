import { Router, Request, Response } from 'express';
import { dataStore } from '../models/dataStore';

const router = Router();

router.get('/activities', (_req: Request, res: Response) => {
  const activities = dataStore.getActivities();
  const activitiesWithStats = activities.map((activity) => {
    const stats = dataStore.getActivityStats(activity.id);
    return { ...activity, ...stats };
  });
  res.json(activitiesWithStats);
});

router.get('/activity/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const activity = dataStore.getActivity(id);
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  const stats = dataStore.getActivityStats(id);
  res.json({ ...activity, ...stats });
});

router.post('/activity', (req: Request, res: Response) => {
  const { name, targetAmount, deadline, description, creatorName } = req.body;
  if (!name || !targetAmount || !deadline || !description) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }
  const activity = dataStore.createActivity({
    name,
    targetAmount: Number(targetAmount),
    deadline,
    description,
    creatorName: creatorName || '匿名组织者',
  });
  res.status(201).json(activity);
});

export default router;
