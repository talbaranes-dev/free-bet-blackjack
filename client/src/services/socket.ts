import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import api from './api';

let socket: Socket | null = null;

async function refreshTokenIfNeeded(): Promise<string | null> {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  // Check if token is expired by trying to decode it
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();

    // Refresh if less than 5 minutes left
    if (expiresAt - now < 5 * 60 * 1000) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
    }
  } catch {
    // Token decode failed, use as-is
  }

  return token;
}

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

export async function connectSocket(): Promise<Socket> {
  // Always recreate socket to get fresh token
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  const token = await refreshTokenIfNeeded();

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
