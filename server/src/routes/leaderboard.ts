import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { chips: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        chips: true,
        totalWinnings: true,
        gamesPlayed: true,
        gamesWon: true,
      },
    });

    const entries = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      chips: u.chips,
      totalWinnings: u.totalWinnings,
      gamesPlayed: u.gamesPlayed,
      gamesWon: u.gamesWon,
    }));

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
