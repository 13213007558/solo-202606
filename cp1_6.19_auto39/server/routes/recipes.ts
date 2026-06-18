import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recipes, users } from '../data';
import type { Recipe, Ingredient, Step } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { search } = req.query;
  let result = recipes.filter(r => r.isPublic);

  if (search && typeof search === 'string') {
    const keyword = search.toLowerCase();
    result = result.filter(
      r =>
        r.title.toLowerCase().includes(keyword) ||
        r.description.toLowerCase().includes(keyword) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(keyword))
    );
  }

  result.sort((a, b) => b.likes - a.likes);
  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const recipe = recipes.find(r => r.id === req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: '菜谱不存在' });
  }
  res.json(recipe);
});

router.post('/', (req: Request, res: Response) => {
  const { userId, title, description, ingredients, steps, imageUrl } = req.body;

  if (!userId || !title || !description || !ingredients || !steps || !imageUrl) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const newRecipe: Recipe = {
    id: uuidv4(),
    userId,
    username: user.username,
    title,
    description,
    ingredients: ingredients as Ingredient[],
    steps: steps as Step[],
    imageUrl,
    likes: 0,
    likedBy: [],
    createdAt: new Date().toISOString().split('T')[0],
    isPublic: true,
  };

  recipes.unshift(newRecipe);
  res.status(201).json(newRecipe);
});

router.put('/:id', (req: Request, res: Response) => {
  const recipeIndex = recipes.findIndex(r => r.id === req.params.id);
  if (recipeIndex === -1) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  const { title, description, ingredients, steps, imageUrl } = req.body;
  const recipe = recipes[recipeIndex];

  if (title !== undefined) recipe.title = title;
  if (description !== undefined) recipe.description = description;
  if (ingredients !== undefined) recipe.ingredients = ingredients as Ingredient[];
  if (steps !== undefined) recipe.steps = steps as Step[];
  if (imageUrl !== undefined) recipe.imageUrl = imageUrl;

  res.json(recipe);
});

router.post('/:id/like', (req: Request, res: Response) => {
  const { userId } = req.body;
  const recipe = recipes.find(r => r.id === req.params.id);

  if (!recipe) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  if (!userId) {
    return res.status(400).json({ error: '缺少用户ID' });
  }

  const likeIndex = recipe.likedBy.indexOf(userId);
  if (likeIndex === -1) {
    recipe.likedBy.push(userId);
    recipe.likes++;
    return res.json({ liked: true, likes: recipe.likes });
  } else {
    recipe.likedBy.splice(likeIndex, 1);
    recipe.likes--;
    return res.json({ liked: false, likes: recipe.likes });
  }
});

export default router;
