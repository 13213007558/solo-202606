export interface Participant {
  id: string;
  name: string;
  avatar: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
}

export interface Activity {
  id: string;
  type: 'join' | 'message' | 'like';
  userId: string;
  userName: string;
  userAvatar: string;
  content?: string;
  timestamp: Date;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  coverImages: string[];
  location: string;
  description: string;
  tags: string[];
  inviteCode: string;
  participants: Participant[];
  messages: Message[];
  activities: Activity[];
  isPublic: boolean;
  createdAt: Date;
}
