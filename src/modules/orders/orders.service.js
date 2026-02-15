import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';

export async function createOrder(customerId, payload) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.create({ data: { customer_id: customerId, table_id: payload.table_id, status: 'OPEN' } });
    for (const item of payload.items) {
      const product = await tx.products.findFirst({ where: { id: item.product_id, customer_id: customerId, is_active: true } });
      if (!product) throw new Error('Product not found');
      await tx.order_items.create({
        data: {
          customer_id: customerId,
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          quantity: item.quantity,
          note: item.note,
        },
      });
    }
    const items = await tx.order_items.findMany({ where: { order_id: order.id } });
    const totalAmount = items.reduce((sum, i) => sum.plus(i.product_price.mul(i.quantity)), new Prisma.Decimal(0));
    await tx.orders.update({ where: { id: order.id }, data: { total_amount: totalAmount } });
    return order;
  });
}

export async function addPayment(customerId, orderId, amount, type) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.findFirst({ where: { id: orderId, customer_id: customerId } });
    if (!order) throw new Error('Order not found');
    await tx.payments.create({ data: { order_id: orderId, customer_id: customerId, amount, type } });
    const paid = await tx.payments.aggregate({ where: { order_id: orderId }, _sum: { amount: true } });
    if (paid._sum.amount && paid._sum.amount.gte(order.total_amount)) {
      await tx.orders.update({ where: { id: orderId }, data: { status: 'CLOSED' } });
    }
    return { paid: paid._sum.amount };
  });
}

export function listActiveOrders(customerId) {
  return prisma.orders.findMany({ where: { customer_id: customerId, status: { in: ['OPEN', 'SENT_TO_KITCHEN'] } }, include: { items: true, payments: true } });
}

export async function updateItemStatus(customerId, itemId, status) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.order_items.findFirst({ where: { id: itemId, customer_id: customerId } });
    if (!item) throw new Error('Item not found');
    const updated = await tx.order_items.update({ where: { id: itemId }, data: { status } });
    await tx.audit_logs.create({ data: { customer_id: customerId, action: 'UPDATE', entity: 'order_items', entity_id: itemId } });
    return updated;
  });
}
