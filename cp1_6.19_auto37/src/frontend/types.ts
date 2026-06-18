export interface Activity {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
  description: string;
  createdAt: string;
  creatorName: string;
  totalAmount?: number;
  donorCount?: number;
  achievementRate?: number;
}

export interface Donation {
  id: string;
  activityId: string;
  userName: string;
  avatar: string;
  amount: number;
  message: string;
  createdAt: string;
}

export interface ActivityStats {
  totalAmount: number;
  donorCount: number;
  achievementRate: number;
}
