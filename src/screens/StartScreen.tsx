import { getDifficultyPresetById } from '../data/hangul';
import { BrandWordmark } from '../components/BrandWordmark';
import type { AppSettings, ScoreboardsByDifficulty } from '../game/types';
import { Button } from '../components/Button';

interface StartScreenProps {
  settings: AppSettings;
  scoreboards: ScoreboardsByDifficulty;
  onToggleMute: () => void;
  onStartGame: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function StartScreen({ settings, scoreboards, onToggleMute, onStartGame, onOpenHistory, onOpenSettings }: StartScreenProps) {
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

function AudioIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      className="icon-button__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h3.8L13 18V6L7.8 10H4z" />
      {muted ? (
        <path d="M16 8l4 8M20 8l-4 8" />
      ) : (
        <>
          <path d="M16.5 9.5a4.5 4.5 0 0 1 0 5" />
          <path d="M19 7a8 8 0 0 1 0 10" />
        </>
      )}
    </svg>
  );
}
