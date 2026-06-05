import { Button } from '../components/Button';
import { TIMER_PRESETS } from '../data/hangul';
import { formatDuration } from '../game/quiz';
import type { SavedRun, ScoreboardsByTimer, TimerPresetId } from '../game/types';

interface RunHistoryScreenProps {
  activeTimer: TimerPresetId;
  scoreboards: ScoreboardsByTimer;
  onChangeTimer: (timer: TimerPresetId) => void;
  onBack: () => void;
}

export function RunHistoryScreen({ activeTimer, scoreboards, onChangeTimer, onBack }: RunHistoryScreenProps) {
  const board = scoreboards[activeTimer];

  return (
    <main className="screen shell">
      <div className="panel">
        <div className="panel__header">
          <h1>Run History</h1>
          <Button tone="ghost" onClick={onBack}>Back</Button>
        </div>

        <div className="tab-row" role="tablist" aria-label="Timer presets">
          {TIMER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="tab"
              className={`tab ${activeTimer === preset.id ? 'tab--active' : ''}`}
              aria-selected={activeTimer === preset.id}
              onClick={() => onChangeTimer(preset.id)}
            >
              {preset.id === 'none' ? 'No Timer' : preset.label.replace(/ \(.+\)/, '')}
            </button>
          ))}
        </div>

        <div className="stat-card stat-card--large">
          <span className="stat-card__label">Best Score</span>
          <strong>{board.bestScore}</strong>
        </div>

        <div className="history-list">
          {board.recentRuns.length === 0 ? (
            <div className="empty-state">No runs saved yet for this timer.</div>
          ) : (
            board.recentRuns.map((run: SavedRun) => (
              <article key={run.id} className="history-row">
                <div>
                  <span className="history-row__label">Score</span>
                  <strong>{run.score}</strong>
                </div>
                <div>
                  <span className="history-row__label">Time</span>
                  <strong>{formatDuration(run.totalAnswerTimeMs)}</strong>
                </div>
                <div>
                  <span className="history-row__label">Result</span>
                  <strong>{run.perfectClear ? 'Perfect Run' : run.endedIn === 'full-clear' ? 'You Win' : 'Game Over'}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
