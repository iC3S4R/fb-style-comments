import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_TTL = '7d';

export function signSession(payload = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn:  JWT_TTL });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}