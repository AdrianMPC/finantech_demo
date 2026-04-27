import { Router } from 'express';
import { getDb, nextId } from '../db/index.js';
import { lessons } from '../data/content.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const XP_PER_LESSON = 20;

router.post('/complete', requireAuth, async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ error: 'lessonId is required' });

  const lesson = lessons.find((l) => l.id === Number(lessonId));
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const db = await getDb();
  const existing = db.data.progress.find((p) => p.user_id === req.user.id && p.lesson_id === Number(lessonId));

  let xpEarned = 0;
  if (!existing) {
    db.data.progress.push({
      id: nextId(db.data.progress),
      user_id: req.user.id,
      lesson_id: Number(lessonId),
      completed: true,
      xp_earned: XP_PER_LESSON,
      completed_at: new Date().toISOString(),
    });
    xpEarned = XP_PER_LESSON;
  } else if (!existing.completed) {
    existing.completed = true;
    existing.xp_earned = XP_PER_LESSON;
    existing.completed_at = new Date().toISOString();
    xpEarned = XP_PER_LESSON;
  }

  if (xpEarned > 0) {
    const user = db.data.users.find((u) => u.id === req.user.id);
    if (user) user.xp += xpEarned;
  }

  await db.write();

  const user = db.data.users.find((u) => u.id === req.user.id);
  const { password_hash, ...safeUser } = user;
  res.json({ xpEarned, user: safeUser });
});

export default router;
