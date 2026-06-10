import type { SyllableRomanizationParts } from './types';

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

// Single-syllable RR approximation using official initial/final tables and
// standard batchim neutralization without cross-syllable assimilation.
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

export function romanizePronunciationSyllable({ onsetKey, vowelKey, finalKey }: SyllableRomanizationParts): string {
  return `${ONSET_PRONUNCIATION[onsetKey] ?? ''}${VOWEL_PRONUNCIATION[vowelKey] ?? ''}${FINAL_PRONUNCIATION[finalKey] ?? ''}`;
}
