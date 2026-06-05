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
      <div className="hero-card">
        <p className="eyebrow">Dark mode reading arcade</p>
        <h1>{APP_NAME}</h1>
        <p className="hero-copy">Fast Hangul recognition. Rising difficulty. One more run.</p>
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
        <div className="stack-actions">
          <Button block onClick={onStartGame}>Start Game</Button>
          <Button block tone="secondary" onClick={onOpenHistory}>Run History</Button>
          <Button block tone="ghost" onClick={onOpenSettings}>Settings</Button>
        </div>
      </div>
    </main>
  );
}
