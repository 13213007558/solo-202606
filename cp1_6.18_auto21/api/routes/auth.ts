import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { users, save } from '../store.js'

const router = Router()

router.post('/register', (req: Request, res: Response): void => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'username and password are required' })
    return
  }
  const exists = Array.from(users.values()).find((u) => u.username === username)
  if (exists) {
    res.status(409).json({ success: false, error: 'username already exists' })
    return
  }
  const user = {
    id: uuidv4(),
    username,
    password,
    avatar: `https://api.dicebear.com/7.x/avataars/svg?seed=${username}`,
    createdAt: new Date().toISOString(),
  }
  users.set(user.id, user)
  save()
  res.status(201).json({ success: true, data: { user: { id: user.id, username: user.username, avatar: user.avatar, createdAt: user.createdAt }, token: user.id } })
})

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'username and password are required' })
    return
  }
  const user = Array.from(users.values()).find((u) => u.username === username && u.password === password)
  if (!user) {
    res.status(401).json({ success: false, error: 'invalid username or password' })
    return
  }
  res.json({ success: true, data: { user: { id: user.id, username: user.username, avatar: user.avatar, createdAt: user.createdAt }, token: user.id } })
})

router.get('/users', (_req: Request, res: Response): void => {
  const list = Array.from(users.values()).map((u) => ({ id: u.id, username: u.username, avatar: u.avatar, createdAt: u.createdAt }))
  res.json({ success: true, data: list })
})

export default router
