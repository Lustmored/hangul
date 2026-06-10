import type { AppScreen, AppSettings, DifficultyId, QuizSession, SavedRun, ScoreboardsByDifficulty } from '../game/types';
import { createInitialSession } from '../game/quiz';
import { getDefaultHistoryDifficultyId } from '../storage/localStorage';

export interface AppState {
  screen: AppScreen;
  settings: AppSettings;
  scoreboards: ScoreboardsByDifficulty;
  historyDifficultyTab: DifficultyId;
  session: QuizSession | null;
  lastCompletedRun: SavedRun | null;
  resetModalOpen: boolean;
  animatedScore: boolean;
  animatedDamage: boolean;
}

export type Action =
  | { type: 'enter-app' }
  | { type: 'open-settings' }
  | { type: 'open-credits' }
  | { type: 'open-history' }
  | { type: 'go-home' }
  | { type: 'start-game' }
  | { type: 'set-settings'; settings: AppSettings }
  | { type: 'set-history-tab'; difficultyId: DifficultyId }
  | { type: 'set-session'; session: QuizSession }
  | { type: 'finish-run'; screen: AppScreen; session: QuizSession; run: SavedRun; scoreboards: ScoreboardsByDifficulty }
  | { type: 'open-reset-modal' }
  | { type: 'close-reset-modal' }
  | { type: 'reset-local-data'; settings: AppSettings; scoreboards: ScoreboardsByDifficulty }
  | { type: 'clear-animations' };

export function createInitialAppState(settings: AppSettings, scoreboards: ScoreboardsByDifficulty): AppState {
  return {
    screen: 'launch',
    settings,
    scoreboards,
    historyDifficultyTab: getDefaultHistoryDifficultyId(settings.difficultyId),
    session: null,
    lastCompletedRun: null,
    resetModalOpen: false,
    animatedScore: false,
    animatedDamage: false
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'enter-app':
      return { ...state, screen: 'start' };
    case 'open-settings':
      return { ...state, screen: 'settings' };
    case 'open-credits':
      return { ...state, screen: 'credits' };
    case 'open-history':
      return { ...state, screen: 'history' };
    case 'go-home':
      return { ...state, screen: 'start', resetModalOpen: false };
    case 'start-game':
      return {
        ...state,
        screen: 'quiz',
        session: createInitialSession(state.settings.difficultyId, state.settings.romanizationMode),
        animatedDamage: false,
        animatedScore: false
      };
    case 'set-settings':
      return { ...state, settings: action.settings, historyDifficultyTab: getDefaultHistoryDifficultyId(action.settings.difficultyId) };
    case 'set-history-tab':
      return { ...state, historyDifficultyTab: action.difficultyId };
    case 'set-session': {
      const previous = state.session;
      const animatedDamage =
        typeof previous?.lives === 'number' &&
        typeof action.session.lives === 'number' &&
        previous.lives > action.session.lives;
      return {
        ...state,
        screen: 'quiz',
        session: action.session,
        animatedScore: (previous?.score ?? 0) < action.session.score,
        animatedDamage
      };
    }
    case 'finish-run':
      return {
        ...state,
        screen: action.screen,
        session: action.session,
        scoreboards: action.scoreboards,
        lastCompletedRun: action.run,
        animatedDamage: false,
        animatedScore: false
      };
    case 'open-reset-modal':
      return { ...state, resetModalOpen: true };
    case 'close-reset-modal':
      return { ...state, resetModalOpen: false };
    case 'reset-local-data':
      return {
        ...state,
        settings: action.settings,
        scoreboards: action.scoreboards,
        historyDifficultyTab: getDefaultHistoryDifficultyId(action.settings.difficultyId),
        resetModalOpen: false
      };
    case 'clear-animations':
      return { ...state, animatedScore: false, animatedDamage: false };
    default:
      return state;
  }
}
