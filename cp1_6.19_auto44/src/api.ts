import axios from 'axios';
import type {
  SafeUser,
  Recipe,
  Trophy,
  Challenge,
  ChallengeDetail,
  Ingredient,
  RecipeStep
} from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
});

export const authApi = {
  register: (username: string, password: string) =>
    api.post<SafeUser>('/users/register', { username, password }).then((r) => r.data),
  login: (username: string, password: string) =>
    api.post<SafeUser>('/users/login', { username, password }).then((r) => r.data)
};

export const userApi = {
  getProfile: (id: string) =>
    api.get<SafeUser>(`/users/${id}`).then((r) => r.data),
  getUserRecipes: (id: string) =>
    api.get<Recipe[]>(`/users/${id}/recipes`).then((r) => r.data),
  getUserTrophies: (id: string) =>
    api.get<Trophy[]>(`/users/${id}/trophies`).then((r) => r.data)
};

export interface CreateRecipePayload {
  userId: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  imageUrl: string;
  isPublic?: boolean;
  challengeId?: string | null;
}

export const recipeApi = {
  getRecipes: (params?: { search?: string; userId?: string }) =>
    api.get<Recipe[]>('/recipes', { params }).then((r) => r.data),
  getRecipe: (id: string) =>
    api.get<Recipe>(`/recipes/${id}`).then((r) => r.data),
  createRecipe: (payload: CreateRecipePayload) =>
    api.post<Recipe>('/recipes', payload).then((r) => r.data),
  updateRecipe: (id: string, payload: Partial<CreateRecipePayload>) =>
    api.put<Recipe>(`/recipes/${id}`, payload).then((r) => r.data),
  likeRecipe: (id: string, userId: string) =>
    api
      .post<{ likes: number; liked: boolean; likedBy: string[] }>(
        `/recipes/${id}/like`,
        { userId }
      )
      .then((r) => r.data)
};

export const challengeApi = {
  getActive: () =>
    api.get<Challenge>('/challenges/active').then((r) => r.data),
  getDetail: (id: string) =>
    api.get<ChallengeDetail>(`/challenges/${id}/detail`).then((r) => r.data),
  participate: (challengeId: string, userId: string, recipeId: string) =>
    api
      .post<{ message: string; challenge: Challenge; recipe: Recipe }>(
        `/challenges/${challengeId}/participate`,
        { userId, recipeId }
      )
      .then((r) => r.data)
};
