# ROADMAP — Performance

_Última atualização: 2026-09-21 — branch `feat/performance-esportiva-wod`, auditoria final da Fase 2 concluída, aguardando merge em `main`_

## Onde estamos

O MVP (Fase 1) está fechado e mergeado em `main`. A Fase 2 — Performance Esportiva, abaixo, foi implementada nesta branch e passou por auditoria final completa (técnica, de código, de persistência e mobile) antes da abertura do PR para `main` — cobrindo todos os itens 2.1–2.6 e a cadeia de recomendação, na medida em que dá para fazer de forma determinística e sem inventar dado/critério. Detalhes de arquitetura, decisões e estrutura de dados estão em `CLAUDE.md`.

**Legenda:** ✅ CONCLUÍDO (implementado, testado, verificado rodando no navegador) · 🟡 PARCIAL (implementado, com limitação conhecida) · ⏳ PENDENTE (não implementado ainda) · 🔭 VISÃO FUTURA (fora do escopo desta fase, registrado para depois).

## FASE 2 — PERFORMANCE ESPORTIVA

### 2.1 — WOD estruturado — ✅ CONCLUÍDO

- `WodPlan`/`WodResult`/`WorkoutAttempt` (`src/data/schema.ts`) representam formato (AMRAP/EMOM/For Time/rounds-reps/chipper/outro), time cap, movimentos, e resultado (tempo, rounds+reps, carga, calorias, RX/scaled, RPE, observações).
- Planejado vs. realizado: `DayPlan.wodPlan` (opcional, editável em Semana → dia → "estrutura do WOD") é o planejado; `WorkoutAttempt.result` é o realizado.
- "Da última vez fiz 6:42": ao digitar o nome do WOD em `WodResultModal`, o app busca tentativas anteriores com o mesmo nome (ou o mesmo WOD nomeado) e mostra o resultado anterior em tempo real — verificado funcionando no navegador (fluxo Fran: 8:15 → 6:42, comparação exibida corretamente).
- O antigo par `boxWorkoutBody` (texto livre) + `boxWorkoutDone` (booleano) continua existindo para quem só quer colar o WOD do quadro do box sem detalhar estrutura — registrar um resultado também marca `boxWorkoutDone`, então nada quebrou do fluxo rápido do MVP.
- 🟡 **Limitação conhecida:** não há parsing automático de texto livre para estrutura (ex.: colar "21-15-9 Thrusters/Pull-ups" não preenche os campos sozinho) — decisão deliberada para não inventar interpretação; o usuário preenche os campos estruturados manualmente quando quer comparação/recomendação.

### 2.2 — Evolução baseada nos treinos — ✅ CONCLUÍDO

- `state/logic.ts`: `exerciseHistory`, `exerciseBestLoadSeries`, `exerciseTotalRepsSeries`, `exerciseVolumeSeries`, `exerciseDurationSeries` — todas derivadas de `SessionLog.exercises[].sets[]` real, pulando (nunca fabricando) um ponto quando reps/carga não são numéricos.
- Aba **Treinos** (Evolução): lista todo exercício com pelo menos uma sessão concluída/abandonada; toque abre histórico + recordes (`ExerciseDetailModal`).
- Verificado no navegador ponta a ponta: sessão completa registrada → "Melhor carga 20 kg", "Mais reps (sessão) 32 reps", "Maior volume 240 kg·reps" (só contando o set com reps E carga numéricos) — confirma que a lógica de "não fabricar" está correta na prática, não só em teste unitário.
- Volume por bloco/semana (`weeklyComplementaryVolume`) já existia no MVP e continua.

### 2.3 — PRs reais — ✅ CONCLUÍDO

- `MetricEntry.direction` (`higher-better`/`lower-better`), configurável por métrica no formulário (`AddMetricModal`), com heurística de default na migração de dado antigo (documentada, editável).
- `metricSeriesByName` agora calcula `best` (recorde histórico real, respeitando direção) além de `latest` — recorde não é mais "último valor lançado". Cada entrada do histórico é marcada `isPR` no momento em que foi lançada.
- Mesmo conceito aplicado a WODs inteiros: `state/workouts.ts` (`compareWodResult`, `isNewWorkoutPR`) compara resultados respeitando o formato (tempo: menor vence; AMRAP/EMOM: mais rounds+reps vence) e determina PR contra o melhor histórico, não contra a última tentativa.
- **RX e Scaled nunca são comparados como a mesma categoria** (fix `f3a7240`, auditoria final): `isNewWorkoutPR` só compara uma tentativa contra tentativas anteriores da mesma `scale`, e `bestDisplayAttempt` (usada em toda a UI de "melhor resultado"/"recorde") prioriza o melhor RX, só caindo para Scaled/Other quando não há RX registrado. Histórico completo permanece intacto e visível independente da categoria. Coberto por teste em `state/workouts.test.ts`.
- Feedback imediato: toast "novo PR" ao salvar resultado de WOD ou métrica quando aplicável; badge "PR"/"MELHOR" na UI (Resumo, Benchmarks).

### 2.4 — Benchmarks CrossFit — ✅ CONCLUÍDO

