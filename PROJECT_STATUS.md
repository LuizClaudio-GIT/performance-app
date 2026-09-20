# PERFORMANCE — Status do Projeto e Plano do MVP

_Última atualização: 2026-09-21 — branch `feat/performance-mvp-funcional`_

## O que existe hoje (antes deste MVP)

O app é um **protótipo visual fiel** ao `project/Performance App.dc.html` original (Claude Design), implementado em React + Vite + TypeScript. Todas as 5 telas (Hoje, Semana, Alimentação, Evolução, Mais) e o fluxo de sessão complementar existem visualmente e têm interações de UI funcionando (toggle de checklist, toggle de refeição, cronômetro de descanso, avançar exercício, etc.), **mas**:

- **Nada persiste.** Todo estado vive em `React.useState`/Context (`src/state/AppState.tsx`). Um refresh do navegador zera tudo.
- **Os dados são 100% estáticos** (`src/data/mockData.ts`). Não há como registrar uma refeição nova, editar a semana, lançar peso real, lançar séries/cargas de um exercício, editar o perfil, etc. — só existem os toggles on/off dos itens mockados.
- **Semana** é somente leitura (não dá pra editar a programação).
- **Evolução** mostra números/sparklines fixos, não derivados de nada que o usuário registrou.
- **Mais** é majoritariamente decorativo — só o atalho "Progressões" navega de verdade.
- **Sessão de treino** só registra "concluir/não concluir" série (sem reps/carga/tempo reais), não tem pausa, não tem voltar exercício, não confirma antes de sair, e não fica salva se a página recarregar no meio.
- **Datas são hardcoded** ("SEGUNDA-FEIRA, 21 DE SETEMBRO", semana fixa 21–27/09) em vez de calculadas a partir da data real.
- **Sem testes.**

Isso é o ponto de partida. Nada disso é "quebrado" no sentido de bug — é escopo que nunca foi construído porque a tarefa anterior era estritamente visual.

## Decisões de arquitetura para o MVP

Documentando aqui em vez de perguntar, conforme autorizado — são todas reversíveis.

1. **Persistência: `localStorage`, sem backend.** Camada própria em `src/storage/` com schema versionado (`schemaVersion`), leitura/escrita seguras (try/catch em volta de JSON parse/stringify, nunca deixa uma leitura corrompida derrubar o app), e chave única `performance:v1`.
2. **Dados de demonstração vs. dados reais.** `src/data/seed.ts` guarda o conteúdo de demonstração (baseado no `mockData.ts` original). Na primeira execução (sem nada no `localStorage`), o app inicializa o estado real a partir do seed — assim o app não abre vazio. A partir daí, **toda edição do usuário é dado real**, gravado no `localStorage`. "Limpar dados" (tela Mais) oferece duas opções: apagar tudo (fica vazio) ou restaurar a demonstração — sempre com confirmação.
3. **Modelo de dados central** em `src/data/schema.ts`: perfil, metas, programação semanal (por data real, editável), checklist do dia, refeições (por dia), registro de água (por dia), registro de peso (histórico), medidas corporais (histórico), sessões de treino (histórico completo + sessão em andamento), progressões de habilidades, benchmarks/PRs, configurações.
4. **Estado da aplicação**: `AppState.tsx` deixa de ser dados mockados em memória e passa a ser a camada de acesso ao store persistido (carrega uma vez, salva a cada mudança, com um pequeno debounce para evitar escrita excessiva).
5. **Data/hora real**: utilitário `src/lib/date.ts` usando `Intl.DateTimeFormat('pt-BR', …)` — "HOJE" mostra o dia real, a semana é uma janela real de 7 dias (segunda a domingo) baseada na data do sistema.
6. **Sessão de treino**: passa a gravar séries com reps/carga/tempo/observação por série, permite avançar/voltar entre exercícios, pausar (para o cronômetro de descanso), confirma antes de sair com progresso não salvo, e persiste a sessão em andamento — um refresh no meio de um treino não perde o progresso.
7. **Export/Import**: um botão em Mais baixa um `.json` com todo o estado (`schemaVersion` incluso); importar lê um `.json`, valida a versão e substitui o estado, com confirmação.
8. **Testes**: Vitest + Testing Library (mais leve que Jest, já integrado ao Vite). Cobertura proporcional — camada de storage, cálculos diários (kcal/água/checklist), CRUD de refeições, conclusão de sessão gerando histórico, navegação entre abas, export/import round-trip. Sem tentar cobrir 100% de CSS/visual.
9. **Sem mudança na identidade visual.** Todo o CSS/tokens/layout existente (`src/styles/*`) permanece — o trabalho é de dados e interação, não de redesign.

