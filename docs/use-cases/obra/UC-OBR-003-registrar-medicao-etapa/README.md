# UC-OBR-003 — Registrar Medição e Apontar Atraso em Etapa

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O avanço físico de uma etapa da obra (percentual executado e quantidade executada), acompanhado opcionalmente de observações, motivo de atraso e dias de atraso estimados, é registrado como uma nova entrada no histórico de medições da etapa, atualizando seu progresso atual e o estado de liberação das etapas sucessoras.
- **Início:** O gestor ou fiscal submete os dados de medição de uma etapa da obra.
- **Término:** A medição é persistida, o histórico de medições da etapa é atualizado e o estado recalculado da etapa é retornado ao iniciador.
- **Escopo incluído:** Validação de desbloqueio da etapa antes de permitir avanço físico maior que zero, validação de limites numéricos do percentual (`0` a `100`) e da quantidade executada (`>= 0`), gravação imutável no histórico de medições e atualização automática do status de satisfação dos vínculos em que a etapa é predecessora.
- **Fora do escopo (Limites):** Geração de sugestões de adiantamento por IA ou análise local (tratada em [UC-OBR-004](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)) e edição de valores orçados da etapa (tratada em [UC-OBR-007](../UC-OBR-007-gerenciar-obras-etapas/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras, Mestre de Obras / Fiscal de Campo.
- **Gatilho:** Envio de registro de medição para uma etapa específica de uma obra.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** A obra e a etapa devem existir; caso o percentual executado informado seja maior que zero, todas as dependências predecessoras obrigatórias da etapa devem estar satisfeitas.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** Um novo registro de medição é acrescentado ao final da lista histórica da etapa com a data/hora atual; o percentual executado, a quantidade executada, o motivo de atraso e os dias de atraso correntes da etapa passam a refletir essa última medição; etapas sucessoras que dependiam do início (`II`) ou da conclusão (`FI` aos `100%`) desta etapa têm sua condição de liberação atualizada imediatamente nas consultas subsequentes.
- **Garantias em caso de falha:** Se a etapa estiver bloqueada por predecessora obrigatória pendente ou se os dados de entrada forem inválidos, nenhuma medição é gravada e o percentual atual da etapa permanece inalterado.

## UC-OBR-003-C01 — Fluxo Principal

1. O iniciador seleciona uma etapa da obra e informa o percentual executado (`0` a `100`), a quantidade executada e, opcionalmente, uma observação, o motivo de atraso e os dias estimados de atraso.
2. O sistema verifica se a obra e a etapa existem e, caso o percentual executado seja maior que zero, valida que não existem predecessoras obrigatórias pendentes aplicando [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia).
3. O sistema registra a nova medição no histórico da etapa com a data e hora do apontamento, preservando todas as medições anteriores.
4. O sistema recalcula o contexto da etapa (incluindo o estado atualizado dos vínculos com suas sucessoras) e retorna os dados consolidados da etapa e seu histórico completo de medições.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-003-C02` | Passo 1 / Passo 3 | O iniciador informa motivo de atraso e dias de atraso junto à medição (ou reporta impedimento no painel de detalhes da etapa) | O sistema armazena o motivo e os dias de atraso na medição e expõe esses valores nos dados atuais da etapa | Medição e atraso persistidos no histórico da etapa | Continua no passo 4 | — | `web/src/tests/StageDetailsDrawer.component.test.tsx` (`expands impediment form, validates input, and submits with onReportImpediment callback`) |
| `UC-OBR-003-C03` | Passo 2 | A etapa possui ao menos uma predecessora obrigatória não satisfeita e o percentual informado é maior que zero | O sistema recusa a medição com erro de conflito (HTTP 409) listando os códigos EAP (ou descrições) das predecessoras pendentes | Nenhuma medição é adicionada ao histórico | Encerra | [RN-OBR-002](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`DependenciaEtapaServiceTest.recusaMedicaoDeEtapaBloqueada`) |
| `UC-OBR-003-C04` | Passo 1 | Percentual executado fora do intervalo `[0, 100]`, quantidade executada negativa ou dias de atraso negativos | O sistema rejeita a requisição com erro de validação de campos (HTTP 400) | Nenhuma medição é persistida | Encerra | — | Sem teste de integração de controller específico para `MedicaoRequest` inválido |
| `UC-OBR-003-C05` | Passo 2 | Obra ou etapa informada não existe | O sistema retorna erro de recurso não encontrado (HTTP 404) | Nenhuma alteração no banco | Encerra | — | Sem teste automatizado específico para etapa inexistente na medição |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **ADRs Relacionados:** [ADR-004 — Representação Explícita de Dependências entre Etapas e Verificação Acíclica](../../../technical/adr/ADR-004-modelagem-grafo-dependencias-eap.md)
- **Casos Relacionados:** [UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra](../UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-004 — Analisar Atraso e Gerar Sugestões de Adiantamento](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md), [UC-OBR-006 — Configurar Dependências Construtivas entre Etapas](../UC-OBR-006-configurar-dependencias-construtivas/README.md)

## 7. Limitações Conhecidas

- O componente `StageDetailsDrawer` (`web/src/components/organisms/StageDetailsDrawer/StageDetailsDrawer.tsx`) possui toda a interface de medição (slider, botões rápidos `+5%`, `+10%`, `100% Concluir` e formulário de impedimento), mas ainda não está conectado à página `TimelinePage.tsx` para invocar `POST /api/obras/{id}/etapas/{etapaId}/medicoes`. Atualmente, o endpoint REST de medição está disponível e funcional no backend (`ObraController.registrarMedicao`), enquanto o componente de UI opera de forma isolada no Storybook e nos testes de componente.
- O sistema permite registrar uma nova medição com percentual inferior ao da medição anterior (não há bloqueio de regressão de percentual em `EtapaObra.registrarMedicao()`), prevalecendo sempre o último registro inserido em `EtapaObra.medicoes`.
