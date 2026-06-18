import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.resolve(__dirname, '..', 'data.json')

export interface User {
  id: string
  username: string
  password: string
  avatar: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'in-review' | 'done'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[]
  createdAt: string
}

export interface Review {
  id: string
  taskId: string
  files: { name: string; content: string }[]
  status: 'pending' | 'approved' | 'changes-requested'
  createdAt: string
}

export interface ReviewComment {
  id: string
  reviewId: string
  userId: string
  fileIndex: number
  lineNumber: number
  content: string
  status: 'approved' | 'changes-requested'
  createdAt: string
}

export const users = new Map<string, User>()
export const tasks = new Map<string, Task>()
export const comments = new Map<string, Comment>()
export const reviews = new Map<string, Review>()
export const reviewComments = new Map<string, ReviewComment>()

export function save() {
  const data = {
    users: Array.from(users.entries()),
    tasks: Array.from(tasks.entries()),
    comments: Array.from(comments.entries()),
    reviews: Array.from(reviews.entries()),
    reviewComments: Array.from(reviewComments.entries()),
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function load() {
  if (!fs.existsSync(DATA_FILE)) return false
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    if (data.users) for (const [k, v] of data.users) users.set(k, v)
    if (data.tasks) for (const [k, v] of data.tasks) tasks.set(k, v)
    if (data.comments) for (const [k, v] of data.comments) comments.set(k, v)
    if (data.reviews) for (const [k, v] of data.reviews) reviews.set(k, v)
    if (data.reviewComments) for (const [k, v] of data.reviewComments) reviewComments.set(k, v)
    return true
  } catch {
    return false
  }
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return Array.from(tasks.values()).filter((t) => t.status === status)
}

export function getCommentsByTask(taskId: string): Comment[] {
  return Array.from(comments.values()).filter((c) => c.taskId === taskId)
}

export function getReviewsByTask(taskId: string): Review[] {
  return Array.from(reviews.values()).filter((r) => r.taskId === taskId)
}

export function getReviewCommentsByReview(reviewId: string): ReviewComment[] {
  return Array.from(reviewComments.values()).filter((rc) => rc.reviewId === reviewId)
}

function seed() {
  const now = new Date().toISOString()
  const daysAgo = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString()
  }
  const futureDays = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString()
  }

  const user1: User = {
    id: uuidv4(),
    username: 'alice',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    createdAt: daysAgo(30),
  }
  const user2: User = {
    id: uuidv4(),
    username: 'bob',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    createdAt: daysAgo(25),
  }
  const user3: User = {
    id: uuidv4(),
    username: 'carol',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
    createdAt: daysAgo(20),
  }

  users.set(user1.id, user1)
  users.set(user2.id, user2)
  users.set(user3.id, user3)

  const taskData: Omit<Task, 'id'>[] = [
    {
      title: '设计登录页面 UI',
      description: '完成登录和注册页面的视觉设计稿',
      status: 'done',
      priority: 'high',
      assigneeId: user1.id,
      dueDate: futureDays(1),
      createdAt: daysAgo(7),
      updatedAt: daysAgo(2),
    },
    {
      title: '实现用户认证 API',
      description: '使用 JWT 完成注册、登录、token 验证接口',
      status: 'done',
      priority: 'urgent',
      assigneeId: user2.id,
      dueDate: daysAgo(1),
      createdAt: daysAgo(10),
      updatedAt: daysAgo(3),
    },
    {
      title: '搭建 CI/CD 流水线',
      description: '配置 GitHub Actions 自动构建和部署',
      status: 'in-progress',
      priority: 'medium',
      assigneeId: user3.id,
      dueDate: futureDays(3),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    {
      title: '实现任务拖拽排序',
      description: '使用 dnd-kit 实现看板视图的拖拽功能',
      status: 'in-progress',
      priority: 'high',
      assigneeId: user1.id,
      dueDate: futureDays(5),
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    {
      title: '添加数据统计仪表盘',
      description: '使用 recharts 展示任务完成趋势和成员工作量',
      status: 'in-review',
      priority: 'medium',
      assigneeId: user2.id,
      dueDate: futureDays(2),
      createdAt: daysAgo(3),
      updatedAt: now,
    },
    {
      title: '编写单元测试',
      description: '为核心业务逻辑编写 Jest 单元测试',
      status: 'todo',
      priority: 'low',
      assigneeId: user3.id,
      dueDate: futureDays(7),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      title: '优化移动端适配',
      description: '修复小屏幕下的布局问题，提升响应式体验',
      status: 'todo',
      priority: 'high',
      assigneeId: user1.id,
      dueDate: futureDays(4),
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      title: '配置 ESLint 和 Prettier',
      description: '统一代码风格，添加自动格式化钩子',
      status: 'todo',
      priority: 'low',
      assigneeId: null,
      dueDate: futureDays(10),
      createdAt: now,
      updatedAt: now,
    },
  ]

  for (const t of taskData) {
    const id = uuidv4()
    tasks.set(id, { id, ...t })
  }

  const allTasks = Array.from(tasks.values())

  comments.set(uuidv4(), {
    id: uuidv4(),
    taskId: allTasks[4].id,
    userId: user1.id,
    content: '仪表盘的数据源需要和后端对齐，@bob 请确认 API 格式',
    mentions: [user2.id],
    createdAt: daysAgo(1),
  })
  comments.set(uuidv4(), {
    id: uuidv4(),
    taskId: allTasks[3].id,
    userId: user2.id,
    content: '拖拽体验很流畅！建议加一个占位符动画',
    mentions: [],
    createdAt: daysAgo(1),
  })
  comments.set(uuidv4(), {
    id: uuidv4(),
    taskId: allTasks[2].id,
    userId: user3.id,
    content: 'CI 流水线已跑通，等 @alice review 后合并',
    mentions: [user1.id],
    createdAt: now,
  })

  save()
}

if (!load()) {
  seed()
}
