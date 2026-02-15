import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtAccess: requireEnv('JWT_ACCESS_SECRET'),
  jwtRefresh: requireEnv('JWT_REFRESH_SECRET'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || '*',
};
