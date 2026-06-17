export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type ActivityType =
  | 'beach'
  | 'hiking'
  | 'skiing'
  | 'business'
  | 'cityTour'

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
