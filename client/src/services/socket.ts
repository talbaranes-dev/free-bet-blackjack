import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  const token = useAuthStore.getState().accessToken;

  socket = io(serverUrl, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['polling', 'websocket'],
  });

  return socket;
}

export function connectSocket(): Socket {
  // Always recreate socket to get fresh token
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  const token = useAuthStore.getState().accessToken;

  socket = io(serverUrl, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['polling', 'websocket'],
  });

  socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
