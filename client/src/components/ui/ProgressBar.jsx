export function ProgressBar({ value, max, color = 'bg-duo-green' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-4 bg-duo-gray-mid rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
