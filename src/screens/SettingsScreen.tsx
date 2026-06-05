import { Button } from '../components/Button';
import { TIMER_PRESETS } from '../data/hangul';
import type { AppSettings } from '../game/types';

interface SettingsScreenProps {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onBack: () => void;
  onReset: () => void;
}

export function SettingsScreen({ settings, onChange, onBack, onReset }: SettingsScreenProps) {
  return (
    <main className="screen shell">
      <div className="panel">
        <div className="panel__header">
          <h1>Settings</h1>
          <Button tone="ghost" onClick={onBack}>Back</Button>
        </div>

        <section className="section-block">
          <div className="section-block__head">
            <h2>Sound</h2>
            <button
              type="button"
              className={`toggle ${settings.soundEnabled ? 'toggle--on' : ''}`}
              aria-pressed={settings.soundEnabled}
              onClick={() => onChange({ ...settings, soundEnabled: !settings.soundEnabled })}
            >
              <span>{settings.soundEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>
          <p className="muted">SFX only. No background music in the first version.</p>
        </section>

        <section className="section-block">
          <div className="section-block__head">
            <h2>Timer</h2>
          </div>
          <div className="option-list">
            {TIMER_PRESETS.map((preset) => (
              <label key={preset.id} className={`option-card ${settings.timerPresetId === preset.id ? 'option-card--selected' : ''}`}>
                <input
                  type="radio"
                  name="timer-preset"
                  checked={settings.timerPresetId === preset.id}
                  onChange={() => onChange({ ...settings, timerPresetId: preset.id })}
                />
                <span>{preset.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="section-block section-block--danger">
          <div className="section-block__head">
            <h2>Danger Zone</h2>
          </div>
          <p className="muted">This immediately wipes saved settings, best scores, and recent runs after confirmation.</p>
          <Button tone="danger" onClick={onReset}>Reset Local Data</Button>
        </section>
      </div>
    </main>
  );
}
