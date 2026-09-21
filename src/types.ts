export type TabId = 'hoje' | 'semana' | 'food' | 'evo' | 'mais';
export type EvoTabId = 'resumo' | 'treinos' | 'benchmarks' | 'medidas' | 'progressoes';
export type BlockId = 'mob' | 'gin' | 'core';

export interface Exercise {
  name: string;
  obj: string;
  sets: string;
  reps: string;
  rest: string;
  cues: string[];
  errs: string[];
  /** Real demonstration asset, when one exists. Never fabricated — stays null/undefined until a real asset is wired in. */
  videoUrl?: string | null;
  thumbnail?: string | null;
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

export interface MoreLink {
  label: string;
  hint: string;
  go?: TabId;
}
