export const SCHEMA_VERSION = 1;

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

export interface DayPlan {
  date: string; // ISO yyyy-mm-dd
  type: DayType;
  boxLabel: string; // e.g. "CrossFit" or "—"
  boxWorkoutTitle: string; // e.g. "WOD DO DIA"
  boxWorkoutBody: string; // free text, e.g. "For time:\n500m Row\n..."
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

export interface MetricEntry {
  id: string;
  category: MetricCategory;
  name: string;
  value: number;
  unit: string;
  date: string;
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

export interface ProgressionState {
  id: string; // matches ProgressionDef.id in catalog
  currentIndex: number;
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
  progressions: ProgressionState[];
  settings: Settings;
}

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
    Array.isArray(v.sessions)
  );
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
