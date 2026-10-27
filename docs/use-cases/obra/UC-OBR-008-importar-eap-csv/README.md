# UC-OBR-008 — Importar Estrutura da EAP via Arquivo CSV

- **Documentos do Caso:** [Regras de Negócio Locais](./business-rules.md) · [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** A estrutura hierárquica da EAP (`ItemEap`) de uma obra existente e ainda sem EAP é populada a partir de um arquivo CSV separado por ponto e vírgula (`;`), retornando o total de itens criados.
- **Início:** O gestor envia um arquivo CSV para o endpoint de importação CSV de uma obra existente (`POST /api/obras/{id}/importar`).
- **Término:** Os nós da EAP são persistidos na obra respeitando a relação `pai → filhos` definida pela numeração hierárquica da coluna `item` e o sistema retorna o resumo com a quantidade de itens criados.
- **Escopo incluído:** Validação do cabeçalho CSV (`item;codigo;descricao;unidade;quantidade`), suporte a BOM UTF-8, campos entre aspas e decimais no padrão brasileiro, verificação de que a obra ainda não possui EAP, verificação de precedência Pai → Filho e unicidade do código `item`.
- **Fora do escopo (Limites):** Importação de planilhas Excel completas criando nova obra e etapas executáveis na trilha (tratada em [UC-OBR-001](../UC-OBR-001-importar-planilha-orcamentaria/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras.
- **Gatilho:** Envio de arquivo CSV (`multipart/form-data`, campo `arquivo`) para `POST /api/obras/{id}/importar`.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** A obra informada (`{id}`) deve existir no sistema e sua lista de itens da EAP (`obra.getEap()`) deve estar vazia.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** Os registros de `ItemEap` são criados na obra com posições espaçadas em múltiplos de `1000.0` e hierarquia pai/filho populada; a resposta HTTP `200 OK` informa o `idObra` e o número de `itensEapCriados`.
- **Garantias em caso de falha:** Se a obra já possuir EAP cadastrada, se o cabeçalho ou alguma linha do CSV for inválida, se houver item duplicado ou item filho declarado antes do pai, toda a transação sofre rollback e nenhum item é persistido na obra.

## UC-OBR-008-C01 — Fluxo Principal

1. O gestor envia um arquivo CSV codificado em UTF-8 e separado por ponto e vírgula para uma obra existente sem EAP (como o arquivo de referência `docs/exemplo_importacao_obra.csv`).
2. O sistema valida o cabeçalho e converte as linhas úteis aplicando [RN-OBR-008-01 — Formato CSV, Precedência Hierárquica e EAP Vazia](./business-rules.md#rn-obr-008-01--formato-csv-precedencia-hierarquica-e-eap-vazia).
3. O sistema verifica que a obra existe e que ainda não possui itens na EAP.
4. Para cada linha, o sistema valida que o código `item` não está duplicado, localiza o item pai previamente declarado (quando o código possui níveis separados por ponto) e adiciona o `ItemEap` à obra.
5. O sistema salva a obra e retorna o identificador da obra e o total de itens da EAP criados (`200 OK`).

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-008-C02` | Passo 3 | A obra informada já possui ao menos um item cadastrado na EAP | O sistema recusa a importação com erro de conflito (HTTP 409) informando que a obra já possui uma EAP cadastrada | A EAP existente permanece inalterada | Encerra | [RN-OBR-008-01](./business-rules.md#rn-obr-008-01--formato-csv-precedencia-hierarquica-e-eap-vazia) | `api/src/test/java/br/com/concordia/domain/obra/ImportacaoObraServiceTest.java` (`rejeitaObraQueJaPossuiEap`) |
| `UC-OBR-008-C03` | Passo 2 / Passo 4 | O arquivo CSV está vazio, possui cabeçalho ou número de colunas inválido, quantidade mal formatada, item com código sem unidade/quantidade, item duplicado ou item filho antes do item pai | O sistema rejeita a operação com erro de validação (HTTP 400) indicando a linha e o motivo exato da falha | Nenhum item é adicionado à EAP da obra | Encerra | [RN-OBR-008-01](./business-rules.md#rn-obr-008-01--formato-csv-precedencia-hierarquica-e-eap-vazia) | `api/src/test/java/br/com/concordia/infrastructure/obra/csv/ObraCsvParserTest.java`, `api/src/test/java/br/com/concordia/domain/obra/ImportacaoObraServiceTest.java` (`rejeitaItemSemPaiAnterior`, `rejeitaItemDuplicado`) |
| `UC-OBR-008-C04` | Passo 3 | O identificador da obra não existe no banco de dados | O sistema rejeita a operação com erro de recurso não encontrado (HTTP 404) | Nenhuma alteração no banco | Encerra | — | `api/src/test/java/br/com/concordia/domain/obra/ImportacaoObraServiceTest.java` (`rejeitaObraInexistente`) |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-008-01 — Formato CSV, Precedência Hierárquica e EAP Vazia](./business-rules.md#rn-obr-008-01--formato-csv-precedencia-hierarquica-e-eap-vazia)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **Casos Relacionados:** [UC-OBR-001 — Importar Planilha Orçamentária Excel](../UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-007 — Gerenciar Cadastro de Obras e Etapas da EAP](../UC-OBR-007-gerenciar-obras-etapas/README.md)

## 7. Limitações Conhecidas

- Em `ImportacaoObraService.importar()`, as linhas folhas que possuem `codigo` de insumo/composição criam o registro de `ItemEap`, mas possuem um `TODO` e ainda não instanciam `EtapaObra` nem `ItemOrcamento`. Por consequência, itens importados apenas via CSV (`POST /api/obras/{id}/importar`) não possuem `EtapaObra` associada e não aparecem na listagem de etapas da trilha (`GET /api/obras/{id}/etapas`). Para gerar a trilha completa a partir de planilha, deve-se utilizar a importação Excel de [UC-OBR-001](../UC-OBR-001-importar-planilha-orcamentaria/README.md).
