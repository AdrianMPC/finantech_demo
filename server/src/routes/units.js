import { Router } from 'express';
import { getDb } from '../db/index.js';
import { units, lessons } from '../data/content.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const db = await getDb();
  const userProgress = db.data.progress.filter((p) => p.user_id === req.user.id);

  const result = units.map((unit) => {
    const unitLessons = lessons
      .filter((l) => l.unit_id === unit.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((lesson) => {
        const prog = userProgress.find((p) => p.lesson_id === lesson.id);
        return { ...lesson, completed: prog?.completed ?? false, xp_earned: prog?.xp_earned ?? 0 };
      });
    return { ...unit, lessons: unitLessons };
  });

  res.json(result);
});

export default router;
