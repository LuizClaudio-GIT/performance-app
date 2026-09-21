export const SCHEMA_VERSION = 2;

export interface Profile {
  name: string;
  box: string;
  phase: string;
  weekLabel: string;
}

export interface Goals {
  kcalGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  waterGoalL: number;
  stepsGoal: number;
}

export type DayType = 'treino' | 'leve' | 'descanso';

// --- WOD (2.1) ---------------------------------------------------------

export type WodFormat = 'amrap' | 'emom' | 'for-time' | 'rounds-reps' | 'chipper' | 'other';

export const WOD_FORMAT_LABEL: Record<WodFormat, string> = {
  amrap: 'AMRAP',
  emom: 'EMOM',
  'for-time': 'For Time',
  'rounds-reps': 'Rounds + reps',
  chipper: 'Chipper',
  other: 'Outro',
};

/** One movement inside a WOD's plan — free-text reps/load so any format/notation fits. */
export interface WodMovement {
  id: string;
  name: string;
  reps: string;
  load: string;
}

/** What was prescribed, before the attempt. */
export interface WodPlan {
  format: WodFormat;
  timeCapSec: number | null;
  scheme: string; // e.g. "21-15-9", "3 rounds", free text
  movements: WodMovement[];
}

export function emptyWodPlan(): WodPlan {
  return { format: 'for-time', timeCapSec: null, scheme: '', movements: [] };
}

export type ResultScale = 'rx' | 'scaled' | 'other';

/** What actually happened — the result of an attempt. Fields are format-dependent; unused ones stay null. */
export interface WodResult {
  format: WodFormat;
  timeSec: number | null; // for-time / chipper / rounds-reps finish time
  rounds: number | null; // amrap / emom completed rounds
  extraReps: number | null; // amrap partial-round reps beyond the last full round
  totalReps: number | null; // reps-only formats
  loadKg: number | null; // load-based results
  calories: number | null;
  scale: ResultScale;
  rpe: number | null; // 1-10, perceived effort of this attempt
  notes: string;
}

export function emptyWodResult(format: WodFormat = 'for-time'): WodResult {
  return {
    format,
    timeSec: null,
    rounds: null,
    extraReps: null,
    totalReps: null,
    loadKg: null,
    calories: null,
    scale: 'rx',
    rpe: null,
    notes: '',
  };
}

export type WorkoutAttemptKind = 'daily' | 'benchmark';

/** A logged attempt at a workout — either the day's box WOD or a deliberate benchmark attempt. */
export interface WorkoutAttempt {
  id: string;
  date: string;
  kind: WorkoutAttemptKind;
  workoutDefId: string | null; // links to a WorkoutDef (catalog or user-created) when the WOD is named/known
  label: string; // display name — workoutDef.name, or a user-entered label, or "WOD do dia"
  plan: WodPlan;
  result: WodResult;
}

export type WorkoutDefSource = 'catalog' | 'user';

/** A named, reusable workout definition — CrossFit benchmarks (Fran, Grace...) or a user's own recurring WOD. */
export interface WorkoutDef {
  id: string;
  name: string;
  isBenchmark: boolean;
  source: WorkoutDefSource;
  format: WodFormat;
  timeCapSec: number | null;
  scheme: string;
  movements: WodMovement[];
  notes: string;
}

export interface DayPlan {
  date: string; // ISO yyyy-mm-dd
  type: DayType;
  boxLabel: string; // e.g. "CrossFit" or "—"
  boxWorkoutTitle: string; // e.g. "WOD DO DIA"
  boxWorkoutBody: string; // free text, e.g. "For time:\n500m Row\n..." — quick-paste description, kept for backward compat
  wodPlan: WodPlan | null; // optional structured breakdown of the same WOD, enables comparison/recommendation
  complementaryBlockIds: string[]; // catalog block ids planned for the day
  note: string;
}

export interface Meal {
  id: string;
  date: string;
  name: string;
  time: string;
  kcal: number;
  protein: number;
  items: string;
  done: boolean;
}

export interface WeightEntry {
  id: string;
  date: string;
  kg: number;
}

