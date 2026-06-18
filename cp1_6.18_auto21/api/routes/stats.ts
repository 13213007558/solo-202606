import { Router, type Request, type Response } from 'express'
import { tasks, users } from '../store.js'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  const allTasks = Array.from(tasks.values())
  const now = new Date()

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.status === 'done').length

  const overdueTasks = allTasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false
    return new Date(t.dueDate) < now
  }).length

  const doneTasks = allTasks.filter((t) => t.status === 'done')
  let avgCompletionDays = 0
  if (doneTasks.length > 0) {
    const totalDays = doneTasks.reduce((sum, t) => {
      const created = new Date(t.createdAt)
      const updated = new Date(t.updatedAt)
      return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    }, 0)
    avgCompletionDays = Math.round((totalDays / doneTasks.length) * 10) / 10
  }

  const memberMap = new Map<string, number>()
  for (const t of doneTasks) {
    if (t.assigneeId) {
      memberMap.set(t.assigneeId, (memberMap.get(t.assigneeId) || 0) + 1)
    }
  }
  const memberStats = Array.from(memberMap.entries()) .map(([userId, completedTasks]) => {
    const user = users.get(userId)
    return { userId, username: user?.username || '', completedTasks }
  })

  const dailyTrend: { date: string; newTasks: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const newTasks = allTasks.filter((t) => t.createdAt.slice(0, 10) === dateStr).length
    dailyTrend.push({ date: dateStr, newTasks })
  }

  res.json({
    success: true,
    data: { totalTasks, completedTasks, overdueTasks, avgCompletionDays, memberStats, dailyTrend },
  })
})

export default router
