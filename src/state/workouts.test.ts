import { describe, expect, it } from 'vitest';
import { buildSeedData } from '../data/seed';
import { todayISO } from '../lib/date';
import { emptyWodResult } from '../data/schema';
import type { AppData, WorkoutAttempt } from '../data/schema';
import {
  attemptsForLabel,
  attemptsForWorkoutDef,
  bestDisplayAttempt,
  bestWorkoutAttempt,
  compareWodResult,
  formatWodResultShort,
  isNewWorkoutPR,
  priorAttempts,
} from './workouts';

const TODAY = todayISO();

function baseData(): AppData {
  const data = buildSeedData(TODAY);
  data.workoutAttempts = [];
  return data;
}

function attempt(overrides: Partial<WorkoutAttempt>): WorkoutAttempt {
  return {
    id: `wa_${Math.random()}`,
    date: TODAY,
    kind: 'benchmark',
    workoutDefId: 'bm_fran',
    label: 'Fran',
    plan: { format: 'rounds-reps', timeCapSec: null, scheme: '21-15-9', movements: [] },
    result: emptyWodResult('rounds-reps'),
    ...overrides,
  };
}

describe('compareWodResult', () => {
  it('for-time: a lower time beats a higher time', () => {
    const fast = { ...emptyWodResult('for-time'), timeSec: 400 };
    const slow = { ...emptyWodResult('for-time'), timeSec: 500 };
    expect(compareWodResult('for-time', fast, slow)).toBeGreaterThan(0);
    expect(compareWodResult('for-time', slow, fast)).toBeLessThan(0);
  });

  it('for-time: finishing beats not finishing under the cap', () => {
    const finished = { ...emptyWodResult('for-time'), timeSec: 900 };
    const capped = { ...emptyWodResult('for-time'), timeSec: null, rounds: 3, extraReps: 10 };
    expect(compareWodResult('for-time', finished, capped)).toBeGreaterThan(0);
  });

  it('for-time: between two non-finishers, more rounds+reps wins', () => {
    const a = { ...emptyWodResult('for-time'), timeSec: null, rounds: 4, extraReps: 5 };
    const b = { ...emptyWodResult('for-time'), timeSec: null, rounds: 3, extraReps: 20 };
    expect(compareWodResult('for-time', a, b)).toBeGreaterThan(0);
  });

  it('amrap: more rounds beats fewer rounds', () => {
    const a = { ...emptyWodResult('amrap'), rounds: 8, extraReps: 2 };
    const b = { ...emptyWodResult('amrap'), rounds: 7, extraReps: 15 };
    expect(compareWodResult('amrap', a, b)).toBeGreaterThan(0);
  });

  it('amrap: same rounds, more extra reps wins', () => {
    const a = { ...emptyWodResult('amrap'), rounds: 8, extraReps: 10 };
    const b = { ...emptyWodResult('amrap'), rounds: 8, extraReps: 3 };
    expect(compareWodResult('amrap', a, b)).toBeGreaterThan(0);
  });

  it('returns 0 when there is nothing comparable between the two results', () => {
    const a = emptyWodResult('other');
    const b = emptyWodResult('other');
    expect(compareWodResult('other', a, b)).toBe(0);
  });
});

describe('bestWorkoutAttempt', () => {
  it('returns null for an empty list', () => {
    expect(bestWorkoutAttempt([])).toBeNull();
  });

  it('picks the attempt with the better result for its format', () => {
    const a = attempt({ id: 'a', date: '2026-01-01', result: { ...emptyWodResult('rounds-reps'), timeSec: 500 } });
    const b = attempt({ id: 'b', date: '2026-01-10', result: { ...emptyWodResult('rounds-reps'), timeSec: 400 } });
    const best = bestWorkoutAttempt([a, b]);
    expect(best?.id).toBe('b');
  });
});

