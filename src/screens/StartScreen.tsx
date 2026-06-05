import { APP_NAME, getTimerPresetById } from '../data/hangul';
import type { AppSettings, ScoreboardsByTimer } from '../game/types';
import { Button } from '../components/Button';

interface StartScreenProps {
  settings: AppSettings;
  scoreboards: ScoreboardsByTimer;
  onStartGame: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function StartScreen({ settings, scoreboards, onStartGame, onOpenHistory, onOpenSettings }: StartScreenProps) {
  const timer = getTimerPresetById(settings.timerPresetId);
  const bestScore = scoreboards[settings.timerPresetId].bestScore;

  return (
    <main className="screen shell shell--hero">
      <div className="hero-card app-view app-view--hero">
        <div className="app-view__top app-view__top--center">
          <h1>{APP_NAME}</h1>
        </div>

        <div className="app-view__middle app-view__middle--center">
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-card__label">Current Timer</span>
              <strong>{timer.label}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Best Score</span>
              <strong>{bestScore}</strong>
            </div>
          </div>
        </div>

        <div className="app-view__bottom">
          <div className="stack-actions">
            <Button block onClick={onStartGame}>Start Game</Button>
            <Button block tone="secondary" onClick={onOpenHistory}>Run History</Button>
            <Button block tone="ghost" onClick={onOpenSettings}>Settings</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
