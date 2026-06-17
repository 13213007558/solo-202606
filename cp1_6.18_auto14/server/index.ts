import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const VISITOR_RESET_MS = 5 * 60 * 1000;

interface Exhibit {
  id: string;
  title: string;
  artist: string;
  dimensions: string;
  description: string;
  imageUrl: string;
  position: {
    wall: 'north' | 'south' | 'east' | 'west' | 'left-wing' | 'right-wing';
    index: number;
  };
}

const exhibits: Exhibit[] = [
  { id: 'ex-001', title: '晨曦微露', artist: '林清远', dimensions: '120 × 90 cm · 布面油画', description: '作品以柔和的金色调描绘东方黎明时分的山谷，薄雾在林间流转，光线穿透云层洒向大地。画家运用多层薄涂技法，使画面呈现出丝绸般的质感与温度。', imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200&q=80', position: { wall: 'north', index: 0 } },
  { id: 'ex-002', title: '静谧时光', artist: '苏婉清', dimensions: '100 × 80 cm · 水彩', description: '午后阳光斜照进空荡的书房，书页在微风中轻轻翻动。画面以淡雅的米黄色调为主，捕捉时间静止的诗意瞬间。', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80', position: { wall: 'north', index: 1 } },
  { id: 'ex-003', title: '古城暮色', artist: '王志远', dimensions: '150 × 100 cm · 丙烯', description: '夕阳西下，古老的城墙被染成金红色。画家以粗犷的笔触和浓烈的色彩，展现历史的厚重与岁月的沧桑。', imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&q=80', position: { wall: 'north', index: 2 } },
  { id: 'ex-004', title: '花语', artist: '陈雨桐', dimensions: '80 × 80 cm · 综合材料', description: '以鲜花与金属碎片并置，探讨生命的脆弱与永恒。画面层次丰富，每一朵花都像是在低声诉说。', imageUrl: 'https://images.unsplash.com/photo-1582560471573-116e89983313?w=1200&q=80', position: { wall: 'north', index: 3 } },
  { id: 'ex-005', title: '山间行旅', artist: '林清远', dimensions: '180 × 90 cm · 布面油画', description: '远山如黛，溪水潺潺，行者背负行囊漫步于古道之上。画面取法中国传统山水画的构图，却以西画技法呈现，意境深远。', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80', position: { wall: 'south', index: 0 } },
  { id: 'ex-006', title: '夜航', artist: '张墨白', dimensions: '120 × 80 cm · 布面油画', description: '暗夜中的孤舟，远处灯塔的微光。作品以深蓝与暗绿为主调，营造神秘而宁静的氛围。', imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80', position: { wall: 'south', index: 1 } },
  { id: 'ex-007', title: '秋日私语', artist: '苏婉清', dimensions: '90 × 90 cm · 水彩', description: '金黄色的银杏叶铺满小径，两人的身影在落叶中若隐若现。作品以温暖的色调诉说秋天的温柔。', imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80', position: { wall: 'south', index: 2 } },
  { id: 'ex-008', title: '静物与光', artist: '陈雨桐', dimensions: '70 × 100 cm · 油画', description: '一束晨光穿过窗棂，在木质桌面上投下长长的影子。画家通过对光影的精确捕捉，赋予日常静物以神圣感。', imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1200&q=80', position: { wall: 'south', index: 3 } },
  { id: 'ex-009', title: '心象 · 山', artist: '王志远', dimensions: '200 × 150 cm · 综合媒介', description: '画家以心中之山替代眼前之山，层层堆叠的颜料模拟山石肌理，表现人与自然的深层连接。', imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80', position: { wall: 'left-wing', index: 0 } },
  { id: 'ex-010', title: '城市印象', artist: '张墨白', dimensions: '100 × 100 cm · 丙烯', description: '都市的霓虹在雨中晕染，车窗里的乘客神色各异。作品以快速的笔触捕捉当代城市生活的片断。', imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80', position: { wall: 'left-wing', index: 1 } },
  { id: 'ex-011', title: '梦蝶', artist: '苏婉清', dimensions: '120 × 90 cm · 水彩', description: '灵感源自庄周梦蝶，画面虚实交错，蝴蝶与梦境相互交织。画家以极淡的色彩营造朦胧的诗意。', imageUrl: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80', position: { wall: 'right-wing', index: 0 } },
  { id: 'ex-012', title: '岁月无声', artist: '林清远', dimensions: '160 × 110 cm · 布面油画', description: '斑驳的老墙，悬挂的旧照片，时光在此凝固。画家以细腻的笔触记录被遗忘的角落。', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=1200&q=80', position: { wall: 'right-wing', index: 1 } }
];

let visitorCount = Math.floor(Math.random() * 8) + 3;
let lastResetTime = Date.now();

app.get('/api/exhibits', (_req, res) => {
  res.json(exhibits);
});

app.get('/api/exhibits/:id', (req, res) => {
  const exhibit = exhibits.find(e => e.id === req.params.id);
  if (!exhibit) { res.status(404).json({ error: 'Exhibit not found' }); return; }
  res.json(exhibit);
});

app.get('/api/visitors', (_req, res) => {
  const now = Date.now();
  if (now - lastResetTime > VISITOR_RESET_MS) {
    visitorCount = Math.floor(Math.random() * 8) + 3;
    lastResetTime = now;
  } else {
    const delta = Math.floor(Math.random() * 3) - 1;
    visitorCount = Math.max(1, Math.min(30, visitorCount + delta));
  }
  res.json({ online: visitorCount, totalExhibits: exhibits.length });
});

app.listen(PORT, () => {
  console.log(`[Gallery Server] Running on http://localhost:${PORT}`);
  console.log(`  GET /api/exhibits    -> ${exhibits.length} exhibits`);
  console.log(`  GET /api/visitors    -> visitor count`);
});
