import { describe, expect, it } from 'vitest';
import { migrate } from './migrations';
import { isAppData, SCHEMA_VERSION } from './schema';

function legacyV1Data(): Record<string, unknown> {
  return {
    schemaVersion: 1,
    profile: { name: 'Teste', box: 'Box X', phase: 'Foundation', weekLabel: 'Semana 01' },
    goals: { kcalGoal: 2000, proteinGoal: 180, carbGoal: 200, fatGoal: 70, waterGoalL: 3, stepsGoal: 8000 },
    dayPlans: {
      '2026-01-05': {
        date: '2026-01-05',
        type: 'treino',
        boxLabel: 'CrossFit',
        boxWorkoutTitle: 'WOD DO DIA',
        boxWorkoutBody: 'For time:\n21-15-9\nThrusters\nPull-ups',
        complementaryBlockIds: ['mob'],
        note: '',
      },
    },
    boxWorkoutDone: { '2026-01-05': true },
    meals: [],
    water: {},
    steps: {},
    weightLog: [],
    metrics: [
      { id: 'm1', category: 'benchmark', name: '5 km', value: 30, unit: 'min', date: '2026-01-01' },
      { id: 'm2', category: 'benchmark', name: 'Deadlift', value: 140, unit: 'kg', date: '2026-01-01' },
      { id: 'm3', category: 'benchmark', name: 'Handstand hold', value: 20, unit: 's', date: '2026-01-01' },
    ],
    sessions: [],
    activeSession: null,
    limitations: [],
    progressions: [{ id: 'pullup', currentIndex: 2 }],
    settings: { notifications: true },
  };
}

describe('migrate v1 -> v2', () => {
  it('produces a fully valid current-schema AppData', () => {
    const migrated = migrate(legacyV1Data());
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(isAppData(migrated)).toBe(true);
  });

  it('never discards existing day plans, metrics, or progression state', () => {
    const migrated = migrate(legacyV1Data()) as Record<string, unknown>;
    const dayPlans = migrated.dayPlans as Record<string, Record<string, unknown>>;
    expect(dayPlans['2026-01-05'].boxWorkoutBody).toContain('Thrusters');
    expect(dayPlans['2026-01-05'].wodPlan).toBeNull();

    const metrics = migrated.metrics as Array<Record<string, unknown>>;
    expect(metrics).toHaveLength(3);

    const progressions = migrated.progressions as Array<Record<string, unknown>>;
    const pullup = progressions.find((p) => p.id === 'pullup');
    expect(pullup?.currentIndex).toBe(2);
    expect(pullup?.history).toEqual([]);
  });

  it('infers a metric direction heuristic without discarding the value', () => {
    const migrated = migrate(legacyV1Data()) as Record<string, unknown>;
    const metrics = migrated.metrics as Array<Record<string, unknown>>;
    const fiveK = metrics.find((m) => m.name === '5 km')!;
    const deadlift = metrics.find((m) => m.name === 'Deadlift')!;
    const hold = metrics.find((m) => m.name === 'Handstand hold')!;
    expect(fiveK.direction).toBe('lower-better'); // race time — lower is better
    expect(deadlift.direction).toBe('higher-better'); // load — higher is better
    expect(hold.direction).toBe('higher-better'); // held duration — longer is better
    expect(fiveK.value).toBe(30);
  });

  it('seeds progressionDefs from the catalog defaults, including new skills not present in v1', () => {
    const migrated = migrate(legacyV1Data()) as Record<string, unknown>;
    const defs = migrated.progressionDefs as Array<Record<string, unknown>>;
    const ids = defs.map((d) => d.id);
    expect(ids).toContain('handstand');
    expect(ids).toContain('pullup');
    expect(ids).toContain('toes-to-bar');
    expect(ids).toContain('double-unders');
    expect(ids).toContain('muscle-up');

    const progressions = migrated.progressions as Array<Record<string, unknown>>;
    const t2b = progressions.find((p) => p.id === 'toes-to-bar');
    expect(t2b).toBeDefined();
    expect(t2b?.currentIndex).toBe(0); // never fabricates advancement for a skill the user had no prior state for
  });

  it('adds empty workout/recovery collections that did not exist in v1', () => {
    const migrated = migrate(legacyV1Data()) as Record<string, unknown>;
    expect(migrated.workoutDefs).toEqual([]);
    expect(migrated.workoutAttempts).toEqual([]);
    expect(migrated.recoveryLogs).toEqual({});
  });

  it('is a no-op for data already at the current schema version', () => {
    const alreadyV2 = { schemaVersion: SCHEMA_VERSION, foo: 'bar' };
    expect(migrate(alreadyV2)).toEqual(alreadyV2);
  });
});
