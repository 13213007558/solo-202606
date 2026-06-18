import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { tasks, comments, save, getCommentsByTask, users } from '../store.js'
import type { Task, Comment } from '../store.js'

const router = Router()

function getUserIdFromToken(req: Request): string {
  const authHeader = req.headers.authorization
  if (!authHeader) return ''
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  return ''
}

router.get('/', (_req: Request, res: Response): void => {
  const list = Array.from(tasks.values())
  res.json({ success: true, data: list })
})

router.post('/', (req: Request, res: Response): void => {
  const { title, description, status, priority, assigneeId, dueDate } = req.body
  if (!title) {
    res.status(400).json({ success: false, error: 'title is required' })
    return
  }
  const now = new Date().toISOString()
  const task: Task = {
    id: uuidv4(),
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    assigneeId: assigneeId || null,
    dueDate: dueDate || null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
  tasks.set(task.id, task)
  save()
  res.status(201).json({ success: true, data: task })
})

router.put('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const task = tasks.get(id)
  if (!task) {
    res.status(404).json({ success: false, error: 'task not found' })
    return
  }
  const { title, description, status, priority, assigneeId, dueDate } = req.body
  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (status !== undefined) {
    task.status = status
    if (status === 'done') {
      task.completedAt = new Date().toISOString()
    }
  }
  if (priority !== undefined) task.priority = priority
  if (assigneeId !== undefined) task.assigneeId = assigneeId
  if (dueDate !== undefined) task.dueDate = dueDate
  task.updatedAt = new Date().toISOString()
  tasks.set(task.id, task)
  save()
  res.json({ success: true, data: task })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  if (!tasks.has(id)) {
    res.status(404).json({ success: false, error: 'task not found' })
    return
  }
  tasks.delete(id)
  save()
  res.json({ success: true, data: null })
})

router.get('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  if (!tasks.has(id)) {
    res.status(404).json({ success: false, error: 'task not found' })
    return
  }
  const list = getCommentsByTask(id)
  res.json({ success: true, data: list })
})

router.post('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  if (!tasks.has(id)) {
    res.status(404).json({ success: false, error: 'task not found' })
    return
  }
  const userId = getUserIdFromToken(req)
  if (!userId) {
    res.status(401).json({ success: false, error: 'unauthorized' })
    return
  }
  const { content, mentions } = req.body
  if (!content) {
    res.status(400).json({ success: false, error: 'content is required' })
    return
  }
  const comment: Comment = {
    id: uuidv4(),
    taskId: id,
    userId,
    content,
    mentions: mentions || [],
    createdAt: new Date().toISOString(),
  }
  comments.set(comment.id, comment)
  save()
  res.status(201).json({ success: true, data: comment })
})


router.delete('/:id/comments/:commentId', (req: Request, res: Response): void => {
  const { id, commentId } = req.params
  const task = tasks.get(id)
  if (!task) {
    res.status(404).json({ success: false, error: 'task not found' })
    return
  }
  const comment = comments.get(commentId)
  if (!comment || comment.taskId !== id) {
    res.status(404).json({ success: false, error: 'comment not found' })
    return
  }
  const userId = getUserIdFromToken(req)
  if (!userId) {
    res.status(401).json({ success: false, error: 'unauthorized' })
    return
  }
  const adminUser = Array.from(users.values()).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0]
  if (comment.userId !== userId && userId !== adminUser?.id) {
    res.status(403).json({ success: false, error: 'forbidden' })
    return
  }
  comments.delete(commentId)
  save()
  res.json({ success: true })
})


export default router
