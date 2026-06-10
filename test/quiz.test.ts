import { describe, expect, it, vi } from 'vitest';
import { getRomanization, HANGUL_ITEMS } from '../src/data/hangul';
import { advanceAfterResult, buildOptions, createInitialSession, createNextQuestion, getDistractorScore, getRemainingSeconds, resolveAnswer } from '../src/game/quiz';

vi.spyOn(Date, 'now').mockImplementation(() => 10_000);

describe('quiz generation', () => {
  it('creates a first question for a new session', () => {
    const session = createInitialSession('easy', 'spelling');

    expect(session.question).not.toBeNull();
    expect(session.question?.options).toHaveLength(4);
    expect(session.question?.timeLimitSeconds).toBe(10);
    expect(session.question?.remainingSeconds).toBe(10);
    expect(session.lives).toBe(5);
  });

  it('does not reuse the consumed prompt item in the next question', () => {
    const first = createInitialSession('easy', 'spelling');
    const promptId = first.question!.promptItem.id;
    const afterAnswer = resolveAnswer(first, first.question!.correctOptionId).nextSession;
    const second = advanceAfterResult(afterAnswer, 'easy', 'spelling');

    expect(second.question?.promptItem.id).not.toBe(promptId);
  });

  it('covers the full modern pool plus standalone jamo', () => {
    expect(HANGUL_ITEMS.length).toBe(11_212);
  });

  it('deducts a life on timeout without increasing the score', () => {
    const session = createInitialSession('hard', 'spelling');
    const resolved = resolveAnswer(session, null).nextSession;

    expect(resolved.lives).toBe(1);
    expect(resolved.score).toBe(0);
    expect(resolved.lastResult?.outcome).toBe('timeout');
  });

  it('does not deduct lives in training mode', () => {
    const session = createInitialSession('training', 'spelling');
    const resolved = resolveAnswer(session, null).nextSession;

    expect(resolved.lives).toBeNull();
    expect(resolved.mistakes).toBe(1);
    expect(resolved.score).toBe(0);
  });

  it('can still create a question when the preferred bucket is exhausted', () => {
    const usedIds = HANGUL_ITEMS.filter((item) => item.difficultyBucket === 1).map((item) => item.id);
    const question = createNextQuestion(usedIds, 0, 'normal', 'spelling');

    expect(question).not.toBeNull();
  });

  it('derives remaining seconds from the original time limit instead of the already-reduced value', () => {
    expect(getRemainingSeconds(10, 0, 2_100)).toBe(8);
    expect(getRemainingSeconds(10, 0, 9_100)).toBe(1);
    expect(getRemainingSeconds(10, 0, 10_000)).toBe(0);
  });

  it('prefers directly confusable jamo over unrelated distractors', () => {
    const source = HANGUL_ITEMS.find((item) => item.id === 'jamo-ㄷ')!;
    const close = HANGUL_ITEMS.find((item) => item.id === 'jamo-ㅌ')!;
    const far = HANGUL_ITEMS.find((item) => item.id === 'jamo-ㅁ')!;

    expect(getDistractorScore(source, close, 'spelling')).toBeGreaterThan(getDistractorScore(source, far, 'spelling'));
  });

  it('prefers syllables that differ by one component over distant syllables', () => {
    const source = HANGUL_ITEMS.find((item) => item.glyph === '서')!;
    const close = HANGUL_ITEMS.find((item) => item.glyph === '소')!;
    const far = HANGUL_ITEMS.find((item) => item.glyph === '빵')!;

    expect(getDistractorScore(source, close, 'spelling')).toBeGreaterThan(getDistractorScore(source, far, 'spelling'));
  });

  it('builds options with at least one close distractor for a syllable', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const source = HANGUL_ITEMS.find((item) => item.glyph === '서')!;
    const options = buildOptions(source, 'hangul-to-latin', 'spelling');
    const closeRomanizations = new Set(['so', 'seu', 'seo', 'sseo', 'jeo']);

    expect(options).toHaveLength(4);
    expect(options.some((option) => option.id !== source.id && closeRomanizations.has(option.label))).toBe(true);

    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockImplementation(() => 10_000);
  });

  it('uses official NIKL spelling romanization for orthography mode', () => {
    const value = HANGUL_ITEMS.find((item) => item.glyph === '값')!;
    const outside = HANGUL_ITEMS.find((item) => item.glyph === '밖')!;
    const house = HANGUL_ITEMS.find((item) => item.glyph === '집')!;

    expect(getRomanization(value, 'spelling')).toBe('gabs');
    expect(getRomanization(outside, 'spelling')).toBe('bakk');
    expect(getRomanization(house, 'spelling')).toBe('jib');
  });

  it('uses a pronunciation-oriented romanization for batchim-heavy syllables', () => {
    const value = HANGUL_ITEMS.find((item) => item.glyph === '값')!;
    const reading = HANGUL_ITEMS.find((item) => item.glyph === '읽')!;
    const soul = HANGUL_ITEMS.find((item) => item.glyph === '삶')!;
    const not = HANGUL_ITEMS.find((item) => item.glyph === '앉')!;
    const many = HANGUL_ITEMS.find((item) => item.glyph === '많')!;
    const soulWide = HANGUL_ITEMS.find((item) => item.glyph === '넓')!;

    expect(getRomanization(value, 'pronunciation')).toBe('gap');
    expect(getRomanization(reading, 'pronunciation')).toBe('ik');
    expect(getRomanization(soul, 'pronunciation')).toBe('sam');
    expect(getRomanization(not, 'pronunciation')).toBe('an');
    expect(getRomanization(many, 'pronunciation')).toBe('man');
    expect(getRomanization(soulWide, 'pronunciation')).toBe('neol');
  });
});
