import bcrypt from 'bcryptjs';

export function hashPassword(raw) {
  return bcrypt.hash(raw, 12);
}

export function comparePassword(raw, hash) {
  return bcrypt.compare(raw, hash);
}
