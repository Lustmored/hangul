import { formatDuration } from '../game/quiz';

interface QuizHudProps {
  lives: number;
  score: number;
  elapsedMs: number;
  animatedScore?: boolean;
  animatedDamage?: boolean;
}

export function QuizHud({ lives, score, elapsedMs, animatedScore = false, animatedDamage = false }: QuizHudProps) {
  return (
    <header className="quiz-hud" aria-label="Quiz status bar">
      <div className={`hud-lives ${animatedDamage ? 'hud-lives--damage' : ''}`} aria-label={`Lives: ${lives}`}>
        {Array.from({ length: 3 }, (_, index) => {
          const filled = index < lives;
          return (
            <span
              key={index}
              className={`hud-heart ${filled ? 'hud-heart--filled' : 'hud-heart--empty'}`}
              aria-hidden="true"
            >
              ♥
            </span>
          );
        })}
      </div>

      <div className={`hud-score ${animatedScore ? 'hud-score--animated' : ''}`} aria-label={`Score: ${score}`}>
        {score}
      </div>

      <div className="hud-time" aria-label={`Total time: ${formatDuration(elapsedMs)}`}>
        <span className="hud-time__label">Total time:</span>
        <span className="hud-time__value">{formatDuration(elapsedMs)}</span>
      </div>
    </header>
  );
}
