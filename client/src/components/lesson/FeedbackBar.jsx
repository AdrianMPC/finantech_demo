export function FeedbackBar({ result, explanation, onNext }) {
  if (!result) return null;

  const isCorrect = result === 'correct';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 animate-slide-up
        ${isCorrect ? 'bg-green-50 border-t-4 border-duo-green' : 'bg-red-50 border-t-4 border-duo-red'}`}
    >
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
          <div>
            <p className={`font-black text-lg ${isCorrect ? 'text-duo-green-dark' : 'text-duo-red-dark'}`}>
              {isCorrect ? 'Correct!' : 'Not quite!'}
            </p>
            {explanation && <p className="text-sm text-gray-600 mt-0.5">{explanation}</p>}
          </div>
        </div>
        <button
          onClick={onNext}
          className={`w-full font-bold py-3 rounded-2xl border-b-4 transition-all duration-150 active:translate-y-0.5 text-white
            ${isCorrect
              ? 'bg-duo-green border-duo-green-dark hover:bg-duo-green-dark'
              : 'bg-duo-red border-duo-red-dark hover:bg-duo-red-dark'}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
