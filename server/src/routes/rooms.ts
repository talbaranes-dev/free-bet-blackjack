import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create room
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    let inviteCode: string;
    // Ensure unique code
    do {
      inviteCode = generateInviteCode();
    } while (await prisma.room.findUnique({ where: { inviteCode } }));

    const room = await prisma.room.create({
      data: {
        name: name || 'Blackjack Table',
        inviteCode,
        createdById: req.userId!,
      },
    });

    res.status(201).json({
      id: room.id,
      inviteCode: room.inviteCode,
      name: room.name,
    });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room by invite code
router.get('/:inviteCode', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { inviteCode: req.params.inviteCode },
    });

    if (!room || !room.isActive) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
