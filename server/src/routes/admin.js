import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { units, lessons, exercises } from '../data/content.js';
import { requireAdmin, signAdminToken, ADMIN_EMAIL, ADMIN_PASSWORD } from '../middleware/adminAuth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (email.toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  res.json({ token: signAdminToken() });
});

router.get('/overview', requireAdmin, async (req, res) => {
  const db = await getDb();
  const { users, progress } = db.data;

  const now = new Date();
  const dayAgo = new Date(now - 86_400_000).toISOString();
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString();
  const monthAgo = new Date(now - 30 * 86_400_000).toISOString();

  const completedProgress = progress.filter((p) => p.completed);
  const totalXp = users.reduce((s, u) => s + (u.xp ?? 0), 0);
  const avgXp = users.length ? Math.round(totalXp / users.length) : 0;

  const usersWithStreak = users.filter((u) => (u.streak ?? 0) > 0).length;
  const avgStreak = users.length
    ? (users.reduce((s, u) => s + (u.streak ?? 0), 0) / users.length).toFixed(1)
    : 0;

  const newToday = users.filter((u) => u.created_at >= dayAgo).length;
  const newThisWeek = users.filter((u) => u.created_at >= weekAgo).length;
  const newThisMonth = users.filter((u) => u.created_at >= monthAgo).length;
  const activeToday = users.filter((u) => u.last_active >= dayAgo).length;
  const activeThisWeek = users.filter((u) => u.last_active >= weekAgo).length;

  const lessonCompletionMap = completedProgress.reduce((acc, p) => {
    acc[p.lesson_id] = (acc[p.lesson_id] ?? 0) + 1;
    return acc;
  }, {});

  const topLessons = lessons
    .map((l) => ({ ...l, completions: lessonCompletionMap[l.id] ?? 0 }))
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5);

  const leastLessons = lessons
    .map((l) => ({ ...l, completions: lessonCompletionMap[l.id] ?? 0 }))
    .sort((a, b) => a.completions - b.completions)
    .slice(0, 5);

  const unitCompletions = units.map((unit) => {
    const unitLessons = lessons.filter((l) => l.unit_id === unit.id);
    const usersWhoCompletedAll = users.filter((user) =>
      unitLessons.every((l) => progress.find((p) => p.user_id === user.id && p.lesson_id === l.id && p.completed))
    ).length;
    return { id: unit.id, title: unit.title, icon: unit.icon, color: unit.color, completedByUsers: usersWhoCompletedAll };
  });

  res.json({
    users: {
      total: users.length,
      newToday,
      newThisWeek,
      newThisMonth,
      activeToday,
      activeThisWeek,
    },
    xp: { total: totalXp, avg: avgXp },
    streaks: { usersWithStreak, avg: Number(avgStreak) },
    lessons: {
      totalCompletions: completedProgress.length,
      uniqueLessonsCompleted: Object.keys(lessonCompletionMap).length,
      totalLessons: lessons.length,
      totalExercises: exercises.length,
    },
    topLessons,
    leastLessons,
    unitCompletions,
  });
});

router.get('/users', requireAdmin, async (req, res) => {
  const db = await getDb();
  const { users, progress } = db.data;

  const result = users
    .map(({ password_hash, ...user }) => {
      const userProgress = progress.filter((p) => p.user_id === user.id && p.completed);
      const completedLessons = userProgress.length;
      const completedUnits = units.filter((unit) => {
        const unitLessons = lessons.filter((l) => l.unit_id === unit.id);
        return unitLessons.every((l) => userProgress.find((p) => p.lesson_id === l.id));
      }).length;
      return { ...user, completedLessons, completedUnits };
    })
    .sort((a, b) => b.xp - a.xp);

  res.json(result);
});

router.get('/lessons', requireAdmin, async (req, res) => {
  const db = await getDb();
  const { users, progress } = db.data;

  const totalUsers = users.length;
  const result = lessons.map((lesson) => {
    const unit = units.find((u) => u.id === lesson.unit_id);
    const completions = progress.filter((p) => p.lesson_id === lesson.id && p.completed).length;
    const rate = totalUsers > 0 ? Math.round((completions / totalUsers) * 100) : 0;
    return {
      ...lesson,
      unitTitle: unit?.title,
      unitColor: unit?.color,
      unitIcon: unit?.icon,
      completions,
      completionRate: rate,
      exerciseCount: exercises.filter((e) => e.lesson_id === lesson.id).length,
    };
  });

  res.json(result);
});

export default router;
