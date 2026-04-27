import { JSONFilePreset } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// ── Upstash Redis (production) ────────────────────────────────────────────────
let redis;
if (useRedis) {
  const { Redis } = await import('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

async function getRedisDb() {
  const [users, progress] = await Promise.all([
    redis.get('fl:users'),
    redis.get('fl:progress'),
  ]);
  const data = { users: users ?? [], progress: progress ?? [] };
  return {
    data,
    async write() {
      await Promise.all([
        redis.set('fl:users', data.users),
        redis.set('fl:progress', data.progress),
      ]);
    },
  };
}

// ── lowdb (local development fallback) ───────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../finlearn.json');
let _lowdb = null;

async function getLowDb() {
  if (!_lowdb) {
    _lowdb = await JSONFilePreset(DB_PATH, { users: [], progress: [] });
  }
  return _lowdb;
}

// ── public interface ──────────────────────────────────────────────────────────
export const getDb = useRedis ? getRedisDb : getLowDb;

export function nextId(collection) {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((r) => r.id)) + 1;
}
