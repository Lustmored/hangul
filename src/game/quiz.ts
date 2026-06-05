import { HANGUL_ITEMS, getTimerPresetById, type QuestionMode, type QuizItem, type TimerPresetId } from '../data/hangul';
import type { QuestionOption, QuizQuestion, QuestionResult, QuizSession } from './types';

const BUCKET_WEIGHTS: Array<{ minScore: number; weights: Record<number, number> }> = [
  { minScore: 0, weights: { 1: 10, 2: 3, 3: 1 } },
  { minScore: 5, weights: { 1: 6, 2: 5, 3: 3, 4: 1 } },
  { minScore: 10, weights: { 1: 3, 2: 4, 3: 5, 4: 3, 5: 1 } },
  { minScore: 20, weights: { 2: 3, 3: 4, 4: 5, 5: 4, 6: 2, 8: 1 } },
  { minScore: 35, weights: { 3: 2, 4: 4, 5: 5, 6: 5, 7: 3, 8: 4 } }
];

export function createInitialSession(timerPresetId: TimerPresetId): QuizSession {
  return {
    lives: 3,
    score: 0,
    usedItemIds: [],
    question: createNextQuestion([], 0, timerPresetId),
    questionStartedAt: Date.now(),
    totalAnswerTimeMs: 0,
    lastResult: null,
    timerExpired: false
  };
}

export function createNextQuestion(usedItemIds: string[], score: number, timerPresetId: TimerPresetId): QuizQuestion | null {
  const mode: QuestionMode = Math.random() < 0.5 ? 'hangul-to-latin' : 'latin-to-hangul';
  const nextBucket = pickBucket(score);
  const unusedItems = HANGUL_ITEMS.filter((item) => !usedItemIds.includes(item.id));
  const bucketItems = unusedItems.filter((item) => item.difficultyBucket === nextBucket);
  const fallbackItems = bucketItems.length > 0 ? bucketItems : unusedItems;

  if (fallbackItems.length === 0) {
    return null;
  }

  const promptItem = pickRandom(fallbackItems);
  const options = buildOptions(promptItem, mode);
  const timerPreset = getTimerPresetById(timerPresetId);

  return {
    mode,
    prompt: mode === 'hangul-to-latin' ? promptItem.glyph : promptItem.romanization,
    promptItem,
    options,
    correctOptionId: promptItem.id,
    timeLimitSeconds: timerPreset.seconds,
    remainingSeconds: timerPreset.seconds
  };
}

export function resolveAnswer(session: QuizSession, selectedOptionId: string | null): { nextSession: QuizSession; finished: 'game-over' | 'full-clear' | null } {
  if (!session.question || session.questionStartedAt === null) {
    return { nextSession: session, finished: null };
  }

  const elapsedMs = Date.now() - session.questionStartedAt;
  const usedItemIds = [...session.usedItemIds, session.question.promptItem.id];
  const correct = selectedOptionId === session.question.correctOptionId;
  const timeout = selectedOptionId === null;
  const outcome: QuestionResult['outcome'] = timeout ? 'timeout' : correct ? 'correct' : 'wrong';
  const lives = correct ? session.lives : session.lives - 1;
  const score = correct ? session.score + 1 : session.score;

  const lastResult: QuestionResult = {
    outcome,
    selectedOptionId,
    correctOptionId: session.question.correctOptionId,
    promptItem: session.question.promptItem,
    options: session.question.options
  };

  const nextSession: QuizSession = {
    ...session,
    lives,
    score,
    usedItemIds,
    totalAnswerTimeMs: session.totalAnswerTimeMs + elapsedMs,
    lastResult,
    timerExpired: timeout,
    questionStartedAt: null
  };

  if (lives <= 0) {
    return { nextSession, finished: 'game-over' };
  }

  if (usedItemIds.length >= HANGUL_ITEMS.length) {
    return { nextSession, finished: 'full-clear' };
  }

  return { nextSession, finished: null };
}

export function advanceAfterResult(session: QuizSession, timerPresetId: TimerPresetId): QuizSession {
  const nextQuestion = createNextQuestion(session.usedItemIds, session.score, timerPresetId);

  return {
    ...session,
    question: nextQuestion,
    questionStartedAt: nextQuestion ? Date.now() : null,
    lastResult: null,
    timerExpired: false
  };
}

export function getRemainingSeconds(timeLimitSeconds: number | null, questionStartedAt: number | null, now: number): number | null {
  if (timeLimitSeconds === null || questionStartedAt === null) {
    return null;
  }

  const elapsedMs = now - questionStartedAt;
  return Math.max(0, Math.ceil((timeLimitSeconds * 1000 - elapsedMs) / 1000));
}

export function formatDuration(totalMs: number): string {
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function buildOptions(promptItem: QuizItem, mode: QuestionMode): QuestionOption[] {
  const pool = HANGUL_ITEMS.filter((candidate) => candidate.id !== promptItem.id && candidate.type === promptItem.type);
  const rankedPool = pool
    .map((candidate) => ({ candidate, score: getDistractorScore(promptItem, candidate) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 24)
    .map((entry) => entry.candidate);

  const distractors = pickDistinctRandom(rankedPool, 3);
  const items = shuffle([promptItem, ...distractors]);

  return items.map((item) => ({
    id: item.id,
    item,
    label: mode === 'hangul-to-latin' ? item.romanization : item.glyph
  }));
}

function getDistractorScore(source: QuizItem, candidate: QuizItem): number {
  let score = 0;

  if (candidate.difficultyBucket === source.difficultyBucket) {
    score += 5;
  }

  if (Math.abs(candidate.difficultyBucket - source.difficultyBucket) === 1) {
    score += 3;
  }

  const sharedConfusable = candidate.confusableWith.some((value) => source.confusableWith.includes(value));
  if (sharedConfusable) {
    score += 6;
  }

  const sharedTags = candidate.tags.filter((tag) => source.tags.includes(tag)).length;
  score += sharedTags;

  if (candidate.romanization[0] === source.romanization[0]) {
    score += 1;
  }

  return score;
}

function pickBucket(score: number): number {
  const current = [...BUCKET_WEIGHTS].reverse().find((entry) => score >= entry.minScore) ?? BUCKET_WEIGHTS[0]!;
  const entries = Object.entries(current.weights) as Array<[string, number]>;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * totalWeight;

  for (const [bucket, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return Number(bucket);
    }
  }

  return Number(entries[entries.length - 1]![0]);
}

function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty array.');
  }

  return items[Math.floor(Math.random() * items.length)]!;
}

function pickDistinctRandom<T>(items: readonly T[], count: number): T[] {
  return shuffle([...items]).slice(0, count);
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index]!;
    next[index] = next[swapIndex]!;
    next[swapIndex] = current;
  }

  return next;
}
