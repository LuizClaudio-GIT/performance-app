import { describe, expect, it } from 'vitest';
import { buildSeedData } from '../data/seed';
import { todayISO } from '../lib/date';
import { defaultDayPlan } from './logic';
import { recommendComplementary, recoveryNote } from './recommend';
import type { AppData } from '../data/schema';

const TODAY = todayISO();

function dataWithPlan(overrides: Partial<ReturnType<typeof defaultDayPlan>> = {}): AppData {
  const data = buildSeedData(TODAY);
  data.dayPlans[TODAY] = { ...defaultDayPlan(TODAY), ...overrides };
  return data;
}

describe('recommendComplementary', () => {
  it('reports insufficient data when the WOD has no movements logged', () => {
    const data = dataWithPlan({ wodPlan: null });
    const rec = recommendComplementary(data, TODAY);
    expect(rec.suggestion).toBeNull();
    expect(rec.note).toContain('movimentos');
  });

  it('reports insufficient data when there are no limitations to match against', () => {
    const data = dataWithPlan({
      wodPlan: { format: 'for-time', timeCapSec: null, scheme: '', movements: [{ id: 'm1', name: 'Toes-to-bar', reps: '10', load: '' }] },
    });
    data.limitations = [];
    const rec = recommendComplementary(data, TODAY);
    expect(rec.suggestion).toBeNull();
    expect(rec.note).toContain('limitações');
  });

  it('suggests the matching complementary block when a WOD movement relates to a real limitation', () => {
    const data = dataWithPlan({
      wodPlan: { format: 'for-time', timeCapSec: null, scheme: '', movements: [{ id: 'm1', name: 'Toes-to-bar', reps: '10', load: '' }] },
      complementaryBlockIds: [],
    });
    data.limitations = [{ id: 'lim1', area: 'Compressão ativa', note: '', pct: 40 }];
    const rec = recommendComplementary(data, TODAY);
    expect(rec.suggestion).not.toBeNull();
    expect(rec.suggestion?.blockId).toBe('core');
    expect(rec.suggestion?.reason).toContain('Toes-to-bar');
    expect(rec.suggestion?.reason).toContain('Compressão ativa');
  });

  it('does not re-suggest a block already planned for today', () => {
    const data = dataWithPlan({
      wodPlan: { format: 'for-time', timeCapSec: null, scheme: '', movements: [{ id: 'm1', name: 'Toes-to-bar', reps: '10', load: '' }] },
      complementaryBlockIds: ['core'],
    });
    data.limitations = [{ id: 'lim1', area: 'Compressão ativa', note: '', pct: 40 }];
    const rec = recommendComplementary(data, TODAY);
    expect(rec.suggestion).toBeNull();
    expect(rec.note).toContain('já está no plano');
  });

  it('does not suggest anything for a limitation that is already effectively resolved (>=80%)', () => {
    const data = dataWithPlan({
      wodPlan: { format: 'for-time', timeCapSec: null, scheme: '', movements: [{ id: 'm1', name: 'Toes-to-bar', reps: '10', load: '' }] },
      complementaryBlockIds: [],
    });
    data.limitations = [{ id: 'lim1', area: 'Compressão ativa', note: '', pct: 90 }];
    const rec = recommendComplementary(data, TODAY);
    expect(rec.suggestion).toBeNull();
  });
});

describe('recoveryNote', () => {
  it('is null when there is no recent recovery data', () => {
    const data = dataWithPlan();
    data.recoveryLogs = {};
    expect(recoveryNote(data, TODAY)).toBeNull();
  });

  it('fires when a recent RPE is high', () => {
    const data = dataWithPlan();
    data.recoveryLogs = { [TODAY]: { date: TODAY, rpe: 9, energy: null, soreness: null, notes: '' } };
    expect(recoveryNote(data, TODAY)).toContain('RPE');
  });

  it('does not fire on moderate RPE/soreness', () => {
    const data = dataWithPlan();
    data.recoveryLogs = { [TODAY]: { date: TODAY, rpe: 5, energy: 3, soreness: 2, notes: '' } };
    expect(recoveryNote(data, TODAY)).toBeNull();
  });
});
