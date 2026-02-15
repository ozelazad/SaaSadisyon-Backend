import { startOfDay, endOfDay } from 'date-fns';
import { prisma } from '../../prisma/client.js';

export async function todayMetrics(customerId) {
  const now = new Date();
  const orders = await prisma.orders.findMany({ where: { customer_id: customerId, created_at: { gte: startOfDay(now), lte: endOfDay(now) } }, include: { payments: true } });
  const revenue = orders.reduce((sum, o) => {
    const paid = o.payments.reduce((p, pay) => p + Number(pay.amount), 0);
    return sum + paid;
  }, 0);
  const openTables = await prisma.tables.count({ where: { customer_id: customerId, status: { not: 'CLOSED' } } });
  const activeOrders = orders.filter((o) => o.status !== 'CLOSED').length;
  const topProducts = await prisma.order_items.groupBy({
    by: ['product_id', 'product_name'],
    where: { customer_id: customerId, created_at: { gte: startOfDay(now), lte: endOfDay(now) } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });
  return { revenue, openTables, activeOrders, topProducts };
}
