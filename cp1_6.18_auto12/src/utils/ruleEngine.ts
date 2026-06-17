import type { FormData, PackingCategory, PackingItem, PackingList } from '../types'

let idCounter = 0
const generateId = (): string => `item_${Date.now()}_${++idCounter}`

const createItem = (name: string, quantity: number = 1): PackingItem => ({
  id: generateId(),
  name,
  checked: false,
  quantity
})

const baseClothing = (days: number): PackingItem[] => {
  const shirts = Math.max(3, Math.ceil(days * 0.8))
  const pants = Math.max(2, Math.ceil(days * 0.4))
  const underwear = Math.max(5, days + 2)
  const socks = Math.max(4, days + 1)
  return [
    createItem('T 恤/上衣', shirts),
    createItem('长裤/短裤', pants),
    createItem('内衣', underwear),
    createItem('袜子', socks),
    createItem('睡衣', 1),
    createItem('外套', 1)
  ]
}

const springClothing = (days: number): PackingItem[] => [
  createItem('薄风衣', 1),
  createItem('长袖衬衫', Math.max(2, Math.ceil(days * 0.5))),
  createItem('薄针织衫', Math.max(1, Math.ceil(days / 4)))
]

const summerClothing = (days: number): PackingItem[] => [
  createItem('短裤', Math.max(2, Math.ceil(days * 0.5))),
  createItem('防晒衣', 1),
  createItem('遮阳帽', 1),
  createItem('太阳镜', 1),
  createItem('凉鞋', 1)
]

const autumnClothing = (days: number): PackingItem[] => [
  createItem('厚外套', 1),
  createItem('卫衣/毛衣', Math.max(2, Math.ceil(days * 0.5))),
  createItem('围巾', 1),
  createItem('牛仔裤', Math.max(2, Math.ceil(days * 0.4)))
]

const winterClothing = (days: number): PackingItem[] => [
  createItem('羽绒服', 1),
  createItem('厚毛衣', Math.max(2, Math.ceil(days * 0.5))),
  createItem('保暖内衣', Math.max(2, Math.ceil(days * 0.5))),
  createItem('厚围巾', 1),
  createItem('手套', Math.max(1, Math.ceil(days / 5))),
  createItem('雪地靴/保暖靴', 1),
  createItem('保暖帽', 1)
]

const beachItems = (days: number): PackingItem[] => [
  createItem('泳衣', Math.max(2, Math.ceil(days / 3))),
  createItem('沙滩巾', Math.max(1, Math.ceil(days / 4))),
  createItem('防晒霜 SPF50+', Math.max(1, Math.ceil(days / 7))),
  createItem('防水手机袋', 1),
  createItem('人字拖', 1),
  createItem('浮潜装备', 1)
]

const hikingItems = (days: number): PackingItem[] => [
  createItem('登山鞋', 1),
  createItem('登山杖', 1),
  createItem('速干衣裤', Math.max(2, Math.ceil(days * 0.6))),
  createItem('冲锋衣', 1),
  createItem('头灯', 1),
  createItem('登山背包', 1),
  createItem('水袋/水壶', 1),
  createItem('能量棒/零食', Math.max(3, days * 2))
]

const skiingItems = (days: number): PackingItem[] => [
  createItem('滑雪服', 1),
  createItem('滑雪裤', 1),
  createItem('滑雪手套', Math.max(1, Math.ceil(days / 3))),
  createItem('滑雪镜', 1),
  createItem('头盔', 1),
  createItem('护脸/面罩', Math.max(1, Math.ceil(days / 2))),
  createItem('雪袜', Math.max(2, Math.ceil(days * 0.6)))
]

const businessItems = (days: number): PackingItem[] => [
  createItem('正装西装', 1),
  createItem('正装衬衫', Math.max(3, Math.ceil(days * 0.8))),
  createItem('领带', Math.max(2, Math.ceil(days / 3))),
  createItem('正装皮鞋', 1),
  createItem('公文包', 1),
  createItem('名片', 1),
  createItem('笔记本电脑', 1)
]

