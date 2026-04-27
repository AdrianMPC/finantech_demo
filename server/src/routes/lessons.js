import { Router } from 'express';
import { getDb } from '../db/index.js';
import { lessons, exercises } from '../data/content.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:id', requireAuth, async (req, res) => {
  const lessonId = Number(req.params.id);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const lessonExercises = exercises
    .filter((e) => e.lesson_id === lessonId)
    .sort((a, b) => a.order_index - b.order_index);

  const db = await getDb();
  const prog = db.data.progress.find((p) => p.user_id === req.user.id && p.lesson_id === lessonId);

  res.json({ ...lesson, exercises: lessonExercises, completed: prog?.completed ?? false });
});

export default router;
