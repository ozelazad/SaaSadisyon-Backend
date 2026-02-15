import * as service from './reports.service.js';

export async function today(req, res) {
  const data = await service.todayMetrics(req.user.customer_id);
  return res.json(data);
}
