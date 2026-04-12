import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { AuthSocket } from '../../middleware/socketAuth';
import { C2S, S2C } from '../../../shared/events';
import { GameManager } from '../gameManager';

const prisma = new PrismaClient();

// In-memory room state
const rooms = new Map<
  string,
  {
    id: string;
    inviteCode: string;
    name: string;
    maxPlayers: number;
    minBet: number;
    maxBet: number;
    seats: (({ userId: string; username: string; chips: number; isReady: boolean; socketId: string }) | null)[];
    gameManager: GameManager | null;
  }
>();

export function getRooms() {
  return rooms;
}

export function setupRoomHandler(io: Server, socket: AuthSocket) {
  const userId = socket.userId!;

  // JOIN ROOM
  socket.on(C2S.JOIN_ROOM, async ({ inviteCode }: { inviteCode: string }) => {
    try {
      const dbRoom = await prisma.room.findUnique({ where: { inviteCode } });
      if (!dbRoom || !dbRoom.isActive) {
        socket.emit(S2C.ERROR, 'Room not found');
        return;
      }

      let room = rooms.get(inviteCode);
      if (!room) {
        room = {
          id: dbRoom.id,
          inviteCode,
          name: dbRoom.name,
          maxPlayers: dbRoom.maxPlayers,
          minBet: dbRoom.minBet,
          maxBet: dbRoom.maxBet,
          seats: new Array(dbRoom.maxPlayers).fill(null),
          gameManager: null,
        };
        rooms.set(inviteCode, room);
      }

      // Join Socket.IO room
      socket.join(`room:${inviteCode}`);
      (socket as any).currentRoom = inviteCode;

      // If user was previously seated (reconnect), update their socket ID
      const existingSeat = room.seats.find((s) => s?.userId === userId);
      if (existingSeat) {
        existingSeat.socketId = socket.id;
      }

      // Get user data
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      // Notify others
      io.to(`room:${inviteCode}`).emit(S2C.PLAYER_JOINED, {
        userId,
        username: user.username,
      });

      // Send full room state to joining player
      const seatData = room.seats.map((s, i) =>
        s
          ? {
              seatIndex: i,
              userId: s.userId,
              username: s.username,
              chips: s.chips,
              hands: [],
              isReady: s.isReady,
              isConnected: true,
              currentBet: 0,
            }
          : null
      );

      socket.emit(S2C.ROOM_STATE, {
        id: room.id,
        inviteCode: room.inviteCode,
        name: room.name,
        maxPlayers: room.maxPlayers,
        minBet: room.minBet,
        maxBet: room.maxBet,
        seats: seatData,
        gameState: room.gameManager?.getClientState() || null,
      });
    } catch (err) {
      console.error('Join room error:', err);
      socket.emit(S2C.ERROR, 'Failed to join room');
    }
  });

  // TAKE SEAT
  socket.on(C2S.TAKE_SEAT, async ({ seatIndex }: { seatIndex: number }) => {
    const inviteCode = (socket as any).currentRoom;
    if (!inviteCode) return;

    const room = rooms.get(inviteCode);
    if (!room) return;

    if (seatIndex < 0 || seatIndex >= room.maxPlayers) return;
    if (room.seats[seatIndex]) {
      socket.emit(S2C.ERROR, 'Seat taken');
      return;
    }

    // Check if user already seated
    if (room.seats.some((s) => s?.userId === userId)) {
      socket.emit(S2C.ERROR, 'Already seated');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    room.seats[seatIndex] = {
      userId,
      username: user.username,
      chips: user.chips,
      isReady: false,
      socketId: socket.id,
    };

    io.to(`room:${inviteCode}`).emit(S2C.PLAYER_SEATED, {
      seatIndex,
      userId,
      username: user.username,
      chips: user.chips,
    });
  });

  // READY UP
  socket.on(C2S.READY_UP, () => {
    const inviteCode = (socket as any).currentRoom;
    if (!inviteCode) return;

    const room = rooms.get(inviteCode);
    if (!room) return;

    const seat = room.seats.find((s) => s?.userId === userId);
    if (!seat) return;

    seat.isReady = !seat.isReady;

    io.to(`room:${inviteCode}`).emit(S2C.PLAYER_READY, {
      userId,
      isReady: seat.isReady,
    });

    // Check if all seated players are ready (min 1)
    const seatedPlayers = room.seats.filter((s) => s !== null);
    if (seatedPlayers.length > 0 && seatedPlayers.every((s) => s!.isReady)) {
      // Start game
      if (!room.gameManager) {
        room.gameManager = new GameManager(io, inviteCode, room);
      }
      room.gameManager.startBetting();
    }
  });

  // LEAVE ROOM
  socket.on(C2S.LEAVE_ROOM, () => {
    handleLeave(io, socket, userId);
  });

  socket.on('disconnect', () => {
    handleLeave(io, socket, userId);
  });
}

function handleLeave(io: Server, socket: AuthSocket, userId: string) {
  const inviteCode = (socket as any).currentRoom;
  if (!inviteCode) return;

  const room = rooms.get(inviteCode);
  if (!room) return;

  // Remove from seat
  const seatIdx = room.seats.findIndex((s) => s?.userId === userId);
  if (seatIdx >= 0) {
    room.seats[seatIdx] = null;
    io.to(`room:${inviteCode}`).emit(S2C.PLAYER_UNSEATED, { seatIndex: seatIdx });
  }

  socket.leave(`room:${inviteCode}`);
  io.to(`room:${inviteCode}`).emit(S2C.PLAYER_LEFT, { userId });

  // Clean up empty rooms
  if (room.seats.every((s) => s === null)) {
    rooms.delete(inviteCode);
  }

  (socket as any).currentRoom = null;
}
