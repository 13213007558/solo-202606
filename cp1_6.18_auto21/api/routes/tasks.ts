import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { tasks, comments, save, getCommentsByTask } from '../store.js'
import type { Task, Comment } from '../store.js'

const router = Router()

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
  if (status !== undefined) task.status = status
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
  const { content, mentions } = req.body
  if (!content) {
    res.status(400).json({ success: false, error: 'content is required' })
    return
  }
  const comment: Comment = {
    id: uuidv4(),
    taskId: id,
    userId: req.body.userId || '',
    content,
    mentions: mentions || [],
    createdAt: new Date().toISOString(),
  }
  comments.set(comment.id, comment)
  save()
  res.status(201).json({ success: true, data: comment })
})

export default router
