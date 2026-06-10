import type { SyllableRomanizationParts } from './types';

const ONSET_KEYS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', 'silent', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'] as const;
const VOWEL_KEYS = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'] as const;
const FINAL_KEYS = ['none', 'g', 'kk', 'gs', 'n', 'nj', 'nh', 'd', 'r', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'] as const;

export interface ParsedSyllable extends SyllableRomanizationParts {
  glyph: string;
}

export function parseHangulSyllable(glyph: string): ParsedSyllable | null {
  const codePoint = glyph.codePointAt(0);
  if (codePoint === undefined || codePoint < 0xac00 || codePoint > 0xd7a3) {
    return null;
  }

  const offset = codePoint - 0xac00;
  const onsetIndex = Math.floor(offset / (21 * 28));
  const vowelIndex = Math.floor((offset % (21 * 28)) / 28);
  const finalIndex = offset % 28;

  return {
    glyph,
    onsetKey: ONSET_KEYS[onsetIndex]!,
    vowelKey: VOWEL_KEYS[vowelIndex]!,
    finalKey: FINAL_KEYS[finalIndex]!
  };
}

export function parseHangulSyllables(text: string): ParsedSyllable[] {
  const syllables: ParsedSyllable[] = [];

  for (const glyph of text) {
    const parsed = parseHangulSyllable(glyph);
    if (!parsed) {
      return [];
    }

    syllables.push(parsed);
  }

  return syllables;
}
