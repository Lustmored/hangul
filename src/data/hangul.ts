import { ROMANIZATION_PRESETS, romanize, type RomanizationMode, type RomanizationPreset } from '../romanization';
export { ROMANIZATION_PRESETS };
export type { RomanizationMode, RomanizationPreset } from '../romanization';

export type QuestionMode = 'hangul-to-latin' | 'latin-to-hangul';
export type DifficultyId = 'training' | 'easy' | 'normal' | 'hard' | 'asian';

export interface DifficultyPreset {
  id: DifficultyId;
  label: string;
  seconds: number | null;
  lives: number | null;
  trackScore: boolean;
}

export interface QuizItem {
  id: string;
  key: string;
  glyph: string;
  romanizations: Record<RomanizationMode, string>;
  type: 'jamo' | 'syllable';
  difficultyBucket: number;
  enabledQuestionModes: QuestionMode[];
  confusableWith: string[];
  tags: string[];
  families: string[];
  components: {
    onsetKey: string | null;
    vowelKey: string | null;
    finalKey: string | null;
  };
  componentConfusables: {
    onset: string[];
    vowel: string[];
    final: string[];
  };
}

interface OnsetDef {
  glyph: string;
  romanization: string;
  key: string;
  simple: boolean;
  confusable: string[];
  family: string;
}

interface VowelDef {
  glyph: string;
  romanization: string;
  key: string;
  simple: boolean;
  compound: boolean;
  confusable: string[];
  family: string;
}

interface FinalDef {
  glyph: string;
  romanization: string;
  key: string;
  simple: boolean;
  cluster: boolean;
  confusable: string[];
  family: string;
}

export const APP_NAME = 'Hangul Rush';

export const DIFFICULTY_PRESETS: DifficultyPreset[] = [
  { id: 'training', label: 'Training', seconds: null, lives: null, trackScore: false },
  { id: 'easy', label: 'Easy', seconds: 10, lives: 5, trackScore: true },
  { id: 'normal', label: 'Normal', seconds: 7, lives: 3, trackScore: true },
  { id: 'hard', label: 'Hard', seconds: 5, lives: 2, trackScore: true },
  { id: 'asian', label: 'Asian', seconds: 3, lives: 1, trackScore: true }
];

export const RANKED_DIFFICULTY_PRESETS = DIFFICULTY_PRESETS.filter((preset) => preset.trackScore);

const ONSETS: OnsetDef[] = [
  { glyph: 'ㄱ', romanization: 'g', key: 'g', simple: true, confusable: ['k', 'kk'], family: 'velar-stop' },
  { glyph: 'ㄲ', romanization: 'kk', key: 'kk', simple: false, confusable: ['g', 'k'], family: 'velar-stop' },
  { glyph: 'ㄴ', romanization: 'n', key: 'n', simple: true, confusable: ['r'], family: 'alveolar-sonorant' },
  { glyph: 'ㄷ', romanization: 'd', key: 'd', simple: true, confusable: ['t', 'tt'], family: 'alveolar-stop' },
  { glyph: 'ㄸ', romanization: 'tt', key: 'tt', simple: false, confusable: ['d', 't'], family: 'alveolar-stop' },
  { glyph: 'ㄹ', romanization: 'r', key: 'r', simple: true, confusable: ['n'], family: 'alveolar-sonorant' },
  { glyph: 'ㅁ', romanization: 'm', key: 'm', simple: true, confusable: ['b', 'p'], family: 'bilabial-sonorant' },
  { glyph: 'ㅂ', romanization: 'b', key: 'b', simple: true, confusable: ['p', 'pp', 'm'], family: 'bilabial-stop' },
  { glyph: 'ㅃ', romanization: 'pp', key: 'pp', simple: false, confusable: ['b', 'p'], family: 'bilabial-stop' },
  { glyph: 'ㅅ', romanization: 's', key: 's', simple: true, confusable: ['ss', 't', 'j'], family: 'alveolar-sibilant' },
  { glyph: 'ㅆ', romanization: 'ss', key: 'ss', simple: false, confusable: ['s', 'tt'], family: 'alveolar-sibilant' },
  { glyph: 'ㅇ', romanization: '', key: 'silent', simple: true, confusable: ['ng', 'h'], family: 'null-onset' },
  { glyph: 'ㅈ', romanization: 'j', key: 'j', simple: true, confusable: ['ch', 'jj', 's'], family: 'alveolo-palatal-affricate' },
  { glyph: 'ㅉ', romanization: 'jj', key: 'jj', simple: false, confusable: ['j', 'ch'], family: 'alveolo-palatal-affricate' },
  { glyph: 'ㅊ', romanization: 'ch', key: 'ch', simple: true, confusable: ['j', 'jj'], family: 'alveolo-palatal-affricate' },
  { glyph: 'ㅋ', romanization: 'k', key: 'k', simple: true, confusable: ['g', 'kk'], family: 'velar-stop' },
  { glyph: 'ㅌ', romanization: 't', key: 't', simple: true, confusable: ['d', 'tt', 's'], family: 'alveolar-stop' },
  { glyph: 'ㅍ', romanization: 'p', key: 'p', simple: true, confusable: ['b', 'pp', 'm'], family: 'bilabial-stop' },
  { glyph: 'ㅎ', romanization: 'h', key: 'h', simple: true, confusable: ['silent'], family: 'glottal-fricative' }
];

