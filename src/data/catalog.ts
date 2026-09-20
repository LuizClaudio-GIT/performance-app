import type { ComplementaryBlock } from '../types';
import type { ProgressionDef, WodFormat, WorkoutDef } from './schema';

/**
 * Curated exercise library — content, not user data. Users log against this
 * catalog (sets/reps/load per session); they don't edit it in the MVP.
 */
export const BLOCKS: ComplementaryBlock[] = [
  {
    id: 'mob',
    name: 'MOBILIDADE',
    glyph: 'M',
    prio: 'PRIORIDADE ALTA',
    meta: '12 MIN · PÓS BOX · 4 EXERCÍCIOS',
    obj: 'Dorsiflexão de tornozelo e cadeia posterior — base do agachamento profundo.',
    tags: ['TORNOZELO', 'QUADRIL', 'POSTERIOR'],
    area: 'MOBILIDADE',
    limit: 'DORSIFLEXÃO DE TORNOZELO',
    ex: [
      {
        name: 'Ankle rock contra a parede',
        obj: 'Ganhar amplitude de dorsiflexão sem perder o calcanhar no chão.',
        sets: '3',
        reps: '10 /lado',
        rest: '30s',
        cues: [
          'Joelho viaja sobre o dedo médio do pé.',
          'Calcanhar colado no chão durante todo o movimento.',
          'Pressione por 2 segundos no fim da amplitude.',
        ],
        errs: ['Levantar o calcanhar para ganhar amplitude falsa.', 'Joelho caindo para dentro.'],
      },
      {
        name: 'Agachamento com apoio (goblet hold)',
        obj: 'Sustentar a posição de fundo e abrir o quadril ativamente.',
        sets: '3',
        reps: '40s',
        rest: '45s',
        cues: ['Cotovelos empurram os joelhos para fora.', 'Peito alto, coluna longa.', 'Respire 4 ciclos no fundo.'],
        errs: ['Arredondar a lombar no fundo.', 'Peso todo na ponta do pé.'],
      },
      {
        name: 'Alongamento ativo de cadeia posterior',
        obj: 'Liberar isquiotibiais e panturrilha sem perder tensão ativa.',
        sets: '2',
        reps: '45s /lado',
        rest: '20s',
        cues: ['Quadril alto, joelho levemente flexionado.', 'Puxe a ponta do pé em direção à canela.'],
        errs: ['Forçar o joelho em extensão total.', 'Prender a respiração.'],
      },
      {
        name: 'Mobilização torácica no rolo',
        obj: 'Extensão torácica para melhorar front rack e overhead.',
        sets: '2',
        reps: '8 reps',
        rest: '30s',
        cues: ['Rolo na altura das escápulas.', 'Quadril no chão, costelas fechadas.'],
        errs: ['Estender pela lombar em vez do torácico.'],
      },
    ],
  },
  {
    id: 'gin',
    name: 'GINÁSTICA',
    glyph: 'G',
    prio: 'PROGRESSÃO',
    meta: '18 MIN · HANDSTAND FOUNDATION',
    obj: 'Construir suporte de ombro e controle invertido.',
    tags: ['OMBRO', 'CORE', 'SUPORTE'],
    area: 'GINÁSTICA',
    limit: 'SUPORTE DE PESO INVERTIDO',
    ex: [
      {
        name: 'Pike position no banco',
        obj: 'Acostumar o ombro a sustentar carga em ângulo fechado.',
        sets: '4',
        reps: '30s',
        rest: '60s',
        cues: ['Ombros à frente das mãos.', 'Empurre o chão e eleve as escápulas.'],
        errs: ['Cotovelos flexionados.', 'Lombar em hiperextensão.'],
      },
      {
        name: 'Wall walk parcial',
        obj: 'Transferir o peso para as mãos com controle.',
        sets: '3',
        reps: '4 reps',
        rest: '75s',
        cues: ['Mãos caminham em passos curtos.', 'Costelas fechadas, glúteo ativo.'],
        errs: ['Descer em queda livre.', 'Cabeça olhando para a parede.'],
      },
      {
        name: 'Hollow hold',
        obj: 'Core em linha — pré-requisito do handstand livre.',
        sets: '3',
        reps: '30s',
        rest: '45s',
        cues: ['Lombar pressionada no chão.', 'Braços ao lado das orelhas.'],
        errs: ['Lombar arqueada.', 'Queixo projetado.'],
      },
    ],
  },
  {
    id: 'core',
    name: 'CORE',
    glyph: 'C',
    prio: 'OPCIONAL',
    meta: '8 MIN · FINISHER',
    obj: 'Compressão ativa para toes-to-bar e estabilidade em ciclos longos.',
    tags: ['COMPRESSÃO', 'ANTI-EXTENSÃO'],
    area: 'CORE',
    limit: 'COMPRESSÃO ATIVA',
    ex: [
      {
        name: 'V-up progressivo',
        obj: 'Compressão coordenada de quadril e tronco.',
        sets: '3',
        reps: '12 reps',
        rest: '40s',
        cues: ['Movimento simultâneo de braços e pernas.', 'Desça devagar.'],
        errs: ['Usar impulso do pescoço.', 'Pernas flexionando por cadência.'],
      },
      {
        name: 'Hollow rock',
        obj: 'Manter tensão em linha durante o balanço.',
        sets: '3',
        reps: '20 reps',
        rest: '40s',
        cues: ['Balanço vem do tronco, não das pernas.'],
        errs: ['Perder o contato lombar com o chão.'],
      },
    ],
  },
];

