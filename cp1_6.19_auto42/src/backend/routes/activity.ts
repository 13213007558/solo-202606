import express from 'express'
import { dataStore, Activity } from '../models/dataStore'

const router = express.Router()

router.get('/activities', (_req, res) => {
  const activities = dataStore.getActivities()
  const activitiesWithStats = activities.map(activity => {
    const stats = dataStore.getActivityStats(activity.id)
    return {
      ...activity,
      currentAmount: stats.totalAmount,
      donorCount: stats.donorCount
    }
  })
  res.json(activitiesWithStats)
})

router.post('/activity', (req, res) => {
  const { name, targetAmount, deadline, description, creatorName } = req.body

  if (!name || !targetAmount || !deadline || !description) {
    return res.status(400).json({ error: '缺少必填字段' })
  }

  const activityData: Omit<Activity, 'id' | 'createdAt'> = {
    name,
    targetAmount: Number(targetAmount),
    deadline,
    description,
    creatorId: 'current-user',
    creatorName: creatorName || '匿名组织者'
  }

  const newActivity = dataStore.createActivity(activityData)
  res.status(201).json(newActivity)
})

router.get('/activity/:id', (req, res) => {
  const { id } = req.params
  const activity = dataStore.getActivityById(id)

  if (!activity) {
    return res.status(404).json({ error: '活动不存在' })
  }

  const stats = dataStore.getActivityStats(id)
  res.json({
    ...activity,
    currentAmount: stats.totalAmount,
    donorCount: stats.donorCount
  })
})

export default router
