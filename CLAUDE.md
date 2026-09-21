# CLAUDE.md — continuidade para agentes

Este arquivo é o documento de handoff para qualquer instância (humana ou agente) que continue o desenvolvimento do Performance. Leia isto antes de tocar em código. Para visão de produto/roadmap, veja `docs/ROADMAP.md`; para instruções de uso/instalação, veja `README.md`.

## O que é o projeto

Performance é o app pessoal de acompanhamento de evolução em CrossFit do usuário (dono do repositório), com objetivo de longo prazo de evoluir até nível competitivo. Não é um CRUD de treino genérico — cada decisão de produto deve ser avaliada sob a ótica de "isso ajuda um atleta a registrar e evoluir sua performance real?".

Origem: nasceu como handoff visual do Claude Design (`project/Performance App.dc.html`, `chats/chat1.md` — brief original, só interessa para entender a identidade visual). Foi reimplementado em React e depois transformado de protótipo estático em app funcional persistido.

## Stack e comandos

React 18 + TypeScript + Vite. Testes com Vitest + Testing Library. Sem backend — `localStorage` puro.

```bash
npm install
npm run dev        # dev server
npm run lint        # tsc --noEmit
npm test            # vitest run
npm run test:watch
npm run build        # tsc -b && vite build
npm run preview
```

Antes de qualquer commit: `npm run lint`, `npm test`, `npm run build` devem passar limpos. Não há CI configurado — a validação é manual.

## Arquitetura

```
src/data/schema.ts      modelo de dados central (AppData) + SCHEMA_VERSION (hoje 2) + isAppData()/looksLikeMigratableAppData() (type guards usados no load/import)
src/data/migrations.ts  cadeia de migração versionada (hoje só migrateV1toV2) — nunca resetar dado do usuário por causa de mudança de schema, ver "Regras para alterações futuras"
src/data/catalog.ts     conteúdo estático curado: blocos complementares/exercícios, DEFAULT_PROGRESSION_DEFS (seed inicial — real state vive em AppData.progressionDefs), BENCHMARK_WORKOUTS (WODs nomeados públicos), MOVEMENT_LIMITATION_KEYWORDS (tabela estática usada pelo motor de recomendação)
src/data/seed.ts        gera AppData de demonstração ancorado na semana real (usado só quando o storage está vazio/corrompido) — persona claramente fictícia
src/storage/store.ts    leitura/escrita em localStorage (chave "performance:v1"), roda a cadeia de migração no load e no import, export/import, sempre com try/catch em volta de JSON parse/stringify
src/state/logic.ts       funções PURAS de derivação (sem React, sem storage) — checklist do dia, status semanal, PR de métrica (best real, não "último valor"), histórico/volume/carga por exercício (a partir de SessionLog.exercises[].sets[], pulando o que não é parseável). Maior parte dos testes de regra de negócio vive aqui.
src/state/workouts.ts    comparação de resultado de WOD por formato (compareWodResult), detecção de PR de WOD (isNewWorkoutPR), busca de "última vez"/melhor tentativa por WorkoutDef ou por label.
src/state/recommend.ts   motor de recomendação baseado em regras (WOD -> movimentos -> limitações -> bloco complementar; nota de recuperação por RPE/dor recentes). Toda saída é rastreável a MOVEMENT_LIMITATION_KEYWORDS + dado real do usuário — nunca uma conclusão inventada. Ver decisão 8 abaixo antes de mexer aqui.
src/state/AppState.tsx   Context + Provider. Única fonte de verdade da UI: carrega o storage uma vez, expõe ações que mutam AppData e persistem (debounced). Componentes NUNCA tocam storage.ts diretamente.
src/lib/date.ts          utilitários de data real em pt-BR — nunca hardcodar datas em componentes ou seed
src/components/          UI por aba + primitives comuns (Modal, Toast, ConfirmDialog, LogStatModal)
```

Fluxo de dados: `AppState.tsx` → hooks (`useAppState`, `useTodayPlan`, `useTodayMeals`, `useTodayWater`) → componentes. Regra de derivação nova? Vai em `logic.ts` (ou `workouts.ts`/`recommend.ts` se for especificamente sobre comparação de WOD ou recomendação) como função pura testável, não inline no componente.

