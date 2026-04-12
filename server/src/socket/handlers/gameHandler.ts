import { Server } from 'socket.io';
import { AuthSocket } from '../../middleware/socketAuth';
import { C2S, S2C } from '../../../../shared/events';
import { getRooms } from './roomHandler';
import type { PlayerAction } from '../../../../shared/types';

export function setupGameHandler(io: Server, socket: AuthSocket) {
  const userId = socket.userId!;

  // PLACE BET
  socket.on(C2S.PLACE_BET, ({ amount }: { amount: number }) => {
    const inviteCode = (socket as any).currentRoom;
    if (!inviteCode) return;

    const room = getRooms().get(inviteCode);
    if (!room?.gameManager) return;

    const success = room.gameManager.placeBet(userId, amount);
    if (!success) {
      socket.emit(S2C.ERROR, 'Invalid bet');
    }
  });

  // PLAYER ACTION
  socket.on(C2S.PLAYER_ACTION, ({ action }: { action: PlayerAction }) => {
    const inviteCode = (socket as any).currentRoom;
    if (!inviteCode) return;

    const room = getRooms().get(inviteCode);
    if (!room?.gameManager) return;

    const success = room.gameManager.processAction(userId, action);
    if (!success) {
      socket.emit(S2C.ERROR, 'Invalid action');
    }
  });
}
