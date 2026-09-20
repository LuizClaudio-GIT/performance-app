import { addDays, todayISO, weekDates } from '../lib/date';
import type { AppData, DayPlan, MetricEntry, WeightEntry } from './schema';
import { SCHEMA_VERSION, makeId } from './schema';

/**
 * Demo content, kept separate from real user data. Used only to seed
 * localStorage the first time the app runs (see src/storage/store.ts).
 * Anchored to the real current week so the app is immediately usable,
 * not stuck showing a hardcoded date from the original prototype.
 */
export function buildSeedData(today: string = todayISO()): AppData {
  const week = weekDates(today);
  const [mon, tue, wed, thu, fri, sat, sun] = week;

  const dayPlans: Record<string, DayPlan> = {
    [mon]: {
      date: mon,
      type: 'treino',
      boxLabel: 'CrossFit',
      boxWorkoutTitle: 'WOD DO DIA',
      boxWorkoutBody: 'For time:\n500 m Row\n21 Thrusters (43/30)\n15 Pull-ups\n9 Burpees',
      complementaryBlockIds: ['mob', 'core'],
      note: '',
    },
    [tue]: {
      date: tue,
      type: 'treino',
      boxLabel: 'CrossFit',
      boxWorkoutTitle: 'WOD DO DIA',
      boxWorkoutBody: 'AMRAP 18min:\n12 Kettlebell swings (24/16)\n9 Box jumps\n6 Toes-to-bar',
      complementaryBlockIds: ['mob', 'gin'],
      note: '',
    },
    [wed]: {
      date: wed,
      type: 'treino',
      boxLabel: 'CrossFit',
      boxWorkoutTitle: 'WOD DO DIA',
      boxWorkoutBody: 'For time:\n3 Rounds\n400m Run\n15 Wall balls\n10 Burpees',
      complementaryBlockIds: ['gin', 'core'],
      note: '',
    },
    [thu]: {
      date: thu,
      type: 'treino',
      boxLabel: 'CrossFit',
      boxWorkoutTitle: 'WOD DO DIA',
      boxWorkoutBody: 'EMOM 20min:\nMin 1: 12 Cal Row\nMin 2: 10 Push press\nMin 3: 8 Deadlifts\nMin 4: rest',
      complementaryBlockIds: ['mob'],
      note: '',
    },
    [fri]: {
      date: fri,
      type: 'treino',
      boxLabel: 'CrossFit',
      boxWorkoutTitle: 'WOD DO DIA',
      boxWorkoutBody: 'For time:\n21-15-9\nThrusters\nPull-ups',
      complementaryBlockIds: ['mob', 'gin'],
      note: '',
    },
    [sat]: {
      date: sat,
      type: 'leve',
      boxLabel: '—',
      boxWorkoutTitle: '',
      boxWorkoutBody: '',
      complementaryBlockIds: ['core'],
      note: 'Skill opcional',
    },
    [sun]: {
      date: sun,
      type: 'descanso',
      boxLabel: '—',
      boxWorkoutTitle: '',
      boxWorkoutBody: '',
      complementaryBlockIds: [],
      note: 'Recuperação',
    },
  };

  const boxWorkoutDone: Record<string, boolean> = {};
  for (const d of week) {
    if (d < today) boxWorkoutDone[d] = true;
  }

  const meals = [
    { name: 'Café da manhã', time: '07:00', kcal: 480, protein: 38, items: 'Ovos, aveia, banana, pasta de amendoim', done: true },
    { name: 'Lanche da manhã', time: '10:00', kcal: 240, protein: 25, items: 'Iogurte grego + whey + frutas', done: true },
    { name: 'Almoço', time: '13:00', kcal: 620, protein: 52, items: 'Arroz, feijão, frango grelhado, salada', done: false },
    { name: 'Lanche da tarde', time: '16:30', kcal: 260, protein: 28, items: 'Tapioca com frango desfiado', done: false },
    { name: 'Jantar', time: '20:00', kcal: 300, protein: 45, items: 'Peixe, legumes assados, batata-doce', done: false },
  ].map((m) => ({ id: makeId('meal'), date: today, ...m }));

  const water: Record<string, number> = { [today]: 2.1 };
  const steps: Record<string, number> = { [today]: 8432 };

  const weightLog: WeightEntry[] = [
    { id: makeId('w'), date: addDays(today, -28), kg: 116.4 },
    { id: makeId('w'), date: addDays(today, -14), kg: 115.1 },
    { id: makeId('w'), date: addDays(today, -7), kg: 114.4 },
    { id: makeId('w'), date: today, kg: 113.8 },
  ];

  const metrics: MetricEntry[] = [
    { id: makeId('m'), category: 'measure', name: 'Gordura corporal', value: 28.4, unit: '%', date: addDays(today, -28) },
    { id: makeId('m'), category: 'measure', name: 'Gordura corporal', value: 25.1, unit: '%', date: today },
    { id: makeId('m'), category: 'measure', name: 'Cintura', value: 104, unit: 'cm', date: addDays(today, -28) },
    { id: makeId('m'), category: 'measure', name: 'Cintura', value: 98, unit: 'cm', date: today },
    { id: makeId('m'), category: 'measure', name: 'Peito', value: 108, unit: 'cm', date: addDays(today, -28) },
    { id: makeId('m'), category: 'measure', name: 'Peito', value: 109, unit: 'cm', date: today },
    { id: makeId('m'), category: 'measure', name: 'Braço', value: 36, unit: 'cm', date: addDays(today, -28) },
    { id: makeId('m'), category: 'measure', name: 'Braço', value: 37.5, unit: 'cm', date: today },
    { id: makeId('m'), category: 'measure', name: 'Coxa', value: 62, unit: 'cm', date: addDays(today, -28) },
    { id: makeId('m'), category: 'measure', name: 'Coxa', value: 63, unit: 'cm', date: today },
    { id: makeId('m'), category: 'benchmark', name: 'Pull-ups', value: 0, unit: 'reps', date: addDays(today, -28) },
    { id: makeId('m'), category: 'benchmark', name: 'Pull-ups', value: 4, unit: 'reps', date: today },
    { id: makeId('m'), category: 'benchmark', name: 'Deadlift', value: 120, unit: 'kg', date: addDays(today, -28) },
    { id: makeId('m'), category: 'benchmark', name: 'Deadlift', value: 160, unit: 'kg', date: today },
    { id: makeId('m'), category: 'benchmark', name: '5 km', value: 36.17, unit: 'min', date: addDays(today, -28) },
    { id: makeId('m'), category: 'benchmark', name: '5 km', value: 31.33, unit: 'min', date: today },
    { id: makeId('m'), category: 'benchmark', name: 'Handstand hold', value: 0, unit: 's', date: addDays(today, -28) },
    { id: makeId('m'), category: 'benchmark', name: 'Handstand hold', value: 12, unit: 's', date: today },
  ];

  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: 'Rafael M.',
      box: 'Box Performance',
      phase: 'Foundation',
      weekLabel: 'Semana 01',
    },
    goals: {
      kcalGoal: 1900,
      proteinGoal: 200,
      carbGoal: 190,
      fatGoal: 70,
      waterGoalL: 3.5,
      stepsGoal: 10000,
    },
    dayPlans,
    boxWorkoutDone,
    meals,
    water,
    steps,
    weightLog,
    metrics,
    sessions: [],
    activeSession: null,
    limitations: [
      { id: makeId('lim'), area: 'Dorsiflexão de tornozelo', note: 'Agachamento perde profundidade aos 90°', pct: 55 },
      { id: makeId('lim'), area: 'Extensão torácica', note: 'Front rack com cotovelos baixos', pct: 40 },
      { id: makeId('lim'), area: 'Ombro overhead', note: 'Perda de linha no press acima da cabeça', pct: 35 },
      { id: makeId('lim'), area: 'Compressão ativa', note: 'Toes-to-bar sem controle de balanço', pct: 60 },
    ],
    progressions: [
      { id: 'handstand', currentIndex: 2 },
      { id: 'pullup', currentIndex: 3 },
    ],
    settings: {
      notifications: true,
    },
  };
}
