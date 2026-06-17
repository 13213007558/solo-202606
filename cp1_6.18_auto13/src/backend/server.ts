import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface User {
  id: string;
  username: string;
  password: string;
}

interface Review {
  id: string;
  userId: string;
  bookId: string;
  username: string;
  rating: number;
  content: string;
  tags: string[];
  createdAt: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const users: User[] = [];
const reviews: Review[] = [];
const allTags = new Set<string>();

const books: Book[] = [
  {
    id: "1",
    title: "三体",
    author: "刘慈欣",
    description: "地球文明向宇宙发出的第一声啼鸣，以及那个文明做出的回应。",
    cover: "https://picsum.photos/seed/santi/200/280",
    tags: ["科幻", "宇宙", "硬科幻", "中国文学"],
    rating: 4.8,
    reviewCount: 256,
  },
  {
    id: "2",
    title: "活着",
    author: "余华",
    description: "讲述了农村人福贵悲惨的人生遭遇，表达了对生命的敬畏。",
    cover: "https://picsum.photos/seed/huozhe/200/280",
    tags: ["文学", "现实", "中国文学", "人生"],
    rating: 4.9,
    reviewCount: 312,
  },
  {
    id: "3",
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    description: "布恩迪亚家族七代人的传奇故事，魔幻现实主义文学的代表作。",
    cover: "https://picsum.photos/seed/bainian/200/280",
    tags: ["文学", "魔幻现实", "经典", "外国文学"],
    rating: 4.7,
    reviewCount: 198,
  },
  {
    id: "4",
    title: "红楼梦",
    author: "曹雪芹",
    description: "中国古典四大名著之首，以贾宝玉和林黛玉的爱情悲剧为主线。",
    cover: "https://picsum.photos/seed/honglou/200/280",
    tags: ["古典", "中国文学", "名著", "爱情"],
    rating: 4.9,
    reviewCount: 420,
  },
  {
    id: "5",
    title: "围城",
    author: "钱钟书",
    description: "以抗战时期为背景，描写了知识分子的生活百态与精神困境。",
    cover: "https://picsum.photos/seed/weicheng/200/280",
    tags: ["文学", "讽刺", "中国文学", "人生"],
    rating: 4.5,
    reviewCount: 167,
  },
  {
    id: "6",
    title: "小王子",
    author: "安托万·德·圣-埃克苏佩里",
    description: "以一位来自外星球的小王子的视角，表达了对爱与责任的思考。",
    cover: "https://picsum.photos/seed/xiaowangzi/200/280",
    tags: ["童话", "哲学", "经典", "外国文学"],
    rating: 4.8,
    reviewCount: 289,
  },
  {
    id: "7",
    title: "平凡的世界",
    author: "路遥",
    description: "全景式地表现了中国当代城乡社会生活的长篇小说。",
    cover: "https://picsum.photos/seed/pingfan/200/280",
    tags: ["文学", "现实", "中国文学", "人生"],
    rating: 4.7,
    reviewCount: 234,
  },
  {
    id: "8",
    title: "西游记",
    author: "吴承恩",
    description: "唐僧师徒四人西天取经的故事，中国古典文学的瑰宝。",
    cover: "https://picsum.photos/seed/xiyouji/200/280",
    tags: ["古典", "神话", "中国文学", "名著"],
    rating: 4.6,
    reviewCount: 378,
  },
  {
    id: "9",
    title: "挪威的森林",
    author: "村上春树",
    description: "讲述了主人公渡边与两个女孩之间的爱情纠葛与成长。",
    cover: "https://picsum.photos/seed/nuowei/200/280",
    tags: ["文学", "爱情", "日本文学", "成长"],
    rating: 4.4,
    reviewCount: 156,
  },
  {
    id: "10",
    title: "人类简史",
    author: "尤瓦尔·赫拉利",
    description: "从认知革命到科学革命，全面审视人类历史的发展脉络。",
    cover: "https://picsum.photos/seed/renlei/200/280",
    tags: ["历史", "科普", "哲学", "外国文学"],
    rating: 4.6,
    reviewCount: 201,
  },
  {
    id: "11",
    title: "追风筝的人",
    author: "卡勒德·胡赛尼",
    description: "关于友谊、背叛与救赎的动人故事，阿富汗的历史变迁为背景。",
    cover: "https://picsum.photos/seed/zhuifeng/200/280",
    tags: ["文学", "成长", "外国文学", "人生"],
    rating: 4.7,
    reviewCount: 223,
  },
  {
    id: "12",
    title: "银河帝国：基地",
    author: "艾萨克·阿西莫夫",
    description: "心理史学家哈里·谢顿预见帝国衰亡，建立基地以缩短黑暗时代。",
    cover: "https://picsum.photos/seed/yinhe/200/280",
    tags: ["科幻", "宇宙", "经典", "外国文学"],
    rating: 4.6,
    reviewCount: 145,
  },
];

books.forEach((book) => {
  book.tags.forEach((tag) => allTags.add(tag));
});

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }
  const existing = users.find((u) => u.username === username);
  if (existing) {
    res.status(409).json({ error: '用户名已存在' });
    return;
  }
  const user: User = {
    id: uuidv4(),
    username,
    password: hashPassword(password),
  };
  users.push(user);
  res.status(201).json({ id: user.id, username: user.username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }
  const user = users.find(
    (u) => u.username === username && u.password === hashPassword(password)
  );
  if (!user) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }
  res.json({ id: user.id, username: user.username });
});

