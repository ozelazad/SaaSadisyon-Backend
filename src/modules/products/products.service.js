import { prisma } from '../../prisma/client.js';

export function listProducts(customerId) {
  return prisma.products.findMany({ where: { customer_id: customerId, deleted_at: null, is_active: true } });
}
