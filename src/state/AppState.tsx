import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BLOCKS,
  CHECKLIST_DEFAULT_DONE,
  MEALS_DEFAULT_DONE,
  WATER_DEFAULT,
  WATER_GOAL,
  WATER_STEP,
} from '../data/mockData';
import type { BlockId, EvoTabId, TabId } from '../types';

const REST_SECONDS = 45;

interface AppStateValue {
  tab: TabId;
  setTab: (tab: TabId) => void;
  evoTab: EvoTabId;
  setEvoTab: (tab: EvoTabId) => void;

  checks: Record<string, boolean>;
  toggleCheck: (id: string) => void;
  checkDoneCount: number;

  mealsDone: Record<string, boolean>;
  toggleMeal: (id: string) => void;

  water: number;
  addWater: () => void;

  blockDone: Record<BlockId, boolean>;

  sessionBlockId: BlockId | null;
  exIdx: number;
  setsDone: Record<string, number>;
  rest: number;
  showDone: boolean;
  startSession: (blockId: BlockId) => void;
  exitSession: () => void;
  toggleSet: (setIndex: number) => void;
  nextExercise: () => void;
  closeDone: () => void;

  nextBlockId: BlockId | null;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>('hoje');
  const [evoTab, setEvoTab] = useState<EvoTabId>('resumo');
  const [checks, setChecks] = useState<Record<string, boolean>>(CHECKLIST_DEFAULT_DONE);
  const [mealsDone, setMealsDone] = useState<Record<string, boolean>>(MEALS_DEFAULT_DONE);
  const [water, setWater] = useState(WATER_DEFAULT);
  const [blockDone, setBlockDone] = useState<Record<BlockId, boolean>>({ mob: false, gin: false, core: false });

  const [sessionBlockId, setSessionBlockId] = useState<BlockId | null>(null);
  const [exIdx, setExIdx] = useState(0);
  const [setsDone, setSetsDone] = useState<Record<string, number>>({});
  const [rest, setRest] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startRest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRest(REST_SECONDS);
    timerRef.current = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleMeal = useCallback((id: string) => {
    setMealsDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addWater = useCallback(() => {
    setWater((w) => Math.min(WATER_GOAL, Math.round((w + WATER_STEP) * 100) / 100));
  }, []);

  const startSession = useCallback((blockId: BlockId) => {
    setSessionBlockId(blockId);
    setExIdx(0);
    setSetsDone({});
    setRest(0);
  }, []);

  const exitSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSessionBlockId(null);
    setRest(0);
  }, []);

  const block = sessionBlockId ? BLOCKS.find((b) => b.id === sessionBlockId) ?? null : null;

  const toggleSet = useCallback(
    (setIndex: number) => {
      if (!block) return;
      const key = `${block.id}-${exIdx}`;
      setSetsDone((prev) => {
        const done = prev[key] || 0;
        const nd = setIndex < done ? setIndex : setIndex + 1;
        if (nd > done) startRest();
        return { ...prev, [key]: nd };
      });
    },
    [block, exIdx, startRest],
  );

  const nextExercise = useCallback(() => {
    if (!block) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const isLast = exIdx >= block.ex.length - 1;
    if (isLast) {
      setBlockDone((prev) => ({ ...prev, [block.id]: true }));
      setSessionBlockId(null);
      setRest(0);
      setShowDone(true);
    } else {
      setExIdx((i) => i + 1);
      setRest(0);
    }
  }, [block, exIdx]);

  const closeDone = useCallback(() => {
    setShowDone(false);
    setTab('hoje');
  }, []);

  const checkDoneCount = useMemo(() => Object.values(checks).filter(Boolean).length, [checks]);

  const nextBlockId = useMemo<BlockId | null>(() => {
    const found = BLOCKS.find((b) => !blockDone[b.id]);
    return found ? found.id : null;
  }, [blockDone]);

  const value: AppStateValue = {
    tab,
    setTab,
    evoTab,
    setEvoTab,
    checks,
    toggleCheck,
    checkDoneCount,
    mealsDone,
    toggleMeal,
    water,
    addWater,
    blockDone,
    sessionBlockId,
    exIdx,
    setsDone,
    rest,
    showDone,
    startSession,
    exitSession,
    toggleSet,
    nextExercise,
    closeDone,
    nextBlockId,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
