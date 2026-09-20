import { beforeEach, describe, expect, it } from 'vitest';
import { clearAppData, exportBackup, loadAppData, parseBackup, saveAppData } from './store';
import { SCHEMA_VERSION } from '../data/schema';

describe('storage/store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds demo data on first load when nothing is stored', () => {
    const { data, seeded } = loadAppData();
    expect(seeded).toBe(true);
    expect(data.schemaVersion).toBe(SCHEMA_VERSION);
    expect(data.meals.length).toBeGreaterThan(0);
  });

  it('persists changes across a save/load cycle', () => {
    const { data } = loadAppData();
    const modified = { ...data, profile: { ...data.profile, name: 'Teste Persistência' } };
    saveAppData(modified);

    const reloaded = loadAppData();
    expect(reloaded.seeded).toBe(false);
    expect(reloaded.data.profile.name).toBe('Teste Persistência');
  });

  it('falls back to fresh seed data when stored JSON is corrupt', () => {
    localStorage.setItem('performance:v1', '{not valid json');
    const { data, seeded } = loadAppData();
    expect(seeded).toBe(true);
    expect(data.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('falls back to fresh seed data when the schema version does not match', () => {
    localStorage.setItem('performance:v1', JSON.stringify({ schemaVersion: 999, profile: {}, goals: {}, dayPlans: {}, meals: [], water: {}, weightLog: [], metrics: [], sessions: [] }));
    const { seeded } = loadAppData();
    expect(seeded).toBe(true);
  });

  it('clearAppData removes the stored data so the next load re-seeds', () => {
    const { data } = loadAppData();
    saveAppData(data);
    clearAppData();
    expect(localStorage.getItem('performance:v1')).toBeNull();
  });

  it('round-trips through export/import without losing data', () => {
    const { data } = loadAppData();
    const withExtraMeal = {
      ...data,
      meals: [...data.meals, { id: 'meal_test', date: data.meals[0]?.date ?? '2026-01-01', name: 'Teste', time: '09:00', kcal: 123, protein: 45, items: 'x', done: false }],
    };
    const json = exportBackup(withExtraMeal);
    const result = parseBackup(json);
    expect(result.ok).toBe(true);
    expect(result.data?.meals.some((m) => m.id === 'meal_test')).toBe(true);
  });

  it('parseBackup rejects invalid JSON', () => {
    const result = parseBackup('not json at all');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('parseBackup rejects a structurally-wrong object', () => {
    const result = parseBackup(JSON.stringify({ hello: 'world' }));
    expect(result.ok).toBe(false);
  });

  it('parseBackup rejects a mismatched schema version', () => {
    const { data } = loadAppData();
    const json = JSON.stringify({ ...data, schemaVersion: SCHEMA_VERSION + 1 });
    const result = parseBackup(json);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('incompatível');
  });

  it('parseBackup migrates a legacy v1 backup instead of rejecting it — real history must survive a schema bump', () => {
    const legacyV1 = {
      schemaVersion: 1,
      profile: { name: 'Backup Antigo', box: 'Box Y', phase: 'Foundation', weekLabel: 'Semana 01' },
      goals: { kcalGoal: 2000, proteinGoal: 180, carbGoal: 200, fatGoal: 70, waterGoalL: 3, stepsGoal: 8000 },
      dayPlans: {},
      boxWorkoutDone: {},
      meals: [],
      water: {},
      steps: {},
      weightLog: [{ id: 'w1', date: '2026-01-01', kg: 90 }],
      metrics: [{ id: 'm1', category: 'benchmark', name: 'Deadlift', value: 140, unit: 'kg', date: '2026-01-01' }],
      sessions: [],
      activeSession: null,
      limitations: [],
      progressions: [],
      settings: { notifications: true },
    };
    const result = parseBackup(JSON.stringify(legacyV1));
    expect(result.ok).toBe(true);
    expect(result.data?.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.data?.profile.name).toBe('Backup Antigo');
    expect(result.data?.weightLog[0].kg).toBe(90);
    expect(result.data?.metrics[0].name).toBe('Deadlift');
  });

  it('loadAppData transparently migrates an older schema already sitting in localStorage', () => {
    const legacyV1 = {
      schemaVersion: 1,
      profile: { name: 'Local Antigo', box: 'Box Z', phase: 'Foundation', weekLabel: 'Semana 01' },
      goals: { kcalGoal: 2000, proteinGoal: 180, carbGoal: 200, fatGoal: 70, waterGoalL: 3, stepsGoal: 8000 },
      dayPlans: {},
      boxWorkoutDone: {},
      meals: [],
      water: {},
      steps: {},
      weightLog: [],
      metrics: [],
      sessions: [],
      activeSession: null,
      limitations: [],
      progressions: [],
      settings: { notifications: true },
    };
    localStorage.setItem('performance:v1', JSON.stringify(legacyV1));
    const { data, seeded } = loadAppData();
    expect(seeded).toBe(false);
    expect(data.schemaVersion).toBe(SCHEMA_VERSION);
    expect(data.profile.name).toBe('Local Antigo');
  });
});
