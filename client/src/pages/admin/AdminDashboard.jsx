import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

// ── small primitives ──────────────────────────────────────────────────────────

function KPI({ icon, label, value, sub, accent = 'text-duo-navy' }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-duo-gray-mid p-4 flex flex-col gap-1">
      <span className="text-2xl">{icon}</span>
      <span className={`font-black text-3xl ${accent}`}>{value}</span>
      <span className="font-bold text-sm text-duo-navy">{label}</span>
      {sub && <span className="text-xs text-duo-gray-dark">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="font-black text-lg text-duo-navy mt-2">{children}</h2>;
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-duo-gray-mid rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color || '#58CC02' }} />
      </div>
      <span className="text-xs font-bold w-8 text-right text-duo-gray-dark">{pct}%</span>
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────────────────

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors
        ${active ? 'bg-duo-navy text-white' : 'text-duo-gray-dark hover:text-duo-navy hover:bg-duo-gray-mid'}`}
    >
      {label}
    </button>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function Overview({ data }) {
  if (!data) return <Spinner />;
  const { users, xp, streaks, lessons, topLessons, leastLessons, unitCompletions } = data;
  const maxCompletions = Math.max(...topLessons.map((l) => l.completions), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Acquisition */}
      <div>
        <SectionTitle>User Acquisition</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3">
          <KPI icon="👥" label="Total Users" value={users.total} accent="text-duo-blue" />
          <KPI icon="🆕" label="New Today" value={users.newToday} sub={`+${users.newThisWeek} this week`} />
          <KPI icon="📅" label="New This Month" value={users.newThisMonth} />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <SectionTitle>Engagement</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-4">
          <KPI icon="⚡" label="Avg XP / User" value={xp.avg} accent="text-duo-yellow" sub={`${xp.total} total XP`} />
          <KPI icon="🎯" label="Active Today" value={users.activeToday} sub={`${users.activeThisWeek} this week`} />
          <KPI icon="🔥" label="Avg Streak" value={streaks.avg} sub={`${streaks.usersWithStreak} with active streak`} />
          <KPI icon="📚" label="Completions" value={lessons.totalCompletions} sub={`${lessons.uniqueLessonsCompleted}/${lessons.totalLessons} lessons reached`} />
        </div>
      </div>

      {/* Unit funnel */}
      <div>
        <SectionTitle>Unit Completion Funnel</SectionTitle>
        <div className="bg-white rounded-2xl border-2 border-duo-gray-mid p-4 mt-3 flex flex-col gap-3">
          {unitCompletions.map((unit) => (
            <div key={unit.id} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">
                  {unit.icon} {unit.title}
                </span>
                <span className="text-xs font-bold text-duo-gray-dark">
                  {unit.completedByUsers} user{unit.completedByUsers !== 1 ? 's' : ''} finished
                </span>
              </div>
              <MiniBar value={unit.completedByUsers} max={Math.max(users.total, 1)} color={unit.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Top / least completed lessons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <SectionTitle>Most Completed Lessons</SectionTitle>
          <div className="bg-white rounded-2xl border-2 border-duo-gray-mid p-4 mt-3 flex flex-col gap-3">
            {topLessons.map((l) => (
              <div key={l.id} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-duo-navy truncate">{l.title}</span>
                <MiniBar value={l.completions} max={maxCompletions} color="#58CC02" />
                <span className="text-xs text-duo-gray-dark">{l.completions} completion{l.completions !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Least Completed Lessons</SectionTitle>
          <div className="bg-white rounded-2xl border-2 border-duo-gray-mid p-4 mt-3 flex flex-col gap-3">
            {leastLessons.map((l) => (
              <div key={l.id} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-duo-navy truncate">{l.title}</span>
                <MiniBar value={l.completions} max={maxCompletions} color="#FF4B4B" />
                <span className="text-xs text-duo-gray-dark">{l.completions} completion{l.completions !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function UsersTable({ data }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'xp', dir: -1 });

  if (!data) return <Spinner />;

  const sorted = [...data]
    .filter((u) => !query || u.username.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a[sort.key] > b[sort.key] ? sort.dir : -sort.dir));

  const col = (key, label) => (
    <th
      className="text-left text-xs font-bold text-duo-gray-dark uppercase tracking-wide px-3 py-2 cursor-pointer hover:text-duo-navy select-none whitespace-nowrap"
      onClick={() => setSort((s) => ({ key, dir: s.key === key ? -s.dir : -1 }))}
    >
      {label} {sort.key === key ? (sort.dir === -1 ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Search by username or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border-2 border-duo-gray-mid rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-duo-navy"
      />

      <div className="bg-white rounded-2xl border-2 border-duo-gray-mid overflow-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="border-b-2 border-duo-gray-mid bg-duo-gray-light">
            <tr>
              {col('username', 'User')}
              {col('xp', 'XP')}
              {col('streak', 'Streak')}
              {col('completedLessons', 'Lessons')}
              {col('completedUnits', 'Units')}
              {col('last_active', 'Last Active')}
              {col('created_at', 'Joined')}
            </tr>
          </thead>
          <tbody>
            {sorted.map((u, i) => (
              <tr key={u.id} className={`border-t border-duo-gray-mid ${i % 2 === 0 ? '' : 'bg-duo-gray-light/40'}`}>
                <td className="px-3 py-2">
                  <div className="font-bold">{u.username}</div>
                  <div className="text-xs text-duo-gray-dark">{u.email}</div>
                </td>
                <td className="px-3 py-2 font-bold text-duo-yellow">⚡ {u.xp}</td>
                <td className="px-3 py-2">
                  {u.streak > 0 ? <span className="font-bold text-duo-orange">🔥 {u.streak}</span> : <span className="text-duo-gray-dark">—</span>}
                </td>
                <td className="px-3 py-2 font-bold">{u.completedLessons} <span className="text-duo-gray-dark font-normal">/ 12</span></td>
                <td className="px-3 py-2 font-bold">{u.completedUnits} <span className="text-duo-gray-dark font-normal">/ 4</span></td>
                <td className="px-3 py-2 text-xs text-duo-gray-dark">{timeAgo(u.last_active)}</td>
                <td className="px-3 py-2 text-xs text-duo-gray-dark">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-duo-gray-dark">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-duo-gray-dark">{sorted.length} user{sorted.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ── Lessons tab ───────────────────────────────────────────────────────────────

function LessonsTable({ data }) {
  if (!data) return <Spinner />;
  const maxRate = Math.max(...data.map((l) => l.completionRate), 1);

  return (
    <div className="bg-white rounded-2xl border-2 border-duo-gray-mid overflow-auto">
      <table className="w-full text-sm min-w-[500px]">
        <thead className="border-b-2 border-duo-gray-mid bg-duo-gray-light">
          <tr>
            <th className="text-left text-xs font-bold text-duo-gray-dark uppercase tracking-wide px-3 py-2">Lesson</th>
            <th className="text-left text-xs font-bold text-duo-gray-dark uppercase tracking-wide px-3 py-2">Unit</th>
            <th className="text-left text-xs font-bold text-duo-gray-dark uppercase tracking-wide px-3 py-2">Completions</th>
            <th className="text-left text-xs font-bold text-duo-gray-dark uppercase tracking-wide px-3 py-2 w-40">Completion Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l, i) => (
            <tr key={l.id} className={`border-t border-duo-gray-mid ${i % 2 === 0 ? '' : 'bg-duo-gray-light/40'}`}>
              <td className="px-3 py-2 font-semibold">{l.title}</td>
              <td className="px-3 py-2 text-xs">
                <span className="font-bold">{l.unitIcon} {l.unitTitle}</span>
              </td>
              <td className="px-3 py-2 font-bold">{l.completions}</td>
              <td className="px-3 py-2">
                <MiniBar value={l.completionRate} max={100} color={l.unitColor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── shared ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 rounded-full border-4 border-duo-navy border-t-transparent animate-spin" />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { isAdmin, logout, fetch } = useAdmin();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [lessonStats, setLessonStats] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetch('/overview').then(setOverview).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'users' && !users) fetch('/users').then(setUsers).catch(() => {});
    if (tab === 'lessons' && !lessonStats) fetch('/lessons').then(setLessonStats).catch(() => {});
  }, [tab, isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-duo-gray-light">
      {/* Admin navbar */}
      <header className="bg-duo-navy text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-lg">
          <span>🔐</span> FinLearn Admin
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-400 font-semibold">● Live</span>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg font-bold transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-black text-2xl">Business Dashboard</h1>
          <span className="text-xs text-duo-gray-dark">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-2xl border-2 border-duo-gray-mid w-fit">
          <Tab label="📊 Overview" active={tab === 'overview'} onClick={() => setTab('overview')} />
          <Tab label="👥 Users" active={tab === 'users'} onClick={() => setTab('users')} />
          <Tab label="📚 Lessons" active={tab === 'lessons'} onClick={() => setTab('lessons')} />
        </div>

        {tab === 'overview' && <Overview data={overview} />}
        {tab === 'users' && <UsersTable data={users} />}
        {tab === 'lessons' && <LessonsTable data={lessonStats} />}
      </div>
    </div>
  );
}
