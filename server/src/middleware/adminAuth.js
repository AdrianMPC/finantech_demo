import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finlearn-dev-secret-change-in-prod';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@finlearn.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin$2024!';

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    if (!payload.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}

export function signAdminToken() {
  return jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '8h' });
}
