import { formatDuration } from '../game/quiz';

interface QuizHudProps {
  lives: number | null;
  maxLives: number | null;
  score: number;
  elapsedMs: number;
  animatedScore?: boolean;
  animatedDamage?: boolean;
}

export function QuizHud({ lives, maxLives, score, elapsedMs, animatedScore = false, animatedDamage = false }: QuizHudProps) {
  const lostHeartIndex = animatedDamage && lives !== null ? lives : -1;

  return (
    <header className="quiz-hud" aria-label="Quiz status bar">
      {lives === null || maxLives === null ? (
        <div className="hud-lives" aria-label="Lives: infinite">
          <span className="hud-heart-stack" aria-hidden="true">
            <span className="hud-heart hud-heart--filled">∞</span>
          </span>
        </div>
      ) : (
        <div className="hud-lives" aria-label={`Lives: ${lives}`}>
          {Array.from({ length: maxLives }, (_, index) => {
            const filled = index < lives;
            const isLostHeart = index === lostHeartIndex;

            return (
              <span key={index} className="hud-heart-stack" aria-hidden="true">
                <span className="hud-heart hud-heart--empty">♥</span>
                {filled || isLostHeart ? (
                  <span
                    className={[
                      'hud-heart',
                      'hud-heart--filled',
                      isLostHeart ? 'hud-heart--lost' : ''
                    ].filter(Boolean).join(' ')}
                  >
                    ♥
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      )}

      <div
        className={['hud-score', animatedScore ? 'hud-score--animated' : ''].filter(Boolean).join(' ')}
        aria-label={`Score: ${score}`}
        data-score={score}
      >
        <span className="hud-score__value">{score}</span>
      </div>

      <div className="hud-time" aria-label={`Total time: ${formatDuration(elapsedMs)}`}>
        <span className="hud-time__label">Total time:</span>
        <span className="hud-time__value">{formatDuration(elapsedMs)}</span>
      </div>
    </header>
  );
}