- `WorkoutDef` (catálogo + criado pelo usuário) + `WorkoutAttempt` (histórico de tentativas). Catálogo inicial com 8 benchmarks nomeados publicamente conhecidos (Fran, Grace, Diane, Murph, Helen, Cindy, Annie, Karen) — só estrutura (movimentos/esquema/formato), nenhum resultado fabricado.
- Não limitado aos 8 — aba **Benchmarks** tem "+ NOVO WOD" para o usuário cadastrar qualquer WOD nomeado próprio (`WorkoutDefModal`).
- `BenchmarkDetailModal`: melhor resultado, histórico completo de tentativas com badge "MELHOR", RX/scaled por tentativa, excluir tentativa, editar/excluir WOD (WODs de catálogo não são excluíveis, só editáveis — preserva a biblioteca curada).

### 2.5 — Progressões — ✅ CONCLUÍDO

- `ProgressionDef` deixou de ser só código estático (`catalog.ts`) e virou dado extensível em `AppData.progressionDefs`, seedado na migração/primeira execução com 7 habilidades: handstand, handstand walk, pull-up, chest-to-bar, toes-to-bar, double unders, muscle-up.
- Usuário pode criar progressões próprias (nome + etapas) e editar/excluir as que criou (`ProgressionDefModal`), via aba **Progressões**.
- Avanço/regressão de etapa agora grava histórico (`ProgressionState.history`: data, direção, observação opcional) em vez de só mover um índice — `ProgressionNoteModal` captura a observação no momento da mudança.
- 🟡 **Limitação conhecida:** critérios de avanço (`ProgressionDef.criteria`) existem no schema mas a UI ainda não tem um formulário para o usuário escrevê-los — hoje o avanço continua sendo por julgamento do próprio atleta/coach, o que é o comportamento correto (o roadmap pediu explicitamente para não inventar critério fisiológico/técnico sem fonte).

### 2.6 — Hoje inteligente — ✅ CONCLUÍDO

- Hero reduzido (~30% menos altura vertical) para dar mais espaço a informação acionável logo no topo, sem remover a identidade visual (stripes, tarja, citação continuam).
- "MARCAR CONCLUÍDO" virou "REGISTRAR RESULTADO" (abre `WodResultModal`) — resultado do dia aparece no card do WOD assim que registrado.
- Card de sugestão (rule-based, ver cadeia abaixo) aparece quando há um match real entre movimento do WOD e limitação cadastrada, com botão "adicionar ao plano de hoje".
- Nota de recuperação (banner) aparece só quando RPE/dor recentes cruzam um limiar explícito — nunca por padrão.
- Atalho "Recuperação de hoje" para registro rápido de RPE/energia/dor via grades de toque (sem digitação).

## Cadeia inteligente (WOD → movimentos → histórico → limitações → complementar → mobilidade → recuperação)

**🟡 PARCIAL — implementada a parte determinística possível hoje:**

- ✅ **WOD → movimentos → limitações → complementar**: `state/recommend.ts` (`recommendComplementary`). Tabela estática e inspecionável `MOVEMENT_LIMITATION_KEYWORDS` (`data/catalog.ts`) liga movimento a área de limitação; cruza com `data.limitations` reais e com `ComplementaryBlock.limit`/`.area` do catálogo. Toda saída é rastreável a essas duas fontes — quando não há dado suficiente (sem movimentos cadastrados, sem limitações cadastradas, ou sem correspondência), retorna uma nota explícita em vez de uma sugestão. Verificado em teste unitário e no navegador.
- ✅ **Recuperação**: `recoveryNote` — dispara só quando RPE ou dor dos últimos 2 dias cruzam um limiar (RPE ≥ 8 ou dor ≥ 4), nunca por padrão.
- ⏳ **"→ histórico" como insumo direto da sugestão** (não só limitação atual, mas frequência/volume de treino de uma área ao longo do tempo): não implementado — a sugestão hoje olha limitação + WOD do dia, não o histórico de volume por área. Precisaria de uma definição de produto mais específica (que "sinal" de histórico deve pesar) antes de implementar, para não inventar uma regra sem base clara.

## VISÃO FUTURA (fora desta fase, registrado para depois)

- Cadeia de histórico-de-volume como insumo da recomendação (ver limitação acima).
- Vídeo real por exercício — schema já pronto (`Exercise.videoUrl`/`thumbnail`, `SessionOverlay` já renderiza quando existe), falta só o asset.
- RPE/recuperação com mais contexto (sono, dor localizada por região do corpo) — hoje é RPE/energia/dor geral 1-10/1-5/1-5 + observação livre.
- Critérios de progressão como formulário estruturado (ver limitação 2.5 acima).
- Periodização por fase de treino (`Profile.phase` continua só texto livre).
- Analytics de correlação (composição corporal × performance).
- PWA/instalação como app.
- Passos automáticos via sensor do celular.

## Regras para próximas fases

- Não implementar nada de "visão futura" sem início explícito pedido pelo usuário.
- Toda mudança de schema segue as regras de `CLAUDE.md` (atualizar `isAppData`, escrever uma migração versionada, nunca resetar dado do usuário por causa de mudança de schema).
- Toda recomendação automática nova deve continuar rastreável a dado real ou regra estática explícita — nunca "IA fake".
