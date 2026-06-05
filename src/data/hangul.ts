export type QuestionMode = 'hangul-to-latin' | 'latin-to-hangul';
export type TimerPresetId = 'blitz' | 'quick' | 'normal' | 'relaxed' | 'none';

export interface TimerPreset {
  id: TimerPresetId;
  label: string;
  seconds: number | null;
}

export interface QuizItem {
  id: string;
  glyph: string;
  romanization: string;
  type: 'jamo' | 'syllable';
  difficultyBucket: number;
  enabledQuestionModes: QuestionMode[];
  confusableWith: string[];
  tags: string[];
}

interface OnsetDef {
  glyph: string;
  romanization: string;
  key: string;
  simple: boolean;
  confusable: string[];
}

interface VowelDef {
  glyph: string;
  romanization: string;
  key: string;
  simple: boolean;
  compound: boolean;
  confusable: string[];
}

interface FinalDef {
  glyph: string;
  romanization: string;
  key: string;
  simple: boolean;
  cluster: boolean;
}

export const APP_NAME = 'Hangul Rush';

export const TIMER_PRESETS: TimerPreset[] = [
  { id: 'blitz', label: 'Blitz (3s)', seconds: 3 },
  { id: 'quick', label: 'Quick (5s)', seconds: 5 },
  { id: 'normal', label: 'Normal (7s)', seconds: 7 },
  { id: 'relaxed', label: 'Relaxed (10s)', seconds: 10 },
  { id: 'none', label: 'No Timer', seconds: null }
];

const ONSETS: OnsetDef[] = [
  { glyph: 'ㄱ', romanization: 'g', key: 'g', simple: true, confusable: ['k', 'kk'] },
  { glyph: 'ㄲ', romanization: 'kk', key: 'kk', simple: false, confusable: ['g', 'k'] },
  { glyph: 'ㄴ', romanization: 'n', key: 'n', simple: true, confusable: [] },
  { glyph: 'ㄷ', romanization: 'd', key: 'd', simple: true, confusable: ['t', 'tt'] },
  { glyph: 'ㄸ', romanization: 'tt', key: 'tt', simple: false, confusable: ['d', 't'] },
  { glyph: 'ㄹ', romanization: 'r', key: 'r', simple: true, confusable: ['l'] },
  { glyph: 'ㅁ', romanization: 'm', key: 'm', simple: true, confusable: [] },
  { glyph: 'ㅂ', romanization: 'b', key: 'b', simple: true, confusable: ['p', 'pp'] },
  { glyph: 'ㅃ', romanization: 'pp', key: 'pp', simple: false, confusable: ['b', 'p'] },
  { glyph: 'ㅅ', romanization: 's', key: 's', simple: true, confusable: ['ss'] },
  { glyph: 'ㅆ', romanization: 'ss', key: 'ss', simple: false, confusable: ['s'] },
  { glyph: 'ㅇ', romanization: '', key: 'silent', simple: true, confusable: ['ng'] },
  { glyph: 'ㅈ', romanization: 'j', key: 'j', simple: true, confusable: ['ch', 'jj'] },
  { glyph: 'ㅉ', romanization: 'jj', key: 'jj', simple: false, confusable: ['j', 'ch'] },
  { glyph: 'ㅊ', romanization: 'ch', key: 'ch', simple: true, confusable: ['j', 'jj'] },
  { glyph: 'ㅋ', romanization: 'k', key: 'k', simple: true, confusable: ['g', 'kk'] },
  { glyph: 'ㅌ', romanization: 't', key: 't', simple: true, confusable: ['d', 'tt'] },
  { glyph: 'ㅍ', romanization: 'p', key: 'p', simple: true, confusable: ['b', 'pp'] },
  { glyph: 'ㅎ', romanization: 'h', key: 'h', simple: true, confusable: [] }
];

