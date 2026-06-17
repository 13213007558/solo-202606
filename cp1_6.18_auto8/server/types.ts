export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: number;
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  coverUrl: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  totalTime: number;
  likes: number;
  likedBy: string[];
  rating: number;
  ratingCount: number;
  createdAt: number;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  parentId: string | null;
  replyToId?: string;
  replyToUsername?: string;
  createdAt: number;
}

export interface DecodedToken {
  userId: string;
  username: string;
}
