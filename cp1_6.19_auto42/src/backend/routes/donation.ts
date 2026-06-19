import express from 'express'
import { dataStore, Donation } from '../models/dataStore'
import { Server as SocketIOServer } from 'socket.io'

const router = express.Router()

let io: SocketIOServer

export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO
}

router.get('/activity/:id/donations', (req, res) => {
  const { id } = req.params
  const donations = dataStore.getDonationsByActivityId(id)
  res.json(donations)
})

router.post('/activity/:id/donate', (req, res) => {
  const { id } = req.params
  const { userName, userAvatar, amount, message } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '捐赠金额必须大于0' })
  }

  if (!message || message.length > 140) {
    return res.status(400).json({ error: '祝福语不能为空且不能超过140字' })
  }

  const activity = dataStore.getActivityById(id)
  if (!activity) {
    return res.status(404).json({ error: '活动不存在' })
  }

  const donationData: Omit<Donation, 'id' | 'createdAt'> = {
    activityId: id,
    userId: `user_${Date.now()}`,
    userName: userName || '匿名用户',
    userAvatar: userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || '匿名')}&background=F6AD55&color=fff&size=128`,
    amount: Number(amount),
    message
  }

  const newDonation = dataStore.createDonation(donationData)

  if (io) {
    io.to(`activity_${id}`).emit('newDonation', newDonation)
  }

  const stats = dataStore.getActivityStats(id)
  io.to(`activity_${id}`).emit('statsUpdate', {
    activityId: id,
    totalAmount: stats.totalAmount,
    donorCount: stats.donorCount
  })

  res.status(201).json(newDonation)
})

export default router
