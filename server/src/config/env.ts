import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000'),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/freebet',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
