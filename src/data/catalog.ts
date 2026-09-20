import type { ComplementaryBlock } from '../types';

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

export interface ProgressionDef {
  id: string;
  name: string;
  steps: string[];
}

export const PROGRESSION_DEFS: ProgressionDef[] = [
  {
    id: 'handstand',
    name: 'HANDSTAND',
    steps: [
      'Mobilidade overhead',
      'Suporte de peso',
      'Pike position',
      'Wall walk',
      'Handstand na parede',
      'Controle de handstand',
      'Handstand livre',
    ],
  },
  {
    id: 'pullup',
    name: 'PULL-UP',
    steps: ['Scapular pull', 'Hold ativo', 'Negativa 5s', 'Pull-up estrita', '8 reps estritas', 'Chest-to-bar'],
  },
];

export function getProgressionDef(id: string): ProgressionDef | undefined {
  return PROGRESSION_DEFS.find((p) => p.id === id);
}
