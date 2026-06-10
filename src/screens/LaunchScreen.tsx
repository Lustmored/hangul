import { AudioIcon } from '../components/AudioIcon';
import { Button } from '../components/Button';
import { BrandWordmark } from '../components/BrandWordmark';
import type { AppSettings } from '../game/types';

interface LaunchScreenProps {
  settings: AppSettings;
  onEnterApp: () => void;
  onToggleMute: () => void;
}

export function LaunchScreen({ settings, onEnterApp, onToggleMute }: LaunchScreenProps) {
  const audioButtonLabel = settings.audioMuted ? 'Unmute audio' : 'Mute audio';

  return (
    <main className="screen shell shell--hero">
      <div className="hero-card app-view app-view--hero">
        <div className="app-view__middle app-view__middle--center app-view__middle--launch">
          <BrandWordmark />
          <div className="launch-actions">
            <Button block onClick={onEnterApp}>Start</Button>
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
    </main>
  );
}
