import type { SyllableRomanizationParts } from './types';
import { parseHangulSyllables } from './hangul';

const ONSET_SPELLING: Record<string, string> = {
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

const VOWEL_SPELLING: Record<string, string> = {
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

const FINAL_SPELLING: Record<string, string> = {
  none: '',
  g: 'g',
  kk: 'kk',
  gs: 'gs',
  n: 'n',
  nj: 'nj',
  nh: 'nh',
  d: 'd',
  r: 'l',
  lg: 'lg',
  lm: 'lm',
  lb: 'lb',
  ls: 'ls',
  lt: 'lt',
  lp: 'lp',
  lh: 'lh',
  m: 'm',
  b: 'b',
  bs: 'bs',
  s: 's',
  ss: 'ss',
  ng: 'ng',
  j: 'j',
  ch: 'ch',
  k: 'k',
  t: 't',
  p: 'p',
  h: 'h'
};

export function romanizeSpellingSyllable({ onsetKey, vowelKey, finalKey }: SyllableRomanizationParts): string {
  return `${ONSET_SPELLING[onsetKey] ?? ''}${VOWEL_SPELLING[vowelKey] ?? ''}${FINAL_SPELLING[finalKey] ?? ''}`;
}

export function romanizeSpellingWord(text: string): string {
  const segments = text.split(/(\s+)/);
  return segments.map((segment) => {
    if (/\s+/.test(segment)) {
      return segment;
    }

    const syllables = parseHangulSyllables(segment);
    if (syllables.length === 0) {
      return segment;
    }

    return syllables.map(romanizeSpellingSyllable).join('');
  }).join('');
}
