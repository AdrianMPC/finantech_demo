import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Hearts } from '../components/ui/Hearts';
import { OptionButton } from '../components/lesson/OptionButton';
import { FeedbackBar } from '../components/lesson/FeedbackBar';

const INITIAL_HEARTS = 5;

export function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hearts, setHearts] = useState(INITIAL_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const celebrationRef = useRef(false);

  useEffect(() => {
    api.lessons.get(id).then(setLesson).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-duo-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold">Lesson not found</p>
        <button className="btn-primary" onClick={() => navigate('/learn')}>Back to Learn</button>
      </div>
    );
  }

  const exercises = lesson.exercises;
  const current = exercises[currentIndex];

  const handleSelect = (option) => {
    if (selected !== null || feedback) return;
    setSelected(option);

    const isCorrect = option === current.correct_answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  };

  const handleNext = async () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setFeedback(null);
    } else if (!celebrationRef.current) {
      celebrationRef.current = true;
      try {
        const result = await api.progress.complete(lesson.id, correctCount);
        setXpEarned(result.xpEarned);
        updateUser(result.user);
      } catch {}
      setFinished(true);
    }
  };

  const optionState = (option) => {
    if (!feedback) return 'idle';
    if (option === current.correct_answer) return 'correct';
    if (option === selected) return 'wrong';
    return 'idle';
  };

  if (finished) {
    const score = Math.round((correctCount / exercises.length) * 100);
    return (
      <div className="min-h-screen bg-duo-navy flex flex-col items-center justify-center px-4 text-center">
        <div className="animate-bounce-in flex flex-col items-center gap-4">
          <span className="text-8xl">{score >= 60 ? '🏆' : '📖'}</span>
          <h1 className="text-white font-black text-3xl">
            {score >= 60 ? 'Lesson Complete!' : 'Keep Practicing!'}
          </h1>
          <p className="text-duo-gray-dark text-lg">
            {correctCount} / {exercises.length} correct
          </p>
          {xpEarned > 0 && (
            <div className="bg-duo-yellow text-duo-navy font-black text-xl px-6 py-3 rounded-2xl animate-pop">
              ⚡ +{xpEarned} XP earned!
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button className="btn-secondary" onClick={() => navigate('/learn')}>
              Back to Path
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setCurrentIndex(0);
                setSelected(null);
                setFeedback(null);
                setHearts(INITIAL_HEARTS);
                setCorrectCount(0);
                setFinished(false);
                celebrationRef.current = false;
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-duo-gray-light">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-duo-gray-mid px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/learn')}
            className="text-duo-gray-dark hover:text-duo-navy font-bold text-xl transition-colors"
          >
            ✕
          </button>
          <div className="flex-1">
            <ProgressBar value={currentIndex} max={exercises.length} />
          </div>
          <Hearts count={hearts} />
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-48">
        <div className="animate-bounce-in" key={currentIndex}>
          <p className="text-xs font-bold text-duo-gray-dark uppercase tracking-widest mb-4">
            Question {currentIndex + 1} of {exercises.length}
          </p>
          <h2 className="font-black text-xl leading-snug mb-6">{current.question}</h2>

          <div className="flex flex-col gap-3">
            {current.options?.map((option) => (
              <OptionButton
                key={option}
                label={option}
                state={optionState(option)}
                onClick={() => handleSelect(option)}
                disabled={!!feedback}
              />
            ))}
          </div>
        </div>
      </div>

      <FeedbackBar
        result={feedback}
        explanation={feedback ? current.explanation : null}
        onNext={handleNext}
      />
    </div>
  );
}
