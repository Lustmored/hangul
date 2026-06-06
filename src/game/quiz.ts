import { HANGUL_ITEMS, getDifficultyPresetById, type DifficultyId, type QuestionMode, type QuizItem } from '../data/hangul';
import type { QuestionOption, QuizQuestion, QuestionResult, QuizSession } from './types';

const BUCKET_WEIGHTS: Array<{ minScore: number; weights: Record<number, number> }> = [
  { minScore: 0, weights: { 1: 8, 2: 4, 3: 3 } },
  { minScore: 4, weights: { 1: 4, 2: 4, 3: 5, 4: 3 } },
  { minScore: 8, weights: { 1: 2, 2: 3, 3: 5, 4: 4, 5: 2 } },
  { minScore: 14, weights: { 2: 2, 3: 4, 4: 5, 5: 4, 6: 3, 8: 1 } },
  { minScore: 24, weights: { 3: 2, 4: 3, 5: 5, 6: 5, 7: 4, 8: 4 } }
];

export function createInitialSession(difficultyId: DifficultyId): QuizSession {
  const difficulty = getDifficultyPresetById(difficultyId);

  return {
    lives: difficulty.lives,
    maxLives: difficulty.lives,
    mistakes: 0,
    terminalOutcome: null,
    score: 0,
    usedItemIds: [],
    question: createNextQuestion([], 0, difficultyId),
    questionStartedAt: Date.now(),
    totalAnswerTimeMs: 0,
    lastResult: null,
    timerExpired: false
  };
}

export function createNextQuestion(usedItemIds: string[], score: number, difficultyId: DifficultyId): QuizQuestion | null {
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
  const difficulty = getDifficultyPresetById(difficultyId);

  return {
    mode,
    prompt: mode === 'hangul-to-latin' ? promptItem.glyph : promptItem.romanization,
    promptItem,
    options,
    correctOptionId: promptItem.id,
    timeLimitSeconds: difficulty.seconds,
    remainingSeconds: difficulty.seconds
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
  const lives = correct || session.lives === null ? session.lives : session.lives - 1;
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
    mistakes: correct ? session.mistakes : session.mistakes + 1,
    terminalOutcome: null,
    score,
    usedItemIds,
    totalAnswerTimeMs: session.totalAnswerTimeMs + elapsedMs,
    lastResult,
    timerExpired: timeout,
    questionStartedAt: null
  };

  if (lives !== null && lives <= 0) {
    return { nextSession: { ...nextSession, terminalOutcome: 'game-over' }, finished: 'game-over' };
  }

  if (usedItemIds.length >= HANGUL_ITEMS.length) {
    return { nextSession: { ...nextSession, terminalOutcome: 'full-clear' }, finished: 'full-clear' };
  }

  return { nextSession, finished: null };
}

