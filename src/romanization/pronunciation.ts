import type { SyllableRomanizationParts } from './types';
import { parseHangulSyllables, type ParsedSyllable } from './hangul';

const ONSET_PRONUNCIATION: Record<string, string> = {
  g: 'g',
  kk: 'kk',
  n: 'n',
  d: 'd',
  tt: 'tt',
  r: 'r',
  m: 'm',
  b: 'b',
  pp: 'pp',
  s: 's',
  ss: 'ss',
  silent: '',
  j: 'j',
  jj: 'jj',
  ch: 'ch',
  k: 'k',
  t: 't',
  p: 'p',
  h: 'h'
};

const VOWEL_PRONUNCIATION: Record<string, string> = {
  a: 'a',
  ae: 'ae',
  ya: 'ya',
  yae: 'yae',
  eo: 'eo',
  e: 'e',
  yeo: 'yeo',
  ye: 'ye',
  o: 'o',
  wa: 'wa',
  wae: 'wae',
  oe: 'oe',
  yo: 'yo',
  u: 'u',
  wo: 'wo',
  we: 'we',
  wi: 'wi',
  yu: 'yu',
  eu: 'eu',
  ui: 'ui',
  i: 'i'
};

const FINAL_PRONUNCIATION: Record<string, string> = {
  none: '',
  g: 'k',
  kk: 'k',
  gs: 'k',
  n: 'n',
  nj: 'n',
  nh: 'n',
  d: 't',
  r: 'l',
  lg: 'k',
  lm: 'm',
  lb: 'l',
  ls: 'l',
  lt: 'l',
  lp: 'p',
  lh: 'l',
  m: 'm',
  b: 'p',
  bs: 'p',
  s: 't',
  ss: 't',
  ng: 'ng',
  j: 't',
  ch: 't',
  k: 'k',
  t: 't',
  p: 'p',
  h: 't'
};

const K_GROUP = new Set(['g', 'kk', 'k', 'gs', 'lg']);
const T_GROUP = new Set(['d', 's', 'ss', 'j', 'ch', 't', 'h', 'nj', 'nh', 'lt', 'lh']);
const P_GROUP = new Set(['b', 'p', 'bs', 'lp']);
const IOTIZED_VOWELS = new Set(['ya', 'yae', 'yeo', 'ye', 'yo', 'yu']);
const WORD_OVERRIDES: Record<string, string> = {
  신라: 'silla'
};

export function romanizePronunciationSyllable({ onsetKey, vowelKey, finalKey }: SyllableRomanizationParts): string {
  return `${ONSET_PRONUNCIATION[onsetKey] ?? ''}${VOWEL_PRONUNCIATION[vowelKey] ?? ''}${FINAL_PRONUNCIATION[finalKey] ?? ''}`;
}

export function romanizePronunciationWord(text: string): string {
  const segments = text.split(/(\s+)/);
  return segments.map((segment) => (/\s+/.test(segment) ? segment : romanizePronunciationSegment(segment))).join('');
}

function romanizePronunciationSegment(segment: string): string {
  if (WORD_OVERRIDES[segment]) {
    return WORD_OVERRIDES[segment];
  }

  const syllables = parseHangulSyllables(segment);
  if (syllables.length === 0) {
    return segment;
  }

  const next = syllables.map((syllable) => ({ ...syllable }));

  applyBoundaryRules(next);

  return next
    .map((syllable, index) => romanizeWordSyllable(syllable, next[index - 1] ?? null))
    .join('');
}

