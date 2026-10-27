# UC-CAT-002 — Gerenciar Composições de Custos e Seus Itens

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O engenheiro, orçamentista ou script de automação cria, consulta, lista, atualiza (integral ou parcialmente) e exclui composições de custos unitários, além de vincular ou desvincular insumos e subcomposições na estrutura composta de cada composição.
- **Início:** Envio de requisição aos endpoints de composições (`/api/composicoes` ou `/api/composicoes/{idComposicao}/itens`).
- **Término:** A composição ou sua lista de itens filhos é criada, atualizada, consultada ou removida.
- **Escopo incluído:** CRUD de `Composicao` e adição/remoção de elementos filhos (`ItemComposicao` — tanto `Insumo` quanto subcomposição `Composicao`) na coleção de itens da composição pai (`RN-CAT-002`).
- **Fora do escopo (Limites):** Gestão isolada do cadastro de insumos básicos (tratada em [UC-CAT-001](../UC-CAT-001-gerenciar-insumos/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Orçamentista ou Operador / Script CLI (`api/scripts/importar-orcamento-xlsx.py`).
- **Gatilho:** Chamada HTTP aos endpoints `/api/composicoes`.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** Para vincular ou desvincular um item em uma composição, tanto a composição pai (`idComposicao`) quanto o item filho (`idItem`, seja insumo ou composição) devem existir previamente no banco de dados.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** A composição é criada, atualizada ou removida; ao adicionar um item filho, o registro `ItemComposicao` passa a referenciar a composição pai e seu UUID passa a constar na lista `itens` retornada em `ComposicaoResponse`; ao remover o item filho, o vínculo `composicaoPai` é desfeito.
- **Garantias em caso de falha:** Caso a composição pai ou o item filho não existam, ou caso os dados da requisição sejam inválidos, a operação falha sem alterações parciais.

## UC-CAT-002-C01 — Fluxo Principal

1. O iniciador solicita a criação de uma composição informando código (até 20 caracteres), descrição (até 100 caracteres), unidade de medida e preço unitário positivo.
2. O sistema valida os atributos conforme [RN-CAT-001 — Unicidade de Código de Insumo e Composição](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao), persiste a composição e retorna os dados criados (`201 Created`).
3. O iniciador solicita a inclusão de um item na composição (`POST /api/composicoes/{idComposicao}/itens`) informando o identificador do insumo ou da subcomposição (`idItem`).
4. O sistema localiza a composição pai e busca o item filho nos repositórios de insumos e composições aplicando [RN-CAT-002 — Estrutura Composta de Composições Unitárias (Composite Pattern)](../../../domain/catalogo/rules.md#rn-cat-002--estrutura-composta-de-composicoes-unitarias-composite-pattern), associa o item à composição e retorna a composição atualizada (`200 OK`).
5. O iniciador pode consultar ou listar composições, atualizar seus atributos (`PUT` / `PATCH`), desvincular um item filho (`DELETE /api/composicoes/{idComposicao}/itens`) ou excluir a composição (`DELETE /api/composicoes/{id}`).

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-CAT-002-C02` | Passo 4 | O item informado já pertence à lista de itens da composição pai | O sistema ignora a duplicação de forma idempotente e retorna a composição sem duplicar o identificador na lista `itens` | Vínculo único preservado | Continua no passo 5 | [RN-CAT-002](../../../domain/catalogo/rules.md#rn-cat-002--estrutura-composta-de-composicoes-unitarias-composite-pattern) | Sem teste unitário dedicado exclusivamente para `Composicao.adicionarItem` |
| `UC-CAT-002-C03` | Passo 3 / Passo 4 / Passo 5 | O identificador da composição pai ou do item filho (insumo/subcomposição) não existe no banco de dados | O sistema interrompe a operação e retorna erro de recurso não encontrado (HTTP 404) | Nenhuma alteração persistida | Encerra | [RN-CAT-002](../../../domain/catalogo/rules.md#rn-cat-002--estrutura-composta-de-composicoes-unitarias-composite-pattern) | Sem teste unitário dedicado exclusivamente para `ComposicaoService` |
| `UC-CAT-002-C04` | Passo 1 | Campos obrigatórios em branco, tamanho excedido ou preço menor ou igual a zero | O sistema rejeita a requisição com erro de validação (HTTP 400) | Nenhuma composição criada | Encerra | [RN-CAT-001](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao) | Sem teste automatizado dedicado exclusivamente para `ComposicaoRequest` |

## 6. Referências

- **Regras de Negócio:**
  - [RN-CAT-001 — Unicidade de Código de Insumo e Composição](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao)
  - [RN-CAT-002 — Estrutura Composta de Composições Unitárias (Composite Pattern)](../../../domain/catalogo/rules.md#rn-cat-002--estrutura-composta-de-composicoes-unitarias-composite-pattern)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **Procedimentos Operacionais:** [Runbook de Importação Analítica via CLI](../../../operations/importacao-orcamento-analitico-cli.md)
- **Casos Relacionados:** [UC-CAT-001 — Gerenciar Catálogo de Insumos](../UC-CAT-001-gerenciar-insumos/README.md)

## 7. Limitações Conhecidas

- Diferentemente de `InsumoService.criar()`, o método `ComposicaoService.criar()` não verifica previamente `existsByCodigo` antes do `save`, delegando eventual violação de unicidade de `codigo` à constraint da tabela `item_composicao`.
- A descrição na classe `Composicao` / `ItemComposicao` e no DTO `ComposicaoRequest` é limitada a `@Size(max = 100)`, razão pela qual o script `api/scripts/importar-orcamento-xlsx.py` trunca descrições longas do SINAPI em 100 caracteres antes de enviá-las à API.
