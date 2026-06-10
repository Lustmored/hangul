import { parseHangulSyllable } from './hangul';
import { romanizePronunciationSyllable, romanizePronunciationWord } from './pronunciation';
import { romanizeSpellingSyllable, romanizeSpellingWord } from './spelling';
import type { RomanizationMode, RomanizationPreset, SyllableRomanizationParts } from './types';

export type { RomanizationMode, RomanizationPreset, SyllableRomanizationParts } from './types';

export const ROMANIZATION_PRESETS: RomanizationPreset[] = [
  { id: 'spelling', label: 'Spelling', hint: 'Follows the written block.', examples: ['값 -> gabs', '읽 -> ilg'] },
  { id: 'pronunciation', label: 'Pronunciation', hint: 'Follows how it sounds.', examples: ['값 -> gap', '읽 -> ik'] }
];

function romanizeSyllable(parts: SyllableRomanizationParts, mode: RomanizationMode): string {
  return mode === 'pronunciation' ? romanizePronunciationSyllable(parts) : romanizeSpellingSyllable(parts);
}

function romanizeWord(text: string, mode: RomanizationMode): string {
  return mode === 'pronunciation' ? romanizePronunciationWord(text) : romanizeSpellingWord(text);
}

export function romanize(input: string | SyllableRomanizationParts, mode: RomanizationMode): string {
  if (typeof input !== 'string') {
    return romanizeSyllable(input, mode);
  }

  const parsed = parseHangulSyllable(input);
  if (parsed && [...input].length === 1) {
    return romanizeSyllable(parsed, mode);
  }

  return romanizeWord(input, mode);
}

export { romanizePronunciationWord, romanizeSpellingWord };
