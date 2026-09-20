# ROADMAP — Performance

_Última atualização: 2026-09-20 — branch `feat/performance-mvp-funcional`_

## Onde estamos

O MVP (Fase 1) está funcionalmente fechado: 5 telas com CRUD real sobre dado persistido em `localStorage`, sessão complementar com pausa/retomada/histórico, 37 testes, `tsc`/`vitest`/`build` limpos. Detalhes de arquitetura e funcionalidades em `README.md` e `CLAUDE.md`.

Uma auditoria de produto (não só técnica) identificou que o app hoje registra bem o treino *complementar* (mobilidade/ginástica/core) e os dados de corpo/alimentação, mas trata o **WOD do box — o centro da prática de CrossFit — como texto livre + um booleano**, sem resultado, sem formato, sem histórico comparável. Essa é a lacuna que a Fase 2 ataca.

## FASE 2 — PERFORMANCE ESPORTIVA

Objetivo da fase: transformar o Performance de "registro de hábito" em ferramenta de acompanhamento de performance esportiva de verdade — capturar o que o atleta realmente fez e transformar isso em evolução visível.

### 2.1 — WOD estruturado

Substituir o par `boxWorkoutBody` (texto livre) + `boxWorkoutDone` (booleano) por um modelo estruturado de WOD e resultado:
- Formato: AMRAP, EMOM, For Time, rounds/reps (e o que mais for necessário).
- Time cap.
- Movimentos que compõem o WOD.
- Carga utilizada (por movimento, quando aplicável).
- Resultado (tempo total, rounds+reps, calorias, conforme o formato).
- RX / scaled.
- Observações livres (sensação, ajustes feitos).
- Histórico do mesmo WOD — poder ver todas as vezes que esse WOD (ou um com o mesmo nome/estrutura) foi feito antes, com os resultados lado a lado.

Pré-requisito de quase tudo o resto da Fase 2 — priorizar primeiro.

### 2.2 — Evolução baseada nos treinos

Hoje `SetLog` (reps/carga/tempo/nota por série, dentro de `SessionLog`) é capturado mas nunca lido pela aba Evolução. Fechar esse loop:
- Transformar o histórico de `SetLog`s das sessões complementares em séries úteis.
- Evolução de carga, reps, volume e tempo por exercício.
- Evolução agregada por bloco complementar (mobilidade/ginástica/core).

### 2.3 — PRs reais

- Melhor resultado histórico por métrica/movimento, não "primeiro vs. último valor" (o cálculo atual em `metricSeriesByName`).
- Suporte a métricas onde maior-é-melhor (carga, reps) e onde menor-é-melhor (tempo) — hoje a UI não distingue direção.
- Identificação automática de novo PR no momento do registro (feedback imediato, tipo celebração).
- Histórico completo de tentativas por métrica, não só base/latest.

### 2.4 — Benchmarks CrossFit

- Biblioteca de benchmarks nomeados (Fran, Grace, Murph, Diane, etc.), distintos de métricas genéricas.
- Histórico de tentativas por benchmark.
- RX / scaled por tentativa.
- Comparação entre tentativas do mesmo benchmark.

Depende de 2.1 (estrutura de resultado de WOD) e conecta-se com 2.3 (PR).

### 2.5 — Progressões

- Progressões extensíveis pelo usuário (hoje só `handstand` e `pullup` existem, fixas em `catalog.ts`), incluindo pelo menos: pull-up, toes-to-bar, handstand, double unders, muscle-up, e outras cadastráveis.
- Critérios objetivos de avanço de etapa (não só um clique manual sem registro).
- Histórico de progressão — quando cada etapa foi alcançada, não só o índice atual.

### 2.6 — Hoje inteligente

Reduzir a distância entre "Hoje" e uma central operacional real:
- Mostrar o último resultado relevante para o contexto do dia (mesmo WOD, mesmo movimento).
- Mostrar PRs relacionados ao treino do dia.
- Reduzir elementos puramente decorativos (hero, banners) em favor de densidade de informação acionável.
- Priorizar o que o atleta precisa decidir/registrar agora sobre o que é só identidade visual.

## Visão posterior (fora da Fase 2)

Cadeia de recomendação inteligente, que só faz sentido depois que WOD estruturado (2.1), limitações e progressões (2.5) estiverem maduros:

**WOD → movimentos → histórico → limitações → sugestão de complementar → mobilidade → recuperação.**

Ou seja: analisar os movimentos do WOD do dia, cruzar com o histórico de desempenho nesses movimentos e com as limitações cadastradas do atleta, e sugerir automaticamente o bloco complementar/mobilidade mais relevante — em vez da atribuição manual por dia que existe hoje. Depois disso, estender a cadeia para recomendação de recuperação (baseada em volume/frequência recente).

Outros itens de visão futura (menor prioridade, sem ordem definida ainda): vídeo real por exercício, RPE/percepção de esforço, periodização por fase de treino, analytics de correlação (composição corporal × performance), PWA/instalação como app.

## Regras para esta fase

- Não implementar nada da Fase 2 sem início explícito pedido pelo usuário — este documento é o registro do plano, não uma autorização de execução.
- 2.1 é pré-requisito prático de 2.2, 2.3 e 2.4 — não pular a ordem sem necessidade.
- Toda mudança de schema decorrente da Fase 2 segue as regras de `CLAUDE.md` (atualizar `isAppData`, decidir estratégia de migração, atualizar seed).
