import { describe, expect, it, vi } from 'vitest';
import { HANGUL_ITEMS } from '../src/data/hangul';
import { advanceAfterResult, createInitialSession, createNextQuestion, getRemainingSeconds, resolveAnswer } from '../src/game/quiz';

vi.spyOn(Date, 'now').mockImplementation(() => 10_000);

describe('quiz generation', () => {
  it('creates a first question for a new session', () => {
    const session = createInitialSession('relaxed');

    expect(session.question).not.toBeNull();
    expect(session.question?.options).toHaveLength(4);
    expect(session.question?.timeLimitSeconds).toBe(10);
    expect(session.question?.remainingSeconds).toBe(10);
    expect(session.lives).toBe(3);
  });

  it('does not reuse the consumed prompt item in the next question', () => {
    const first = createInitialSession('relaxed');
    const promptId = first.question!.promptItem.id;
    const afterAnswer = resolveAnswer(first, first.question!.correctOptionId).nextSession;
    const second = advanceAfterResult(afterAnswer, 'relaxed');

    expect(second.question?.promptItem.id).not.toBe(promptId);
  });

  it('covers the full modern pool plus standalone jamo', () => {
    expect(HANGUL_ITEMS.length).toBe(11_212);
  });

  it('deducts a life on timeout without increasing the score', () => {
    const session = createInitialSession('quick');
    const resolved = resolveAnswer(session, null).nextSession;

    expect(resolved.lives).toBe(2);
    expect(resolved.score).toBe(0);
    expect(resolved.lastResult?.outcome).toBe('timeout');
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
});
