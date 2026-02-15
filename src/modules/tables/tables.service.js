import { prisma } from '../../prisma/client.js';

export function listTables(customerId) {
  return prisma.tables.findMany({ where: { customer_id: customerId, deleted_at: null } });
}
