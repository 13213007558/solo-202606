export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type ActivityType =
  | 'beach'
  | 'hiking'
  | 'skiing'
  | 'business'
  | 'cityTour'

export type Priority = 'high' | 'medium' | 'low'

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low']

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低'
}

export interface FormData {
  destination: string
  days: number
  season: Season
  activities: ActivityType[]
}

export interface PackingItem {
  id: string
  name: string
  checked: boolean
  quantity: number
  priority: Priority
}

export interface PackingCategory {
  id: string
  name: string
  icon: string
  items: PackingItem[]
}

export interface PackingList {
  categories: PackingCategory[]
  generatedAt: number
  formData: FormData
}
