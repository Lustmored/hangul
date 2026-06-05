import { Button } from '../components/Button';
import { getTimerPresetById } from '../data/hangul';
import { formatDuration } from '../game/quiz';
import type { TimerPresetId } from '../data/hangul';

interface EndScreenProps {
  variant: 'gameOver' | 'win' | 'perfectRun';
  score: number;
  elapsedMs: number;
  livesLost: number;
  timerPresetId: TimerPresetId;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function EndScreen({ variant, score, elapsedMs, livesLost, timerPresetId, onPlayAgain, onBackToHome }: EndScreenProps) {
  const title = variant === 'perfectRun' ? 'Perfect Run' : variant === 'win' ? 'You Win' : 'Game Over';
  const timer = getTimerPresetById(timerPresetId);

  return (
    <main className="screen shell shell--hero">
      <div className={`hero-card hero-card--result hero-card--${variant}`}>
        <h1>{title}</h1>
        <div className="hero-stats hero-stats--result">
          <div className="stat-card">
            <span className="stat-card__label">Score</span>
            <strong>{score}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Total Time</span>
            <strong>{formatDuration(elapsedMs)}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Lives Lost</span>
            <strong>{livesLost}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Timer</span>
            <strong>{timer.label}</strong>
          </div>
        </div>
        {timerPresetId !== 'blitz' && variant !== 'gameOver' ? (
          <p className="muted">Try a lower timer for a better challenge.</p>
        ) : null}
        <div className="stack-actions">
          <Button block onClick={onPlayAgain}>Play Again</Button>
          <Button block tone="ghost" onClick={onBackToHome}>Back to Home</Button>
        </div>
      </div>
    </main>
  );
}
