import { Button } from '../components/Button';
import { BrandWordmark } from '../components/BrandWordmark';
import { getDifficultyPresetById } from '../data/hangul';
import { formatDuration } from '../game/quiz';
import type { DifficultyId } from '../data/hangul';

interface EndScreenProps {
  variant: 'gameOver' | 'win' | 'perfectRun';
  score: number;
  elapsedMs: number;
  livesLost: number | null;
  difficultyId: DifficultyId;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function EndScreen({ variant, score, elapsedMs, livesLost, difficultyId, onPlayAgain, onBackToHome }: EndScreenProps) {
  const title = variant === 'perfectRun' ? 'Perfect Run' : variant === 'win' ? 'You Win' : 'Game Over';
  const difficulty = getDifficultyPresetById(difficultyId);
  const showLivesLost = variant !== 'gameOver' && livesLost !== null;

  return (
    <main className="screen shell shell--hero">
      <div className={`hero-card hero-card--result hero-card--${variant} app-view app-view--hero`}>
        <div className="app-view__top app-view__top--center app-view__top--result">
          <BrandWordmark className="brand-wordmark--result" />
        </div>

        <div className="app-view__middle app-view__middle--center">
          <h1 className="result-title">{title}</h1>
          <div className="hero-stats hero-stats--result">
            <div className="stat-card">
              <span className="stat-card__label">Score</span>
              <strong>{score}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Total Time</span>
              <strong>{formatDuration(elapsedMs)}</strong>
            </div>
            {showLivesLost ? (
              <div className="stat-card">
                <span className="stat-card__label">Lives Lost</span>
                <strong>{livesLost}</strong>
              </div>
            ) : null}
            <div className="stat-card">
              <span className="stat-card__label">Difficulty</span>
              <strong>{difficulty.label}</strong>
            </div>
          </div>
          {difficultyId !== 'asian' && difficultyId !== 'training' && variant !== 'gameOver' ? (
            <p className="muted">Try a harder difficulty for a better challenge.</p>
          ) : null}
        </div>

        <div className="app-view__bottom">
          <div className="stack-actions">
            <Button block onClick={onPlayAgain}>Play Again</Button>
            <Button block tone="ghost" onClick={onBackToHome}>Back to Home</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
