import { Button } from '../components/Button';
import { BrandWordmark } from '../components/BrandWordmark';
import { RANKED_DIFFICULTY_PRESETS } from '../data/hangul';
import { formatDuration } from '../game/quiz';
import type { DifficultyId, SavedRun, ScoreboardsByDifficulty } from '../game/types';

interface RunHistoryScreenProps {
  activeDifficulty: DifficultyId;
  scoreboards: ScoreboardsByDifficulty;
  onChangeDifficulty: (difficulty: DifficultyId) => void;
  onBack: () => void;
}

export function RunHistoryScreen({ activeDifficulty, scoreboards, onChangeDifficulty, onBack }: RunHistoryScreenProps) {
  const board = scoreboards[activeDifficulty];

  return (
    <main className="screen shell">
      <div className="panel app-view app-view--panel">
        <div className="app-view__top app-view__top--history">
          <BrandWordmark className="brand-wordmark--subpage" />

          <section className="section-block section-block--first">
            <label className="select-row" htmlFor="history-difficulty-select">
              <span className="select-row__label">Difficulty</span>
              <div className="select-row__control">
                <select
                  id="history-difficulty-select"
                  className="select-control"
                  value={activeDifficulty}
                  onChange={(event) => onChangeDifficulty(event.target.value as DifficultyId)}
                >
                  {RANKED_DIFFICULTY_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </section>

          <div className="stat-card stat-card--large stat-card--history-best">
            <span className="stat-card__label">Best Score</span>
            <strong>{board.bestScore}</strong>
          </div>
        </div>

        <div className="app-view__middle app-view__middle--history">
          {board.recentRuns.length === 0 ? (
            <div className="empty-state">No ranked runs saved yet for this difficulty.</div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th scope="col">Played</th>
                    <th scope="col">Score</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {board.recentRuns.map((run: SavedRun) => (
                    <tr key={run.id}>
                      <td>{formatRunTimestamp(run.completedAt)}</td>
                      <td>{run.score}</td>
                      <td>{formatDuration(run.totalAnswerTimeMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="app-view__bottom">
          <div className="stack-actions">
            <Button block tone="ghost" onClick={onBack}>Back</Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatRunTimestamp(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-GB', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date).replace(',', '');
}
