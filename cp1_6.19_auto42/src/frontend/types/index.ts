export interface Activity {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string
  createdAt: string
  creatorId: string
  creatorName: string
  donorCount: number
}

export interface Donation {
  id: string
  activityId: string
  userId: string
  userName: string
  userAvatar: string
  amount: number
  message: string
  createdAt: string
  isNew?: boolean
}

export interface ActivityStats {
  activityId: string
  totalAmount: number
  donorCount: number
}

export interface CreateActivityPayload {
  name: string
  targetAmount: number
  deadline: string
  description: string
  creatorName: string
}

export interface DonatePayload {
  userName: string
  userAvatar: string
  amount: number
  message: string
}

export type ViewMode = 'grid' | 'masonry'
