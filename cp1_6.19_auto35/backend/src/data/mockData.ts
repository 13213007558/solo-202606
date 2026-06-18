import { Book, Challenge } from '../types';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20one%20hundred%20years%20of%20solitude&image_size=square',
    totalPages: 360,
    status: 'read',
    startDate: '2026-01-10',
    endDate: '2026-01-25',
    rating: 5
  },
  {
    id: '2',
    title: '活着',
    author: '余华',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20to%20live%20chinese%20literature&image_size=square',
    totalPages: 191,
    status: 'read',
    startDate: '2026-02-05',
    endDate: '2026-02-18',
    rating: 5
  },
  {
    id: '3',
    title: '三体',
    author: '刘慈欣',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20three%20body%20problem%20sci%20fi&image_size=square',
    totalPages: 302,
    status: 'reading',
    startDate: '2026-06-01'
  },
  {
    id: '4',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20sapiens%20human%20history&image_size=square',
    totalPages: 440,
    status: 'unread'
  },
  {
    id: '5',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20little%20prince&image_size=square',
    totalPages: 96,
    status: 'read',
    startDate: '2026-03-01',
    endDate: '2026-03-10',
    rating: 4
  },
  {
    id: '6',
    title: '围城',
    author: '钱钟书',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20fortress%20besieged%20chinese%20classic&image_size=square',
    totalPages: 359,
    status: 'unread'
  },
  {
    id: '7',
    title: '挪威的森林',
    author: '村上春树',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20norwegian%20wood&image_size=square',
    totalPages: 384,
    status: 'read',
    startDate: '2026-04-05',
    endDate: '2026-04-28',
    rating: 4
  },
  {
    id: '8',
    title: '设计心理学',
    author: '唐纳德·诺曼',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20design%20psychology&image_size=square',
    totalPages: 320,
    status: 'unread'
  }
];

export const mockChallenges: Challenge[] = [
  {
    id: 'c1',
    name: '30天读完3本书',
    targetBooks: 3,
    deadline: '2026-07-15',
    bookIds: ['1', '2'],
    createdAt: '2026-06-01'
  },
  {
    id: 'c2',
    name: '挑战1000页',
    targetBooks: 5,
    deadline: '2026-12-31',
    bookIds: ['1', '2', '5'],
    createdAt: '2026-01-01'
  }
];
