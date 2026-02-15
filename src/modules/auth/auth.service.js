import { prisma } from '../../prisma/client.js';
import { comparePassword, hashPassword } from '../../services/password.service.js';
import { signAccess, rotateRefresh, verifyRefresh } from '../../services/token.service.js';

export async function login(email, password, customerId) {
  const user = await prisma.users.findFirst({ where: { email, customer_id: customerId, deleted_at: null, is_active: true } });
  if (!user) return null;
  const ok = await comparePassword(password, user.password);
  if (!ok) return null;
  const role = await prisma.roles.findUnique({ where: { id: user.role_id } });
  const access = signAccess(user.id, user.customer_id, role?.name || 'MANAGER');
  const refresh = await rotateRefresh(user.id, user.customer_id);
  return { access, refresh, user };
}

export async function refreshToken(refresh) {
  const { userId, customerId, roleId } = await verifyRefresh(refresh);
  const role = await prisma.roles.findUnique({ where: { id: roleId } });
  const access = signAccess(userId, customerId, role?.name || 'MANAGER');
  const newRefresh = await rotateRefresh(userId, customerId);
  return { access, refresh: newRefresh };
}

export async function seedPlatformAdmin(email, password) {
  const existing = await prisma.platform_admins.findUnique({ where: { email } });
  if (existing) return existing;
  const hashed = await hashPassword(password);
  return prisma.platform_admins.create({ data: { email, password: hashed } });
}

export async function validatePlatformPassword(raw, hash) {
  return comparePassword(raw, hash);
}
