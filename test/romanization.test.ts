import { describe, expect, it } from 'vitest';
import { romanize, romanizePronunciationWord, romanizeSpellingWord } from '../src/romanization';

describe('word-level pronunciation romanization', () => {
  it('handles adjacent consonant assimilation from NIKL examples', () => {
    expect(romanizePronunciationWord('백마')).toBe('baengma');
    expect(romanizePronunciationWord('신문로')).toBe('sinmunno');
    expect(romanizePronunciationWord('종로')).toBe('jongno');
    expect(romanizePronunciationWord('왕십리')).toBe('wangsimni');
    expect(romanizePronunciationWord('별내')).toBe('byeollae');
    expect(romanizePronunciationWord('신라')).toBe('silla');
  });

  it('handles epenthetic n and l from NIKL examples', () => {
    expect(romanizePronunciationWord('학여울')).toBe('hangnyeoul');
    expect(romanizePronunciationWord('알약')).toBe('allyak');
  });

  it('handles palatalization from NIKL examples', () => {
    expect(romanizePronunciationWord('해돋이')).toBe('haedoji');
    expect(romanizePronunciationWord('같이')).toBe('gachi');
    expect(romanizePronunciationWord('굳히다')).toBe('guchida');
  });

  it('handles h-adjacent aspiration from NIKL examples', () => {
    expect(romanizePronunciationWord('좋고')).toBe('joko');
    expect(romanizePronunciationWord('놓다')).toBe('nota');
    expect(romanizePronunciationWord('잡혀')).toBe('japyeo');
    expect(romanizePronunciationWord('낳지')).toBe('nachi');
  });

  it('handles liaison and broader mixed examples', () => {
    expect(romanizePronunciationWord('입어')).toBe('ibeo');
    expect(romanizePronunciationWord('독립문')).toBe('dongnimmun');
  });
});

describe('romanization public api', () => {
  it('supports spelling words for api symmetry', () => {
    expect(romanizeSpellingWord('값')).toBe('gabs');
    expect(romanizeSpellingWord('읽')).toBe('ilg');
    expect(romanizeSpellingWord('값 읽')).toBe('gabs ilg');
  });

  it('routes single syllables and words through one romanize api', () => {
    expect(romanize('값', 'spelling')).toBe('gabs');
    expect(romanize('값', 'pronunciation')).toBe('gap');
    expect(romanize('독립문', 'pronunciation')).toBe('dongnimmun');
    expect(romanize({ onsetKey: 'g', vowelKey: 'a', finalKey: 'bs' }, 'spelling')).toBe('gabs');
  });
});
