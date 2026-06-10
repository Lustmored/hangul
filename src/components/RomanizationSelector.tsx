import { ROMANIZATION_PRESETS, getRomanizationPresetById, type RomanizationMode } from '../data/hangul';

interface RomanizationSelectorProps {
  mode: RomanizationMode;
  onChange: (mode: RomanizationMode) => void;
}

export function RomanizationSelector({ mode, onChange }: RomanizationSelectorProps) {
  const selected = getRomanizationPresetById(mode);

  return (
    <div className="setting-card">
      <div className="setting-card__head">
        <h2>Romanization</h2>
      </div>

      <div className="option-list">
        {ROMANIZATION_PRESETS.map((preset) => (
          <label key={preset.id} className={`option-card ${mode === preset.id ? 'option-card--selected' : ''}`}>
            <input
              type="radio"
              name="romanization-mode"
              checked={mode === preset.id}
              onChange={() => onChange(preset.id)}
            />
            <span className="option-card__label">{preset.label}</span>
            <span className="option-card__meta">
              <small className="option-card__hint">
                <span>{mode === preset.id ? selected.hint : preset.hint}</span>
                <span className="option-card__examples">
                  <span className="option-card__example">{preset.examples[0]}</span>
                  <span className="option-card__example">{preset.examples[1]}</span>
                </span>
              </small>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