function applyBoundaryRules(syllables: ParsedSyllable[]): void {
  for (let index = 0; index < syllables.length - 1; index += 1) {
    const current = syllables[index]!;
    const next = syllables[index + 1]!;

    if (next.onsetKey === 'silent' && IOTIZED_VOWELS.has(next.vowelKey) && current.finalKey !== 'none') {
      next.onsetKey = current.finalKey === 'r' ? 'r' : 'n';
    }

    if (next.onsetKey === 'silent' && next.vowelKey === 'i') {
      if (current.finalKey === 'd') {
        current.finalKey = 'none';
        next.onsetKey = 'j';
      } else if (T_GROUP.has(current.finalKey)) {
        current.finalKey = 'none';
        next.onsetKey = 'ch';
      }
    }

    if (next.onsetKey === 'h' && next.vowelKey === 'i' && (current.finalKey === 'd' || T_GROUP.has(current.finalKey))) {
      current.finalKey = 'none';
      next.onsetKey = 'ch';
    } else if (next.onsetKey === 'h') {
      if (K_GROUP.has(current.finalKey)) {
        current.finalKey = 'none';
        next.onsetKey = 'k';
      } else if (current.finalKey === 'd') {
        current.finalKey = 'none';
        next.onsetKey = 't';
      } else if (current.finalKey === 'b') {
        current.finalKey = 'none';
        next.onsetKey = 'p';
      } else if (current.finalKey === 'j') {
        current.finalKey = 'none';
        next.onsetKey = 'ch';
      }
    }

    if (current.finalKey === 'h') {
      if (next.onsetKey === 'g') {
        current.finalKey = 'none';
        next.onsetKey = 'k';
      } else if (next.onsetKey === 'd' || next.onsetKey === 't') {
        current.finalKey = 'none';
        next.onsetKey = 't';
      } else if (next.onsetKey === 'b' || next.onsetKey === 'p') {
        current.finalKey = 'none';
        next.onsetKey = 'p';
      } else if (next.onsetKey === 'j') {
        current.finalKey = 'none';
        next.onsetKey = 'ch';
      }
    }

    if (next.onsetKey === 'n' || next.onsetKey === 'm') {
      if (K_GROUP.has(current.finalKey)) {
        current.finalKey = 'ng';
      } else if (T_GROUP.has(current.finalKey)) {
        current.finalKey = 'n';
      } else if (P_GROUP.has(current.finalKey)) {
        current.finalKey = 'm';
      } else if (current.finalKey === 'r' && next.onsetKey === 'n') {
        next.onsetKey = 'r';
      }
    }

    if (next.onsetKey === 'r') {
      if (current.finalKey === 'n' || T_GROUP.has(current.finalKey)) {
        current.finalKey = 'n';
        next.onsetKey = 'n';
      } else if (current.finalKey === 'r') {
        next.onsetKey = 'r';
      } else if (current.finalKey === 'm' || current.finalKey === 'b' || P_GROUP.has(current.finalKey)) {
        current.finalKey = 'm';
        next.onsetKey = 'n';
      } else if (current.finalKey === 'ng' || K_GROUP.has(current.finalKey)) {
        current.finalKey = 'ng';
        next.onsetKey = 'n';
      }
    }

    if (next.onsetKey === 'silent' && current.finalKey !== 'none') {
      const movedOnset = getLiaisonOnset(current.finalKey);
      if (movedOnset) {
        current.finalKey = 'none';
        next.onsetKey = movedOnset;
      }
    }
  }
}

function getLiaisonOnset(finalKey: string): string | null {
  if (finalKey === 'n' || finalKey === 'm' || finalKey === 'ng' || finalKey === 'r') {
    return finalKey;
  }
  if (K_GROUP.has(finalKey)) {
    return 'g';
  }
  if (finalKey === 'd' || finalKey === 't') {
    return 'd';
  }
  if (finalKey === 'b' || finalKey === 'p') {
    return 'b';
  }
  if (finalKey === 's' || finalKey === 'ss') {
    return 's';
  }
  if (finalKey === 'j') {
    return 'j';
  }
  if (finalKey === 'ch') {
    return 'ch';
  }
  if (finalKey === 'h') {
    return 'h';
  }
  if (finalKey === 'nj') {
    return 'j';
  }
  if (finalKey === 'nh') {
    return 'n';
  }
  if (finalKey === 'lg') {
    return 'g';
  }
  if (finalKey === 'lm') {
    return 'm';
  }
  if (finalKey === 'lb') {
    return 'b';
  }
  if (finalKey === 'ls') {
    return 's';
  }
  if (finalKey === 'lt') {
    return 't';
  }
  if (finalKey === 'lp') {
    return 'p';
  }
  if (finalKey === 'lh') {
    return 'h';
  }
  if (finalKey === 'bs') {
    return 's';
  }
  return null;
}

function romanizeWordSyllable(syllable: ParsedSyllable, previous: ParsedSyllable | null): string {
  const onset = romanizeWordOnset(syllable.onsetKey, previous);
  const vowel = VOWEL_PRONUNCIATION[syllable.vowelKey] ?? '';
  const final = FINAL_PRONUNCIATION[syllable.finalKey] ?? '';
  return `${onset}${vowel}${final}`;
}

function romanizeWordOnset(onsetKey: string, previous: ParsedSyllable | null): string {
  if (onsetKey === 'r' && previous?.finalKey === 'r') {
    return 'l';
  }
  return ONSET_PRONUNCIATION[onsetKey] ?? '';
}
