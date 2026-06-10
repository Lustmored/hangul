export type SfxEvent =
  | 'start'
  | 'select'
  | 'correct'
  | 'wrong'
  | 'timeout'
  | 'countdown'
  | 'next'
  | 'win'
  | 'perfect'
  | 'gameover';

export interface SfxController {
  play: (event: SfxEvent) => void;
  setVolume: (volume: number) => void;
  suspend: () => void;
  resume: () => void;
}

export function createSfxController(initialVolume: number): SfxController {
  let sfxVolume = clampVolume(initialVolume);
  let audioContext: AudioContext | null = null;

  const play = (event: SfxEvent) => {
    if (sfxVolume <= 0 || typeof window === 'undefined') {
      return;
    }

    const context = getContext();
    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      void context.resume();
    }

    const now = context.currentTime;
    const volumeMultiplier = (0.35 + (sfxVolume / 100) * 1.65) * 1.1;

    switch (event) {
      case 'start':
        sequence(context, now, volumeMultiplier, [
          ['triangle', 440, 0.06, 0.035],
          ['triangle', 660, 0.08, 0.04]
        ]);
        break;
      case 'select':
        tone(context, now, 'square', 320, 0.04, 0.04 * volumeMultiplier, 0.03);
        break;
      case 'correct':
        sequence(context, now, volumeMultiplier, [
          ['triangle', 620, 0.08, 0.045],
          ['triangle', 820, 0.1, 0.05]
        ]);
        break;
      case 'wrong':
        sequence(context, now, volumeMultiplier, [
          ['sawtooth', 260, 0.07, 0.04],
          ['sawtooth', 180, 0.09, 0.05]
        ]);
        break;
      case 'timeout':
        sequence(context, now, volumeMultiplier, [
          ['square', 280, 0.05, 0.03],
          ['square', 220, 0.06, 0.035],
          ['square', 180, 0.08, 0.04]
        ]);
        break;
      case 'countdown':
        sequence(context, now, volumeMultiplier, [
          ['square', 980, 0.035, 0.028],
          ['triangle', 1180, 0.045, 0.022]
        ]);
        break;
      case 'next':
        tone(context, now, 'triangle', 520, 0.05, 0.05 * volumeMultiplier, 0.035);
        break;
      case 'win':
        sequence(context, now, volumeMultiplier, [
          ['triangle', 520, 0.08, 0.04],
          ['triangle', 660, 0.08, 0.045],
          ['triangle', 880, 0.14, 0.05]
        ]);
        break;
      case 'perfect':
        sequence(context, now, volumeMultiplier, [
          ['triangle', 660, 0.08, 0.04],
          ['triangle', 880, 0.08, 0.045],
          ['triangle', 1100, 0.1, 0.05],
          ['sine', 1320, 0.16, 0.06]
        ]);
        break;
      case 'gameover':
        sequence(context, now, volumeMultiplier, [
          ['sawtooth', 240, 0.08, 0.058],
          ['sawtooth', 180, 0.09, 0.064],
          ['sawtooth', 140, 0.11, 0.07]
        ]);
        break;
      default:
        break;
    }
  };

  const setVolume = (nextVolume: number) => {
    sfxVolume = clampVolume(nextVolume);
  };

  const suspend = () => {
    if (audioContext && audioContext.state === 'running') {
      void audioContext.suspend();
    }
  };

  const resume = () => {
    if (audioContext && audioContext.state === 'suspended' && sfxVolume > 0) {
      void audioContext.resume();
    }
  };

  return { play, setVolume, suspend, resume };

  function getContext(): AudioContext | null {
    if (audioContext) {
      return audioContext;
    }

    const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    audioContext = new AudioContextCtor();
    return audioContext;
  }
}

type WaveType = OscillatorType;

function sequence(context: AudioContext, startTime: number, volumeMultiplier: number, notes: Array<[WaveType, number, number, number]>) {
  let cursor = startTime;

  for (const [wave, frequency, duration, volume] of notes) {
    tone(context, cursor, wave, frequency, duration, volume * volumeMultiplier, 0.03);
    cursor += duration;
  }
}

function tone(
  context: AudioContext,
  startTime: number,
  wave: WaveType,
  frequency: number,
  duration: number,
  volume: number,
  release: number
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(Math.min(volume, 0.18), 0.0001), startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + release + 0.01);
}

function clampVolume(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
