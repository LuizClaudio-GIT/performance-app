import type { AppData, WodFormat, WodResult, WorkoutAttempt, WorkoutDef } from '../data/schema';

const TIME_BASED_FORMATS: WodFormat[] = ['for-time', 'rounds-reps', 'chipper'];

/**
 * Result comparator (2.3 applied to whole-WOD results, not just single
 * metrics): >0 if `a` beats `b`, <0 if `a` is worse, 0 if not comparable.
 * Direction is resolved from the WOD's format, not guessed per value:
 * time-based formats are lower-is-better once someone finishes; amrap/emom
 * are higher-is-better (rounds, then reps).
 */
export function compareWodResult(format: WodFormat, a: WodResult, b: WodResult): number {
  if (TIME_BASED_FORMATS.includes(format)) {
    if (a.timeSec != null && b.timeSec != null) return b.timeSec - a.timeSec;
    if (a.timeSec != null && b.timeSec == null) return 1; // finishing beats not finishing
    if (a.timeSec == null && b.timeSec != null) return -1;
    const aProg = (a.rounds ?? 0) * 1_000_000 + (a.extraReps ?? a.totalReps ?? 0);
    const bProg = (b.rounds ?? 0) * 1_000_000 + (b.extraReps ?? b.totalReps ?? 0);
    if (aProg !== bProg) return aProg - bProg;
    return 0;
  }
  if (format === 'amrap' || format === 'emom') {
    const aProg = (a.rounds ?? 0) * 1_000_000 + (a.extraReps ?? 0);
    const bProg = (b.rounds ?? 0) * 1_000_000 + (b.extraReps ?? 0);
    if (aProg !== bProg) return aProg - bProg;
    if (a.totalReps != null && b.totalReps != null) return a.totalReps - b.totalReps;
    if (a.loadKg != null && b.loadKg != null) return a.loadKg - b.loadKg;
    return 0;
  }
  // 'other' — best-effort in priority order; returns 0 (not comparable) if neither side has any shared dimension.
  if (a.timeSec != null && b.timeSec != null) return b.timeSec - a.timeSec;
  if (a.totalReps != null && b.totalReps != null) return a.totalReps - b.totalReps;
  if (a.loadKg != null && b.loadKg != null) return a.loadKg - b.loadKg;
  return 0;
}

export function bestWorkoutAttempt(attempts: WorkoutAttempt[]): WorkoutAttempt | null {
  if (attempts.length === 0) return null;
  return attempts.reduce((best, cur) => (compareWodResult(cur.result.format, cur.result, best.result) > 0 ? cur : best));
}

/**
 * The "headline" record for a workout: RX and Scaled are different difficulty
 * levels, not points on the same performance axis, so a fast Scaled time must
 * never outrank a slower RX one. Prefers the best RX attempt when any exists;
 * falls back to the best Scaled/Other attempt only when there's no RX history.
 */
export function bestDisplayAttempt(attempts: WorkoutAttempt[]): WorkoutAttempt | null {
  const rx = attempts.filter((a) => a.result.scale === 'rx');
  if (rx.length > 0) return bestWorkoutAttempt(rx);
  return bestWorkoutAttempt(attempts);
}

export function attemptsForWorkoutDef(data: AppData, workoutDefId: string): WorkoutAttempt[] {
  return data.workoutAttempts.filter((a) => a.workoutDefId === workoutDefId).sort((a, b) => b.date.localeCompare(a.date));
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

export function attemptsForLabel(data: AppData, label: string): WorkoutAttempt[] {
  const norm = normalizeLabel(label);
  if (!norm) return [];
  return data.workoutAttempts.filter((a) => normalizeLabel(a.label) === norm).sort((a, b) => b.date.localeCompare(a.date));
}

/** Prior attempts of the same workout (by def id when linked, else by label), most recent first, excluding the attempt itself. */
export function priorAttempts(data: AppData, attempt: Pick<WorkoutAttempt, 'id' | 'workoutDefId' | 'label'>): WorkoutAttempt[] {
  const pool = attempt.workoutDefId ? attemptsForWorkoutDef(data, attempt.workoutDefId) : attemptsForLabel(data, attempt.label);
  return pool.filter((a) => a.id !== attempt.id);
}

export function lastAttemptBefore(data: AppData, attempt: Pick<WorkoutAttempt, 'id' | 'workoutDefId' | 'label'>): WorkoutAttempt | null {
  const prior = priorAttempts(data, attempt);
  return prior[0] ?? null;
}

export function isNewWorkoutPR(data: AppData, attempt: WorkoutAttempt): boolean {
  // RX and Scaled are separate categories — a Scaled attempt can only be a PR
  // against prior Scaled attempts, never against an RX best (and vice versa).
  const prior = priorAttempts(data, attempt).filter((a) => a.result.scale === attempt.result.scale);
  const best = bestWorkoutAttempt(prior);
  if (!best) return true;
  return compareWodResult(attempt.result.format, attempt.result, best.result) > 0;
}

export function getWorkoutDef(data: AppData, id: string): WorkoutDef | undefined {
  return data.workoutDefs.find((w) => w.id === id);
}

export function formatWodResultShort(result: WodResult): string {
  const parts: string[] = [];
  if (result.timeSec != null) {
    const m = Math.floor(result.timeSec / 60);
    const s = result.timeSec % 60;
    parts.push(`${m}:${String(s).padStart(2, '0')}`);
  }
  if (result.rounds != null) parts.push(`${result.rounds} rounds${result.extraReps ? ` +${result.extraReps}` : ''}`);
  if (result.totalReps != null && result.rounds == null) parts.push(`${result.totalReps} reps`);
  if (result.loadKg != null) parts.push(`${result.loadKg} kg`);
  if (result.calories != null) parts.push(`${result.calories} cal`);
  if (parts.length === 0) return '—';
  return `${parts.join(' · ')} (${result.scale.toUpperCase()})`;
}

export function parseTimeToSeconds(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (match) {
    const min = Number(match[1]);
    const sec = Number(match[2]);
    if (!Number.isFinite(min) || !Number.isFinite(sec) || sec >= 60) return null;
    return min * 60 + sec;
  }
  const n = Number(trimmed.replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function formatSecondsToClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
