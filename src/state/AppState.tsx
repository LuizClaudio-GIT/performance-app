import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getBlock } from '../data/catalog';
import {
  makeId,
  type AppData,
  type DayPlan,
  type Limitation,
  type Meal,
  type MetricEntry,
  type ProgressionDef,
  type RecoveryLog,
  type SessionLog,
  type WodPlan,
  type WodResult,
  type WorkoutAttempt,
  type WorkoutAttemptKind,
  type WorkoutDef,
} from '../data/schema';
import { clearAppData, exportBackup, loadAppData, parseBackup, saveAppData } from '../storage/store';
import { todayISO } from '../lib/date';
import { buildSeedData } from '../data/seed';
import {
  buildSessionFromBlock,
  getChecklistItems,
  getDayPlan,
  getMealsForDate,
  getWaterForDate,
  isLastExercise,
  isNewMetricPR,
  sessionHasProgress,
  type ChecklistItem,
} from './logic';
import { isNewWorkoutPR } from './workouts';
import { recommendComplementary, recoveryNote, type ComplementaryRecommendation } from './recommend';
import type { EvoTabId, TabId } from '../types';

const REST_SECONDS = 45;
const SAVE_DEBOUNCE_MS = 250;

type SetPatch = { reps?: string; load?: string; durationSec?: number | null; note?: string };

interface AppStateValue {
  today: string;
  data: AppData;

  tab: TabId;
  setTab: (tab: TabId) => void;
  evoTab: EvoTabId;
  setEvoTab: (tab: EvoTabId) => void;

  // Today / checklist
  checklist: ChecklistItem[];
  toggleBoxWorkoutDone: (date?: string) => void;

  // Weight
  logWeight: (kg: number, date?: string) => void;
  deleteWeightEntry: (id: string) => void;

  // Water / steps
  addWater: (liters: number, date?: string) => void;
  setSteps: (steps: number, date?: string) => void;

  // Meals
  addMeal: (meal: Omit<Meal, 'id' | 'date' | 'done'> & { date?: string }) => void;
  updateMeal: (id: string, patch: Partial<Omit<Meal, 'id'>>) => void;
  deleteMeal: (id: string) => void;
  toggleMealDone: (id: string) => void;

  // Day plans
  updateDayPlan: (date: string, patch: Partial<Omit<DayPlan, 'date'>>) => void;

  // Metrics (measures / benchmarks) — returns whether the new entry is a PR
  addMetric: (entry: Omit<MetricEntry, 'id'>) => boolean;
  deleteMetric: (id: string) => void;

  // WOD / benchmarks (2.1, 2.4)
  logWorkoutAttempt: (input: {
    date?: string;
    kind: WorkoutAttemptKind;
    workoutDefId: string | null;
    label: string;
    plan: WodPlan;
    result: WodResult;
  }) => { attempt: WorkoutAttempt; isPR: boolean };
  deleteWorkoutAttempt: (id: string) => void;
  addWorkoutDef: (values: Omit<WorkoutDef, 'id' | 'source'>) => WorkoutDef;
  updateWorkoutDef: (id: string, patch: Partial<Omit<WorkoutDef, 'id' | 'source'>>) => void;
  deleteWorkoutDef: (id: string) => void;

  // Progressions (2.5)
  addProgressionDef: (values: { name: string; steps: string[] }) => void;
  updateProgressionDef: (id: string, patch: { name?: string; steps?: string[]; criteria?: string[] }) => void;
  deleteProgressionDef: (id: string) => void;
  advanceProgression: (id: string, note: string) => void;
  regressProgression: (id: string, note: string) => void;

  // Recovery / RPE
  logRecovery: (date: string, patch: Partial<Omit<RecoveryLog, 'date'>>) => void;

  // Recommendation chain (2.6) — computed for today, rule-based
  complementarySuggestion: ComplementaryRecommendation;
  recoverySuggestionNote: string | null;

