import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { reviews, reviewComments, save, getReviewCommentsByReview, tasks, users } from '../store.js'
import type { Review, ReviewComment } from '../store.js'

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

router.post('/', (req: Request, res: Response): void => {
  const { taskId, files } = req.body
  const userId = getUserIdFromToken(req)
  if (!userId) {
    res.status(401).json({ success: false, error: 'unauthorized' })
    return
  }
  if (!taskId || !files || !Array.isArray(files)) {
    res.status(400).json({ success: false, error: 'taskId and files are required' })
    return
  }
  const review: Review = {
    id: uuidv4(),
    taskId,
    files,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  reviews.set(review.id, review)
  const task = tasks.get(taskId)
  if (task) {
    task.status = 'in-review'
    task.updatedAt = new Date().toISOString()
    tasks.set(task.id, task)
  }
  save()
  res.status(201).json({ success: true, data: review })
})

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const review = reviews.get(id)
  if (!review) {
    res.status(404).json({ success: false, error: 'review not found' })
    return
  }
  const reviewCmts = getReviewCommentsByReview(id).map((c) => {
    const user = users.get(c.userId)
    return { ...c, user: user ? { id: user.id, username: user.username, avatar: user.avatar } : null }
  })
  res.json({ success: true, data: { ...review, comments: reviewCmts } })
})

router.post('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  if (!reviews.has(id)) {
    res.status(404).json({ success: false, error: 'review not found' })
    return
  }
  const userId = getUserIdFromToken(req)
  if (!userId) {
    res.status(401).json({ success: false, error: 'unauthorized' })
    return
  }
  const { fileIndex, lineNumber, content, status } = req.body
  if (fileIndex === undefined || lineNumber === undefined || !content || !status) {
    res.status(400).json({ success: false, error: 'fileIndex, lineNumber, content, and status are required' })
    return
  }
  const comment: ReviewComment = {
    id: uuidv4(),
    reviewId: id,
    userId,
    fileIndex,
    lineNumber,
    content,
    status,
    createdAt: new Date().toISOString(),
  }
  reviewComments.set(comment.id, comment)
  save()
  res.status(201).json({ success: true, data: comment })
})

router.put('/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params
  const review = reviews.get(id)
  if (!review) {
    res.status(404).json({ success: false, error: 'review not found' })
    return
  }
  const { status } = req.body
  if (!status || !['pending', 'approved', 'changes-requested'].includes(status)) {
    res.status(400).json({ success: false, error: 'valid status is required' })
    return
  }
  review.status = status
  reviews.set(review.id, review)
  save()
  res.json({ success: true, data: review })
})

export default router