## Estrutura de dados atual (`src/data/schema.ts`, v2)

`AppData` é o objeto raiz salvo no localStorage. Campos principais:
- `profile`, `goals` — perfil e metas editáveis.
- `dayPlans: Record<isoDate, DayPlan>` — programação por dia: `boxWorkoutBody` (texto livre, continua existindo para quem só quer colar o WOD do quadro) + `wodPlan: WodPlan | null` (estrutura opcional: formato, time cap, esquema, `WodMovement[]`), blocos complementares planejados, nota.
- `boxWorkoutDone: Record<isoDate, boolean>` — continua existindo (toggle rápido); registrar um `WorkoutAttempt` do tipo `daily` também marca isso automaticamente.
- `meals`, `water`, `steps`, `weightLog` — alimentação, hidratação, peso.
- `metrics: MetricEntry[]` — measure/benchmark, agora com `direction: 'higher-better' | 'lower-better'` (PR é calculado respeitando isso, não é mais "último valor").
- `sessions: SessionLog[]` + `activeSession` — histórico e sessão em andamento das sessões complementares, com `ExerciseLog[]` → `SetLog[]` (reps/carga/tempo/nota/done por série). **Esse dado agora alimenta a aba Evolução → Treinos** via `state/logic.ts` (`exerciseHistory`/`exerciseBestLoadSeries`/etc.), pulando sets não-parseáveis em vez de fabricar número.
- `workoutDefs: WorkoutDef[]` — WODs nomeados (catálogo de benchmarks públicos + criados pelo usuário). `workoutAttempts: WorkoutAttempt[]` — toda tentativa de WOD registrada (diária ou benchmark), com `plan`+`result` estruturados.
- `limitations` — limitações do atleta (inalterado).
- `progressionDefs: ProgressionDef[]` — **extensível**, não mais fixo no código: seedado a partir de `catalog.DEFAULT_PROGRESSION_DEFS` na primeira execução/migração, usuário pode adicionar/editar/excluir os seus. `progressions: ProgressionState[]` — `currentIndex` + `history: ProgressionEvent[]` (data, direção avanço/regressão, observação).
- `recoveryLogs: Record<isoDate, RecoveryLog>` — RPE/energia/dor/observação por dia, auto-report do atleta, não diagnóstico.
- `settings` — flags simples (notificações).

`isAppData()` é o type guard que valida o shape ATUAL (pós-migração) — usado no load e no import, depois que `migrate()` já rodou. `looksLikeMigratableAppData()` é o check frouxo usado ANTES de migrar (aceita v1 ou v2). Qualquer campo novo obrigatório adicionado ao `AppData` exige: (1) atualizar `isAppData()`, (2) escrever uma migração em `migrations.ts` que popule o campo para dado antigo, (3) atualizar `seed.ts`.

## Decisões importantes (por que as coisas são como são)