const VOWELS: VowelDef[] = [
  { glyph: 'ㅏ', romanization: 'a', key: 'a', simple: true, compound: false, confusable: ['ya', 'ae'], family: 'a-series' },
  { glyph: 'ㅐ', romanization: 'ae', key: 'ae', simple: false, compound: true, confusable: ['e', 'a', 'yae'], family: 'front-mid-series' },
  { glyph: 'ㅑ', romanization: 'ya', key: 'ya', simple: false, compound: false, confusable: ['a', 'yae'], family: 'a-series' },
  { glyph: 'ㅒ', romanization: 'yae', key: 'yae', simple: false, compound: true, confusable: ['ye', 'ae', 'ya'], family: 'front-mid-series' },
  { glyph: 'ㅓ', romanization: 'eo', key: 'eo', simple: true, compound: false, confusable: ['yeo', 'eu', 'e'], family: 'eo-series' },
  { glyph: 'ㅔ', romanization: 'e', key: 'e', simple: false, compound: true, confusable: ['ae', 'eo', 'ye'], family: 'front-mid-series' },
  { glyph: 'ㅕ', romanization: 'yeo', key: 'yeo', simple: false, compound: false, confusable: ['eo', 'ye', 'yu'], family: 'eo-series' },
  { glyph: 'ㅖ', romanization: 'ye', key: 'ye', simple: false, compound: true, confusable: ['yae', 'e', 'yeo'], family: 'front-mid-series' },
  { glyph: 'ㅗ', romanization: 'o', key: 'o', simple: true, compound: false, confusable: ['yo', 'u', 'oe'], family: 'o-series' },
  { glyph: 'ㅘ', romanization: 'wa', key: 'wa', simple: false, compound: true, confusable: ['wo', 'wae', 'o'], family: 'wa-series' },
  { glyph: 'ㅙ', romanization: 'wae', key: 'wae', simple: false, compound: true, confusable: ['oe', 'we', 'wa'], family: 'wa-series' },
  { glyph: 'ㅚ', romanization: 'oe', key: 'oe', simple: false, compound: true, confusable: ['wae', 'we', 'o'], family: 'front-rounded-series' },
  { glyph: 'ㅛ', romanization: 'yo', key: 'yo', simple: false, compound: false, confusable: ['o', 'yu'], family: 'o-series' },
  { glyph: 'ㅜ', romanization: 'u', key: 'u', simple: true, compound: false, confusable: ['yu', 'o', 'eu'], family: 'u-series' },
  { glyph: 'ㅝ', romanization: 'wo', key: 'wo', simple: false, compound: true, confusable: ['wa', 'we', 'u'], family: 'wo-series' },
  { glyph: 'ㅞ', romanization: 'we', key: 'we', simple: false, compound: true, confusable: ['wae', 'oe', 'wo'], family: 'front-rounded-series' },
  { glyph: 'ㅟ', romanization: 'wi', key: 'wi', simple: false, compound: true, confusable: ['ui', 'we', 'i'], family: 'front-rounded-series' },
  { glyph: 'ㅠ', romanization: 'yu', key: 'yu', simple: false, compound: false, confusable: ['u', 'yo', 'yeo'], family: 'u-series' },
  { glyph: 'ㅡ', romanization: 'eu', key: 'eu', simple: true, compound: false, confusable: ['ui', 'eo', 'u'], family: 'eu-series' },
  { glyph: 'ㅢ', romanization: 'ui', key: 'ui', simple: false, compound: true, confusable: ['eu', 'wi', 'i'], family: 'eu-series' },
  { glyph: 'ㅣ', romanization: 'i', key: 'i', simple: true, compound: false, confusable: ['wi', 'ui'], family: 'i-series' }
];

