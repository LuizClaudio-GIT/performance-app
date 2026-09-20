# Performance

App pessoal de acompanhamento de evolução no CrossFit — treino, alimentação, hidratação, peso, medidas, benchmarks e progressões de habilidades, com o objetivo de longo prazo de evoluir até nível competitivo.

Roda 100% no navegador, sem backend: os dados ficam no `localStorage` do dispositivo.

## Stack

- React 18 + TypeScript
- Vite (dev server e build)
- Vitest + Testing Library (testes)
- CSS puro (sem framework de UI), tokens de design em `src/styles/tokens.css`

## Instalação

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

Abre o Vite dev server (por padrão em `http://localhost:5173`).

## Testes

```bash
npm test        # roda a suíte uma vez (vitest run)
npm run test:watch  # modo watch
```

## Build de produção

```bash
npm run build   # tsc -b && vite build — gera dist/
npm run preview # serve o build gerado localmente
```

## Typecheck

```bash
npm run lint     # tsc --noEmit
```

## Arquitetura resumida

```
src/
  data/        modelo de dados (schema.ts), catálogo de exercícios/progressões (catalog.ts, conteúdo estático), seed de demonstração (seed.ts)
  storage/     camada de leitura/escrita em localStorage, versionamento de schema, export/import
  state/       AppState.tsx (Context + Provider, única fonte de verdade da UI) e logic.ts (funções puras de derivação: checklist, status semanal, séries de métricas, ciclo de vida de sessão)
  components/  UI por aba (hoje, semana, alimentacao, evolucao, mais), session/ (overlay de treino complementar), common/ (Modal, Toast, ConfirmDialog, LogStatModal), layout/ (Header, BottomNav, SidePanel)
  lib/date.ts  utilitários de data/hora reais em pt-BR (sem hardcode de datas)
  styles/      CSS por área + tokens.css (cores, fontes, breakpoint)
```

Fluxo de dados: `AppState.tsx` carrega o `AppData` do storage uma vez, expõe ações (métodos) que mutam o estado React e persistem a cada mudança (com pequeno debounce). Os componentes de tela não tocam o storage diretamente — sempre passam por `useAppState()`. A lógica de derivação (o que conta como "concluído hoje", séries para gráficos, etc.) fica isolada em `state/logic.ts`, testada sem precisar renderizar componentes.

## Persistência / localStorage

- Chave única: `performance:v1`.
- Schema versionado (`SCHEMA_VERSION` em `src/data/schema.ts`). Uma versão incompatível ou JSON corrompido faz o app reiniciar com dados de demonstração — **não há migração de schema no momento** (ver Limitações).
- Primeira execução sem nada salvo: o app é inicializado a partir de `src/data/seed.ts` (dados de demonstração, ancorados na semana real atual). A partir daí, toda edição do usuário é dado real.
- Em "Mais → Limpar dados" o usuário pode apagar tudo ou restaurar a demonstração, sempre com confirmação.
- Export/Import: "Mais → Exportar/Importar backup" baixa/lê um `.json` com o `AppData` completo, validando `schemaVersion` no import.

## Principais funcionalidades do MVP

- **Hoje**: data real, WOD do box (texto livre + marcar concluído), blocos complementares planejados, checklist do dia (derivado de dados reais, não uma lista separada), registro de peso/passos/água.
- **Sessão complementar**: reps/carga/tempo/observação por série, pausar, avançar/voltar entre exercícios, saída segura (auto-salva em progresso, confirmação para abandonar), sessão em andamento sobrevive a refresh.
- **Semana**: janela real de 7 dias (segunda a domingo), edição da programação por dia (tipo de dia, WOD, blocos complementares), status calculado a partir do que foi realmente concluído.
- **Alimentação**: CRUD completo de refeições, anel de kcal e barra de proteína calculados a partir de refeições marcadas como feitas, registro de água.
- **Evolução**: séries de peso, medidas corporais e "performance" (benchmarks) com sparkline e delta base→atual; progressões de habilidade (handstand, pull-up) com etapas navegáveis.
- **Mais**: perfil/metas editáveis, limitações (CRUD), histórico de sessões, sequência de dias ativos, export/import de backup, limpar dados.

## Limitações conhecidas

- **Uma sessão de treino ativa por vez** — iniciar outro bloco enquanto um está em andamento substitui a sessão anterior, sem aviso.
- **Sem migração de schema** — só existe a versão 1 do formato; uma mudança futura de schema precisará de lógica própria de migração.
- **Sem PWA/instalação como app** — roda como site; adicionar manifest/service worker fica para uma etapa futura.
- **Passos são só manuais** — o campo existe e é editável, mas não há integração com sensor do celular.
- **WOD do box é texto livre + booleano** — não há formato estruturado (AMRAP/EMOM/For Time), resultado (tempo/rounds+reps/carga por movimento) ou RX/scaled. Essa é a limitação mais relevante do produto hoje e é o foco da Fase 2 (ver `docs/ROADMAP.md`).
- **Dados das sessões complementares não alimentam a Evolução** — reps/carga/tempo são registrados por série, mas hoje não viram gráfico de progresso nenhum.
- **Progressões são fixas e não têm histórico de data** — só handstand e pull-up existem, não são extensíveis pelo usuário, e o avanço de etapa não registra quando aconteceu.

Contexto de continuidade para desenvolvimento (arquitetura, regras e roadmap detalhado) está em [`CLAUDE.md`](./CLAUDE.md) e [`docs/ROADMAP.md`](./docs/ROADMAP.md).