export function getBlock(id: string): ComplementaryBlock | undefined {
  return BLOCKS.find((b) => b.id === id);
}

// --- Progressions (2.5) — extensible: these are only the seeded defaults. ---
// Real state lives in AppData.progressionDefs/progressions from here on;
// this catalog is the one-time seed (first load + v1->v2 migration), not a
// runtime source of truth. Steps reflect standard, widely-taught staging for
// each skill — general coaching knowledge, not medical/physio claims.

export const DEFAULT_PROGRESSION_DEFS: ProgressionDef[] = [
  {
    id: 'handstand',
    name: 'HANDSTAND',
    source: 'catalog',
    steps: [
      'Mobilidade overhead',
      'Suporte de peso',
      'Pike position',
      'Wall walk',
      'Handstand na parede',
      'Controle de handstand',
      'Handstand livre',
    ],
    criteria: [],
  },
  {
    id: 'handstand-walk',
    name: 'HANDSTAND WALK',
    source: 'catalog',
    steps: [
      'Handstand livre consistente (30s+)',
      'Transferência de peso lateral na parede',
      'Primeiros passos com apoio',
      'Handstand walk 3m',
      'Handstand walk 6m+ com mudança de direção',
    ],
    criteria: [],
  },
  {
    id: 'pullup',
    name: 'PULL-UP',
    source: 'catalog',
    steps: ['Scapular pull', 'Hold ativo', 'Negativa 5s', 'Pull-up estrita', '8 reps estritas', 'Chest-to-bar'],
    criteria: [],
  },
  {
    id: 'chest-to-bar',
    name: 'CHEST-TO-BAR',
    source: 'catalog',
    steps: ['Pull-up estrita consistente', 'Pull-up kipping', 'C2B kipping isolado', '5 C2B seguidos', 'C2B em série (WOD)'],
    criteria: [],
  },
  {
    id: 'toes-to-bar',
    name: 'TOES-TO-BAR',
    source: 'catalog',
    steps: ['Hollow hold na barra', 'Knee raise controlado', 'Toes-to-bar estrito', 'Kipping toes-to-bar', 'T2B em série (WOD)'],
    criteria: [],
  },
  {
    id: 'double-unders',
    name: 'DOUBLE UNDERS',
    source: 'catalog',
    steps: ['Single unders consistentes', 'Timing de salto/pulso', 'Double unders isolados (1-3)', '10 seguidos', 'Sem quebrar em WOD'],
    criteria: [],
  },
  {
    id: 'muscle-up',
    name: 'MUSCLE-UP',
    source: 'catalog',
    steps: [
      'Pull-up + dip estritos isolados',
      'Transição na argola/barra baixa',
      'Kipping muscle-up com banda',
      'Muscle-up estrito ou kipping livre',
      'Múltiplos em série (WOD)',
    ],
    criteria: [],
  },
];

// --- Benchmark workouts (2.4) — publicly known CrossFit named WODs. -------
// Structure only (format/movements/scheme) is seeded; results are never
// fabricated — every attempt comes from what the user actually logs.

