# UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O usuário visualiza as etapas de serviço da obra organizadas em uma trilha interativa agrupada por macroetapas (abas superiores) e subetapas (menu lateral), com indicadores consolidados de orçamento, contagem de serviços concluídos, alertas críticos de atraso, etapas bloqueadas por precedência e cartões táticos para cada serviço.
- **Início:** O usuário acessa a página inicial do sistema (`/`) ou a rota específica de uma obra (`/obras/:obraId`), ou consulta a listagem de etapas da obra na API.
- **Término:** A trilha da obra é renderizada com o estado atualizado de todas as etapas, permitindo navegar entre macroetapas e subetapas ou acionar o modal de análise de atraso.
- **Escopo incluído:** Seleção automática da obra padrão ou pelo identificador da rota, listagem de etapas ordenadas por posição com cálculo dinâmico de peso percentual e estado de bloqueio, agrupamento visual em dois níveis (macroetapa e subetapa) e exibição de estados de carregamento, vazio e erro.
- **Fora do escopo (Limites):** Registro de medições de avanço físico (tratado em [UC-OBR-003](../UC-OBR-003-registrar-medicao-etapa/README.md)), análise de atraso com geração de sugestões de adiantamento (tratada em [UC-OBR-004](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)) e reordenação de etapas adiantadas (tratada em [UC-OBR-005](../UC-OBR-005-reordenar-etapa-adiantada/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras, Mestre de Obras / Fiscal de Campo.
- **Gatilho:** Abertura da tela da trilha (`/` ou `/obras/:obraId`) ou chamada de consulta às etapas da obra.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** Para exibição completa da trilha, deve existir ao menos uma obra cadastrada com etapas associadas na EAP.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** Nenhuma alteração de estado é realizada no banco de dados (operação exclusivamente de leitura); cada etapa retornada traz seu percentual e quantidade executados a partir da última medição, seu peso percentual no orçamento da obra e a lista de predecessoras e sucessoras com o respectivo estado de satisfação.
- **Garantias em caso de falha:** Em caso de indisponibilidade da API ou obra inexistente, a tela preserva a integridade visual e apresenta alerta de erro com opção de nova tentativa ou atalho para importação de orçamento.

## UC-OBR-002-C01 — Fluxo Principal

1. O usuário acessa a tela da trilha da obra (ou seleciona uma obra no seletor do cabeçalho quando há múltiplas obras cadastradas).
2. O sistema identifica a obra alvo (pelo identificador da URL ou, na rota raiz, priorizando a obra padrão de referência ou a primeira obra cadastrada) e consulta suas etapas.
3. O sistema calcula para cada etapa o peso percentual no orçamento aplicando [RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP](../../../domain/obra/rules.md#rn-obr-001--hierarquia-de-agregacao-e-calculo-de-pesos-da-eap) e determina se a etapa está bloqueada por predecessoras obrigatórias pendentes conforme [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia).
4. O sistema agrupa as etapas por macroetapa (primeiro nível do código EAP e do caminho de macroetapa) e por subetapa (segundo nível do código EAP), exibindo no cabeçalho o orçamento total, o total de serviços, concluídos, alertas críticos e bloqueadas.
5. O usuário navega pelas abas de macroetapas e pelos grupos de subetapas para inspecionar os nós da trilha, visualizando para cada etapa o status (`CONCLUÍDO`, `% MEDIDO`, `ORÇADO • SEM MEDIÇÃO`, `BLOQUEADA • AGUARDA ...` ou `ADIANTADA PELA IA`), quantidades, valores unitário/total e botão de indicação de atraso.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-002-C02` | Passo 3 / Passo 5 | Etapa possui predecessora obrigatória ainda não satisfeita | O sistema marca a etapa como bloqueada, exibe ícone de cadeado e apresenta o selo `BLOQUEADA • AGUARDA <códigos EAP>` | Etapa permanece sinalizada como bloqueada na trilha | Continua no passo 5 | [RN-OBR-002](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`DependenciaEtapaServiceTest.bloqueiaSucessoraAteAPredecessoraConcluir`), `web/tests/e2e/dependencias.spec.ts` (`UC06: trilha mostra o cadeado e a predecessora pendente`) |
| `UC-OBR-002-C03` | Passo 2 | Nenhuma obra está cadastrada no sistema, a obra informada na URL não existe ou a obra não possui etapas cadastradas | O sistema exibe estado vazio com explicação contextual e botão de ação para importar orçamento (e botão para ver obra principal quando já existem outras obras) | Nenhuma alteração de dados | Encerra | — | Sem teste E2E dedicado exclusivamente ao estado vazio da `TimelinePage` |
| `UC-OBR-002-C04` | Passo 2 | Falha de comunicação com a API ao carregar obras ou etapas | O sistema exibe painel de alerta `"Não foi possível carregar a trilha"` com a mensagem do problema e botão `"Tentar novamente"` | Nenhuma alteração de dados | Retoma no passo 2 ao tentar novamente | — | `web/src/tests/ImportacaoPlanilha.component.test.tsx` (`mensagem amigável quando a API está fora do ar`) |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP](../../../domain/obra/rules.md#rn-obr-001--hierarquia-de-agregacao-e-calculo-de-pesos-da-eap)
  - [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia)
  - [RN-OBR-005 — Posicionamento Fracionário na Reordenação da Trilha](../../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **ADRs Relacionados:** [ADR-003 — Interface de Trilha Gamificada com Atomic Design e Cliente OpenAPI](../../../technical/adr/ADR-003-trilha-gamificada-atomic-design-cliente-openapi.md)
- **Casos Relacionados:** [UC-OBR-001 — Importar Planilha Orçamentária Excel](../UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-003 — Registrar Medição e Apontar Atraso em Etapa](../UC-OBR-003-registrar-medicao-etapa/README.md), [UC-OBR-004 — Analisar Atraso e Gerar Sugestões de Adiantamento](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md), [UC-OBR-006 — Configurar Dependências Construtivas entre Etapas](../UC-OBR-006-configurar-dependencias-construtivas/README.md)

## 7. Limitações Conhecidas

- A página de produção `TimelinePage` (`web/src/pages/TimelinePage.tsx`) renderiza os nós da trilha e aciona o modal `SugestaoAtrasoModal` ao clicar no nó ou no botão `"Indicar Atraso & IA"`, mas não monta atualmente o componente `StageDetailsDrawer` (`web/src/components/organisms/StageDetailsDrawer/StageDetailsDrawer.tsx`). O organismo `ConstructionTimeline` e o `StageDetailsDrawer` estão implementados e testados no Design System/Storybook e nas suítes de componentes, enquanto a `TimelinePage` foca na visualização por macroetapas/subetapas e reprogramação com IA.
- Na barra lateral de subetapas (`aside` em `TimelinePage.tsx`), o navegador de subgrupos utiliza `hidden lg:block`, ficando oculto em telas menores que o breakpoint `lg` (exibindo diretamente os serviços do primeiro subgrupo da macroetapa selecionada).
