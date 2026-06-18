import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let cards = [];

const seedCards = () => {
  const now = Date.now();
  const samples = [
    {
      type: 'text',
      content: '今天读了一本书，关于如何在有限时间内做更多有意义的事。核心观点：聚焦最重要的 20% 任务，砍掉其余的 80%。<b>少即是多</b>。',
      favorite: true,
    },
    {
      type: 'image',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
      ],
      favorite: false,
    },
    {
      type: 'text',
      content: '周末的一个<i>小念头</i>：做一个能把灵感自动归档到 Notion 的小工具。',
      favorite: false,
    },
    {
      type: 'image',
      images: [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600',
      ],
      favorite: true,
    },
  ];
  cards = samples.map((s, i) => ({
    id: uuidv4(),
    ...s,
    createdAt: now - i * 3600 * 1000 * (i + 1),
  }));
};
seedCards();

app.get('/api/cards', (req, res) => {
  const { favorite, type, keyword, page = 1, limit = 12 } = req.query;
  let result = [...cards];

  if (favorite === 'true') {
    result = result.filter((c) => c.favorite);
  }
  if (type && type !== 'all') {
    if (type === 'image') {
      result = result.filter((c) => c.type === 'image');
    }
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    result = result.filter((c) => {
      if (c.type === 'text') {
        return (c.content || '').toLowerCase().includes(kw);
      }
      return false;
    });
  }

  result.sort((a, b) => b.createdAt - a.createdAt);
  const p = parseInt(page);
  const l = parseInt(limit);
  const start = (p - 1) * l;
  const paginated = result.slice(start, start + l);

  res.json({
    data: paginated,
    total: result.length,
    page: p,
    limit: l,
    hasMore: start + l < result.length,
  });
});

app.post('/api/cards', (req, res) => {
  const body = req.body || {};
  const card = {
    id: uuidv4(),
    type: body.type || 'text',
    content: body.content || '',
    images: body.images || [],
    audio: body.audio || null,
    audioWaveform: body.audioWaveform || [],
    favorite: false,
    createdAt: Date.now(),
  };
  cards.unshift(card);
  res.json(card);
});

app.patch('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'not found' });
  }
  const next = { ...cards[idx], ...req.body };
  cards[idx] = next;
  res.json(next);
});

app.delete('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  cards = cards.filter((c) => c.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
