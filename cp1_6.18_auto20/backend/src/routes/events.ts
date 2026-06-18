import { Router, Request, Response } from 'express';
import { Event, Participant, Message, Activity } from '../types';

const router = Router();

let events: Event[] = [];
let allTags: Set<string> = new Set(['圣诞派对', '万圣夜', '新年倒计时', '春节聚会', '生日派对', '户外野餐', '音乐会']);

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateId = (): string => Math.random().toString(36).substring(2, 15);


const defaultAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
];


const seedEvents = (): void => {
  const sampleEvents: Event[] = [
    {
      id: generateId(),
      name: "2026 圣诞狂欢夜",
      date: new Date("2026-12-25T19:00:00"),
      coverImages: [
        "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800",
        "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800",
      ],
      location: "上海市静安区南京西路1788号",
      description: "一年一度的圣诞派对来啦！准备了丰盛的美食、精彩的表演和神秘的礼物交换环节，快来和我们一起度过这个温馨的夜晚吧！",
      tags: ["圣诞派对", "音乐", "美食"],
      inviteCode: generateInviteCode(),

      participants: [
        { id: generateId(), name: "小明", avatar: defaultAvatars[0], joinedAt: new Date() },
        { id: generateId(), name: "小红", avatar: defaultAvatars[1], joinedAt: new Date() },
      ],
      participants: [

const seedEvents = (): void => {
  const sampleEvents: Event[] = [
    {
      id: generateId(),
      name: "2026 圣诞狂欢夜",
      date: new Date("2026-12-25T19:00:00"),
      coverImages: [
        "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800",
        "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800",
      ],
      location: "上海市静安区南京西路1788号",
      description: "一年一度的圣诞派对来啦！准备了丰盛的美食、精彩的表演和神秘的礼物交换环节，快来和我们一起度过这个温馨的夜晚吧！",
      tags: ["圣诞派对", "音乐", "美食"],
      inviteCode: generateInviteCode(),
      participants: [
        { id: generateId(), name: "小明", avatar: defaultAvatars[0], joinedAt: new Date() },
        { id: generateId(), name: "小红", avatar: defaultAvatars[1], joinedAt: new Date() },
      ],
      messages: [
        {
          id: generateId(),
          userId: "1",
          userName: "小明",
          userAvatar: defaultAvatars[0],
          content: "期待今年的圣诞派对！",
          timestamp: new Date(Date.now() - 3600000),
          likes: 3,
          likedBy: [],
        },
      ],
      activities: [
        { id: generateId(), type: "join", userId: "1", userName: "小明", userAvatar: defaultAvatars[0], timestamp: new Date(Date.now() - 7200000) },
        { id: generateId(), type: "join", userId: "2", userName: "小红", userAvatar: defaultAvatars[1], timestamp: new Date(Date.now() - 3600000) },
      ],
      isPublic: true,
      createdAt: new Date(),
    },
