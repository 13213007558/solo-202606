import { User, Recipe, Challenge, Trophy } from './types';
import { v4 as uuidv4 } from 'uuid';

const now = new Date();
const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const past15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

export const users: User[] = [
  { id: 'user-1', username: '厨房达人小王', email: 'xiaowang@example.com', password: '123456', avatar: '👨‍🍳', bio: '热爱家常菜，喜欢研究各种菜系', createdAt: past30Days.toISOString() },
  { id: 'user-2', username: '甜品师小美', email: 'xiaomei@example.com', password: '123456', avatar: '👩‍🍳', bio: '专注甜品烘焙10年', createdAt: past30Days.toISOString() },
  { id: 'user-3', username: '川菜爱好者老李', email: 'laoli@example.com', password: '123456', avatar: '🧑‍🍳', bio: '无辣不欢，正宗川菜传承者', createdAt: past15Days.toISOString() },
  { id: 'user-4', username: '健康饮食达人', email: 'healthy@example.com', password: '123456', avatar: '🥗', bio: '追求健康低脂的美味', createdAt: past15Days.toISOString() },
  { id: 'user-5', username: '意面小王子', email: 'pasta@example.com', password: '123456', avatar: '🍝', bio: '意大利面忠实粉丝', createdAt: past15Days.toISOString() },
];

const recipeImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
];

const recipeData = [
  { title: '番茄肉酱意面', authorId: 'user-5', desc: '经典意式番茄肉酱搭配弹牙意面', ingredients: ['意面', '牛肉末', '番茄', '洋葱', '大蒜', '橄榄油', '盐', '黑胡椒'], likes: 156 },
  { title: '奶油蘑菇意面', authorId: 'user-5', desc: '浓郁奶油酱汁配鲜香蘑菇', ingredients: ['意面', '蘑菇', '奶油', '大蒜', '帕玛森芝士', '黄油'], likes: 98 },
  { title: '青酱罗勒意面', authorId: 'user-1', desc: '清新罗勒香，夏日清爽之选', ingredients: ['意面', '罗勒叶', '松子', '大蒜', '橄榄油', '帕玛森芝士'], likes: 76 },
  { title: '提拉米苏', authorId: 'user-2', desc: '意式经典甜品，咖啡与奶酪的完美结合', ingredients: ['马斯卡彭奶酪', '手指饼干', '浓缩咖啡', '蛋黄', '糖', '可可粉'], likes: 234 },
  { title: '芒果布丁', authorId: 'user-2', desc: '香甜芒果制成的清爽布丁', ingredients: ['芒果', '牛奶', '淡奶油', '糖', '吉利丁片'], likes: 189 },
  { title: '杨枝甘露', authorId: 'user-2', desc: '港式经典甜品，芒果西柚西米露', ingredients: ['芒果', '西柚', '西米', '椰浆', '淡奶', '糖'], likes: 167 },
  { title: '麻婆豆腐', authorId: 'user-3', desc: '正宗川味麻辣鲜香', ingredients: ['嫩豆腐', '牛肉末', '郫县豆瓣酱', '花椒', '葱', '姜', '蒜'], likes: 312 },
  { title: '回锅肉', authorId: 'user-3', desc: '川菜经典，肥而不腻', ingredients: ['五花肉', '青蒜', '郫县豆瓣酱', '甜面酱', '豆豉'], likes: 278 },
  { title: '鱼香肉丝', authorId: 'user-3', desc: '酸甜微辣的经典川菜', ingredients: ['猪里脊肉', '胡萝卜', '木耳', '青椒', '泡椒', '醋', '糖'], likes: 245 },
  { title: '凯撒沙拉', authorId: 'user-4', desc: '清爽健康的经典沙拉', ingredients: ['生菜', '鸡胸肉', '面包丁', '帕玛森芝士', '凯撒酱'], likes: 123 },
  { title: '牛油果鸡蛋三明治', authorId: 'user-4', desc: '营养健康的早餐选择', ingredients: ['全麦面包', '牛油果', '鸡蛋', '番茄', '生菜', '橄榄油'], likes: 156 },
  { title: '藜麦鸡胸肉碗', authorId: 'user-4', desc: '高蛋白低脂健身餐', ingredients: ['藜麦', '鸡胸肉', '西兰花', '胡萝卜', '牛油果', '柠檬汁'], likes: 89 },
  { title: '红烧肉', authorId: 'user-1', desc: '肥而不腻入口即化', ingredients: ['五花肉', '冰糖', '酱油', '料酒', '八角', '桂皮', '姜'], likes: 289 },
  { title: '可乐鸡翅', authorId: 'user-1', desc: '简单美味的家常菜', ingredients: ['鸡翅', '可乐', '酱油', '姜', '蒜'], likes: 201 },
  { title: '宫保鸡丁', authorId: 'user-1', desc: '酸甜微辣花生香脆', ingredients: ['鸡胸肉', '花生', '干辣椒', '花椒', '葱', '蒜', '醋', '糖'], likes: 234 },
  { title: '蒜蓉西兰花', authorId: 'user-4', desc: '简单健康的清炒时蔬', ingredients: ['西兰花', '大蒜', '橄榄油', '盐'], likes: 78 },
  { title: '糖醋排骨', authorId: 'user-1', desc: '酸甜可口外酥里嫩', ingredients: ['猪小排', '醋', '糖', '酱油', '料酒', '番茄酱'], likes: 267 },
  { title: '草莓蛋糕', authorId: 'user-2', desc: '新鲜草莓配绵软戚风', ingredients: ['低筋面粉', '鸡蛋', '糖', '淡奶油', '草莓', '牛奶'], likes: 312 },
  { title: '酸辣土豆丝', authorId: 'user-3', desc: '爽脆开胃下饭菜', ingredients: ['土豆', '干辣椒', '花椒', '醋', '葱', '蒜'], likes: 178 },
  { title: '紫菜蛋花汤', authorId: 'user-1', desc: '简单快手的暖胃汤品', ingredients: ['紫菜', '鸡蛋', '虾皮', '葱花', '香油', '盐'], likes: 89 },
];

