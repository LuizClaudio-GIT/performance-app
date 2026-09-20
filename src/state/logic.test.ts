import { describe, expect, it } from 'vitest';
import { buildSeedData } from '../data/seed';
import { addDays, todayISO } from '../lib/date';
import type { SessionLog } from '../data/schema';
import {
  buildSessionFromBlock,
  computeStreakDays,
  dailyKcal,
  dailyProtein,
  defaultDayPlan,
  getChecklistItems,
  getMealsForDate,
  isLastExercise,
  metricSeriesByName,
  sessionHasProgress,
  weekDayStatus,
  weeklyComplementaryVolume,
  weightSeries,
} from './logic';

// Anchored to the real clock, matching how weekDayStatus/isToday/isFutureDate
// actually work (they read the system date, not a fixture-supplied "today").
const TODAY = todayISO();

describe('daily calculations', () => {
  it('dailyKcal/dailyProtein only sum meals marked as done', () => {
    const data = buildSeedData(TODAY);
    const meals = getMealsForDate(data, TODAY);
    const expectedKcal = meals.filter((m) => m.done).reduce((s, m) => s + m.kcal, 0);
    const expectedProtein = meals.filter((m) => m.done).reduce((s, m) => s + m.protein, 0);
    expect(dailyKcal(meals)).toBe(expectedKcal);
    expect(dailyProtein(meals)).toBe(expectedProtein);
    expect(dailyKcal(meals)).toBeGreaterThan(0);
  });
});

describe('checklist derivation', () => {
  it('includes a box-workout item on a training day and reflects its completion', () => {
    const data = buildSeedData(TODAY);
    data.dayPlans[TODAY] = { ...defaultDayPlan(TODAY), type: 'treino' };
    delete data.boxWorkoutDone[TODAY];

    let items = getChecklistItems(data, TODAY);
    expect(items.find((i) => i.id === 'box')?.done).toBe(false);

    data.boxWorkoutDone[TODAY] = true;
    items = getChecklistItems(data, TODAY);
    expect(items.find((i) => i.id === 'box')?.done).toBe(true);
  });

  it('marks the water item done only once the goal is reached', () => {
    const data = buildSeedData(TODAY);
    data.water[TODAY] = data.goals.waterGoalL - 1;
    let items = getChecklistItems(data, TODAY);
    expect(items.find((i) => i.id === 'water')?.done).toBe(false);

    data.water[TODAY] = data.goals.waterGoalL;
    items = getChecklistItems(data, TODAY);
    expect(items.find((i) => i.id === 'water')?.done).toBe(true);
  });

  it('produces one item per planned complementary block, done once a completed session exists', () => {
    const data = buildSeedData(TODAY);
    const blockId = 'mob';
    data.dayPlans[TODAY] = { ...defaultDayPlan(TODAY), type: 'treino', complementaryBlockIds: [blockId] };
    let items = getChecklistItems(data, TODAY);
    expect(items.find((i) => i.id === `block-${blockId}`)?.done).toBe(false);

    const session: SessionLog = {
      id: 's1',
      blockId,
      blockName: 'X',
      date: TODAY,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      status: 'completed',
      currentExerciseIndex: 0,
      restSecondsLeft: 0,
      paused: false,
      exercises: [],
    };
    data.sessions.push(session);
    items = getChecklistItems(data, TODAY);
    expect(items.find((i) => i.id === `block-${blockId}`)?.done).toBe(true);
  });

  it('has no box item on a rest day', () => {
    const data = buildSeedData(TODAY);
    const restDate = Object.values(data.dayPlans).find((p) => p.type === 'descanso')?.date;
    expect(restDate).toBeDefined();
    const items = getChecklistItems(data, restDate!);
    expect(items.find((i) => i.id === 'box')).toBeUndefined();
  });
});

describe('week day status', () => {
  // Built explicitly (not from buildSeedData's single real-week window) so
  // these are deterministic regardless of which weekday "today" is when the
  // suite runs — buildSeedData's week never contains dates past a Sunday
  // "today", for instance.
  function withExplicitDay(date: string, patch: Partial<ReturnType<typeof defaultDayPlan>>) {
    const data = buildSeedData(TODAY);
    data.dayPlans[date] = { ...defaultDayPlan(date), ...patch };
    // buildSeedData's own week may have already marked this date's box
    // workout done (it pre-fills past days as done) — start from a clean
    // slate so tests control completion explicitly.
    delete data.boxWorkoutDone[date];
    return data;
  }

  it('a day that is today is always HOJE, even on a rest day', () => {
    const data = withExplicitDay(TODAY, { type: 'descanso' });
    expect(weekDayStatus(data, TODAY)).toBe('HOJE');
  });

  it('a future training day is PLANEJADO', () => {
    const future = addDays(TODAY, 3);
    const data = withExplicitDay(future, { type: 'treino' });
    expect(weekDayStatus(data, future)).toBe('PLANEJADO');
  });

  it('a non-today rest day is DESCANSO', () => {
    const rest = addDays(TODAY, -3);
    const data = withExplicitDay(rest, { type: 'descanso' });
    expect(weekDayStatus(data, rest)).toBe('DESCANSO');
  });

  it('a past training day is PLANEJADO until fully done, then CONCLUÍDO', () => {
    const past = addDays(TODAY, -3);
    const data = withExplicitDay(past, { type: 'treino', complementaryBlockIds: [] });
    expect(weekDayStatus(data, past)).toBe('PLANEJADO');

    data.boxWorkoutDone[past] = true;
    expect(weekDayStatus(data, past)).toBe('CONCLUÍDO');
  });
});

