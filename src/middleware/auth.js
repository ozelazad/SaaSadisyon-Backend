import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, env.jwtAccess);
    req.user = { id: payload.sub, customer_id: payload.cid, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
