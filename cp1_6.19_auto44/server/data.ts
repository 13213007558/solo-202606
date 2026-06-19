import { v4 as uuidv4 } from 'uuid';
import type { User, Recipe, Challenge, Trophy, Ingredient, RecipeStep } from './types';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

export const users: User[] = [
  {
    id: 'u1',
    username: '厨神小王',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef1',
    bio: '热爱家常菜，擅长川菜和粤菜',
    createdAt: daysAgo(120)
  },
  {
    id: 'u2',
    username: '甜品小美',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef2',
    bio: '专注甜品烘焙十年',
    createdAt: daysAgo(90)
  },
  {
    id: 'u3',
    username: '面食大师',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef3',
    bio: '山西人，专注各类面食',
    createdAt: daysAgo(200)
  },
  {
    id: 'u4',
    username: '健身餐达人',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef4',
    bio: '低卡健康餐分享',
    createdAt: daysAgo(60)
  },
  {
    id: 'u5',
    username: '家庭煮夫阿强',
    password: '123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef5',
    bio: '给老婆孩子做饭是最大的幸福',
    createdAt: daysAgo(150)
  }
];

const makeIngredients = (list: [string, string][]): Ingredient[] =>
  list.map(([name, amount]) => ({ name, amount }));

const makeSteps = (descs: string[]): RecipeStep[] =>
  descs.map((description, i) => ({ order: i + 1, description }));

