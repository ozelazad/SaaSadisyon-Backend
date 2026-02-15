import * as service from './tables.service.js';

export async function list(req, res) {
  const tables = await service.listTables(req.user.customer_id);
  return res.json(tables);
}
