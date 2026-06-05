import type { QuestionMode, QuizItem, TimerPresetId } from '../data/hangul';

export type AppScreen = 'start' | 'settings' | 'history' | 'quiz' | 'gameOver' | 'win' | 'perfectRun';
export type { TimerPresetId };

export interface AppSettings {
  sfxVolume: number;
  timerPresetId: TimerPresetId;
}

export interface SavedRun {
  id: string;
  score: number;
  totalAnswerTimeMs: number;
  timerPresetId: TimerPresetId;
  endedIn: 'game-over' | 'full-clear';
  perfectClear: boolean;
  completedAt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  item: QuizItem;
}

export interface QuizQuestion {
  mode: QuestionMode;
  prompt: string;
  promptItem: QuizItem;
  options: QuestionOption[];
  correctOptionId: string;
  timeLimitSeconds: number | null;
  remainingSeconds: number | null;
}

export interface QuizSession {
  lives: number;
  score: number;
  usedItemIds: string[];
  question: QuizQuestion | null;
  questionStartedAt: number | null;
  totalAnswerTimeMs: number;
  lastResult: QuestionResult | null;
  timerExpired: boolean;
}

export interface QuestionResult {
  outcome: 'correct' | 'wrong' | 'timeout';
  selectedOptionId: string | null;
  correctOptionId: string;
  promptItem: QuizItem;
  options: QuestionOption[];
}

export interface Scoreboard {
  bestScore: number;
  recentRuns: SavedRun[];
}

export type ScoreboardsByTimer = Record<TimerPresetId, Scoreboard>;
