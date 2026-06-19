import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { challenges, recipes, trophies, users } from '../data.js';
import { Challenge, Trophy } from '../types.js';

const router = Router();

function checkAndSetWinners(challenge: Challenge) {
  const now = new Date();
  const endDate = new Date(challenge.endDate);
  if (now >= endDate && !challenge.winners) {
    const challengeRecipes = recipes.filter(r => r.challengeId === challenge.id);
    challengeRecipes.sort((a, b) => b.likes - a.likes);
    const winners: { userId: string; recipeId: string; rank: number }[] = [];
    const trophyIcons = ['🏆', '🥈', '🥉'];
    for (let i = 0; i < Math.min(3, challengeRecipes.length); i++) {
      const recipe = challengeRecipes[i];
      winners.push({ userId: recipe.authorId, recipeId: recipe.id, rank: i + 1 });
      const existingTrophy = trophies.find(t => t.userId === recipe.authorId && t.challengeId === challenge.id);
      if (!existingTrophy) {
        const trophy: Trophy = { id: uuidv4(), userId: recipe.authorId, challengeId: challenge.id, challengeName: challenge.name, rank: i + 1, icon: trophyIcons[i], earnedAt: new Date().toISOString() };
        trophies.push(trophy);
      }
    }
    challenge.winners = winners;
    challenge.isActive = false;
  }
}

router.get('/active', (req: Request, res: Response) => {
  challenges.forEach(checkAndSetWinners);
  const activeChallenge = challenges.find(c => c.isActive);
  res.json(activeChallenge || null);
});

router.get('/:id/detail', (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ error: '挑战不存在' });
  checkAndSetWinners(challenge);
  const challengeRecipes = recipes.filter(r => r.challengeId === challenge.id);
  challengeRecipes.sort((a, b) => b.likes - a.likes);
  const winnersWithDetails = challenge.winners?.map(w => {
    const recipe = recipes.find(r => r.id === w.recipeId);
    const user = users.find(u => u.id === w.userId);
    return { ...w, username: user?.username, avatar: user?.avatar, recipeTitle: recipe?.title, recipeImage: recipe?.imageUrl };
  });
  res.json({ ...challenge, recipes: challengeRecipes, winners: winnersWithDetails });
});

router.post('/:id/participate', (req: Request, res: Response) => {
  const { userId, recipeId } = req.body;
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ error: '挑战不存在' });
  if (!challenge.isActive) return res.status(400).json({ error: '挑战已结束，无法投稿' });
  if (challenge.submissions.some(s => s.userId === userId)) return res.status(400).json({ error: '您已参与此挑战，每人仅限投稿一篇' });
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });
  if (recipe.authorId !== userId) return res.status(403).json({ error: '只能投稿自己的菜谱' });
  recipe.challengeId = challenge.id;
  challenge.submissions.push({ userId, recipeId });
  challenge.participantIds.push(userId);
  challenge.recipeIds.push(recipeId);
  res.json({ message: '投稿成功！', challenge });
});

export default router;
