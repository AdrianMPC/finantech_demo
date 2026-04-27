export function Hearts({ count, max = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-lg transition-all duration-300 ${i < count ? 'opacity-100' : 'opacity-20'}`}>
          ❤️
        </span>
      ))}
    </div>
  );
}
