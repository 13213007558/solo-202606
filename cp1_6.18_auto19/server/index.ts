import express from "express"
import cors from "cors"

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

interface Exhibit {
  id: number
  title: string
  author: string
  size: string
  description: string
  image: string
  position: { wall: string; x: number; y: number; z: number }
}

const exhibits: Exhibit[] = [
  {
    id: 1,
    title: "晨曦中的森林",
    author: "李明远",
    size: "120cm × 80cm",
    description: "这幅作品描绘了清晨阳光穿过薄雾笼罩的森林，光影交错间展现大自然的宁静与生机。",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    position: { wall: "main-back", x: -3, y: 1.5, z: -9 }
  },
  {
    id: 2,
    title: "城市印象",
    author: "张雨桐",
    size: "100cm × 100cm",
    description: "以现代都市为题材，用抽象的色块和线条表现城市的节奏与韵律。",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    position: { wall: "main-back", x: 3, y: 1.5, z: -9 }
  },
  {
    id: 3,
    title: "静物·花",
    author: "王清雅",
    size: "60cm × 80cm",
    description: "古典写实风格的静物画，盛放的花朵在光影下展现出丰富的层次和质感。",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    position: { wall: "main-left", x: -9, y: 1.5, z: -3 }
  },
  {
    id: 4,
    title: "山水之间",
    author: "陈墨轩",
    size: "150cm × 90cm",
    description: "借鉴中国传统山水画的意境，结合现代油画技法创作。远山如黛，近水含烟。",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
    position: { wall: "main-right", x: 9, y: 1.5, z: -3 }
  },
  {
    id: 5,
    title: "海岸线",
    author: "林波涛",
    size: "90cm × 120cm",
    description: "描绘黄昏时分的海岸线，金色的夕阳洒在波光粼粼的海面上。",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    position: { wall: "main-left", x: -9, y: 1.5, z: 3 }
  },
  {
    id: 6,
    title: "抽象的旋律",
    author: "周艺术",
    size: "100cm × 100cm",
    description: "纯抽象作品，用色彩和形态的碰撞表达音乐般的节奏感。",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
    position: { wall: "main-right", x: 9, y: 1.5, z: 3 }
  },
  {
    id: 7,
    title: "少女肖像",
    author: "苏婉清",
    size: "70cm × 90cm",
    description: "写实派肖像画，细腻地捕捉了少女清澈的眼神和温婉的气质。",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    position: { wall: "left-wing", x: -14, y: 1.5, z: -3 }
  },
  {
    id: 8,
    title: "秋日私语",
    author: "黄叶落",
    size: "80cm × 100cm",
    description: "金秋时节的林间小径，落叶铺满大地，阳光透过树梢洒下斑驳光影。",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    position: { wall: "left-wing", x: -14, y: 1.5, z: 3 }
  },
  {
    id: 9,
    title: "工业时代",
    author: "钢铁侠",
    size: "110cm × 80cm",
    description: "以工业废墟为主题，表现后工业时代的沧桑与力量感。",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
    position: { wall: "right-wing", x: 14, y: 1.5, z: -3 }
  },
  {
    id: 10,
    title: "梦境花园",
    author: "花仙子",
    size: "90cm × 90cm",
    description: "超现实主义风格的花园景象，梦幻般的色彩营造出秘境般的氛围。",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    position: { wall: "right-wing", x: 14, y: 1.5, z: 3 }
  }
]

let visitorCount = Math.floor(Math.random() * 15) + 5
let lastResetTime = Date.now()

const RESET_INTERVAL = 5 * 60 * 1000

app.get("/api/exhibits", (req, res) => {
  res.json(exhibits)
})

app.get("/api/visitors", (req, res) => {
  const now = Date.now()
  if (now - lastResetTime > RESET_INTERVAL) {
    visitorCount = Math.floor(Math.random() * 15) + 5
    lastResetTime = now
  }
  res.json({ count: visitorCount })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
