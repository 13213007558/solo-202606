export interface User {
  id: string;
  username: string;
  avatar: string;
}

export interface AuctionItem {
  id: string;
  name: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  endTime: number;
  images: string[];
  status: 'pending' | 'active' | 'ended';
  creatorName: string;
  createdAt: number;
}

export interface Bid {
  id: string;
  itemId: string;
  userId: string;
  username: string;
  avatar: string;
  amount: number;
  timestamp: number;
}
