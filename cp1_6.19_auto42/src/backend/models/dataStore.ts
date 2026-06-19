import { v4 as uuidv4 } from 'uuid'

export interface Activity {
  id: string
  name: string
  targetAmount: number
  deadline: string
  description: string
  createdAt: string
  creatorId: string
  creatorName: string
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
}

interface DataStore {
  activities: Activity[]
  donations: Donation[]
}

const store: DataStore = {
  activities: [],
  donations: []
}

export const dataStore = {
  getActivities: (): Activity[] => {
    return [...store.activities]
  },

  getActivityById: (id: string): Activity | undefined => {
    return store.activities.find(a => a.id === id)
  },

  createActivity: (activity: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const newActivity: Activity = {
      ...activity,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }
    store.activities.push(newActivity)
    return newActivity
  },

  getDonationsByActivityId: (activityId: string): Donation[] => {
    return store.donations
      .filter(d => d.activityId === activityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  createDonation: (donation: Omit<Donation, 'id' | 'createdAt'>): Donation => {
    const newDonation: Donation = {
      ...donation,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }
    store.donations.push(newDonation)
    return newDonation
  },

  getActivityStats: (activityId: string) => {
    const donations = store.donations.filter(d => d.activityId === activityId)
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
    const donorCount = new Set(donations.map(d => d.userId)).size
    return { totalAmount, donorCount }
  },

  initMockData: () => {
    const mockActivities: Omit<Activity, 'id' | 'createdAt'>[] = [
      {
        name: '山区儿童温暖冬衣计划',
        targetAmount: 50000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: '为偏远山区的孩子们筹集温暖的冬衣，让他们度过一个温暖的冬天。每一份捐赠都将化为孩子们身上的暖意。',
        creatorId: 'user1',
        creatorName: '爱心志愿者协会'
      },
      {
        name: '乡村图书馆建设',
        targetAmount: 100000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: '在乡村建设小型图书馆，为孩子们打开知识的大门。我们需要购买书籍、书架和阅读桌椅。',
        creatorId: 'user2',
        creatorName: '教育公益基金会'
      },
      {
        name: '流浪动物救助站',
        targetAmount: 30000,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        description: '帮助流浪动物救助站购买猫粮、狗粮和医疗物资，给这些小生命一个温暖的家。',
        creatorId: 'user3',
        creatorName: '小动物保护协会'
      }
    ]

    mockActivities.forEach(activity => {
      dataStore.createActivity(activity)
    })

    const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    const mockMessages = [
      '希望孩子们能够健康快乐成长！',
      '知识改变命运，支持教育公益！',
      '每一个小生命都值得被善待。',
      '传递爱心，温暖你我。',
      '尽绵薄之力，传递大爱无疆。',
      '愿世界充满爱与希望。',
      '孩子们的笑容是我们最大的动力。',
      '公益路上，你我同行。',
      '用爱心点亮希望之光。',
      '感谢每一位善良的捐赠者！'
    ]
    const mockNames = ['张三', '李四', '王五', '赵六', '陈七', '周八', '吴九', '郑十', '爱心人士', '匿名用户']
    const mockAmounts = [10, 50, 100, 200, 50, 10, 100, 50, 10, 200]

    store.activities.forEach(activity => {
      for (let i = 0; i < 15; i++) {
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]
        const mockDonation: Omit<Donation, 'id' | 'createdAt'> = {
          activityId: activity.id,
          userId: `user${Math.floor(Math.random() * 1000)}`,
          userName: mockNames[Math.floor(Math.random() * mockNames.length)],
          userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockNames[Math.floor(Math.random() * mockNames.length)])}&background=${randomColor.replace('#', '')}&color=fff&size=128`,
          amount: mockAmounts[Math.floor(Math.random() * mockAmounts.length)],
          message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        dataStore.createDonation(mockDonation)
      }
    })
  }
}
