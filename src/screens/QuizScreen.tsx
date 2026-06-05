import { useEffect, useState } from 'react';
import { AnswerGrid } from '../components/AnswerGrid';
import { Button } from '../components/Button';
import { QuizHud } from '../components/QuizHud';
import type { QuestionResult, QuizSession } from '../game/types';

interface QuizScreenProps {
  session: QuizSession;
  animatedScore: boolean;
  animatedDamage: boolean;
  onAnswer: (optionId: string) => void;
  onTimeout: () => void;
  onNext: () => void;
}

export function QuizScreen({ session, animatedScore, animatedDamage, onAnswer, onTimeout: _onTimeout, onNext }: QuizScreenProps) {
  const question = session.question;
  const result = session.lastResult;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (result || session.questionStartedAt === null) {
      return undefined;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 50);
    return () => window.clearInterval(interval);
  }, [result, session.questionStartedAt]);

  if (!question) {
    return null;
  }

  const liveElapsedMs = session.totalAnswerTimeMs + (!result && session.questionStartedAt !== null ? now - session.questionStartedAt : 0);
  const statusContent = result ? <ResultStatus outcome={result.outcome} /> : <QuestionTimer remainingSeconds={question.remainingSeconds} />;
  const promptIsHangul = /[\u3131-\u318E\uAC00-\uD7A3]/.test(question.prompt);
  const promptLength = question.prompt.length;
  const promptClassName = [
    'prompt',
    promptIsHangul ? 'prompt--hangul' : 'prompt--latin',
    promptLength <= 2 ? 'prompt--short' : promptLength <= 4 ? 'prompt--medium' : 'prompt--long'
  ].join(' ');

  return (
    <main className="screen shell shell--quiz" onClick={result ? onNext : undefined}>
      <div className="quiz-card">
        <QuizHud
          lives={session.lives}
          score={session.score}
          elapsedMs={liveElapsedMs}
          animatedScore={animatedScore}
          animatedDamage={animatedDamage}
        />

        <div className={promptClassName}>{question.prompt}</div>

        <div className="quiz-status-lane">
          {statusContent}
        </div>

        <AnswerGrid
          options={question.options}
          disabled={Boolean(result)}
          selectedOptionId={result?.selectedOptionId ?? null}
          correctOptionId={result?.correctOptionId ?? null}
          onSelect={onAnswer}
        />

        <div className="quiz-action-lane" onClick={result ? (event) => event.stopPropagation() : undefined}>
          {result ? (
            <Button block className="quiz-next-button" onClick={onNext}>Next</Button>
          ) : (
            <QuestionProgressBar
              now={now}
              questionStartedAt={session.questionStartedAt}
              timeLimitSeconds={question.timeLimitSeconds}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function QuestionTimer({ remainingSeconds }: { remainingSeconds: number | null }) {
  if (remainingSeconds === null) {
    return <div className="question-timer question-timer--untimed">No Timer</div>;
  }

  return <div className="question-timer">{remainingSeconds}s</div>;
}

function QuestionProgressBar({
  now,
  questionStartedAt,
  timeLimitSeconds
}: {
  now: number;
  questionStartedAt: number | null;
  timeLimitSeconds: number | null;
}) {
  if (questionStartedAt === null || timeLimitSeconds === null) {
    return <div className="question-progress question-progress--untimed" aria-label="Untimed question" />;
  }

  const elapsedMs = Math.max(0, now - questionStartedAt);
  const totalMs = timeLimitSeconds * 1000;
  const progress = Math.max(0, Math.min(1, elapsedMs / totalMs));
  const hue = Math.max(0, Math.round((1 - progress) * 120));

  return (
    <div className="question-progress" aria-label="Question timer progress">
      <div
        className="question-progress__fill"
        style={{ width: `${progress * 100}%`, backgroundColor: `hsl(${hue} 80% 50%)` }}
      />
    </div>
  );
}

function ResultStatus({ outcome }: { outcome: QuestionResult['outcome'] }) {
  const label = outcome === 'correct' ? 'Correct' : outcome === 'wrong' ? 'Wrong' : "Time's Up";
  const tone = outcome === 'correct' ? 'result-status--correct' : outcome === 'wrong' ? 'result-status--wrong' : 'result-status--timeout';

  return <div className={`result-status ${tone}`}>{label}</div>;
}
