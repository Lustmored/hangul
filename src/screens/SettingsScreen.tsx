import { Button } from '../components/Button';
import { DIFFICULTY_PRESETS } from '../data/hangul';
import type { AppSettings } from '../game/types';

interface SettingsScreenProps {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onBack: () => void;
  onReset: () => void;
}

export function SettingsScreen({ settings, onChange, onBack, onReset }: SettingsScreenProps) {
  const volumeLabel = settings.sfxVolume === 0 ? 'Muted' : `${settings.sfxVolume}%`;

  return (
    <main className="screen shell">
      <div className="panel app-view app-view--panel">
        <div className="app-view__top app-view__top--settings">
          <h1>Settings</h1>
        </div>

        <div className="app-view__middle app-view__middle--scrollable app-view__middle--settings">
          <section className="section-block section-block--first">
            <div className="setting-card">
              <div className="setting-card__head">
                <h2>SFX Volume</h2>
                <strong className="setting-card__value">{volumeLabel}</strong>
              </div>

              <div className="volume-slider-card">
                <label className="volume-slider" htmlFor="sfx-volume">
                  <span className="sr-only">Set SFX volume</span>
                  <input
                    id="sfx-volume"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.sfxVolume}
                    style={{ ['--slider-fill' as string]: `${settings.sfxVolume}%` }}
                    onChange={(event) => onChange({ ...settings, sfxVolume: Number(event.target.value) })}
                  />
                </label>
                <div className="volume-slider__legend" aria-hidden="true">
                  <span>Mute</span>
                  <span>Max</span>
                </div>
              </div>

              <p className="muted">SFX only. No background music in the first version.</p>
            </div>
          </section>

          <section className="section-block">
            <div className="group-label">Difficulty</div>
            <div className="option-list">
              {DIFFICULTY_PRESETS.map((preset) => (
                <label key={preset.id} className={`option-card ${settings.difficultyId === preset.id ? 'option-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    checked={settings.difficultyId === preset.id}
                    onChange={() => onChange({ ...settings, difficultyId: preset.id })}
                  />
                  <span className="option-card__label">{preset.label}</span>
                  <span className="option-card__meta">
                    <small className="option-card__hint">
                      {preset.seconds === null || preset.lives === null ? (
                        <>
                          No timer ·{' '}
                          <span className="difficulty-hearts" aria-label="Infinite lives">
                            ∞♥
                          </span>{' '}
                          · no high scores
                        </>
                      ) : (
                        <>
                          {preset.seconds}s ·{' '}
                          <span className="difficulty-hearts" aria-label={`${preset.lives} lives`}>
                            {Array.from({ length: preset.lives }, (_, index) => (
                              <span key={index} aria-hidden="true">♥</span>
                            ))}
                          </span>
                        </>
                      )}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="section-block section-block--danger">
            <div className="section-block__head">
              <h2>Danger Zone</h2>
            </div>
            <p className="muted">This immediately wipes saved settings, best scores, and recent runs after confirmation.</p>
            <Button block tone="danger" onClick={onReset}>Reset Local Data</Button>
          </section>
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
