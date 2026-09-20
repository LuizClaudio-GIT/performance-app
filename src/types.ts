export type TabId = 'hoje' | 'semana' | 'food' | 'evo' | 'mais';
export type EvoTabId = 'resumo' | 'medidas' | 'progressoes';
export type BlockId = 'mob' | 'gin' | 'core';

export interface Exercise {
  name: string;
  obj: string;
  sets: string;
  reps: string;
  rest: string;
  cues: string[];
  errs: string[];
}

export type BlockPriority = 'PRIORIDADE ALTA' | 'PROGRESSÃO' | 'OPCIONAL';

export interface ComplementaryBlock {
  id: BlockId;
  name: string;
  glyph: string;
  prio: BlockPriority;
  meta: string;
  obj: string;
  tags: string[];
  area: string;
  limit: string;
  ex: Exercise[];
}

export type WorkKind = 'done' | 'today' | 'next' | 'rest';

export interface WeekWorkItem {
  label: string;
  kind: WorkKind;
}

export type DayState = 'CONCLUÍDO' | 'HOJE' | 'PLANEJADO' | 'LEVE' | 'DESCANSO';

export interface WeekDay {
  day: string;
  date: string;
  box: string;
  work: WeekWorkItem[];
  state: DayState;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  kcal: string;
  prot: string;
  items: string;
}

export interface Macro {
  name: string;
  val: string;
  pct: number;
}

export interface Metric {
  name: string;
  value: string;
  base: string;
  delta: string;
  data: number[];
}

export interface Measure {
  name: string;
  base: string;
  now: string;
  delta: string;
}

export interface Progression {
  name: string;
  stageLabel: string;
  note: string;
  steps: string[];
  current: number;
}

export interface Limitation {
  area: string;
  note: string;
  pct: number;
}

export interface MoreLink {
  label: string;
  hint: string;
  go?: TabId;
}

export interface DailyStat {
  label: string;
  value: string;
  sub: string;
  pct: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  value: string;
}
