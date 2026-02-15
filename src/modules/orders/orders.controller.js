import { Prisma } from '@prisma/client';
import * as service from './orders.service.js';
import { socketIO } from '../../sockets/index.js';

export async function createOrder(req, res) {
  const { table_id, items } = req.body;
  const order = await service.createOrder(req.user.customer_id, { table_id, items });
  socketIO.to(`customer_${req.user.customer_id}`).emit('order:new', { order_id: order.id });
  return res.status(201).json(order);
}

export async function addPayment(req, res) {
  const { amount, type } = req.body;
  const result = await service.addPayment(req.user.customer_id, req.params.id, new Prisma.Decimal(amount), type);
  socketIO.to(`customer_${req.user.customer_id}`).emit('order:update', { order_id: req.params.id });
  return res.json(result);
}

export async function list(req, res) {
  const orders = await service.listActiveOrders(req.user.customer_id);
  return res.json(orders);
}

export async function updateItemStatus(req, res) {
  const { status } = req.body;
  const updated = await service.updateItemStatus(req.user.customer_id, req.params.itemId, status);
  socketIO.to(`customer_${req.user.customer_id}`).emit('order:update', { order_id: updated.order_id });
  return res.json(updated);
}
