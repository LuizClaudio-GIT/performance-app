import type {
  ChecklistItem,
  ComplementaryBlock,
  DailyStat,
  Limitation,
  Macro,
  Meal,
  Measure,
  MoreLink,
  Progression,
  WeekDay,
} from '../types';

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
    obj: 'Construir suporte de ombro e controle invertido — etapa 3 de 7.',
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

export const HANDSTAND_STEPS = [
  'Mobilidade overhead',
  'Suporte de peso',
  'Pike position',
  'Wall walk',
  'Handstand na parede',
  'Controle de handstand',
  'Handstand livre',
];
export const HANDSTAND_CURRENT = 2;

export const PULLUP_STEPS = ['Scapular pull', 'Hold ativo', 'Negativa 5s', 'Pull-up estrita', '8 reps estritas', 'Chest-to-bar'];
export const PULLUP_CURRENT = 3;

export const PROGRESSIONS: Progression[] = [
  {
    name: 'HANDSTAND',
    stageLabel: 'ETAPA 3 / 7',
    note: 'Onde estou → próximo passo → objetivo. Sem pular fases.',
    steps: HANDSTAND_STEPS,
    current: HANDSTAND_CURRENT,
  },
  {
    name: 'PULL-UP',
    stageLabel: 'ETAPA 4 / 6',
    note: '4 reps estritas. Próximo passo: 8 reps sem quebra de linha.',
    steps: PULLUP_STEPS,
    current: PULLUP_CURRENT,
  },
];

export const CHECKLIST: ChecklistItem[] = [
  { id: 'c1', label: 'Treino de CrossFit', value: '07:00' },
  { id: 'c2', label: 'Mobilidade', value: '12 min' },
  { id: 'c3', label: 'Ginástica', value: '18 min' },
  { id: 'c4', label: 'Bater meta de água', value: '2,1 / 3,5 L' },
  { id: 'c5', label: 'Seguir alimentação', value: '60%' },
  { id: 'c6', label: 'Registrar peso', value: '113,8 kg' },
];

export const CHECKLIST_DEFAULT_DONE: Record<string, boolean> = {
  c1: true,
  c2: false,
  c3: false,
  c4: false,
  c5: false,
  c6: true,
};

export const DAILY_STATS: DailyStat[] = [
  { label: 'PESO', value: '113,8', sub: '-0,6 kg semana', pct: 60 },
  { label: 'PASSOS', value: '8.432', sub: 'meta 10k', pct: 84 },
  { label: 'ÁGUA', value: '2,1 L', sub: 'meta 3,5 L', pct: 60 },
];

export const WEEK: WeekDay[] = [
  { day: 'SEG', date: '21/09', box: 'CrossFit', work: [{ label: 'Mobilidade A', kind: 'done' }, { label: 'Core', kind: 'done' }], state: 'CONCLUÍDO' },
  { day: 'TER', date: '22/09', box: 'CrossFit', work: [{ label: 'Mobilidade B', kind: 'today' }, { label: 'Engine', kind: 'today' }], state: 'HOJE' },
  { day: 'QUA', date: '23/09', box: 'CrossFit', work: [{ label: 'Ginástica', kind: 'next' }, { label: 'Core', kind: 'next' }], state: 'PLANEJADO' },
  { day: 'QUI', date: '24/09', box: 'CrossFit', work: [{ label: 'Mobilidade B', kind: 'next' }, { label: 'Técnica', kind: 'next' }], state: 'PLANEJADO' },
  { day: 'SEX', date: '25/09', box: 'CrossFit', work: [{ label: 'Mobilidade C', kind: 'next' }, { label: 'Engine', kind: 'next' }], state: 'PLANEJADO' },
  { day: 'SÁB', date: '26/09', box: '—', work: [{ label: 'Skill opcional', kind: 'next' }], state: 'LEVE' },
  { day: 'DOM', date: '27/09', box: '—', work: [{ label: 'Recuperação', kind: 'rest' }], state: 'DESCANSO' },
];

export const KCAL_NOW = '1.140';
export const KCAL_NOW_VALUE = 1140;
export const KCAL_GOAL = 1900;

