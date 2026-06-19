export interface Ingredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  order: number;
  description: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  imageUrl: string;
  authorId: string;
  authorName: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  isPublic: boolean;
  challengeId?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface Trophy {
  id: string;
  userId: string;
  challengeId: string;
  challengeName: string;
  rank: number;
  icon: string;
  earnedAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  rules: string;
  startDate: string;
  endDate: string;
  participantIds: string[];
  recipeIds: string[];
  submissions: { userId: string; recipeId: string }[];
  isActive: boolean;
  winners?: { userId: string; recipeId: string; rank: number }[];
}
