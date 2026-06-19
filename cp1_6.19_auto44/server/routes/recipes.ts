import { Router, Request, Response } from 'express';
import { recipes, generateId, users } from '../data';
import type { Recipe } from '../types';

const router = Router();

interface CreateRecipeBody {
  userId: string;
  name: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  steps: { order: number; description: string }[];
  imageUrl: string;
  isPublic?: boolean;
  challengeId?: string | null;
}

interface UpdateRecipeBody extends Partial<CreateRecipeBody> {}

interface LikeBody {
  userId: string;
}

router.get('/', (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const userId = typeof req.query.userId === 'string' ? req.query.userId : '';

  let result = recipes.filter((r) => r.isPublic);

  if (userId) {
    result = recipes.filter((r) => r.userId === userId);
  }

  if (search) {
    result = result.filter((r) => {
      const matchName = r.name.toLowerCase().includes(search);
      const matchDesc = r.description.toLowerCase().includes(search);
      const matchIngredient = r.ingredients.some((ing) =>
        ing.name.toLowerCase().includes(search)
      );
      return matchName || matchDesc || matchIngredient;
    });
  }

  result.sort((a, b) => b.likes - a.likes);

  res.status(200).json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const recipe = recipes.find((r) => r.id === req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: '菜谱不存在' });
  }
  res.status(200).json(recipe);
});

router.post('/', (req: Request<unknown, unknown, CreateRecipeBody>, res: Response) => {
  const {
    userId,
    name,
    description,
    ingredients,
    steps,
    imageUrl,
    isPublic = true,
    challengeId = null
  } = req.body;

  if (!userId || !name || !description || !ingredients || !steps || !imageUrl) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const newRecipe: Recipe = {
    id: generateId(),
    userId,
    authorName: user.username,
    name,
    description,
    ingredients,
    steps: steps.length > 0 ? steps : [],
    imageUrl,
    likes: 0,
    likedBy: [],
    isPublic,
    challengeId,
    createdAt: new Date().toISOString()
  };

  recipes.unshift(newRecipe);
  res.status(201).json(newRecipe);
});

router.put('/:id', (req: Request<{ id: string }, unknown, UpdateRecipeBody>, res: Response) => {
  const idx = recipes.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  const existing = recipes[idx];
  const updated: Recipe = {
    ...existing,
    ...req.body,
    steps: req.body.steps ?? existing.steps,
    ingredients: req.body.ingredients ?? existing.ingredients
  };

  recipes[idx] = updated;
  res.status(200).json(updated);
});

router.post('/:id/like', (req: Request<{ id: string }, unknown, LikeBody>, res: Response) => {
  const { userId } = req.body;
  const recipe = recipes.find((r) => r.id === req.params.id);

  if (!recipe) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  if (!userId) {
    return res.status(400).json({ error: '缺少userId' });
  }

  const alreadyLiked = recipe.likedBy.includes(userId);
  if (alreadyLiked) {
    recipe.likedBy = recipe.likedBy.filter((id) => id !== userId);
    recipe.likes = Math.max(0, recipe.likes - 1);
  } else {
    recipe.likedBy.push(userId);
    recipe.likes += 1;
  }

  res.status(200).json({
    likes: recipe.likes,
    liked: !alreadyLiked,
    likedBy: recipe.likedBy
  });
});

export default router;