const cityTourItems = (days: number): PackingItem[] => [
  createItem('舒适步行鞋', 1),
  createItem('轻便背包', 1),
  createItem('雨伞', 1),
  createItem('充电宝', Math.max(1, Math.ceil(days / 3))),
  createItem('地图/导航', 1)
]

const electronicsBase = (days: number): PackingItem[] => {
  const chargers = Math.max(1, Math.ceil(days / 4))
  return [
    createItem('手机', 1),
    createItem('充电器', chargers),
    createItem('充电宝', 1),
    createItem('数据线', 2),
    createItem('耳机', 1)
  ]
}

const toiletriesBase = (days: number): PackingItem[] => [
  createItem('牙刷', Math.max(1, Math.ceil(days / 7))),
  createItem('牙膏', Math.max(1, Math.ceil(days / 14))),
  createItem('洗面奶', 1),
  createItem('洗发水/沐浴露', Math.max(1, Math.ceil(days / 7))),
  createItem('毛巾', Math.max(2, Math.ceil(days / 3))),
  createItem('护肤品', 1),
  createItem('剃须刀', Math.max(1, Math.ceil(days / 5)))
]

const firstAidBase = (days: number): PackingItem[] => [
  createItem('创可贴', Math.max(10, days * 2)),
  createItem('感冒药', Math.max(1, Math.ceil(days / 5))),
  createItem('肠胃药', Math.max(1, Math.ceil(days / 5))),
  createItem('退烧药', Math.max(1, Math.ceil(days / 7))),
  createItem('止痛药', Math.max(1, Math.ceil(days / 5))),
  createItem('消毒湿巾', Math.max(1, Math.ceil(days / 3))),
  createItem('口罩', Math.max(5, Math.ceil(days * 1.5)))
]

const documentsBase = (): PackingItem[] => [
  createItem('身份证/护照', 1),
  createItem('机票/车票', 1),
  createItem('酒店预订确认', 1),
  createItem('现金/银行卡', 1)
]

export function generatePackingList(formData: FormData): PackingList {
  const { destination, days, season, activities } = formData

  const clothingItems: PackingItem[] = [...baseClothing(days)]

  switch (season) {
    case 'spring':
      clothingItems.push(...springClothing(days))
      break
    case 'summer':
      clothingItems.push(...summerClothing(days))
      break
    case 'autumn':
      clothingItems.push(...autumnClothing(days))
      break
    case 'winter':
      clothingItems.push(...winterClothing(days))
      break
  }

  const activityItems: PackingItem[] = []
  if (activities.includes('beach')) activityItems.push(...beachItems(days))
  if (activities.includes('hiking')) activityItems.push(...hikingItems(days))
  if (activities.includes('skiing')) activityItems.push(...skiingItems(days))
  if (activities.includes('business')) activityItems.push(...businessItems(days))
  if (activities.includes('cityTour')) activityItems.push(...cityTourItems(days))

  const categories: PackingCategory[] = [
    {
      id: 'clothing',
      name: '衣物类',
      icon: '👕',
      items: clothingItems
    },
    {
      id: 'activity',
      name: '活动装备',
      icon: '🎯',
      items: activityItems
    },
    {
      id: 'electronics',
      name: '电子产品',
      icon: '📱',
      items: electronicsBase(days)
    },
    {
      id: 'toiletries',
      name: '洗漱用品',
      icon: '🧴',
      items: toiletriesBase(days)
    },
    {
      id: 'firstAid',
      name: '急救药品',
      icon: '💊',
      items: firstAidBase(days)
    },
    {
      id: 'documents',
      name: '证件文件',
      icon: '📄',
      items: documentsBase()
    }
  ].filter((cat) => cat.items.length > 0)

  return {
    categories,
    generatedAt: Date.now(),
    formData: { ...formData, destination }
  }
}