  // Limitations
  addLimitation: (values: Omit<Limitation, 'id'>) => void;
  updateLimitation: (id: string, patch: { area?: string; note?: string; pct?: number }) => void;
  deleteLimitation: (id: string) => void;

  // Profile / goals / settings
  updateProfile: (patch: Partial<AppData['profile']>) => void;
  updateGoals: (patch: Partial<AppData['goals']>) => void;
  updateSettings: (patch: Partial<AppData['settings']>) => void;

  // Session runtime
  activeSession: SessionLog | null;
  sessionViewOpen: boolean;
  startSession: (blockId: string) => void;
  resumeSession: () => void;
  togglePauseSession: () => void;
  goToExercise: (index: number) => void;
  toggleSetDone: (exIndex: number, setIndex: number) => void;
  updateSet: (exIndex: number, setIndex: number, patch: SetPatch) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  finishSession: () => void;
  saveAndExitSession: () => void;
  abandonSession: () => void;
  sessionHasUnsavedProgress: boolean;

  showDone: boolean;
  lastCompletedBlockName: string | null;
  closeDone: () => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => { ok: boolean; error?: string };
  clearData: (mode: 'empty' | 'demo') => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData().data);
  const [tab, setTab] = useState<TabId>('hoje');
  const [evoTab, setEvoTab] = useState<EvoTabId>('resumo');
  const [showDone, setShowDone] = useState(false);
  const [lastCompletedBlockName, setLastCompletedBlockName] = useState<string | null>(null);
  const [sessionViewOpen, setSessionViewOpen] = useState(false);

  const today = todayISO();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveAppData(data), SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data]);

  // Flush any pending save immediately when the tab is closed/hidden.
  useEffect(() => {
    const flush = () => saveAppData(data);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [data]);

  const update = useCallback((mutator: (d: AppData) => AppData) => {
    setData((prev) => mutator(prev));
  }, []);

  // --- Rest timer for the active session --------------------------------
  useEffect(() => {
    if (restTimer.current) {
      clearInterval(restTimer.current);
      restTimer.current = null;
    }
    const session = dataRef.current?.activeSession;
    if (!session || session.paused || session.restSecondsLeft <= 0) return;
    restTimer.current = setInterval(() => {
      setData((prev) => {
        if (!prev.activeSession || prev.activeSession.paused) return prev;
        const left = prev.activeSession.restSecondsLeft;
        if (left <= 1) {
          return { ...prev, activeSession: { ...prev.activeSession, restSecondsLeft: 0 } };
        }
        return { ...prev, activeSession: { ...prev.activeSession, restSecondsLeft: left - 1 } };
      });
    }, 1000);
    return () => {
      if (restTimer.current) clearInterval(restTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(data.activeSession?.restSecondsLeft ?? 0) > 0, data.activeSession?.paused, data.activeSession?.id]);

  const toggleBoxWorkoutDone = useCallback(
    (date = today) => {
      update((d) => ({ ...d, boxWorkoutDone: { ...d.boxWorkoutDone, [date]: !d.boxWorkoutDone[date] } }));
    },
    [today, update],
  );

  const logWeight = useCallback(
    (kg: number, date = today) => {
      update((d) => {
        const withoutSameDay = d.weightLog.filter((w) => w.date !== date);
        return { ...d, weightLog: [...withoutSameDay, { id: makeId('w'), date, kg }] };
      });
    },
    [today, update],
  );

  const deleteWeightEntry = useCallback(
    (id: string) => {
      update((d) => ({ ...d, weightLog: d.weightLog.filter((w) => w.id !== id) }));
    },
    [update],
  );

  const addWater = useCallback(
    (liters: number, date = today) => {
      update((d) => ({ ...d, water: { ...d.water, [date]: Math.max(0, (d.water[date] ?? 0) + liters) } }));
    },
    [today, update],
  );

  const setSteps = useCallback(
    (steps: number, date = today) => {
      update((d) => ({ ...d, steps: { ...d.steps, [date]: Math.max(0, steps) } }));
    },
    [today, update],
  );

  const addMeal = useCallback(
    (meal: Omit<Meal, 'id' | 'date' | 'done'> & { date?: string }) => {
      update((d) => ({
        ...d,
        meals: [...d.meals, { id: makeId('meal'), done: false, date: meal.date ?? today, ...meal }],
      }));
    },
    [today, update],
  );

  const updateMeal = useCallback(
    (id: string, patch: Partial<Omit<Meal, 'id'>>) => {
      update((d) => ({ ...d, meals: d.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
    },
    [update],
  );

  const deleteMeal = useCallback(
    (id: string) => {
      update((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));
    },
    [update],
  );

  const toggleMealDone = useCallback(
    (id: string) => {
      update((d) => ({ ...d, meals: d.meals.map((m) => (m.id === id ? { ...m, done: !m.done } : m)) }));
    },
    [update],
  );

  const updateDayPlan = useCallback(
    (date: string, patch: Partial<Omit<DayPlan, 'date'>>) => {
      update((d) => ({
        ...d,
        dayPlans: { ...d.dayPlans, [date]: { ...getDayPlan(d, date), ...patch, date } },
      }));
    },
    [update],
  );

  const addMetric = useCallback(
    (entry: Omit<MetricEntry, 'id'>): boolean => {
      const isPR = isNewMetricPR(dataRef.current, entry.category, entry.name, entry.value, entry.direction);
      update((d) => ({ ...d, metrics: [...d.metrics, { ...entry, id: makeId('metric') }] }));
      return isPR;
    },
    [update],
  );

  const deleteMetric = useCallback(
    (id: string) => {
      update((d) => ({ ...d, metrics: d.metrics.filter((m) => m.id !== id) }));
    },
    [update],
  );

  // --- WOD / benchmarks (2.1, 2.4) ---------------------------------------

  const logWorkoutAttempt = useCallback(
    (input: {
      date?: string;
      kind: WorkoutAttemptKind;
      workoutDefId: string | null;
      label: string;
      plan: WodPlan;
      result: WodResult;
    }) => {
      const attempt: WorkoutAttempt = {
        id: makeId('wa'),
        date: input.date ?? today,
        kind: input.kind,
        workoutDefId: input.workoutDefId,
        label: input.label,
        plan: input.plan,
        result: input.result,
      };
      const isPR = isNewWorkoutPR(dataRef.current, attempt);
      update((d) => ({
        ...d,
        workoutAttempts: [...d.workoutAttempts, attempt],
        boxWorkoutDone: input.kind === 'daily' ? { ...d.boxWorkoutDone, [attempt.date]: true } : d.boxWorkoutDone,
      }));
      return { attempt, isPR };
    },
    [today, update],
  );

  const deleteWorkoutAttempt = useCallback(
    (id: string) => {
      update((d) => ({ ...d, workoutAttempts: d.workoutAttempts.filter((a) => a.id !== id) }));
    },
    [update],
  );

  const addWorkoutDef = useCallback((values: Omit<WorkoutDef, 'id' | 'source'>): WorkoutDef => {
    const def: WorkoutDef = { ...values, id: makeId('wdef'), source: 'user' };
    update((d) => ({ ...d, workoutDefs: [...d.workoutDefs, def] }));
    return def;
  }, [update]);

  const updateWorkoutDef = useCallback(
    (id: string, patch: Partial<Omit<WorkoutDef, 'id' | 'source'>>) => {
      update((d) => ({ ...d, workoutDefs: d.workoutDefs.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
    },
    [update],
  );

  const deleteWorkoutDef = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        workoutDefs: d.workoutDefs.filter((w) => w.id !== id),
        workoutAttempts: d.workoutAttempts.map((a) => (a.workoutDefId === id ? { ...a, workoutDefId: null } : a)),
      }));
    },
    [update],
  );

  // --- Progressions (2.5) -------------------------------------------------

  const addProgressionDef = useCallback(
    (values: { name: string; steps: string[] }) => {
      const def: ProgressionDef = { id: makeId('pdef'), name: values.name, steps: values.steps, criteria: [], source: 'user' };
      update((d) => ({
        ...d,
        progressionDefs: [...d.progressionDefs, def],
        progressions: [...d.progressions, { id: def.id, currentIndex: 0, history: [] }],
      }));
    },
    [update],
  );

  const updateProgressionDef = useCallback(
    (id: string, patch: { name?: string; steps?: string[]; criteria?: string[] }) => {
      update((d) => ({
        ...d,
        progressionDefs: d.progressionDefs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        progressions: d.progressions.map((p) =>
          p.id === id && patch.steps ? { ...p, currentIndex: Math.min(p.currentIndex, patch.steps.length - 1) } : p,
        ),
      }));
    },
    [update],
  );

  const deleteProgressionDef = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        progressionDefs: d.progressionDefs.filter((p) => p.id !== id),
        progressions: d.progressions.filter((p) => p.id !== id),
      }));
    },
    [update],
  );

  const advanceProgression = useCallback(
    (id: string, note: string) => {
      update((d) => {
        const def = d.progressionDefs.find((p) => p.id === id);
        const state = d.progressions.find((p) => p.id === id);
        if (!def || !state) return d;
        const nextIndex = Math.min(state.currentIndex + 1, def.steps.length - 1);
        if (nextIndex === state.currentIndex) return d;
        const event = { id: makeId('pevt'), date: today, toIndex: nextIndex, direction: 'advance' as const, note };
        return {
          ...d,
          progressions: d.progressions.map((p) =>
            p.id === id ? { ...p, currentIndex: nextIndex, history: [...p.history, event] } : p,
          ),
        };
      });
    },
    [today, update],
  );

  const regressProgression = useCallback(
    (id: string, note: string) => {
      update((d) => {
        const state = d.progressions.find((p) => p.id === id);
        if (!state) return d;
        const nextIndex = Math.max(state.currentIndex - 1, 0);
        if (nextIndex === state.currentIndex) return d;
        const event = { id: makeId('pevt'), date: today, toIndex: nextIndex, direction: 'regress' as const, note };
        return {
          ...d,
          progressions: d.progressions.map((p) =>
            p.id === id ? { ...p, currentIndex: nextIndex, history: [...p.history, event] } : p,
          ),
        };
      });
    },
    [today, update],
  );

  // --- Recovery / RPE -------------------------------------------------

  const logRecovery = useCallback(
    (date: string, patch: Partial<Omit<RecoveryLog, 'date'>>) => {
      update((d) => {
        const existing = d.recoveryLogs[date] ?? { date, rpe: null, energy: null, soreness: null, notes: '' };
        return { ...d, recoveryLogs: { ...d.recoveryLogs, [date]: { ...existing, ...patch } } };
      });
    },
    [update],
  );

  const addLimitation = useCallback(
    (values: Omit<Limitation, 'id'>) => {
      update((d) => ({ ...d, limitations: [...d.limitations, { ...values, id: makeId('lim') }] }));
    },
    [update],
  );

  const updateLimitation = useCallback(
    (id: string, patch: { area?: string; note?: string; pct?: number }) => {
      update((d) => ({ ...d, limitations: d.limitations.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    },
    [update],
  );

  const deleteLimitation = useCallback(
    (id: string) => {
      update((d) => ({ ...d, limitations: d.limitations.filter((l) => l.id !== id) }));
    },
    [update],
  );

  const updateProfile = useCallback(
    (patch: Partial<AppData['profile']>) => {
      update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
    },
    [update],
  );

  const updateGoals = useCallback(
    (patch: Partial<AppData['goals']>) => {
      update((d) => ({ ...d, goals: { ...d.goals, ...patch } }));
    },
    [update],
  );

  const updateSettings = useCallback(
    (patch: Partial<AppData['settings']>) => {
      update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
    },
    [update],
  );

  // --- Session runtime ----------------------------------------------------

  const startSession = useCallback(
    (blockId: string) => {
      update((d) => {
        // Resume in place if there's already an in-progress session for this
        // block today — starting fresh here would silently discard progress.
        if (d.activeSession && d.activeSession.blockId === blockId && d.activeSession.date === today) {
          return d;
        }
        const session = buildSessionFromBlock(blockId, today);
        if (!session) return d;
        return { ...d, activeSession: session };
      });
      setSessionViewOpen(true);
    },
    [today, update],
  );

  const resumeSession = useCallback(() => {
    setSessionViewOpen(true);
  }, []);

  const togglePauseSession = useCallback(() => {
    update((d) => (d.activeSession ? { ...d, activeSession: { ...d.activeSession, paused: !d.activeSession.paused } } : d));
  }, [update]);

  const goToExercise = useCallback(
    (index: number) => {
      update((d) => {
        if (!d.activeSession) return d;
        const clamped = Math.max(0, Math.min(index, d.activeSession.exercises.length - 1));
        return { ...d, activeSession: { ...d.activeSession, currentExerciseIndex: clamped, restSecondsLeft: 0 } };
      });
    },
    [update],
  );

  const nextExercise = useCallback(() => {
    update((d) => {
      if (!d.activeSession) return d;
      const idx = Math.min(d.activeSession.currentExerciseIndex + 1, d.activeSession.exercises.length - 1);
      return { ...d, activeSession: { ...d.activeSession, currentExerciseIndex: idx, restSecondsLeft: 0 } };
    });
  }, [update]);

  const prevExercise = useCallback(() => {
    update((d) => {
      if (!d.activeSession) return d;
      const idx = Math.max(d.activeSession.currentExerciseIndex - 1, 0);
      return { ...d, activeSession: { ...d.activeSession, currentExerciseIndex: idx, restSecondsLeft: 0 } };
    });
  }, [update]);

  const updateSet = useCallback(
    (exIndex: number, setIndex: number, patch: SetPatch) => {
      update((d) => {
        if (!d.activeSession) return d;
        const exercises = d.activeSession.exercises.map((ex, i) => {
          if (i !== exIndex) return ex;
          const sets = ex.sets.map((s, j) => (j === setIndex ? { ...s, ...patch } : s));
          return { ...ex, sets };
        });
        return { ...d, activeSession: { ...d.activeSession, exercises } };
      });
    },
    [update],
  );

  const toggleSetDone = useCallback(
    (exIndex: number, setIndex: number) => {
      update((d) => {
        if (!d.activeSession) return d;
        const exercises = d.activeSession.exercises.map((ex, i) => {
          if (i !== exIndex) return ex;
          const sets = ex.sets.map((s, j) => (j === setIndex ? { ...s, done: !s.done } : s));
          return { ...ex, sets };
        });
        const justCompleted = !d.activeSession.exercises[exIndex].sets[setIndex].done;
        return {
          ...d,
          activeSession: {
            ...d.activeSession,
            exercises,
            restSecondsLeft: justCompleted ? REST_SECONDS : d.activeSession.restSecondsLeft,
          },
        };
      });
    },
    [update],
  );

  const finishSession = useCallback(() => {
    update((d) => {
      if (!d.activeSession) return d;
      const last = isLastExercise(d.activeSession);
      if (!last) {
        const idx = d.activeSession.currentExerciseIndex + 1;
        return { ...d, activeSession: { ...d.activeSession, currentExerciseIndex: idx, restSecondsLeft: 0 } };
      }
      const completed: SessionLog = {
        ...d.activeSession,
        status: 'completed',
        endedAt: new Date().toISOString(),
        restSecondsLeft: 0,
      };
      setShowDone(true);
      setSessionViewOpen(false);
      setLastCompletedBlockName(completed.blockName);
      return { ...d, sessions: [...d.sessions, completed], activeSession: null };
    });
  }, [update]);

  const saveAndExitSession = useCallback(() => {
    // activeSession is already persisted continuously; exiting just closes the overlay.
    setSessionViewOpen(false);
    setTab('hoje');
  }, []);

  const abandonSession = useCallback(() => {
    update((d) => {
      if (!d.activeSession) return d;
      const abandoned: SessionLog = { ...d.activeSession, status: 'abandoned', endedAt: new Date().toISOString() };
      return { ...d, sessions: [...d.sessions, abandoned], activeSession: null };
    });
    setSessionViewOpen(false);
  }, [update]);

  const closeDone = useCallback(() => {
    setShowDone(false);
    setLastCompletedBlockName(null);
    setTab('hoje');
  }, []);

  // --- Data management ------------------------------------------------

  const exportData = useCallback(() => exportBackup(data), [data]);

  const importData = useCallback(
    (json: string) => {
      const result = parseBackup(json);
      if (!result.ok || !result.data) return { ok: false, error: result.error };
      setData(result.data);
      saveAppData(result.data);
      return { ok: true };
    },
    [],
  );

  const clearData = useCallback((mode: 'empty' | 'demo') => {
    clearAppData();
    if (mode === 'demo') {
      const fresh = buildSeedData();
      setData(fresh);
      saveAppData(fresh);
    } else {
      const seed = buildSeedData();
      const empty: AppData = {
        ...seed,
        dayPlans: {},
        boxWorkoutDone: {},
        meals: [],
        water: {},
        steps: {},
        weightLog: [],
        metrics: [],
        sessions: [],
        activeSession: null,
        limitations: [],
        workoutAttempts: [],
        progressions: seed.progressionDefs.map((def) => ({ id: def.id, currentIndex: 0, history: [] })),
        recoveryLogs: {},
      };
      setData(empty);
      saveAppData(empty);
    }
  }, []);

  const checklist = useMemo(() => getChecklistItems(data, today), [data, today]);
  const sessionHasUnsavedProgress = useMemo(
    () => (data.activeSession ? sessionHasProgress(data.activeSession) : false),
    [data.activeSession],
  );
  const complementarySuggestion = useMemo(() => recommendComplementary(data, today), [data, today]);
  const recoverySuggestionNote = useMemo(() => recoveryNote(data, today), [data, today]);

  const value: AppStateValue = {
    today,
    data,
    tab,
    setTab,
    evoTab,
    setEvoTab,
    checklist,
    toggleBoxWorkoutDone,
    logWeight,
    deleteWeightEntry,
    addWater,
    setSteps,
    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealDone,
    updateDayPlan,
    addMetric,
    deleteMetric,
    logWorkoutAttempt,
    deleteWorkoutAttempt,
    addWorkoutDef,
    updateWorkoutDef,
    deleteWorkoutDef,
    addProgressionDef,
    updateProgressionDef,
    deleteProgressionDef,
    advanceProgression,
    regressProgression,
    logRecovery,
    complementarySuggestion,
    recoverySuggestionNote,
    addLimitation,
    updateLimitation,
    deleteLimitation,
    updateProfile,
    updateGoals,
    updateSettings,
    activeSession: data.activeSession,
    sessionViewOpen,
    startSession,
    resumeSession,
    togglePauseSession,
    goToExercise,
    toggleSetDone,
    updateSet,
    nextExercise,
    prevExercise,
    finishSession,
    saveAndExitSession,
    abandonSession,
    sessionHasUnsavedProgress,
    showDone,
    lastCompletedBlockName,
    closeDone,
    exportData,
    importData,
    clearData,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function useTodayMeals() {
  const { data, today } = useAppState();
  return useMemo(() => getMealsForDate(data, today), [data, today]);
}

export function useTodayWater() {
  const { data, today } = useAppState();
  return useMemo(() => getWaterForDate(data, today), [data, today]);
}

export function useTodayPlan() {
  const { data, today } = useAppState();
  return useMemo(() => getDayPlan(data, today), [data, today]);
}

export function useBlockCatalog(blockId: string) {
  return getBlock(blockId);
}