1. **localStorage sem backend** — decisão explícita do usuário para o MVP. Não introduzir sync remoto/autenticação sem pedido explícito.
2. **Seed vs. dado real** — `seed.ts` só roda quando storage está vazio ou incompatível. Uma vez que o usuário edita algo, tudo é dado real; não há "modo demo" paralelo.
3. **Sem migração de schema** — `SCHEMA_VERSION` mudou nunca até agora. Se um campo obrigatório for adicionado/removido em `AppData`, será necessário decidir entre (a) escrever uma função de migração explícita chamada em `loadAppData()`/`parseBackup()`, ou (b) aceitar que dados antigos incompatíveis reiniciam como seed (perda de dado do usuário — evitar se possível, uma vez que o app tiver uso real).
4. **`activeSession` separado da "visão aberta" da sessão** — bug real já corrigido: `startSession` deve *retomar* uma sessão em andamento para aquele `blockId`, nunca recriar do zero. Se mexer no ciclo de vida de sessão, preservar esse comportamento (testado em `AppState.test.tsx`).
5. **`weekDayStatus` — "hoje" sempre vence o rótulo**, mesmo em dia de descanso/leve. Outro bug real já corrigido (o destaque visual do dia atual dependia desse texto). Não inverter a ordem de checagem em `logic.ts`.
6. **Catálogo de exercícios é conteúdo estático, não dado do usuário** — vive em `catalog.ts`, é curado manualmente. Isso muda quando progressões passarem a ser extensíveis (Fase 2.5) — nesse ponto parte do catálogo migra para dado do usuário em `AppData`.
7. **Sem redesign visual** — `src/styles/*` e os tokens em `tokens.css` são a identidade visada desde o handoff original. Mudanças de produto devem reaproveitar os tokens existentes, não introduzir nova linguagem visual sem pedido explícito. A tela Hoje teve o hero reduzido (~230px → ~168px de altura mínima) para dar mais espaço a informação acionável — ajuste de densidade, não redesign.
8. **Schema evolui por migração versionada, nunca por reset** — decisão da Fase 2. `SCHEMA_VERSION` mudou de 1 para 2; `migrations.ts` tem uma cadeia (`Record<fromVersion, MigrationFn>`) aplicada sequencialmente até a versão atual, tanto no load (`storage/store.ts`) quanto no import de backup. Só cai para seed se o JSON estiver corrompido ou a versão for mais nova do que este build sabe migrar (não existe caminho "de volta"). Ao adicionar uma v3 no futuro: escrever `migrateV2toV3`, registrar em `MIGRATIONS`, nunca remover a v1→v2 (backups antigos ainda podem existir).
9. **PR é o melhor histórico, respeitando direção — nunca "último valor"** — `MetricEntry.direction` e a comparação em `metricSeriesByName`/`isNewMetricPR` (métricas) e `compareWodResult`/`isNewWorkoutPR` (`state/workouts.ts`, WODs inteiros) existem justamente para isso. Ao adicionar qualquer nova métrica/resultado comparável, ele precisa de uma direção explícita (config, não uma suposição silenciosa no código). **RX e Scaled são categorias diferentes, nunca comparadas entre si** — bug real corrigido no fim da Fase 2 (commit `f3a7240`): um resultado Scaled mais rápido estava sendo registrado como PR sobre um recorde RX mais lento, e o "melhor resultado" de um benchmark podia mostrar um Scaled no lugar do RX. `isNewWorkoutPR` agora só compara uma tentativa contra tentativas anteriores da mesma `scale`; `bestDisplayAttempt` (não `bestWorkoutAttempt`, que é genérico) é a função a usar sempre que a UI mostra um "recorde"/"melhor resultado" de benchmark — ela prioriza o melhor RX e só cai para Scaled/Other quando não há nenhum RX registrado. O histórico completo (`attemptsForWorkoutDef`/`attemptsForLabel`) nunca filtra por categoria — todas as tentativas continuam visíveis e excluíveis individualmente. Coberto por teste em `state/workouts.test.ts`.
10. **Recomendação é sempre rule-based e rastreável, nunca "IA fake"** — `state/recommend.ts` só produz uma sugestão quando consegue apontar exatamente qual movimento (`WodMovement.name`), qual limitação (`Limitation.area`) e qual entrada de `MOVEMENT_LIMITATION_KEYWORDS`/`ComplementaryBlock.limit` embasam ela. Quando falta dado (sem movimentos cadastrados no WOD, sem limitações, sem match), a função retorna uma `note` explicando por quê — nunca inventa uma sugestão para preencher o espaço. Qualquer extensão desse motor deve manter essa propriedade. **Cuidado com matching por `tags`**: já houve um bug real aqui — o tag "CORE" do bloco GINÁSTICA (sobre estabilidade central em ginástica) colidia com a keyword "core" que deveria apontar para o bloco CORE (compressão ativa). A correção foi restringir o match a `block.limit`/`block.area` (campos estruturados e específicos), nunca a `tags` (mais genéricas/ambíguas). Coberto por teste em `state/recommend.test.ts`.
11. **Progressões são dado do usuário, não mais conteúdo estático** — `catalog.DEFAULT_PROGRESSION_DEFS` é só o seed inicial (primeira execução + migração v1→v2). O estado real vive em `AppData.progressionDefs`/`progressions`. Não adicionar uma nova habilidade só em `catalog.ts` esperando que ela apareça para usuários existentes — precisa de uma migração que a adicione a `progressionDefs` (ver decisão 8), como foi feito para toes-to-bar/double-unders/muscle-up/chest-to-bar/handstand-walk.
12. **Gate de PIN é deterrente, não segurança real** — o app é deployado publicamente (GitHub Pages, repo público, sem backend). `src/lib/lock.ts` + `src/components/common/LockGate.tsx` implementam uma tela de PIN opcional: `VITE_APP_PIN_HASH` (hash SHA-256, injetado via GitHub Actions secret `APP_PIN_HASH` no workflow de deploy) é comparado contra o hash do PIN digitado; sem essa env var, `isLockConfigured()` retorna `false` e o app abre sem gate — nunca trava o usuário por acidente por falta de configuração. Estado de desbloqueio fica em `localStorage` (`performance:unlocked`); "Mais → Bloquear app" limpa essa chave e recarrega. Como é um site estático com fonte pública, o hash é inspecionável no bundle — isso é uma limitação conhecida e aceita (documentada no README), não um bug a corrigir. Não trocar por "segurança real" (ex.: backend de auth) sem pedido explícito — foge do escopo "sem backend" do projeto.

