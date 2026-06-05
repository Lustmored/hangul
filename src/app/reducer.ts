import type { AppScreen, AppSettings, QuizSession, SavedRun, ScoreboardsByTimer, TimerPresetId } from '../game/types';
import { createInitialSession } from '../game/quiz';

export interface AppState {
  screen: AppScreen;
  settings: AppSettings;
  scoreboards: ScoreboardsByTimer;
  historyTimerTab: TimerPresetId;
  session: QuizSession | null;
  lastCompletedRun: SavedRun | null;
  resetModalOpen: boolean;
  animatedScore: boolean;
  animatedDamage: boolean;
}

export type Action =
  | { type: 'open-settings' }
  | { type: 'open-history' }
  | { type: 'go-home' }
  | { type: 'start-game' }
  | { type: 'set-settings'; settings: AppSettings }
  | { type: 'set-history-tab'; timerPresetId: TimerPresetId }
  | { type: 'set-session'; session: QuizSession }
  | { type: 'finish-run'; screen: AppScreen; session: QuizSession; run: SavedRun; scoreboards: ScoreboardsByTimer }
  | { type: 'open-reset-modal' }
  | { type: 'close-reset-modal' }
  | { type: 'reset-local-data'; settings: AppSettings; scoreboards: ScoreboardsByTimer }
  | { type: 'clear-animations' };

export function createInitialAppState(settings: AppSettings, scoreboards: ScoreboardsByTimer): AppState {
  return {
    screen: 'start',
    settings,
    scoreboards,
    historyTimerTab: settings.timerPresetId,
    session: null,
    lastCompletedRun: null,
    resetModalOpen: false,
    animatedScore: false,
    animatedDamage: false
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'open-settings':
      return { ...state, screen: 'settings' };
    case 'open-history':
      return { ...state, screen: 'history' };
    case 'go-home':
      return { ...state, screen: 'start', resetModalOpen: false };
    case 'start-game':
      return {
        ...state,
        screen: 'quiz',
        session: createInitialSession(state.settings.timerPresetId),
        animatedDamage: false,
        animatedScore: false
      };
    case 'set-settings':
      return { ...state, settings: action.settings, historyTimerTab: action.settings.timerPresetId };
    case 'set-history-tab':
      return { ...state, historyTimerTab: action.timerPresetId };
    case 'set-session': {
      const previous = state.session;
      return {
        ...state,
        screen: 'quiz',
        session: action.session,
        animatedScore: (previous?.score ?? 0) < action.session.score,
        animatedDamage: (previous?.lives ?? 3) > action.session.lives
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
        historyTimerTab: action.settings.timerPresetId,
        resetModalOpen: false
      };
    case 'clear-animations':
      return { ...state, animatedScore: false, animatedDamage: false };
    default:
      return state;
  }
}
