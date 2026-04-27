export function OptionButton({ label, state, onClick, disabled }) {
  const styles = {
    idle: 'border-duo-gray-mid hover:border-duo-blue hover:bg-blue-50 bg-white',
    correct: 'border-duo-green bg-green-50 text-duo-green-dark',
    wrong: 'border-duo-red bg-red-50 text-duo-red-dark animate-shake',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-2xl border-2 border-b-4 font-semibold text-sm
        transition-all duration-150 active:translate-y-0.5 disabled:cursor-not-allowed
        ${styles[state] ?? styles.idle}`}
    >
      {label}
    </button>
  );
}
