import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Layout } from '../components/layout/Layout';
import { ProgressBar } from '../components/ui/ProgressBar';

function UnitHeader({ unit }) {
  return (
    <div
      className="rounded-2xl p-4 text-white flex items-center gap-3 shadow-md"
      style={{ backgroundColor: unit.color }}
    >
      <span className="text-4xl">{unit.icon}</span>
      <div>
        <p className="text-xs font-bold uppercase opacity-75">Unit {unit.order_index}</p>
        <h2 className="font-black text-lg leading-tight">{unit.title}</h2>
        <p className="text-xs opacity-80 mt-0.5">{unit.description}</p>
      </div>
    </div>
  );
}

function LessonNode({ lesson, index, unitColor, isLocked, onClick }) {
  const isLeft = index % 2 === 0;
  const completed = lesson.completed;

  return (
    <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} px-8`}>
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`relative flex flex-col items-center gap-1 group
          ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl
            border-b-4 transition-all duration-150 shadow-md
            ${isLocked ? 'bg-gray-200 border-gray-300' : ''}
            ${!isLocked && !completed ? 'text-white border-opacity-60 active:translate-y-0.5 group-hover:scale-105' : ''}
            ${completed ? 'ring-4 ring-offset-2' : ''}`}
          style={
            !isLocked
              ? {
                  backgroundColor: completed ? unitColor : unitColor,
                  borderColor: completed ? `${unitColor}99` : `${unitColor}80`,
                  ringColor: unitColor,
                }
              : {}
          }
        >
          {completed ? '⭐' : isLocked ? '🔒' : '▶'}
        </div>
        <span
          className={`text-xs font-bold text-center max-w-20 leading-tight
            ${isLocked ? 'text-gray-400' : 'text-duo-navy'}`}
        >
          {lesson.title}
        </span>
        {completed && (
          <span className="text-xs font-bold" style={{ color: unitColor }}>
            +{lesson.xp_earned} XP
          </span>
        )}
      </button>
    </div>
  );
}

export function Learn() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.units.list().then(setUnits).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center pt-20">
          <div className="w-10 h-10 rounded-full border-4 border-duo-green border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  const totalLessons = units.flatMap((u) => u.lessons).length;
  const completedLessons = units.flatMap((u) => u.lessons).filter((l) => l.completed).length;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-black text-2xl mb-1">Your Learning Path</h1>
        <div className="flex items-center gap-2 text-sm text-duo-gray-dark mb-2">
          <span>{completedLessons} / {totalLessons} lessons completed</span>
        </div>
        <ProgressBar value={completedLessons} max={totalLessons} />
      </div>

      <div className="flex flex-col gap-6">
        {units.map((unit) => {
          const prevUnitCompleted =
            unit.order_index === 1 ||
            units
              .find((u) => u.order_index === unit.order_index - 1)
              ?.lessons.every((l) => l.completed);

          return (
            <section key={unit.id} className="flex flex-col gap-4">
              <UnitHeader unit={unit} />

              <div className="flex flex-col gap-5 py-2">
                {unit.lessons.map((lesson, i) => {
                  const prevLessonDone = i === 0 ? prevUnitCompleted : unit.lessons[i - 1].completed;
                  const isLocked = !prevLessonDone;

                  return (
                    <LessonNode
                      key={lesson.id}
                      lesson={lesson}
                      index={i}
                      unitColor={unit.color}
                      isLocked={isLocked}
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Layout>
  );
}
