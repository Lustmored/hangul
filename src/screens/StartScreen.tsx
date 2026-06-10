import { getDifficultyPresetById } from '../data/hangul';
import { AudioIcon } from '../components/AudioIcon';
import { BrandWordmark } from '../components/BrandWordmark';
import type { AppSettings, ScoreboardsByDifficulty } from '../game/types';
import { Button } from '../components/Button';

interface StartScreenProps {
  settings: AppSettings;
  scoreboards: ScoreboardsByDifficulty;
  onToggleMute: () => void;
  onStartGame: () => void;
  onOpenCredits: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function StartScreen({ settings, scoreboards, onToggleMute, onStartGame, onOpenCredits, onOpenHistory, onOpenSettings }: StartScreenProps) {
  const difficulty = getDifficultyPresetById(settings.difficultyId);
  const bestScore = scoreboards[settings.difficultyId].bestScore;
  const audioButtonLabel = settings.audioMuted ? 'Unmute audio' : 'Mute audio';

  return (
    <main className="screen shell shell--hero">
      <div className="hero-card app-view app-view--hero">
        <div className="app-view__top app-view__top--center">
          <BrandWordmark />
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
            <Button block tone="secondary" onClick={onOpenCredits}>Credits</Button>
            <div className="inline-actions">
              <Button block tone="ghost" onClick={onOpenSettings}>Settings</Button>
              <Button
                tone="ghost"
                className="icon-button"
                aria-label={audioButtonLabel}
                title={audioButtonLabel}
                onClick={onToggleMute}
              >
                <AudioIcon muted={settings.audioMuted} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
