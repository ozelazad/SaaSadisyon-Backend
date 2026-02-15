import * as service from './auth.service.js';
import { prisma } from '../../prisma/client.js';

export async function login(req, res) {
  const { email, password, customer_id } = req.body;
  const result = await service.login(email, password, customer_id);
  if (!result) return res.status(401).json({ message: 'Invalid credentials' });
  return res.json({ access: result.access, refresh: result.refresh, user: { id: result.user.id, role_id: result.user.role_id, customer_id: result.user.customer_id } });
}

export async function refresh(req, res) {
  const { refresh } = req.body;
  try {
    const tokens = await service.refreshToken(refresh);
    return res.json(tokens);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh' });
  }
}

export async function platformAdminLogin(req, res) {
  const { email, password } = req.body;
  const admin = await prisma.platform_admins.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await service.validatePlatformPassword(password, admin.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  return res.json({ admin: { id: admin.id, email: admin.email } });
}
