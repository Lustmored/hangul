import type { DifficultyId, QuestionMode, QuizItem } from '../data/hangul';

export type AppScreen = 'launch' | 'start' | 'settings' | 'credits' | 'history' | 'quiz' | 'gameOver' | 'win' | 'perfectRun';
export type { DifficultyId };

export interface AppSettings {
  sfxVolume: number;
  musicVolume: number;
  audioMuted: boolean;
  difficultyId: DifficultyId;
}

export interface SavedRun {
  id: string;
  score: number;
  totalAnswerTimeMs: number;
  difficultyId: DifficultyId;
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
  lives: number | null;
  maxLives: number | null;
  mistakes: number;
  terminalOutcome: 'game-over' | 'full-clear' | null;
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

export type ScoreboardsByDifficulty = Record<DifficultyId, Scoreboard>;