const VOWELS: VowelDef[] = [
  { glyph: 'ㅏ', romanization: 'a', key: 'a', simple: true, compound: false, confusable: ['ya'] },
  { glyph: 'ㅐ', romanization: 'ae', key: 'ae', simple: false, compound: true, confusable: ['e'] },
  { glyph: 'ㅑ', romanization: 'ya', key: 'ya', simple: false, compound: false, confusable: ['a'] },
  { glyph: 'ㅒ', romanization: 'yae', key: 'yae', simple: false, compound: true, confusable: ['ye'] },
  { glyph: 'ㅓ', romanization: 'eo', key: 'eo', simple: true, compound: false, confusable: ['yeo'] },
  { glyph: 'ㅔ', romanization: 'e', key: 'e', simple: false, compound: true, confusable: ['ae'] },
  { glyph: 'ㅕ', romanization: 'yeo', key: 'yeo', simple: false, compound: false, confusable: ['eo'] },
  { glyph: 'ㅖ', romanization: 'ye', key: 'ye', simple: false, compound: true, confusable: ['yae'] },
  { glyph: 'ㅗ', romanization: 'o', key: 'o', simple: true, compound: false, confusable: ['yo'] },
  { glyph: 'ㅘ', romanization: 'wa', key: 'wa', simple: false, compound: true, confusable: ['wo'] },
  { glyph: 'ㅙ', romanization: 'wae', key: 'wae', simple: false, compound: true, confusable: ['oe', 'we'] },
  { glyph: 'ㅚ', romanization: 'oe', key: 'oe', simple: false, compound: true, confusable: ['wae', 'we'] },
  { glyph: 'ㅛ', romanization: 'yo', key: 'yo', simple: false, compound: false, confusable: ['o'] },
  { glyph: 'ㅜ', romanization: 'u', key: 'u', simple: true, compound: false, confusable: ['yu'] },
  { glyph: 'ㅝ', romanization: 'wo', key: 'wo', simple: false, compound: true, confusable: ['wa'] },
  { glyph: 'ㅞ', romanization: 'we', key: 'we', simple: false, compound: true, confusable: ['wae', 'oe'] },
  { glyph: 'ㅟ', romanization: 'wi', key: 'wi', simple: false, compound: true, confusable: ['ui'] },
  { glyph: 'ㅠ', romanization: 'yu', key: 'yu', simple: false, compound: false, confusable: ['u'] },
  { glyph: 'ㅡ', romanization: 'eu', key: 'eu', simple: true, compound: false, confusable: ['ui'] },
  { glyph: 'ㅢ', romanization: 'ui', key: 'ui', simple: false, compound: true, confusable: ['eu', 'wi'] },
  { glyph: 'ㅣ', romanization: 'i', key: 'i', simple: true, compound: false, confusable: [] }
];

const FINALS: FinalDef[] = [
  { glyph: '', romanization: '', key: 'none', simple: true, cluster: false },
  { glyph: 'ㄱ', romanization: 'k', key: 'g', simple: true, cluster: false },
  { glyph: 'ㄲ', romanization: 'k', key: 'kk', simple: false, cluster: false },
  { glyph: 'ㄳ', romanization: 'ks', key: 'gs', simple: false, cluster: true },
  { glyph: 'ㄴ', romanization: 'n', key: 'n', simple: true, cluster: false },
  { glyph: 'ㄵ', romanization: 'nj', key: 'nj', simple: false, cluster: true },
  { glyph: 'ㄶ', romanization: 'nh', key: 'nh', simple: false, cluster: true },
  { glyph: 'ㄷ', romanization: 't', key: 'd', simple: true, cluster: false },
  { glyph: 'ㄹ', romanization: 'l', key: 'r', simple: true, cluster: false },
  { glyph: 'ㄺ', romanization: 'lk', key: 'lg', simple: false, cluster: true },
  { glyph: 'ㄻ', romanization: 'lm', key: 'lm', simple: false, cluster: true },
  { glyph: 'ㄼ', romanization: 'lb', key: 'lb', simple: false, cluster: true },
  { glyph: 'ㄽ', romanization: 'ls', key: 'ls', simple: false, cluster: true },
  { glyph: 'ㄾ', romanization: 'lt', key: 'lt', simple: false, cluster: true },
  { glyph: 'ㄿ', romanization: 'lp', key: 'lp', simple: false, cluster: true },
  { glyph: 'ㅀ', romanization: 'lh', key: 'lh', simple: false, cluster: true },
  { glyph: 'ㅁ', romanization: 'm', key: 'm', simple: true, cluster: false },
  { glyph: 'ㅂ', romanization: 'p', key: 'b', simple: true, cluster: false },
  { glyph: 'ㅄ', romanization: 'ps', key: 'bs', simple: false, cluster: true },
  { glyph: 'ㅅ', romanization: 't', key: 's', simple: true, cluster: false },
  { glyph: 'ㅆ', romanization: 't', key: 'ss', simple: false, cluster: false },
  { glyph: 'ㅇ', romanization: 'ng', key: 'ng', simple: true, cluster: false },
  { glyph: 'ㅈ', romanization: 't', key: 'j', simple: true, cluster: false },
  { glyph: 'ㅊ', romanization: 't', key: 'ch', simple: true, cluster: false },
  { glyph: 'ㅋ', romanization: 'k', key: 'k', simple: true, cluster: false },
  { glyph: 'ㅌ', romanization: 't', key: 't', simple: true, cluster: false },
  { glyph: 'ㅍ', romanization: 'p', key: 'p', simple: true, cluster: false },
  { glyph: 'ㅎ', romanization: 'h', key: 'h', simple: true, cluster: false }
];