const FINALS: FinalDef[] = [
  { glyph: '', romanization: '', key: 'none', simple: true, cluster: false, confusable: ['ng', 'n'], family: 'open' },
  { glyph: 'ㄱ', romanization: 'k', key: 'g', simple: true, cluster: false, confusable: ['kk', 'k'], family: 'k-coda' },
  { glyph: 'ㄲ', romanization: 'k', key: 'kk', simple: false, cluster: false, confusable: ['g', 'k'], family: 'k-coda' },
  { glyph: 'ㄳ', romanization: 'ks', key: 'gs', simple: false, cluster: true, confusable: ['g', 's'], family: 'k-cluster-coda' },
  { glyph: 'ㄴ', romanization: 'n', key: 'n', simple: true, cluster: false, confusable: ['none', 'ng', 'nj', 'nh'], family: 'n-coda' },
  { glyph: 'ㄵ', romanization: 'nj', key: 'nj', simple: false, cluster: true, confusable: ['n', 'j'], family: 'n-cluster-coda' },
  { glyph: 'ㄶ', romanization: 'nh', key: 'nh', simple: false, cluster: true, confusable: ['n', 'h'], family: 'n-cluster-coda' },
  { glyph: 'ㄷ', romanization: 't', key: 'd', simple: true, cluster: false, confusable: ['s', 'ss', 'j', 'ch', 't', 'h'], family: 't-coda' },
  { glyph: 'ㄹ', romanization: 'l', key: 'r', simple: true, cluster: false, confusable: ['n', 'm', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh'], family: 'l-coda' },
  { glyph: 'ㄺ', romanization: 'lk', key: 'lg', simple: false, cluster: true, confusable: ['r', 'g', 'k'], family: 'l-cluster-coda' },
  { glyph: 'ㄻ', romanization: 'lm', key: 'lm', simple: false, cluster: true, confusable: ['r', 'm'], family: 'l-cluster-coda' },
  { glyph: 'ㄼ', romanization: 'lb', key: 'lb', simple: false, cluster: true, confusable: ['r', 'b', 'p'], family: 'l-cluster-coda' },
  { glyph: 'ㄽ', romanization: 'ls', key: 'ls', simple: false, cluster: true, confusable: ['r', 's'], family: 'l-cluster-coda' },
  { glyph: 'ㄾ', romanization: 'lt', key: 'lt', simple: false, cluster: true, confusable: ['r', 't'], family: 'l-cluster-coda' },
  { glyph: 'ㄿ', romanization: 'lp', key: 'lp', simple: false, cluster: true, confusable: ['r', 'p'], family: 'l-cluster-coda' },
  { glyph: 'ㅀ', romanization: 'lh', key: 'lh', simple: false, cluster: true, confusable: ['r', 'h'], family: 'l-cluster-coda' },
  { glyph: 'ㅁ', romanization: 'm', key: 'm', simple: true, cluster: false, confusable: ['r', 'b', 'p'], family: 'm-coda' },
  { glyph: 'ㅂ', romanization: 'p', key: 'b', simple: true, cluster: false, confusable: ['p', 'bs', 'm'], family: 'p-coda' },
  { glyph: 'ㅄ', romanization: 'ps', key: 'bs', simple: false, cluster: true, confusable: ['b', 's'], family: 'p-cluster-coda' },
  { glyph: 'ㅅ', romanization: 't', key: 's', simple: true, cluster: false, confusable: ['d', 'ss', 'j', 'ch', 't'], family: 't-coda' },
  { glyph: 'ㅆ', romanization: 't', key: 'ss', simple: false, cluster: false, confusable: ['s', 'd', 't'], family: 't-coda' },
  { glyph: 'ㅇ', romanization: 'ng', key: 'ng', simple: true, cluster: false, confusable: ['n', 'none'], family: 'ng-coda' },
  { glyph: 'ㅈ', romanization: 't', key: 'j', simple: true, cluster: false, confusable: ['s', 'ch', 'd', 't'], family: 't-coda' },
  { glyph: 'ㅊ', romanization: 't', key: 'ch', simple: true, cluster: false, confusable: ['j', 's', 'd', 't'], family: 't-coda' },
  { glyph: 'ㅋ', romanization: 'k', key: 'k', simple: true, cluster: false, confusable: ['g', 'kk'], family: 'k-coda' },
  { glyph: 'ㅌ', romanization: 't', key: 't', simple: true, cluster: false, confusable: ['d', 's', 'j', 'ch'], family: 't-coda' },
  { glyph: 'ㅍ', romanization: 'p', key: 'p', simple: true, cluster: false, confusable: ['b', 'm'], family: 'p-coda' },
  { glyph: 'ㅎ', romanization: 'h', key: 'h', simple: true, cluster: false, confusable: ['d', 's', 'j', 'ch'], family: 't-coda' }
];

const BASIC_JAMO_KEYS = new Set(['g', 'n', 'd', 'r', 'm', 'b', 's', 'silent', 'j', 'ch', 'k', 't', 'p', 'h', 'a', 'eo', 'o', 'u', 'eu', 'i']);
const HIGH_CONFUSION_KEYS = new Set(['ae', 'e', 'yae', 'ye', 'oe', 'wae', 'we', 'g', 'k', 'd', 't', 'b', 'p', 's', 'ss', 'j', 'ch', 'jj', 'r', 'n']);
const HIGH_CONFUSION_VOWELS = new Set(['ae', 'e', 'yae', 'ye', 'oe', 'wae', 'we', 'ui', 'wi']);
const SIMPLE_FINAL_KEYS = new Set(['g', 'n', 'd', 'r', 'm', 'b', 'ng']);
const COMPLEX_FINAL_KEYS = new Set(['gs', 'nj', 'nh', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'bs']);

export const HANGUL_ITEMS: QuizItem[] = createHangulItems();

export function getDifficultyPresetById(id: DifficultyId): DifficultyPreset {
  return DIFFICULTY_PRESETS.find((preset) => preset.id === id) ?? DIFFICULTY_PRESETS[2]!;
}

export function getRomanizationPresetById(id: RomanizationMode): RomanizationPreset {
  return ROMANIZATION_PRESETS.find((preset) => preset.id === id) ?? ROMANIZATION_PRESETS[0]!;
}

export function getRomanization(item: QuizItem, mode: RomanizationMode): string {
  return item.romanizations[mode];
}

function createHangulItems(): QuizItem[] {
  const jamoItems = [...ONSETS, ...VOWELS].map((entry) => createJamoItem(entry));
  const syllableItems: QuizItem[] = [];

  for (let onsetIndex = 0; onsetIndex < ONSETS.length; onsetIndex += 1) {
    for (let vowelIndex = 0; vowelIndex < VOWELS.length; vowelIndex += 1) {
      for (let finalIndex = 0; finalIndex < FINALS.length; finalIndex += 1) {
        const onset = ONSETS[onsetIndex]!;
        const vowel = VOWELS[vowelIndex]!;
        const final = FINALS[finalIndex]!;
        const glyph = String.fromCharCode(0xac00 + onsetIndex * 21 * 28 + vowelIndex * 28 + finalIndex);
        syllableItems.push(createSyllableItem(onset, vowel, final, onsetIndex, vowelIndex, finalIndex, glyph));
      }
    }
  }

  return [...jamoItems, ...syllableItems];
}

function createJamoItem(entry: OnsetDef | VowelDef): QuizItem {
  const isVowel = 'compound' in entry;
  const isBasic = BASIC_JAMO_KEYS.has(entry.key);
  const isHighConfusion = HIGH_CONFUSION_KEYS.has(entry.key);

  return {
    id: `jamo-${entry.glyph}`,
    key: entry.key,
    glyph: entry.glyph,
    romanizations: {
      spelling: entry.romanization === '' ? '(silent)' : entry.romanization,
      pronunciation: entry.romanization === '' ? '(silent)' : entry.romanization
    },
    type: 'jamo',
    difficultyBucket: isHighConfusion ? 8 : isBasic ? 1 : 2,
    enabledQuestionModes: ['hangul-to-latin', 'latin-to-hangul'],
    confusableWith: unique(entry.confusable),
    tags: [entry.key, isBasic ? 'basic' : 'derived', isHighConfusion ? 'challenge' : '', isVowel ? 'vowel' : 'consonant'].filter(Boolean),
    families: [entry.family, isVowel ? 'vowel' : 'consonant'],
    components: {
      onsetKey: isVowel ? null : entry.key,
      vowelKey: isVowel ? entry.key : null,
      finalKey: null
    },
    componentConfusables: {
      onset: isVowel ? [] : unique(entry.confusable),
      vowel: isVowel ? unique(entry.confusable) : [],
      final: []
    }
  };
}

function createSyllableItem(
  onset: OnsetDef,
  vowel: VowelDef,
  final: FinalDef,
  onsetIndex: number,
  vowelIndex: number,
  finalIndex: number,
  glyph: string
): QuizItem {
  const romanizations = {
    spelling: romanize({ onsetKey: onset.key, vowelKey: vowel.key, finalKey: final.key }, 'spelling'),
    pronunciation: romanize({ onsetKey: onset.key, vowelKey: vowel.key, finalKey: final.key }, 'pronunciation')
  } satisfies Record<RomanizationMode, string>;
  const hasFinal = finalIndex !== 0;
  const isHardOnset = !onset.simple;
  const isHardVowel = !vowel.simple || vowel.compound;
  const isHighConfusion = HIGH_CONFUSION_KEYS.has(onset.key) || HIGH_CONFUSION_VOWELS.has(vowel.key) || (!final.simple && hasFinal);

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
    key: `${onset.key}-${vowel.key}-${final.key}`,
    glyph,
    romanizations,
    type: 'syllable',
    difficultyBucket,
    enabledQuestionModes: ['hangul-to-latin', 'latin-to-hangul'],
    confusableWith: unique([...onset.confusable, ...vowel.confusable, ...final.confusable]),
    tags: [onset.key, vowel.key, final.key, hasFinal ? 'closed' : 'open', isHighConfusion ? 'challenge' : ''].filter(Boolean),
    families: [onset.family, vowel.family, final.family, hasFinal ? 'closed' : 'open'],
    components: {
      onsetKey: onset.key,
      vowelKey: vowel.key,
      finalKey: final.key
    },
    componentConfusables: {
      onset: unique(onset.confusable),
      vowel: unique(vowel.confusable),
      final: unique(final.confusable)
    }
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
