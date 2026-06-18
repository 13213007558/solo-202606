import { v4 as uuidv4 } from 'uuid';

export interface Activity {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
  description: string;
  createdAt: string;
  creatorName: string;
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

class DataStore {
  private activities: Map<string, Activity> = new Map();
  private donations: Map<string, Donation[]> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    const activity1: Activity = {
      id: uuidv4(),
      name: '山区儿童温暖冬衣计划',
      targetAmount: 50000,
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: '为偏远山区的孩子们送去温暖冬衣，让他们度过一个温暖的冬天。每件冬衣仅需100元，您的爱心将温暖一个孩子的整个冬季。',
      createdAt: now.toISOString(),
      creatorName: '爱心志愿者协会',
    };

    const activity2: Activity = {
      id: uuidv4(),
      name: '乡村小学图书角建设',
      targetAmount: 30000,
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      description: '为乡村小学建设图书角，每一本书都是孩子们看世界的窗口。让知识的光芒照亮每一个角落。',
      createdAt: now.toISOString(),
      creatorName: '乡村教育基金会',
    };

    this.activities.set(activity1.id, activity1);
    this.activities.set(activity2.id, activity2);

    this.donations.set(activity1.id, [
      {
        id: uuidv4(),
        activityId: activity1.id,
        userName: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        amount: 100,
        message: '希望小朋友们冬天不再寒冷，温暖过冬！',
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
      },
      {
        id: uuidv4(),
        activityId: activity1.id,
        userName: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        amount: 50,
        message: '小小爱心，大大温暖。',
        createdAt: new Date(now.getTime() - 7200000).toISOString(),
      },
      {
        id: uuidv4(),
        activityId: activity1.id,
        userName: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        amount: 10,
        message: '加油！',
        createdAt: new Date(now.getTime() - 10800000).toISOString(),
      },
    ]);

    this.donations.set(activity2.id, [
      {
        id: uuidv4(),
        activityId: activity2.id,
        userName: '赵六',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
        amount: 200,
        message: '知识改变命运，愿每一个孩子都能读到好书！',
        createdAt: new Date(now.getTime() - 1800000).toISOString(),
      },
    ]);
  }

  getActivities(): Activity[] {
    return Array.from(this.activities.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getActivity(id: string): Activity | undefined {
    return this.activities.get(id);
  }

  createActivity(
    data: Omit<Activity, 'id' | 'createdAt'>
  ): Activity {
    const activity: Activity = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    this.activities.set(activity.id, activity);
    this.donations.set(activity.id, []);
    return activity;
  }

  getDonations(activityId: string): Donation[] {
    return (this.donations.get(activityId) || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addDonation(
    data: Omit<Donation, 'id' | 'createdAt'>
  ): Donation {
    const donation: Donation = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const list = this.donations.get(donation.activityId) || [];
    list.unshift(donation);
    this.donations.set(donation.activityId, list);
    return donation;
  }

  getActivityStats(activityId: string) {
    const donations = this.donations.get(activityId) || [];
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = donations.length;
    const activity = this.activities.get(activityId);
    const achievementRate = activity
      ? Math.min(100, (totalAmount / activity.targetAmount) * 100)
      : 0;
    return { totalAmount, donorCount, achievementRate };
  }
}

export const dataStore = new DataStore();
