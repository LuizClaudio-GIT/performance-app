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
src/data/schema.ts      modelo de dados central (AppData) + SCHEMA_VERSION + isAppData() (type guard usado no load/import)
src/data/catalog.ts     conteúdo estático curado (blocos complementares, exercícios, definições de progressão) — não é dado do usuário, não muda em runtime
src/data/seed.ts        gera AppData de demonstração ancorado na semana real (usado só quando o storage está vazio/corrompido)
src/storage/store.ts    leitura/escrita em localStorage (chave "performance:v1"), export/import, sempre com try/catch em volta de JSON parse/stringify
src/state/logic.ts       funções PURAS de derivação (sem React, sem storage) — checklist do dia, status semanal, séries de métricas, ciclo de vida de sessão. É aqui que a maior parte dos testes de regra de negócio vive.
src/state/AppState.tsx   Context + Provider. Única fonte de verdade da UI: carrega o storage uma vez, expõe ações que mutam AppData e persistem (debounced). Componentes NUNCA tocam storage.ts diretamente.
src/lib/date.ts          utilitários de data real em pt-BR — nunca hardcodar datas em componentes ou seed
src/components/          UI por aba + primitives comuns (Modal, Toast, ConfirmDialog, LogStatModal)
```

Fluxo de dados: `AppState.tsx` → hooks (`useAppState`, `useTodayPlan`, `useTodayMeals`, `useTodayWater`) → componentes. Regra de derivação nova? Vai em `logic.ts` como função pura testável, não inline no componente.

## Estrutura de dados atual (`src/data/schema.ts`)

`AppData` é o objeto raiz salvo no localStorage. Campos principais:
- `profile`, `goals` — perfil e metas editáveis.
- `dayPlans: Record<isoDate, DayPlan>` — programação por dia (tipo, WOD do box como **texto livre**, blocos complementares planejados, nota).
- `boxWorkoutDone: Record<isoDate, boolean>` — conclusão do WOD do box é hoje só um booleano, sem resultado. **Isso muda na Fase 2** (ver roadmap).
- `meals`, `water`, `steps`, `weightLog`, `metrics` (measure/benchmark) — dados de alimentação, hidratação, peso e métricas de performance/medidas.
- `sessions: SessionLog[]` + `activeSession` — histórico e sessão em andamento das sessões complementares, com `ExerciseLog[]` → `SetLog[]` (reps/carga/tempo/nota/done por série). **Esse dado rico não é lido em nenhum lugar fora do histórico de sessões — não alimenta Evolução hoje.**
- `limitations`, `progressions` — limitações do atleta e progressões de habilidade (só `handstand`/`pullup` existem em `catalog.ts`, fixas).
- `settings` — flags simples (notificações).

`isAppData()` é o type guard usado tanto no load inicial quanto no import de backup — qualquer campo novo adicionado ao `AppData` deve ser refletido aqui também, senão o import/load trata dado válido como inválido.

## Decisões importantes (por que as coisas são como são)

1. **localStorage sem backend** — decisão explícita do usuário para o MVP. Não introduzir sync remoto/autenticação sem pedido explícito.
2. **Seed vs. dado real** — `seed.ts` só roda quando storage está vazio ou incompatível. Uma vez que o usuário edita algo, tudo é dado real; não há "modo demo" paralelo.
3. **Sem migração de schema** — `SCHEMA_VERSION` mudou nunca até agora. Se um campo obrigatório for adicionado/removido em `AppData`, será necessário decidir entre (a) escrever uma função de migração explícita chamada em `loadAppData()`/`parseBackup()`, ou (b) aceitar que dados antigos incompatíveis reiniciam como seed (perda de dado do usuário — evitar se possível, uma vez que o app tiver uso real).
4. **`activeSession` separado da "visão aberta" da sessão** — bug real já corrigido: `startSession` deve *retomar* uma sessão em andamento para aquele `blockId`, nunca recriar do zero. Se mexer no ciclo de vida de sessão, preservar esse comportamento (testado em `AppState.test.tsx`).
5. **`weekDayStatus` — "hoje" sempre vence o rótulo**, mesmo em dia de descanso/leve. Outro bug real já corrigido (o destaque visual do dia atual dependia desse texto). Não inverter a ordem de checagem em `logic.ts`.
6. **Catálogo de exercícios é conteúdo estático, não dado do usuário** — vive em `catalog.ts`, é curado manualmente. Isso muda quando progressões passarem a ser extensíveis (Fase 2.5) — nesse ponto parte do catálogo migra para dado do usuário em `AppData`.
7. **Sem redesign visual** — `src/styles/*` e os tokens em `tokens.css` são a identidade visada desde o handoff original. Mudanças de produto devem reaproveitar os tokens existentes, não introduzir nova linguagem visual sem pedido explícito.

## Regras para alterações futuras

- Toda nova regra de derivação de dado (o que conta como "feito", cálculo de série, status) entra em `state/logic.ts` como função pura + teste em `logic.test.ts`. Não calcular isso inline em componentes.
- Mudança em `AppData`/`schema.ts` exige: atualizar `isAppData()`, decidir a estratégia de migração/compatibilidade (ver decisão 3), e atualizar `seed.ts` se o campo precisa de dado de demonstração coerente.
- Inputs numéricos em mobile devem usar `inputMode="numeric"`/`"decimal"` (padrão já usado em `LogStatModal` e replicado em `SessionOverlay`) — não deixar campo numérico sem isso.
- Antes de considerar uma feature pronta: `npm run lint`, `npm test`, `npm run build` limpos, e testar o fluxo manualmente no navegador quando a mudança for de UI (o histórico já mostra dois bugs reais que só apareceram testando de verdade, não só por inspeção de código).
- Commits pequenos e descritivos; branch de trabalho atual é `feat/performance-mvp-funcional`. Push só quando pedido explicitamente; merge em `main` e abertura de PR só quando pedido explicitamente — nunca por iniciativa própria.

## Estado atual do projeto

MVP funcional fechado: as 5 telas (Hoje, Semana, Alimentação, Evolução, Mais) e o fluxo de sessão complementar têm CRUD real sobre dado persistido, com 37 testes cobrindo storage, datas, regras de negócio e integração de estado. `tsc --noEmit`, `vitest run` e `npm run build` passam limpos.

Uma auditoria de produto (ver `docs/ROADMAP.md`) identificou que o maior gap do MVP frente ao objetivo do usuário (evolução até nível competitivo) é a ausência de: WOD estruturado com resultado, ligação entre sessões registradas e a aba Evolução, e conceito real de PR (melhor histórico, não último valor). Isso é deliberadamente **fora do escopo do MVP atual** e vira a Fase 2 do roadmap — não implementar essas mudanças sem que a Fase 2 seja explicitamente iniciada pelo usuário.

Branch `feat/performance-mvp-funcional` está publicada em `origin`, sem PR aberto e sem merge em `main` — aguardando decisão do usuário sobre quando abrir o PR.