const BASIC_JAMO_KEYS = new Set(['g', 'n', 'd', 'r', 'm', 'b', 's', 'silent', 'j', 'ch', 'k', 't', 'p', 'h', 'a', 'eo', 'o', 'u', 'eu', 'i']);
const HIGH_CONFUSION_KEYS = new Set(['ae', 'e', 'yae', 'ye', 'oe', 'wae', 'we', 'g', 'k', 'd', 't', 'b', 'p', 's', 'ss', 'j', 'ch', 'jj']);
const HIGH_CONFUSION_VOWELS = new Set(['ae', 'e', 'yae', 'ye', 'oe', 'wae', 'we']);
const SIMPLE_FINAL_KEYS = new Set(['g', 'n', 'd', 'r', 'm', 'b', 'ng']);
const COMPLEX_FINAL_KEYS = new Set(['gs', 'nj', 'nh', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'bs']);

export const HANGUL_ITEMS: QuizItem[] = createHangulItems();

export function getTimerPresetById(id: TimerPresetId): TimerPreset {
  return TIMER_PRESETS.find((preset) => preset.id === id) ?? TIMER_PRESETS[3]!;
}

function createHangulItems(): QuizItem[] {
  const jamoItems = [...ONSETS, ...VOWELS].map((entry) => createJamoItem(entry));
  const syllableItems: QuizItem[] = [];

  for (let onsetIndex = 0; onsetIndex < ONSETS.length; onsetIndex += 1) {
    for (let vowelIndex = 0; vowelIndex < VOWELS.length; vowelIndex += 1) {
      for (let finalIndex = 0; finalIndex < FINALS.length; finalIndex += 1) {
        const glyph = String.fromCharCode(0xac00 + onsetIndex * 21 * 28 + vowelIndex * 28 + finalIndex);
        syllableItems.push(createSyllableItem(ONSETS[onsetIndex]!, VOWELS[vowelIndex]!, FINALS[finalIndex]!, onsetIndex, vowelIndex, finalIndex, glyph));
      }
    }
  }

  return [...jamoItems, ...syllableItems];
}

function createJamoItem(entry: OnsetDef | VowelDef): QuizItem {
  const isBasic = BASIC_JAMO_KEYS.has(entry.key);
  const isHighConfusion = HIGH_CONFUSION_KEYS.has(entry.key);

  return {
    id: `jamo-${entry.glyph}`,
    glyph: entry.glyph,
    romanization: entry.romanization === '' ? '(silent)' : entry.romanization,
    type: 'jamo',
    difficultyBucket: isHighConfusion ? 8 : isBasic ? 1 : 2,
    enabledQuestionModes: ['hangul-to-latin', 'latin-to-hangul'],
    confusableWith: entry.confusable,
    tags: [entry.key, isBasic ? 'basic' : 'derived', isHighConfusion ? 'challenge' : ''].filter(Boolean)
  };
}

function createSyllableItem(onset: OnsetDef, vowel: VowelDef, final: FinalDef, onsetIndex: number, vowelIndex: number, finalIndex: number, glyph: string): QuizItem {
  const romanization = `${onset.romanization}${vowel.romanization}${final.romanization}`;
  const hasFinal = finalIndex !== 0;
  const isHardOnset = !onset.simple;
  const isHardVowel = !vowel.simple || vowel.compound;
  const isHighConfusion = HIGH_CONFUSION_KEYS.has(onset.key) || HIGH_CONFUSION_VOWELS.has(vowel.key);

  let difficultyBucket = 3;
  if (!hasFinal) {
    difficultyBucket = isHardOnset || isHardVowel ? 4 : 3;
  } else if (COMPLEX_FINAL_KEYS.has(final.key)) {
    difficultyBucket = 7;
  } else if (SIMPLE_FINAL_KEYS.has(final.key) && !isHardOnset && !isHardVowel) {
    difficultyBucket = 5;
  } else {
    difficultyBucket = 6;
  }

  if (isHighConfusion) {
    difficultyBucket = Math.max(difficultyBucket, 8);
  }

  return {
    id: `syllable-${onsetIndex}-${vowelIndex}-${finalIndex}`,
    glyph,
    romanization,
    type: 'syllable',
    difficultyBucket,
    enabledQuestionModes: ['hangul-to-latin', 'latin-to-hangul'],
    confusableWith: [...onset.confusable, ...vowel.confusable],
    tags: [onset.key, vowel.key, final.key, hasFinal ? 'closed' : 'open', isHighConfusion ? 'challenge' : ''].filter(Boolean)
  };
}
