import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, nextId } from '../db/index.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

const safeUser = ({ password_hash, ...u }) => u;

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const db = await getDb();
  const taken = db.data.users.find(
    (u) => u.email === email.toLowerCase().trim() || u.username === username.trim()
  );
  if (taken) return res.status(409).json({ error: 'Username or email already taken' });

  const user = {
    id: nextId(db.data.users),
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password_hash: bcrypt.hashSync(password, 10),
    xp: 0,
    streak: 0,
    hearts: 5,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  db.data.users.push(user);
  await db.write();

  res.status(201).json({ token: signToken({ id: user.id }), user: safeUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = await getDb();
  const user = db.data.users.find((u) => u.email === email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  user.last_active = new Date().toISOString();
  await db.write();

  res.json({ token: signToken({ id: user.id }), user: safeUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const db = await getDb();
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
});

export default router;
