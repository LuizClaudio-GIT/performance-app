import { SCHEMA_VERSION, type MetricDirection } from './schema';
import { DEFAULT_PROGRESSION_DEFS } from './catalog';

/**
 * Versioned migration chain. Each entry migrates FROM its key version TO the
 * next one. Loading/importing older data always runs it through this chain
 * instead of resetting to seed — resetting on a schema bump would destroy a
 * real athlete's history, which is unacceptable once the app has real data.
 *
 * Only a version with no known migration path (newer than this build knows,
 * or structurally unrecognizable) falls back to seed — see storage/store.ts.
 */
type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * A metric's "better direction" wasn't tracked before v2. Infer a sane
 * default from the name/unit so existing PR math doesn't regress; this is a
 * heuristic, not a guess presented as fact — direction stays user-editable
 * going forward (AddMetricModal) so a wrong guess is a one-tap fix, not data
 * loss.
 */
function inferMetricDirection(name: string, unit: string): MetricDirection {
  const n = name.toLowerCase();
  const u = unit.toLowerCase();
  if (/hold|segur|prancha|plancha|isometr/.test(n)) return 'higher-better';
  if (/km|corrida|run|row|remo|sprint|for time/.test(n)) return 'lower-better';
  if (u === 'min' || u === 's' || u === 'sec' || u === 'seg') return 'lower-better';
  return 'higher-better';
}

const migrateV1toV2: Migration = (data) => {
  const metrics = Array.isArray(data.metrics) ? data.metrics : [];
  const migratedMetrics = metrics.map((m) => {
    const entry = m as Record<string, unknown>;
    return {
      ...entry,
      direction: inferMetricDirection(String(entry.name ?? ''), String(entry.unit ?? '')),
    };
  });

  const dayPlans = (data.dayPlans ?? {}) as Record<string, Record<string, unknown>>;
  const migratedDayPlans: Record<string, Record<string, unknown>> = {};
  for (const [date, plan] of Object.entries(dayPlans)) {
    migratedDayPlans[date] = { ...plan, wodPlan: plan.wodPlan ?? null };
  }

  const progressions = Array.isArray(data.progressions) ? data.progressions : [];
  const migratedProgressions: Record<string, unknown>[] = progressions.map((p) => {
    const state = p as Record<string, unknown>;
    return { ...state, history: Array.isArray(state.history) ? state.history : [] };
  });
  // Seed catalog progression defs for any progression the user already has
  // state for, plus the full catalog set so new skills are visible without
  // fabricating any advancement (all start at their existing currentIndex,
  // or 0 for ones the user has no state for yet — see below).
  const existingIds = new Set(migratedProgressions.map((p) => (p as Record<string, unknown>).id as string));
  const progressionDefs = DEFAULT_PROGRESSION_DEFS.map((def) => ({ ...def }));
  for (const def of DEFAULT_PROGRESSION_DEFS) {
    if (!existingIds.has(def.id)) {
      migratedProgressions.push({ id: def.id, currentIndex: 0, history: [] });
    }
  }

  return {
    ...data,
    schemaVersion: 2,
    metrics: migratedMetrics,
    dayPlans: migratedDayPlans,
    progressions: migratedProgressions,
    progressionDefs,
    workoutDefs: Array.isArray(data.workoutDefs) ? data.workoutDefs : [],
    workoutAttempts: Array.isArray(data.workoutAttempts) ? data.workoutAttempts : [],
    recoveryLogs: typeof data.recoveryLogs === 'object' && data.recoveryLogs ? data.recoveryLogs : {},
  };
};

const MIGRATIONS: Record<number, Migration> = {
  1: migrateV1toV2,
};

/**
 * Runs the migration chain starting from `data.schemaVersion` up to
 * SCHEMA_VERSION. Stops (without throwing) if a version has no registered
 * migration — the caller is responsible for validating the result and
 * deciding whether it's usable.
 */
export function migrate(data: Record<string, unknown>): Record<string, unknown> {
  let current = data;
  let version = typeof current.schemaVersion === 'number' ? current.schemaVersion : 1;
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) break;
    current = step(current);
    version = typeof current.schemaVersion === 'number' ? current.schemaVersion : version + 1;
  }
  return current;
}