export type MetricCategory = 'measure' | 'benchmark';
export type MetricDirection = 'higher-better' | 'lower-better';

export interface MetricEntry {
  id: string;
  category: MetricCategory;
  name: string;
  value: number;
  unit: string;
  date: string;
  direction: MetricDirection;
}

export interface SetLog {
  index: number;
  reps: string;
  load: string;
  durationSec: number | null;
  note: string;
  done: boolean;
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
}

export type SessionStatus = 'completed' | 'abandoned' | 'in-progress';

export interface SessionLog {
  id: string;
  blockId: string;
  blockName: string;
  date: string;
  startedAt: string; // ISO datetime
  endedAt: string | null;
  status: SessionStatus;
  currentExerciseIndex: number;
  restSecondsLeft: number;
  paused: boolean;
  exercises: ExerciseLog[];
}

export interface Limitation {
  id: string;
  area: string;
  note: string;
  pct: number;
}

// --- Progressions (2.5) -------------------------------------------------

export interface ProgressionEvent {
  id: string;
  date: string;
  toIndex: number;
  direction: 'advance' | 'regress';
  note: string;
}

export type ProgressionDefSource = 'catalog' | 'user';

/** Extensible — no longer hardcoded in code only. Catalog defaults are seeded into user data; users can add their own. */
export interface ProgressionDef {
  id: string;
  name: string;
  steps: string[];
  /** Optional criteria text per transition (index i = criteria to move from step i to i+1). User/catalog authored, never invented at runtime. */
  criteria: string[];
  source: ProgressionDefSource;
}

export interface ProgressionState {
  id: string; // matches ProgressionDef.id
  currentIndex: number;
  history: ProgressionEvent[];
}

// --- Recovery / RPE ------------------------------------------------------

export interface RecoveryLog {
  date: string;
  rpe: number | null; // 1-10
  energy: number | null; // 1-5
  soreness: number | null; // 1-5
  notes: string;
}

export interface Settings {
  notifications: boolean;
}

export interface AppData {
  schemaVersion: number;
  profile: Profile;
  goals: Goals;
  dayPlans: Record<string, DayPlan>;
  boxWorkoutDone: Record<string, boolean>;
  meals: Meal[];
  water: Record<string, number>;
  steps: Record<string, number>;
  weightLog: WeightEntry[];
  metrics: MetricEntry[];
  sessions: SessionLog[];
  activeSession: SessionLog | null;
  limitations: Limitation[];
  workoutDefs: WorkoutDef[];
  workoutAttempts: WorkoutAttempt[];
  progressionDefs: ProgressionDef[];
  progressions: ProgressionState[];
  recoveryLogs: Record<string, RecoveryLog>;
  settings: Settings;
}

/** Shallow structural check for the CURRENT schema shape (post-migration). Not a deep validator — matches the MVP's existing style. */
export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === 'number' &&
    typeof v.profile === 'object' &&
    typeof v.goals === 'object' &&
    typeof v.dayPlans === 'object' &&
    Array.isArray(v.meals) &&
    typeof v.water === 'object' &&
    Array.isArray(v.weightLog) &&
    Array.isArray(v.metrics) &&
    Array.isArray(v.sessions) &&
    Array.isArray(v.workoutDefs) &&
    Array.isArray(v.workoutAttempts) &&
    Array.isArray(v.progressionDefs) &&
    Array.isArray(v.progressions) &&
    typeof v.recoveryLogs === 'object'
  );
}

/**
 * Loose check used only to decide whether raw storage/import JSON is worth
 * attempting to migrate at all (legacy v1 shape or current shape) — distinct
 * from isAppData, which validates the final, post-migration shape.
 */
export function looksLikeMigratableAppData(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === 'number' &&
    typeof v.profile === 'object' &&
    typeof v.goals === 'object' &&
    typeof v.dayPlans === 'object' &&
    Array.isArray(v.meals) &&
    typeof v.water === 'object' &&
    Array.isArray(v.weightLog) &&
    Array.isArray(v.metrics) &&
    Array.isArray(v.sessions)
  );
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
