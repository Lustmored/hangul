import { useEffect, useMemo, useReducer, useRef } from 'react';
import { createSfxController } from '../audio';
import { createMusicController, type MusicTrack } from '../music';
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
  const musicRef = useRef(createMusicController(initialState.settings.musicVolume));
  const stateRef = useRef(state);
  const previousScreenRef = useRef(state.screen);
  const overlayEntryActiveRef = useRef(false);
  const navigatingHomeRef = useRef(false);
  const countdownQuestionKeyRef = useRef<string | null>(null);
  const lastCountdownSecondRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    saveSettings(state.settings);
    sfxRef.current.setVolume(state.settings.sfxVolume);
    musicRef.current.setVolume(state.settings.musicVolume);
  }, [state.settings]);

  useEffect(() => {
    const primeMusic = () => {
      musicRef.current.prime();
    };

    window.addEventListener('pointerdown', primeMusic, { passive: true });
    window.addEventListener('keydown', primeMusic);

    return () => {
      window.removeEventListener('pointerdown', primeMusic);
      window.removeEventListener('keydown', primeMusic);
    };
  }, []);

  useEffect(() => {
    musicRef.current.setTrack(getMusicTrackForScreen(state.screen));
  }, [state.screen]);

  useEffect(() => {
    return () => {
      musicRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      navigatingHomeRef.current = false;

      if (stateRef.current.screen !== 'start') {
        overlayEntryActiveRef.current = false;
        dispatch({ type: 'go-home' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const previousScreen = previousScreenRef.current;

    if (previousScreen === 'start' && state.screen !== 'start' && !overlayEntryActiveRef.current) {
      window.history.pushState({ appScreen: 'overlay' }, '');
      overlayEntryActiveRef.current = true;
    }

    previousScreenRef.current = state.screen;
  }, [state.screen]);

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
      countdownQuestionKeyRef.current = null;
      lastCountdownSecondRef.current = null;
      return undefined;
    }

    const questionKey = `${session.question.promptItem.id}:${session.questionStartedAt ?? 'none'}`;
    if (countdownQuestionKeyRef.current !== questionKey) {
      countdownQuestionKeyRef.current = questionKey;
      lastCountdownSecondRef.current = null;
    }

    const interval = window.setInterval(() => {
      const currentSession = state.session;
      if (!currentSession?.question || currentSession.lastResult || currentSession.questionStartedAt === null) {
        countdownQuestionKeyRef.current = null;
        lastCountdownSecondRef.current = null;
        return;
      }

      const currentQuestionKey = `${currentSession.question.promptItem.id}:${currentSession.questionStartedAt}`;
      if (countdownQuestionKeyRef.current !== currentQuestionKey) {
        countdownQuestionKeyRef.current = currentQuestionKey;
        lastCountdownSecondRef.current = null;
      }

      const secondsLeft = getRemainingSeconds(
        currentSession.question.timeLimitSeconds,
        currentSession.questionStartedAt,
        Date.now()
      );

      if (secondsLeft !== null && secondsLeft > 0 && secondsLeft <= 3 && lastCountdownSecondRef.current !== secondsLeft) {
        lastCountdownSecondRef.current = secondsLeft;
        sfxRef.current.play('countdown');
      }

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
        countdownQuestionKeyRef.current = null;
        lastCountdownSecondRef.current = null;
        handleAnswer(currentSession, null);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [state.screen, state.session]);

  const finalizeRun = (session: QuizSession, endedIn: 'game-over' | 'full-clear') => {
    const perfectClear = endedIn === 'full-clear' && session.mistakes === 0;
    const run: SavedRun = {
      id: crypto.randomUUID(),
      score: session.score,
      totalAnswerTimeMs: session.totalAnswerTimeMs,
      difficultyId: state.settings.difficultyId,
      endedIn,
      perfectClear,
      completedAt: new Date().toISOString()
    };
    const updatedBoards = saveRun(state.scoreboards, run);

    dispatch({
      type: 'finish-run',
      screen: perfectClear ? 'perfectRun' : endedIn === 'full-clear' ? 'win' : 'gameOver',
      session,
      run,
      scoreboards: updatedBoards
    });
  };

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
      finalizeRun(state.session, state.session.terminalOutcome);
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

  const handleEndRun = () => {
    if (!state.session) {
      return;
    }

    sfxRef.current.play('gameover');
    finalizeRun(state.session, 'game-over');
  };

  const navigateHome = () => {
    if (state.screen !== 'start' && overlayEntryActiveRef.current) {
      navigatingHomeRef.current = true;
      window.history.back();
      return;
    }

    dispatch({ type: 'go-home' });
  };

  return (
    <>
      {state.screen === 'start' ? (
        <StartScreen
          settings={state.settings}
          scoreboards={state.scoreboards}
          onStartGame={() => {
            musicRef.current.prime();
            sfxRef.current.play('start');
            dispatch({ type: 'start-game' });
          }}
          onOpenHistory={() => {
            musicRef.current.prime();
            dispatch({ type: 'open-history' });
          }}
          onOpenSettings={() => {
            musicRef.current.prime();
            dispatch({ type: 'open-settings' });
          }}
        />
      ) : null}

      {state.screen === 'settings' ? (
        <SettingsScreen
          settings={state.settings}
          onChange={(settings) => dispatch({ type: 'set-settings', settings })}
          onBack={() => {
            musicRef.current.prime();
            navigateHome();
          }}
          onReset={() => dispatch({ type: 'open-reset-modal' })}
        />
      ) : null}

      {state.screen === 'history' ? (
        <RunHistoryScreen
          activeDifficulty={state.historyDifficultyTab}
          scoreboards={state.scoreboards}
          onChangeDifficulty={(difficultyId) => dispatch({ type: 'set-history-tab', difficultyId })}
          onBack={() => {
            musicRef.current.prime();
            navigateHome();
          }}
        />
      ) : null}

      {state.screen === 'quiz' && state.session ? (
        <QuizScreen
          session={state.session}
          animatedScore={state.animatedScore}
          animatedDamage={state.animatedDamage}
          onEndRun={handleEndRun}
          onAnswer={(optionId) => {
            musicRef.current.prime();
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
          onBackToHome={navigateHome}
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

function getMusicTrackForScreen(screen: string): MusicTrack {
  return screen === 'quiz' ? 'gameplay' : 'menu';
}
