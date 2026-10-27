# UC-OBR-004 — Analisar Atraso e Gerar Sugestões de Adiantamento

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** Diante de um atraso ou impedimento em uma etapa da obra, o sistema filtra as etapas candidatas disponíveis (não iniciadas, independentes da etapa atrasada e desbloqueadas) e retorna um parecer técnico acompanhado de até 3 sugestões de etapas que podem ser adiantadas na trilha, geradas por Inteligência Artificial ou por priorização determinística local.
- **Início:** O gestor aciona **"Indicar Atraso & IA"** em um card da trilha da obra (ou clica sobre o nó da etapa) e submete o formulário de atraso, ou envia requisição ao endpoint de análise de atraso.
- **Término:** O diagnóstico de atraso, o parecer técnico e a lista de etapas sugeridas com suas justificativas são apresentados no modal, permitindo concluir a consulta ou escolher uma etapa para adiantamento imediato.
- **Escopo incluído:** Identificação da etapa atrasada, filtragem estrita de etapas candidatas elegíveis pelo grafo de dependências e regras de liberação, consulta ao provedor externo de IA (OpenRouter/OpenAI), fallback determinístico local por valor orçado quando a IA está indisponível e descarte de sugestões fora do conjunto elegível.
- **Fora do escopo (Limites):** Efetivação da reordenação da etapa escolhida na trilha (tratada em [UC-OBR-005](../UC-OBR-005-reordenar-etapa-adiantada/README.md)) e persistência de medições físicas no histórico da etapa (tratada em [UC-OBR-003](../UC-OBR-003-registrar-medicao-etapa/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras (com participação secundária do Provedor de IA OpenRouter / OpenAI API).
- **Gatilho:** Submissão de análise de atraso para uma etapa da obra informando motivo e dias estimados de atraso.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** A obra deve existir e possuir ao menos uma etapa cadastrada na EAP.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** Nenhuma alteração é persistida no banco de dados (operação estritamente consultiva); o sistema retorna os dados da etapa atrasada, o parecer descritivo e a lista de sugestões validadas contra o conjunto de etapas elegíveis; na interface web, ao fechar o modal, a etapa analisada exibe o selo visual com os dias de atraso informados na sessão.
- **Garantias em caso de falha:** Se a obra não existir ou não possuir etapas cadastradas, ou se os campos obrigatórios do atraso forem inválidos, a análise é recusada sem efeitos colaterais.

## UC-OBR-004-C01 — Fluxo Principal

1. Na trilha da obra, o gestor aciona a análise de atraso em uma etapa, informa o motivo do atraso e a estimativa de dias de atraso (mínimo de 1 dia) e solicita a consulta de opções de adiantamento.
2. O sistema carrega a obra, ordena suas etapas por posição e identifica a etapa atrasada.
3. O sistema filtra as etapas candidatas elegíveis aplicando [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia) e [RN-OBR-003 — Elegibilidade e Priorização de Etapas para Adiantamento](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento), mantendo apenas etapas não iniciadas (`0%`), que não dependem direta nem indiretamente da etapa atrasada e que não possuem predecessoras obrigatórias pendentes.
4. O sistema envia a etapa atrasada, o motivo, os dias de atraso e a lista de candidatas elegíveis ao provedor de IA.
5. O provedor de IA retorna o parecer técnico e de 1 a 3 etapas recomendadas com justificativas técnicas.
6. O sistema correlaciona as sugestões retornadas pela IA exclusivamente com o conjunto de etapas elegíveis e apresenta o diagnóstico e os cartões de sugestão ao gestor.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-004-C02` | Passo 4 | O provedor de IA não está configurado (sem chave de API) ou ocorre falha/timeout/resposta malformada na comunicação externa | O sistema aciona o fallback determinístico local, selecionando até 3 candidatas elegíveis ordenadas por maior valor total orçado (e menor posição em caso de empate) e incluindo aviso de análise local no parecer | Retorna 200 OK com até 3 sugestões determinísticas sem interromper o fluxo do gestor | Continua no passo 6 | [RN-OBR-003](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento) | `api/src/test/java/br/com/concordia/domain/obra/SugestaoAdiantamentoServiceTest.java` (`deveSelecionarNoMaximoTresCandidatasPorOrcamentoQuandoIaIndisponivel`, `deveExcluirDependentesDiretasIndiretasEBloqueadasDaSelecaoLocal`), `api/src/test/java/br/com/concordia/infrastructure/ia/client/OpenAiReprogramacaoClientTest.java` (`deveRetornarMensagemExplicativaQuandoNaoConfigurado`) |
| `UC-OBR-004-C03` | Passo 5 | O provedor de IA está disponível, analisa as candidatas e conclui que nenhuma etapa deve ser adiantada com segurança técnica (lista de sugestões vazia) | O sistema preserva a lista vazia e exibe o parecer explicativo da IA sem acionar o fallback local | Retorna 200 OK com `sugestoes = []` e o parecer técnico da IA | Encerra após exibição no modal | [RN-OBR-003](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento) | `api/src/test/java/br/com/concordia/domain/obra/SugestaoAdiantamentoServiceTest.java` (`deveRetornarMensagemExplicativaQuandoIaNaoIdentificaEtapas`), `web/tests/e2e/timeline.spec.ts` (`exibe parecer descritivo da IA quando não houver etapas para adiantar`) |
| `UC-OBR-004-C04` | Passo 3 | Não existem outras etapas elegíveis no cronograma (todas as demais etapas já iniciaram, dependem da atrasada ou estão bloqueadas) | O sistema não aciona o provedor de IA e retorna imediatamente lista vazia informando que a obra não possui outras etapas disponíveis para adiantamento | Retorna 200 OK com `sugestoes = []` | Encerra após exibição no modal | [RN-OBR-003](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento) | `api/src/test/java/br/com/concordia/infrastructure/ia/client/OpenAiReprogramacaoClientTest.java` (`deveRetornarMensagemExplicativaQuandoNaoHaEtapasCandidatas`), `web/src/tests/SugestaoAtrasoModal.component.test.tsx` |
| `UC-OBR-004-C05` | Passo 2 | A obra informada não existe ou não possui nenhuma etapa cadastrada | O sistema rejeita a requisição com erro de recurso não encontrado (HTTP 404 para obra inexistente) ou requisição inválida (HTTP 400 para obra sem etapas) | Nenhuma alteração de estado | Encerra | [RN-OBR-003](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento) | Sem teste unitário dedicado exclusivamente para obra sem etapas na análise de atraso |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia)
  - [RN-OBR-003 — Elegibilidade e Priorização de Etapas para Adiantamento](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md) · [Contrato de Integração IA (OpenRouter/OpenAI)](../../../technical/api/openrouter-ia-integration.md)
- **ADRs Relacionados:** [ADR-002 — Reprogramação Assistida por IA com Fallback Determinístico Local](../../../technical/adr/ADR-002-reprogramacao-assistida-por-ia-com-fallback-local.md)
- **Casos Relacionados:** [UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra](../UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-005 — Reordenar Etapa Adiantada na Trilha da Obra](../UC-OBR-005-reordenar-etapa-adiantada/README.md), [UC-OBR-006 — Configurar Dependências Construtivas entre Etapas](../UC-OBR-006-configurar-dependencias-construtivas/README.md)

## 7. Limitações Conhecidas

- O apontamento de atraso realizado no modal `SugestaoAtrasoModal` atualiza o estado visual de atraso em memória na `TimelinePage` (`atrasos` state), mas o endpoint `POST /api/obras/{id}/analise-atraso` é apenas consultivo (`@Transactional(readOnly = true)`) e não grava automaticamente um registro em `MedicaoEtapa`.
- Se o `etapaId` enviado em `SugestaoAtrasoRequest` não pertencer à obra, `SugestaoAdiantamentoService.identificarEtapaAtrasada()` faz fallback silencioso para a primeira etapa da obra (`etapas.get(0)`) em vez de lançar `EntityNotFoundException`.
