import { DIFFICULTY_PRESETS, ROMANIZATION_PRESETS, RANKED_DIFFICULTY_PRESETS, type DifficultyId } from '../data/hangul';
import type { AppSettings, SavedRun, Scoreboard, ScoreboardsByDifficulty } from '../game/types';

const SETTINGS_KEY = 'hangul-rush:settings';
const RUN_HISTORY_KEY = 'hangul-rush:run-history';

const defaultScoreboard = (): Scoreboard => ({ bestScore: 0, recentRuns: [] });
const DEFAULT_SFX_VOLUME = 85;
const DEFAULT_MUSIC_VOLUME = 35;

export const DEFAULT_SETTINGS: AppSettings = {
  sfxVolume: DEFAULT_SFX_VOLUME,
  musicVolume: DEFAULT_MUSIC_VOLUME,
  audioMuted: false,
  difficultyId: 'normal',
  romanizationMode: 'spelling'
};

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings & { soundEnabled?: boolean }>;
    const parsedDifficultyId = typeof parsed.difficultyId === 'string' ? parsed.difficultyId : null;
    const validDifficulty = DIFFICULTY_PRESETS.some((preset) => preset.id === parsedDifficultyId);
    const parsedRomanizationMode = typeof parsed.romanizationMode === 'string' ? parsed.romanizationMode : null;
    const validRomanizationMode = ROMANIZATION_PRESETS.some((preset) => preset.id === parsedRomanizationMode);
    const parsedSfxVolume =
      typeof parsed.sfxVolume === 'number'
        ? parsed.sfxVolume
        : typeof parsed.soundEnabled === 'boolean'
          ? (parsed.soundEnabled ? DEFAULT_SFX_VOLUME : 0)
          : DEFAULT_SETTINGS.sfxVolume;
    const parsedMusicVolume =
      typeof parsed.musicVolume === 'number'
        ? parsed.musicVolume
        : DEFAULT_SETTINGS.musicVolume;

    return {
      sfxVolume: clampVolume(parsedSfxVolume),
      musicVolume: clampVolume(parsedMusicVolume),
      audioMuted: typeof parsed.audioMuted === 'boolean' ? parsed.audioMuted : false,
      difficultyId: validDifficulty ? (parsedDifficultyId as DifficultyId) : DEFAULT_SETTINGS.difficultyId,
      romanizationMode: validRomanizationMode ? (parsedRomanizationMode as AppSettings['romanizationMode']) : DEFAULT_SETTINGS.romanizationMode
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      sfxVolume: clampVolume(settings.sfxVolume),
      musicVolume: clampVolume(settings.musicVolume),
      audioMuted: Boolean(settings.audioMuted)
    })
  );
}

export function loadScoreboards(): ScoreboardsByDifficulty {
  const raw = localStorage.getItem(RUN_HISTORY_KEY);
  const seed = Object.fromEntries(DIFFICULTY_PRESETS.map((preset) => [preset.id, defaultScoreboard()])) as ScoreboardsByDifficulty;

  if (!raw) {
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<Scoreboard> | undefined>;

    for (const preset of DIFFICULTY_PRESETS) {
      const source = parsed[preset.id];
      if (!source) {
        continue;
      }

      seed[preset.id] = {
        bestScore: typeof source.bestScore === 'number' ? source.bestScore : 0,
        recentRuns: Array.isArray(source.recentRuns) ? (source.recentRuns as SavedRun[]) : []
      };
    }

    return seed;
  } catch {
    return seed;
  }
}

export function saveRun(scoreboards: ScoreboardsByDifficulty, run: SavedRun): ScoreboardsByDifficulty {
  const preset = DIFFICULTY_PRESETS.find((candidate) => candidate.id === run.difficultyId);
  if (!preset?.trackScore) {
    return scoreboards;
  }

  const existing = scoreboards[run.difficultyId] ?? defaultScoreboard();
  const updated: ScoreboardsByDifficulty = {
    ...scoreboards,
    [run.difficultyId]: {
      bestScore: Math.max(existing.bestScore, run.score),
      recentRuns: [run, ...existing.recentRuns]
    }
  };

  localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function getDefaultHistoryDifficultyId(preferred: DifficultyId): DifficultyId {
  return RANKED_DIFFICULTY_PRESETS.some((preset) => preset.id === preferred) ? preferred : DEFAULT_SETTINGS.difficultyId;
}

export function resetLocalData(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(RUN_HISTORY_KEY);
}

function clampVolume(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
