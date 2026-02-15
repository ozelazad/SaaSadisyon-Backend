import { withTenant } from '../prisma/client.js';

export function useTenant(req, _res, next) {
  const prisma = withTenant(req.user?.customer_id);
  req.prisma = prisma;
  next();
}
