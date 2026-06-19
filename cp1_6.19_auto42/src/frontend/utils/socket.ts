import { io, Socket } from 'socket.io-client'
import { Donation, ActivityStats } from '../types'

let socket: Socket | null = null

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling']
    })
  }
  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const joinActivity = (activityId: string) => {
  if (socket) {
    socket.emit('joinActivity', activityId)
  }
}

export const leaveActivity = (activityId: string) => {
  if (socket) {
    socket.emit('leaveActivity', activityId)
  }
}

export const onNewDonation = (callback: (donation: Donation) => void) => {
  if (socket) {
    socket.on('newDonation', callback)
  }
}

export const onStatsUpdate = (callback: (stats: ActivityStats) => void) => {
  if (socket) {
    socket.on('statsUpdate', callback)
  }
}

export const offNewDonation = (callback: (donation: Donation) => void) => {
  if (socket) {
    socket.off('newDonation', callback)
  }
}

export const offStatsUpdate = (callback: (stats: ActivityStats) => void) => {
  if (socket) {
    socket.off('statsUpdate', callback)
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
