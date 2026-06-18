export interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
  bio: string;
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Step {
  order: number;
  description: string;
}

export interface Recipe {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  imageUrl: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  challengeId?: string;
  isPublic: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participantRecipes: string[];
  winners?: {
    first: { recipeId: string; userId: string; username: string } | null;
    second: { recipeId: string; userId: string; username: string } | null;
    third: { recipeId: string; userId: string; username: string } | null;
  };
}

export interface Trophy {
  id: string;
  userId: string;
  challengeId: string;
  challengeTitle: string;
  rank: 'first' | 'second' | 'third';
  awardedAt: string;
}
