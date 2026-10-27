# UC-CAT-001 — Gerenciar Catálogo de Insumos

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O engenheiro ou orçamentista cadastra, consulta, lista, atualiza (integral ou parcialmente) e remove insumos básicos (materiais, mão de obra ou equipamentos) no catálogo orçamentário, garantindo unicidade de código e preço unitário positivo.
- **Início:** Envio de requisição aos endpoints de insumos (`/api/insumos`).
- **Término:** O insumo é criado, consultado, listado, atualizado ou removido do catálogo.
- **Escopo incluído:** Operações CRUD de `Insumo` com validação de código único (`RN-CAT-001`), descrição, unidade de medida (`UnidadeMedida`) e preço unitário positivo com até 2 casas decimais.
- **Fora do escopo (Limites):** Associação ou remoção de insumos dentro de composições de custos (tratada em [UC-CAT-002](../UC-CAT-002-gerenciar-composicoes/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Orçamentista ou Operador / Script CLI.
- **Gatilho:** Chamada HTTP aos endpoints `/api/insumos`.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** Para criação, o código do insumo não deve existir previamente no catálogo; para consulta, atualização ou remoção, o insumo deve existir no banco de dados.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** O registro de `Insumo` é persistido nas tabelas `item_composicao` e `insumo` (herança `JOINED`), retornado ou removido conforme a operação solicitada.
- **Garantias em caso de falha:** Códigos duplicados, preços menores ou iguais a zero, unidades inválidas ou identificadores inexistentes interrompem a transação sem persistir alterações.

## UC-CAT-001-C01 — Fluxo Principal

1. O iniciador solicita o cadastro de um insumo informando código (até 20 caracteres), descrição (até 100 caracteres), unidade de medida e preço unitário positivo.
2. O sistema valida os campos de entrada e verifica que ainda não existe insumo cadastrado com o mesmo código aplicando [RN-CAT-001 — Unicidade de Código de Insumo e Composição](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao).
3. O sistema persiste o insumo e retorna os dados criados (`201 Created`).
4. O iniciador pode consultar o insumo pelo identificador, listar todos os insumos cadastrados, atualizar todos os campos (`PUT`), atualizar campos parciais (`PATCH`) ou remover o insumo (`DELETE`).

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-CAT-001-C02` | Passo 2 | Já existe um insumo cadastrado com o mesmo `codigo` | O sistema recusa o cadastro com erro de conflito (HTTP 409) informando `"Insumo com esse código já existe."` | Nenhum registro duplicado é criado | Encerra | [RN-CAT-001](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao) | Sem teste unitário dedicado exclusivamente para `InsumoService` |
| `UC-CAT-001-C03` | Passo 2 | Código ou descrição em branco/acima do limite, unidade ausente ou preço menor ou igual a zero | O sistema rejeita a requisição com erro de validação (HTTP 400) detalhando os campos inválidos | Nenhuma alteração no banco | Encerra | [RN-CAT-001](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao) | Sem teste automatizado dedicado exclusivamente para `InsumoRequest` |
| `UC-CAT-001-C04` | Passo 4 | O identificador informado para consulta, atualização ou exclusão não existe | O sistema retorna erro de recurso não encontrado (HTTP 404) | Nenhuma alteração no banco | Encerra | — | Sem teste automatizado dedicado exclusivamente para `InsumoService` |

## 6. Referências

- **Regras de Negócio:**
  - [RN-CAT-001 — Unicidade de Código de Insumo e Composição](../../../domain/catalogo/rules.md#rn-cat-001--unicidade-de-codigo-de-insumo-e-composicao)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **Casos Relacionados:** [UC-CAT-002 — Gerenciar Composições de Custos e Seus Itens](../UC-CAT-002-gerenciar-composicoes/README.md)

## 7. Limitações Conhecidas

- Em `InsumoService.consultar()`, `deletar()` e `findInsumo()`, a mensagem da exceção `EntityNotFoundException` contém o texto `"Empresa com ID %s não foi encontrada"` em vez de `"Insumo com ID %s não foi encontrado"`.
- Em `InsumoController.criar()`, o cabeçalho `Location` da resposta `201 Created` é montado com `/api/Insumos/{id}` (com `I` maiúsculo), divergindo do mapeamento `/api/insumos`.
