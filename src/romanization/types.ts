export type RomanizationMode = 'spelling' | 'pronunciation';

export interface RomanizationPreset {
  id: RomanizationMode;
  label: string;
  hint: string;
  examples: [string, string];
}

export interface SyllableRomanizationParts {
  onsetKey: string;
  vowelKey: string;
  finalKey: string;
}