## O que este MVP NÃO inclui (por instrução explícita do usuário)

- Backend, banco de dados remoto, autenticação, IA.
- Deploy público, serviços pagos.
- Vídeo real (mantém o placeholder "espaço preparado para vídeo").

## Checklist de execução

Ver task list da sessão para o detalhamento passo a passo; resumo:

- [x] Camada de storage + schema + seed
- [x] Utilitário de datas pt-BR
- [x] Reescrever `AppState` sobre a camada persistida
- [x] Hoje: registrar peso, água, checklist real, sessão com reps/carga/tempo/obs, persistência
- [x] Semana: janela real de 7 dias, edição da programação, detalhes por dia
- [x] Alimentação: CRUD completo de refeições, metas editáveis, água
- [x] Evolução: gráficos derivados de dados reais (peso, medidas, frequência, benchmarks, progressões)
- [x] Mais: perfil/metas editáveis, export/import, limpar dados, histórico de sessões
- [x] Sessão de treino: pausar, voltar, confirmar saída, salvar incompleta, histórico
- [x] Responsividade: validado em celular / Fold fechado / Fold aberto / desktop, sem overflow horizontal
- [x] Qualidade: zero erro de console, `tsc` limpo, build limpo, estados vazios, confirmações de exclusão
- [x] Testes: Vitest configurado + 37 testes (storage, lógica de datas, regras de negócio, integração de estado)
- [x] Commits incrementais na branch `feat/performance-mvp-funcional`, push ao final

## Bugs reais encontrados e corrigidos durante a validação

Descobertos testando o app de verdade (navegador + suíte de testes), não apenas por inspeção de código:

1. **"CONTINUAR" descartava a sessão em andamento.** O botão do bloco complementar chamava `startSession` incondicionalmente, que sempre reconstruía a sessão do zero — sair e voltar para um treino em andamento apagava as séries já registradas. Corrigido separando "sessão ativa" (dado persistido) de "visão da sessão aberta" (estado de UI efêmero); `startSession` agora retoma em vez de recriar quando já existe uma sessão em andamento para aquele bloco.
2. **O status "HOJE" nunca aparecia quando hoje é dia de descanso/leve.** `weekDayStatus` verificava o tipo do dia (descanso/leve) antes de verificar se era hoje, então num domingo de descanso a linha da Semana mostrava "DESCANSO" em vez de "HOJE" — e como o destaque visual do dia atual dependia desse texto, o dia corrente parava de ficar destacado. Corrigido invertendo a prioridade: "hoje" sempre vence o rótulo.
3. **Toast de sucesso podia colidir com o rodapé da sessão de treino.** A pilha de notificações ficava ancorada perto da barra inferior, que também é onde fica o rodapé da sessão de treino (cronômetro + botão de avançar). Corrigido ancorando as notificações no topo da tela.

## Limitações conhecidas do MVP

- **Uma sessão de treino ativa por vez.** Iniciar um bloco diferente enquanto outro está em andamento substitui a sessão anterior (sem aviso). Cenário raro no uso real (um bloco por vez), documentado aqui em vez de resolvido por falta de tempo.
- **Sem migração de schema.** Há apenas a versão 1 do formato de dados; uma mudança de schema futura precisaria de lógica de migração (hoje, uma versão incompatível força reinício com dados de demonstração).
- **Sem PWA/instalação como app.** O MVP roda como site (`npm run dev` / `npm run build` + qualquer servidor estático). Adicionar manifest.json e service worker para "instalar" no Fold fica para uma próxima etapa, se desejado.
- **Passos são só manuais.** Não há integração com sensor de passos do celular — o campo existe e é editável, mas não se autoatualiza.