export const recipes: Recipe[] = recipeData.map((r, i) => ({
  id: uuidv4(),
  title: r.title,
  description: r.desc,
  ingredients: r.ingredients.map(name => ({ name, amount: ['适量', '200g', '1勺', '2个', '少许'][i % 5] })),
  steps: [
    { order: 1, description: '准备好所有食材，洗净备用。' },
    { order: 2, description: '将主要食材进行初步处理，切配好。' },
    { order: 3, description: '热锅下油，按照烹饪顺序加入食材翻炒。' },
    { order: 4, description: '加入调味料，翻炒均匀，煮至入味。' },
    { order: 5, description: '出锅装盘，点缀装饰即可享用。' },
  ],
  imageUrl: recipeImages[i % recipeImages.length],
  authorId: r.authorId,
  authorName: users.find(u => u.id === r.authorId)!.username,
  likes: r.likes,
  likedBy: [],
  createdAt: new Date(past15Days.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
  isPublic: true,
}));

export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    name: '最棒的意面',
    description: '分享你最拿手的意面菜谱！可以是经典的番茄肉酱意面、奶油蘑菇意面，或者你独创的创意意面。',
    rules: '1. 菜谱必须为意面类菜品\n2. 每人仅限投稿1篇\n3. 菜品需包含完整的食材和步骤\n4. 禁止抄袭他人菜谱',
    startDate: past15Days.toISOString(),
    endDate: in3Days.toISOString(),
    participantIds: ['user-5', 'user-1'],
    recipeIds: [],
    submissions: [],
    isActive: true,
  },
  {
    id: 'challenge-2',
    name: '夏日清爽甜品',
    description: '夏日炎炎，分享你的清爽甜品秘方！冰品、布丁、水果捞都可以，让我们一起清凉一夏。',
    rules: '1. 菜谱必须为甜品或冰品\n2. 适合夏季食用，清爽不腻\n3. 每人仅限投稿1篇\n4. 需包含成品图片',
