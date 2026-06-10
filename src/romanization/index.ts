import { romanizePronunciationSyllable } from './pronunciation';
import { romanizeSpellingSyllable } from './spelling';
import type { RomanizationMode, RomanizationPreset, SyllableRomanizationParts } from './types';

export type { RomanizationMode, RomanizationPreset, SyllableRomanizationParts } from './types';

export const ROMANIZATION_PRESETS: RomanizationPreset[] = [
  { id: 'spelling', label: 'Spelling', hint: 'Follows the written block.', examples: ['값 -> gabs', '읽 -> ilg'] },
  { id: 'pronunciation', label: 'Pronunciation', hint: 'Follows how it sounds.', examples: ['값 -> gap', '읽 -> ik'] }
];

export function romanizeSyllable(parts: SyllableRomanizationParts, mode: RomanizationMode): string {
  return mode === 'pronunciation' ? romanizePronunciationSyllable(parts) : romanizeSpellingSyllable(parts);
}
