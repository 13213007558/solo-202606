import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recipes, users } from '../data.js';
import { Recipe } from '../types.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  let result = recipes.filter(r => r.isPublic);
  if (search) {
    const keyword = search.toLowerCase();
    result = result.filter(r =>
      r.title.toLowerCase().includes(keyword) ||
      r.ingredients.some(ing => ing.name.toLowerCase().includes(keyword))
    );
  }
  result.sort((a, b) => b.likes - a.likes);
  setTimeout(() => res.json(result), 100);
});

router.get(/:id, (req: Request, res: Response) => {
  const recipe = recipes.find(r => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });
  res.json(recipe);
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, ingredients, steps, imageUrl, authorId, isPublic = true, challengeId } = req.body;
  if (!title || !description || !ingredients || !steps || !authorId) return res.status(400).json({ error: '缺少必填字段' });
  const author = users.find(u => u.id === authorId);
  if (!author) return res.status(404).json({ error: '用户不存在' });
  const newRecipe: Recipe = {
    id: uuidv4(), title, description, ingredients, steps,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    authorId, authorName: author.username, likes: 0, likedBy: [],
    createdAt: new Date().toISOString(), isPublic, challengeId,
  };
  recipes.unshift(newRecipe);
  res.status(201).json(newRecipe);
});

router.put('/:id', (req: Request, res: Response) => {
  const recipeIndex = recipes.findIndex(r => r.id === req.params.id);
  if (recipeIndex === -1) return res.status(404).json({ error: '菜谱不存在' });
  recipes[recipeIndex] = { ...recipes[recipeIndex], ...req.body, id: recipes[recipeIndex].id };
  res.json(recipes[recipeIndex]);
});

router.post('/:id/like', (req: Request, res: Response) => {
  const { userId } = req.body;
  const recipe = recipes.find(r => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });
  const hasLiked = recipe.likedBy.includes(userId);
  if (hasLiked) {
    recipe.likedBy = recipe.likedBy.filter(id => id !== userId);
    recipe.likes = Math.max(0, recipe.likes - 1);
    return res.json({ ...recipe, liked: false });
  } else {
    recipe.likedBy.push(userId);
    recipe.likes += 1;
    return res.json({ ...recipe, liked: true });
  }
});

export default router;
