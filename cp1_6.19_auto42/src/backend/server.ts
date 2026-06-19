import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server as SocketIOServer } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import activityRouter from './routes/activity'
import donationRouter, { setSocketIO } from './routes/donation'
import { dataStore } from './models/dataStore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../../dist')))

app.use('/api', activityRouter)
app.use('/api', donationRouter)

setSocketIO(io)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('joinActivity', (activityId: string) => {
    socket.join(`activity_${activityId}`)
    console.log(`Socket ${socket.id} joined activity ${activityId}`)
  })

  socket.on('leaveActivity', (activityId: string) => {
    socket.leave(`activity_${activityId}`)
    console.log(`Socket ${socket.id} left activity ${activityId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

dataStore.initMockData()

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