app.get('/api/tags', (_req, res) => {
  res.json([...allTags]);
});

app.post('/api/reviews', (req, res) => {
  const { userId, bookId, username, rating, content, tags } = req.body;
  if (!userId || !bookId || !username || !rating || !content) {
    res.status(400).json({ error: '缺少必要字段' });
    return;
  }
  const review: Review = {
    id: uuidv4(),
    userId,
    bookId,
    username,
    rating,
    content,
    tags: tags || [],
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);

  if (tags) {
    tags.forEach((tag: string) => allTags.add(tag));
  }

  const book = books.find((b) => b.id === bookId);
  if (book) {
    const bookReviews = reviews.filter((r) => r.bookId === bookId);
    const totalRating = bookReviews.reduce((sum, r) => sum + r.rating, 0);
    book.rating = Math.round((totalRating / bookReviews.length) * 10) / 10;
    book.reviewCount = bookReviews.length;
  }

  res.status(201).json(review);
});

app.get('/api/books/:id', (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  if (!book) {
    res.status(404).json({ error: '书籍未找到' });
    return;
  }
  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  res.json({ ...book, reviews: bookReviews });
});

app.get('/api/reviews', (req, res) => {
  const { bookId, page = '1', limit = '10' } = req.query;
  let filtered = reviews;
  if (bookId) {
    filtered = filtered.filter((r) => r.bookId === bookId);
  }
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const start = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(start, start + limitNum);
  res.json({
    reviews: paginated,
    total: filtered.length,
    page: pageNum,
    limit: limitNum,
  });
});

function calculateTagMatchScore(tags1: string[], tags2: string[]): number {
  const set2 = new Set(tags2);
  return tags1.filter((tag) => set2.has(tag)).length;
}

app.get('/api/recommendations', (req, res) => {
  const { userId, page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  let recommended: Book[];

  if (userId) {
    const userReviews = reviews.filter((r) => r.userId === userId);
    const preferenceTags = new Set<string>();
    userReviews.forEach((r) => r.tags.forEach((t) => preferenceTags.add(t)));

    if (preferenceTags.size === 0) {
      recommended = [...books].sort(
        (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount
      );
    } else {
      const prefArr = [...preferenceTags];
      recommended = [...books]
        .map((book) => ({
          book,
          score: calculateTagMatchScore(book.tags, prefArr),
        }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.book.rating * b.book.reviewCount - a.book.rating * a.book.reviewCount;
        })
        .map((item) => item.book);
    }
  } else {
    recommended = [...books].sort(
      (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount
    );
  }

  const start = (pageNum - 1) * limitNum;
  const paginated = recommended.slice(start, start + limitNum);

  res.json({
    recommendations: paginated,
    total: recommended.length,
    page: pageNum,
    limit: limitNum,
  });
});

app.get('/api/books/:id/similar', (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  if (!book) {
    res.status(404).json({ error: '书籍未找到' });
    return;
  }
  const similar = books
    .filter((b) => b.id !== book.id)
    .map((b) => ({
      book: b,
      score: calculateTagMatchScore(book.tags, b.tags),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.book);

  res.json(similar);
});

app.listen(PORT, () => {
  console.log('服务器运行在 http://localhost:' + PORT);
});