export function advanceAfterResult(session: QuizSession, difficultyId: DifficultyId): QuizSession {
  const nextQuestion = createNextQuestion(session.usedItemIds, session.score, difficultyId);

  return {
    ...session,
    question: nextQuestion,
    questionStartedAt: nextQuestion ? Date.now() : null,
    lastResult: null,
    terminalOutcome: null,
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

export function buildOptions(promptItem: QuizItem, mode: QuestionMode): QuestionOption[] {
  const pool = HANGUL_ITEMS.filter((candidate) => candidate.id !== promptItem.id && candidate.type === promptItem.type);
  const scoredPool = pool
    .map((candidate) => ({ candidate, score: getDistractorScore(promptItem, candidate) }))
    .sort((left, right) => right.score - left.score);

  const veryClose = scoredPool.filter((entry) => entry.score >= 28).map((entry) => entry.candidate);
  const close = scoredPool.filter((entry) => entry.score >= 20).map((entry) => entry.candidate);
  const medium = scoredPool.filter((entry) => entry.score >= 14).map((entry) => entry.candidate);
  const ranked = scoredPool.map((entry) => entry.candidate);

  const chosen: QuizItem[] = [];
  fillFromPool(chosen, veryClose, 2);
  if (chosen.length < 2) {
    fillFromPool(chosen, close, 2 - chosen.length);
  }
  if (chosen.length < 3) {
    fillFromPool(chosen, medium, 3 - chosen.length);
  }
  if (chosen.length < 3) {
    fillFromPool(chosen, ranked, 3 - chosen.length);
  }

  const items = shuffle([promptItem, ...chosen.slice(0, 3)]);

  return items.map((item) => ({
    id: item.id,
    item,
    label: mode === 'hangul-to-latin' ? item.romanization : item.glyph
  }));
}

export function getDistractorScore(source: QuizItem, candidate: QuizItem): number {
  let score = 0;

  if (candidate.difficultyBucket === source.difficultyBucket) {
    score += 4;
  } else if (Math.abs(candidate.difficultyBucket - source.difficultyBucket) === 1) {
    score += 2;
  }

  if (source.type === 'jamo') {
    const sameJamoKind = getJamoKind(source) === getJamoKind(candidate);
    if (sameJamoKind) {
      score += 8;
    }

    if (isDirectConfusable(source.key, candidate.key, source.confusableWith, candidate.confusableWith)) {
      score += 18;
    }

    score += sharedCount(source.families, candidate.families) * 4;

    if (source.romanization.length === candidate.romanization.length) {
      score += 2;
    }

    if (source.romanization[0] && source.romanization[0] === candidate.romanization[0]) {
      score += 2;
    }

    return score;
  }

  const sameOnset = source.components.onsetKey === candidate.components.onsetKey;
  const sameVowel = source.components.vowelKey === candidate.components.vowelKey;
  const sameFinal = source.components.finalKey === candidate.components.finalKey;

  if (sameOnset) {
    score += 10;
  } else if (isComponentConfusable(source.components.onsetKey, candidate.components.onsetKey, source.componentConfusables.onset, candidate.componentConfusables.onset)) {
    score += 7;
  }

  if (sameVowel) {
    score += 10;
  } else if (isComponentConfusable(source.components.vowelKey, candidate.components.vowelKey, source.componentConfusables.vowel, candidate.componentConfusables.vowel)) {
    score += 7;
  }

  if (sameFinal) {
    score += 6;
  } else if (isComponentConfusable(source.components.finalKey, candidate.components.finalKey, source.componentConfusables.final, candidate.componentConfusables.final)) {
    score += 4;
  }

  const sameComponentCount = Number(sameOnset) + Number(sameVowel) + Number(sameFinal);
  if (sameComponentCount === 2) {
    score += 12;
  } else if (sameComponentCount === 1) {
    score += 4;
  }

  if (source.tags.includes('open') === candidate.tags.includes('open')) {
    score += 2;
  }

  if (source.romanization.length === candidate.romanization.length) {
    score += 1;
  }

  if (source.romanization[0] && source.romanization[0] === candidate.romanization[0]) {
    score += 1;
  }

  score += sharedCount(source.families, candidate.families);

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

function getJamoKind(item: QuizItem): 'consonant' | 'vowel' | 'other' {
  if (item.components.vowelKey) {
    return 'vowel';
  }
  if (item.components.onsetKey) {
    return 'consonant';
  }
  return 'other';
}

function isDirectConfusable(sourceKey: string, candidateKey: string, sourceConfusables: string[], candidateConfusables: string[]): boolean {
  return sourceConfusables.includes(candidateKey) || candidateConfusables.includes(sourceKey);
}

function isComponentConfusable(
  sourceKey: string | null,
  candidateKey: string | null,
  sourceConfusables: string[],
  candidateConfusables: string[]
): boolean {
  if (!sourceKey || !candidateKey) {
    return false;
  }

  return sourceConfusables.includes(candidateKey) || candidateConfusables.includes(sourceKey);
}

function sharedCount(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((count, value) => count + (rightSet.has(value) ? 1 : 0), 0);
}

function fillFromPool(target: QuizItem[], source: QuizItem[], count: number): void {
  if (count <= 0) {
    return;
  }

  const remaining = source.filter((item) => !target.some((picked) => picked.id === item.id));
  target.push(...pickDistinctRandom(remaining, count));
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
