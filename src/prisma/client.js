import { PrismaClient } from '@prisma/client';
import { tenantMiddleware } from './middleware/tenant.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Base middleware placeholder (soft-delete, etc.)
prisma.$use(async (params, next) => next(params));

function withTenant(customerId) {
  if (!customerId) return prisma;
  prisma.$use(tenantMiddleware(customerId));
  return prisma;
}

export { prisma, withTenant };
