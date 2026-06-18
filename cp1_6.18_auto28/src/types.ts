export interface User {
  id: string;
  username: string;
  theme: string;
  stats: {
    totalWorks: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
    dailyLikes: { date: string; count: number }[];
  };
  createdAt: string;
}

export interface Work {
  id: string;
  userId: string;
  title: string;
  lyricist: string;
  composer: string;
  lyrics: string;
  audioUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  workId: string;
  userId: string;
  username: string;
  content: string;
  parentId: string | null;
  createdAt: string;
}

export interface Performance {
  id: string;
  workId: string;
  title: string;
  date: string;
  location: string;
  ticketUrl: string;
  createdAt: string;
}

export type ThemeName = 'night-purple' | 'dawn-orange' | 'forest-green' | 'ocean-blue' | 'minimal-gray';
