export type MusicTrack = 'menu' | 'gameplay' | null;

export interface MusicDebugState {
  primed: boolean;
  activeTrack: MusicTrack;
  selectedFormat: 'ogg' | 'm4a' | 'unknown';
  menuSrc: string | null;
  gameplaySrc: string | null;
  menuPaused: boolean | null;
  gameplayPaused: boolean | null;
  menuReadyState: number | null;
  gameplayReadyState: number | null;
  menuTime: number | null;
  gameplayTime: number | null;
  menuVolume: number | null;
  gameplayVolume: number | null;
  lastError: string | null;
}

export interface MusicController {
  prime: () => void;
  setTrack: (track: MusicTrack) => void;
  setVolume: (volume: number) => void;
  suspend: () => void;
  resume: () => void;
  getDebugState: () => MusicDebugState;
  dispose: () => void;
}

const FADE_DURATION_MS = 500;
const FADE_TICK_MS = 40;
const MUSIC_GAIN_MULTIPLIER = 0.38;

type TrackKey = 'menu' | 'gameplay';
type Format = 'ogg' | 'm4a';

interface ManagedAudio {
  audio: HTMLAudioElement;
  stem: string;
  currentFormat: Format | 'unknown';
  triedFormats: Set<Format>;
  sourceUrl: string | null;
  loadingPromise: Promise<void> | null;
}

