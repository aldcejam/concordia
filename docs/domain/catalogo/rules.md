# Regras de Negócio — Catálogo Orçamentário (`CAT`)

## RN-CAT-001 — Unicidade de Código de Insumo e Composição

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-CAT-001](../../use-cases/catalogo/UC-CAT-001-gerenciar-insumos/README.md), [UC-CAT-002](../../use-cases/catalogo/UC-CAT-002-gerenciar-composicoes/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/insumo/InsumoService.java` (`InsumoService.criar()`), `api/src/main/java/br/com/concordia/domain/composicao/entities/ItemComposicao.java`, `api/src/main/java/br/com/concordia/infrastructure/insumo/dtos/InsumoRequest.java`, `api/src/main/java/br/com/concordia/infrastructure/composicao/dtos/ComposicaoRequest.java`

### Enunciado
Quando um insumo ou uma composição é cadastrado no catálogo orçamentário, seu `codigo` (limitado a 20 caracteres) deve ser único na tabela base `item_composicao`. No cadastro de insumo (`InsumoService.criar()`), o sistema verifica previamente `repository.existsByCodigo(input.codigo())` e recusa códigos já existentes com `ConflitoException` (HTTP `409 Conflict`).

### Exceções e Limites
- O `preco` unitário deve ser maior que zero (`@Positive`) com até 9 dígitos inteiros e 2 casas decimais (`@Digits(integer = 9, fraction = 2)`).
- A `unidade` deve pertencer ao enum `UnidadeMedida`.

### Exemplos Concretos
- **Exemplo válido:** Cadastrar insumo com `codigo = "00000370"`, `descricao = "AREIA MEDIA"`, `unidade = "M3"` e `preco = 120.50` quando o código não existe -> insumo persistido com HTTP `201 Created`.
- **Exemplo inválido / borda:** Cadastrar novo insumo com `codigo = "00000370"` já existente -> bloqueado com `ConflitoException` (`"Insumo com esse código já existe."`, HTTP `409`).

---

## RN-CAT-002 — Estrutura Composta de Composições Unitárias (Composite Pattern)

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-CAT-002](../../use-cases/catalogo/UC-CAT-002-gerenciar-composicoes/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/composicao/entities/ItemComposicao.java`, `api/src/main/java/br/com/concordia/domain/composicao/entities/Composicao.java` (`Composicao.adicionarItem()`, `Composicao.removerItem()`), `api/src/main/java/br/com/concordia/domain/composicao/ComposicaoService.java` (`ComposicaoService.adicionarItem()`, `ComposicaoService.deletarItem()`, `ComposicaoService.findItemComposicao()`)

### Enunciado
Quando um item é adicionado a uma `Composicao` (`ComposicaoService.adicionarItem()`), o sistema busca o identificador informado primeiro no repositório de `Insumo` e, caso não encontrado, no repositório de `Composicao`, permitindo que uma composição agregue tanto insumos básicos quanto subcomposições (`ItemComposicao`). Se o item já fizer parte da composição pai, a adição é idempotente e não duplica o vínculo (`Composicao.adicionarItem()`).

### Exceções e Limites
- Caso o `idItem` não exista nem como `Insumo` nem como `Composicao`, o sistema lança `EntityNotFoundException` (HTTP `404 Not Found`).
- Cada `ItemComposicao` possui uma única referência `composicaoPai` (`@ManyToOne` em `ItemComposicao`), de modo que associar um item a uma nova composição atualiza seu `composicaoPai`.

### Exemplos Concretos
- **Exemplo válido:** Vincular o insumo `Cimento CP-II` a uma composição `Argamassa traço 1:3` -> o insumo passa a ter `composicaoPai` apontando para a composição e seu UUID é retornado na lista `itens` da composição.
- **Exemplo inválido / borda:** Tentar vincular o mesmo insumo novamente à mesma composição -> a lista `itens` permanece com uma única ocorrência do UUID do insumo.
