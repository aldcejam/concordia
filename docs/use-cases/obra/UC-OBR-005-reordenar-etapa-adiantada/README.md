# UC-OBR-005 — Reordenar Etapa Adiantada na Trilha da Obra

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** A etapa escolhida pelo gestor dentre as sugestões de adiantamento é reposicionada na EAP para ficar imediatamente após a etapa atrasada, recebendo posição fracionária intermediária e alinhando sua macroetapa e nó pai para ser exibida na mesma seção da trilha.
- **Início:** O gestor clica em **"Adiantar esta Etapa"** em uma das sugestões exibidas no modal de reprogramação (`UC-OBR-004`) ou envia requisição ao endpoint de reordenação.
- **Término:** A nova posição e o vínculo hierárquico da etapa adiantada são persistidos, o modal é fechado e a trilha é recarregada exibindo a etapa adiantada logo após a etapa atrasada com o selo `"Adiantada via IA para compensar atraso"`.
- **Escopo incluído:** Localização da etapa atrasada e da etapa adiantada na EAP da obra, cálculo da nova posição fracionária intermediária, atualização do nó pai e caminho de macroetapa da etapa adiantada e retorno da lista de etapas reordenada.
- **Fora do escopo (Limites):** Análise e filtragem de sugestões de adiantamento (tratada em [UC-OBR-004](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras.
- **Gatilho:** Clique no botão **"Adiantar esta Etapa"** no modal de sugestões de atraso ou chamada de reordenação na API.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** A obra deve existir e tanto a etapa atrasada quanto a etapa adiantada devem existir na EAP da obra.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** O item da EAP correspondente à etapa adiantada tem sua `posicao` atualizada para o ponto médio entre a etapa atrasada e a etapa seguinte, além de herdar o `pai` e a `macroetapa` da etapa atrasada; a listagem de etapas da obra passa a retornar a etapa adiantada imediatamente após a etapa atrasada.
- **Garantias em caso de falha:** Se a obra, a etapa atrasada ou a etapa adiantada não existirem, nenhuma posição ou hierarquia é modificada no banco de dados.

## UC-OBR-005-C01 — Fluxo Principal

1. A partir das sugestões de adiantamento apresentadas na análise de atraso (`UC-OBR-004`), o gestor escolhe uma etapa clicando em **"Adiantar esta Etapa"**.
2. O sistema localiza na EAP da obra o item correspondente à etapa atrasada e o item correspondente à etapa adiantada.
3. O sistema calcula a nova posição fracionária entre a posição da etapa atrasada e a etapa imediatamente subsequente na ordenação atual e atualiza o nó pai e a macroetapa da etapa adiantada aplicando [RN-OBR-005 — Posicionamento Fracionário na Reordenação da Trilha](../../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha).
4. O sistema persiste a alteração na obra e retorna a lista atualizada de etapas ordenada pela nova posição.
5. Na interface web, o modal é fechado e a trilha apresenta a etapa adiantada logo após a etapa atrasada, destacada pelo selo de adiantamento.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-005-C02` | Passo 3 | A etapa atrasada é a última etapa da lista ordenada (ou a etapa adiantada já ocupava a posição imediatamente seguinte à atrasada) | O sistema utiliza a posição da etapa seguinte disponível ou soma `1000.0` à posição da etapa atrasada para calcular o ponto médio | Etapa adiantada permanece posicionada logo após a etapa atrasada | Continua no passo 4 | [RN-OBR-005](../../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha) | Sem teste unitário isolado específico para o caso em que a etapa atrasada é a última da lista |
| `UC-OBR-005-C03` | Passo 2 | O identificador da obra, da etapa atrasada ou da etapa adiantada não existe na obra | O sistema interrompe a operação e retorna erro de recurso não encontrado (HTTP 404) | Nenhuma alteração de posição é persistida | Encerra | [RN-OBR-005](../../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha) | Sem teste unitário dedicado exclusivamente para IDs inexistentes na reordenação |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-003 — Elegibilidade e Priorização de Etapas para Adiantamento](../../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento)
  - [RN-OBR-005 — Posicionamento Fracionário na Reordenação da Trilha](../../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **ADRs Relacionados:** [ADR-004 — Modelagem de Grafo de Dependências Construtivas (DAG) e Reordenação Fracionária](../../../technical/adr/ADR-004-modelagem-grafo-dependencias-eap.md)
- **Casos Relacionados:** [UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra](../UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-004 — Analisar Atraso e Gerar Sugestões de Adiantamento](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)

## 7. Limitações Conhecidas

- O método `ObraService.reordenarEtapaLogoApos()` não revalida se a `etapaAdiantadaId` enviada na requisição está bloqueada, já iniciada ou se depende da etapa atrasada; essa filtragem ocorre apenas no passo anterior (`SugestaoAdiantamentoService.analisarAtraso()` em `UC-OBR-004`). Uma chamada direta a `POST /api/obras/{id}/reordenar-etapa` pode reordenar qualquer etapa existente na obra.
- O selo visual `"Adiantada via IA para compensar atraso"` na `TimelinePage` é mantido em estado local do componente (`adiantadas` state em `web/src/pages/TimelinePage.tsx`), não sendo um campo persistido na tabela `etapa_obra` ou `item_eap` (embora a nova `posicao` e `macroetapa` sejam persistidas no banco).