export function createMusicController(initialVolume: number): MusicController {
  let musicVolume = clampVolume(initialVolume);
  let primed = false;
  let activeTrack: MusicTrack = null;
  let fadeInterval: number | null = null;
  let lastStartedTrack: MusicTrack = null;
  let lastError: string | null = null;
  const baseUrl = import.meta.env.BASE_URL;

  const trackOrder = detectFormatOrder();
  const managedByTrack: Record<TrackKey, ManagedAudio> | null =
    typeof window === 'undefined'
      ? null
      : {
          menu: createManagedAudio('light-world-menu', baseUrl, trackOrder, handleTrackError),
          gameplay: createManagedAudio('tongtong-gameplay', baseUrl, trackOrder, handleTrackError)
        };

  function prime() {
    if (!managedByTrack) {
      return;
    }

    if (primed) {
      sync();
      return;
    }

    primed = true;
    sync();
    void unlockInactive(managedByTrack, activeTrack);
  }

  function setTrack(track: MusicTrack) {
    activeTrack = track;
    sync();
  }

  function setVolume(volume: number) {
    musicVolume = clampVolume(volume);
    sync();
  }

  function suspend() {
    if (!managedByTrack) {
      return;
    }

    stopFade();
    for (const managed of Object.values(managedByTrack)) {
      managed.audio.pause();
    }
  }

  function resume() {
    if (!primed) {
      return;
    }

    sync();
  }

  function getDebugState(): MusicDebugState {
    return {
      primed,
      activeTrack,
      selectedFormat: managedByTrack?.menu.currentFormat ?? 'unknown',
      menuSrc: managedByTrack?.menu.audio.currentSrc || managedByTrack?.menu.audio.src || null,
      gameplaySrc: managedByTrack?.gameplay.audio.currentSrc || managedByTrack?.gameplay.audio.src || null,
      menuPaused: managedByTrack?.menu.audio.paused ?? null,
      gameplayPaused: managedByTrack?.gameplay.audio.paused ?? null,
      menuReadyState: managedByTrack?.menu.audio.readyState ?? null,
      gameplayReadyState: managedByTrack?.gameplay.audio.readyState ?? null,
      menuTime: managedByTrack?.menu.audio.currentTime ?? null,
      gameplayTime: managedByTrack?.gameplay.audio.currentTime ?? null,
      menuVolume: managedByTrack?.menu.audio.volume ?? null,
      gameplayVolume: managedByTrack?.gameplay.audio.volume ?? null,
      lastError
    };
  }

  function dispose() {
    if (!managedByTrack) {
      return;
    }

    stopFade();

    for (const managed of Object.values(managedByTrack)) {
      resetManagedSource(managed);
      managed.audio.pause();
      managed.audio.removeAttribute('src');
      managed.audio.load();
    }
  }

  function sync() {
    if (!managedByTrack) {
      return;
    }

    const targetVolume = (musicVolume / 100) * MUSIC_GAIN_MULTIPLIER;

    if (!primed || !activeTrack || targetVolume <= 0) {
      fadeOutAll(managedByTrack.menu.audio, managedByTrack.gameplay.audio);
      return;
    }

    const targetManaged = managedByTrack[activeTrack];
    const targetAudio = targetManaged.audio;
    const otherTrack: TrackKey = activeTrack === 'menu' ? 'gameplay' : 'menu';
    const otherAudio = managedByTrack[otherTrack].audio;

    if (lastStartedTrack !== activeTrack) {
      if (activeTrack === 'gameplay') {
        targetAudio.currentTime = 0;
      }
      lastStartedTrack = activeTrack;
    }

    void safePlay(targetManaged);
    fadePair(targetAudio, targetVolume, otherAudio);
  }

  function handleTrackError(track: TrackKey) {
    if (!managedByTrack) {
      return;
    }

    const managed = managedByTrack[track];
    const fallbackFormat = getFallbackFormat(managed.currentFormat);

    if (!fallbackFormat || managed.triedFormats.has(fallbackFormat)) {
      lastError = `No playable source for ${track}; tried ${Array.from(managed.triedFormats).join(', ')}`;
      return;
    }

    managed.triedFormats.add(fallbackFormat);
    managed.currentFormat = fallbackFormat;
    resetManagedSource(managed);
    void ensureSource(managed, fallbackFormat);

    if (primed && activeTrack === track) {
      void safePlay(managed);
    }
  }

  async function safePlay(managed: ManagedAudio): Promise<void> {
    try {
      await ensureSource(managed);
      const audio = managed.audio;
      if (audio.networkState === audio.NETWORK_EMPTY || !audio.currentSrc) {
        audio.load();
      }
      await audio.play();
      lastError = null;
    } catch (error) {
      lastError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  }

  function fadePair(targetAudio: HTMLAudioElement, targetVolume: number, otherAudio: HTMLAudioElement) {
    stopFade();

    const startTargetVolume = targetAudio.volume;
    const startOtherVolume = otherAudio.volume;
    const steps = Math.max(1, Math.round(FADE_DURATION_MS / FADE_TICK_MS));
    let step = 0;

    fadeInterval = window.setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / steps);

      targetAudio.volume = lerp(startTargetVolume, targetVolume, progress);
      otherAudio.volume = lerp(startOtherVolume, 0, progress);

      if (progress >= 1) {
        stopFade();
        targetAudio.volume = targetVolume;
        otherAudio.volume = 0;
        otherAudio.pause();
      }
    }, FADE_TICK_MS);
  }

  function fadeOutAll(firstAudio: HTMLAudioElement, secondAudio: HTMLAudioElement) {
    stopFade();

    const firstStartVolume = firstAudio.volume;
    const secondStartVolume = secondAudio.volume;
    const steps = Math.max(1, Math.round(FADE_DURATION_MS / FADE_TICK_MS));
    let step = 0;

    fadeInterval = window.setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / steps);

      firstAudio.volume = lerp(firstStartVolume, 0, progress);
      secondAudio.volume = lerp(secondStartVolume, 0, progress);

      if (progress >= 1) {
        stopFade();
        firstAudio.volume = 0;
        secondAudio.volume = 0;
        firstAudio.pause();
        secondAudio.pause();
      }
    }, FADE_TICK_MS);
  }

  function stopFade() {
    if (fadeInterval !== null) {
      window.clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  async function ensureSource(managed: ManagedAudio, preferredFormat?: Format): Promise<void> {
    if (managed.sourceUrl) {
      return;
    }

    if (managed.loadingPromise) {
      return managed.loadingPromise;
    }

    managed.loadingPromise = (async () => {
      const formatsToTry = preferredFormat
        ? [preferredFormat, ...detectFormatOrder().filter((format) => format !== preferredFormat)]
        : detectFormatOrder();

      for (const format of formatsToTry) {
        try {
          const response = await fetch(buildTrackSrc(managed.stem, baseUrl, format));
          if (!response.ok) {
            lastError = `HTTP ${response.status}`;
            continue;
          }

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          resetManagedSource(managed);
          managed.sourceUrl = objectUrl;
          managed.currentFormat = format;
          managed.triedFormats.add(format);
          managed.audio.src = objectUrl;
          managed.audio.load();
          return;
        } catch (error) {
          lastError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        }
      }
    })().finally(() => {
      managed.loadingPromise = null;
    });

    return managed.loadingPromise;
  }

  return { prime, setTrack, setVolume, suspend, resume, getDebugState, dispose };
}

function createManagedAudio(
  stem: string,
  baseUrl: string,
  formatOrder: Format[],
  onError: (track: TrackKey) => void
): ManagedAudio {
  const initialFormat = formatOrder[0]!;
  const trackKey = stem === 'light-world-menu' ? 'menu' : 'gameplay';
  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0;
  audio.addEventListener('error', () => onError(trackKey));

  return {
    audio,
    stem,
    currentFormat: initialFormat,
    triedFormats: new Set(),
    sourceUrl: null,
    loadingPromise: null
  };
}

function buildTrackSrc(stem: string, baseUrl: string, format: Format): string {
  return `${baseUrl}audio/${stem}.${format}`;
}

async function unlockInactive(
  managedByTrack: Record<TrackKey, ManagedAudio>,
  activeTrack: MusicTrack
): Promise<void> {
  for (const [track, managed] of Object.entries(managedByTrack) as Array<[TrackKey, ManagedAudio]>) {
    if (track === activeTrack) {
      continue;
    }

    const audio = managed.audio;
    try {
      if (!managed.sourceUrl) {
        continue;
      }
      audio.muted = true;
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    } catch {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }
  }
}

function resetManagedSource(managed: ManagedAudio) {
  if (managed.sourceUrl) {
    URL.revokeObjectURL(managed.sourceUrl);
    managed.sourceUrl = null;
  }
}

function detectFormatOrder(): Format[] {
  const userAgent = navigator.userAgent.toLowerCase();
  const isFirefox = userAgent.includes('firefox');
  return isFirefox ? ['ogg', 'm4a'] : ['m4a', 'ogg'];
}

function getFallbackFormat(currentFormat: Format | 'unknown'): Format | null {
  if (currentFormat === 'm4a') {
    return 'ogg';
  }

  if (currentFormat === 'ogg') {
    return 'm4a';
  }

  return null;
}

function clampVolume(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}
