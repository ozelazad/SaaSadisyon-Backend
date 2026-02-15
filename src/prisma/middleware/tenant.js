import { Prisma } from '@prisma/client';

const tenantModels = new Set([
  'customers',
  'subscriptions',
  'users',
  'roles',
  'tables',
  'orders',
  'order_items',
  'products',
  'categories',
  'payments',
  'audit_logs',
]);

export function tenantMiddleware(customerId) {
  return async (params, next) => {
    if (!customerId || !params.model || !tenantModels.has(params.model)) {
      return next(params);
    }

    if (params.action === 'create' && params.args?.data) {
      params.args.data = { ...params.args.data, customer_id: customerId };
    }

    const scopeWhere = { customer_id: customerId };

    if (['findMany', 'updateMany', 'deleteMany'].includes(params.action)) {
      params.args.where = { ...(params.args.where || {}), ...scopeWhere };
    }

    if (['findUnique', 'findFirst', 'update', 'delete'].includes(params.action)) {
      params.args.where = { ...(params.args.where || {}), ...scopeWhere };
    }

    if (['createMany', 'upsert'].includes(params.action) && params.args?.data) {
      const data = params.args.data;
      if (Array.isArray(data)) {
        params.args.data = data.map((d) => ({ ...d, customer_id: customerId }));
      } else {
        params.args.data = { ...data, customer_id: customerId };
      }
    }

    return next(params);
  };
}
