import { Server } from 'socket.io';
import { socketAuthMiddleware, AuthSocket } from '../middleware/socketAuth';
import { setupRoomHandler } from './handlers/roomHandler';
import { setupGameHandler } from './handlers/gameHandler';

export function setupSocketIO(io: Server) {
  io.use(socketAuthMiddleware as any);

  io.on('connection', (socket) => {
    const authSocket = socket as AuthSocket;
    console.log(`Socket connected: ${authSocket.userId} (${socket.id})`);

    setupRoomHandler(io, authSocket);
    setupGameHandler(io, authSocket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${authSocket.userId}`);
    });
  });
}