describe('weeklyComplementaryVolume', () => {
  it('counts planned blocks only for today and past days, ignoring future ones', () => {
    const past = addDays(TODAY, -1);
    const future = addDays(TODAY, 1);
    const data = buildSeedData(TODAY);
    data.dayPlans[past] = { ...defaultDayPlan(past), complementaryBlockIds: ['mob'] };
    data.dayPlans[TODAY] = { ...defaultDayPlan(TODAY), complementaryBlockIds: ['gin'] };
    data.dayPlans[future] = { ...defaultDayPlan(future), complementaryBlockIds: ['core', 'mob'] };
    data.sessions = [];

    const volume = weeklyComplementaryVolume(data, [past, TODAY, future]);
    expect(volume.planned).toBe(2); // past (1) + today (1); future's 2 are excluded
    expect(volume.done).toBe(0);
    expect(volume.pct).toBe(0);
  });

  it('reflects completed sessions in the done count and percentage', () => {
    const data = buildSeedData(TODAY);
    data.dayPlans[TODAY] = { ...defaultDayPlan(TODAY), complementaryBlockIds: ['mob', 'gin'] };
    data.sessions = [
      {
        id: 's1',
        blockId: 'mob',
        blockName: 'MOBILIDADE',
        date: TODAY,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        status: 'completed',
        currentExerciseIndex: 0,
        restSecondsLeft: 0,
        paused: false,
        exercises: [],
      },
    ];

    const volume = weeklyComplementaryVolume(data, [TODAY]);
    expect(volume.planned).toBe(2);
    expect(volume.done).toBe(1);
    expect(volume.pct).toBe(50);
  });
});

describe('metricSeriesByName / weightSeries', () => {
  it('groups metric entries by name and computes base/latest/delta chronologically', () => {
    const data = buildSeedData(TODAY);
    const series = metricSeriesByName(data, 'benchmark');
    const pullups = series.find((s) => s.name === 'Pull-ups');
    expect(pullups).toBeDefined();
    expect(pullups!.base.value).toBeLessThanOrEqual(pullups!.latest.value);
    expect(pullups!.delta).toBeCloseTo(pullups!.latest.value - pullups!.base.value);
    expect(pullups!.points[0]).toBeGreaterThanOrEqual(0);
    expect(pullups!.points[pullups!.points.length - 1]).toBeLessThanOrEqual(1);
  });

  it('weightSeries returns entries sorted chronologically', () => {
    const data = buildSeedData(TODAY);
    const series = weightSeries(data);
    for (let i = 1; i < series.length; i++) {
      expect(series[i].date >= series[i - 1].date).toBe(true);
    }
  });
});

describe('session runtime helpers', () => {
  it('buildSessionFromBlock creates the right number of sets per exercise, all undone', () => {
    const session = buildSessionFromBlock('mob', TODAY);
    expect(session).not.toBeNull();
    expect(session!.exercises.length).toBeGreaterThan(0);
    for (const ex of session!.exercises) {
      expect(ex.sets.every((s) => !s.done)).toBe(true);
    }
  });

  it('buildSessionFromBlock returns null for an unknown block id', () => {
    expect(buildSessionFromBlock('does-not-exist', TODAY)).toBeNull();
  });

  it('isLastExercise is true only on the final exercise index', () => {
    const session = buildSessionFromBlock('core', TODAY)!;
    expect(isLastExercise(session)).toBe(false);
    session.currentExerciseIndex = session.exercises.length - 1;
    expect(isLastExercise(session)).toBe(true);
  });

  it('sessionHasProgress is false for a fresh session and true once a set is touched', () => {
    const session = buildSessionFromBlock('core', TODAY)!;
    expect(sessionHasProgress(session)).toBe(false);
    session.exercises[0].sets[0].done = true;
    expect(sessionHasProgress(session)).toBe(true);
  });
});

describe('computeStreakDays', () => {
  it('is 0 when there is no completed activity at all', () => {
    const data = buildSeedData(TODAY);
    data.boxWorkoutDone = {};
    data.sessions = [];
    expect(computeStreakDays(data)).toBe(0);
  });
});