function wm(name: string, reps: string, load = ''): { id: string; name: string; reps: string; load: string } {
  return { id: `wm_${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, reps, load };
}

export const BENCHMARK_WORKOUTS: WorkoutDef[] = [
  {
    id: 'bm_fran',
    name: 'Fran',
    isBenchmark: true,
    source: 'catalog',
    format: 'rounds-reps',
    timeCapSec: null,
    scheme: '21-15-9',
    movements: [wm('Thruster', '21-15-9', '43/30kg'), wm('Pull-up', '21-15-9')],
    notes: '',
  },
  {
    id: 'bm_grace',
    name: 'Grace',
    isBenchmark: true,
    source: 'catalog',
    format: 'for-time',
    timeCapSec: null,
    scheme: '30 reps',
    movements: [wm('Clean and jerk', '30', '61/43kg')],
    notes: '',
  },
  {
    id: 'bm_diane',
    name: 'Diane',
    isBenchmark: true,
    source: 'catalog',
    format: 'rounds-reps',
    timeCapSec: null,
    scheme: '21-15-9',
    movements: [wm('Deadlift', '21-15-9', '102/70kg'), wm('Handstand push-up', '21-15-9')],
    notes: '',
  },
  {
    id: 'bm_murph',
    name: 'Murph',
    isBenchmark: true,
    source: 'catalog',
    format: 'chipper',
    timeCapSec: null,
    scheme: '1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run',
    movements: [
      wm('Run', '1 mile'),
      wm('Pull-up', '100'),
      wm('Push-up', '200'),
      wm('Air squat', '300'),
      wm('Run', '1 mile'),
    ],
    notes: 'Tradicionalmente com colete (20/14kg) quando RX.',
  },
  {
    id: 'bm_helen',
    name: 'Helen',
    isBenchmark: true,
    source: 'catalog',
    format: 'for-time',
    timeCapSec: null,
    scheme: '3 rounds',
    movements: [wm('Run', '400m'), wm('Kettlebell swing', '21', '24/16kg'), wm('Pull-up', '12')],
    notes: '',
  },
  {
    id: 'bm_cindy',
    name: 'Cindy',
    isBenchmark: true,
    source: 'catalog',
    format: 'amrap',
    timeCapSec: 1200,
    scheme: 'AMRAP 20min',
    movements: [wm('Pull-up', '5'), wm('Push-up', '10'), wm('Air squat', '15')],
    notes: '',
  },
  {
    id: 'bm_annie',
    name: 'Annie',
    isBenchmark: true,
    source: 'catalog',
    format: 'rounds-reps',
    timeCapSec: null,
    scheme: '50-40-30-20-10',
    movements: [wm('Double under', '50-40-30-20-10'), wm('Sit-up', '50-40-30-20-10')],
    notes: '',
  },
  {
    id: 'bm_karen',
    name: 'Karen',
    isBenchmark: true,
    source: 'catalog',
    format: 'for-time',
    timeCapSec: null,
    scheme: '150 reps',
    movements: [wm('Wall ball', '150', '9/6kg')],
    notes: '',
  },
];

export function getWorkoutDefaults(): WorkoutDef[] {
  return BENCHMARK_WORKOUTS.map((w) => ({ ...w, movements: w.movements.map((m) => ({ ...m })) }));
}

// --- WOD -> movement -> limitation-area keywords (recommendation chain) ---
// Static, inspectable rule table: general CrossFit coaching knowledge about
// which mobility/stability areas a movement typically stresses. Used only to
// match against limitations the user actually entered — never invents a
// limitation or a conclusion the data doesn't support.

export const MOVEMENT_LIMITATION_KEYWORDS: Record<string, string[]> = {
  'pull-up': ['suporte de peso invertido', 'ombro', 'compressão'],
  'chest-to-bar': ['suporte de peso invertido', 'ombro'],
  'toes-to-bar': ['compressão ativa', 'core'],
  'toes to bar': ['compressão ativa', 'core'],
  't2b': ['compressão ativa', 'core'],
  'muscle-up': ['suporte de peso invertido', 'ombro', 'compressão'],
  handstand: ['suporte de peso invertido', 'ombro overhead'],
  hspu: ['suporte de peso invertido', 'ombro overhead'],
  'handstand push-up': ['suporte de peso invertido', 'ombro overhead'],
  'overhead squat': ['ombro overhead', 'dorsiflexão de tornozelo', 'quadril'],
  thruster: ['ombro overhead', 'dorsiflexão de tornozelo'],
  'push press': ['ombro overhead', 'extensão torácica'],
  'push jerk': ['ombro overhead', 'extensão torácica'],
  jerk: ['ombro overhead', 'extensão torácica'],
  snatch: ['ombro overhead', 'quadril', 'dorsiflexão de tornozelo'],
  'wall ball': ['dorsiflexão de tornozelo', 'quadril'],
  'front squat': ['extensão torácica', 'dorsiflexão de tornozelo'],
  'back squat': ['dorsiflexão de tornozelo', 'quadril'],
  'air squat': ['dorsiflexão de tornozelo', 'quadril'],
  'box jump': ['dorsiflexão de tornozelo', 'quadril'],
  'double under': ['dorsiflexão de tornozelo'],
  'double unders': ['dorsiflexão de tornozelo'],
};

export type { WodFormat };
