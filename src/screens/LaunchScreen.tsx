import { AudioIcon } from '../components/AudioIcon';
import { Button } from '../components/Button';
import { BrandWordmark } from '../components/BrandWordmark';
import { RomanizationSelector } from '../components/RomanizationSelector';
import type { AppSettings } from '../game/types';
import type { RomanizationMode } from '../data/hangul';

interface LaunchScreenProps {
  settings: AppSettings;
  onEnterApp: () => void;
  onToggleMute: () => void;
  onChangeRomanizationMode: (mode: RomanizationMode) => void;
}

export function LaunchScreen({ settings, onEnterApp, onToggleMute, onChangeRomanizationMode }: LaunchScreenProps) {
  const audioButtonLabel = settings.audioMuted ? 'Unmute audio' : 'Mute audio';

  return (
    <main className="screen shell shell--hero">
      <div className="hero-card app-view app-view--hero">
        <div className="app-view__middle app-view__middle--center app-view__middle--launch">
          <BrandWordmark />
          <RomanizationSelector
            mode={settings.romanizationMode}
            onChange={onChangeRomanizationMode}
          />
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
