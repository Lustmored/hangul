import { APP_NAME, getDifficultyPresetById } from '../data/hangul';
import type { AppSettings, ScoreboardsByDifficulty } from '../game/types';
import { Button } from '../components/Button';

interface StartScreenProps {
  settings: AppSettings;
  scoreboards: ScoreboardsByDifficulty;
  onStartGame: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function StartScreen({ settings, scoreboards, onStartGame, onOpenHistory, onOpenSettings }: StartScreenProps) {
  const difficulty = getDifficultyPresetById(settings.difficultyId);
  const bestScore = scoreboards[settings.difficultyId].bestScore;

  return (
    <main className="screen shell shell--hero">
      <div className="hero-card app-view app-view--hero">
        <div className="app-view__top app-view__top--center">
          <h1>{APP_NAME}</h1>
        </div>

        <div className="app-view__middle app-view__middle--center">
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-card__label">Current Difficulty</span>
              <strong>{difficulty.label}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Best Score</span>
              <strong>{difficulty.trackScore ? bestScore : 'Not tracked'}</strong>
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