export const MACROS: Macro[] = [
  { name: 'Proteína', val: '148 / 200 g', pct: 74 },
  { name: 'Carboidrato', val: '120 / 190 g', pct: 63 },
  { name: 'Gordura', val: '32 / 70 g', pct: 46 },
];

export const MEALS: Meal[] = [
  { id: 'm1', name: 'Café da manhã', time: '07:00', kcal: '480', prot: '38 g', items: 'Ovos, aveia, banana, pasta de amendoim' },
  { id: 'm2', name: 'Lanche da manhã', time: '10:00', kcal: '240', prot: '25 g', items: 'Iogurte grego + whey + frutas' },
  { id: 'm3', name: 'Almoço', time: '13:00', kcal: '620', prot: '52 g', items: 'Arroz, feijão, frango grelhado, salada' },
  { id: 'm4', name: 'Lanche da tarde', time: '16:30', kcal: '260', prot: '28 g', items: 'Tapioca com frango desfiado' },
  { id: 'm5', name: 'Jantar', time: '20:00', kcal: '300', prot: '45 g', items: 'Peixe, legumes assados, batata-doce' },
];

export const MEALS_DEFAULT_DONE: Record<string, boolean> = {
  m1: true,
  m2: true,
  m3: false,
  m4: false,
  m5: false,
};

export const WATER_DEFAULT = 2.1;
export const WATER_GOAL = 3.5;
export const WATER_STEP = 0.25;

export const METRICS: import('../types').Metric[] = [
  { name: 'Peso', value: '113,8 kg', base: '116,4', delta: '-2,6 kg', data: [1, 0.9, 0.8, 0.75, 0.6, 0.5] },
  { name: 'Pull-ups', value: '4 reps', base: '0', delta: '+4', data: [0, 0, 0.2, 0.4, 0.6, 0.9] },
  { name: 'Deadlift', value: '160 kg', base: '120', delta: '+40 kg', data: [0.1, 0.3, 0.4, 0.6, 0.75, 0.9] },
  { name: '5 km', value: '31:20', base: '36:10', delta: '-4:50', data: [1, 0.85, 0.7, 0.6, 0.45, 0.3] },
  { name: 'Handstand', value: '12 s', base: '0 s', delta: '+12 s', data: [0, 0.1, 0.2, 0.45, 0.6, 0.8] },
  { name: 'Dorsiflexão', value: '11 cm', base: '6 cm', delta: '+5 cm', data: [0.15, 0.3, 0.4, 0.55, 0.7, 0.85] },
];

export const MEASURES: Measure[] = [
  { name: 'Peso', base: '116,4 kg', now: '113,8 kg', delta: '-2,6' },
  { name: 'Gordura corporal', base: '28,4%', now: '25,1%', delta: '-3,3' },
  { name: 'Cintura', base: '104 cm', now: '98 cm', delta: '-6' },
  { name: 'Peito', base: '108 cm', now: '109 cm', delta: '+1' },
  { name: 'Braço', base: '36 cm', now: '37,5 cm', delta: '+1,5' },
  { name: 'Coxa', base: '62 cm', now: '63 cm', delta: '+1' },
];

export const LIMITATIONS: Limitation[] = [
  { area: 'Dorsiflexão de tornozelo', note: 'Agachamento perde profundidade aos 90°', pct: 55 },
  { area: 'Extensão torácica', note: 'Front rack com cotovelos baixos', pct: 40 },
  { area: 'Ombro overhead', note: 'Perda de linha no press acima da cabeça', pct: 35 },
  { area: 'Compressão ativa', note: 'Toes-to-bar sem controle de balanço', pct: 60 },
];

export const MORE_LINKS: MoreLink[] = [
  { label: 'Progressões', hint: '7 habilidades', go: 'evo' },
  { label: 'Histórico de sessões', hint: '38 registros' },
  { label: 'Biblioteca de exercícios', hint: '142 vídeos' },
  { label: 'Plano semanal do box', hint: 'Semana 01' },
  { label: 'Configurações', hint: 'Notificações · unidades' },
];

export const PROFILE = {
  name: 'RAFAEL M.',
  meta: 'BOX PERFORMANCE · SEMANA 01 · FOUNDATION',
  status: 'ATIVO',
  sessionsCount: 38,
  streakDays: 11,
};

export const WEEK_DOT_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
export const WEEK_DOT_CURRENT_INDEX = 0;
