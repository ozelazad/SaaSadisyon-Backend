import * as service from './products.service.js';

export async function list(req, res) {
  const products = await service.listProducts(req.user.customer_id);
  return res.json(products);
}
