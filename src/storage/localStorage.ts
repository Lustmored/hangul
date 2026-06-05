import { TIMER_PRESETS, type TimerPresetId } from '../data/hangul';
import type { AppSettings, SavedRun, Scoreboard, ScoreboardsByTimer } from '../game/types';

const SETTINGS_KEY = 'hangul-rush:settings';
const RUN_HISTORY_KEY = 'hangul-rush:run-history';

const defaultScoreboard = (): Scoreboard => ({ bestScore: 0, recentRuns: [] });

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  timerPresetId: 'relaxed'
};

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const validTimer = TIMER_PRESETS.some((preset) => preset.id === parsed.timerPresetId);

    return {
      soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
      timerPresetId: validTimer ? (parsed.timerPresetId as TimerPresetId) : DEFAULT_SETTINGS.timerPresetId
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadScoreboards(): ScoreboardsByTimer {
  const raw = localStorage.getItem(RUN_HISTORY_KEY);
  const seed = Object.fromEntries(TIMER_PRESETS.map((preset) => [preset.id, defaultScoreboard()])) as ScoreboardsByTimer;

  if (!raw) {
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ScoreboardsByTimer>;

    for (const preset of TIMER_PRESETS) {
      const source = parsed[preset.id];
      if (!source) {
        continue;
      }

      seed[preset.id] = {
        bestScore: typeof source.bestScore === 'number' ? source.bestScore : 0,
        recentRuns: Array.isArray(source.recentRuns) ? source.recentRuns.slice(0, 10) as SavedRun[] : []
      };
    }

    return seed;
  } catch {
    return seed;
  }
}

export function saveRun(scoreboards: ScoreboardsByTimer, run: SavedRun): ScoreboardsByTimer {
  const existing = scoreboards[run.timerPresetId] ?? defaultScoreboard();
  const updated: ScoreboardsByTimer = {
    ...scoreboards,
    [run.timerPresetId]: {
      bestScore: Math.max(existing.bestScore, run.score),
      recentRuns: [run, ...existing.recentRuns].slice(0, 10)
    }
  };

  localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function resetLocalData(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(RUN_HISTORY_KEY);
}
