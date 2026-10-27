# UC-OBR-006 — Configurar Dependências Construtivas entre Etapas

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O gestor consulta, cria, edita parcialmente e remove vínculos direcionados de precedência construtiva (`FI` Fim-Início, `II` Início-Início, `FF` Fim-Fim) entre etapas de uma mesma obra, com validação automática contra autodependências, duplicidades e ciclos diretos ou indiretos na EAP.
- **Início:** O gestor acessa a tela de configuração de dependências da obra (`/obras/:obraId/dependencias`) ou envia requisição aos endpoints de dependências da obra.
- **Término:** O vínculo de precedência é criado, atualizado ou removido e o estado de bloqueio das etapas na trilha é recalculado de acordo com as regras de liberação.
- **Escopo incluído:** Listagem de vínculos ordenados pela posição das etapas na EAP, criação de vínculo com validação de DAG (busca em largura para detecção de ciclo), edição parcial de tipo, defasagem em dias (`-365` a `365`) e obrigatoriedade, exclusão de vínculo e exibição da matriz completa de dependências da obra.
- **Fora do escopo (Limites):** Registro de medições para satisfazer predecessoras (tratado em [UC-OBR-003](../UC-OBR-003-registrar-medicao-etapa/README.md)) e geração automática de dependências durante a importação da planilha Excel (não realizada em [UC-OBR-001](../UC-OBR-001-importar-planilha-orcamentaria/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras.
- **Gatilho:** Seleção de uma etapa na tela `/obras/:obraId/dependencias` para adicionar, alterar ou excluir predecessoras/sucessoras, ou chamada REST em `/api/obras/{id}/dependencias`.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** A obra deve existir e as etapas referenciadas como predecessora e sucessora devem pertencer à EAP dessa mesma obra.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** O vínculo `DependenciaEtapa` é persistido, atualizado ou excluído na tabela `dependencia_etapa`; cada etapa sucessora passa a ter seu campo `bloqueada` e suas listas `predecessoras`/`sucessoras` atualizados imediatamente de acordo com [RN-OBR-002](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia).
- **Garantias em caso de falha:** Qualquer tentativa de criar autodependência, vínculo duplicado, desfasamento fora do intervalo `[-365, 365]` ou ciclo na EAP é rejeitada antes da gravação, mantendo o grafo da obra íntegro e acíclico.

## UC-OBR-006-C01 — Fluxo Principal

1. O gestor acessa a tela de dependências da obra e seleciona no navegador lateral a etapa que deseja configurar (etapa sucessora).
2. O gestor pesquisa e seleciona a etapa predecessora, escolhe o tipo de vínculo (`FI`, `II` ou `FF`), informa o desfasamento em dias (`-365` a `365`) e define se o vínculo é obrigatório, acionando **"Vincular predecessora"**.
3. O sistema verifica que ambas as etapas pertencem à obra, que são etapas distintas, que o vínculo ainda não existe e que a nova aresta não forma ciclo no grafo da EAP aplicando [RN-OBR-004 — Integridade Acíclica e Unicidade do Grafo de Dependências](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias).
4. O sistema persiste a dependência construtiva e avalia se o vínculo já está satisfeito segundo [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia).
5. A interface exibe confirmação do vínculo salvo, atualiza o indicador de bloqueio da etapa selecionada e acrescenta a relação na matriz de dependências da obra.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-006-C02` | Passo 1 | O gestor altera o tipo, o desfasamento ou a obrigatoriedade de um vínculo existente ou aciona sua remoção | O sistema atualiza parcialmente (`PATCH`) ou remove (`DELETE`) a dependência e recalcula o estado de bloqueio da etapa sucessora | Vínculo atualizado ou removido com sucesso | Continua no passo 5 | [RN-OBR-002](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia), [RN-OBR-004](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`atualizaERemoveVinculo`, `vinculoNaoObrigatorioNaoBloqueia`), `web/src/tests/Dependencias.component.test.tsx` |
| `UC-OBR-006-C03` | Passo 3 | A adição do vínculo formaria um ciclo direto ou indireto na EAP (ex.: `4.1 → 2.1 → 3.1 → 4.1`) | O sistema recusa a operação com erro de conflito (HTTP 409) informando o caminho completo do ciclo detectado e exibe o alerta `"Vínculo não salvo"` na tela | O grafo permanece acíclico sem o vínculo inválido | Retoma no passo 2 | [RN-OBR-004](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/GrafoDependenciasTest.java` (`detectaCicloIndiretoEDevolveOCaminho`, `detectaCicloDireto`), `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`recusaCicloInformandoOCaminho`), `web/tests/e2e/dependencias.spec.ts` (`UC06 (passo 3): recusa vínculo que criaria ciclo e exibe o caminho`) |
| `UC-OBR-006-C04` | Passo 3 | Já existe um vínculo cadastrado com a mesma predecessora e a mesma sucessora na obra | O sistema recusa a operação com erro de conflito (HTTP 409) informando que o vínculo já existe | Nenhum registro duplicado é criado | Encerra | [RN-OBR-004](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`recusaVinculoDuplicadoEAutoDependencia`) |
| `UC-OBR-006-C05` | Passo 3 | A etapa predecessora é igual à sucessora (autodependência) ou o desfasamento está fora de `[-365, 365]` | O sistema rejeita a requisição com erro de validação (HTTP 400) | Nenhum vínculo é persistido | Encerra | [RN-OBR-004](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`recusaVinculoDuplicadoEAutoDependencia`, `recusaDesfasamentoForaDoLimite`) |
| `UC-OBR-006-C06` | Passo 3 | A obra informada não existe ou alguma das etapas informadas não pertence à obra | O sistema rejeita a operação com erro de recurso não encontrado (HTTP 404) | Nenhum vínculo é persistido | Encerra | [RN-OBR-004](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias) | `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`recusaEtapaDeOutraObra`) |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência](../../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia)
  - [RN-OBR-004 — Integridade Acíclica e Unicidade do Grafo de Dependências](../../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **ADRs Relacionados:** [ADR-004 — Modelagem de Grafo de Dependências Construtivas (DAG) e Reordenação Fracionária](../../../technical/adr/ADR-004-modelagem-grafo-dependencias-eap.md)
- **Casos Relacionados:** [UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra](../UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-003 — Registrar Medição e Apontar Atraso em Etapa](../UC-OBR-003-registrar-medicao-etapa/README.md), [UC-OBR-004 — Analisar Atraso e Gerar Sugestões de Adiantamento](../UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)

## 7. Limitações Conhecidas

- O campo `desfasamentoDias` (`-365` a `365`) é armazenado e exibido na interface, mas ainda não altera o cálculo de `RegraLiberacao.satisfeita()`, que avalia exclusivamente o `percentualAtual` da predecessora (`>= 100%` para `FI`, `> 0%` para `II` e `true` para `FF`).
