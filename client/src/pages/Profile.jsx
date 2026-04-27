import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Layout } from '../components/layout/Layout';
import { ProgressBar } from '../components/ui/ProgressBar';

function StatCard({ icon, label, value, color = 'text-duo-navy' }) {
  return (
    <div className="card flex flex-col items-center gap-1 py-4">
      <span className="text-3xl">{icon}</span>
      <span className={`font-black text-2xl ${color}`}>{value}</span>
      <span className="text-xs text-duo-gray-dark font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function Profile() {
  const { user, logout } = useAuth();
  const [units, setUnits] = useState([]);

  useEffect(() => {
    api.units.list().then(setUnits);
  }, []);

  const allLessons = units.flatMap((u) => u.lessons);
  const completed = allLessons.filter((l) => l.completed).length;

  const level = Math.floor((user?.xp ?? 0) / 100) + 1;
  const xpInLevel = (user?.xp ?? 0) % 100;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Avatar & name */}
        <div className="card flex flex-col items-center gap-2 py-6">
          <div className="w-20 h-20 rounded-full bg-duo-green flex items-center justify-center text-4xl font-black text-white select-none">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <h2 className="font-black text-2xl">{user?.username}</h2>
          <p className="text-duo-gray-dark text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold bg-duo-yellow text-duo-navy px-3 py-1 rounded-full">
              Level {level}
            </span>
          </div>
        </div>

        {/* Level progress */}
        <div className="card">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Level {level}</span>
            <span className="text-duo-gray-dark">{xpInLevel} / 100 XP</span>
          </div>
          <ProgressBar value={xpInLevel} max={100} color="bg-duo-yellow" />
          <p className="text-xs text-duo-gray-dark mt-2">{100 - xpInLevel} XP to Level {level + 1}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="⚡" label="Total XP" value={user?.xp ?? 0} color="text-duo-yellow" />
          <StatCard icon="🔥" label="Day Streak" value={user?.streak ?? 0} color="text-duo-orange" />
          <StatCard icon="📚" label="Lessons" value={completed} color="text-duo-green" />
        </div>

        {/* Units summary */}
        <div className="flex flex-col gap-3">
          <h3 className="font-black text-lg">Course Progress</h3>
          {units.map((unit) => {
            const done = unit.lessons.filter((l) => l.completed).length;
            return (
              <div key={unit.id} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{unit.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{unit.title}</p>
                    <p className="text-xs text-duo-gray-dark">{done} / {unit.lessons.length} lessons</p>
                  </div>
                  {done === unit.lessons.length && <span className="text-xl">🏆</span>}
                </div>
                <ProgressBar
                  value={done}
                  max={unit.lessons.length}
                  color={done === unit.lessons.length ? 'bg-duo-yellow' : 'bg-duo-green'}
                />
              </div>
            );
          })}
        </div>

        <button onClick={logout} className="btn-danger w-full">
          Sign Out
        </button>
      </div>
    </Layout>
  );
}