describe('isNewWorkoutPR / priorAttempts / attemptsForWorkoutDef / attemptsForLabel', () => {
  it('the first-ever attempt at a workout is always a PR', () => {
    const data = baseData();
    const first = attempt({ id: 'first', workoutDefId: 'bm_fran', result: { ...emptyWodResult('rounds-reps'), timeSec: 500 } });
    data.workoutAttempts = [first];
    expect(isNewWorkoutPR(data, first)).toBe(true);
  });

  it('a strictly better attempt is a new PR; a worse one is not', () => {
    const data = baseData();
    const prior = attempt({ id: 'prior', date: '2026-01-01', workoutDefId: 'bm_fran', result: { ...emptyWodResult('rounds-reps'), timeSec: 500 } });
    const better = attempt({ id: 'better', date: '2026-01-10', workoutDefId: 'bm_fran', result: { ...emptyWodResult('rounds-reps'), timeSec: 400 } });
    const worse = attempt({ id: 'worse', date: '2026-01-10', workoutDefId: 'bm_fran', result: { ...emptyWodResult('rounds-reps'), timeSec: 600 } });
    data.workoutAttempts = [prior, better, worse];
    expect(isNewWorkoutPR(data, better)).toBe(true);
    expect(isNewWorkoutPR(data, worse)).toBe(false);
  });

  it('attemptsForWorkoutDef sorts most recent first and ignores other defs', () => {
    const data = baseData();
    const older = attempt({ id: 'o', date: '2026-01-01', workoutDefId: 'bm_fran' });
    const newer = attempt({ id: 'n', date: '2026-02-01', workoutDefId: 'bm_fran' });
    const other = attempt({ id: 'x', date: '2026-01-15', workoutDefId: 'bm_grace' });
    data.workoutAttempts = [older, newer, other];
    const result = attemptsForWorkoutDef(data, 'bm_fran');
    expect(result.map((a) => a.id)).toEqual(['n', 'o']);
  });

  it('attemptsForLabel matches case-insensitively for unlinked/daily WODs', () => {
    const data = baseData();
    const a = attempt({ id: 'a', workoutDefId: null, label: 'Segunda de força', kind: 'daily' });
    data.workoutAttempts = [a];
    expect(attemptsForLabel(data, 'segunda de força')).toHaveLength(1);
    expect(attemptsForLabel(data, 'outro nome')).toHaveLength(0);
  });

  it('priorAttempts excludes the attempt itself', () => {
    const data = baseData();
    const a = attempt({ id: 'a', date: '2026-01-01', workoutDefId: 'bm_fran' });
    const b = attempt({ id: 'b', date: '2026-02-01', workoutDefId: 'bm_fran' });
    data.workoutAttempts = [a, b];
    const prior = priorAttempts(data, b);
    expect(prior.map((p) => p.id)).toEqual(['a']);
  });
});

describe('isNewWorkoutPR keeps RX and Scaled as separate categories', () => {
  it('a faster Scaled attempt is not compared against an RX best — it is a PR only within its own category', () => {
    const data = baseData();
    const rxBest = attempt({
      id: 'rx',
      date: '2026-01-01',
      workoutDefId: 'bm_fran',
      result: { ...emptyWodResult('rounds-reps'), timeSec: 400, scale: 'rx' },
    });
    data.workoutAttempts = [rxBest];

    const firstScaled = attempt({
      id: 'scaled-1',
      date: '2026-01-10',
      workoutDefId: 'bm_fran',
      result: { ...emptyWodResult('rounds-reps'), timeSec: 300, scale: 'scaled' },
    });
    // Objectively faster in seconds than the RX best, but it's a different
    // category — must still count as a PR (it's the first-ever Scaled attempt).
    expect(isNewWorkoutPR(data, firstScaled)).toBe(true);

    data.workoutAttempts = [rxBest, firstScaled];
    const worseScaled = attempt({
      id: 'scaled-2',
      date: '2026-01-15',
      workoutDefId: 'bm_fran',
      result: { ...emptyWodResult('rounds-reps'), timeSec: 350, scale: 'scaled' },
    });
    // Slower than the Scaled best, and must not be measured against the RX
    // best (which it would beat) — not a PR.
    expect(isNewWorkoutPR(data, worseScaled)).toBe(false);
  });
});

describe('bestDisplayAttempt', () => {
  it('prefers the RX best even when a Scaled attempt is objectively faster', () => {
    const rx = attempt({ id: 'rx', result: { ...emptyWodResult('rounds-reps'), timeSec: 500, scale: 'rx' } });
    const fasterScaled = attempt({ id: 'scaled', result: { ...emptyWodResult('rounds-reps'), timeSec: 300, scale: 'scaled' } });
    expect(bestDisplayAttempt([rx, fasterScaled])?.id).toBe('rx');
  });

  it('falls back to the best Scaled/Other attempt when there is no RX history', () => {
    const scaled = attempt({ id: 'scaled', result: { ...emptyWodResult('rounds-reps'), timeSec: 500, scale: 'scaled' } });
    expect(bestDisplayAttempt([scaled])?.id).toBe('scaled');
  });

  it('returns null for an empty list', () => {
    expect(bestDisplayAttempt([])).toBeNull();
  });
});

describe('formatWodResultShort', () => {
  it('formats a time-based result with scale', () => {
    const result = { ...emptyWodResult('for-time'), timeSec: 402, scale: 'rx' as const };
    expect(formatWodResultShort(result)).toBe('6:42 (RX)');
  });

  it('returns an em dash when there is nothing to show', () => {
    expect(formatWodResultShort(emptyWodResult('other'))).toBe('—');
  });
});
