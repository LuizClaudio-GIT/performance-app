import { getBlock } from '../data/catalog';
import { addDays, isFutureDate, isPastDate, isToday, todayISO } from '../lib/date';
import { makeId } from '../data/schema';
import type {
  AppData,
  DayPlan,
  ExerciseLog,
  Meal,
  MetricDirection,
  MetricEntry,
  ProgressionDef,
  SessionLog,
  SetLog,
} from '../data/schema';

export function defaultDayPlan(date: string): DayPlan {
  return {
    date,
    type: 'treino',
    boxLabel: 'CrossFit',
    boxWorkoutTitle: '',
    boxWorkoutBody: '',
    wodPlan: null,
    complementaryBlockIds: [],
    note: '',
  };
}

export function getDayPlan(data: AppData, date: string): DayPlan {
  return data.dayPlans[date] ?? defaultDayPlan(date);
}

export function getMealsForDate(data: AppData, date: string): Meal[] {
  return data.meals.filter((m) => m.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

export function getWaterForDate(data: AppData, date: string): number {
  return data.water[date] ?? 0;
}

export function getStepsForDate(data: AppData, date: string): number {
  return data.steps[date] ?? 0;
}

export function dailyKcal(meals: Meal[]): number {
  return meals.filter((m) => m.done).reduce((sum, m) => sum + m.kcal, 0);
}

export function dailyProtein(meals: Meal[]): number {
  return meals.filter((m) => m.done).reduce((sum, m) => sum + m.protein, 0);
}

export interface ChecklistItem {
  id: string;
  label: string;
  value: string;
  done: boolean;
}

/** The daily checklist is derived from real state, not a separately-toggled list. */
export function getChecklistItems(data: AppData, date: string): ChecklistItem[] {
  const plan = getDayPlan(data, date);
  const items: ChecklistItem[] = [];

  if (plan.type === 'treino') {
    items.push({
      id: 'box',
      label: 'Treino do box',
      value: plan.boxLabel || 'CrossFit',
      done: !!data.boxWorkoutDone[date],
    });
  }

  for (const blockId of plan.complementaryBlockIds) {
    const block = getBlock(blockId);
    if (!block) continue;
    const done = data.sessions.some((s) => s.blockId === blockId && s.date === date && s.status === 'completed');
    items.push({ id: `block-${blockId}`, label: block.name, value: block.meta, done });
  }

  const water = getWaterForDate(data, date);
  items.push({
    id: 'water',
    label: 'Bater meta de água',
    value: `${water.toFixed(1).replace('.', ',')} / ${data.goals.waterGoalL.toFixed(1).replace('.', ',')} L`,
    done: water >= data.goals.waterGoalL,
  });

  const meals = getMealsForDate(data, date);
  const kcal = dailyKcal(meals);
  const kcalPct = data.goals.kcalGoal > 0 ? Math.round((kcal / data.goals.kcalGoal) * 100) : 0;
  items.push({
    id: 'food',
    label: 'Seguir alimentação',
    value: `${kcalPct}%`,
    done: kcal >= data.goals.kcalGoal * 0.9,
  });

  items.push({
    id: 'weight',
    label: 'Registrar peso',
    value: data.weightLog.find((w) => w.date === date)?.kg.toFixed(1).replace('.', ',') ?? '—',
    done: data.weightLog.some((w) => w.date === date),
  });

  return items;
}

export type WeekDayStatus = 'CONCLUÍDO' | 'HOJE' | 'PLANEJADO' | 'LEVE' | 'DESCANSO';

export function weekDayStatus(data: AppData, date: string): WeekDayStatus {
  // "today" always wins the label, even on a rest/light day — the day's
  // type is still conveyed by the row content, not by the status badge.
  if (isToday(date)) return 'HOJE';
  const plan = getDayPlan(data, date);
  if (plan.type === 'descanso') return 'DESCANSO';
  if (plan.type === 'leve') return 'LEVE';
  if (isFutureDate(date)) return 'PLANEJADO';
  // past training day
  const items = getChecklistItems(data, date);
  const trainingItems = items.filter((i) => i.id === 'box' || i.id.startsWith('block-'));
  const allDone = trainingItems.length > 0 && trainingItems.every((i) => i.done);
  return allDone ? 'CONCLUÍDO' : 'PLANEJADO';
}

export function weeklyComplementaryVolume(data: AppData, dates: string[]): { done: number; planned: number; pct: number } {
  let planned = 0;
  let done = 0;
  for (const date of dates) {
    if (isFutureDate(date)) continue;
    const plan = getDayPlan(data, date);
    for (const blockId of plan.complementaryBlockIds) {
      planned++;
      if (data.sessions.some((s) => s.blockId === blockId && s.date === date && s.status === 'completed')) {
        done++;
      }
    }
  }
  return { done, planned, pct: planned > 0 ? Math.round((done / planned) * 100) : 0 };
}

// --- Metrics / PR (2.3) --------------------------------------------------

export interface MetricSeries {
  name: string;
  unit: string;
  direction: MetricDirection;
  base: MetricEntry;
  latest: MetricEntry;
  /** True historical best, respecting direction — NOT just the latest value. */
  best: MetricEntry;
  delta: number; // latest - base, kept for the existing sparkline "since you started" framing
  points: number[]; // normalized 0..1 for sparkline, chronological
  /** Every entry, chronological, each flagged with whether it was a new record at the time. */
  history: Array<MetricEntry & { isPR: boolean }>;
}

function isBetterValue(direction: MetricDirection, a: number, b: number): boolean {
  return direction === 'higher-better' ? a > b : a < b;
}

export function metricSeriesByName(data: AppData, category: MetricEntry['category']): MetricSeries[] {
  const byName = new Map<string, MetricEntry[]>();
  for (const m of data.metrics) {
    if (m.category !== category) continue;
    const list = byName.get(m.name) ?? [];
    list.push(m);
    byName.set(m.name, list);
  }
  const out: MetricSeries[] = [];
  for (const [name, entriesUnsorted] of byName) {
    const entries = [...entriesUnsorted].sort((a, b) => a.date.localeCompare(b.date));
    if (entries.length === 0) continue;
    const direction = entries[entries.length - 1].direction;
    const base = entries[0];
    const latest = entries[entries.length - 1];
    const values = entries.map((e) => e.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    let best = entries[0];
    const history: Array<MetricEntry & { isPR: boolean }> = [];
    for (const e of entries) {
      const isPR = e.id === entries[0].id || isBetterValue(direction, e.value, best.value);
      if (isPR) best = e;
      history.push({ ...e, isPR });
    }

    out.push({
      name,
      unit: latest.unit,
      direction,
      base,
      latest,
      best,
      delta: latest.value - base.value,
      points: values.map((v) => (v - min) / range),
      history,
    });
  }
  return out;
}

/** Whether `value` would be a new PR for `name`/`category`, given what's already logged (excludes nothing — call before adding the new entry). */
export function isNewMetricPR(data: AppData, category: MetricEntry['category'], name: string, value: number, direction: MetricDirection): boolean {
  const existing = data.metrics.filter((m) => m.category === category && m.name === name);
  if (existing.length === 0) return true;
  const best = existing.reduce((b, e) => (isBetterValue(direction, e.value, b.value) ? e : b));
  return isBetterValue(direction, value, best.value);
}

export function weightSeries(data: AppData) {
  const entries = [...data.weightLog].sort((a, b) => a.date.localeCompare(b.date));
  return entries;
}

// --- Session runtime -------------------------------------------------

export function buildSessionFromBlock(blockId: string, date: string): SessionLog | null {
  const block = getBlock(blockId);
  if (!block) return null;
  const exercises: ExerciseLog[] = block.ex.map((ex) => {
    const total = parseInt(ex.sets, 10) || 1;
    const sets: SetLog[] = Array.from({ length: total }, (_, i) => ({
      index: i,
      reps: ex.reps,
      load: '',
      durationSec: null,
      note: '',
      done: false,
    }));
    return { name: ex.name, sets };
  });
  return {
    id: makeId('session'),
    blockId,
    blockName: block.name,
    date,
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: 'in-progress',
    currentExerciseIndex: 0,
    restSecondsLeft: 0,
    paused: false,
    exercises,
  };
}

export function sessionHasProgress(session: SessionLog): boolean {
  return session.exercises.some((ex) => ex.sets.some((s) => s.done || s.load || s.note || s.durationSec));
}

export function isLastExercise(session: SessionLog): boolean {
  return session.currentExerciseIndex >= session.exercises.length - 1;
}

export function nextIncompleteBlockId(data: AppData, date: string, blockIds: string[]): string | null {
  for (const id of blockIds) {
    const done = data.sessions.some((s) => s.blockId === id && s.date === date && s.status === 'completed');
    if (!done) return id;
  }
  return null;
}

export function isPastOrToday(date: string): boolean {
  return !isFutureDate(date) || isToday(date);
}

function hasAnyActivity(data: AppData, date: string): boolean {
  if (data.boxWorkoutDone[date]) return true;
  return data.sessions.some((s) => s.date === date && s.status === 'completed');
}

/** Consecutive days (ending today or yesterday) with at least one completed activity. */
export function computeStreakDays(data: AppData): number {
  let count = 0;
  let cursor = todayISO();
  // allow today to be "in progress" without breaking the streak
  if (!hasAnyActivity(data, cursor)) {
    cursor = addDays(cursor, -1);
  }
  while (hasAnyActivity(data, cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

// --- Evolução baseada nos treinos (2.2) -----------------------------------
// SetLogs from completed/abandoned sessions turned into real series. Every
// function here skips (never fabricates) a data point it can't parse.

function parseLeadingNumber(text: string): number | null {
  if (!text) return null;
  const normalized = text.replace(',', '.');
  const match = normalized.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export interface ExerciseHistoryEntry {
  date: string;
  sessionId: string;
  blockId: string;
  sets: SetLog[];
}

export function exerciseNamesInHistory(data: AppData): string[] {
  const names = new Set<string>();
  for (const s of data.sessions) {
    if (s.status === 'in-progress') continue;
    for (const ex of s.exercises) names.add(ex.name);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function exerciseHistory(data: AppData, exerciseName: string): ExerciseHistoryEntry[] {
  const out: ExerciseHistoryEntry[] = [];
  for (const s of data.sessions) {
    if (s.status === 'in-progress') continue;
    for (const ex of s.exercises) {
      if (ex.name !== exerciseName) continue;
      out.push({ date: s.date, sessionId: s.id, blockId: s.blockId, sets: ex.sets });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export interface ExercisePoint {
  date: string;
  value: number;
}

/** Highest parseable load logged per session. Sessions with no parseable load are skipped, not zeroed. */
export function exerciseBestLoadSeries(data: AppData, exerciseName: string): ExercisePoint[] {
  const out: ExercisePoint[] = [];
  for (const entry of exerciseHistory(data, exerciseName)) {
    const loads = entry.sets.map((s) => parseLeadingNumber(s.load)).filter((n): n is number => n != null);
    if (loads.length === 0) continue;
    out.push({ date: entry.date, value: Math.max(...loads) });
  }
  return out;
}

export function exerciseTotalRepsSeries(data: AppData, exerciseName: string): ExercisePoint[] {
  const out: ExercisePoint[] = [];
  for (const entry of exerciseHistory(data, exerciseName)) {
    const reps = entry.sets.map((s) => parseLeadingNumber(s.reps)).filter((n): n is number => n != null);
    if (reps.length === 0) continue;
    out.push({ date: entry.date, value: reps.reduce((a, b) => a + b, 0) });
  }
  return out;
}

/** reps x load per set, summed per session — only counts sets where BOTH are numeric; never assumes a missing dimension. */
export function exerciseVolumeSeries(data: AppData, exerciseName: string): ExercisePoint[] {
  const out: ExercisePoint[] = [];
  for (const entry of exerciseHistory(data, exerciseName)) {
    let volume = 0;
    let any = false;
    for (const s of entry.sets) {
      const reps = parseLeadingNumber(s.reps);
      const load = parseLeadingNumber(s.load);
      if (reps == null || load == null) continue;
      volume += reps * load;
      any = true;
    }
    if (any) out.push({ date: entry.date, value: volume });
  }
  return out;
}

export function exerciseDurationSeries(data: AppData, exerciseName: string): ExercisePoint[] {
  const out: ExercisePoint[] = [];
  for (const entry of exerciseHistory(data, exerciseName)) {
    const durations = entry.sets.map((s) => s.durationSec).filter((n): n is number => n != null);
    if (durations.length === 0) continue;
    out.push({ date: entry.date, value: Math.max(...durations) });
  }
  return out;
}

export function bestPoint(points: ExercisePoint[]): ExercisePoint | null {
  if (points.length === 0) return null;
  return points.reduce((best, p) => (p.value > best.value ? p : best));
}

export function blockSessionDates(data: AppData, blockId: string): string[] {
  return data.sessions
    .filter((s) => s.blockId === blockId && s.status === 'completed')
    .map((s) => s.date)
    .sort();
}

// --- Progressions (2.5) ---------------------------------------------------

export function findProgressionDef(data: AppData, id: string): ProgressionDef | undefined {
  return data.progressionDefs.find((p) => p.id === id);
}

export { isPastDate };
