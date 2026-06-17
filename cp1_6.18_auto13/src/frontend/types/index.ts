export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  username: string;
  rating: number;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
}
