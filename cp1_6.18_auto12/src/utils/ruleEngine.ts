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

const springClothing = (): PackingItem[] => [
  createItem('薄风衣', 1),
  createItem('长袖衬衫', 2),
  createItem('薄针织衫', 1)
]

const summerClothing = (): PackingItem[] => [
  createItem('短裤', 2),
  createItem('防晒衣', 1),
  createItem('遮阳帽', 1),
  createItem('太阳镜', 1),
  createItem('凉鞋', 1)
]

const autumnClothing = (): PackingItem[] => [
  createItem('厚外套', 1),
  createItem('卫衣/毛衣', 2),
  createItem('围巾', 1),
  createItem('牛仔裤', 2)
]

const winterClothing = (): PackingItem[] => [
  createItem('羽绒服', 1),
  createItem('厚毛衣', 2),
  createItem('保暖内衣', 2),
  createItem('厚围巾', 1),
  createItem('手套', 1),
  createItem('雪地靴/保暖靴', 1),
  createItem('保暖帽', 1)
]

const beachItems = (): PackingItem[] => [
  createItem('泳衣', 2),
  createItem('沙滩巾', 1),
  createItem('防晒霜 SPF50+', 1),
  createItem('防水手机袋', 1),
  createItem('人字拖', 1),
  createItem('浮潜装备', 1)
]

const hikingItems = (): PackingItem[] => [
  createItem('登山鞋', 1),
  createItem('登山杖', 1),
  createItem('速干衣裤', 2),
  createItem('冲锋衣', 1),
  createItem('头灯', 1),
  createItem('登山背包', 1),
  createItem('水袋/水壶', 1),
  createItem('能量棒/零食', 3)
]

const skiingItems = (): PackingItem[] => [
  createItem('滑雪服', 1),
  createItem('滑雪裤', 1),
  createItem('滑雪手套', 1),
  createItem('滑雪镜', 1),
  createItem('头盔', 1),
  createItem('护脸/面罩', 1),
  createItem('雪袜', 2)
]

const businessItems = (): PackingItem[] => [
  createItem('正装西装', 1),
  createItem('正装衬衫', 3),
  createItem('领带', 2),
  createItem('正装皮鞋', 1),
  createItem('公文包', 1),
  createItem('名片', 1),
  createItem('笔记本电脑', 1)
]

const cityTourItems = (): PackingItem[] => [
  createItem('舒适步行鞋', 1),
  createItem('轻便背包', 1),
  createItem('雨伞', 1),
  createItem('充电宝', 1),
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

const toiletriesBase = (): PackingItem[] => [
  createItem('牙刷', 1),
  createItem('牙膏', 1),
  createItem('洗面奶', 1),
  createItem('洗发水/沐浴露', 1),
  createItem('毛巾', 2),
  createItem('护肤品', 1),
  createItem('剃须刀', 1)
]

const firstAidBase = (): PackingItem[] => [
  createItem('创可贴', 10),
  createItem('感冒药', 1),
  createItem('肠胃药', 1),
  createItem('退烧药', 1),
  createItem('止痛药', 1),
  createItem('消毒湿巾', 1),
  createItem('口罩', 5)
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
      clothingItems.push(...springClothing())
      break
    case 'summer':
      clothingItems.push(...summerClothing())
      break
    case 'autumn':
      clothingItems.push(...autumnClothing())
      break
    case 'winter':
      clothingItems.push(...winterClothing())
      break
  }

  const activityItems: PackingItem[] = []
  if (activities.includes('beach')) activityItems.push(...beachItems())
  if (activities.includes('hiking')) activityItems.push(...hikingItems())
  if (activities.includes('skiing')) activityItems.push(...skiingItems())
  if (activities.includes('business')) activityItems.push(...businessItems())
  if (activities.includes('cityTour')) activityItems.push(...cityTourItems())

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
      items: toiletriesBase()
    },
    {
      id: 'firstAid',
      name: '急救药品',
      icon: '💊',
      items: firstAidBase()
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
