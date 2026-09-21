# Performance

App pessoal de acompanhamento de **performance esportiva** no CrossFit — WOD estruturado, PRs reais, benchmarks nomeados, progressões de habilidade, alimentação, hidratação, peso, medidas e recuperação — com o objetivo de longo prazo de evoluir até nível competitivo. A pergunta que o produto tenta responder é: "estou realmente ficando um atleta melhor?"

Roda 100% no navegador, sem backend: os dados ficam no `localStorage` do dispositivo, com schema versionado e migração automática (nenhuma atualização do app apaga histórico real).

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
  data/        schema.ts (modelo de dados), migrations.ts (migração versionada v1->v2...), catalog.ts (conteúdo estático: blocos, progressões-padrão, benchmarks nomeados, tabela movimento->limitação), seed.ts (demonstração)
  storage/     leitura/escrita em localStorage, execução da cadeia de migração, export/import
  state/       AppState.tsx (Context + Provider, única fonte de verdade da UI), logic.ts (derivação: checklist, status semanal, PR de métricas, histórico/volume de exercício), workouts.ts (comparação de resultado de WOD, PR de WOD, "última vez"), recommend.ts (motor de sugestão baseado em regras)
  components/  UI por aba (hoje, semana, alimentacao, evolucao, mais), session/ (overlay de treino complementar), common/ (Modal, Toast, ConfirmDialog, LogStatModal), layout/ (Header, BottomNav, SidePanel)
  lib/date.ts  utilitários de data/hora reais em pt-BR (sem hardcode de datas)
  styles/      CSS por área + tokens.css (cores, fontes, breakpoint) + wod.css (WOD/PR/benchmark/progressão/recomendação)
```

Fluxo de dados: `AppState.tsx` carrega o `AppData` do storage uma vez, expõe ações (métodos) que mutam o estado React e persistem a cada mudança (com pequeno debounce). Os componentes de tela não tocam o storage diretamente — sempre passam por `useAppState()`. A lógica de derivação fica isolada em `state/logic.ts`/`workouts.ts`/`recommend.ts`, testada sem precisar renderizar componentes.

## Persistência / localStorage

- Chave única: `performance:v1`.
- Schema versionado (`SCHEMA_VERSION` em `src/data/schema.ts`, hoje v2). **Migração automática e versionada** (`src/data/migrations.ts`): dado salvo numa versão antiga é transformado para a atual tanto no load quanto no import de backup — o app nunca reseta para demonstração só porque o schema evoluiu. Só cai para seed se o JSON estiver corrompido ou for de uma versão mais nova do que este build entende.
- Primeira execução sem nada salvo: o app é inicializado a partir de `src/data/seed.ts` (dados de demonstração, ancorados na semana real atual, com persona claramente fictícia). A partir daí, toda edição do usuário é dado real.
- Em "Mais → Limpar dados" o usuário pode apagar tudo ou restaurar a demonstração, sempre com confirmação.
- Export/Import: "Mais → Exportar/Importar backup" baixa/lê um `.json` com o `AppData` completo — importar um backup de uma versão antiga também passa pela cadeia de migração.

## Principais funcionalidades

- **Hoje**: data real, resultado do WOD estruturado (formato, tempo/rounds+reps/carga, RX/scaled, RPE — ver Fase 2), "última vez" comparado ao nome do WOD, sugestão de complementar baseada em regras, checklist do dia, registro de peso/passos/água, recuperação rápida (RPE/energia/dor).
- **Sessão complementar**: reps/carga/tempo/observação por série, pausar, avançar/voltar entre exercícios, saída segura (auto-salva em progresso, confirmação para abandonar), sessão em andamento sobrevive a refresh.
- **Semana**: janela real de 7 dias, edição da programação por dia (tipo de dia, WOD com estrutura opcional de formato/movimentos, blocos complementares).
- **Alimentação**: CRUD completo de refeições, anel de kcal e barra de proteína, registro de água.
- **Evolução**: Resumo (peso/medidas/benchmarks com PR real, não só último valor), **Treinos** (histórico e recordes por exercício, derivados das sessões), **Benchmarks** (WODs nomeados — catálogo + criados pelo usuário — com histórico de tentativas e melhor resultado), **Medidas**, **Progressões** (extensíveis, com histórico de avanço/regressão).
- **Mais**: perfil/metas editáveis, limitações (CRUD), histórico de sessões, sequência de dias ativos, export/import de backup, limpar dados.

Detalhamento completo da Fase 2 (WOD estruturado, PRs, benchmarks, progressões, Hoje inteligente, cadeia de recomendação) em [`docs/ROADMAP.md`](./docs/ROADMAP.md), com status real (concluído/parcial/pendente) por item.

## Proteção de acesso (PIN)

O app está publicado publicamente (GitHub Pages, repo público). Para desencorajar acesso casual de quem encontrar o link, existe uma tela de PIN opcional (`src/components/common/LockGate.tsx` + `src/lib/lock.ts`):

- Sem `VITE_APP_PIN_HASH` configurado, o app abre normalmente (sem gate) — é o estado atual até você configurar.
- Para ativar: escolha um PIN e gere o hash SHA-256 dele localmente (o PIN em si nunca fica no repositório, só o hash):
  ```bash
  node -e "console.log(require('crypto').createHash('sha256').update('SEU_PIN_AQUI').digest('hex'))"
  ```
- Adicione o resultado como secret do repositório no GitHub: **Settings → Secrets and variables → Actions → New repository secret**, nome `APP_PIN_HASH`, valor o hash gerado.
- No próximo push em `main` (ou rodando o workflow manualmente em Actions → Deploy to GitHub Pages → Run workflow), o build já sai com o PIN ativo.
- Em **Mais → Bloquear app** dá pra forçar a tela de PIN de novo (útil antes de emprestar o celular, por exemplo).

**Isso não é segurança real** — é um site estático com código-fonte público; alguém com conhecimento técnico pode inspecionar o bundle JS e contornar o hash (força bruta offline, por exemplo). Serve só para afastar um visitante casual que ache o link, não para proteger dado sensível — que, de todo modo, nunca sai do `localStorage` do dispositivo de quem está logado (ver seção de persistência acima).

## Limitações conhecidas

- **Uma sessão de treino ativa por vez** — iniciar outro bloco enquanto um está em andamento substitui a sessão anterior, sem aviso.
- **Sem PWA/instalação como app** — roda como site; adicionar manifest/service worker fica para uma etapa futura.
- **Passos são só manuais** — sem integração com sensor do celular.
- **Sem parsing automático de WOD em texto livre** — decisão deliberada (ver ROADMAP) para não inventar interpretação; estrutura/movimentos são preenchidos manualmente quando o usuário quer comparação ou sugestão de complementar.
- **Critérios de avanço de progressão** existem no modelo de dados mas não têm formulário na UI ainda — avanço continua por julgamento do atleta/coach.
- **A cadeia de recomendação não usa histórico de volume por área** — hoje cruza WOD do dia + limitação cadastrada, não frequência histórica de treino de uma fraqueza (ver ROADMAP).

Contexto de continuidade para desenvolvimento (arquitetura, regras e roadmap detalhado) está em [`CLAUDE.md`](./CLAUDE.md) e [`docs/ROADMAP.md`](./docs/ROADMAP.md).
