import { useEffect, useMemo, useReducer } from 'react';
import { Modal } from '../components/Modal';
import { EndScreen } from '../screens/EndScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { RunHistoryScreen } from '../screens/RunHistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StartScreen } from '../screens/StartScreen';
import { DEFAULT_SETTINGS, loadScoreboards, loadSettings, resetLocalData, saveRun, saveSettings } from '../storage/localStorage';
import { advanceAfterResult, createInitialSession, getRemainingSeconds, resolveAnswer } from '../game/quiz';
import { createInitialAppState, reducer } from './reducer';
import type { SavedRun, QuizSession } from '../game/types';

export function App() {
  const initialState = useMemo(() => createInitialAppState(loadSettings(), loadScoreboards()), []);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    if (!state.animatedScore && !state.animatedDamage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => dispatch({ type: 'clear-animations' }), 550);
    return () => window.clearTimeout(timeout);
  }, [state.animatedDamage, state.animatedScore]);

  useEffect(() => {
    const session = state.session;
    if (state.screen !== 'quiz' || !session?.question) {
      return undefined;
    }

    const timeLimitSeconds = session.question.timeLimitSeconds;
    if (timeLimitSeconds === null || session.lastResult) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const currentSession = state.session;
      if (!currentSession?.question || currentSession.lastResult || currentSession.questionStartedAt === null) {
        return;
      }

      const secondsLeft = getRemainingSeconds(
        currentSession.question.timeLimitSeconds,
        currentSession.questionStartedAt,
        Date.now()
      );

      if (secondsLeft !== currentSession.question.remainingSeconds) {
        dispatch({
          type: 'set-session',
          session: {
            ...currentSession,
            question: {
              ...currentSession.question,
              remainingSeconds: secondsLeft
            }
          }
        });
      }

      if (secondsLeft !== null && secondsLeft <= 0) {
        handleAnswer(currentSession, null);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [state.screen, state.session]);

  const handleAnswer = (session: QuizSession | null, selectedOptionId: string | null) => {
    if (!session) {
      return;
    }

    const { nextSession, finished } = resolveAnswer(session, selectedOptionId);

    if (!finished) {
      dispatch({ type: 'set-session', session: nextSession });
      return;
    }

    const perfectClear = finished === 'full-clear' && nextSession.lives === 3;
    const run: SavedRun = {
      id: crypto.randomUUID(),
      score: nextSession.score,
      totalAnswerTimeMs: nextSession.totalAnswerTimeMs,
      timerPresetId: state.settings.timerPresetId,
      endedIn: finished,
      perfectClear,
      completedAt: new Date().toISOString()
    };

    const updatedBoards = saveRun(state.scoreboards, run);
    dispatch({
      type: 'finish-run',
      screen: perfectClear ? 'perfectRun' : finished === 'full-clear' ? 'win' : 'gameOver',
      session: nextSession,
      run,
      scoreboards: updatedBoards
    });
  };

  const handleNextQuestion = () => {
    if (!state.session?.lastResult) {
      return;
    }

    dispatch({
      type: 'set-session',
      session: advanceAfterResult(state.session, state.settings.timerPresetId)
    });
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'set-session', session: createInitialSession(state.settings.timerPresetId) });
  };

  const handleResetData = () => {
    resetLocalData();
    dispatch({ type: 'reset-local-data', settings: DEFAULT_SETTINGS, scoreboards: loadScoreboards() });
  };

  return (
    <>
      {state.screen === 'start' ? (
        <StartScreen
          settings={state.settings}
          scoreboards={state.scoreboards}
          onStartGame={() => dispatch({ type: 'start-game' })}
          onOpenHistory={() => dispatch({ type: 'open-history' })}
          onOpenSettings={() => dispatch({ type: 'open-settings' })}
        />
      ) : null}

      {state.screen === 'settings' ? (
        <SettingsScreen
          settings={state.settings}
          onChange={(settings) => dispatch({ type: 'set-settings', settings })}
          onBack={() => dispatch({ type: 'go-home' })}
          onReset={() => dispatch({ type: 'open-reset-modal' })}
        />
      ) : null}

      {state.screen === 'history' ? (
        <RunHistoryScreen
          activeTimer={state.historyTimerTab}
          scoreboards={state.scoreboards}
          onChangeTimer={(timerPresetId) => dispatch({ type: 'set-history-tab', timerPresetId })}
          onBack={() => dispatch({ type: 'go-home' })}
        />
      ) : null}

      {state.screen === 'quiz' && state.session ? (
        <QuizScreen
          session={state.session}
          animatedScore={state.animatedScore}
          animatedDamage={state.animatedDamage}
          onAnswer={(optionId) => handleAnswer(state.session, optionId)}
          onTimeout={() => handleAnswer(state.session, null)}
          onNext={handleNextQuestion}
        />
      ) : null}

      {(state.screen === 'gameOver' || state.screen === 'win' || state.screen === 'perfectRun') && state.session ? (
        <EndScreen
          variant={state.screen}
          score={state.session.score}
          elapsedMs={state.session.totalAnswerTimeMs}
          livesLost={3 - state.session.lives}
          timerPresetId={state.settings.timerPresetId}
          onPlayAgain={handlePlayAgain}
          onBackToHome={() => dispatch({ type: 'go-home' })}
        />
      ) : null}

      {state.resetModalOpen ? (
        <Modal
          title="Reset local data?"
          description="This clears saved settings, best scores, and recent runs immediately."
          onConfirm={handleResetData}
          onCancel={() => dispatch({ type: 'close-reset-modal' })}
        />
      ) : null}
    </>
  );
}
