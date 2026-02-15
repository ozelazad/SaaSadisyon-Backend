import { isAfter } from 'date-fns';
import { prisma } from '../prisma/client.js';

export async function enforceSubscription(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const customer = await prisma.customers.findUnique({ where: { id: req.user.customer_id, deleted_at: null } });
  if (!customer) return res.status(403).json({ message: 'Forbidden' });
  if (customer.is_suspended) return res.status(403).json({ message: 'Account suspended' });
  if (customer.subscription_end && isAfter(new Date(), customer.subscription_end)) {
    return res.status(403).json({ message: 'Subscription expired' });
  }
  return next();
}
