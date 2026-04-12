import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthSocket extends Socket {
  userId?: string;
}

export function socketAuthMiddleware(socket: AuthSocket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('No token provided'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    socket.userId = payload.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
