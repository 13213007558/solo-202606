export interface SafeUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

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
  userId: string;
  authorName: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  imageUrl: string;
  likes: number;
  likedBy: string[];
  isPublic: boolean;
  challengeId?: string | null;
  createdAt: string;
}

export type TrophyRank = 'gold' | 'silver' | 'bronze';

export interface Trophy {
  id: string;
  userId: string;
  challengeId: string;
  challengeTitle: string;
  rank: TrophyRank;
  awardedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string;
  startTime: string;
  endTime: string;
  participantRecipeIds: string[];
  winners?: {
    rank: number;
    recipeId: string;
    userId: string;
    username: string;
  }[];
  ended: boolean;
}

export interface ChallengeDetail extends Challenge {
  participantRecipes: Recipe[];
}