## Regras para alterações futuras

- Toda nova regra de derivação de dado (o que conta como "feito", cálculo de série, status) entra em `state/logic.ts` como função pura + teste em `logic.test.ts`. Não calcular isso inline em componentes.
- Mudança em `AppData`/`schema.ts` exige: atualizar `isAppData()`, decidir a estratégia de migração/compatibilidade (ver decisão 3), e atualizar `seed.ts` se o campo precisa de dado de demonstração coerente.
- Inputs numéricos em mobile devem usar `inputMode="numeric"`/`"decimal"` (padrão já usado em `LogStatModal` e replicado em `SessionOverlay`) — não deixar campo numérico sem isso.
- Antes de considerar uma feature pronta: `npm run lint`, `npm test`, `npm run build` limpos, e testar o fluxo manualmente no navegador quando a mudança for de UI (o histórico já mostra dois bugs reais que só apareceram testando de verdade, não só por inspeção de código).
- Commits pequenos e descritivos; branch de trabalho atual é `feat/performance-mvp-funcional`. Push só quando pedido explicitamente; merge em `main` e abertura de PR só quando pedido explicitamente — nunca por iniciativa própria.

## Estado atual do projeto

MVP (Fase 1) mergeado em `main`. Fase 2 — Performance Esportiva implementada na branch `feat/performance-esportiva-wod`, cobrindo 2.1–2.6 do roadmap (WOD estruturado, evolução baseada em treinos, PRs reais, benchmarks, progressões extensíveis, Hoje inteligente) e a cadeia de recomendação WOD→movimentos→limitações→complementar (parcial — falta o eixo de histórico de volume, ver `docs/ROADMAP.md`). Auditoria final (2026-09-21) concluída: lint/testes/build limpos (83 testes), migração v1→v2 verificada sem perda de dado, regra RX/Scaled confirmada e testada, PR aberto para `main` aguardando revisão humana — merge não foi feito de forma autônoma.

Verificado tanto por testes automatizados quanto rodando o app de verdade no navegador (Playwright, viewport mobile) ponta a ponta: registro de resultado de WOD com comparação "última vez", detecção de PR (métrica e WOD), sessão completa alimentando Treinos/Evolução com números reais (inclusive confirmando que sets sem carga numérica são corretamente ignorados no cálculo de volume), criação de benchmark e progressão customizados. Zero erros de console nesses fluxos.

Status detalhado item a item (concluído/parcial/pendente/visão futura) em `docs/ROADMAP.md` — não presumir que algo do roadmap está pronto sem checar lá primeiro.
