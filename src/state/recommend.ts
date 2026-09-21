import { BLOCKS, MOVEMENT_LIMITATION_KEYWORDS } from '../data/catalog';
import { addDays } from '../lib/date';
import type { AppData, Limitation } from '../data/schema';
import { getDayPlan } from './logic';

export interface ComplementarySuggestion {
  blockId: string;
  blockName: string;
  reason: string;
}

export interface ComplementaryRecommendation {
  suggestion: ComplementarySuggestion | null;
  /** Always explains why there's no suggestion, or confirms an existing good match — never blank. */
  note: string;
}

function matchKeywords(movementName: string): string[] {
  const lower = movementName.toLowerCase();
  const keywords = new Set<string>();
  for (const [key, areas] of Object.entries(MOVEMENT_LIMITATION_KEYWORDS)) {
    if (lower.includes(key)) areas.forEach((a) => keywords.add(a));
  }
  return [...keywords];
}

function matchLimitations(keywords: string[], limitations: Limitation[]): Limitation[] {
  return limitations.filter((l) => {
    const area = l.area.toLowerCase();
    return keywords.some((k) => area.includes(k) || k.includes(area));
  });
}

/**
 * WOD -> movements -> limitations -> complementary suggestion (chain from
 * docs/ROADMAP.md). Fully rule-based against MOVEMENT_LIMITATION_KEYWORDS
 * (static, inspectable table in data/catalog.ts) and the athlete's own
 * logged plan/limitations. Every branch returns an explicit reason —
 * insufficient data is reported as such, never silently guessed around.
 */
export function recommendComplementary(data: AppData, date: string): ComplementaryRecommendation {
  const plan = getDayPlan(data, date);
  const movements = plan.wodPlan?.movements ?? [];

  if (movements.length === 0) {
    return {
      suggestion: null,
      note: 'Adicione os movimentos do WOD de hoje (em Semana → editar dia) para receber uma sugestão de complementar baseada neles.',
    };
  }
  if (data.limitations.length === 0) {
    return {
      suggestion: null,
      note: 'Cadastre suas limitações em Mais para receber sugestões de complementar baseadas no WOD de hoje.',
    };
  }

  const candidates: { movement: string; limitation: Limitation; keywords: string[] }[] = [];
  for (const mv of movements) {
    const keywords = matchKeywords(mv.name);
    if (keywords.length === 0) continue;
    for (const lim of matchLimitations(keywords, data.limitations)) {
      if (lim.pct < 80) candidates.push({ movement: mv.name, limitation: lim, keywords });
    }
  }

  if (candidates.length === 0) {
    return { suggestion: null, note: 'Nenhuma limitação cadastrada corresponde aos movimentos do WOD de hoje.' };
  }

  candidates.sort((a, b) => a.limitation.pct - b.limitation.pct);
  const top = candidates[0];

  // Matched only against each block's `limit`/`area` — the fields that
  // explicitly name the limitation the block targets. Deliberately NOT
  // matched against `tags` (e.g. GINÁSTICA's "CORE" tag is about general
  // core involvement in gymnastics work, not the CORE block's specific
  // "compressão ativa" focus) — a looser match there produced a wrong block
  // in testing (toes-to-bar matched GINÁSTICA instead of CORE).
  const block = BLOCKS.find((b) => {
    const limitText = b.limit.toLowerCase();
    const areaText = b.area.toLowerCase();
    return top.keywords.some((k) => limitText.includes(k) || k.includes(limitText) || areaText.includes(k));
  });

  if (!block) {
    return {
      suggestion: null,
      note: `"${top.movement}" se relaciona com sua limitação "${top.limitation.area}" (${top.limitation.pct}%), mas nenhum bloco complementar do catálogo cobre essa área ainda.`,
    };
  }

  if (plan.complementaryBlockIds.includes(block.id)) {
    return {
      suggestion: null,
      note: `${block.name} já está no plano de hoje — bom alinhamento com "${top.movement}" e sua limitação "${top.limitation.area}" (${top.limitation.pct}%).`,
    };
  }

  return {
    suggestion: {
      blockId: block.id,
      blockName: block.name,
      reason: `"${top.movement}" está no WOD de hoje e se relaciona com sua limitação "${top.limitation.area}" (${top.limitation.pct}%) — o bloco ${block.name} trabalha ${block.limit.toLowerCase()}.`,
    },
    note: '',
  };
}

/**
 * Recovery step of the chain — only fires on an explicit threshold crossed
 * by the athlete's own recent RPE/soreness logs. No diagnosis, no fabricated
 * advice when there isn't enough logged data to say anything.
 */
export function recoveryNote(data: AppData, date: string): string | null {
  const dates = [date, addDays(date, -1), addDays(date, -2)];
  const logs = dates.map((d) => data.recoveryLogs[d]).filter((l): l is NonNullable<typeof l> => !!l);
  const highRpe = logs.some((l) => (l.rpe ?? 0) >= 8);
  const highSoreness = logs.some((l) => (l.soreness ?? 0) >= 4);
  if (highRpe || highSoreness) {
    return 'RPE ou dor/desconforto elevados nos últimos dias — considere priorizar mobilidade e reduzir a intensidade dos complementares hoje.';
  }
  return null;
}
