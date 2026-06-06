import { describe, expect, it, vi } from 'vitest';
import { HANGUL_ITEMS } from '../src/data/hangul';
import { advanceAfterResult, buildOptions, createInitialSession, createNextQuestion, getDistractorScore, getRemainingSeconds, resolveAnswer } from '../src/game/quiz';

vi.spyOn(Date, 'now').mockImplementation(() => 10_000);

describe('quiz generation', () => {
  it('creates a first question for a new session', () => {
    const session = createInitialSession('easy');

    expect(session.question).not.toBeNull();
    expect(session.question?.options).toHaveLength(4);
    expect(session.question?.timeLimitSeconds).toBe(10);
    expect(session.question?.remainingSeconds).toBe(10);
    expect(session.lives).toBe(5);
  });

  it('does not reuse the consumed prompt item in the next question', () => {
    const first = createInitialSession('easy');
    const promptId = first.question!.promptItem.id;
    const afterAnswer = resolveAnswer(first, first.question!.correctOptionId).nextSession;
    const second = advanceAfterResult(afterAnswer, 'easy');

    expect(second.question?.promptItem.id).not.toBe(promptId);
  });

  it('covers the full modern pool plus standalone jamo', () => {
    expect(HANGUL_ITEMS.length).toBe(11_212);
  });

  it('deducts a life on timeout without increasing the score', () => {
    const session = createInitialSession('hard');
    const resolved = resolveAnswer(session, null).nextSession;

    expect(resolved.lives).toBe(1);
    expect(resolved.score).toBe(0);
    expect(resolved.lastResult?.outcome).toBe('timeout');
  });

  it('does not deduct lives in training mode', () => {
    const session = createInitialSession('training');
    const resolved = resolveAnswer(session, null).nextSession;

    expect(resolved.lives).toBeNull();
    expect(resolved.mistakes).toBe(1);
    expect(resolved.score).toBe(0);
  });

  it('can still create a question when the preferred bucket is exhausted', () => {
    const usedIds = HANGUL_ITEMS.filter((item) => item.difficultyBucket === 1).map((item) => item.id);
    const question = createNextQuestion(usedIds, 0, 'normal');

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

    expect(getDistractorScore(source, close)).toBeGreaterThan(getDistractorScore(source, far));
  });

  it('prefers syllables that differ by one component over distant syllables', () => {
    const source = HANGUL_ITEMS.find((item) => item.glyph === '서')!;
    const close = HANGUL_ITEMS.find((item) => item.glyph === '소')!;
    const far = HANGUL_ITEMS.find((item) => item.glyph === '빵')!;

    expect(getDistractorScore(source, close)).toBeGreaterThan(getDistractorScore(source, far));
  });

  it('builds options with at least one close distractor for a syllable', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const source = HANGUL_ITEMS.find((item) => item.glyph === '서')!;
    const options = buildOptions(source, 'hangul-to-latin');
    const closeRomanizations = new Set(['so', 'seu', 'seo', 'sseo', 'jeo']);

    expect(options).toHaveLength(4);
    expect(options.some((option) => option.id !== source.id && closeRomanizations.has(option.label))).toBe(true);

    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockImplementation(() => 10_000);
  });
});
