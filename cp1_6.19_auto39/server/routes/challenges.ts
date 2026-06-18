import { Router, Request, Response } from 'express';
import { challenges, recipes, trophies, users } from '../data';
import type { Challenge } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/active', (req: Request, res: Response) => {
  const activeChallenges = challenges.filter(c => c.isActive);
  res.json(activeChallenges);
});

router.get('/:id/detail', (req: Request, res: Response) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: '挑战不存在' });
  }

  const participantRecipes = recipes.filter(r =>
    challenge.participantRecipes.includes(r.id)
  );

  const sortedRecipes = [...participantRecipes].sort((a, b) => b.likes - a.likes);

  let winners = challenge.winners;
  const now = new Date();
  const endDate = new Date(challenge.endDate);

  if (now >= endDate && !winners) {
    const top3 = sortedRecipes.slice(0, 3);
    winners = {
      first: top3[0] ? { recipeId: top3[0].id, userId: top3[0].userId, username: top3[0].username } : null,
      second: top3[1] ? { recipeId: top3[1].id, userId: top3[1].userId, username: top3[1].username } : null,
      third: top3[2] ? { recipeId: top3[2].id, userId: top3[2].userId, username: top3[2].username } : null,
    };
    challenge.winners = winners;
    challenge.isActive = false;

    if (winners.first) {
      trophies.push({
        id: uuidv4(),
        userId: winners.first.userId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        rank: 'first',
        awardedAt: new Date().toISOString(),
      });
    }
    if (winners.second) {
      trophies.push({
        id: uuidv4(),
        userId: winners.second.userId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        rank: 'second',
        awardedAt: new Date().toISOString(),
      });
    }
    if (winners.third) {
      trophies.push({
        id: uuidv4(),
        userId: winners.third.userId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        rank: 'third',
        awardedAt: new Date().toISOString(),
      });
    }
  }

  res.json({
    ...challenge,
    participantRecipes: sortedRecipes,
    winners,
  });
});

router.post('/:id/participate', (req: Request, res: Response) => {
  const { recipeId, userId } = req.body;
  const challenge = challenges.find(c => c.id === req.params.id);

  if (!challenge) {
    return res.status(404).json({ error: '挑战不存在' });
  }

  if (!challenge.isActive) {
    return res.status(400).json({ error: '挑战已结束' });
  }

  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  if (recipe.userId !== userId) {
    return res.status(403).json({ error: '只能投稿自己的菜谱' });
  }

  const hasParticipated = recipes.some(
    r => r.userId === userId && challenge.participantRecipes.includes(r.id)
  );
  if (hasParticipated) {
    return res.status(400).json({ error: '每人只能投稿一篇菜谱' });
  }

  if (challenge.participantRecipes.includes(recipeId)) {
    return res.status(400).json({ error: '该菜谱已参与挑战' });
  }

  challenge.participantRecipes.push(recipeId);
  recipe.challengeId = challenge.id;

  res.json({ success: true, message: '投稿成功！' });
});

export default router;
