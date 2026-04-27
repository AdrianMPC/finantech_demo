export function XPBadge({ xp }) {
  return (
    <div className="flex items-center gap-1 font-bold text-duo-yellow">
      <span className="text-lg">⚡</span>
      <span>{xp} XP</span>
    </div>
  );
}