const img = (kw: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    kw
  )}&image_size=square`;

export const recipes: Recipe[] = [
  {
    id: 'r1',
    userId: 'u1',
    authorName: '厨神小王',
    name: '麻婆豆腐',
    description: '经典川菜，麻辣鲜香，嫩滑可口，配米饭绝配',
    ingredients: makeIngredients([
      ['嫩豆腐', '1块'],
      ['牛肉末', '100g'],
      ['郫县豆瓣酱', '2勺'],
      ['花椒粉', '1勺'],
      ['葱花', '适量'],
      ['生抽', '1勺'],
      ['蒜末', '3瓣']
    ]),
    steps: makeSteps([
      '豆腐切块，用盐水浸泡5分钟后捞出',
      '锅中热油，放入牛肉末炒至变色',
      '加入豆瓣酱和蒜末炒出红油',
      '加入适量清水煮开，放入豆腐',
      '加生抽调味，小火煮3分钟',
      '勾芡后撒上花椒粉和葱花即可出锅'
    ]),
    imageUrl: img('麻婆豆腐，川菜，家常菜，美食摄影，45度俯视'),
    likes: 128,
    likedBy: ['u2', 'u3', 'u4', 'u5'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(30)
  },
  {
    id: 'r2',
    userId: 'u2',
    authorName: '甜品小美',
    name: '芒果班戟',
    description: '港式经典甜品，奶油香浓，芒果鲜甜',
    ingredients: makeIngredients([
      ['低筋面粉', '80g'],
      ['鸡蛋', '2个'],
      ['牛奶', '200ml'],
      ['淡奶油', '200ml'],
      ['糖粉', '30g'],
      ['芒果', '2个'],
      ['黄油', '20g']
    ]),
    steps: makeSteps([
      '鸡蛋打散，加入牛奶和融化的黄油搅拌均匀',
      '筛入低筋面粉，搅拌至无颗粒',
      '平底锅小火，倒入面糊摊成薄饼，两面熟后晾凉',
      '淡奶油加糖粉打发至硬性发泡',
      '芒果切块',
      '饼皮中央放奶油和芒果，包成四方形即可'
    ]),
    imageUrl: img('芒果班戟，港式甜品，奶油芒果，精致摆盘'),
    likes: 256,
    likedBy: ['u1', 'u3', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c2',
    createdAt: daysAgo(15)
  },
  {
    id: 'r3',
    userId: 'u3',
    authorName: '面食大师',
    name: '手工意大利面',
    description: '自制面条配经典番茄肉酱，口感Q弹有嚼劲',
    ingredients: makeIngredients([
      ['高筋面粉', '300g'],
      ['鸡蛋', '3个'],
      ['橄榄油', '1勺'],
      ['牛肉末', '200g'],
      ['番茄罐头', '1罐'],
      ['洋葱', '半个'],
      ['大蒜', '4瓣'],
      ['罗勒叶', '适量'],
      ['帕玛森芝士', '适量']
    ]),
    steps: makeSteps([
      '面粉堆成山丘，中间打入鸡蛋，加橄榄油',
      '揉成光滑面团，醒发30分钟',
      '用面条机压成薄片，切出细面条',
      '洋葱大蒜切碎，锅中炒香',
      '加牛肉末炒散，倒入番茄罐头',
      '小火熬煮20分钟，加罗勒调味',
      '面条煮8分钟捞出，拌上肉酱撒芝士'
    ]),
    imageUrl: img('手工意大利面，番茄肉酱面，西餐美食，木质桌面'),
    likes: 189,
    likedBy: ['u1', 'u2', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c1',
    createdAt: daysAgo(20)
  },
  {
    id: 'r4',
    userId: 'u4',
    authorName: '健身餐达人',
    name: '鸡胸肉牛油果沙拉',
    description: '高蛋白低脂，健身增肌必备，饱腹又美味',
    ingredients: makeIngredients([
      ['鸡胸肉', '200g'],
      ['牛油果', '1个'],
      ['生菜', '1颗'],
      ['小番茄', '10颗'],
      ['橄榄油', '2勺'],
      ['柠檬汁', '1勺'],
      ['黑胡椒', '适量'],
      ['盐', '适量']
    ]),
    steps: makeSteps([
      '鸡胸肉用盐和黑胡椒腌制10分钟',
      '平底锅喷少许油，煎至两面金黄',
      '切片备用',
      '生菜洗净撕小块，小番茄对半切',
      '牛油果去核切块',
      '所有食材混合，淋橄榄油和柠檬汁拌匀'
    ]),
    imageUrl: img('鸡胸肉牛油果沙拉，健身餐，健康轻食，清新摆盘'),
    likes: 95,
    likedBy: ['u1', 'u2', 'u5'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(10)
  },
  {
    id: 'r5',
    userId: 'u5',
    authorName: '家庭煮夫阿强',
    name: '红烧排骨',
    description: '家常硬菜，肉质软烂脱骨，汤汁浓郁拌饭',
    ingredients: makeIngredients([
      ['猪小排', '500g'],
      ['生姜', '4片'],
      ['大葱', '1根'],
      ['八角', '2个'],
      ['冰糖', '30g'],
      ['生抽', '2勺'],
      ['老抽', '1勺'],
      ['料酒', '2勺']
    ]),
    steps: makeSteps([
      '排骨冷水下锅，加料酒焯水去血沫，捞出',
      '锅中放少许油，加冰糖小火炒糖色',
      '糖色变枣红色时倒入排骨翻炒上色',
      '加入葱姜八角爆香',
      '加生抽老抽调味，倒入开水没过排骨',
      '大火烧开转小火炖40分钟',
      '大火收汁即可出锅'
    ]),
    imageUrl: img('红烧排骨，家常菜，中式烹饪，深色酱汁，诱人光泽'),
    likes: 210,
    likedBy: ['u1', 'u2', 'u3', 'u4'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(25)
  },
  {
    id: 'r6',
    userId: 'u1',
    authorName: '厨神小王',
    name: '水煮肉片',
    description: '麻辣鲜香的川菜代表，肉片滑嫩，汤汁浓郁',
    ingredients: makeIngredients([
      ['猪里脊', '300g'],
      ['豆芽', '200g'],
      ['郫县豆瓣酱', '2勺'],
      ['干辣椒', '一把'],
      ['花椒', '1勺'],
      ['蛋清', '1个'],
      ['淀粉', '1勺'],
      ['蒜末', '适量']
    ]),
    steps: makeSteps([
      '里脊切薄片，加蛋清淀粉抓匀上浆',
      '豆芽焯水铺在碗底',
      '锅中热油，豆瓣酱炒出红油',
      '加水煮开，下入肉片滑熟',
      '连汤倒入碗中，撒上干辣椒花椒蒜末',
      '浇一勺滚烫的热油激出香味'
    ]),
    imageUrl: img('水煮肉片，川菜，麻辣，红油，葱花点缀'),
    likes: 176,
    likedBy: ['u2', 'u3', 'u5'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(35)
  },
  {
    id: 'r7',
    userId: 'u2',
    authorName: '甜品小美',
    name: '提拉米苏',
    description: '意式经典甜品，咖啡酒香与马斯卡彭的完美融合',
    ingredients: makeIngredients([
      ['马斯卡彭奶酪', '500g'],
      ['手指饼干', '200g'],
      ['浓缩咖啡', '200ml'],
      ['淡奶油', '300ml'],
      ['蛋黄', '4个'],
      ['细砂糖', '100g'],
      ['可可粉', '适量'],
      ['朗姆酒', '2勺']
    ]),
    steps: makeSteps([
      '蛋黄加糖隔水加热打发至浓稠',
      '冷却后拌入马斯卡彭奶酪',
      '淡奶油打发至6分发，与奶酪糊混合',
      '咖啡加朗姆酒混合',
      '手指饼干快速蘸咖啡铺在容器底部',
      '铺一层奶酪糊，重复操作',
      '冷藏4小时以上，食用前筛可可粉'
    ]),
    imageUrl: img('提拉米苏，意式甜品，可可粉，方形玻璃容器'),
    likes: 302,
    likedBy: ['u1', 'u3', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c2',
    createdAt: daysAgo(18)
  },
  {
    id: 'r8',
    userId: 'u3',
    authorName: '面食大师',
    name: '奶油培根意面',
    description: '经典Carbonara，浓郁奶香与培根的咸香',
    ingredients: makeIngredients([
      ['意大利面', '200g'],
      ['培根', '150g'],
      ['蛋黄', '3个'],
      ['帕玛森芝士', '80g'],
      ['黑胡椒', '大量'],
      ['蒜', '2瓣'],
      ['淡奶油', '100ml']
    ]),
    steps: makeSteps([
      '意面煮至八分熟，保留面汤',
      '培根切条，小火煎至金黄酥脆',
      '蛋黄加芝士和淡奶油搅匀',
      '将意面放入培根锅，关火',
      '倒入蛋黄液快速拌匀，用余温加热',
      '加面汤调整浓稠度，撒大量黑胡椒'
    ]),
    imageUrl: img('奶油培根意面，Carbonara，西餐美食，芝士撒粉'),
    likes: 167,
    likedBy: ['u1', 'u2', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c1',
    createdAt: daysAgo(22)
  },
  {
    id: 'r9',
    userId: 'u4',
    authorName: '健身餐达人',
    name: '藜麦三文鱼碗',
    description: '超级食物搭配，Omega-3与完全蛋白的营养组合',
    ingredients: makeIngredients([
      ['三文鱼', '200g'],
      ['藜麦', '100g'],
      ['紫薯', '1个'],
      ['西兰花', '1颗'],
      ['牛油果', '半个'],
      ['酱油', '1勺'],
      ['蜂蜜', '半勺'],
      ['柠檬汁', '少许']
    ]),
    steps: makeSteps([
      '藜麦洗净煮15分钟至出芽',
      '紫薯切块蒸熟',
      '西兰花焯水',
      '三文鱼用酱油蜂蜜腌10分钟，煎至两面熟',
      '碗中铺藜麦，摆放所有食材',
      '挤柠檬汁点缀即可'
    ]),
    imageUrl: img('藜麦三文鱼碗，健康餐，波奇碗，色彩丰富的食材摆盘'),
    likes: 88,
    likedBy: ['u1', 'u2'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(12)
  },
  {
    id: 'r10',
    userId: 'u5',
    authorName: '家庭煮夫阿强',
    name: '糖醋里脊',
    description: '酸甜可口，外酥里嫩，小朋友最爱',
    ingredients: makeIngredients([
      ['猪里脊', '400g'],
      ['番茄酱', '4勺'],
      ['白醋', '2勺'],
      ['白糖', '3勺'],
      ['淀粉', '大量'],
      ['鸡蛋', '1个'],
      ['盐', '少许']
    ]),
    steps: makeSteps([
      '里脊切条，加盐料酒腌制',
      '加鸡蛋和淀粉裹糊',
      '油温六成热下锅炸至金黄捞出',
      '升高油温复炸至酥脆',
      '锅中留底油，番茄酱糖醋调汁',
      '汁熬稠后倒入里脊快速翻匀'
    ]),
    imageUrl: img('糖醋里脊，中式家常菜，酸甜酱汁，金黄酥脆，芝麻点缀'),
    likes: 198,
    likedBy: ['u1', 'u2', 'u3', 'u4'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(28)
  },
  {
    id: 'r11',
    userId: 'u1',
    authorName: '厨神小王',
    name: '宫保鸡丁',
    description: '川菜经典，鸡肉鲜嫩，花生酥脆，糊辣荔枝味',
    ingredients: makeIngredients([
      ['鸡胸肉', '300g'],
      ['花生米', '50g'],
      ['干辣椒', '10个'],
      ['花椒', '1勺'],
      ['大葱', '2根'],
      ['生抽', '1勺'],
      ['醋', '1勺'],
      ['白糖', '1勺'],
      ['淀粉', '适量']
    ]),
    steps: makeSteps([
      '鸡胸切丁，加生抽料酒淀粉抓匀',
      '碗中调汁：生抽醋糖淀粉水',
      '花生米炸至金黄酥脆',
      '锅中热油，爆香干辣椒花椒',
      '倒入鸡丁快速划散',
      '加葱段翻炒，倒入调好的汁',
      '最后加入花生米翻匀出锅'
    ]),
    imageUrl: img('宫保鸡丁，川菜，鸡肉花生米，干辣椒，中式炒锅'),
    likes: 154,
    likedBy: ['u2', 'u3', 'u4'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(40)
  },
  {
    id: 'r12',
    userId: 'u2',
    authorName: '甜品小美',
    name: '杨枝甘露',
    description: '港式经典消暑甜品，芒果西柚西米的完美组合',
    ingredients: makeIngredients([
      ['芒果', '3个'],
      ['西柚', '半个'],
      ['西米', '80g'],
      ['椰浆', '200ml'],
      ['淡奶油', '50ml'],
      ['白糖', '30g']
    ]),
    steps: makeSteps([
      '西米煮至中心小白点，关火焖至透明，过凉水',
      '两个芒果取肉打成果泥',
      '一个芒果切小丁',
      '西柚撕出果肉',
      '芒果泥加椰浆奶油糖搅匀',
      '碗中放西米，倒入芒果椰浆',
      '撒芒果丁和西柚果肉'
    ]),
    imageUrl: img('杨枝甘露，港式甜品，芒果西米，玻璃碗，清新夏日'),
    likes: 276,
    likedBy: ['u1', 'u3', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c2',
    createdAt: daysAgo(16)
  },
  {
    id: 'r13',
    userId: 'u3',
    authorName: '面食大师',
    name: '海鲜意面',
    description: '虾仁鱿鱼蛤蜊的鲜味与白葡萄酒的完美搭配',
    ingredients: makeIngredients([
      ['意大利面', '200g'],
      ['虾仁', '150g'],
      ['鱿鱼圈', '100g'],
      ['蛤蜊', '200g'],
      ['白葡萄酒', '100ml'],
      ['蒜', '5瓣'],
      ['欧芹', '适量'],
      ['橄榄油', '2勺'],
      ['小番茄', '8颗']
    ]),
    steps: makeSteps([
      '意面煮至八分熟',
      '海鲜洗净沥水，蛤蜊提前吐沙',
      '橄榄油爆香蒜末',
      '下海鲜翻炒，加白葡萄酒煮至蛤蜊开口',
      '小番茄对切放入',
      '加入意面和少许面汤翻匀',
      '撒欧芹碎和黑胡椒'
    ]),
    imageUrl: img('海鲜意面，虾仁鱿鱼蛤蜊，白酒蒜香，西餐美食摄影'),
    likes: 145,
    likedBy: ['u1', 'u2', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c1',
    createdAt: daysAgo(21)
  },
  {
    id: 'r14',
    userId: 'u4',
    authorName: '健身餐达人',
    name: '蔬菜燕麦能量碗',
    description: '高纤维低热量早餐，饱腹感强营养均衡',
    ingredients: makeIngredients([
      ['即食燕麦', '50g'],
      ['希腊酸奶', '150g'],
      ['蓝莓', '50g'],
      ['草莓', '3颗'],
      ['奇亚籽', '1勺'],
      ['杏仁片', '15g'],
      ['蜂蜜', '1勺'],
      ['香蕉', '半根']
    ]),
    steps: makeSteps([
      '燕麦用少量温水泡5分钟',
      '碗底铺燕麦',
      '倒上希腊酸奶',
      '香蕉切片，草莓切块',
      '摆上所有水果',
      '撒奇亚籽和杏仁片',
      '淋蜂蜜即可享用'
    ]),
    imageUrl: img('燕麦能量碗，希腊酸奶水果，蓝莓草莓，健康早餐，木质桌面'),
    likes: 73,
    likedBy: ['u2', 'u5'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(8)
  },
  {
    id: 'r15',
    userId: 'u5',
    authorName: '家庭煮夫阿强',
    name: '可乐鸡翅',
    description: '零失败新手菜，甜香软糯，孩子最爱',
    ingredients: makeIngredients([
      ['鸡翅中', '500g'],
      ['可乐', '1罐'],
      ['生抽', '2勺'],
      ['老抽', '1勺'],
      ['料酒', '1勺'],
      ['姜', '3片'],
      ['葱', '2段']
    ]),
    steps: makeSteps([
      '鸡翅两面划几刀便于入味',
      '冷水下锅焯水去腥，捞出沥干',
      '锅中少油，鸡翅煎至两面金黄',
      '加葱姜爆香',
      '倒入可乐没过鸡翅，加生抽老抽料酒',
      '大火烧开转中小火炖15分钟',
      '大火收汁至浓稠即可'
    ]),
    imageUrl: img('可乐鸡翅，家常菜，甜蜜色泽，新手菜，摆盘特写'),
    likes: 245,
    likedBy: ['u1', 'u2', 'u3', 'u4'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(32)
  },
  {
    id: 'r16',
    userId: 'u1',
    authorName: '厨神小王',
    name: '鱼香肉丝',
    description: '川味鱼香汁，酸甜咸辣，下饭神器',
    ingredients: makeIngredients([
      ['猪里脊', '300g'],
      ['胡萝卜', '半根'],
      ['木耳', '5朵'],
      ['青椒', '半个'],
      ['泡椒', '3个'],
      ['葱', '2根'],
      ['姜蒜', '适量'],
      ['生抽醋糖', '各1勺']
    ]),
    steps: makeSteps([
      '里脊切丝，加生抽淀粉上浆',
      '配菜切丝备用',
      '碗中调鱼香汁：生抽醋糖淀粉水',
      '肉丝下锅滑炒至变色盛出',
      '锅留底油爆香姜蒜泡椒',
      '下配菜丝翻炒，倒入鱼香汁',
      '放入肉丝翻匀撒葱花出锅'
    ]),
    imageUrl: img('鱼香肉丝，川菜经典，下饭神器，肉丝胡萝卜木耳'),
    likes: 162,
    likedBy: ['u2', 'u3', 'u4', 'u5'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(38)
  },
  {
    id: 'r17',
    userId: 'u2',
    authorName: '甜品小美',
    name: '草莓慕斯蛋糕',
    description: '粉嫩少女心，入口即化的草莓慕斯',
    ingredients: makeIngredients([
      ['消化饼干', '100g'],
      ['黄油', '50g'],
      ['淡奶油', '300ml'],
      ['草莓', '300g'],
      ['吉利丁片', '3片'],
      ['细砂糖', '60g'],
      ['奶油奶酪', '150g']
    ]),
    steps: makeSteps([
      '饼干碾碎加融化黄油压入模底冷藏',
      '吉利丁片冷水泡软',
      '草莓取一半打成果泥',
      '奶油奶酪加糖打发顺滑',
      '淡奶油打至6分发，与奶酪糊混合',
      '吉利丁隔水融化，与草莓果泥加入糊中',
      '倒入模具冷藏4小时，用草莓装饰'
    ]),
    imageUrl: img('草莓慕斯蛋糕，粉色甜品，奶油草莓，精致蛋糕切片'),
    likes: 288,
    likedBy: ['u1', 'u3', 'u4', 'u5'],
    isPublic: true,
    challengeId: 'c2',
    createdAt: daysAgo(14)
  },
  {
    id: 'r18',
    userId: 'u3',
    authorName: '面食大师',
    name: '番茄罗勒意面',
    description: '意式经典素食意面，番茄的酸甜与罗勒的清香',
    ingredients: makeIngredients([
      ['意大利面', '200g'],
      ['新鲜番茄', '500g'],
      ['新鲜罗勒', '一把'],
      ['大蒜', '4瓣'],
      ['初榨橄榄油', '3勺'],
      ['帕玛森芝士', '适量'],
      ['盐', '适量']
    ]),
    steps: makeSteps([
      '番茄顶部划十字，开水烫后去皮切丁',
      '大蒜切片',
      '橄榄油小火炒香蒜片',
      '加入番茄丁中火熬煮出汁',
      '加入罗勒叶继续煮10分钟',
      '意面煮好拌入酱汁，撒芝士和新鲜罗勒'
    ]),
    imageUrl: img('番茄罗勒意面，素食意面，新鲜罗勒叶，番茄酱汁，意大利美食'),
    likes: 133,
    likedBy: ['u1', 'u2', 'u4'],
    isPublic: true,
    challengeId: 'c1',
    createdAt: daysAgo(19)
  },
  {
    id: 'r19',
    userId: 'u4',
    authorName: '健身餐达人',
    name: '烤蔬菜沙拉',
    description: '低温烘烤蔬菜的天然甜味，配香草橄榄油',
    ingredients: makeIngredients([
      ['南瓜', '200g'],
      ['彩椒', '各半个'],
      ['西葫芦', '1根'],
      ['口蘑', '8个'],
      ['橄榄油', '3勺'],
      ['迷迭香', '2枝'],
      ['海盐', '适量'],
      ['黑胡椒', '适量']
    ]),
    steps: makeSteps([
      '南瓜彩椒西葫芦切块',
      '口蘑对切',
      '所有蔬菜放入大碗',
      '加橄榄油海盐黑胡椒迷迭香拌匀',
      '预热烤箱200度',
      '蔬菜平铺烤盘，烤25-30分钟',
      '取出摆盘，可配坚果碎'
    ]),
    imageUrl: img('烤蔬菜沙拉，彩色烤蔬菜，橄榄油迷迭香，健康素食，烤箱美食'),
    likes: 69,
    likedBy: ['u2', 'u5'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(6)
  },
  {
    id: 'r20',
    userId: 'u5',
    authorName: '家庭煮夫阿强',
    name: '红烧肉',
    description: '入口即化的经典红烧肉，肥而不腻瘦而不柴',
    ingredients: makeIngredients([
      ['五花肉', '800g'],
      ['冰糖', '40g'],
      ['生抽', '3勺'],
      ['老抽', '1.5勺'],
      ['料酒', '3勺'],
      ['八角桂皮', '各2个'],
      ['葱姜', '适量'],
      ['干辣椒', '5个']
    ]),
    steps: makeSteps([
      '五花肉切2cm方块，冷水下锅焯水',
      '锅中少油，加冰糖小火炒糖色',
      '倒入五花肉翻炒裹色',
      '加葱姜八角桂皮干辣椒爆香',
      '淋料酒和生抽老抽调味',
      '倒入开水没过肉，大火烧开转小火',
      '慢炖1小时，大火收汁至浓稠亮泽'
    ]),
    imageUrl: img('红烧肉，中式家常硬菜，肥而不腻，深色陶罐，冰糖色泽'),
    likes: 312,
    likedBy: ['u1', 'u2', 'u3', 'u4'],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(45)
  }
];

for (let i = 21; i <= 100; i++) {
  const authors = [
    { userId: 'u1', authorName: '厨神小王' },
    { userId: 'u2', authorName: '甜品小美' },
    { userId: 'u3', authorName: '面食大师' },
    { userId: 'u4', authorName: '健身餐达人' },
    { userId: 'u5', authorName: '家庭煮夫阿强' }
  ];
  const pick = authors[(i - 1) % authors.length];
  const names = [
    '青椒土豆丝', '番茄炒蛋', '蛋炒饭', '紫菜蛋花汤', '凉拌黄瓜',
    '蒜蓉西兰花', '葱爆牛肉', '糖醋白菜', '酸辣土豆丝', '西红柿牛腩汤',
    '红烧茄子', '地三鲜', '椒盐虾', '蒜蓉粉丝蒸扇贝', '凉拌木耳',
    '冬瓜排骨汤', '咖喱鸡饭', '韩式泡菜炒饭', '日式照烧鸡', '泰式冬阴功汤'
  ];
  const rname = names[(i - 1) % names.length] + (i > 40 ? `（家常版${i}）` : '');
  recipes.push({
    id: 'r' + i,
    userId: pick.userId,
    authorName: pick.authorName,
    name: rname,
    description: '这是一道简单美味的家常菜，适合新手练习，全家老少都喜欢吃',
    ingredients: [
      { name: '主料', amount: '300g' },
      { name: '辅料', amount: '适量' },
      { name: '盐', amount: '少许' },
      { name: '生抽', amount: '1勺' }
    ],
    steps: [
      { order: 1, description: '主料洗净切好备用' },
      { order: 2, description: '锅中热油爆香调料' },
      { order: 3, description: '下主料翻炒至熟' },
      { order: 4, description: '调味出锅装盘' }
    ],
    imageUrl: img(`家常美食${i}，中式烹饪，温馨家庭餐桌`),
    likes: Math.floor(Math.random() * 200) + 10,
    likedBy: [],
    isPublic: true,
    challengeId: null,
    createdAt: daysAgo(Math.floor(Math.random() * 60))
  });
}

export const challenges: Challenge[] = [
  {
    id: 'c1',
    title: '最棒的意面',
    description: '展示你的意面烹饪技艺！无论是经典番茄肉酱还是创意海鲜意面，都欢迎来挑战！',
    rules: '1. 必须为意面类菜品；\n2. 每人限投稿1个菜谱；\n3. 菜品需公开可见；\n4. 社区点赞数量决定名次。',
    startTime: daysAgo(7),
    endTime: daysFromNow(5),
    participantRecipeIds: ['r3', 'r8', 'r13', 'r18'],
    winners: undefined,
    ended: false
  },
  {
    id: 'c2',
    title: '夏日清爽甜品',
    description: '炎炎夏日，来一份清爽甜品吧！冰凉、低卡、高颜值，满足你对夏天的所有期待！',
    rules: '1. 必须为甜品；\n2. 适合夏季食用；\n3. 每人限投稿1个菜谱；\n4. 菜品需公开可见；\n5. 点赞最多的前三名为获胜者。',
    startTime: daysAgo(10),
    endTime: daysFromNow(10),
    participantRecipeIds: ['r2', 'r7', 'r12', 'r17'],
    winners: undefined,
    ended: false
  }
];

export const trophies: Trophy[] = [];

export const generateId = () => uuidv4();
