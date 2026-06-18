import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { reviews, reviewComments, save, getReviewCommentsByReview } from '../store.js'
import type { Review, ReviewComment } from '../store.js'

const router = Router()

router.post('/', (req: Request, res: Response): void => {
  const { taskId, files } = req.body
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
  const reviewCmts = getReviewCommentsByReview(id)
  res.json({ success: true, data: { ...review, comments: reviewCmts } })
})

router.post('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  if (!reviews.has(id)) {
    res.status(404).json({ success: false, error: 'review not found' })
    return
  }
  const { fileIndex, lineNumber, content, status, userId } = req.body
  if (fileIndex === undefined || lineNumber === undefined || !content || !status) {
    res.status(400).json({ success: false, error: 'fileIndex, lineNumber, content, and status are required' })
    return
  }
  const comment: ReviewComment = {
    id: uuidv4(),
    reviewId: id,
    userId: userId || '',
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
