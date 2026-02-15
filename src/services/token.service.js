import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';

const ACCESS_MIN = 15;
const REFRESH_DAYS = 7;

export function signAccess(userId, customerId, role) {
  return jwt.sign({ sub: userId, cid: customerId, role }, env.jwtAccess, { expiresIn: `${ACCESS_MIN}m` });
}

export function signRefresh(userId, customerId, tokenId) {
  return jwt.sign({ sub: userId, cid: customerId, tid: tokenId }, env.jwtRefresh, { expiresIn: `${REFRESH_DAYS}d` });
}

export async function rotateRefresh(userId, customerId) {
  const tokenId = crypto.randomUUID();
  const refresh = signRefresh(userId, customerId, tokenId);
  const hashed = await bcrypt.hash(refresh, 10);
  await prisma.users.update({ where: { id: userId, customer_id: customerId }, data: { refresh_token: hashed } });
  return refresh;
}

export async function verifyRefresh(refresh) {
  const payload = jwt.verify(refresh, env.jwtRefresh);
  const user = await prisma.users.findUnique({ where: { id: payload.sub, customer_id: payload.cid } });
  if (!user || !user.refresh_token) throw new Error('Invalid refresh');
  const ok = await bcrypt.compare(refresh, user.refresh_token);
  if (!ok) throw new Error('Stale refresh');
  return { userId: user.id, customerId: user.customer_id, roleId: user.role_id };
}
