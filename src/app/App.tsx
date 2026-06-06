import { useEffect, useMemo, useReducer, useRef } from 'react';
import { createSfxController } from '../audio';
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
  const sfxRef = useRef(createSfxController(initialState.settings.sfxVolume));

  useEffect(() => {
    saveSettings(state.settings);
    sfxRef.current.setVolume(state.settings.sfxVolume);
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

    if (nextSession.lastResult) {
      if (nextSession.lastResult.outcome === 'correct') {
        sfxRef.current.play('correct');
      } else if (nextSession.lastResult.outcome === 'wrong') {
        sfxRef.current.play('wrong');
      } else {
        sfxRef.current.play('timeout');
      }
    }

    if (finished === 'game-over') {
      sfxRef.current.play('gameover');
    } else if (finished === 'full-clear') {
      sfxRef.current.play(nextSession.mistakes === 0 ? 'perfect' : 'win');
    }

    dispatch({ type: 'set-session', session: nextSession });
  };

  const handleNextQuestion = () => {
    if (!state.session?.lastResult) {
      return;
    }

    if (state.session.terminalOutcome) {
      const perfectClear = state.session.terminalOutcome === 'full-clear' && state.session.mistakes === 0;
      const run: SavedRun = {
        id: crypto.randomUUID(),
        score: state.session.score,
        totalAnswerTimeMs: state.session.totalAnswerTimeMs,
        difficultyId: state.settings.difficultyId,
        endedIn: state.session.terminalOutcome,
        perfectClear,
        completedAt: new Date().toISOString()
      };
      const updatedBoards = saveRun(state.scoreboards, run);
      dispatch({
        type: 'finish-run',
        screen: perfectClear ? 'perfectRun' : state.session.terminalOutcome === 'full-clear' ? 'win' : 'gameOver',
        session: state.session,
        run,
        scoreboards: updatedBoards
      });
      return;
    }

    sfxRef.current.play('next');
    dispatch({
      type: 'set-session',
      session: advanceAfterResult(state.session, state.settings.difficultyId)
    });
  };

  const handlePlayAgain = () => {
    sfxRef.current.play('start');
    dispatch({ type: 'set-session', session: createInitialSession(state.settings.difficultyId) });
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
          onStartGame={() => {
            sfxRef.current.play('start');
            dispatch({ type: 'start-game' });
          }}
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
          activeDifficulty={state.historyDifficultyTab}
          scoreboards={state.scoreboards}
          onChangeDifficulty={(difficultyId) => dispatch({ type: 'set-history-tab', difficultyId })}
          onBack={() => dispatch({ type: 'go-home' })}
        />
      ) : null}

      {state.screen === 'quiz' && state.session ? (
        <QuizScreen
          session={state.session}
          animatedScore={state.animatedScore}
          animatedDamage={state.animatedDamage}
          onAnswer={(optionId) => {
            sfxRef.current.play('select');
            handleAnswer(state.session, optionId);
          }}
          onTimeout={() => handleAnswer(state.session, null)}
          onNext={handleNextQuestion}
        />
      ) : null}

      {(state.screen === 'gameOver' || state.screen === 'win' || state.screen === 'perfectRun') && state.session ? (
        <EndScreen
          variant={state.screen}
          score={state.session.score}
          elapsedMs={state.session.totalAnswerTimeMs}
          livesLost={
            state.session.maxLives === null || state.session.lives === null
              ? null
              : state.session.maxLives - state.session.lives
          }
          difficultyId={state.settings.difficultyId}
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
