import { Router, Request, Response } from 'express';
import { challenges, recipes, trophies, generateId } from '../data';
import type { Trophy } from '../types';

const router = Router();

interface ParticipateBody {
  userId: string;
  recipeId: string;
}

const finalizeChallengeIfEnded = (challengeId: string) => {
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return;
  if (challenge.ended && challenge.winners) return;

  const endTime = new Date(challenge.endTime).getTime();
  const now = Date.now();
  if (now < endTime) return;

  const participants = challenge.participantRecipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .sort((a, b) => b.likes - a.likes);

  const top3 = participants.slice(0, 3);
  const winners = top3.map((r, idx) => ({
    rank: idx + 1,
    recipeId: r.id,
    userId: r.userId,
    username: r.authorName
  }));

  challenge.winners = winners;
  challenge.ended = true;

  winners.forEach((w) => {
    const rank: Trophy['rank'] = w.rank === 1 ? 'gold' : w.rank === 2 ? 'silver' : 'bronze';
    const existing = trophies.find(
      (t) => t.challengeId === challenge.id && t.userId === w.userId
    );
    if (!existing) {
      trophies.push({
        id: generateId(),
        userId: w.userId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        rank,
        awardedAt: new Date().toISOString()
      });
    }
  });
};

router.get('/active', (_req: Request, res: Response) => {
  const active = challenges
    .filter((c) => !c.ended && new Date(c.endTime).getTime() > Date.now())
    .map((c) => {
      finalizeChallengeIfEnded(c.id);
      return c;
    })
    .filter((c) => !c.ended);

  if (active.length > 0) {
    return res.status(200).json(active[0]);
  }
  res.status(404).json({ error: '当前没有进行中的挑战' });
});

router.get('/:id/detail', (req: Request, res: Response) => {
  const challenge = challenges.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: '挑战不存在' });
  }

  finalizeChallengeIfEnded(challenge.id);

  const participantRecipes = challenge.participantRecipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .sort((a, b) => b.likes - a.likes);

  res.status(200).json({
    ...challenge,
    participantRecipes
  });
});

router.post(
  '/:id/participate',
  (req: Request<{ id: string }, unknown, ParticipateBody>, res: Response) => {
    const { userId, recipeId } = req.body;
    const challenge = challenges.find((c) => c.id === req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: '挑战不存在' });
    }

    finalizeChallengeIfEnded(challenge.id);
    if (challenge.ended) {
      return res.status(400).json({ error: '挑战已结束，无法投稿' });
    }

    if (!userId || !recipeId) {
      return res.status(400).json({ error: '缺少userId或recipeId' });
    }

    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      return res.status(404).json({ error: '菜谱不存在' });
    }
    if (recipe.userId !== userId) {
      return res.status(403).json({ error: '只能投稿自己的菜谱' });
    }

    const alreadyParticipated = challenge.participantRecipeIds.some((id) => {
      const r = recipes.find((x) => x.id === id);
      return r && r.userId === userId;
    });
    if (alreadyParticipated) {
      return res.status(409).json({ error: '您已在本挑战中投过稿，每人限投1篇' });
    }

    if (challenge.participantRecipeIds.includes(recipeId)) {
      return res.status(409).json({ error: '该菜谱已参与此挑战' });
    }

    challenge.participantRecipeIds.push(recipeId);
    recipe.challengeId = challenge.id;

    res.status(200).json({
      message: '投稿成功！',
      challenge,
      recipe
    });
  }
);

export default router;
